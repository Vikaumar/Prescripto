import './Loader.css';

function Loader({ size = 'md', text = 'Loading...' }) {
    return (
        <div className={`loader-container loader-${size}`}>
            <div className="loader-spinner">
                <svg viewBox="0 0 50 50" className="loader-svg">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                        className="loader-circle"
                    />
                </svg>
                <span className="loader-icon">💊</span>
            </div>
            {text && <p className="loader-text">{text}</p>}
        </div>
    );
}

export default Loader;
