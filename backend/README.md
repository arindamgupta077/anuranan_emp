# Anuranan Backend API

Express.js + TypeScript backend for Anuranan Employee Portal.

## Quick Start

### Install Dependencies
```powershell
npm install
```

### Configure Environment
Copy `.env.example` to `.env` and fill in your Supabase credentials.

### Run Development Server
```powershell
npm run dev
```

Server will start on `http://localhost:4000`

### Build for Production
```powershell
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── server.ts           # Main application entry
│   ├── lib/
│   │   └── supabase.ts    # Supabase client configuration
│   ├── middleware/
│   │   └── auth.ts        # Authentication & authorization
│   ├── routes/
│   │   ├── auth.ts        # Login, logout, profile
│   │   ├── tasks.ts       # Task CRUD operations
│   │   ├── selfTasks.ts   # Self-task management
│   │   ├── leaves.ts      # Leave requests
│   │   ├── admin.ts       # Employee management (CEO only)
│   │   └── reports.ts     # Analytics & reporting
│   └── jobs/
│       └── recurring.ts   # Cron job for recurring tasks
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List tasks (filtered, paginated)
- `POST /api/tasks` - Create task (CEO only)
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task (CEO only)

### Self Tasks
- `GET /api/self-tasks` - List self tasks
- `POST /api/self-tasks` - Create self task
- `PATCH /api/self-tasks/:id` - Update self task
- `DELETE /api/self-tasks/:id` - Delete self task

### Leaves
- `GET /api/leaves` - List leave requests
- `POST /api/leaves` - Create leave request
- `PATCH /api/leaves/:id` - Update leave request
- `DELETE /api/leaves/:id` - Delete leave request

### Admin (CEO Only)
- `GET /api/admin/employees` - List all employees
- `GET /api/admin/roles` - List all roles
- `POST /api/admin/employees` - Create employee
- `PATCH /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Deactivate employee
- `POST /api/admin/employees/:id/reset-password` - Reset password

### Reports (CEO Only)
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/performance` - Employee performance
- `GET /api/reports/tasks-summary` - Task summary
- `GET /api/reports/recurring-tasks` - Recurring task compliance
- `GET /api/reports/leaves-summary` - Leave statistics

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_access_token>
```

The token is obtained from Supabase authentication.

## Middleware

### verifySupabaseAuth
Validates JWT token and fetches employee record.

### requireRole(['CEO'])
Restricts endpoint access to specific roles.

## Recurring Tasks Job

The cron job (`src/jobs/recurring.ts`) runs daily (configurable via `CRON_SCHEDULE`):
- Checks all active recurring task rules
- Spawns new tasks based on schedule (weekly/monthly)
- Updates `last_spawned` timestamp to prevent duplicates

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (backend only) | `eyJhbGci...` |
| `SUPABASE_ANON_KEY` | Anonymous key | `eyJhbGci...` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `CRON_SCHEDULE` | Cron schedule expression | `0 2 * * *` (2 AM daily) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents abuse
- **JWT Verification** - Supabase token validation
- **Role-Based Access Control** - Endpoint protection
- **Input Validation** - Request data validation

## Error Handling

Errors are returned in JSON format:

```json
{
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

## Development

### Running Tests
```powershell
npm test
```

### Linting
```powershell
npm run lint
```

### Type Checking
```powershell
npm run type-check
```

## Deployment

### Heroku
```powershell
heroku create anuranan-api
heroku config:set SUPABASE_URL=your-url
# ... set other environment variables
git push heroku main
```

### Railway
```powershell
railway init
railway up
# Configure environment variables in Railway dashboard
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Monitoring

- Check `/health` endpoint for server status
- Monitor server logs for errors
- Watch cron job execution logs

## Support

For issues or questions, please open an issue on GitHub.
