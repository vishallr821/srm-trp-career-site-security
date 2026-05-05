require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { body, validationResult, query } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// ─── SETUP: Logger ───
const logger = pino({
  redact: {
    paths: [
      'req.body.password',
      'req.body.token',
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-csrf-token"]',
      'res.headers["set-cookie"]',
      'error.password',
      'password'
    ],
    remove: false, // Replace with '[REDACTED]' instead of removing
  },
});
const httpLogger = pinoHttp({ logger });

const app = express();
app.set('trust proxy', 1);

// ─── SETUP: Security Headers ───
app.disable('x-powered-by');
app.use(helmet({
  // CSP disabled for now due to inline scripts in SPA build output.
  // Production strategy: Implement CSP report-only mode first to collect violations
  // before enforcing strict policy. Update CSP when framework supports nonce injection.
  // See: README.md #Security Headers section for CSP rollout plan.
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ─── SETUP: Request Logging ───
app.use(httpLogger);

// ─── SETUP: Body Parser & CORS ───
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ limit: '200kb', extended: true }));
app.use(cookieParser());

// Parse ALLOWED_ORIGINS from environment
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, 'CORS rejected origin');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ─── SETUP: Rate Limiting ───
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_WINDOW_MS || 15 * 60 * 1000),
  max: parseInt(process.env.AUTH_RATE_MAX || 5),
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.GLOBAL_RATE_WINDOW_MS || 15 * 60 * 1000),
  max: parseInt(process.env.GLOBAL_RATE_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET', // GET requests less strict
});

app.use(globalLimiter);

// ─── SETUP: Request ID Middleware ───
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ─── SETUP: Error Response Helper ───
const sendError = (res, statusCode, message, code = 'ERROR', requestId = null) => {
  res.status(statusCode).json({
    error: {
      message,
      code,
      requestId,
    },
  });
};

// ─── SETUP: Validation Error Handler ───
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array().map(e => ({ field: e.param, message: e.msg })),
        requestId: req.id,
      },
    });
  }
  return null;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('CRITICAL: Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// TEMP LOG: expose whether service key is present and its length (avoid printing the key)
logger.info(
  { hasServiceKey: !!supabaseKey, serviceKeyLen: supabaseKey?.length },
  'Supabase env check'
);

// Log the decoded role of the Supabase key (safe: role and issuer only, no sensitive data)
try {
  const decoded = jwt.decode(supabaseKey);
  logger.info({ supabaseKeyRole: decoded?.role, supabaseKeyIssuer: decoded?.iss }, 'Supabase key role check');
} catch (e) {
  logger.warn({ error: e?.message }, 'Could not decode Supabase key');
}

const allowedEmailDomain = (process.env.ALLOWED_EMAIL_DOMAIN || 'trp.srmtrichy.edu.in').toLowerCase();

// Disable caching for API responses (dynamic data; avoid stale 304/ETag issues)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ─── CSRF TOKEN ENDPOINT ───
app.get('/api/csrf-token', (req, res) => {
  const token = uuidv4();
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('csrf_token', token, {
    httpOnly: false, // Must be readable by JS for double-submit pattern
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.json({ csrfToken: token });
});

// ─── CSRF Middleware (double-submit cookie) ───
const requireCsrf = (req, res, next) => {
  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return sendError(res, 403, 'Invalid or missing CSRF token', 'CSRF_ERROR', req.id);
  }
  next();
};

// ─── AUTH ROUTES ───
app.post('/api/auth/register', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('department')
    .isIn(['cse', 'ece', 'eee', 'mech', 'civil'])
    .withMessage('Invalid department'),
  body('year')
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  body('role')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['student', 'admin'])
    .withMessage('Invalid role'),
], async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { email, password, full_name, department, year, role } = req.body;
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (emailDomain !== allowedEmailDomain) {
      return sendError(
        res,
        400,
        'Registration is restricted to TRP SRM Trichy email IDs (@trp.srmtrichy.edu.in).',
        'DOMAIN_RESTRICTED',
        req.id
      );
    }

    // TEMP: admin self-registration is enabled for bootstrapping; remove later
    const resolvedRole = role === 'admin' ? 'admin' : 'student';

    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      logger.warn({ email, error: authError.message }, 'Auth creation failed');
      return sendError(res, 400, authError.message, 'AUTH_CREATION_FAILED', req.id);
    }

    const userId = authData.user.id;

    // 2. Upsert into public.profiles to make registration idempotent.
    // Using upsert on `id` prevents duplicate primary-key failures if the
    // profile row already exists (e.g. retry or race conditions).
    const profileRow = {
      id: userId,
      email,
      full_name,
      department,
      year,
      role: resolvedRole
    };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileRow, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      // Log the detailed error server-side (with request id) but don't leak internals to client
      logger.error({ userId, email, error: profileError }, 'Profile upsert failed');

      // Detect uniqueness/constraint violations (best-effort). Map to 409.
      const msg = String(profileError.message || '').toLowerCase();
      const isUniqueConstraint = msg.includes('unique') || msg.includes('duplicate') || (profileError.code && String(profileError.code) === '23505');

      // Attempt to rollback the created auth user for non-idempotent failures.
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (deleteErr) {
        logger.error({ userId, deleteErr }, 'Failed to rollback auth user after profile upsert error');
      }

      if (isUniqueConstraint) {
        return sendError(res, 409, 'Profile conflict: an account with this email already exists', 'PROFILE_CONFLICT', req.id);
      }

      return sendError(res, 500, 'Profile creation failed', 'PROFILE_CREATION_FAILED', req.id);
    }

    // 3. Generate JWT
    const tokenPayload = {
      id: userId,
      email: profileData.email,
      role: profileData.role,
      department: profileData.department
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set HttpOnly, Secure cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    logger.info({ userId, email }, 'User registered successfully');
    res.status(201).json({
      user: {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        department: profileData.department,
        year: profileData.year,
        role: profileData.role,
      },
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Register endpoint error');
    sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR', req.id);
  }
});

