import { useState, useRef } from 'react';
import './UploadBox.css';

function UploadBox({ onUpload, isLoading = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file) => {
        setFileName(file.name);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Call parent handler
        if (onUpload) {
            onUpload(file);
        }
    };

    const handleClick = () => {
        if (!isLoading) {
            fileInputRef.current?.click();
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setPreview(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={`upload-box ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''} ${isLoading ? 'loading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileInput}
                className="upload-input"
                disabled={isLoading}
            />

            {preview ? (
                <div className="upload-preview">
                    <img src={preview} alt="Prescription preview" className="preview-image" />
                    <div className="preview-overlay">
                        <span className="preview-filename">{fileName}</span>
                        {!isLoading && (
                            <button className="preview-clear" onClick={handleClear}>
                                ✕ Remove
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="upload-content">
                    <div className="upload-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <h3 className="upload-title">Upload Prescription</h3>
                    <p className="upload-subtitle">
                        Drag & drop your prescription image here, or <span className="upload-link">browse</span>
                    </p>
                    <p className="upload-hint">
                        Supports JPG, JPEG, PNG (max 5MB)
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="upload-loading-overlay">
                    <div className="upload-loading-spinner" />
                    <p>Processing your prescription...</p>
                </div>
            )}
        </div>
    );
}

export default UploadBox;
