import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await login(email, password);

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
                        <h1>Welcome Back</h1>
                        <p>Login to continue to Prescripto</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="auth-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

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
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="auth-submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/signup">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
