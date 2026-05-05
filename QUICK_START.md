# Quick Start - Security Hardened Version

**Estimated time to get running**: 10-15 minutes

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version   # Should be v18.0.0 or higher
npm --version    # Should be 8.0.0 or higher
```

## Step 1: Install Dependencies (2 min)

```bash
cd "d:\Vishal-Project\Websites\New folder\srm-trp-career-site\srm-opportunity-hub"

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

Expected output: ✅ All packages installed

## Step 2: Create Environment Files (3 min)

### Server Configuration

Create `server/.env`:
```env
# Copy this EXACTLY
NODE_ENV=development
PORT=5000
SUPABASE_URL=your_actual_supabase_url_here
SUPABASE_SERVICE_KEY=your_actual_service_key_here
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
ALLOWED_ORIGINS=http://localhost:5173
```

⚠️ **IMPORTANT**: Replace these with your actual Supabase credentials:
- Get `SUPABASE_URL` from Supabase dashboard → Settings → API
- Get `SUPABASE_SERVICE_KEY` from Supabase dashboard → Settings → API (role: Service)
- Create `JWT_SECRET`: Use strong random string (32+ chars)

### Client Configuration

Create `client/.env`:
```env
VITE_SUPABASE_URL=your_actual_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
VITE_API_URL=http://localhost:5000
```

## Step 3: Database Setup (2 min)

In Supabase dashboard → SQL Editor:

```sql
-- Run this SQL to create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  department VARCHAR(50),
  year INTEGER,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hackathons (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  org VARCHAR(255),
  depts TEXT[],
  level VARCHAR(50),
  cat VARCHAR(50),
  focus TEXT,
  date VARCHAR(255),
  rounds TEXT[],
  prize VARCHAR(255),
  perks TEXT,
  winners JSONB,
  link VARCHAR(500),
  jobs BOOLEAN
);

CREATE TABLE IF NOT EXISTS internships (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  org VARCHAR(255),
  depts TEXT[],
  level VARCHAR(50),
  cat VARCHAR(50),
  focus TEXT,
  date VARCHAR(255),
  link VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS contests (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  org VARCHAR(255),
  depts TEXT[],
  level VARCHAR(50),
  cat VARCHAR(50),
  focus TEXT,
  date VARCHAR(255),
  link VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id VARCHAR(100) NOT NULL,
  opportunity_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, opportunity_id)
);
```

## Step 4: Seed Database (2 min)

```bash
cd server
node seed.js
# Wait for seeding to complete
cd ..
```

Expected output: ✅ Database seeded with hackathons, internships, contests

## Step 5: Start the Application (3 min)

### Option A: Start Both (Recommended)

Terminal 1:
```bash
npm run dev
# This starts both frontend on 5173 and backend on 5000
```

### Option B: Start Separately

Terminal 1 (Backend):
```bash
cd server
node index.js
# Wait for: "Server started on port 5000"
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Wait for: "http://localhost:5173"
```

## Step 6: Test the Application (5 min)

Open browser to: **http://localhost:5173**

### Test 1: Register New User
1. Click "Register"
2. Fill form:
   - Email: `test@example.com`
   - Password: `SecurePassword123`
   - Name: `Test User`
   - Department: `CSE`
   - Year: `1`
3. Click "Register"
4. ✅ Should see: Dashboard with opportunities

### Test 2: Check Security (Cookies)
1. Open DevTools (F12) → Application → Cookies → localhost:5000
2. ✅ Should see: `access_token` cookie with HttpOnly flag
3. ❌ Should NOT see: Token in localStorage

### Test 3: Session Persistence
1. Refresh page (F5)
2. ✅ Should still be logged in (no redirect to login)

### Test 4: Rate Limiting
1. Open DevTools → Console
2. In terminal 1, stop the backend (Ctrl+C)
3. Run from terminal 2:
```bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nAttempt $i: %{http_code}\n" \
    -s | tail -1
done
```
4. ✅ Should see: 401, 401, 401, 401, 401, **429** (rate limited)

