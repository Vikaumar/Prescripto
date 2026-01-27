import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-container">
                    <div className="nav-brand">
                        <div className="nav-logo">
                            <div className="pill-icon">
                                <div className="pill-top"></div>
                                <div className="pill-bottom"></div>
                            </div>
                        </div>
                        <span className="brand-text">Prescripto</span>
                    </div>
                    <div className="nav-center">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How it Works</a>
                        <a href="#about" className="nav-link">About</a>
                    </div>
                    <div className="nav-links">
                        {isAuthenticated ? (
                            <Link to="/app" className="nav-btn primary">Go to App →</Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-btn secondary">Login</Link>
                                <Link to="/signup" className="nav-btn primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-effects">
                    <div className="hero-glow glow-1"></div>
                    <div className="hero-glow glow-2"></div>
                </div>
                <div className="landing-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            <span>AI-Powered Prescription Analysis</span>
                        </div>
                        <h1 className="hero-title">
                            Understand Your
                            <span className="gradient-text"> Prescription</span>
                            <br />in Simple Words
                        </h1>
                        <p className="hero-subtitle">
                            Upload your prescription and get AI-powered explanations of your medicines,
                            dosages, side effects, and more. No more confusion about medical terms.
                        </p>
                        <div className="hero-cta">
                            <Link to={isAuthenticated ? "/app" : "/signup"} className="cta-btn primary">
                                Start Analyzing →
                            </Link>
                            <a href="#how-it-works" className="cta-btn secondary">
                                See How It Works
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-value">95%</span>
                                <span className="stat-label">OCR Accuracy</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value">13+</span>
                                <span className="stat-label">Languages</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value">Free</span>
                                <span className="stat-label">To Use</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Light Background */}
            <section className="features-light" id="features">
                <div className="landing-container">
                    <div className="section-header-light">
                        <span className="section-tag">Why Choose Us</span>
                        <h2>Powerful Features for Better Understanding</h2>
                        <p>Our AI-powered platform makes it easy to decode complex medical prescriptions</p>
                    </div>
                    <div className="features-light-grid">
                        <div className="feature-light-card">
                            <div className="feature-light-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>Smart OCR Technology</h3>
                            <p>Advanced optical character recognition that accurately reads even the most challenging handwritten prescriptions from doctors.</p>
                        </div>
                        <div className="feature-light-card">
                            <div className="feature-light-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>AI-Powered Explanations</h3>
                            <p>Get detailed, easy-to-understand explanations of medicines, dosages, side effects, and drug interactions in plain language.</p>
                        </div>
                        <div className="feature-light-card">
                            <div className="feature-light-icon orange">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <h3>13+ Regional Languages</h3>
                            <p>Understand your prescription in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, and many more languages.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Dark Background */}
            <section className="how-it-works" id="how-it-works">
                <div className="landing-container">
                    <div className="section-header">
                        <span className="section-tag-dark">Simple Process</span>
                        <h2 className="gradient-title">How It Works</h2>
                        <p>Get your prescription analyzed in three simple steps — it takes less than a minute!</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <div className="step-icon green">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17,8 12,3 7,8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h3>Upload Your Prescription</h3>
                            <p>Take a clear photo or upload an existing image of your prescription. Supports JPG, PNG, and PDF formats.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <div className="step-icon teal">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>AI Analyzes Content</h3>
                            <p>Our advanced AI scans and extracts medicine names, dosages, frequency, and special instructions automatically.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <div className="step-icon purple">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3>Understand Everything</h3>
                            <p>Get clear explanations for each medicine — what it does, when to take it, potential side effects, and precautions.</p>
                        </div>
                    </div>
                    <div className="steps-cta">
                        <Link to={isAuthenticated ? "/app" : "/signup"} className="cta-btn primary">
                            Try It Now — It's Free →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" id="about">
                <div className="landing-container">
                    <div className="footer-main">
                        <div className="footer-brand-section">
                            <div className="footer-logo">
                                <div className="footer-heart-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <span className="footer-brand-text">Prescripto</span>
                            </div>
                            <p className="footer-tagline">Making prescriptions easier to understand for everyone. Your health companion powered by AI.</p>
                            <div className="footer-social">
                                <a href="#" className="social-link" aria-label="Twitter">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a href="#" className="social-link" aria-label="LinkedIn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="#" className="social-link" aria-label="GitHub">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                <a href="mailto:support@prescripto.com" className="social-link" aria-label="Email">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className="footer-links">
                            <div className="footer-col">
                                <h4>PRODUCT</h4>
                                <a href="#features">Features</a>
                                <a href="#how-it-works">How It Works</a>
                                <a href="#">Pricing</a>
                                <a href="#">API Access</a>
                            </div>
                            <div className="footer-col">
                                <h4>SUPPORT</h4>
                                <a href="#">Help Center</a>
                                <a href="#">FAQs</a>
                                <a href="#">Contact Us</a>
                                <a href="#">Feedback</a>
                            </div>
                            <div className="footer-col">
                                <h4>LEGAL</h4>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">Cookie Policy</a>
                                <a href="#">Disclaimer</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Prescripto. All rights reserved. Made with ❤️ in India.</p>
                        <p className="footer-disclaimer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            This tool is for educational purposes only. Always consult your doctor for medical advice.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