app.post('/api/auth/login', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { email, password } = req.body;

    // Verify with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      logger.warn({ email }, 'Login failed');
      return sendError(res, 401, 'Invalid email or password', 'AUTH_FAILED', req.id);
    }

    const userId = authData.user.id;

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      logger.error({ userId, email }, 'Profile not found after auth');
      return sendError(res, 500, 'User profile not found', 'PROFILE_NOT_FOUND', req.id);
    }

    // Generate custom JWT
    const tokenPayload = {
      id: userId,
      email: profileData.email,
      role: profileData.role,
      department: profileData.department
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set HttpOnly, Secure cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    logger.info({ userId, email }, 'User logged in successfully');
    res.json({
      user: {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        department: profileData.department,
        year: profileData.year,
        role: profileData.role,
      },
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Login endpoint error');
    sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR', req.id);
  }
});

app.post('/api/auth/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('access_token', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', path: '/' });
  res.clearCookie('csrf_token', { httpOnly: false, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', path: '/' });
  logger.info('User logged out');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, department, year, role')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      logger.error({ userId: req.user.id }, 'Profile not found in /me endpoint');
      return sendError(res, 404, 'User profile not found', 'PROFILE_NOT_FOUND', req.id);
    }

    res.json(data);
  } catch (err) {
    logger.error({ error: err.message }, '/me endpoint error');
    sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR', req.id);
  }
});

// ─── OPPORTUNITY ROUTES (PROTECTED) ───
const buildOpportunityQuery = (tableName, req) => {
  const { level, search, dept } = req.query;
  let query = supabase.from(tableName).select('*');

  if (level && ['national', 'international'].includes(level)) {
    query = query.eq('level', level);
  }
  
  if (search) {
    const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(
      `name.ilike.%${sanitizedSearch}%,org.ilike.%${sanitizedSearch}%,focus.ilike.%${sanitizedSearch}%`
    );
  }
  
  if (dept && ['cse', 'ece', 'eee', 'mech', 'civil'].includes(dept)) {
    query = query.overlaps('depts', [dept, 'all']);
  }
  
  return query;
};

app.get('/api/hackathons', authenticateToken, [
  query('level')
    .optional()
    .isIn(['national', 'international'])
    .withMessage('Invalid level'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  query('dept')
    .optional()
    .isIn(['cse', 'ece', 'eee', 'mech', 'civil'])
    .withMessage('Invalid department'),
], async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const query = buildOpportunityQuery('hackathons', req);
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    logger.error({ error: err.message }, 'Hackathons query error');
    sendError(res, 500, 'Failed to fetch hackathons', 'QUERY_ERROR', req.id);
  }
});

