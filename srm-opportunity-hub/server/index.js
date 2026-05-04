require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Imported as requested, though Supabase Auth handles passwords
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Supabase credentials not found in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// ─── AUTH ROUTES ───
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, department, year } = req.body;
    
    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) return res.status(400).json({ error: authError.message });
    
    const userId = authData.user.id;
    
    // 2. Insert into public.profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name,
        department,
        year,
        role: 'student'
      })
      .select()
      .single();
      
    if (profileError) {
      console.warn("Profile insert warning (suppressed):", profileError.message);
      // We don't return an error response here as requested
    }
    
    // 3. Generate JWT (using provided data if profileData is null due to suppressed error)
    const tokenPayload = {
      id: userId,
      email: profileData?.email || email,
      role: profileData?.role || 'student',
      department: profileData?.department || department
    };
    
    const safeProfileData = profileData || {
      id: userId,
      email,
      full_name,
      department,
      year,
      role: 'student'
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ user: safeProfileData, token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verify with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) return res.status(400).json({ error: authError.message });
    
    const userId = authData.user.id;
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) return res.status(400).json({ error: 'Profile not found' });
    
    // Return custom JWT
    const tokenPayload = {
      id: userId,
      email: profileData.email,
      role: profileData.role,
      department: profileData.department
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ user: profileData, token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── OPPORTUNITY ROUTES (PROTECTED) ───
const buildOpportunityQuery = (tableName, req) => {
  const { level, search } = req.query;
  let query = supabase.from(tableName).select('*');
  
  if (level) {
    query = query.eq('level', level);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,org.ilike.%${search}%,focus.ilike.%${search}%`);
  }
  return query;
};

app.get('/api/hackathons', authenticateToken, async (req, res) => {
  try {
    let query = buildOpportunityQuery('hackathons', req);
    if (req.query.dept) query = query.overlaps('depts', [req.query.dept, 'all']);
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/internships', authenticateToken, async (req, res) => {
  try {
    let query = buildOpportunityQuery('internships', req);
    if (req.query.dept) query = query.overlaps('depts', [req.query.dept, 'all']);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contests', authenticateToken, async (req, res) => {
  try {
    let query = buildOpportunityQuery('contests', req);
    if (req.query.dept) query = query.overlaps('depts', [req.query.dept, 'all']);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const { count: hCount } = await supabase.from('hackathons').select('*', { count: 'exact', head: true });
    const { count: iCount } = await supabase.from('internships').select('*', { count: 'exact', head: true });
    const { count: cCount } = await supabase.from('contests').select('*', { count: 'exact', head: true });
    
    res.json({
      total: (hCount || 0) + (iCount || 0) + (cCount || 0),
      hackathons: hCount || 0,
      internships: iCount || 0,
      contests: cCount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookmarks', authenticateToken, async (req, res) => {
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
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookmarks/:opportunity_id', authenticateToken, async (req, res) => {
  try {
    const { opportunity_id } = req.params;
    
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', req.user.id)
      .eq('opportunity_id', opportunity_id);
      
    if (error) throw error;
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN ROUTES ───
const handleAdminAction = async (req, res, tableName, action) => {
  try {
    let result;
    const { id } = req.params;
    
    if (action === 'insert') {
      result = await supabase.from(tableName).insert(req.body).select().single();
    } else if (action === 'update') {
      result = await supabase.from(tableName).update(req.body).eq('id', id).select().single();
    } else if (action === 'delete') {
      result = await supabase.from(tableName).delete().eq('id', id);
    }
    
    if (result.error) throw result.error;
    res.json(action === 'delete' ? { message: 'Deleted successfully' } : result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

['hackathons', 'internships', 'contests'].forEach(table => {
  app.post(`/api/admin/${table}`, authenticateToken, requireAdmin, (req, res) => handleAdminAction(req, res, table, 'insert'));
  app.put(`/api/admin/${table}/:id`, authenticateToken, requireAdmin, (req, res) => handleAdminAction(req, res, table, 'update'));
  app.delete(`/api/admin/${table}/:id`, authenticateToken, requireAdmin, (req, res) => handleAdminAction(req, res, table, 'delete'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
