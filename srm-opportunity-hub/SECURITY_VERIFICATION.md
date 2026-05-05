# Security Verification Guide

This document provides curl commands to verify all security implementations are working correctly.

## Prerequisites

```bash
# Set variables for easier testing
export API_URL="http://localhost:5000"
export CLIENT_URL="http://localhost:5173"
export COOKIE_JAR="/tmp/cookies.txt"

# Clear cookies file
rm -f $COOKIE_JAR
```

## Test 1: User Registration with Input Validation

**Test**: Verify registration validates all fields and returns standardized errors

```bash
# Test 1a: Missing email
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePassword123",
    "full_name": "John Doe",
    "department": "cse",
    "year": 2
  }' \
  -c $COOKIE_JAR

# Expected: 400 with error.code = 'VALIDATION_ERROR', details includes email error

# Test 1b: Password too short
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Short1",
    "full_name": "Jane Smith",
    "department": "ece",
    "year": 1
  }' \
  -c $COOKIE_JAR

# Expected: 400 with error about password length

# Test 1c: Valid registration
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123",
    "full_name": "Test User",
    "department": "cse",
    "year": 2
  }' \
  -c $COOKIE_JAR

# Expected: 201 with user data in response (NO token in body)
# Check Set-Cookie header should be present with HttpOnly flag
# Response should include: { user: { id, email, full_name, department, year, role } }
```

**Verification Points**:
- ✅ Validation errors include field-level details
- ✅ Response includes requestId
- ✅ No token in response body
- ✅ Set-Cookie header includes HttpOnly flag

---

## Test 2: Cookie-Based Authentication

**Test**: Verify JWT stored in HttpOnly cookie with correct flags

```bash
# Test 2a: Login and capture cookie
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123"
  }' \
  -v \
  -c $COOKIE_JAR

# Expected: 
# - Response: 200 with user data (NO token in body)
# - Set-Cookie header with: HttpOnly; Secure (if https); SameSite=Lax; Path=/; Max-Age=86400
# - Cookie stored in jar file

# Test 2b: Verify session without token in body
curl -X GET "$API_URL/api/auth/me" \
  -b $COOKIE_JAR

# Expected: 200 with user profile data
```

**Verification Points**:
- ✅ JWT stored in HttpOnly cookie (cannot be accessed via JavaScript)
- ✅ SameSite=Lax prevents CSRF from external sites
- ✅ Path=/ restricts cookie to root
- ✅ maxAge=86400 sets 1-day expiration
- ✅ Secure flag set in production

---

## Test 3: CSRF Token Protection

**Test**: Verify CSRF tokens prevent state-changing requests without valid token

```bash
# Test 3a: Fetch CSRF token
CSRF_TOKEN=$(curl -s -X GET "$API_URL/api/csrf-token" \
  -b $COOKIE_JAR \
  | jq -r '.csrfToken')

echo "CSRF Token: $CSRF_TOKEN"

# Expected: UUID format token (36 characters, with dashes)

# Test 3b: Create bookmark WITHOUT CSRF token (should fail)
curl -X POST "$API_URL/api/bookmarks" \
  -H "Content-Type: application/json" \
  -b $COOKIE_JAR \
  -d '{
    "opportunity_id": "hack-001",
    "opportunity_type": "hackathon"
  }'

# Expected: 403 with error.code = 'CSRF_ERROR'

# Test 3c: Create bookmark WITH valid CSRF token (should succeed)
curl -X POST "$API_URL/api/bookmarks" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_JAR \
  -d '{
    "opportunity_id": "hack-001",
    "opportunity_type": "hackathon"
  }'

# Expected: 201 with bookmark data

# Test 3d: Reuse expired token (should fail - single-use)
curl -X POST "$API_URL/api/bookmarks" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_JAR \
  -d '{
    "opportunity_id": "hack-002",
    "opportunity_type": "hackathon"
  }'

# Expected: 403 with error.code = 'CSRF_ERROR'
```

**Verification Points**:
- ✅ CSRF token has UUID format
- ✅ POST without token returns 403
- ✅ POST with valid token succeeds
- ✅ Token is single-use (reuse fails)

---

## Test 4: Rate Limiting

