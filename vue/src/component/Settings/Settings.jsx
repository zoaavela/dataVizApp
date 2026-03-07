import React, { useState, useEffect } from 'react';
import './Settings.css';

const TRANSLATIONS = {
    fr: {
        config: "Configuration",
        title: "Paramètres",
        subtitle: "Personnalisez votre interface et vos préférences d'analyse.",
        tabApparence: "Apparence",
        tabLangue: "Langue & Région",
        tabDonnees: "Données & Export",
        appTitle: "Apparence de l'interface",
        appDesc: "Choisissez le thème visuel de votre tableau de bord.",
        themeLabel: "Thème global",
        themeSub: "Le mode sombre est recommandé pour une meilleure lisibilité des graphiques.",
        themeLight: "Clair",
        themeDark: "Sombre",
        animLabel: "Animations des graphiques",
        animSub: "Désactiver pour améliorer les performances sur les machines lentes.",
        langTitle: "Langue et Région",
        langDesc: "Gérez la langue d'affichage et le format des nombres.",
        langLabel: "Langue de l'interface",
        langSub: "S'applique immédiatement à tous les modules.",
        dataTitle: "Données et Exportation",
        dataDesc: "Configurez le comportement par défaut des données extraites.",
        dataLabel: "Format d'export par défaut",
        dataSub: "Format utilisé lors du téléchargement des jeux de données.",
        save: "Enregistrer les modifications",
        saved: "Modifications enregistrées !"
    },
    en: {
        config: "Configuration",
        title: "Settings",
        subtitle: "Customize your interface and analysis preferences.",
        tabApparence: "Appearance",
        tabLangue: "Language & Region",
        tabDonnees: "Data & Export",
        appTitle: "Interface Appearance",
        appDesc: "Choose the visual theme of your dashboard.",
        themeLabel: "Global Theme",
        themeSub: "Dark mode is recommended for better chart readability.",
        themeLight: "Light",
        themeDark: "Dark",
        animLabel: "Chart Animations",
        animSub: "Disable to improve performance on slower machines.",
        langTitle: "Language and Region",
        langDesc: "Manage display language and number format.",
        langLabel: "Interface Language",
        langSub: "Applies immediately to all modules.",
        dataTitle: "Data and Export",
        dataDesc: "Configure the default behavior for extracted data.",
        dataLabel: "Default Export Format",
        dataSub: "Format used when downloading datasets.",
        save: "Save changes",
        saved: "Changes saved!"
    }
};

export default function Settings() {
    const [activeTab, setActiveTab] = useState('apparence');
    const [savedMessage, setSavedMessage] = useState(false);

    const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
    const [language, setLanguage] = useState(() => localStorage.getItem('app_lang') || 'fr');
    const [animations, setAnimations] = useState(() => localStorage.getItem('app_anim') !== 'false');
    const [dataFormat, setDataFormat] = useState(() => localStorage.getItem('app_data_format') || 'csv');

    const t = TRANSLATIONS[language] || TRANSLATIONS['fr'];

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
        } else {
            document.documentElement.classList.add('theme-dark');
            document.documentElement.classList.remove('theme-light');
        }
    }, [theme]);

    useEffect(() => {
        if (!animations) {
            document.documentElement.classList.add('disable-animations');
        } else {
            document.documentElement.classList.remove('disable-animations');
        }
    }, [animations]);

    const handleSave = () => {
        localStorage.setItem('app_theme', theme);
        localStorage.setItem('app_lang', language);
        localStorage.setItem('app_anim', animations);
        localStorage.setItem('app_data_format', dataFormat);

        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    return (
        <div className="sys-settings-layout">
            <div className="bento-header-panel">
                <span className="quadrant-module-badge sys-settings-badge">{t.config}</span>
                <h1 className="bento-title uppercase tracking-tight">{t.title}</h1>
                <p className="bento-subtitle">{t.subtitle}</p>
            </div>

            <div className="sys-settings-grid">

                <div className="sys-settings-sidebar">
                    <nav className="sys-settings-nav">
                        <button
                            className={`sys-settings-nav-item ${activeTab === 'apparence' ? 'active' : ''}`}
                            onClick={() => setActiveTab('apparence')}
                        >
                            <span className="sys-nav-icon"></span>
                            {t.tabApparence}
                        </button>
                        <button
                            className={`sys-settings-nav-item ${activeTab === 'langue' ? 'active' : ''}`}
                            onClick={() => setActiveTab('langue')}
                        >
                            <span className="sys-nav-icon"></span>
                            {t.tabLangue}
                        </button>
                        <button
                            className={`sys-settings-nav-item ${activeTab === 'donnees' ? 'active' : ''}`}
                            onClick={() => setActiveTab('donnees')}
                        >
                            <span className="sys-nav-icon"></span>
                            {t.tabDonnees}
                        </button>
                    </nav>
                </div>

                <div className="sys-settings-content bento-analysis-card">

                    {activeTab === 'apparence' && (
                        <div className="sys-settings-section sys-animate-fade-in">
                            <h2 className="sys-settings-section-title">{t.appTitle}</h2>
                            <p className="sys-settings-section-desc">{t.appDesc}</p>

                            <div className="sys-settings-row">
                                <div className="sys-settings-info">
                                    <span className="sys-settings-label">{t.themeLabel}</span>
                                    <span className="sys-settings-sublabel">{t.themeSub}</span>
                                </div>
                                <div className="sys-theme-selector-group">
                                    <button
                                        className={`sys-theme-btn ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        {t.themeLight}
                                    </button>
                                    <button
                                        className={`sys-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        {t.themeDark}
                                    </button>
                                </div>
                            </div>

                            <div className="sys-settings-row">
                                <div className="sys-settings-info">
                                    <span className="sys-settings-label">{t.animLabel}</span>
                                    <span className="sys-settings-sublabel">{t.animSub}</span>
                                </div>
                                <label className="sys-toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={animations}
                                        onChange={() => setAnimations(!animations)}
                                    />
                                    <span className="sys-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'langue' && (
                        <div className="sys-settings-section sys-animate-fade-in">
                            <h2 className="sys-settings-section-title">{t.langTitle}</h2>
                            <p className="sys-settings-section-desc">{t.langDesc}</p>

                            <div className="sys-settings-row">
                                <div className="sys-settings-info">
                                    <span className="sys-settings-label">{t.langLabel}</span>
                                    <span className="sys-settings-sublabel">{t.langSub}</span>
                                </div>
                                <select
                                    className="bento-input-select sys-settings-select"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'donnees' && (
                        <div className="sys-settings-section sys-animate-fade-in">
                            <h2 className="sys-settings-section-title">{t.dataTitle}</h2>
                            <p className="sys-settings-section-desc">{t.dataDesc}</p>

                            <div className="sys-settings-row">
                                <div className="sys-settings-info">
                                    <span className="sys-settings-label">{t.dataLabel}</span>
                                    <span className="sys-settings-sublabel">{t.dataSub}</span>
                                </div>
                                <select
                                    className="bento-input-select sys-settings-select"
                                    value={dataFormat}
                                    onChange={(e) => setDataFormat(e.target.value)}
                                >
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                    <option value="xlsx">Excel (.xlsx)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="sys-settings-actions">
                        {savedMessage && <span className="sys-settings-saved-msg">{t.saved}</span>}
                        <button className="sys-settings-save-btn" onClick={handleSave}>
                            {t.save}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
