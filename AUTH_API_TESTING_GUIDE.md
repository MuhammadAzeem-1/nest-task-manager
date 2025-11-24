# Authentication API Testing Guide

## 🔐 Overview

Complete JWT-based authentication system with role-based access control (RBAC). Users can only access their own data, while admins have full access.

---

## 🚀 Quick Setup

### 1. Add JWT Secret to .env
```env
DATABASE_URL="your_database_url"
PORT=3000
JWT_SECRET="your-super-secret-key-min-32-characters-long"
JWT_EXPIRES_IN="1h"
```

### 2. Generate Prisma Client & Push Schema
```bash
npx prisma generate
npx prisma db push
```

### 3. Start Server
```bash
npm run start:dev
```

Server runs on: `http://localhost:3000`

---

## 📋 Authentication Endpoints

### Base URL
```
http://localhost:3000/auth
```

---

## 1. Signup (Register New User)

**Endpoint:** `POST http://localhost:3000/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**Important:** 
- Save the `access_token` - you'll need it for all protected routes
- Token expires in 1 hour
- Default role is USER

**Error Response (409 Conflict) - Email Already Exists:**
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

---

## 2. Login

**Endpoint:** `POST http://localhost:3000/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**Error Response (401 Unauthorized) - Invalid Credentials:**
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## 3. Get Profile

**Endpoint:** `GET http://localhost:3000/auth/profile`

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "clxxx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-10-08T...",
    "updatedAt": "2025-10-08T..."
  },
  "error": null
}
```

**Error Response (401 Unauthorized) - No Token:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## 🔒 Protected Endpoints

All endpoints below require authentication. Include the token in headers:

```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

---

## 📝 Tasks API (Protected)

### Create Task (Authenticated Users)

**Endpoint:** `POST http://localhost:3000/tasks`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My Task",
  "description": "Task description",
  "status": "IN_PROGRESS"
}
```

**Response:** Task is automatically linked to the logged-in user

```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "My Task",
    "description": "Task description",
    "status": "IN_PROGRESS",
    "userId": "clxxx...",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "error": null,
  "message": "Task created successfully"
}
```

### Get All Tasks

**Endpoint:** `GET http://localhost:3000/tasks`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Behavior:**
- **Regular User:** See only their own tasks
- **Admin:** See all tasks from all users

### Get Task by ID

**Endpoint:** `GET http://localhost:3000/tasks/:id`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission Check:**
- ✅ Owner can view their task
- ✅ Admin can view any task
- ❌ Other users get 403 Forbidden

### Update Task

**Endpoint:** `PUT http://localhost:3000/tasks/:id`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission Check:**
- ✅ Owner can update their task
- ✅ Admin can update any task
- ❌ Other users get 403 Forbidden

### Delete Task

**Endpoint:** `DELETE http://localhost:3000/tasks/:id`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission Check:**
- ✅ Owner can delete their task
- ✅ Admin can delete any task
- ❌ Other users get 403 Forbidden

---

## 👥 Users API (Protected)

### Get All Users (Admin Only)

**Endpoint:** `GET http://localhost:3000/users`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission:**
- ✅ Admin can list all users
- ❌ Regular users get 403 Forbidden

### Get User by ID

**Endpoint:** `GET http://localhost:3000/users/:id`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission:**
- ✅ Users can view their own profile
- ✅ Admin can view any profile
- ❌ Other users get 403 Forbidden

### Update User

**Endpoint:** `PUT http://localhost:3000/users/:id`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission:**
- ✅ Users can update their own profile (except role)
- ✅ Admin can update any profile (including role)
- ❌ Regular users cannot change their own role
- ❌ Other users get 403 Forbidden

**Request Body (Partial):**
```json
{
  "name": "Updated Name"
}
```

### Delete User (Admin Only)

**Endpoint:** `DELETE http://localhost:3000/users/:id`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Permission:**
- ✅ Admin only
- ❌ Regular users get 403 Forbidden

---

## 🧪 Complete Testing Flow

### Step 1: Register Two Users

**User 1 (Regular User):**
```
POST /auth/signup
{
  "name": "Regular User",
  "email": "user@test.com",
  "password": "user1234"
}
```
→ Save `access_token` as `USER_TOKEN`

**User 2 (Will make Admin):**
```
POST /auth/signup
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin1234"
}
```
→ Save `access_token` as `ADMIN_TOKEN`
→ Save user `id` as `ADMIN_ID`

### Step 2: Manually Set Admin Role

