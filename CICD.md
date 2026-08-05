# CI/CD Pipeline Configuration

## Overview

This project includes a comprehensive CI/CD pipeline with the following features:

### 🚀 CI Pipeline (`.github/workflows/ci.yml`)
- **Automated Testing**: Runs on every push and PR
- **Code Quality Checks**: ESLint, Prettier, TypeScript validation
- **Security Scanning**: Snyk vulnerability scanning
- **Build Verification**: Multi-service Docker builds
- **Integration Testing**: Full system integration tests
- **Docker Registry**: Automated image building and pushing

### 🚀 Deploy Pipeline (`.github/workflows/deploy.yml`)
- **Environment-Specific Deployments**: Staging and Production
- **Blue-Green Deployment**: Zero-downtime deployments
- **Automated Rollback**: Failure detection and rollback
- **Health Checks**: Post-deployment verification
- **Smoke Tests**: Critical path testing

### 🚀 Security Pipeline (`.github/workflows/security.yml`)
- **Snyk Scanning**: Continuous vulnerability monitoring
- **CodeQL Analysis**: Static code analysis
- **OWASP ZAP**: Web application security testing
- **Docker Security**: Container vulnerability scanning
- **Secrets Detection**: Automated secrets scanning

### 🚀 Quality Pipeline (`.github/workflows/quality.yml`)
- **Code Formatting**: Prettier validation
- **Type Checking**: TypeScript validation
- **Complexity Analysis**: Code complexity monitoring
- **Test Coverage**: Coverage reporting
- **Performance Budget**: Bundle size monitoring

## Environment Configurations

### Staging Environment
- **File**: `docker-compose.staging.yml`
- **Database**: Separate staging database
- **URLs**: `staging.example.com`
- **Monitoring**: Full monitoring enabled

### Production Environment
- **File**: `docker-compose.prod.yml`
- **Database**: Production database with SSL
- **URLs**: `hotmart.com`
- **Monitoring**: Comprehensive monitoring with Prometheus/Grafana

## Required Secrets

Add these secrets to your GitHub repository:

### CI/CD Secrets
- `GITHUB_TOKEN`: GitHub token for registry access
- `SNYK_TOKEN`: Snyk API token for security scanning
- `EMAIL_USERNAME`: SMTP username for notifications
- `EMAIL_PASSWORD`: SMTP password for notifications
- `NOTIFICATION_EMAIL`: Email for failure notifications

### Slack Integration
- `SLACK_WEBHOOK_URL`: Slack webhook for CI/CD notifications
- `SECURITY_SLACK_WEBHOOK_URL`: Slack webhook for security alerts

### Production Secrets
- `PROD_DB_PASSWORD`: Production database password
- `PROD_REDIS_PASSWORD`: Production Redis password
- `PROD_HOTMART_EMAIL`: Production Hotmart email
- `PROD_HOTMART_PASSWORD`: Production Hotmart password
- `PROD_JWT_SECRET`: JWT secret for production
- `PROD_ENCRYPTION_KEY`: Encryption key for production

### Monitoring Secrets
- `SENTRY_DSN`: Sentry error tracking DSN
- `DATADOG_API_KEY`: Datadog API key
- `GRAFANA_PASSWORD`: Grafana admin password

### AWS Secrets
- `S3_ACCESS_KEY`: AWS access key for S3
- `S3_SECRET_KEY`: AWS secret key for S3

## Deployment Process

### 1. Automated Testing
```bash
# Push to develop branch
git push origin develop

# Triggers CI pipeline with:
# - Code quality checks
# - Security scanning
# - Automated testing
# - Docker builds
```

### 2. Staging Deployment
```bash
# Manual trigger or automatic on develop merge
# Deploys to staging environment
# Runs smoke tests
# Notifies on Slack
```

### 3. Production Deployment
```bash
# Manual trigger or automatic on main merge
# Creates backup
# Blue-green deployment
# Health checks
# Smoke tests
# Traffic switching
```

### 4. Rollback Process
```bash
# Automatic on failure detection
# Manual trigger available
# Restores previous version
# Verifies rollback
```

## Monitoring and Alerting

### Health Checks
- **API Health**: `/health` endpoint
- **Database Health**: PostgreSQL connection checks
- **Redis Health**: Redis connection checks
- **Service Health**: Container health checks

### Metrics Collection
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Custom Metrics**: Application-specific metrics

### Alerting
- **Slack Notifications**: Real-time alerts
- **Email Notifications**: Critical failure alerts
- **Sentry Integration**: Error tracking

## Security Features

### Automated Security Scanning
- **Dependency Scanning**: Snyk integration
- **Code Analysis**: CodeQL static analysis
- **Container Scanning**: Trivy vulnerability scanning
- **Web Security**: OWASP ZAP scanning

### Security Best Practices
- **Secrets Management**: Environment variables
- **SSL/TLS**: HTTPS enforcement
- **Security Headers**: OWASP recommended headers
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive input validation

## Performance Optimization

### Build Optimization
- **Multi-stage Dockerfiles**: Optimized image sizes
- **Layer Caching**: Docker build caching
- **Parallel Builds**: Concurrent service builds

### Runtime Optimization
- **NGINX Configuration**: Optimized reverse proxy
- **Gzip Compression**: Response compression
- **Static Asset Caching**: Browser caching
- **Connection Pooling**: Database connection optimization

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Dockerfile syntax and dependencies
2. **Test Failures**: Verify test environment configuration
3. **Deployment Failures**: Check environment variables and secrets
4. **Health Check Failures**: Verify service connectivity

### Debug Commands
```bash
# Check CI logs
gh run list --repo anderman1981/hotmart-automation-revised

# Check deployment status
gh run view --repo anderman1981/hotmart-automation-revised

# Debug Docker builds
docker build --progress=plain ./motor
```

## Maintenance

### Regular Tasks
- **Update Dependencies**: Dependabot handles automatic updates
- **Security Scanning**: Weekly security scans
- **Backup Verification**: Monthly backup testing
- **Performance Monitoring**: Continuous performance tracking

### Cleanup
- **Image Cleanup**: Automated old image removal
- **Log Rotation**: Automated log cleanup
- **Cache Cleanup**: Regular cache clearing