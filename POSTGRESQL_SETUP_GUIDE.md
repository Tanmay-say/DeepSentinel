# PostgreSQL + Prisma Setup Guide for DeepSentinel

## Overview
This guide will help you set up PostgreSQL database for the DeepSentinel AI agent platform.

## Prerequisites
- Node.js 18+ installed
- Docker (recommended) OR PostgreSQL installed locally

---

## Option 1: Using Docker (Recommended for Development)

### Step 1: Install Docker
Download and install Docker Desktop from https://www.docker.com/products/docker-desktop/

### Step 2: Run PostgreSQL Container
```bash
# Pull and run PostgreSQL 16
docker run --name deepsentinel-postgres \
  -e POSTGRES_USER=deepsentinel \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=deepsentinel_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# Verify it's running
docker ps
```

### Step 3: Update Environment Variables
Add to `/app/backend/.env`:
```env
DATABASE_URL="postgresql://deepsentinel:your_secure_password@localhost:5432/deepsentinel_db?schema=public"
```

---

## Option 2: Local PostgreSQL Installation

### For macOS (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database
createdb deepsentinel_db
```

### For Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE USER deepsentinel WITH PASSWORD 'your_secure_password';
CREATE DATABASE deepsentinel_db OWNER deepsentinel;
GRANT ALL PRIVILEGES ON DATABASE deepsentinel_db TO deepsentinel;
\q
```

### For Windows:
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer and follow wizard
3. Remember the password you set for `postgres` user
4. Use pgAdmin to create `deepsentinel_db` database

### Update Environment Variables:
```env
DATABASE_URL="postgresql://deepsentinel:your_secure_password@localhost:5432/deepsentinel_db?schema=public"
```

---

## Step 4: Initialize Prisma

### Install Prisma CLI:
```bash
cd /app/backend
npm install -D prisma
npm install @prisma/client
```

### Initialize Prisma (already done in this project):
```bash
npx prisma init
```

### View the Schema:
The schema is located at `/app/backend/prisma/schema.prisma`

### Run Migrations:
```bash
# Generate migration from schema
npx prisma migrate dev --name init

# This will:
# 1. Create migration files
# 2. Apply migration to database
# 3. Generate Prisma Client
```

### Generate Prisma Client (after any schema changes):
```bash
npx prisma generate
```

---

## Step 5: Verify Connection

### Test connection:
```bash
npx prisma db push
```

### Open Prisma Studio (Database GUI):
```bash
npx prisma studio
```
This will open http://localhost:5555 where you can view and edit data.

---

## Common Commands

```bash
# View current database
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# View migration status
npx prisma migrate status

# Generate client after schema changes
npx prisma generate
```

---

## Prisma Schema Overview

Our DeepSentinel schema includes:

- **User**: Wallet addresses and settings
- **Agent**: AI agent configurations (Arbitrage Hunter, etc.)
- **Trade**: Executed trades with profit/loss
- **ActivityLog**: Real-time activity feed
- **Opportunity**: Detected arbitrage opportunities

See `/app/backend/prisma/schema.prisma` for full schema.

---

## Production Deployment

### Using Cloud PostgreSQL:

1. **Supabase** (Free tier available):
   - Create project at https://supabase.com
   - Get connection string from Settings → Database
   - Update `DATABASE_URL` in `.env`

2. **Railway** (Free tier):
   - Create project at https://railway.app
   - Add PostgreSQL plugin
   - Copy connection string

3. **Neon** (Serverless Postgres):
   - Create project at https://neon.tech
   - Get connection string
   - Supports edge functions

4. **AWS RDS** / **Google Cloud SQL** (Production scale):
   - Create managed PostgreSQL instance
   - Configure security groups
   - Use connection pooling (PgBouncer)

### Connection Pooling (for production):
```env
# Direct connection
DATABASE_URL="postgresql://user:pass@host:5432/db"

# With PgBouncer pooling
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

---

## Troubleshooting

### Connection refused:
```bash
# Check if PostgreSQL is running
docker ps  # for Docker
brew services list  # for macOS
sudo systemctl status postgresql  # for Linux

# Check if port 5432 is in use
lsof -i :5432  # macOS/Linux
netstat -an | findstr 5432  # Windows
```

### Authentication failed:
- Verify username/password in `DATABASE_URL`
- Check `pg_hba.conf` for allowed connections
- Restart PostgreSQL after config changes

### Migration errors:
```bash
# View detailed error
npx prisma migrate dev --create-only

# Skip migration (use with caution)
npx prisma db push --skip-generate
```

### Cannot find @prisma/client:
```bash
# Regenerate client
npm install @prisma/client
npx prisma generate
```

---

## Next Steps

1. ✅ Set up PostgreSQL using Docker or local installation
2. ✅ Update `DATABASE_URL` in `/app/backend/.env`
3. ✅ Run `npx prisma migrate dev`
4. ✅ Start backend server: `npm run dev`
5. ✅ Verify at http://localhost:8001/api/health

---

## Support

For issues:
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- GitHub Issues: Create issue in project repo

---

**Note**: This project is currently using MongoDB in the template. The backend has been rewritten to use PostgreSQL + Prisma as requested. Make sure to follow this guide before running the application.
