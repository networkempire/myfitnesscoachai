import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getBetaRequests,
  approveBetaRequest,
  rejectBetaRequest,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist
} from '../services/admin';
import './AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [betaRequests, setBetaRequests] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add whitelist form state
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const isAdmin = user?.is_admin;

  useEffect(() => {
    const fetchBetaRequests = async () => {
      try {
        const data = await getBetaRequests();
        setBetaRequests(data.requests);
      } catch (error) {
        console.error('Failed to fetch beta requests:', error);
      }
    };

    const fetchWhitelist = async () => {
      try {
        const data = await getWhitelist();
        setWhitelist(data.whitelist);
      } catch (error) {
        console.error('Failed to fetch whitelist:', error);
      }
    };

    const loadData = async () => {
      if (!isAdmin) return;
      setLoading(true);
      await Promise.all([fetchBetaRequests(), fetchWhitelist()]);
      setLoading(false);
    };
    loadData();
  }, [isAdmin]);

  // Redirect non-admins (after hooks)
  if (!isAdmin) {
    return <Navigate to="/app" />;
  }

  const fetchBetaRequests = async () => {
    try {
      const data = await getBetaRequests();
      setBetaRequests(data.requests);
    } catch (error) {
      console.error('Failed to fetch beta requests:', error);
    }
  };

  const fetchWhitelist = async () => {
    try {
      const data = await getWhitelist();
      setWhitelist(data.whitelist);
    } catch (error) {
      console.error('Failed to fetch whitelist:', error);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    try {
      await approveBetaRequest(id);
      setMessage({ type: 'success', text: 'Request approved and email added to whitelist.' });
      await Promise.all([fetchBetaRequests(), fetchWhitelist()]);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to approve request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    try {
      await rejectBetaRequest(id);
      setMessage({ type: 'success', text: 'Request rejected.' });
      await fetchBetaRequests();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reject request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddToWhitelist = async (e) => {
    e.preventDefault();
    setActionLoading('add');
    setMessage({ type: '', text: '' });
    try {
      await addToWhitelist(newEmail, newNotes);
      setMessage({ type: 'success', text: 'Email added to whitelist.' });
      setNewEmail('');
      setNewNotes('');
      await fetchWhitelist();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add email.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFromWhitelist = async (id) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    try {
      await removeFromWhitelist(id);
      setMessage({ type: 'success', text: 'Email removed from whitelist.' });
      await fetchWhitelist();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to remove email.' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <Link to="/app" className="admin-back-link">
            ← Back to App
          </Link>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Beta Requests ({betaRequests.filter(r => r.status === 'pending').length} pending)
          </button>
          <button
            className={`admin-tab ${activeTab === 'whitelist' ? 'active' : ''}`}
            onClick={() => setActiveTab('whitelist')}
          >
            Whitelist ({whitelist.length})
          </button>
        </div>

        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="admin-panel">
            <h2>Beta Access Requests</h2>

            {loading ? (
              <div className="admin-loading">Loading...</div>
            ) : betaRequests.length === 0 ? (
              <div className="admin-empty">No beta requests yet.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {betaRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.name}</td>
                      <td>{request.email}</td>
                      <td>
                        <span className={`status-badge status-${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{formatDate(request.created_at)}</td>
                      <td>
                        {request.status === 'pending' && (
                          <div className="admin-actions">
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? '...' : 'Approve'}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? '...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'whitelist' && (
          <div className="admin-panel">
            <h2>Email Whitelist</h2>

            <form className="add-whitelist-form" onSubmit={handleAddToWhitelist}>
              <input
                type="email"
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
              <button type="submit" disabled={actionLoading === 'add'}>
                {actionLoading === 'add' ? 'Adding...' : 'Add to Whitelist'}
              </button>
            </form>

            {loading ? (
              <div className="admin-loading">Loading...</div>
            ) : whitelist.length === 0 ? (
              <div className="admin-empty">No emails whitelisted yet.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Notes</th>
                    <th>Added By</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {whitelist.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.email}</td>
                      <td>{entry.notes || '-'}</td>
                      <td>{entry.added_by_email || 'System'}</td>
                      <td>{formatDate(entry.created_at)}</td>
                      <td>
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveFromWhitelist(entry.id)}
                          disabled={actionLoading === entry.id}
                        >
                          {actionLoading === entry.id ? '...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
