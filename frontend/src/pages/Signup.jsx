import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState(null);
    const { signup, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        setError(null);

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        const result = await signup(name, email, password);

        if (result.success) {
            navigate("/app");
        }

        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="auth-back">
                    ← Back to Home
                </Link>

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">💊</div>
                        <h1>Create Account</h1>
                        <p>Sign up to start using Prescripto</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {(error || localError) && (
                            <div className="auth-error">
                                <span>⚠️</span> {error || localError}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className="auth-submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
