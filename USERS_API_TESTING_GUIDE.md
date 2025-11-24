# Users API Testing Guide

## 📋 Overview

The Users API provides complete CRUD operations for user management with secure password hashing and email uniqueness validation.

---

## 🚀 Prerequisites

Make sure you've completed the setup from `QUICK_START.md`:
- Database configured and migrated
- Server running on `http://localhost:3000`

---

## 🎯 API Endpoints

### Base URL
```
http://localhost:3000/users
```

---

## 1. Create User (POST)

**Endpoint:** `POST http://localhost:3000/users`

**Request Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Minimal Request (role is optional):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure123"
}
```

**Valid Role Values:**
- `USER` (default if not provided)
- `ADMIN`
- `MODERATOR`

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "error": null,
  "message": "User created successfully"
}
```

**Note:** Password is automatically hashed with bcrypt and never returned in responses.

**Error Response (409 Conflict) - Duplicate Email:**
```json
{
  "message": "User with email john@example.com already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

**Error Response (400 Bad Request) - Validation Error:**
```json
{
  "message": [
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 2. Get All Users (GET)

**Endpoint:** `GET http://localhost:3000/users`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2025-10-08T10:30:00.000Z",
      "updatedAt": "2025-10-08T10:30:00.000Z"
    },
    {
      "id": "clyxx...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "ADMIN",
      "createdAt": "2025-10-08T09:00:00.000Z",
      "updatedAt": "2025-10-08T09:00:00.000Z"
    }
  ],
  "error": null,
  "message": "Retrieved 2 users"
}
```

**Empty Response (200 OK):**
```json
{
  "success": true,
  "data": [],
  "error": null,
  "message": "No users found"
}
```

---

## 3. Get User by ID (GET)

**Endpoint:** `GET http://localhost:3000/users/:id`

**Example:** `GET http://localhost:3000/users/clxxx...`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "error": null,
  "message": "User retrieved successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "User with ID clxxx... not found",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/users/clxxx..."
}
```

---

## 4. Update User (PUT)

**Endpoint:** `PUT http://localhost:3000/users/:id`

**Example:** `PUT http://localhost:3000/users/clxxx...`

**Request Body (JSON) - All fields optional:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "newpassword123",
  "role": "ADMIN"
}
```

**Partial Update Examples:**

Update only name:
```json
{
  "name": "John Smith"
}
```

Update only role:
```json
{
  "role": "MODERATOR"
}
```

Update password:
```json
{
  "password": "newsecurepass123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "John Updated",
    "email": "john.new@example.com",
    "role": "ADMIN",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T11:00:00.000Z"
  },
  "error": null,
  "message": "User updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "User with ID clxxx... not found",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/users/clxxx..."
}
```

**Error Response (409 Conflict) - Email Already in Use:**
```json
{
  "message": "Email john@example.com already in use",
  "error": "Conflict",
  "statusCode": 409
}
```

---

## 5. Delete User (DELETE)

**Endpoint:** `DELETE http://localhost:3000/users/:id`

