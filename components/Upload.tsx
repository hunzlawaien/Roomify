import React, {useCallback, useMemo, useRef, useState} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS} from "../lib/constants";

type UploadProps = {
    onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const progressRef = useRef(0);
    const base64Ref = useRef<string | null>(null);
    const completedRef = useRef(false);

    const {isSignedIn} = useOutletContext<AuthContext>();

    const clearProgressInterval = () => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const processFile = useCallback((f: File) => {
        if (!isSignedIn) return; // Block when not signed in

        setFile(f);
        setProgress(0);

        // Start simulated progress
        clearProgressInterval();
        intervalRef.current = window.setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(100, prev + PROGRESS_STEP);
                progressRef.current = next;
                if (next === 100) {
                    clearProgressInterval();
                    // If file already read, finalize
                    if (!completedRef.current && base64Ref.current) {
                        completedRef.current = true;
                        if (onComplete) {
                            setTimeout(() => onComplete(base64Ref.current as string), REDIRECT_DELAY_MS);
                        }
                    }
                }
                return next;
            });
        }, PROGRESS_INTERVAL_MS);

        // Read file as Base64
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            base64Ref.current = result;
            if (progressRef.current === 100 && !completedRef.current) {
                completedRef.current = true;
                if (onComplete) {
                    setTimeout(() => onComplete(result), REDIRECT_DELAY_MS);
                }
            }
        };
        reader.onerror = () => {
            clearProgressInterval();
        };
        reader.readAsDataURL(f);
    }, [isSignedIn, onComplete]);

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        if (!isSignedIn) return; // Block when not signed in
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(false);
        const dt = e.dataTransfer;
        const files = dt?.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // Keep progressRef in sync
    React.useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => clearProgressInterval();
    }, []);

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleInputChange}
                        disabled={!isSignedIn}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Click to upload or drag and drop"
                            ):(
                                "Sign in or sign up to upload"
                            )}
                        </p>
                        <p className="help">Maximum file size 50 MB.</p>
                    </div>
                </div>
            ):(
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ):(
                                <ImageIcon className="image"/>
                            )}
                        </div>
                        <h3>{file.name}</h3>
                        <div className="progress">
                        <div className="bar" style={{width: `${progress}%`}}></div>
                        <p className="status-text">
                            {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                        </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
export default Upload
