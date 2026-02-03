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

            // Fetch profile and prescriptions in parallel
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

    // Convert image to base64 for storage
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setEditProfilePic(reader.result);
            };
            reader.onerror = () => {
                setError('Failed to read image file');
            };
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

            // Include profile picture if changed
            if (editProfilePic) {
                updateData.profilePicture = editProfilePic;
            }

            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

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

            if (!res.ok) {
                throw new Error('Failed to delete prescription');
            }

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
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="dashboard-container">
                    <div className="dashboard-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="dashboard-logo" onClick={() => navigate('/app')}>
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                        </div>
                        <span>Prescripto</span>
                    </div>
                    <div className="dashboard-header-actions">
                        <button className="btn-secondary" onClick={() => navigate('/app')}>
                            ← Back to App
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Error Alert */}
                {error && (
                    <div className="dashboard-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {/* Main Content */}
                <div className="dashboard-content">
                    {/* Profile Section */}
                    <section className="dashboard-section profile-section">
                        <div className="section-header">
                            <h2>Profile</h2>
                            {!isEditing && (
                                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form className="profile-form" onSubmit={handleUpdateProfile}>
                                <div className="profile-pic-upload">
                                    <div className="profile-pic-preview">
                                        {editProfilePic ? (
                                            <img src={editProfilePic} alt="New Profile" />
                                        ) : profile?.profilePicture ? (
                                            <img src={profile.profilePicture} alt="Profile" />
                                        ) : (
                                            <span>{editName?.charAt(0)?.toUpperCase() || profile?.name?.charAt(0)?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="upload-section">
                                        <label className="upload-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            {editProfilePic ? 'Change Photo' : 'Upload Photo'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePicChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        {editProfilePic && (
                                            <span className="upload-status">✓ New photo selected</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" className="btn-cancel" onClick={() => {
                                        setIsEditing(false);
                                        setEditName(profile?.name || '');
                                        setEditEmail(profile?.email || '');
                                        setEditProfilePic(null);
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="profile-avatar">
                                    {profile?.profilePicture ? (
                                        <img src={profile.profilePicture} alt="Profile" />
                                    ) : (
                                        profile?.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="profile-details">
                                    <h3>{profile?.name}</h3>
                                    <p>{profile?.email}</p>
                                    <span className="member-since">
                                        Member since {formatDate(profile?.createdAt)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Stats Section */}
                    <section className="dashboard-section stats-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon prescriptions">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">{stats?.totalPrescriptions || 0}</span>
                                    <span className="stat-label">Total Prescriptions</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon last-upload">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">
                                        {stats?.lastUpload ? formatDate(stats.lastUpload) : 'Never'}
                                    </span>
                                    <span className="stat-label">Last Upload</span>
                                </div>
                            </div>
                            <div className="stat-card clickable" onClick={() => navigate('/reminders')}>
                                <div className="stat-icon reminders">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">💊</span>
                                    <span className="stat-label">Medicine Reminders</span>
                                </div>
                                <div className="stat-arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prescription History */}
                    <section className="dashboard-section history-section">
                        <div className="section-header">
                            <h2>Prescription History</h2>
                            <button className="btn-primary" onClick={() => navigate('/app')}>
                                + New Upload
                            </button>
                        </div>

                        {prescriptions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
                                <h3>No prescriptions yet</h3>
                                <p>Upload your first prescription to get started</p>
                                <button className="btn-primary" onClick={() => navigate('/app')}>
                                    Upload Prescription
                                </button>
                            </div>
                        ) : (
                            <div className="prescriptions-list">
                                {prescriptions.map((prescription) => (
                                    <div key={prescription.id} className="prescription-card">
                                        <div className="prescription-info">
                                            <div className="prescription-date">
                                                {formatDate(prescription.createdAt)}
                                            </div>
                                            <div className="prescription-preview">
                                                {prescription.extractedText || 'No text extracted'}
                                            </div>
                                            <div className="prescription-meta">
                                                {prescription.diagnosis && (
                                                    <span className="meta-tag diagnosis">
                                                        {prescription.diagnosis}
                                                    </span>
                                                )}
                                                <span className="meta-tag medicines">
                                                    💊 {prescription.medicineCount} medicines
                                                </span>
                                                {prescription.isAnalyzed && (
                                                    <span className="meta-tag analyzed">✓ Analyzed</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="prescription-actions">
                                            <button
                                                className="btn-icon view"
                                                onClick={() => navigate(`/app?prescription=${prescription.id}`)}
                                                title="View"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDeletePrescription(prescription.id)}
                                                title="Delete"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