**Example:** `DELETE http://localhost:3000/users/clxxx...`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "error": null,
  "message": "User deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "User with ID clxxx... not found",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/users/clxxx..."
}
```

---

## 🧪 Postman Test Sequence

### Test Flow:

1. **Create First User**
   ```
   POST /users
   {
     "name": "Admin User",
     "email": "admin@test.com",
     "password": "admin123",
     "role": "ADMIN"
   }
   ```
   → Save the returned `id`

2. **Create Second User**
   ```
   POST /users
   {
     "name": "Regular User",
     "email": "user@test.com",
     "password": "user1234"
   }
   ```

3. **Get All Users**
   ```
   GET /users
   ```
   → Should see both users

4. **Get User by ID**
   ```
   GET /users/{USER_ID}
   ```
   → Use ID from step 1

5. **Update User**
   ```
   PUT /users/{USER_ID}
   {
     "name": "Admin Updated",
     "role": "MODERATOR"
   }
   ```

6. **Try Duplicate Email** (Should Fail)
   ```
   POST /users
   {
     "name": "Duplicate",
     "email": "admin@test.com",
     "password": "pass123"
   }
   ```
   → Should get 409 Conflict

7. **Delete User**
   ```
   DELETE /users/{USER_ID}
   ```

8. **Verify Deletion**
   ```
   GET /users/{USER_ID}
   ```
   → Should get 404 Not Found

---

## 🔐 Security Features

### ✅ Password Security
- Passwords are hashed using bcrypt (salt rounds: 10)
- Passwords are NEVER returned in API responses
- Minimum password length: 6 characters
- Password is hashed on both create and update

### ✅ Email Validation
- Email format validation (must be valid email)
- Email uniqueness enforced at database level
- Duplicate email check on create
- Duplicate email check on update (if email is changing)

### ✅ Data Protection
- Password field excluded from all responses
- Only safe user data returned (PublicUserDto)

---

## ✅ Validation Rules

### Create User:
| Field | Required | Type | Rules |
|-------|----------|------|-------|
| name | ✅ Yes | String | Not empty |
| email | ✅ Yes | String | Valid email format, unique |
| password | ✅ Yes | String | Min 6 characters |
| role | ❌ No | Enum | USER, ADMIN, or MODERATOR (defaults to USER) |

### Update User:
| Field | Required | Type | Rules |
|-------|----------|------|-------|
| name | ❌ No | String | - |
| email | ❌ No | String | Valid email format, unique |
| password | ❌ No | String | Min 6 characters |
| role | ❌ No | Enum | USER, ADMIN, or MODERATOR |

---

## ❌ Common Validation Errors

### Missing Required Field
**Request:**
```json
{
  "email": "test@example.com",
  "password": "pass123"
}
```
**Response (400):**
```json
{
  "message": [
    "name should not be empty",
    "name must be a string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Invalid Email Format
**Request:**
```json
{
  "name": "Test",
  "email": "invalid-email",
  "password": "pass123"
}
```
**Response (400):**
```json
{
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Password Too Short
**Request:**
```json
{
  "name": "Test",
  "email": "test@example.com",
  "password": "12345"
}
```
**Response (400):**
```json
{
  "message": [
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Invalid Role
**Request:**
```json
{
  "name": "Test",
  "email": "test@example.com",
  "password": "pass123",
  "role": "SUPERUSER"
}
```
**Response (400):**
```json
{
  "message": [
    "role must be one of the following values: ADMIN, USER, MODERATOR"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 📊 Status Codes Reference

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `404 Not Found` - User not found
- `409 Conflict` - Duplicate email
- `500 Internal Server Error` - Server errors

---

## 🔍 Testing Tips

### 1. Test Email Uniqueness
Create two users with the same email - second should fail

### 2. Test Password Hashing
Create a user and verify password is not in response

### 3. Test Partial Updates
Update only one field and verify others remain unchanged

### 4. Test Role Defaults
Create user without role - should default to USER

### 5. Test Invalid Data
Try invalid emails, short passwords, invalid roles

---

## 🛠️ Advanced Testing

### Test with Different Roles:
```json
// Admin
{ "name": "Admin", "email": "admin@test.com", "password": "admin123", "role": "ADMIN" }

// Moderator
{ "name": "Mod", "email": "mod@test.com", "password": "mod12345", "role": "MODERATOR" }

// Regular User (default)
{ "name": "User", "email": "user@test.com", "password": "user1234" }
```

### Test Edge Cases:
```json
// Very long name
{ "name": "A".repeat(100), "email": "long@test.com", "password": "pass123" }

// Special characters in name
{ "name": "José María O'Brien", "email": "jose@test.com", "password": "pass123" }

// Complex email
{ "name": "Test", "email": "test+tag@sub.example.com", "password": "pass123" }
```

---

## 🔗 Related Endpoints

Once you have users created, you can:
1. Link tasks to users (using userId in tasks)
2. Use user credentials for authentication (Auth module)

---

## 📝 Important Notes

### Password Storage:
- Passwords are hashed with bcrypt
- Original passwords cannot be retrieved
- Each password update creates a new hash

### Email Case Sensitivity:
- Emails are case-sensitive in the database
- `user@test.com` ≠ `User@Test.com`

### User Deletion:
- Deleting a user may affect related tasks
- Check your Prisma schema for cascade rules

### Role Permissions:
- Roles are stored but not enforced by this API
- You'll need to implement role-based access control separately

---

## 🎯 Features Implemented

✅ Complete CRUD operations  
✅ Secure password hashing (bcrypt)  
✅ Email uniqueness validation  
✅ Role management  
✅ Input validation  
✅ Error handling  
✅ Logging  
✅ Type safety  

---

## 🚀 Ready to Test!

Your Users API is fully functional. Start with creating a user and work through all the endpoints!

For any issues, check the server logs for detailed error messages.

**Happy Testing! 🎉**

