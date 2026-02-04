# Monitoring System Deployment Guide

This guide provides complete deployment instructions for different environments.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Production Deployment](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)

---

## Development Setup

### Local Development

```bash
# Clone repository
cd /home/pedroocalado/githubPages/.opencode/monitoring

# Install dependencies
npm install
cd dashboard && npm install && cd ..

# Start PostgreSQL with Docker
docker-compose up -d postgres

# Wait for database to initialize (10 seconds)
sleep 10

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed

# Start metrics collector (Terminal 1)
npm run collector:start

# Start dashboard (Terminal 2)
cd dashboard
npm run dev
```

Access:
- Dashboard: http://localhost:3001
- Collector API: http://localhost:3000
- Database: localhost:5432

---

## Production Deployment

### Prerequisites

- **Server**: Ubuntu 20.04+ or similar
- **Node.js**: 18+
- **PostgreSQL**: 14+ with TimescaleDB extension
- **Nginx**: 1.18+ (optional, for reverse proxy)
- **Domain**: SSL certificate (Let's Encrypt recommended)

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 14 with TimescaleDB
sudo sh -c "echo 'deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main' > /etc/apt/sources.list.d/timescaledb.list"
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -
sudo apt update
sudo apt install -y timescaledb-2-postgresql-14

# Initialize TimescaleDB
sudo service postgresql start
sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install -y nginx
```

### Step 2: User and Directory Setup

```bash
# Create monitoring user
sudo adduser --system --group monitoring
sudo mkdir -p /opt/monitoring
sudo chown -R monitoring:monitoring /opt/monitoring

# Switch to monitoring user
sudo su - monitoring
cd /opt/monitoring

# Clone or copy monitoring system
# git clone <your-repo> .
```

### Step 3: Database Setup

```bash
# Create database
sudo -u postgres createdb frontend_design_monitoring

# Create user (use strong password)
sudo -u postgres psql
```

```sql
CREATE USER monitoring_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE frontend_design_monitoring TO monitoring_user;
ALTER DATABASE frontend_design_monitoring OWNER TO monitoring_user;
\q
```

```bash
# Run migrations
cd /opt/monitoring
npm install
npm run db:migrate

# Seed data (optional, for testing)
npm run db:seed
```

### Step 4: Environment Configuration

```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Critical settings to update:**
- `DB_PASSWORD` - Use strong password
- `DB_USER` - Use `monitoring_user`
- `DB_HOST` - Use `localhost`
- `EMAIL_SMTP_*` - Configure email notifications
- `SLACK_WEBHOOK_URL` - Configure Slack (optional)

### Step 5: Install Dependencies

```bash
cd /opt/monitoring
npm ci --production

cd dashboard
npm ci --production
npm run build
```

### Step 6: Start Services with PM2

```bash
# Start metrics collector
pm2 start collector/src/index.ts --name metrics-collector --interpreter ts-node -- --max-memory-restart 1G

# Start dashboard
pm2 start npm --name monitoring-dashboard -- start --prefix /opt/monitoring/dashboard

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 7: Configure Nginx (Optional)

Create `/etc/nginx/sites-available/monitoring`:

```nginx
upstream collector {
    server localhost:3000;
}

upstream dashboard {
    server localhost:3001;
}

server {
    listen 80;
    server_name monitoring.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monitoring.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/monitoring.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitoring.yourdomain.com/privkey.pem;

    # Dashboard
    location / {
        proxy_pass http://dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Collector API
    location /api {
        proxy_pass http://collector;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /ws {
        proxy_pass http://collector;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d monitoring.yourdomain.com
```

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - monitoring-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  collector:
    build:
      context: .
      dockerfile: Dockerfile.collector
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      EMAIL_SMTP_HOST: ${EMAIL_SMTP_HOST}
      EMAIL_SMTP_PORT: ${EMAIL_SMTP_PORT}
      EMAIL_SMTP_USER: ${EMAIL_SMTP_USER}
      EMAIL_SMTP_PASSWORD: ${EMAIL_SMTP_PASSWORD}
      EMAIL_TO: ${EMAIL_TO}
      EMAIL_FROM: ${EMAIL_FROM}
      SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - monitoring-network
    restart: always
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_COLLECTOR_URL: ${NEXT_PUBLIC_COLLECTOR_URL}
    ports:
      - "3001:3000"
    depends_on:
      collector:
        condition: service_healthy
    networks:
      - monitoring-network
    restart: always

volumes:
  postgres-data:

networks:
  monitoring-network:
    driver: bridge
```

Deploy:

```bash
# Load environment variables
export $(cat .env | xargs)

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## Kubernetes Deployment

### Namespace and ConfigMap

Create `k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
```

Create `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: monitoring-config
  namespace: monitoring
data:
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "frontend_design_monitoring"
  NODE_ENV: "production"
  PORT: "3000"
```

### Secrets

Create `k8s/secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: monitoring-secrets
  namespace: monitoring
type: Opaque
stringData:
  DB_PASSWORD: "your_secure_password"
  EMAIL_SMTP_PASSWORD: "your_email_password"
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/..."
```

### PostgreSQL Deployment

Create `k8s/postgres.yaml`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: monitoring
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: timescale/timescaledb:latest-pg14
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: monitoring-config
              key: DB_NAME
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: monitoring-secrets
              key: DB_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: monitoring
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### Collector Deployment

Create `k8s/collector.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: metrics-collector
  namespace: monitoring
spec:
  replicas: 2
  selector:
    matchLabels:
      app: metrics-collector
  template:
    metadata:
      labels:
        app: metrics-collector
    spec:
      containers:
      - name: collector
        image: monitoring-collector:latest
        imagePullPolicy: Always
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: monitoring-config
              key: DB_HOST
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: monitoring-secrets
              key: DB_PASSWORD
        - name: EMAIL_SMTP_PASSWORD
          valueFrom:
            secretKeyRef:
              name: monitoring-secrets
              key: EMAIL_SMTP_PASSWORD
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
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
  name: collector-service
  namespace: monitoring
spec:
  selector:
    app: metrics-collector
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create config and secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres.yaml

# Deploy collector
kubectl apply -f k8s/collector.yaml

# Check status
kubectl get pods -n monitoring
kubectl get services -n monitoring
```

---

## Cloud Platform Deployment

### AWS ECS Deployment

1. **Push Docker Images to ECR**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag monitoring-collector:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/monitoring-collector:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/monitoring-collector:latest
```

2. **Create ECS Task Definition**

3. **Deploy to ECS Cluster**

### Google Cloud Run Deployment

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/monitoring-collector .

# Deploy to Cloud Run
gcloud run deploy metrics-collector \
  --image gcr.io/PROJECT_ID/monitoring-collector \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=cloud-sql-ip
```

### Azure Container Instances

```bash
# Create resource group
az group create --name monitoring-rg --location eastus

# Create container instance
az container create \
  --resource-group monitoring-rg \
  --name metrics-collector \
  --image monitoring-collector:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables DB_HOST=your-db-host
```

---

## Post-Deployment Configuration

### 1. Database Backup Setup

```bash
# Create backup script
cat > /opt/monitoring/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U monitoring_user frontend_design_monitoring > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/monitoring/scripts/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/monitoring/scripts/backup.sh
```

### 2. Log Rotation

Create `/etc/logrotate.d/monitoring`:

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

### 3. Monitoring the Monitoring System

```bash
# Add PM2 monitoring
pm2 install pm2-logrotate

# Setup email alerts for PM2 issues
pm2 send pm2:setup:email <your-email>
```

### 4. Performance Tuning

PostgreSQL tuning in `/etc/postgresql/14/main/postgresql.conf`:

```ini
# Memory settings
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 256MB
maintenance_work_mem = 1GB

# Connection settings
max_connections = 200

# TimescaleDB tuning
timescaledb.max_background_workers = 4
```

### 5. SSL/TLS Configuration

Generate self-signed certificate (for testing):

```bash
mkdir -p /opt/monitoring/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/monitoring/ssl/key.pem \
  -out /opt/monitoring/ssl/cert.pem
```

Or use Let's Encrypt:

```bash
sudo certbot certonly --standalone -d monitoring.yourdomain.com
```

---

## Health Checks

```bash
# Check database
psql -h localhost -U monitoring_user -d frontend_design_monitoring -c "SELECT 1;"

# Check collector
curl http://localhost:3000/health

# Check dashboard
curl http://localhost:3001

# Check PM2 processes
pm2 status

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## Troubleshooting

### Collector Not Starting

```bash
# Check logs
pm2 logs metrics-collector

# Check database connection
PGPASSWORD=$DB_PASSWORD psql -h localhost -U monitoring_user -d frontend_design_monitoring

# Check port availability
sudo lsof -i :3000
```

### Database Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Check database size
psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('frontend_design_monitoring'));"

# Vacuum database
psql -U monitoring_user -d frontend_design_monitoring -c "VACUUM ANALYZE;"
```

### High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Restart if needed
pm2 restart metrics-collector

# Increase Node.js memory limit
pm2 start collector/src/index.ts --node-args="--max-old-space-size=2048"
```

---

## Scaling Considerations

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Tune PostgreSQL memory settings
- Increase Node.js memory limits

### Horizontal Scaling
- Deploy multiple collector instances behind load balancer
- Use read replicas for database
- Implement Redis for caching

### Database Scaling
- TimescaleDB native compression
- Data partitioning by time
- Read replicas for dashboard queries

---

## Security Checklist

- [ ] Strong database passwords
- [ ] SSL/TLS enabled
- [ ] Firewall configured (ufw/iptables)
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] API authentication (if needed)
- [ ] Environment variables secured
- [ ] Secrets not in version control

---

## Support

For issues:
- Check system logs: `pm2 logs`
- Check database logs: `/var/log/postgresql/`
- Review documentation in `/docs/`
