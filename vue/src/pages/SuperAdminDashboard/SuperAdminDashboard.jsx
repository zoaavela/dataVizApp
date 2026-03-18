import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import LogoLoader from '../../components/LogoLoader/LogoLoader';
import { getAdminRequests, approveAdminRequest, rejectAdminRequest } from '../../services/superAdminService';
import './SuperAdminDashboard.css';

export default function SuperAdminDashboard() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminRequests();
            setRequests(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des demandes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveAdminRequest(id);
            setRequests(requests.filter(req => req.id !== id));
        } catch (error) {
            console.error("Erreur lors de l'approbation", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectAdminRequest(id);
            setRequests(requests.filter(req => req.id !== id));
        } catch (error) {
            console.error("Erreur lors du refus", error);
        }
    };

    if (isLoading) return <LogoLoader text="Chargement du panel..." />;

    return (
        <div className="sa-dashboard-wrapper">
            <header className="sa-header">
                <div>
                    <h1 className="sa-main-title">Super Admin</h1>
                    <p className="sa-main-subtitle">Gestion des accès et habilitations de la plateforme.</p>
                </div>
            </header>

            <div className="sa-body-layout">
                {requests.length === 0 ? (
                    <div className="sa-empty-state">
                        <Clock size={32} className="sa-icon-muted" />
                        <p className="sa-empty-text">Aucune demande d'accès en attente.</p>
                    </div>
                ) : (
                    <div className="sa-grid">
                        {requests.map((req) => (
                            <div key={req.id} className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-user-info">
                                        <h3 className="sa-user-name">{req.nom} {req.prenom}</h3>
                                        <p className="sa-user-email">{req.email}</p>
                                    </div>
                                    <span className="sa-badge-pending">En attente</span>
                                </div>
                                <div className="sa-card-actions">
                                    <button onClick={() => handleReject(req.id)} className="sa-btn sa-btn-reject">
                                        <X size={14} /> Refuser
                                    </button>
                                    <button onClick={() => handleApprove(req.id)} className="sa-btn sa-btn-approve">
                                        <Check size={14} /> Approuver
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}