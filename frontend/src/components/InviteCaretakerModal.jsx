import { useState } from 'react';
import './InviteCaretakerModal.css';

export default function InviteCaretakerModal({ isOpen, onClose, onInvite }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('caretaker');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { type: 'success' | 'error', message }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            await onInvite({ email: email.trim(), role });
            setResult({ type: 'success', message: `Invitation sent to ${email}!` });
            setEmail('');
        } catch (err) {
            setResult({ type: 'error', message: err.message || 'Failed to send invitation' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setResult(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="invite-overlay" onClick={handleClose}>
            <div className="invite-modal" onClick={e => e.stopPropagation()}>
                <div className="invite-header">
                    <div className="invite-header-icon">🤝</div>
                    <h3>Invite Caretaker</h3>
                    <button className="invite-close" onClick={handleClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <p className="invite-desc">
                    Invite another Prescripto user by their email. They'll be added as a caretaker
                    who can help manage family health information.
                </p>

                {result && (
                    <div className={`invite-result ${result.type}`}>
                        {result.type === 'success' ? '✅' : '❌'} {result.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="invite-form">
                    <div className="invite-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="caretaker@example.com"
                            required
                        />
                    </div>
                    <div className="invite-field">
                        <label>Access Level</label>
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="caretaker">🔑 Caretaker — Full Access</option>
                            <option value="member">👁️ Member — View Only</option>
                        </select>
                    </div>
                    <div className="invite-actions">
                        <button type="button" className="invite-cancel" onClick={handleClose}>Cancel</button>
                        <button type="submit" className="invite-send" disabled={loading || !email.trim()}>
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
