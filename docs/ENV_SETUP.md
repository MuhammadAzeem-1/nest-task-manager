# Environment Setup Guide

## 📝 Required Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/task_manager_db?schema=public"

# Application Configuration
PORT=3000

# JWT Configuration (REQUIRED FOR AUTHENTICATION)
JWT_SECRET="your-super-secret-key-must-be-at-least-32-characters-long-change-this-in-production"
JWT_EXPIRES_IN="1h"
```

---

## 🔐 JWT_SECRET - IMPORTANT!

### What is it?
The secret key used to sign and verify JWT tokens. This is **critical for security**.

### Requirements:
- ✅ **Minimum 32 characters**
- ✅ **Random and complex**
- ✅ **Different for each environment** (dev, staging, production)
- ✅ **Never commit to version control**

### Generate a Strong Secret:

**Method 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 2: OpenSSL**
```bash
openssl rand -hex 32
```

**Method 3: Online Generator**
Visit: https://randomkeygen.com/ (use 256-bit key)

### Example:
```env
JWT_SECRET="a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8"
```

---

## ⏰ JWT_EXPIRES_IN

### What is it?
How long access tokens remain valid before users need to login again.

### Options:
```env
JWT_EXPIRES_IN="15m"   # 15 minutes (high security)
JWT_EXPIRES_IN="1h"    # 1 hour (recommended ✅)
JWT_EXPIRES_IN="24h"   # 24 hours (convenience)
JWT_EXPIRES_IN="7d"    # 7 days (very convenient but less secure)
```

### Recommendation:
- **Development:** `1h` or `24h` for convenience
- **Production:** `1h` for good security/UX balance

---

## 🗄️ DATABASE_URL

### Format:
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

### Examples:

**Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager_db?schema=public"
```

**Docker PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager_db?schema=public"
```

**Cloud Database (Heroku, Railway, etc.):**
```env
DATABASE_URL="postgresql://user:pass@host.db.com:5432/database?schema=public"
```

### Components:
- `USERNAME` - Database user (e.g., `postgres`)
- `PASSWORD` - User password
- `HOST` - Server address (e.g., `localhost`, `db.example.com`)
- `PORT` - Database port (usually `5432` for PostgreSQL)
- `DATABASE` - Database name (e.g., `task_manager_db`)

---

## 🔧 PORT

### What is it?
The port your NestJS application will run on.

### Default:
```env
PORT=3000
```

### Change if needed:
```env
PORT=8080  # If 3000 is already in use
PORT=4000  # Alternative port
```

---

## 📋 Complete .env Template

Copy this template and fill in your values:

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/task_manager_db?schema=public"

# ========================================
# APPLICATION CONFIGURATION
# ========================================
# Port the application will run on
PORT=3000

# ========================================
# JWT AUTHENTICATION CONFIGURATION
# ========================================
# Secret key for signing JWT tokens (MUST BE 32+ characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# NEVER commit this to version control!
JWT_SECRET="REPLACE-THIS-WITH-A-REAL-SECRET-KEY-32-CHARS-MINIMUM"

# Token expiration time
# Options: 15m, 30m, 1h, 24h, 7d
JWT_EXPIRES_IN="1h"
```

---

## ✅ Verification

### Step 1: Check .env exists
```bash
# Windows PowerShell
Test-Path .env

# Linux/Mac
ls -la .env
```

### Step 2: Verify variables are loaded
Add to your `main.ts` (temporarily):
```typescript
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
```

### Step 3: Test authentication
```bash
# Start server
npm run start:dev

# Try to signup (should work)
POST http://localhost:3000/auth/signup
```

---

## 🚨 Common Issues

### Issue 1: "JWT_SECRET is undefined"
**Cause:** .env file not loaded or JWT_SECRET not set

**Solution:**
1. Create `.env` file in root directory
2. Add `JWT_SECRET` with a value
3. Restart server

### Issue 2: "Database connection failed"
**Cause:** Invalid DATABASE_URL or database not running

**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in DATABASE_URL
3. Test connection: `npx prisma db push`

### Issue 3: "Port 3000 is already in use"
**Cause:** Another application using port 3000

**Solution:**
1. Change PORT in .env to another value (e.g., 4000)
2. Or stop the other application

---

## 🔒 Security Best Practices

### ✅ DO:
- Use strong, random JWT_SECRET
- Different secrets for dev/prod
- Add `.env` to `.gitignore`
- Use environment variables in CI/CD
- Rotate secrets periodically
- Use secure connection strings in production

### ❌ DON'T:
- Commit `.env` to version control
- Share secrets in plain text
- Use weak or default secrets
- Use same secret across environments
- Hardcode secrets in code

---

## 📁 File Structure

```
project-root/
├── .env              ← Your environment variables (DO NOT COMMIT)
├── .env.example      ← Template (safe to commit)
├── .gitignore        ← Should include .env
└── src/
    └── ...
```

### .gitignore should include:
```
.env
.env.local
.env.*.local
```

---

## 🌍 Multiple Environments

### Development:
```env
# .env.development
DATABASE_URL="postgresql://localhost:5432/task_manager_dev"
JWT_SECRET="dev-secret-key-for-development-only"
JWT_EXPIRES_IN="24h"
```

### Production:
```env
# .env.production
DATABASE_URL="postgresql://prod-db.example.com:5432/task_manager"
JWT_SECRET="highly-secure-random-production-secret"
JWT_EXPIRES_IN="1h"
```

---

## 📊 Environment Variables Summary

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| DATABASE_URL | ✅ Yes | - | Database connection |
| PORT | ❌ No | 3000 | Server port |
| JWT_SECRET | ✅ Yes | - | Token signing |
| JWT_EXPIRES_IN | ❌ No | 1h | Token expiry |

---

## 🚀 Quick Start

1. **Copy template:**
   ```bash
   cp .env.example .env
   ```

2. **Generate JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Edit .env:**
   - Set JWT_SECRET to generated value
   - Set DATABASE_URL to your database
   - Optionally change PORT

4. **Verify:**
   ```bash
   npm run start:dev
   ```

5. **Test:**
   ```bash
   POST http://localhost:3000/auth/signup
   ```

---

**Your environment is ready when:**
- ✅ `.env` file exists
- ✅ `JWT_SECRET` is set (32+ characters)
- ✅ `DATABASE_URL` is correct
- ✅ Server starts without errors
- ✅ Authentication endpoints work

---

**Need help? Check the logs for specific error messages!** 🔍

