import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    getEmergencyInfo
} from '../services/api';
import MemberProfileCard from '../components/MemberProfileCard';
import EmergencyCard from '../components/EmergencyCard';
import AddFamilyMemberModal from '../components/AddFamilyMemberModal';
import Loader from '../components/Loader';
import './FamilyPage.css';

export default function FamilyPage() {
    const [members, setMembers] = useState([]);
    const [emergencyData, setEmergencyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMember, setEditMember] = useState(null);
    const [showEmergency, setShowEmergency] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const [membersRes, emergencyRes] = await Promise.all([
                getFamilyMembers(),
                getEmergencyInfo()
            ]);
            setMembers(membersRes.data || []);
            setEmergencyData(emergencyRes.data || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load family members');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleAddMember = async (data) => {
        await addFamilyMember(data);
        await fetchMembers();
    };

    const handleUpdateMember = async (data, id) => {
        await updateFamilyMember(id, data);
        await fetchMembers();
    };

    const handleRemoveMember = async (id) => {
        if (!window.confirm('Remove this family member? This action can be undone.')) return;
        try {
            await removeFamilyMember(id);
            await fetchMembers();
        } catch (err) {
            setError(err.message || 'Failed to remove member');
        }
    };

    const handleEdit = (member) => {
        setEditMember(member);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMember(null);
    };

    return (
        <div className="family-page">
            {/* Header */}
            <div className="family-header">
                <div className="family-header-left">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="family-title">Family Members</h1>
                        <p className="family-subtitle">
                            Manage your family & caretakers • {members.length} member{members.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <button className="add-member-btn" onClick={() => setShowModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Member
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="family-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}

            {loading ? (
                <div className="family-loading">
                    <Loader size="lg" text="Loading family members..." />
                </div>
            ) : (
                <>
                    {/* Emergency Panel */}
                    {emergencyData.length > 0 && (
                        <div className="emergency-section">
                            <button
                                className="emergency-toggle"
                                onClick={() => setShowEmergency(!showEmergency)}
                            >
                                🚨 Emergency Quick Access
                                <svg
                                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className={`toggle-arrow ${showEmergency ? 'open' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {showEmergency && <EmergencyCard members={emergencyData} />}
                        </div>
                    )}

                    {/* Members Grid */}
                    {members.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍👩‍👧‍👦</div>
                            <h3>No family members yet</h3>
                            <p>Add family members to manage their health info, medications, and emergency contacts.</p>
                            <button className="empty-add-btn" onClick={() => setShowModal(true)}>
                                + Add Your First Member
                            </button>
                        </div>
                    ) : (
                        <div className="members-grid">
                            {members.map(member => (
                                <MemberProfileCard
                                    key={member._id}
                                    member={member}
                                    onEdit={handleEdit}
                                    onRemove={handleRemoveMember}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            <AddFamilyMemberModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={editMember ? handleUpdateMember : handleAddMember}
                editMember={editMember}
            />
        </div>
    );
}
