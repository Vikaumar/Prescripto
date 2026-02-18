import { useState, useEffect } from 'react';
import './AddFamilyMemberModal.css';

const RELATIONSHIPS = [
    "Mother", "Father", "Spouse", "Son", "Daughter",
    "Brother", "Sister", "Grandparent", "Grandchild",
    "Uncle", "Aunt", "Cousin", "Friend", "Other"
];

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AddMemberModal({ isOpen, onClose, onSubmit, editMember = null }) {
    const [form, setForm] = useState({
        name: '',
        relationship: 'Other',
        email: '',
        role: 'member',
        dateOfBirth: '',
        bloodGroup: '',
        emergencyContact: { phone: '', isEmergency: false },
        allergies: '',
        conditions: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editMember) {
            setForm({
                name: editMember.name || '',
                relationship: editMember.relationship || 'Other',
                email: editMember.email || '',
                role: editMember.role || 'member',
                dateOfBirth: editMember.dateOfBirth ? editMember.dateOfBirth.split('T')[0] : '',
                bloodGroup: editMember.bloodGroup || '',
                emergencyContact: editMember.emergencyContact || { phone: '', isEmergency: false },
                allergies: editMember.allergies?.join(', ') || '',
                conditions: editMember.conditions?.join(', ') || '',
                notes: editMember.notes || ''
            });
        } else {
            resetForm();
        }
    }, [editMember, isOpen]);

    const resetForm = () => {
        setForm({
            name: '', relationship: 'Other', email: '', role: 'member',
            dateOfBirth: '', bloodGroup: '',
            emergencyContact: { phone: '', isEmergency: false },
            allergies: '', conditions: '', notes: ''
        });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('emergency.')) {
            const field = name.split('.')[1];
            setForm(f => ({
                ...f,
                emergencyContact: { ...f.emergencyContact, [field]: type === 'checkbox' ? checked : value }
            }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = {
                ...form,
                allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
                conditions: form.conditions ? form.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            await onSubmit(data, editMember?._id);
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="add-member-overlay" onClick={onClose}>
            <div className="add-member-modal" onClick={e => e.stopPropagation()}>
                <div className="add-member-header">
                    <h3>{editMember ? 'Edit Family Member' : 'Add Family Member'}</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {error && <div className="add-member-error">{error}</div>}

                <form onSubmit={handleSubmit} className="add-member-form">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h4>Basic Information</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
                            </div>
                            <div className="form-group">
                                <label>Relationship</label>
                                <select name="relationship" value={form.relationship} onChange={handleChange}>
                                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email (optional)</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="member">👁️ Member (View Only)</option>
                                    <option value="caretaker">🔑 Caretaker (Full Access)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Blood Group</label>
                                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg || '— Select —'}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Emergency & Health */}
                    <div className="form-section">
                        <h4>🚨 Emergency & Health</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Emergency Phone</label>
                                <input name="emergency.phone" value={form.emergencyContact.phone} onChange={handleChange} placeholder="+91 9876543210" />
                            </div>
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="emergency.isEmergency" checked={form.emergencyContact.isEmergency} onChange={handleChange} />
                                    <span>Mark as primary emergency contact</span>
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Allergies (comma separated)</label>
                            <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Penicillin, Peanuts, Dust" />
                        </div>
                        <div className="form-group">
                            <label>Medical Conditions (comma separated)</label>
                            <input name="conditions" value={form.conditions} onChange={handleChange} placeholder="Diabetes, Hypertension" />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." rows="2" />
                        </div>
                    </div>

                    <div className="add-member-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : (editMember ? 'Save Changes' : 'Add Member')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