app.get('/api/internships', authenticateToken, [
  query('level')
    .optional()
    .isIn(['national', 'international'])
    .withMessage('Invalid level'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  query('dept')
    .optional()
    .isIn(['cse', 'ece', 'eee', 'mech', 'civil'])
    .withMessage('Invalid department'),
], async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const query = buildOpportunityQuery('internships', req);
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    logger.error({ error: err.message }, 'Internships query error');
    sendError(res, 500, 'Failed to fetch internships', 'QUERY_ERROR', req.id);
  }
});

app.get('/api/contests', authenticateToken, [
  query('level')
    .optional()
    .isIn(['national', 'international'])
    .withMessage('Invalid level'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  query('dept')
    .optional()
    .isIn(['cse', 'ece', 'eee', 'mech', 'civil'])
    .withMessage('Invalid department'),
], async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const query = buildOpportunityQuery('contests', req);
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    logger.error({ error: err.message }, 'Contests query error');
    sendError(res, 500, 'Failed to fetch contests', 'QUERY_ERROR', req.id);
  }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const { count: hCount } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true });
    const { count: iCount } = await supabase
      .from('internships')
      .select('*', { count: 'exact', head: true });
    const { count: cCount } = await supabase
      .from('contests')
      .select('*', { count: 'exact', head: true });

    res.json({
      total: (hCount || 0) + (iCount || 0) + (cCount || 0),
      hackathons: hCount || 0,
      internships: iCount || 0,
      contests: cCount || 0
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Stats query error');
    sendError(res, 500, 'Failed to fetch stats', 'QUERY_ERROR', req.id);
  }
});
// ─── BOOKMARK ROUTES ───
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    logger.error({ userId: req.user.id, error: err.message }, 'Bookmarks fetch error');
    sendError(res, 500, 'Failed to fetch bookmarks', 'QUERY_ERROR', req.id);
  }
});

app.post('/api/bookmarks', authenticateToken, requireCsrf, [
  body('opportunity_id')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Invalid opportunity ID'),
  body('opportunity_type')
    .trim()
    .isIn(['hackathon', 'internship', 'contest'])
    .withMessage('Invalid opportunity type'),
], async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { opportunity_id, opportunity_type } = req.body;

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: req.user.id,
        opportunity_id,
        opportunity_type
      })
      .select()
      .single();

    if (error) throw error;
    logger.info({ userId: req.user.id, opportunityId: opportunity_id }, 'Bookmark added');
    res.status(201).json(data);
  } catch (err) {
    logger.error({ userId: req.user.id, error: err.message }, 'Bookmark creation error');
    sendError(res, 500, 'Failed to add bookmark', 'DB_ERROR', req.id);
  }
});

