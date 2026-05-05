import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import * as adminApi from '../api/admin';
import * as oppApi from '../api/opportunities';
import './AdminPage.css';

const DEPTS = ['cse', 'ece', 'eee', 'mech', 'civil', 'all'];
const TABS = ['hackathons', 'internships', 'contests', 'analytics'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('hackathons');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const getApiErrorMessage = (err, fallback = 'Something went wrong') => {
    const apiError = err?.response?.data?.error;
    if (apiError?.details && Array.isArray(apiError.details)) {
      const fieldMessages = apiError.details.map((d) => d.message).join(', ');
      return `${apiError.message}: ${fieldMessages}`;
    }
    return apiError?.message || err?.message || fallback;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const analyticsData = await adminApi.getAnalytics();
        setAnalytics(analyticsData);
        setData([]);
        return;
      }

      let res;
      if (activeTab === 'hackathons') res = await oppApi.getHackathons();
      if (activeTab === 'internships') res = await oppApi.getInternships();
      if (activeTab === 'contests') res = await oppApi.getContests();
      setData(res);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  const validatePayload = (payload) => {
    if (!payload.name?.trim()) return 'Name is required';
    if (!payload.org?.trim()) return 'Organization is required';
    if (!payload.date?.trim()) return 'Date is required';
    if (!payload.level || !['national', 'international'].includes(payload.level)) return 'Level is invalid';
    if (!Array.isArray(payload.depts) || payload.depts.length === 0) return 'Select at least one department';
    if (!payload.link?.trim()) return 'Official link is required';
    return null;
  };

  const getEmptyForm = () => {
    const base = { id: '', name: '', org: '', level: 'national', focus: '', date: '', depts: [], link: '', tip: '' };
    if (activeTab === 'hackathons') {
      return { ...base, rounds: [], round_detail: '', prize: '', perks: '', jobs: false, status: 'upcoming', winners: [] };
    }
    if (activeTab === 'internships') {
      return { ...base, stipend: '', eligibility: '', selection: [], selection_detail: '', mode: '' };
    }
    if (activeTab === 'contests') {
      return { ...base, rounds: [], round_detail: '', prize: '', perks: '', jobs: false };
    }
    return base;
  };

  const openAddModal = () => {
    if (activeTab === 'analytics') return;
    setFormData(getEmptyForm());
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    if (activeTab === 'analytics') return;
    setFormData({ ...item });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (activeTab === 'analytics') return;
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    
    try {
      await api.delete(`/api/admin/${activeTab}/${id}`);
      toast.success('Deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete'));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (activeTab === 'analytics') return;
    try {
      // Validate array parsing
      const payload = { ...formData };

      const validationError = validatePayload(payload);
      if (validationError) {
        toast.error(validationError);
        return;
      }
      
      // Auto-generate ID if inserting
      if (!isEditing && !payload.id) {
        payload.id = activeTab.charAt(0) + Date.now();
      }

      if (isEditing) {
        await api.put(`/api/admin/${activeTab}/${payload.id}`, payload);
      } else {
        await api.post(`/api/admin/${activeTab}`, payload);
      }
      toast.success(isEditing ? 'Updated successfully' : 'Created successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeptToggle = (dept) => {
    setFormData(prev => {
      const depts = prev.depts || [];
      if (depts.includes(dept)) return { ...prev, depts: depts.filter(d => d !== dept) };
      return { ...prev, depts: [...depts, dept] };
    });
  };

  const handleArrayTextChange = (e, field) => {
    // Splits by newline into an array
    const value = e.target.value;
    const arrayVals = value.split('\n').filter(s => s.trim() !== '');
    setFormData(prev => ({ ...prev, [field]: arrayVals }));
  };

  const renderArrayInput = (field, label, placeholder) => (
    <div className="form-group full-width">
      <label>{label} (One item per line)</label>
      <textarea 
        rows="4"
        value={(formData[field] || []).join('\n')}
        onChange={(e) => handleArrayTextChange(e, field)}
        placeholder={placeholder}
      />
    </div>
  );

  const renderAnalytics = () => {
    const stats = analytics || {
      users_total: 0,
      users_by_department: { cse: 0, ece: 0, eee: 0, mech: 0, civil: 0 },
      bookmarks_total: 0,
      top_bookmarked: [],
    };

    return (
      <div className="analytics-panel">
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-label">Total Users</div>
            <div className="analytics-value">{stats.users_total}</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-label">Total Bookmarks</div>
            <div className="analytics-value">{stats.bookmarks_total}</div>
          </div>
        </div>

        <div className="analytics-section">
          <h2 className="analytics-heading">Users by Department</h2>
          <div className="analytics-dept-grid">
            {Object.entries(stats.users_by_department || {}).map(([dept, count]) => (
              <div key={dept} className="analytics-dept-card">
                <span>{dept.toUpperCase()}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h2 className="analytics-heading">Top Bookmarked Opportunities</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Opportunity ID</th>
                  <th>Bookmarks</th>
                </tr>
              </thead>
              <tbody>
                {(stats.top_bookmarked || []).length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No bookmarks yet.</td>
                  </tr>
                ) : (
                  stats.top_bookmarked.map((item) => (
                    <tr key={`${item.opportunity_type}-${item.opportunity_id}`}>
                      <td>{item.opportunity_type}</td>
                      <td>{item.opportunity_id}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button 
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {activeTab !== 'analytics' && (
        <div className="admin-actions">
          <button className="btn-primary" onClick={openAddModal}>+ Add New {activeTab.slice(0, -1)}</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : activeTab === 'analytics' ? (
        renderAnalytics()
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Organization</th>
                <th>Date</th>
                <th>Depts</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.org}</td>
                  <td>{item.date}</td>
                  <td>{item.depts?.join(', ').toUpperCase()}</td>
                  <td>{item.level}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" onClick={() => openEditModal(item)} title="Edit">✎</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(item.id)} title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && activeTab !== 'analytics' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form className="admin-form" onSubmit={handleSave}>
              <div className="form-group full-width">
                <label>ID (Optional)</label>
                <input type="text" name="id" value={formData.id} onChange={handleInputChange} disabled={isEditing} placeholder="Auto-generated if empty" />
              </div>

              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" required value={formData.name || ''} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Organization</label>
                <input type="text" name="org" required value={formData.org || ''} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Level</label>
                <select name="level" value={formData.level || 'national'} onChange={handleInputChange}>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date String</label>
                <input type="text" name="date" required value={formData.date || ''} onChange={handleInputChange} placeholder="e.g. Aug–Dec 2027" />
              </div>

              <div className="form-group full-width">
                <label>Departments</label>
                <div className="checkbox-group">
                  {DEPTS.map(dept => (
                    <label key={dept} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={(formData.depts || []).includes(dept)} 
                        onChange={() => handleDeptToggle(dept)}
                      />
                      {dept.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Focus Area</label>
                <input type="text" name="focus" value={formData.focus || ''} onChange={handleInputChange} />
              </div>

              <div className="form-group full-width">
                <label>Official Link</label>
                <input type="text" name="link" value={formData.link || ''} onChange={handleInputChange} />
              </div>

              <div className="form-group full-width">
                <label>Pro Tip</label>
                <input type="text" name="tip" value={formData.tip || ''} onChange={handleInputChange} />
              </div>

              {/* HACKATHON & CONTEST SPECIFIC */}
              {(activeTab === 'hackathons' || activeTab === 'contests') && (
                <>
                  <div className="form-group">
                    <label>Prize</label>
                    <input type="text" name="prize" value={formData.prize || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Perks</label>
                    <input type="text" name="perks" value={formData.perks || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Round Detail Summary</label>
                    <textarea rows="2" name="round_detail" value={formData.round_detail || ''} onChange={handleInputChange} />
                  </div>
                  {renderArrayInput('rounds', 'Rounds List', 'Round 1\nRound 2')}
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input type="checkbox" name="jobs" checked={formData.jobs || false} onChange={handleInputChange} />
                      <strong>Job Linked?</strong>
                    </label>
                  </div>
                  {activeTab === 'hackathons' && (
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status || 'upcoming'} onChange={handleInputChange}>
                        <option value="upcoming">Upcoming</option>
                        <option value="open">Open</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* INTERNSHIP SPECIFIC */}
              {activeTab === 'internships' && (
                <>
                  <div className="form-group">
                    <label>Stipend</label>
                    <input type="text" name="stipend" value={formData.stipend || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Mode</label>
                    <input type="text" name="mode" value={formData.mode || ''} onChange={handleInputChange} placeholder="Remote / Hybrid" />
                  </div>
                  <div className="form-group full-width">
                    <label>Eligibility</label>
                    <input type="text" name="eligibility" value={formData.eligibility || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Selection Detail Summary</label>
                    <textarea rows="2" name="selection_detail" value={formData.selection_detail || ''} onChange={handleInputChange} />
                  </div>
                  {renderArrayInput('selection', 'Selection Process Steps', 'Step 1\nStep 2')}
                </>
              )}

              <div className="modal-actions full-width">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
