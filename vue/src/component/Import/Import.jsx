import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertTriangle } from 'lucide-react';
import { importCsv } from '../../services/adminService';
import './Import.css';

export default function Import() {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
    const [progress, setProgress] = useState(0);
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
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.json')) {
            setFile(selectedFile);
            setUploadState('idle');
            setProgress(0);
        } else {
            alert('Format non supporté. Veuillez importer un fichier CSV ou JSON.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploadState('uploading');
        setProgress(30);

        try {
            const response = await importCsv(file);

            setProgress(100);
            setUploadState('success');
            console.log("Résultat de l'import :", response);
        } catch (err) {
            console.error("Erreur lors de l'import CSV :", err);
            setUploadState('error');
        }
    };

    const resetModule = () => {
        setFile(null);
        setUploadState('idle');
        setProgress(0);
    };

    return (
        <div className="bento-workspace">
            <header className="workspace-header">
                <div className="workspace-surtitle" style={{ color: '#ef4444' }}>
                    <span style={{ backgroundColor: '#ef4444', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                    Zone Administrateur
                </div>
                <h1 className="workspace-title">Import de Données</h1>
                <p className="workspace-subtitle">Mettez à jour les données territoriales en injectant vos fichiers sources (CSV, JSON).</p>
            </header>

            <div className="import-container">
                {uploadState === 'idle' && (
                    <div
                        className={`import-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".csv, .json"
                            style={{ display: 'none' }}
                        />

                        {!file ? (
                            <>
                                <div className="dropzone-icon">
                                    <UploadCloud size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className="dropzone-title">Glissez-déposez votre fichier ici</h3>
                                <p className="dropzone-text">ou cliquez pour parcourir vos dossiers (CSV, JSON)</p>
                            </>
                        ) : (
                            <>
                                <div className="dropzone-icon file-ready">
                                    <FileType size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className="dropzone-title">{file.name}</h3>
                                <p className="dropzone-text">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        )}
                    </div>
                )}

                {uploadState === 'uploading' && (
                    <div className="import-status-box">
                        <h3 className="status-title">Importation en cours...</h3>
                        <p className="status-text">Transfert et traitement de {file?.name}</p>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="progress-text">{progress}%</div>
                    </div>
                )}

                {uploadState === 'success' && (
                    <div className="import-status-box success">
                        <CheckCircle size={48} color="#10b981" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                        <h3 className="status-title" style={{ color: '#10b981' }}>Base de données mise à jour !</h3>
                        <p className="status-text">Les données de <strong>{file?.name}</strong> ont été intégrées avec succès.</p>
                        <button className="import-btn-secondary" onClick={resetModule}>Importer un autre fichier</button>
                    </div>
                )}

                {uploadState === 'error' && (
                    <div className="import-status-box error">
                        <AlertTriangle size={48} color="#ef4444" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                        <h3 className="status-title" style={{ color: '#ef4444' }}>Échec de l'importation</h3>
                        <p className="status-text">Une erreur est survenue lors de l'envoi ou du traitement du fichier.</p>
                        <button className="import-btn-secondary" onClick={resetModule}>Réessayer</button>
                    </div>
                )}

                {file && uploadState === 'idle' && (
                    <div className="import-actions">
                        <button className="import-btn-secondary" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Annuler</button>
                        <button className="import-btn-primary" onClick={handleUpload}>Lancer l'importation</button>
                    </div>
                )}
            </div>
        </div>
    );
}