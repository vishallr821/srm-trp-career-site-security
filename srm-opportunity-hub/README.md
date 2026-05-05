# SRM TRP Opportunity Hub

A centralized placement and opportunity portal for SRM TRP students to discover top hackathons, elite internships, and core domain contests.

## ⚠️ Security Update (v2.0)

This version includes **critical security hardening**:
- ✅ HttpOnly cookies for authentication (no localStorage)
- ✅ Input validation + sanitization on all endpoints
- ✅ Rate limiting on auth endpoints
- ✅ Security headers (Helmet) + CORS configuration
- ✅ Structured error logging + request IDs
- ✅ User/profile consistency enforcement
- ✅ CSRF protection ready

## Prerequisites
- Node.js 18+
- npm (Node Package Manager)
- A Supabase Account
- A terminal/command line

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd srm-opportunity-hub
```

### 2. Install dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Configure Environment Variables

**Server Configuration** (create `server/.env`):
```env
# Core
NODE_ENV=development
PORT=5000

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars

# Security
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Rate Limiting (optional - uses defaults if not set)
AUTH_RATE_WINDOW_MS=900000
AUTH_RATE_MAX=5
GLOBAL_RATE_WINDOW_MS=900000
GLOBAL_RATE_MAX=100
```

**Client Configuration** (create `client/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

### 4. Database Setup
1. Log into your Supabase project
2. Open the SQL Editor
3. Run the schema setup script to create:
   - `profiles` table
   - `hackathons` table
   - `internships` table
   - `contests` table
   - `bookmarks` table

### 5. Seed the Database
```bash
cd server
node seed.js
cd ..
```

### 6. Start the Application

**Development Mode** (both frontend and backend):
```bash
npm run dev
```

**Or run separately:**

Terminal 1 (Frontend):
```bash
cd client
npm run dev
```

Terminal 2 (Backend):
```bash
cd server
node index.js
```

## Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Environment Variables Explained

### Server (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `SUPABASE_URL` | Supabase project URL | From Supabase dashboard |
| `SUPABASE_SERVICE_KEY` | Service role key (KEEP SECRET) | From Supabase dashboard |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-secret-key` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:5173,https://yourdomain.com` |
| `AUTH_RATE_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `AUTH_RATE_MAX` | Max auth attempts per window | `5` |
| `GLOBAL_RATE_WINDOW_MS` | Global rate limit window | `900000` |
| `GLOBAL_RATE_MAX` | Max requests per window | `100` |

### Client (.env)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key (safe to expose) |
| `VITE_API_URL` | Backend API URL |

## 🔐 Security Features

### Authentication
- JWT tokens stored in **HttpOnly, Secure cookies** (not localStorage)
- 1-day token expiration
- Automatic session validation on app load
- Protected routes with role-based access control

### Input Validation
- All endpoints validate input with express-validator
- Email format validation
- Password strength requirements (min 8 chars)
- Enum validation for departments and types
- Length limits on all string inputs

### Rate Limiting
- Auth endpoints: 5 attempts per 15 minutes
- Global API: 100 requests per 15 minutes
- Clear error messages on rate limit exceeded
- **Production Note**: Current implementation uses in-memory store. For multi-instance deployments:
  - Install Redis rate limiting adapter: `npm install rate-limit-redis redis`
  - Set `REDIS_URL` environment variable
  - Update rate limiter initialization in `server/index.js` to use Redis store
  - See [express-rate-limit documentation](https://github.com/nfriedly/express-rate-limit#store) for setup

### CSRF Protection
- Double-submit CSRF token pattern
- Token issued on `GET /api/csrf-token` and stored in sessionStorage
- Token validated on all state-changing requests (POST, PUT, DELETE)
- Tokens single-use (deleted after validation)
- Validated in headers: `X-CSRF-Token` for API calls
- Protection applied to: bookmarks, admin operations

### Security Headers
- Helmet.js enabled for security headers
- CSP strategy: Currently disabled for compatibility with SPA build output containing inline scripts
  - Production rollout: Enable `Content-Security-Policy-Report-Only` header first to collect violation reports
  - Once reports validated, enforce strict CSP with `script-src 'self'`, `style-src 'self'`, `img-src 'self' https:`, etc.
  - Timeline: Review CSP violations in logs, update framework configuration for nonce injection support, then enable enforcement
- X-Frame-Options, X-Content-Type-Options enabled
- CORS strictly configured per environment
- `X-Powered-By` header disabled

### Logging & Monitoring
- Structured logging with Pino
- Request IDs included in all responses
- **Sensitive data redaction**: Passwords, authorization headers, cookies, and CSRF tokens automatically redacted from logs
- Error logging without exposing sensitive data
- HTTP request logging

### Error Handling
- Centralized error handler
- Standardized error response format
- No stack traces in production
- Validation error details provided safely

## Scripts

```bash
# Development (both client and server)
npm run dev

