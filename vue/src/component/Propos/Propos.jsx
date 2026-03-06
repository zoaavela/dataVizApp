import React from 'react';
import { Target, Users, Database, Mail, ExternalLink, Calendar, Code } from 'lucide-react';
import './Propos.css';

export default function Propos() {
    const teamMembers = [
        { name: "Enzo Abdi", role: "Lead Data Analyst / Backend" },
        { name: "Erwan Picard-Alvarez", role: "Développeur Front-End / React" },
        { name: "Lucas Robert", role: "UI/UX Designer / Intégrateur" },
        { name: "Enes Gundem", role: "UI/UX Designer / Intégrateur" }
    ];

    return (
        <div className="bi-about-container">
            {/* --- EN-TÊTE CENTRÉ --- */}
            <header className="bi-about-header">
                <div className="about-badge">Notre Démarche</div>
                <h1 className="about-title">À Propos du Projet</h1>
                <p className="about-subtitle">
                    Rendre la donnée territoriale accessible, visuelle et impactante.
                </p>
            </header>

            {/* --- SECTION 1 : MISSION --- */}
            <section className="bi-about-section">
                <div className="about-mission-block">
                    <Target className="mission-icon" size={32} />
                    <h2>Notre Objectif</h2>
                    <p>
                        Nous sommes un groupe d'étudiants en <strong>BUT Métiers du Multimédia et de l'Internet</strong>.
                        Face à la complexité des bases de données publiques, nous avons créé <strong>Vision</strong> avec une conviction simple : la donnée stratégique ne doit pas être réservée aux seuls experts.
                    </p>
                    <p>
                        Notre but est de transformer des millions de lignes de données brutes en <strong>Data Visualisations</strong> claires et interactives pour permettre aux décideurs et citoyens de comprendre les dynamiques de nos territoires.
                    </p>
                    <div className="academic-note">
                        Projet réalisé dans le cadre de d'un projet scolaire sous la supervision de M.Laroussi.
                    </div>
                </div>
            </section>

            {/* --- SECTION 2 : L'ÉQUIPE (Grille 4 colonnes symétrique) --- */}
            <section className="bi-about-section">
                <div className="section-title-wrapper">
                    <Users className="section-icon" size={24} />
                    <h2>L'Équipe</h2>
                </div>
                <div className="about-team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="team-card">
                            <div className="team-avatar">
                                {member.name.charAt(0)}
                            </div>
                            <h3>{member.name}</h3>
                            <span>{member.role}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- SECTION 3 : SOURCES & TECH (Grille 3 colonnes symétrique) --- */}
            <section className="bi-about-section">
                <div className="section-title-wrapper">
                    <Database className="section-icon" size={24} />
                    <h2>Architecture & Données (INSEE)</h2>
                </div>
                <p className="sources-intro">
                    L'intégralité des indicateurs présents sur cette plateforme repose sur des données ouvertes (Open Data) rigoureuses et certifiées.
                </p>
                <div className="about-sources-grid">
                    <div className="source-card">
                        <Database className="source-icon" size={24} />
                        <h3>Bases exploitées</h3>
                        <p>Filosofi (Pauvreté), RPLS (Logement Social), Recensement de la Population.</p>
                    </div>
                    <div className="source-card">
                        <Calendar className="source-icon" size={24} />
                        <h3>Millésime</h3>
                        <p>Données traitées sur la période de <strong>2019</strong> à <strong>2022</strong> pour garantir la pertinence.</p>
                    </div>
                    <div className="source-card">
                        <Code className="source-icon" size={24} />
                        <h3>Technologies</h3>
                        <p>API développée sous <strong>Symfony</strong>. Nettoyage et agrégation personnalisés.</p>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4 : CONTACT --- */}
            <section className="bi-about-section contact-section">
                <h2>Nous Contacter</h2>
                <p>
                    Vous êtes intéressé par notre démarche, vous avez repéré une anomalie ou vous souhaitez échanger ? N'hésitez pas à nous écrire.
                </p>
                <div className="contact-actions">
                    <a href="mailto:contact@domaine.com" className="bi-btn btn-primary">
                        <Mail size={18} /> Envoyer un e-mail
                    </a>
                    <a href="#" target="_blank" rel="noreferrer" className="bi-btn btn-outline">
                        <ExternalLink size={18} /> Consulter notre LinkedIn
                    </a>
                </div>
            </section>
        </div>
    );
}