app.delete('/api/bookmarks/:opportunity_id', authenticateToken, requireCsrf, async (req, res) => {
  try {
    const { opportunity_id } = req.params;

    if (!opportunity_id || opportunity_id.length > 100) {
      return sendError(res, 400, 'Invalid opportunity ID', 'VALIDATION_ERROR', req.id);
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', req.user.id)
      .eq('opportunity_id', opportunity_id);

    if (error) throw error;
    logger.info({ userId: req.user.id, opportunityId: opportunity_id }, 'Bookmark removed');
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    logger.error({ userId: req.user.id, error: err.message }, 'Bookmark deletion error');
    sendError(res, 500, 'Failed to remove bookmark', 'DB_ERROR', req.id);
  }
});

// ─── ADMIN ROUTES ───
const handleAdminAction = async (req, res, tableName, action) => {
  try {
    const { id } = req.params;

    // Only validate `id` for update/delete actions. Insert does not provide an :id param.
    if ((action === 'update' || action === 'delete') && (!id || id.length > 100)) {
      return sendError(res, 400, 'Invalid ID format', 'VALIDATION_ERROR', req.id);
    }

    let result;

    if (action === 'insert') {
      // Basic validation for insert
      if (!req.body || typeof req.body !== 'object') {
        return sendError(res, 400, 'Invalid request body', 'VALIDATION_ERROR', req.id);
      }
      result = await supabase.from(tableName).insert(req.body).select().single();
    } else if (action === 'update') {
      if (!req.body || typeof req.body !== 'object') {
        return sendError(res, 400, 'Invalid request body', 'VALIDATION_ERROR', req.id);
      }
      result = await supabase.from(tableName).update(req.body).eq('id', id).select().single();
    } else if (action === 'delete') {
      // FIX: Chain .select() to force Supabase to return the deleted row
      result = await supabase.from(tableName).delete().eq('id', id).select();

      // If no error, but data is empty, it means 0 rows were deleted!
      if (!result.error && result.data.length === 0) {
        return sendError(res, 403, 'Delete failed: Item not found or blocked by RLS.', 'DELETE_FAILED', req.id);
      }
    }

    if (result.error) throw result.error;
    logger.info({ admin: req.user.id, table: tableName, action, id }, 'Admin action completed');
    res.json(action === 'delete' ? { message: 'Deleted successfully' } : result.data);
  } catch (err) {
    logger.error({ admin: req.user.id, error: err.message }, 'Admin action error');
    sendError(res, 500, 'Admin operation failed', 'DB_ERROR', req.id);
  }
};

['hackathons', 'internships', 'contests'].forEach(table => {
  app.post(`/api/admin/${table}`, authenticateToken, requireAdmin, requireCsrf, (req, res) =>
    handleAdminAction(req, res, table, 'insert')
  );
  app.put(`/api/admin/${table}/:id`, authenticateToken, requireAdmin, requireCsrf, (req, res) =>
    handleAdminAction(req, res, table, 'update')
  );
  app.delete(`/api/admin/${table}/:id`, authenticateToken, requireAdmin, requireCsrf, (req, res) =>
    handleAdminAction(req, res, table, 'delete')
  );
});

app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [profilesResult, bookmarksResult] = await Promise.all([
      supabase.from('profiles').select('department'),
      supabase.from('bookmarks').select('opportunity_type, opportunity_id'),
    ]);

    const { data: profilesData, error: profilesError } = profilesResult;
    const { data: bookmarksData, error: bookmarksError } = bookmarksResult;

    if (profilesError) throw profilesError;
    if (bookmarksError) throw bookmarksError;

    const departments = ['cse', 'ece', 'eee', 'mech', 'civil'];
    const usersByDepartment = departments.reduce((acc, department) => {
      acc[department] = 0;
      return acc;
    }, {});

    (profilesData || []).forEach((profile) => {
      const department = profile.department?.toLowerCase();
      if (department && Object.prototype.hasOwnProperty.call(usersByDepartment, department)) {
        usersByDepartment[department] += 1;
      }
    });

    const bookmarkCounts = new Map();
    (bookmarksData || []).forEach((bookmark) => {
      const key = `${bookmark.opportunity_type || 'unknown'}::${bookmark.opportunity_id || 'unknown'}`;
      bookmarkCounts.set(key, (bookmarkCounts.get(key) || 0) + 1);
    });

    const topBookmarked = Array.from(bookmarkCounts.entries())
      .map(([key, count]) => {
        const [opportunity_type, opportunity_id] = key.split('::');
        return { opportunity_type, opportunity_id, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      users_total: profilesData?.length || 0,
      users_by_department: usersByDepartment,
      bookmarks_total: bookmarksData?.length || 0,
      top_bookmarked: topBookmarked,
    });
  } catch (err) {
    logger.error({ admin: req.user.id, error: err.message }, 'Admin analytics error');
    sendError(res, 500, 'Failed to load analytics', 'ANALYTICS_ERROR', req.id);
  }
});

// ─── 404 HANDLER ───
app.use((req, res) => {
  sendError(res, 404, 'Endpoint not found', 'NOT_FOUND', req.id);
});

// ─── CENTRAL ERROR HANDLER ───
app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack, requestId: req.id }, 'Unhandled error');

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return sendError(res, 403, 'Origin not allowed', 'CORS_ERROR', req.id);
  }

  // Default error
  sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR', req.id);
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  logger.info({ port: PORT, env: NODE_ENV }, 'Server started');
});
