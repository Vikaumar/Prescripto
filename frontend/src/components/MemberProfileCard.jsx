import { useState } from 'react';
import './MemberProfileCard.css';

const RELATIONSHIP_ICONS = {
    Mother: '👩', Father: '👨', Spouse: '💑', Son: '👦', Daughter: '👧',
    Brother: '👦', Sister: '👧', Grandparent: '👴', Grandchild: '👶',
    Uncle: '👨', Aunt: '👩', Cousin: '🧑', Friend: '🤝', Other: '👤'
};

export default function MemberProfileCard({ member, onEdit, onRemove }) {
    const [showActions, setShowActions] = useState(false);

    const icon = RELATIONSHIP_ICONS[member.relationship] || '👤';
    const hasEmergencyData = member.allergies?.length > 0 ||
        member.conditions?.length > 0 ||
        member.emergencyContact?.phone;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getAge = (dob) => {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    };

    const age = getAge(member.dateOfBirth);

    return (
        <div className={`member-card ${member.status === 'pending' ? 'pending' : ''}`}>
            <div className="member-card-header">
                <div className="member-avatar">
                    {member.profilePicture ? (
                        <img src={member.profilePicture} alt={member.name} />
                    ) : (
                        <span className="member-avatar-icon">{icon}</span>
                    )}
                </div>
                <div className="member-info">
                    <h4 className="member-name">{member.name}</h4>
                    <span className="member-relationship">{member.relationship}</span>
                    {age !== null && <span className="member-age">{age} years old</span>}
                </div>
                <div className="member-badges">
                    <span className={`role-badge ${member.role}`}>
                        {member.role === 'caretaker' ? '🔑 Caretaker' : '👁️ Member'}
                    </span>
                    {member.status === 'pending' && (
                        <span className="status-badge pending">Pending</span>
                    )}
                </div>
            </div>

            {/* Quick Info Row */}
            <div className="member-quick-info">
                {member.bloodGroup && (
                    <span className="quick-tag blood">🩸 {member.bloodGroup}</span>
                )}
                {hasEmergencyData && (
                    <span className="quick-tag emergency">🚨 Emergency Info</span>
                )}
                {member.emergencyContact?.phone && (
                    <span className="quick-tag phone">📞 {member.emergencyContact.phone}</span>
                )}
            </div>

            {/* Allergies & Conditions */}
            {(member.allergies?.length > 0 || member.conditions?.length > 0) && (
                <div className="member-health-tags">
                    {member.allergies?.map((allergy, i) => (
                        <span key={`a-${i}`} className="health-tag allergy">⚠️ {allergy}</span>
                    ))}
                    {member.conditions?.map((condition, i) => (
                        <span key={`c-${i}`} className="health-tag condition">💊 {condition}</span>
                    ))}
                </div>
            )}

            {member.notes && (
                <p className="member-notes">{member.notes}</p>
            )}

            {/* Actions */}
            <div className="member-actions">
                <button className="member-action-btn edit" onClick={() => onEdit(member)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                </button>
                <button className="member-action-btn remove" onClick={() => onRemove(member._id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Remove
                </button>
            </div>
        </div>
    );
}
