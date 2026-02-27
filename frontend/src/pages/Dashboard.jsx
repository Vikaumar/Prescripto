import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editProfilePic, setEditProfilePic] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const [profileRes, prescriptionsRes] = await Promise.all([
                fetch(`${API_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/user/prescriptions`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (!profileRes.ok || !prescriptionsRes.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const profileData = await profileRes.json();
            const prescriptionsData = await prescriptionsRes.json();

            setProfile(profileData.profile);
            setStats(profileData.stats);
            setPrescriptions(prescriptionsData.prescriptions);
            setEditName(profileData.profile.name);
            setEditEmail(profileData.profile.email);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setEditProfilePic(reader.result);
            reader.onerror = () => setError('Failed to read image file');
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const updateData = { name: editName, email: editEmail };
            if (editProfilePic) updateData.profilePicture = editProfilePic;

            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            setProfile(prev => ({
                ...prev,
                name: data.user.name,
                email: data.user.email,
                profilePicture: data.user.profilePicture || prev.profilePicture
            }));
            setIsEditing(false);
            setEditProfilePic(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePrescription = async (id) => {
        if (!confirm('Are you sure you want to delete this prescription?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/user/prescriptions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete prescription');
            setPrescriptions(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="dash">
                <div className="dash-loader">
                    <div className="dash-loader-spinner" />
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash">
            {/* ── Top Bar ── */}
            <header className="dash-topbar">
                <div className="dash-topbar-left">
                    <div className="dash-logo" onClick={() => navigate('/app')}>
                        <div className="dash-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                        </div>
                        <span className="dash-logo-text">Prescripto</span>
                    </div>
                </div>
                <div className="dash-topbar-right">
                    <button className="dash-topbar-btn" onClick={() => navigate('/app')} title="Scan Prescription">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </button>
                    <button className="dash-topbar-btn logout" onClick={handleLogout} title="Logout">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* ── Error Alert ── */}
            {error && (
                <div className="dash-alert">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* ── Welcome + Profile Row ── */}
            <div className="dash-welcome-row">
                {/* Profile Card */}
                <div className="dash-card dash-profile-card">
                    {isEditing ? (
                        <form className="dash-profile-form" onSubmit={handleUpdateProfile}>
                            <h3>Edit Profile</h3>
                            <div className="dash-profile-form-avatar">
                                <div className="dash-avatar lg">
                                    {editProfilePic ? (
                                        <img src={editProfilePic} alt="New" />
                                    ) : profile?.profilePicture ? (
                                        <img src={profile.profilePicture} alt="Profile" />
                                    ) : (
                                        <span>{editName?.charAt(0)?.toUpperCase()}</span>
                                    )}
                                </div>
                                <label className="dash-upload-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    Upload
                                    <input type="file" accept="image/*" onChange={handleProfilePicChange} hidden />
                                </label>
                            </div>
                            <div className="dash-form-field">
                                <label>Name</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                            </div>
                            <div className="dash-form-field">
                                <label>Email</label>
                                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                            </div>
                            <div className="dash-form-actions">
                                <button type="submit" className="dash-btn primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" className="dash-btn ghost" onClick={() => {
                                    setIsEditing(false);
                                    setEditName(profile?.name || '');
                                    setEditEmail(profile?.email || '');
                                    setEditProfilePic(null);
                                }}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <button className="dash-edit-float" onClick={() => setIsEditing(true)} title="Edit Profile">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <div className="dash-avatar xl">
                                {profile?.profilePicture ? (
                                    <img src={profile.profilePicture} alt="Profile" />
                                ) : (
                                    <span>{profile?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <h3 className="dash-profile-name">{profile?.name}</h3>
                            <p className="dash-profile-email">{profile?.email}</p>
                            <div className="dash-profile-badges">
                                <div className="dash-badge blue">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    {stats?.totalPrescriptions || 0}
                                </div>
                                <div className="dash-badge green">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Active
                                </div>
                                <div className="dash-badge amber">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                    </svg>
                                    {formatDate(profile?.createdAt)}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Gradient Stat Cards */}
                <div className="dash-gradient-stats">
                    <div className="dash-gradient-card mint" onClick={() => navigate('/app')}>
                        <div className="dash-gradient-card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>
                        <div className="dash-gradient-card-value">
                            {stats?.totalPrescriptions || 0}
                        </div>
                        <div className="dash-gradient-card-label">
                            Total Prescriptions
                        </div>
                    </div>
                    <div className="dash-gradient-card sky" onClick={() => navigate('/app')}>
                        <div className="dash-gradient-card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="dash-gradient-card-value">
                            {stats?.lastUpload ? formatDate(stats.lastUpload) : '—'}
                        </div>
                        <div className="dash-gradient-card-label">
                            Last Upload
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Welcome Banner ── */}
            <div className="dash-welcome-banner">
                <div>
                    <h2>{getGreeting()}, {profile?.name?.split(' ')[0]} 👋</h2>
                    <p>Your personal health dashboard overview</p>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="dash-main-grid">
                {/* Left: Quick Actions */}
                <div className="dash-left-col">
                    <div className="dash-card">
                        <h3 className="dash-card-title">Quick Actions</h3>
                        <div className="dash-actions-grid">
                            <button className="dash-action-item" onClick={() => navigate('/app')}>
                                <div className="dash-action-icon green-bg">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <div className="dash-action-text">
                                    <strong>Upload</strong>
                                    <span>Scan prescription</span>
                                </div>
                                <svg className="dash-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                            <button className="dash-action-item" onClick={() => navigate('/reminders')}>
                                <div className="dash-action-icon purple-bg">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="dash-action-text">
                                    <strong>Reminders</strong>
                                    <span>Medicine schedule</span>
                                </div>
                                <svg className="dash-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                            <button className="dash-action-item" onClick={() => navigate('/family')}>
                                <div className="dash-action-icon amber-bg">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div className="dash-action-text">
                                    <strong>Family</strong>
                                    <span>Manage members</span>
                                </div>
                                <svg className="dash-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                            <button className="dash-action-item" onClick={() => navigate('/pharmacy')}>
                                <div className="dash-action-icon teal-bg">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                </div>
                                <div className="dash-action-text">
                                    <strong>Pharmacy</strong>
                                    <span>Find nearby stores</span>
                                </div>
                                <svg className="dash-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Prescriptions */}
                <div className="dash-right-col">
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <h3 className="dash-card-title">Recent Prescriptions</h3>
                            <button className="dash-btn ghost sm" onClick={() => navigate('/app')}>
                                + New
                            </button>
                        </div>

                        {prescriptions.length === 0 ? (
                            <div className="dash-empty">
                                <span className="dash-empty-icon">📋</span>
                                <p>No prescriptions yet</p>
                                <button className="dash-btn primary sm" onClick={() => navigate('/app')}>Upload First</button>
                            </div>
                        ) : (
                            <div className="dash-prescriptions-list">
                                {prescriptions.slice(0, 5).map((rx) => (
                                    <div key={rx.id} className="dash-rx-item">
                                        <div className="dash-rx-date">
                                            <span className="dash-rx-day">{new Date(rx.createdAt).getDate()}</span>
                                            <span className="dash-rx-month">{new Date(rx.createdAt).toLocaleString('en', { month: 'short' })}</span>
                                        </div>
                                        <div className="dash-rx-info">
                                            <div className="dash-rx-title">
                                                {rx.diagnosis || 'Prescription'}
                                            </div>
                                            <div className="dash-rx-meta">
                                                💊 {rx.medicineCount || 0} medicines
                                                {rx.isAnalyzed && <span className="dash-rx-tag">Analyzed</span>}
                                            </div>
                                        </div>
                                        <div className="dash-rx-actions">
                                            <button className="dash-icon-btn" onClick={() => navigate(`/app?prescription=${rx.id}`)} title="View">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15 3 21 3 21 9" />
                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                            </button>
                                            <button className="dash-icon-btn danger" onClick={() => handleDeletePrescription(rx.id)} title="Delete">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {prescriptions.length > 5 && (
                                    <button className="dash-see-all" onClick={() => navigate('/app')}>
                                        See all prescriptions →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
