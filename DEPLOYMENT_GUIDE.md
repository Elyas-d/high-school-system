# Deployment Guide

This guide covers deploying the High School Management System to different environments.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd high-school-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

### 4. Database Setup

#### Configure MySQL Connection

Update `config/config.json` with your MySQL credentials:

```json
{
  "development": {
    "username": "your_username",
    "password": "your_password",
    "database": "highschool",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

#### Create Database

```sql
CREATE DATABASE highschool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Run Migrations

```bash
npm run db:migrate
```

#### Seed Initial Data

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Requirements

- Ubuntu 20.04+ or CentOS 8+
- Node.js 16+
- MySQL 8.0+
- Nginx (for reverse proxy)

#### 2. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### 3. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd high-school-system

# Install dependencies
npm install

# Set environment variables
export NODE_ENV=production
export JWT_SECRET=your-production-jwt-secret
export SESSION_SECRET=your-production-session-secret

# Run database migrations
npm run db:migrate

# Start application with PM2
pm2 start src/index.js --name "high-school-system"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/high-school-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/high-school-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL Certificate (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-production-jwt-secret
      - SESSION_SECRET=your-production-session-secret
    depends_on:
      - mysql
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your-root-password
      MYSQL_DATABASE: highschool
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:migrate

# Seed database
docker-compose exec app npm run db:seed
```

### Option 3: Cloud Platform Deployment

#### Heroku

1. Create `Procfile`:
```
web: npm start
```

2. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-jwt-secret
heroku config:set SESSION_SECRET=your-production-session-secret
```

3. Add MySQL addon:
```bash
heroku addons:create jawsdb:kitefin
```

4. Deploy:
```bash
git push heroku main
```

#### AWS EC2

1. Launch EC2 instance
2. Install Node.js and MySQL
3. Follow traditional server deployment steps
4. Configure security groups for port 80, 443, and 3000

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm install`
4. Set run command: `npm start`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `SESSION_SECRET` | Session secret | `your-session-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## Database Configuration

### Production Database Setup

1. Create a dedicated MySQL user:
```sql
CREATE USER 'app_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON highschool.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

2. Update `config/config.json`:
```json
{
  "production": {
    "username": "app_user",
    "password": "strong_password",
    "database": "highschool",
    "host": "your-db-host",
    "dialect": "mysql",
    "logging": false
  }
}
```

### Database Backup

```bash
# Create backup
mysqldump -u username -p highschool > backup.sql

# Restore backup
mysql -u username -p highschool < backup.sql
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs high-school-system

# Monitor processes
pm2 monit

# Restart application
pm2 restart high-school-system
```

### Application Logs

Logs are stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### Health Checks

The application provides health check endpoints:
- `GET /api/users/public` - Public health check
- `GET /api-docs` - API documentation

## Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor application logs

### SSL/TLS Configuration

For production, always use HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # ... rest of configuration
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service status
   - Verify database credentials
   - Ensure database exists

2. **Port Already in Use**
   - Check if another process is using port 3000
   - Change port in environment variables

3. **Permission Denied**
   - Check file permissions
   - Ensure proper user permissions

4. **Memory Issues**
   - Monitor memory usage
   - Consider increasing Node.js heap size

### Debug Mode

Enable debug logging:

```bash
export DEBUG=*
npm start
```

## Performance Optimization

### Production Optimizations

1. **Enable Compression**
```javascript
app.use(compression());
```

2. **Use PM2 Clustering**
```bash
pm2 start src/index.js -i max
```

3. **Database Connection Pooling**
```javascript
// In config/config.json
{
  "pool": {
    "max": 5,
    "min": 0,
    "acquire": 30000,
    "idle": 10000
  }
}
```

4. **Caching**
Consider implementing Redis for session storage and caching.

## Backup and Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p highschool > backup_$DATE.sql
```

### Recovery Process

1. Stop the application
2. Restore database from backup
3. Restart the application
4. Verify data integrity

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review security group/firewall settings 