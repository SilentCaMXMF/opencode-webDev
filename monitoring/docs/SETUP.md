# Setup Guide

This guide will help you set up and deploy the Frontend Design Performance Monitoring System.

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ (with TimescaleDB extension)
- Docker (optional, for containerized deployment)
- 4GB+ RAM available

## Quick Start

### 1. Clone and Install

```bash
cd /home/pedroocalado/githubPages/.opencode/monitoring
npm install
```

### 2. Set Up Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose -f docker-compose.yml up -d postgres
```

**Option B: Manual PostgreSQL Setup**

```bash
# Install PostgreSQL 14 with TimescaleDB
# Ubuntu/Debian:
sudo apt-get install postgresql-14-timescaledb

# macOS:
brew install timescaledb

# Start PostgreSQL
sudo service postgresql start

# Create database
createdb frontend_design_monitoring
psql -d frontend_design_monitoring -f database/schema.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the monitoring directory:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=frontend_design_monitoring
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Metrics Collector
METRICS_COLLECTOR_URL=http://localhost:3000

# Email Notifications (Optional)
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=true
EMAIL_SMTP_USER=noreply@example.com
EMAIL_SMTP_PASSWORD=your_email_password
EMAIL_TO=team@example.com
EMAIL_FROM=monitoring@example.com

# Slack Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# CORS Settings (for dashboard)
ALLOWED_ORIGINS=http://localhost:3001
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

### 5. Seed Sample Data (Optional)

```bash
npm run db:seed
```

### 6. Start the Services

**Terminal 1 - Metrics Collector:**

```bash
npm run collector:start
```

**Terminal 2 - Dashboard:**

```bash
cd dashboard
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3001`

## Docker Deployment

### Complete Stack with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual Service Containers

**Metrics Collector:**

```bash
docker build -t monitoring-collector .
docker run -d \
  --name monitoring-collector \
  -p 3000:3000 \
  --env-file .env \
  --network monitoring-network \
  monitoring-collector
```

**Dashboard:**

```bash
cd dashboard
docker build -t monitoring-dashboard .
docker run -d \
  --name monitoring-dashboard \
  -p 3001:3000 \
  --env-file ../.env \
  monitoring-dashboard
```

## Production Deployment

### Using Systemd (Linux)

Create `/etc/systemd/system/monitoring-collector.service`:

```ini
[Unit]
Description=Metrics Collector Service
After=network.target postgresql.service

[Service]
Type=simple
User=monitoring
WorkingDirectory=/opt/monitoring
ExecStart=/usr/bin/node collector/dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/monitoring/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable monitoring-collector
sudo systemctl start monitoring-collector
sudo systemctl status monitoring-collector
```

### Using PM2

```bash
npm install -g pm2

# Start collector
pm2 start collector/src/index.ts --name metrics-collector --interpreter ts-node

# Start dashboard
cd dashboard
pm2 start npm --name monitoring-dashboard -- start

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Kubernetes

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: monitoring-collector
spec:
  replicas: 2
  selector:
    matchLabels:
      app: monitoring-collector
  template:
    metadata:
      labels:
        app: monitoring-collector
    spec:
      containers:
      - name: collector
        image: monitoring-collector:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: monitoring-config
              key: db-host
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: monitoring-collector
spec:
  selector:
    app: monitoring-collector
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s/
```

## Verification

### Check Database Connection

```bash
PGPASSWORD=your_password psql -h localhost -U postgres -d frontend_design_monitoring -c "SELECT COUNT(*) FROM agent_metrics;"
```

### Check Collector Health

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-03T12:00:00.000Z"
}
```

### Check Dashboard Access

Open `http://localhost:3001` in your browser. You should see:
- System health overview
- All 11 agents with their status
- Recent alerts (if any)
- Real-time updates (if agents are sending metrics)

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check TimescaleDB is installed
psql -d postgres -c "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';"

# Check database exists
psql -l | grep frontend_design_monitoring
```

### Collector Won't Start

```bash
# Check if port is in use
lsof -i :3000

# Check logs
npm run collector:start 2>&1 | head -50

# Verify environment variables are set
cat .env | grep DB_
```

### Dashboard Shows No Data

```bash
# Check collector is receiving metrics
curl http://localhost:3000/api/v1/metrics

# Check WebSocket connection
# Open browser console and look for WebSocket connection errors

# Verify agent metrics are being sent
# Check agent logs for "Failed to send metrics" errors
```

### Performance Issues

```bash
# Check database query performance
psql -d frontend_design_monitoring -c "EXPLAIN ANALYZE SELECT * FROM agent_metrics ORDER BY timestamp DESC LIMIT 100;"

# Check database size
psql -d frontend_design_monitoring -c "SELECT pg_size_pretty(pg_database_size('frontend_design_monitoring'));"

# Check TimescaleDB retention policy
psql -d frontend_design_monitoring -c "SELECT * FROM timescaledb_information.jobs;"
```

## Next Steps

1. **Integrate Agents**: Follow the [Integration Guide](./INTEGRATION.md) to add monitoring to your agents
2. **Configure Alerts**: Set up alert rules for your specific needs
3. **Customize Dashboard**: Modify the dashboard to show metrics relevant to your use case
4. **Set Up Notifications**: Configure email or Slack alerts for important events
5. **Configure Retention**: Adjust data retention policies based on your requirements

## Security Considerations

1. **Change Default Passwords**: Always change the default PostgreSQL password
2. **Use SSL/TLS**: Enable SSL for database connections in production
3. **Restrict Access**: Use firewall rules to restrict access to the collector
4. **Environment Variables**: Never commit `.env` files to version control
5. **Regular Backups**: Set up automated database backups

## Maintenance

### Database Maintenance

```bash
# Backup database
pg_dump -h localhost -U postgres frontend_design_monitoring > backup.sql

# Restore database
psql -h localhost -U postgres frontend_design_monitoring < backup.sql

# Vacuum database (improves performance)
psql -d frontend_design_monitoring -c "VACUUM ANALYZE;"
```

### Log Rotation

Configure logrotate for the monitoring service:

```
/opt/monitoring/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 monitoring monitoring
    sharedscripts
}
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Install updated dependencies
npm install

# Run migrations
npm run db:migrate

# Restart services
pm2 restart all
```