### Test 5: Input Validation
Open DevTools → Console, run:
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'not-an-email',  // Invalid!
    password: 'short',       // Too short!
    full_name: 'T',          // Too short!
    department: 'invalid',   // Invalid!
    year: 10                 // Out of range!
  })
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
```
4. ✅ Should see: 400 error with validation details

### Test 6: Logout
1. In UI, click "Logout" button
2. ✅ Should be redirected to login
3. In DevTools → Cookies: ✅ access_token should be cleared

## Troubleshooting

### "Cannot find module" Error
**Solution**: Run `npm install` in the failing directory
```bash
# If server error:
cd server && npm install

# If client error:
cd client && npm install
```

### "SUPABASE_URL is not defined"
**Solution**: Check .env files exist with correct values
```bash
# Check server/.env exists
ls server/.env

# Check client/.env exists
ls client/.env

# File should have values, not be empty
cat server/.env | grep SUPABASE_URL
```

### "Port 5000/5173 already in use"
**Solution**: Kill existing process or use different port
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Or change PORT in server/.env
# PORT=5001
```

### Database connection fails
**Solution**: Verify Supabase credentials
```bash
# In server/.env, check:
# - SUPABASE_URL matches your project URL (no trailing slash)
# - SUPABASE_SERVICE_KEY is from "Service Role Key" not "Anonymous Key"
# - Both have actual values, not "your_..." placeholder
```

### Cookies not persisting
**Solution**: Check CORS and credentials
```bash
# In browser DevTools:
# 1. Check Network tab → Request headers have "Cookie: access_token=..."
# 2. Check Response headers have "Set-Cookie: access_token=..."
# 3. If missing, restart backend with correct ALLOWED_ORIGINS
```

### "CORS error" message
**Solution**: Update ALLOWED_ORIGINS if not on localhost
```bash
# If frontend is on different origin:
# server/.env
ALLOWED_ORIGINS=http://localhost:5173,http://your-domain.com
```

## What's New (Security Changes)

✅ **Cookies instead of localStorage** - More secure  
✅ **Input validation** - Prevents invalid data  
✅ **Rate limiting** - Stops brute force attacks  
✅ **Security headers** - Browser-level protection  
✅ **Better error messages** - Helps debugging  
✅ **Request IDs** - Trace issues easily  
✅ **Structured logging** - Monitor server health  
✅ **CSRF protection** - Ready to use  

## API Examples

All these endpoints now have security:

```bash
# Get CSRF token (if needed)
curl http://localhost:5000/api/csrf-token

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "full_name": "User Name",
    "department": "cse",
    "year": 1
  }' \
  -c cookies.txt

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePassword123"}' \
  -b cookies.txt

# Get opportunities (with cookie)
curl http://localhost:5000/api/hackathons \
  -b cookies.txt

# Get specific hackathons
curl "http://localhost:5000/api/hackathons?dept=cse&level=national" \
  -b cookies.txt

# Add bookmark
curl -X POST http://localhost:5000/api/bookmarks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"opportunity_id": "h1", "opportunity_type": "hackathon"}'

# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

## Next Steps

1. ✅ Verify all tests pass above
2. ⏳ Read `SECURITY_QUICK_REFERENCE.md` to understand changes
3. ⏳ Run full test suite from `SECURITY_IMPLEMENTATION_CHECKLIST.md`
4. ⏳ Review `README.md` for production deployment
5. ⏳ Deploy to staging/production with security checklist

## Documentation Files

1. **README.md** - Full setup + API documentation
2. **SECURITY_QUICK_REFERENCE.md** - Before/after code examples
3. **SECURITY_IMPLEMENTATION_CHECKLIST.md** - Full testing procedures
4. **SECURITY_HARDENING_SUMMARY.md** - Implementation summary
5. **PROJECT_ANALYSIS_REPORT.md** - Original analysis (unchanged)

---

**Time to working app**: ~15 minutes  
**Ready for testing**: ✅ Yes  
**Ready for production**: ⏳ After full checklist  

Good luck! 🚀
