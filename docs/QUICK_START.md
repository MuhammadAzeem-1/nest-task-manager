# Quick Start Guide - Task Manager API

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
Make sure you have a `.env` file with your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_manager_db?schema=public"
```

Then run:
```bash
npx prisma generate
npx prisma db push
```

### Step 3: Start the Server
```bash
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000
```

---

## ✅ Test Your API

Open Postman and create a task:

**POST** `http://localhost:3000/tasks`

Body (JSON):
```json
{
  "title": "My First Task"
}
```

You should get a response like:
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "My First Task",
    "description": "",
    "status": "IN_PROGRESS",
    "createdAt": "2025-10-08T...",
    "updatedAt": "2025-10-08T..."
  },
  "error": null,
  "message": "Task created successfully"
}
```

---

## 📚 All Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

---

## 📖 Full Documentation

For detailed API documentation with all request/response examples, see:
**[TASK_API_TESTING_GUIDE.md](./TASK_API_TESTING_GUIDE.md)**

---

## 🔍 Verify Setup

1. **Check if server is running:**
   - Open browser: `http://localhost:3000`
   - You should see a response (the default app controller)

2. **Check database connection:**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio at `http://localhost:5555`

3. **View logs:**
   - The console will show all API requests and responses
   - Look for `TasksService` logs for debugging

---

## 🛠️ Troubleshooting

**Problem:** Database connection error
```bash
# Verify Prisma can connect
npx prisma db push
```

**Problem:** Port already in use
```bash
# Change PORT in .env
PORT=3001
```

**Problem:** Module not found
```bash
# Regenerate Prisma client
npx prisma generate
# Rebuild the project
npm run build
```

---

## 📦 What's Implemented

✅ Complete CRUD operations for tasks  
✅ Input validation (title required, status enum)  
✅ Error handling with proper HTTP codes  
✅ Logging for debugging  
✅ TypeScript type safety  
✅ Prisma ORM integration  
✅ Global exception filter  

---

## 🎯 Task Status Values

Only these values are accepted for `status`:
- `IN_PROGRESS` (default)
- `COMPLETED`
- `CANCELLED`

---

## 💡 Example Requests

### Create Task (Minimal)
```json
{
  "title": "Learn NestJS"
}
```

### Create Task (Full)
```json
{
  "title": "Learn NestJS",
  "description": "Complete the official tutorial",
  "status": "IN_PROGRESS"
}
```

### Update Task (Partial)
```json
{
  "status": "COMPLETED"
}
```

---

**Happy Coding! 🎉**

