-- Enable TimescaleDB extension for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Agent Metrics Table
CREATE TABLE IF NOT EXISTS agent_metrics (
  id BIGSERIAL PRIMARY KEY,
  agent_type VARCHAR(50) NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL,
  response_time DECIMAL(10, 2) NOT NULL,
  task_completion_rate DECIMAL(5, 2) NOT NULL,
  error_rate DECIMAL(5, 2) NOT NULL,
  active_tasks INTEGER NOT NULL,
  completed_tasks INTEGER NOT NULL,
  failed_tasks INTEGER NOT NULL,
  context7_queries_count INTEGER NOT NULL,
  context7_queries_avg_time DECIMAL(10, 2) NOT NULL,
  context7_queries_success_rate DECIMAL(5, 2) NOT NULL,
  tool_usage_json JSONB NOT NULL DEFAULT '{}',
  handoffs_received INTEGER NOT NULL,
  handoffs_sent INTEGER NOT NULL,
  avg_handoff_time DECIMAL(10, 2) NOT NULL,
  performance_score DECIMAL(5, 2)
);

-- Convert agent_metrics to hypertable
SELECT create_hypertable('agent_metrics', 'timestamp', if_not_exists => TRUE);

-- Create indexes for agent_metrics
CREATE INDEX IF NOT EXISTS idx_agent_metrics_type_time ON agent_metrics (agent_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_status_time ON agent_metrics (status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_time ON agent_metrics (agent_id, timestamp DESC);

-- App Metrics Table
CREATE TABLE IF NOT EXISTS app_metrics (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  js_execution_time DECIMAL(10, 2),
  js_parsing_time DECIMAL(10, 2),
  js_compilation_time DECIMAL(10, 2),
  js_main_thread_blocking DECIMAL(10, 2),
  bundle_total_size BIGINT,
  bundle_gzipped_size BIGINT,
  bundle_chunk_count INTEGER,
  bundle_largest_chunk BIGINT,
  render_first_paint DECIMAL(10, 2),
  render_dom_content_loaded DECIMAL(10, 2),
  render_load_complete DECIMAL(10, 2),
  render_fps DECIMAL(5, 2),
  mem_used BIGINT,
  mem_limit BIGINT,
  mem_js_heap_size BIGINT
);

-- Convert app_metrics to hypertable
SELECT create_hypertable('app_metrics', 'timestamp', if_not_exists => TRUE);

-- Create indexes for app_metrics
CREATE INDEX IF NOT EXISTS idx_app_metrics_session_time ON app_metrics (session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_app_metrics_url_time ON app_metrics (url, timestamp DESC);

-- Core Web Vitals Table
CREATE TABLE IF NOT EXISTS core_web_vitals (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  url TEXT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  lcp DECIMAL(10, 2),
  fid DECIMAL(10, 2),
  cls DECIMAL(10, 2),
  fcp DECIMAL(10, 2),
  tti DECIMAL(10, 2),
  performance_score DECIMAL(5, 2),
  device_type VARCHAR(50),
  connection_type VARCHAR(50)
);

-- Convert core_web_vitals to hypertable
SELECT create_hypertable('core_web_vitals', 'timestamp', if_not_exists => TRUE);

-- Create indexes for core_web_vitals
CREATE INDEX IF NOT EXISTS idx_cwv_session_time ON core_web_vitals (session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cwv_url_time ON core_web_vitals (url, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cwv_score_time ON core_web_vitals (performance_score, timestamp DESC);

-- Agent Tool Usage Table
CREATE TABLE IF NOT EXISTS agent_tool_usage (
  id BIGSERIAL PRIMARY KEY,
  agent_type VARCHAR(50) NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tool_name VARCHAR(100) NOT NULL,
  count INTEGER NOT NULL,
  execution_time DECIMAL(10, 2),
  success_count INTEGER NOT NULL,
  failure_count INTEGER NOT NULL
);

-- Convert agent_tool_usage to hypertable
SELECT create_hypertable('agent_tool_usage', 'timestamp', if_not_exists => TRUE);

-- Create indexes for agent_tool_usage
CREATE INDEX IF NOT EXISTS idx_tool_usage_agent_time ON agent_tool_usage (agent_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_time ON agent_tool_usage (tool_name, timestamp DESC);

-- Agent Tasks Table
CREATE TABLE IF NOT EXISTS agent_tasks (
  id VARCHAR(255) PRIMARY KEY,
  agent_type VARCHAR(50) NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create indexes for agent_tasks
CREATE INDEX IF NOT EXISTS idx_tasks_agent_time ON agent_tasks (agent_type, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_time ON agent_tasks (status, start_time DESC);

-- Context7 Queries Table
CREATE TABLE IF NOT EXISTS context7_queries (
  id VARCHAR(255) PRIMARY KEY,
  agent_type VARCHAR(50) NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  library VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  response_time DECIMAL(10, 2) NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  tokens_returned INTEGER,
  library_id VARCHAR(255)
);

-- Convert context7_queries to hypertable
SELECT create_hypertable('context7_queries', 'timestamp', if_not_exists => TRUE);

-- Create indexes for context7_queries
CREATE INDEX IF NOT EXISTS idx_context7_agent_time ON context7_queries (agent_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_context7_library_time ON context7_queries (library, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_context7_success_time ON context7_queries (success, timestamp DESC);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  agent_type VARCHAR(50),
  metric_type VARCHAR(50) NOT NULL,
  current_value DECIMAL(20, 2),
  threshold DECIMAL(20, 2),
  metadata JSONB NOT NULL DEFAULT '{}',
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMPTZ
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_type_time ON alerts (type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_time ON alerts (severity, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status_time ON alerts (resolved, timestamp DESC);

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS alert_rules (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  metric_type VARCHAR(50) NOT NULL,
  agent_type VARCHAR(50),
  condition VARCHAR(20) NOT NULL,
  threshold DECIMAL(20, 2) NOT NULL,
  duration INTEGER NOT NULL,
  severity VARCHAR(20) NOT NULL,
  notification_channels JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for alert_rules
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules (enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_metric ON alert_rules (metric_type);

-- Performance History Table (for regression detection)
CREATE TABLE IF NOT EXISTS performance_history (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_type VARCHAR(50) NOT NULL,
  agent_type VARCHAR(50),
  metric_value DECIMAL(20, 2) NOT NULL,
  baseline_value DECIMAL(20, 2),
  regression_detected BOOLEAN NOT NULL DEFAULT FALSE,
  regression_percentage DECIMAL(5, 2)
);

-- Convert performance_history to hypertable
SELECT create_hypertable('performance_history', 'timestamp', if_not_exists => TRUE);

-- Create indexes for performance_history
CREATE INDEX IF NOT EXISTS idx_perf_history_metric_time ON performance_history (metric_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_history_agent_time ON performance_history (agent_type, timestamp DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW v_agent_summary AS
SELECT
  agent_type,
  MAX(timestamp) as last_seen,
  AVG(response_time) as avg_response_time,
  AVG(task_completion_rate) as avg_completion_rate,
  AVG(error_rate) as avg_error_rate,
  COUNT(*) as metric_count
FROM agent_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY agent_type;

CREATE OR REPLACE VIEW v_core_web_vitals_summary AS
SELECT
  url,
  AVG(lcp) as avg_lcp,
  AVG(fid) as avg_fid,
  AVG(cls) as avg_cls,
  AVG(fcp) as avg_fcp,
  AVG(tti) as avg_tti,
  AVG(performance_score) as avg_performance_score,
  COUNT(*) as page_view_count
FROM core_web_vitals
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY url;

-- Create data retention policy (keep 90 days of data)
SELECT add_retention_policy('agent_metrics', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('app_metrics', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('core_web_vitals', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('agent_tool_usage', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('context7_queries', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('performance_history', INTERVAL '90 days', if_not_exists => TRUE);

-- Create continuous aggregate for hourly averages
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', timestamp) as bucket,
  agent_type,
  AVG(response_time) as avg_response_time,
  AVG(task_completion_rate) as avg_completion_rate,
  AVG(error_rate) as avg_error_rate,
  COUNT(*) as metric_count
FROM agent_metrics
GROUP BY bucket, agent_type;

CREATE MATERIALIZED VIEW IF NOT EXISTS core_web_vitals_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', timestamp) as bucket,
  url,
  AVG(lcp) as avg_lcp,
  AVG(fid) as avg_fid,
  AVG(cls) as avg_cls,
  AVG(performance_score) as avg_performance_score,
  COUNT(*) as page_view_count
FROM core_web_vitals
GROUP BY bucket, url;

-- Enable continuous aggregation refresh policies
SELECT add_continuous_aggregate_policy('agent_metrics_hourly',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '0 minutes',
  schedule_interval => INTERVAL '10 minutes',
  if_not_exists => TRUE
);

SELECT add_continuous_aggregate_policy('core_web_vitals_hourly',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '0 minutes',
  schedule_interval => INTERVAL '10 minutes',
  if_not_exists => TRUE
);

-- Grant permissions (adjust user as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO frontend_design_monitoring_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO frontend_design_monitoring_user;
