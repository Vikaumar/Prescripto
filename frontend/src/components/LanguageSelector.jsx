import { useState, useEffect } from 'react';
import { getLanguages } from '../services/api';
import './LanguageSelector.css';

const DEFAULT_LANGUAGES = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    bn: "Bengali",
    mr: "Marathi",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi",
};

function LanguageSelector({ selectedLanguage = 'en', onLanguageChange, disabled = false }) {
    const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch languages from API
        getLanguages()
            .then((res) => {
                if (res.success && res.data) {
                    setLanguages(res.data);
                }
            })
            .catch(() => {
                // Use defaults if API fails
            });
    }, []);

    const handleSelect = (code) => {
        if (onLanguageChange) {
            onLanguageChange(code);
        }
        setIsOpen(false);
    };

    const currentLanguage = languages[selectedLanguage] || 'English';

    return (
        <div className={`language-selector ${disabled ? 'disabled' : ''}`}>
            <button
                className="language-toggle"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className="language-icon">🌐</span>
                <span className="language-current">{currentLanguage}</span>
                <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {Object.entries(languages).map(([code, name]) => (
                        <button
                            key={code}
                            className={`language-option ${code === selectedLanguage ? 'active' : ''}`}
                            onClick={() => handleSelect(code)}
                        >
                            {name}
                            {code === selectedLanguage && <span className="check">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