**Test**: Verify rate limiting on auth endpoints

```bash
# Test 4a: Exceed auth rate limit (5 attempts per 15 minutes)
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "WrongPassword"
    }' | jq '.error.code'
done

# Expected: 
# - Attempts 1-5: 401 (VALIDATION_ERROR or AUTH_FAILED)
# - Attempt 6: 429 (RATE_LIMIT_ERROR) with message "Too many requests"

# Test 4b: Global rate limit (100 requests per 15 minutes)
for i in {1..102}; do
  curl -s -X GET "$API_URL/api/auth/me" \
    -b $COOKIE_JAR > /dev/null
  [ $((i % 20)) -eq 0 ] && echo "Completed $i requests"
done

# Expected: After 100 requests, get 429 responses
```

**Verification Points**:
- ✅ Auth endpoint limited to 5 attempts per 15 minutes
- ✅ Rate limit exceeded returns 429 status
- ✅ Global rate limit enforced on all endpoints

---

## Test 5: Input Validation on Queries

**Test**: Verify query parameter validation and SQL injection protection

```bash
# Test 5a: Valid query (should succeed)
curl -s -X GET "$API_URL/api/hackathons?level=national&dept=cse&search=web" \
  -b $COOKIE_JAR | jq '.[] | {name, level}' | head -5

# Expected: 200 with hackathon data

# Test 5b: Invalid department (should fail)
curl -s -X GET "$API_URL/api/hackathons?dept=invalid_dept" \
  -b $COOKIE_JAR

# Expected: 400 with error.code = 'VALIDATION_ERROR'

# Test 5c: Oversized search query (should fail)
LONG_SEARCH=$(python3 -c "print('a' * 101)")
curl -s -X GET "$API_URL/api/hackathons?search=$LONG_SEARCH" \
  -b $COOKIE_JAR

# Expected: 400 with error about search length
```

**Verification Points**:
- ✅ Valid queries succeed
- ✅ Invalid enum values rejected
- ✅ Oversized inputs rejected
- ✅ SQL injection attempts sanitized

---

## Test 6: CORS Protection

**Test**: Verify CORS rejects requests from disallowed origins

```bash
# Test 6a: Request from localhost (allowed)
curl -s -X GET "$API_URL/api/auth/me" \
  -H "Origin: http://localhost:5173" \
  -b $COOKIE_JAR

# Expected: 200 with user data

# Test 6b: Request from disallowed origin
curl -s -X GET "$API_URL/api/auth/me" \
  -H "Origin: http://attacker.com" \
  -b $COOKIE_JAR

# Expected: CORS error or 403 with error.code = 'CORS_ERROR'
```

**Verification Points**:
- ✅ Allowed origins accepted
- ✅ Disallowed origins rejected

---

## Test 7: Session Persistence and Logout

**Test**: Verify session persists and logout clears authentication

```bash
# Test 7a: Get user with valid session
curl -s -X GET "$API_URL/api/auth/me" \
  -b $COOKIE_JAR | jq '.id'

# Expected: User ID

# Test 7b: Logout
curl -s -X POST "$API_URL/api/auth/logout" \
  -b $COOKIE_JAR

# Expected: 200 with { message: "Logged out successfully" }

# Test 7c: Attempt to use session after logout
curl -s -X GET "$API_URL/api/auth/me" \
  -b $COOKIE_JAR

# Expected: 401 with error.code = 'INVALID_TOKEN' or session-not-found
```

**Verification Points**:
- ✅ Session valid until logout
- ✅ Logout clears cookie
- ✅ Subsequent requests unauthorized

---

## Test 8: Admin Route Protection

**Test**: Verify admin routes require role=admin

```bash
# Test 8a: Attempt admin operation as student (should fail)
CSRF_TOKEN=$(curl -s -X GET "$API_URL/api/csrf-token" \
  -b $COOKIE_JAR | jq -r '.csrfToken')

curl -s -X POST "$API_URL/api/admin/hackathons" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_JAR \
  -d '{
    "name": "Test Hackathon",
    "org": "Test Org",
    "level": "national",
    "depts": ["all"]
  }'

# Expected: 403 with error.code about admin access
```

