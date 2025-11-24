# Task API Testing Guide

## Prerequisites

Before testing the Task API, ensure you have:
- Node.js installed (v18 or higher recommended)
- PostgreSQL database running
- Postman installed or any API testing tool

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_manager_db?schema=public"
PORT=3000
```

Replace `username`, `password`, and database name with your PostgreSQL credentials.

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Push Database Schema
```bash
npm run db:push
```
Or manually:
```bash
npx prisma db push
```

### 5. Start the Application
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000`

---

## API Endpoints

### Base URL
```
http://localhost:3000/tasks
```

---

## 1. Create Task (POST)

**Endpoint:** `POST http://localhost:3000/tasks`

**Request Body (JSON):**
```json
{
  "title": "Complete NestJS project",
  "description": "Build a fully functional task manager API",
  "status": "IN_PROGRESS"
}
```

**Minimal Request (only title required):**
```json
{
  "title": "Simple task"
}
```

**Valid Status Values:**
- `IN_PROGRESS` (default if not provided)
- `COMPLETED`
- `CANCELLED`

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "Complete NestJS project",
    "description": "Build a fully functional task manager API",
    "status": "IN_PROGRESS",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "error": null,
  "message": "Task created successfully"
}
```

**Error Response (400 Bad Request) - Invalid Data:**
```json
{
  "success": false,
  "data": null,
  "error": "Validation failed",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/tasks"
}
```

---

## 2. Get All Tasks (GET)

**Endpoint:** `GET http://localhost:3000/tasks`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "title": "Complete NestJS project",
      "description": "Build a fully functional task manager API",
      "status": "IN_PROGRESS",
      "createdAt": "2025-10-08T10:30:00.000Z",
      "updatedAt": "2025-10-08T10:30:00.000Z"
    },
    {
      "id": "clyxx...",
      "title": "Another task",
      "description": "Description here",
      "status": "COMPLETED",
      "createdAt": "2025-10-08T09:00:00.000Z",
      "updatedAt": "2025-10-08T09:30:00.000Z"
    }
  ],
  "error": null,
  "message": "Retrieved 2 tasks"
}
```

**Empty Response (200 OK):**
```json
{
  "success": true,
  "data": [],
  "error": null,
  "message": "No tasks found"
}
```

---

## 3. Get Task by ID (GET)

**Endpoint:** `GET http://localhost:3000/tasks/:id`

**Example:** `GET http://localhost:3000/tasks/clxxx...`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "Complete NestJS project",
    "description": "Build a fully functional task manager API",
    "status": "IN_PROGRESS",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "error": null,
  "message": "Task retrieved successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "Task with ID clxxx... not found",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/tasks/clxxx..."
}
```

---

## 4. Update Task (PUT)

**Endpoint:** `PUT http://localhost:3000/tasks/:id`

**Example:** `PUT http://localhost:3000/tasks/clxxx...`

**Request Body (JSON) - All fields optional:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

**Partial Update (only update specific fields):**
```json
{
  "status": "COMPLETED"
}
```

Or:
```json
{
  "title": "New title",
  "description": "New description"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "COMPLETED",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T11:00:00.000Z"
  },
  "error": null,
  "message": "Task updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "Task with ID clxxx... not found",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/tasks/clxxx..."
}
```

---

## 5. Delete Task (DELETE)

**Endpoint:** `DELETE http://localhost:3000/tasks/:id`

**Example:** `DELETE http://localhost:3000/tasks/clxxx...`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "Complete NestJS project",
    "description": "Build a fully functional task manager API",
    "status": "IN_PROGRESS",
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "error": null,
  "message": "Task deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "Task with ID clxxx... not found",
  "timestamp": "2025-10-08T10:30:00.000Z",
  "path": "/tasks/clxxx..."
}
```

---

## Postman Collection Setup

### Quick Test Sequence

1. **Create a Task**
   - Method: POST
   - URL: `http://localhost:3000/tasks`
   - Body (raw JSON):
     ```json
     {
       "title": "My First Task",
       "description": "Testing the API",
       "status": "IN_PROGRESS"
     }
     ```
   - Save the `id` from the response for next steps

2. **Get All Tasks**
   - Method: GET
   - URL: `http://localhost:3000/tasks`

3. **Get Task by ID**
   - Method: GET
   - URL: `http://localhost:3000/tasks/{TASK_ID}`
   - Replace `{TASK_ID}` with the ID from step 1

4. **Update Task**
   - Method: PUT
   - URL: `http://localhost:3000/tasks/{TASK_ID}`
   - Body (raw JSON):
     ```json
     {
       "status": "COMPLETED"
     }
     ```

5. **Delete Task**
   - Method: DELETE
   - URL: `http://localhost:3000/tasks/{TASK_ID}`

---

## Common Validation Errors

### Missing Title
**Request:**
```json
{
  "description": "No title provided"
}
```
**Response (400):**
```json
{
  "message": [
    "title should not be empty",
    "title must be a string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Invalid Status
**Request:**
```json
{
  "title": "Test",
  "status": "INVALID_STATUS"
}
```
**Response (400):**
```json
{
  "message": [
    "status must be one of the following values: IN_PROGRESS, COMPLETED, CANCELLED"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Extra Fields (Non-whitelisted)
**Request:**
```json
{
  "title": "Test",
  "extraField": "This will be rejected"
}
```
**Response (400):**
```json
{
  "message": [
    "property extraField should not exist"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Database Management

### View Data in Prisma Studio
```bash
npm run db:studio
```
This opens a browser interface at `http://localhost:5555` to view and manage your data.

### Reset Database (if needed)
```bash
npx prisma db push --force-reset
```

⚠️ **Warning:** This will delete all data in your database!

---

## Troubleshooting

### Issue: Cannot connect to database
**Solution:** 
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env` file
- Ensure database exists or let Prisma create it with `npx prisma db push`

### Issue: Prisma Client not found
**Solution:**
```bash
npx prisma generate
```

### Issue: Port 3000 already in use
**Solution:**
- Change PORT in `.env` file
- Or kill the process using port 3000

### Issue: Validation errors
**Solution:**
- Check request body matches the DTOs
- Ensure all required fields are present
- Verify status values are valid enums

---

## Features Implemented

✅ **Full CRUD Operations**
- Create, Read, Update, Delete tasks

✅ **Input Validation**
- Required fields validation
- Enum validation for status
- String type validation
- No extra fields allowed

✅ **Error Handling**
- Global exception filter
- Proper HTTP status codes
- Detailed error messages
- Prisma error handling

✅ **Best Practices**
- DTOs with decorators
- Service layer separation
- Proper logging
- TypeScript strict mode
- Clean architecture

✅ **Database Integration**
- Prisma ORM
- PostgreSQL support
- Automatic migrations
- Type-safe queries

---

## Status Codes Reference

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

---

## Next Steps

After testing the Task API, you can:
1. Add user authentication (Auth module exists)
2. Add task-user relationships
3. Add filtering and pagination
4. Add sorting options
5. Add search functionality
6. Deploy to production

Happy Testing! 🚀

