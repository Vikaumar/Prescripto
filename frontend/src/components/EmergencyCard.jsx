import './EmergencyCard.css';

export default function EmergencyCard({ members }) {
    if (!members || members.length === 0) return null;

    return (
        <div className="emergency-panel">
            <div className="emergency-panel-header">
                <span className="emergency-icon">🚨</span>
                <h3>Emergency Quick Access</h3>
            </div>
            <div className="emergency-grid">
                {members.map((member) => (
                    <div key={member._id} className="emergency-item">
                        <div className="emergency-item-header">
                            <span className="emergency-member-name">{member.name}</span>
                            <span className="emergency-member-rel">{member.relationship}</span>
                        </div>

                        <div className="emergency-details">
                            {member.bloodGroup && (
                                <div className="emergency-detail blood">
                                    <span className="detail-label">Blood Group</span>
                                    <span className="detail-value blood-value">{member.bloodGroup}</span>
                                </div>
                            )}

                            {member.emergencyContact?.phone && (
                                <div className="emergency-detail">
                                    <span className="detail-label">Emergency Contact</span>
                                    <a href={`tel:${member.emergencyContact.phone}`} className="detail-value phone-link">
                                        📞 {member.emergencyContact.phone}
                                    </a>
                                </div>
                            )}

                            {member.allergies?.length > 0 && (
                                <div className="emergency-detail">
                                    <span className="detail-label">⚠️ Allergies</span>
                                    <div className="detail-tags">
                                        {member.allergies.map((a, i) => (
                                            <span key={i} className="allergy-tag">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {member.conditions?.length > 0 && (
                                <div className="emergency-detail">
                                    <span className="detail-label">💊 Conditions</span>
                                    <div className="detail-tags">
                                        {member.conditions.map((c, i) => (
                                            <span key={i} className="condition-tag">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