Connect to your database and run:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@test.com';
```

Or use Prisma Studio:
```bash
npx prisma studio
```
→ Find the admin user and change role to "ADMIN"

### Step 3: Login as Admin

```
POST /auth/login
{
  "email": "admin@test.com",
  "password": "admin1234"
}
```
→ Get new `access_token` (now with ADMIN role)

### Step 4: Test User Actions

**As Regular User (USER_TOKEN):**

1. Create Task:
```
POST /tasks
Authorization: Bearer USER_TOKEN
{
  "title": "User Task"
}
```

2. Get Own Tasks:
```
GET /tasks
Authorization: Bearer USER_TOKEN
```
→ Should see only own tasks

3. Try to Get All Users (Should Fail):
```
GET /users
Authorization: Bearer USER_TOKEN
```
→ Should get 403 Forbidden

### Step 5: Test Admin Actions

**As Admin (ADMIN_TOKEN):**

1. Get All Users:
```
GET /users
Authorization: Bearer ADMIN_TOKEN
```
→ Should see all users ✅

2. Get All Tasks:
```
GET /tasks
Authorization: Bearer ADMIN_TOKEN
```
→ Should see tasks from all users ✅

3. Update Any User:
```
PUT /users/{ANY_USER_ID}
Authorization: Bearer ADMIN_TOKEN
{
  "name": "Updated by Admin"
}
```
→ Should work ✅

4. Delete Any Task:
```
DELETE /tasks/{ANY_TASK_ID}
Authorization: Bearer ADMIN_TOKEN
```
→ Should work ✅

### Step 6: Test Permission Denials

1. User tries to access another user's task:
```
GET /tasks/{OTHER_USER_TASK_ID}
Authorization: Bearer USER_TOKEN
```
→ Should get 403 Forbidden ❌

2. User tries to update another user's profile:
```
PUT /users/{OTHER_USER_ID}
Authorization: Bearer USER_TOKEN
{
  "name": "Hacked"
}
```
→ Should get 403 Forbidden ❌

3. User tries to change own role:
```
PUT /users/{OWN_ID}
Authorization: Bearer USER_TOKEN
{
  "role": "ADMIN"
}
```
→ Should get 403 Forbidden ❌

---

## 🔑 Token Management

### Token Expiry
- Access tokens expire in **1 hour**
- After expiry, you'll get `401 Unauthorized`
- Solution: Login again to get new token

### Token Format
JWT tokens contain:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### How to Use Tokens in Postman

1. **Method 1: Authorization Tab**
   - Select "Bearer Token" type
   - Paste token in the field

2. **Method 2: Headers Tab**
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

3. **Tip: Use Postman Variables**
   - After login, save token to variable:
   ```javascript
   pm.collectionVariables.set("token", pm.response.json().data.access_token);
   ```
   - Use in requests: `{{token}}`

---

## 🛡️ Role-Based Access Control (RBAC)

### User Roles

| Role | Description | Default |
|------|-------------|---------|
| USER | Regular user | ✅ Yes |
| ADMIN | Full access | ❌ No |
| MODERATOR | Extended access | ❌ No |

### Permission Matrix

| Action | USER | ADMIN | MODERATOR |
|--------|------|-------|-----------|
| Signup | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| Change own role | ❌ | ✅ | ❌ |
| View own tasks | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Update own tasks | ✅ | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ | ✅ |
| View all tasks | ❌ | ✅ | ❌ |
| Update any task | ❌ | ✅ | ❌ |
| Delete any task | ❌ | ✅ | ❌ |
| View all users | ❌ | ✅ | ❌ |
| View any user | ❌ | ✅ | ❌ |
| Update any user | ❌ | ✅ | ❌ |
| Delete any user | ❌ | ✅ | ❌ |

---

## ❌ Common Errors

### 401 Unauthorized
**Causes:**
- No token provided
- Invalid token
- Token expired
- Token signature invalid

**Solutions:**
- Check Authorization header format
- Ensure token is correct
- Login again if expired

### 403 Forbidden
**Causes:**
- Insufficient permissions
- Trying to access other user's data
- Trying to perform admin-only action

**Solutions:**
- Check your role
- Ensure you're accessing your own data
- Contact admin for role upgrade

### 400 Bad Request
**Causes:**
- Invalid email format
- Password too short
- Missing required fields

**Solutions:**
- Check request body format
- Ensure password is 6+ characters
- Provide all required fields

### 409 Conflict
**Causes:**
- Email already exists

**Solutions:**
- Use different email
- Login if you already have account

---

## 📊 Testing Checklist

### Authentication
- [ ] Signup with valid data
- [ ] Signup with existing email (should fail)
- [ ] Signup with short password (should fail)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Get profile with valid token
- [ ] Get profile without token (should fail)
- [ ] Get profile with expired token (should fail)

### Authorization (Tasks)
- [ ] Create task as logged-in user
- [ ] View own tasks
- [ ] Update own task
- [ ] Delete own task
- [ ] Try to view another user's task (should fail)
- [ ] Try to update another user's task (should fail)
- [ ] Try to delete another user's task (should fail)
- [ ] Admin can view all tasks
- [ ] Admin can update any task
- [ ] Admin can delete any task

### Authorization (Users)
- [ ] User can view own profile
- [ ] User can update own profile
- [ ] User cannot change own role (should fail)
- [ ] User cannot view other profiles (should fail)
- [ ] User cannot update other profiles (should fail)
- [ ] User cannot list all users (should fail)
- [ ] Admin can list all users
- [ ] Admin can view any profile
- [ ] Admin can update any profile
- [ ] Admin can change user roles
- [ ] Admin can delete users

---

## 🔍 Debugging Tips

### Check Token Contents
Use [jwt.io](https://jwt.io) to decode your token and see:
- User ID
- Email
- Role
- Expiry time

### Check Logs
Server logs show:
- Authentication attempts
- Permission denials
- Token validation

### Postman Console
Open Postman Console to see:
- Full request/response
- Headers sent
- Error details

---

## 🎯 Summary

### Public Endpoints (No Auth Required)
- `POST /auth/signup` - Register
- `POST /auth/login` - Login

### Protected Endpoints (Token Required)
- `GET /auth/profile` - Current user profile
- All `/tasks` endpoints
- All `/users` endpoints

### Admin-Only Endpoints
- `GET /users` - List all users
- `DELETE /users/:id` - Delete any user

### Permission Rules
1. Users see only their own data
2. Users can modify only their own data
3. Users cannot change their own role
4. Admins have full access to everything
5. All task/user operations require authentication

---

**Ready to test! Start with signup and work through the flow.** 🚀

For detailed API documentation:
- Tasks API: See `TASK_API_TESTING_GUIDE.md`
- Users API: See `USERS_API_TESTING_GUIDE.md`

