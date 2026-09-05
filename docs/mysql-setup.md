# MySQL Setup Guide

## Prerequisites

- MySQL 8+
- phpMyAdmin for local administration (optional but recommended)
- A local database user with permission to create databases and tables

## Create database

```sql
CREATE DATABASE IF NOT EXISTS EduPredict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Import schema

From the project root:

```bash
mysql -u root -p < database/schema.sql
```

If you want sample roles and years:

```bash
mysql -u root -p < database/seed.sql
```

## Environment

Update the backend `.env` file with your local MySQL values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=EduPredict
DB_USER=root
DB_PASSWORD=your_mysql_password
```

## Verification

After starting the backend, check:

```bash
curl http://localhost:5000/api/health
```

Expected result:

- app: EduPredict API
- status: online
- database: connected or disconnected depending on MySQL availability