**Verification Points**:
- ✅ Non-admin users cannot access admin endpoints
- ✅ Admin endpoints require CSRF token

---

## Test 9: Request ID Tracking

**Test**: Verify all responses include requestId

```bash
curl -s -X GET "$API_URL/api/auth/me" \
  -b $COOKIE_JAR | jq '.requestId'

# Expected: UUID format string

# Test 9b: Check error responses include requestId
curl -s -X GET "$API_URL/api/invalid-endpoint" \
  -b $COOKIE_JAR | jq '.error.requestId'

# Expected: UUID format string
```

**Verification Points**:
- ✅ All responses include requestId
- ✅ RequestId has UUID format

---

## Test 10: Error Handling

**Test**: Verify errors are standardized and don't leak sensitive info

```bash
# Test 10a: 404 error
curl -s -X GET "$API_URL/api/nonexistent" \
  -b $COOKIE_JAR | jq '.'

# Expected: { error: { message: "...", code: "...", requestId: "..." } }
# NOT: stack trace or internal details

# Test 10b: Validation error
curl -s -X POST "$API_URL/api/bookmarks" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: valid-token" \
  -b $COOKIE_JAR \
  -d '{}'

# Expected: { error: { message: "...", code: "VALIDATION_ERROR", details: [...], requestId: "..." } }
```

**Verification Points**:
- ✅ Error format is standardized
- ✅ No stack traces in responses
- ✅ Details only for client-side errors (validation)

---

## Security Audit Checklist

Use these commands to generate a comprehensive security report:

```bash
# 1. Check security headers
curl -I -X GET "$API_URL/api/auth/me" -b $COOKIE_JAR | grep -i "x-frame-options\|x-content-type\|strict-transport"

# 2. Check CORS headers
curl -I -H "Origin: http://localhost:5173" "$API_URL/api/auth/me" | grep -i "access-control"

# 3. Verify no token in localStorage (inspect client)
# In browser console: console.log(localStorage)

# 4. Check cookie flags
curl -v -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}' 2>&1 | grep -i "set-cookie"

# Expected: HttpOnly; Secure (or in production); SameSite=Lax; Path=/
```

---

## Quick Smoke Test Script

```bash
#!/bin/bash

echo "Running security smoke tests..."

API_URL="http://localhost:5000"
CLIENT_URL="http://localhost:5173"
COOKIE_JAR="/tmp/smoke_cookies.txt"
rm -f $COOKIE_JAR

# 1. Registration
echo "✓ Testing registration..."
curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -c $COOKIE_JAR \
  -d '{"email":"smoke@test.com","password":"TestPass123","full_name":"Smoke Test","department":"cse","year":1}' | grep -q "user" && echo "  ✓ Registration passed"

# 2. CSRF Token
echo "✓ Testing CSRF token..."
TOKEN=$(curl -s -X GET "$API_URL/api/csrf-token" -b $COOKIE_JAR | jq -r '.csrfToken')
[ ! -z "$TOKEN" ] && echo "  ✓ CSRF token generated: ${TOKEN:0:8}..."

# 3. Bookmarks with CSRF
echo "✓ Testing CSRF protection..."
curl -s -X POST "$API_URL/api/bookmarks" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -b $COOKIE_JAR \
  -d '{"opportunity_id":"test-1","opportunity_type":"hackathon"}' | grep -q "201\|opportunity_id" && echo "  ✓ Bookmark creation passed"

# 4. Rate limit
echo "✓ Testing rate limiting..."
for i in {1..5}; do
  curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
done

echo "✓ All smoke tests completed"
```

---

## Production Verification

Before deploying to production, verify:

```bash
# 1. HTTPS enabled
curl -I https://api.example.com/api/auth/me | grep -i "strict-transport-security"

# 2. Production credentials
env | grep -E "NODE_ENV|JWT_SECRET|SUPABASE"

# 3. Rate limiting with Redis
redis-cli INFO stats | grep total_commands_processed

# 4. Log redaction working
grep -v "\[REDACTED\]" server.log | grep -i "password\|token\|cookie" && echo "WARNING: Sensitive data in logs!"

# 5. Monitoring active
curl -s http://monitoring.example.com/health
```