# Build frontend
cd client && npm run build

# Lint frontend
cd client && npm run lint

# Seed database
cd server && node seed.js
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Update `ALLOWED_ORIGINS` with production domain
- [ ] Set `SUPABASE_SERVICE_KEY` to production key
- [ ] Ensure `VITE_API_URL` points to production API
- [ ] Use HTTPS for `ALLOWED_ORIGINS`
- [ ] Set cookies `secure: true` (automatic in production mode)
- [ ] Verify CSRF protection is enabled on bookmarks and admin routes
- [ ] Verify logging redaction is active (check logs for sensitive data)
- [ ] Configure rate limiting per your capacity (switch to Redis for multi-instance)
- [ ] Set up centralized logging (aggregate logs to external service)
- [ ] Enable HTTPS on all endpoints
- [ ] Configure backup for Supabase database
- [ ] Plan CSP rollout: enable report-only header to collect violations first
- [ ] Set up monitoring and alerting
- [ ] Test CORS restrictions work correctly
- [ ] Test rate limiting is functioning
- [ ] Review all environment variables are set

## API Endpoints (Secured)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `GET /api/csrf-token` - Get CSRF token (if needed)

### Opportunities (Requires Auth)
- `GET /api/hackathons` - Get hackathons with filters
- `GET /api/internships` - Get internships with filters
- `GET /api/contests` - Get contests with filters
- `GET /api/stats` - Get opportunity statistics

### Bookmarks (Requires Auth)
- `GET /api/bookmarks` - Get user's bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:id` - Remove bookmark

### Admin (Requires Admin Role)
- `POST /api/admin/hackathons` - Create hackathon
- `PUT /api/admin/hackathons/:id` - Update hackathon
- `DELETE /api/admin/hackathons/:id` - Delete hackathon
- (Same for internships and contests)

## Query Filters

### Opportunity Filters
```bash
GET /api/hackathons?dept=cse&level=national&search=AI
```
- `dept`: `cse`, `ece`, `eee`, `mech`, `civil`, `all`
- `level`: `national`, `international`, `all`
- `search`: Text search in name, org, focus

## Troubleshooting

### "Session expired" on page reload
- Browser may be blocking cookies - check cookie settings
- Ensure `VITE_API_URL` matches server URL exactly
- Check `ALLOWED_ORIGINS` includes frontend URL with protocol

### Rate limit errors
- Wait 15 minutes before retrying
- Adjust `AUTH_RATE_MAX` if needed (in production, consider analytics)

### Validation errors
- Check error response for details: `error.details[0].field`
- Ensure department is valid enum value
- Password must be 8+ characters

### CORS errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL with protocol
- Check browser console for exact origin being sent
- Restart server after changing .env

### Supabase connection fails
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase project is active
- Ensure tables exist with correct schema

## Monitoring & Logs

Logs appear in console during development. For production:
1. Redirect stdout to file or logging service
2. Monitor for `error` level logs
3. Track request IDs for debugging
4. Set up alerts for high error rates or rate limit hits

## Support & Contributing

For issues or security concerns, please open a GitHub issue or contact the team.

---

**Last Updated**: May 5, 2026  
**Version**: 2.0 (Security Hardened)
