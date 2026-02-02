import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getReminders,
    getTodaysDoses,
    getAdherenceStats,
    logDose,
    deleteReminder as deleteReminderAPI
} from '../services/api';
import ReminderCard from '../components/ReminderCard';
import AddReminderModal from '../components/AddReminderModal';
import Loader from '../components/Loader';
import './RemindersPage.css';

function RemindersPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [reminders, setReminders] = useState([]);
    const [todaysDoses, setTodaysDoses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('today'); // today, all, stats

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [remindersRes, todayRes, statsRes] = await Promise.all([
                getReminders(),
                getTodaysDoses(),
                getAdherenceStats('week')
            ]);

            setReminders(remindersRes.data || []);
            setTodaysDoses(todayRes.data || []);
            setStats(statsRes.data || null);
        } catch (err) {
            console.error('Failed to load reminders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogDose = async (reminderId, doseLogId, status) => {
        try {
            await logDose(reminderId, { doseLogId, status });
            // Refresh today's doses
            const todayRes = await getTodaysDoses();
            setTodaysDoses(todayRes.data || []);
            // Refresh stats
            const statsRes = await getAdherenceStats('week');
            setStats(statsRes.data || null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteReminder = async (id) => {
        if (!confirm('Are you sure you want to delete this reminder?')) return;

        try {
            await deleteReminderAPI(id);
            setReminders(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReminderCreated = (newReminder) => {
        setReminders(prev => [newReminder, ...prev]);
        setShowAddModal(false);
        loadData(); // Refresh to get updated doses
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'taken': return 'var(--success-500)';
            case 'skipped': return 'var(--warning-500)';
            case 'missed': return 'var(--error-500)';
            default: return 'var(--gray-400)';
        }
    };

    if (loading) {
        return (
            <div className="reminders-page loading-state">
                <Loader size="lg" text="Loading reminders..." />
            </div>
        );
    }

    return (
        <div className="reminders-page">
            {/* Header */}
            <header className="reminders-header">
                <div className="container">
                    <div className="header-content">
                        <button className="back-btn" onClick={() => navigate('/app')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <h1>💊 Medicine Reminders</h1>
                        <div className="header-actions">
                            <button className="add-btn" onClick={() => setShowAddModal(true)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Reminder
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Stats Summary */}
            {stats && (
                <section className="stats-summary">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-card adherence">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.overall?.adherenceRate || 0}%</span>
                                    <span className="stat-label">Weekly Adherence</span>
                                </div>
                            </div>
                            <div className="stat-card streak">
                                <div className="stat-icon">🔥</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.currentStreak || 0}</span>
                                    <span className="stat-label">Day Streak</span>
                                </div>
                            </div>
                            <div className="stat-card taken">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.overall?.taken || 0}</span>
                                    <span className="stat-label">Doses Taken</span>
                                </div>
                            </div>
                            <div className="stat-card total">
                                <div className="stat-icon">💊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{reminders.length}</span>
                                    <span className="stat-label">Active Reminders</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tabs */}
            <div className="tabs-container">
                <div className="container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'today' ? 'active' : ''}`}
                            onClick={() => setActiveTab('today')}
                        >
                            Today's Schedule
                        </button>
                        <button
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Reminders
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="reminders-main">
                <div className="container">
                    {/* Today's Schedule */}
                    {activeTab === 'today' && (
                        <div className="today-schedule">
                            {todaysDoses.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <h3>No doses scheduled for today</h3>
                                    <p>Create a reminder to start tracking your medications</p>
                                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                        Add Your First Reminder
                                    </button>
                                </div>
                            ) : (
                                <div className="timeline">
                                    {todaysDoses.map((dose) => (
                                        <div
                                            key={dose._id}
                                            className={`timeline-item ${dose.status}`}
                                        >
                                            <div className="timeline-time">
                                                {formatTime(dose.scheduledTime)}
                                            </div>
                                            <div className="timeline-dot" style={{ background: getStatusColor(dose.status) }} />
                                            <div className="timeline-content">
                                                <div className="dose-card">
                                                    <div className="dose-info">
                                                        <h4>{dose.medicineName}</h4>
                                                        {dose.dosage && <span className="dose-dosage">{dose.dosage}</span>}
                                                    </div>
                                                    {dose.status === 'pending' && (
                                                        <div className="dose-actions">
                                                            <button
                                                                className="dose-btn take"
                                                                onClick={() => handleLogDose(dose.reminderId, dose._id, 'taken')}
                                                            >
                                                                ✓ Take
                                                            </button>
                                                            <button
                                                                className="dose-btn skip"
                                                                onClick={() => handleLogDose(dose.reminderId, dose._id, 'skipped')}
                                                            >
                                                                Skip
                                                            </button>
                                                        </div>
                                                    )}
                                                    {dose.status !== 'pending' && (
                                                        <div className={`dose-status ${dose.status}`}>
                                                            {dose.status === 'taken' && '✓ Taken'}
                                                            {dose.status === 'skipped' && '⊘ Skipped'}
                                                            {dose.status === 'missed' && '✗ Missed'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Reminders */}
                    {activeTab === 'all' && (
                        <div className="all-reminders">
                            {reminders.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">⏰</div>
                                    <h3>No reminders yet</h3>
                                    <p>Create reminders to never forget your medications</p>
                                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                        Create Reminder
                                    </button>
                                </div>
                            ) : (
                                <div className="reminders-grid">
                                    {reminders.map((reminder) => (
                                        <ReminderCard
                                            key={reminder._id}
                                            reminder={reminder}
                                            onDelete={handleDeleteReminder}
                                            onRefresh={loadData}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Reminder Modal */}
            {showAddModal && (
                <AddReminderModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={handleReminderCreated}
                />
            )}
        </div>
    );
}

export default RemindersPage;
