import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="lp">
            {/* ── Nav ── */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-brand">
                        <svg className="lp-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#features" className="lp-nav-link">Features</a>
                        <a href="#how" className="lp-nav-link">How it Works</a>
                        <a href="#about" className="lp-nav-link">About</a>
                    </div>
                    <div className="lp-nav-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="lp-btn-pill filled">Go to App</Link>
                        ) : (
                            <>
                                <Link to="/signup" className="lp-btn-pill filled">Get Started</Link>
                                <Link to="/login" className="lp-btn-pill outline">Log In</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="lp-hero">
                <div className="lp-hero-inner">
                    <div className="lp-hero-text">
                        <h1 className="lp-headline">
                            ⚡ Decode Your<br />
                            Prescription 💊 in<br />
                            Simple Words 🧠
                        </h1>
                        <p className="lp-subtext">
                            No more doctor-handwriting panic. Prescripto uses AI to scan your
                            prescriptions, explain medicines, track dosages, and find nearby
                            pharmacies — all for free.
                        </p>
                        <div className="lp-hero-cta">
                            <Link to={isAuthenticated ? "/app" : "/signup"} className="lp-cta-main">
                                Try It Free
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="10 8 16 12 10 16 10 8" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    <div className="lp-hero-visual">
                        <div className="lp-hero-blob" />
                        <div className="lp-hero-card card-1">
                            <div className="lp-hero-card-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <strong>AI Scan</strong>
                                <span>95% OCR Accuracy</span>
                            </div>
                        </div>
                        <div className="lp-hero-card card-2">
                            <div className="lp-hero-card-icon purple">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <strong>Reminders</strong>
                                <span>Never miss a dose</span>
                            </div>
                        </div>
                        <div className="lp-hero-card card-3">
                            <div className="lp-hero-card-icon teal">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                                </svg>
                            </div>
                            <div>
                                <strong>Pharmacy</strong>
                                <span>Find nearby stores</span>
                            </div>
                        </div>
                        <div className="lp-float-badge badge-lang">🌐 13+ Languages</div>
                        <div className="lp-float-badge badge-free">✨ 100% Free</div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="lp-features" id="features">
                <div className="lp-section-inner">
                    <div className="lp-section-head">
                        <span className="lp-tag">Why Prescripto</span>
                        <h2>Powerful Features for Better Health</h2>
                        <p>Everything you need to understand and manage your prescriptions</p>
                    </div>
                    <div className="lp-features-grid">
                        <div className="lp-feat-card">
                            <div className="lp-feat-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>Smart OCR</h3>
                            <p>Reads even the most challenging handwritten prescriptions with advanced optical character recognition.</p>
                        </div>
                        <div className="lp-feat-card">
                            <div className="lp-feat-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h3>AI Explanations</h3>
                            <p>Get clear, easy-to-understand explanations of medicines, dosages, side effects, and interactions.</p>
                        </div>
                        <div className="lp-feat-card">
                            <div className="lp-feat-icon orange">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <h3>13+ Languages</h3>
                            <p>Understand prescriptions in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, and more.</p>
                        </div>
                        <div className="lp-feat-card">
                            <div className="lp-feat-icon purple">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>Family Care</h3>
                            <p>Manage prescriptions for your whole family. Add members, share access, and store emergency contacts.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="lp-how" id="how">
                <div className="lp-section-inner">
                    <div className="lp-section-head dark">
                        <span className="lp-tag-dark">Simple Process</span>
                        <h2>How It Works</h2>
                        <p>Three simple steps — takes less than a minute</p>
                    </div>
                    <div className="lp-steps">
                        <div className="lp-step">
                            <div className="lp-step-num">01</div>
                            <h3>Upload</h3>
                            <p>Take a photo or upload an existing image of your prescription</p>
                        </div>
                        <div className="lp-step-divider">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                        <div className="lp-step">
                            <div className="lp-step-num">02</div>
                            <h3>AI Analyzes</h3>
                            <p>Our AI scans and extracts medicines, dosages, and instructions</p>
                        </div>
                        <div className="lp-step-divider">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                        <div className="lp-step">
                            <div className="lp-step-num">03</div>
                            <h3>Understand</h3>
                            <p>Get clear explanations, set reminders, and find pharmacies</p>
                        </div>
                    </div>
                    <div className="lp-how-cta">
                        <Link to={isAuthenticated ? "/app" : "/signup"} className="lp-cta-main light">
                            Try It Now — It's Free →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer" id="about">
                <div className="lp-section-inner">
                    <div className="lp-footer-grid">
                        <div className="lp-footer-brand">
                            <div className="lp-footer-logo">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span>Prescripto</span>
                            </div>
                            <p>Making prescriptions easier to understand for everyone.</p>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Features</h4>
                            <a href="#features">Smart OCR</a>
                            <a href="#features">AI Analysis</a>
                            <a href="#features">Multi-language</a>
                            <a href="#features">Family Care</a>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Resources</h4>
                            <a href="#how">How It Works</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Contact Us</a>
                        </div>
                    </div>
                    <div className="lp-footer-bottom">
                        <p>© 2026 Prescripto. All rights reserved. Made with ❤️ in India.</p>
                        <p className="lp-disclaimer">
                            ⓘ This tool is for educational purposes only. Always consult your doctor.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
