import React, { useState } from 'react';
import { 
    Search, Globe, CheckCircle, XCircle, AlertTriangle, 
    Zap, FileText, Image, Link2, Shield, Smartphone,
    Clock, TrendingUp, ArrowRight, RefreshCw, Download,
    ChevronDown, ChevronUp, ExternalLink, Copy, Check
} from 'lucide-react';
import './AuditSEO.css';

const AuditSEO = () => {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [auditResult, setAuditResult] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    const handleAudit = async (e) => {
        e.preventDefault();
        if (!url) return;

        setIsAnalyzing(true);
        
        // Simulation d'un audit (à remplacer par l'appel API réel)
        setTimeout(() => {
            setAuditResult({
                url: url,
                score: 72,
                date: new Date().toLocaleDateString('fr-FR'),
                categories: [
                    {
                        id: 'performance',
                        name: 'Performance',
                        icon: Zap,
                        score: 85,
                        status: 'good',
                        items: [
                            { name: 'Temps de chargement', value: '2.3s', status: 'warning', recommendation: 'Optimisez les images et activez la compression GZIP' },
                            { name: 'First Contentful Paint', value: '1.2s', status: 'good', recommendation: null },
                            { name: 'Largest Contentful Paint', value: '2.8s', status: 'warning', recommendation: 'Préchargez les ressources critiques' },
                            { name: 'Cumulative Layout Shift', value: '0.05', status: 'good', recommendation: null },
                        ]
                    },
                    {
                        id: 'seo',
                        name: 'SEO On-Page',
                        icon: Search,
                        score: 68,
                        status: 'warning',
                        items: [
                            { name: 'Balise Title', value: 'Présente (58 caractères)', status: 'good', recommendation: null },
                            { name: 'Meta Description', value: 'Absente', status: 'error', recommendation: 'Ajoutez une meta description de 150-160 caractères' },
                            { name: 'Balises H1', value: '2 trouvées', status: 'warning', recommendation: 'Utilisez une seule balise H1 par page' },
                            { name: 'Structure des titres', value: 'H2, H3 présents', status: 'good', recommendation: null },
                            { name: 'Texte alternatif images', value: '3/10 manquants', status: 'warning', recommendation: 'Ajoutez des attributs alt descriptifs' },
                        ]
                    },
                    {
                        id: 'content',
                        name: 'Contenu',
                        icon: FileText,
                        score: 75,
                        status: 'good',
                        items: [
                            { name: 'Nombre de mots', value: '1,247 mots', status: 'good', recommendation: null },
                            { name: 'Densité de mots-clés', value: '2.3%', status: 'good', recommendation: null },
                            { name: 'Liens internes', value: '5 liens', status: 'warning', recommendation: 'Ajoutez plus de liens internes vers vos pages importantes' },
                            { name: 'Liens externes', value: '2 liens', status: 'good', recommendation: null },
                        ]
                    },
                    {
                        id: 'technical',
                        name: 'Technique',
                        icon: Shield,
                        score: 80,
                        status: 'good',
                        items: [
                            { name: 'HTTPS', value: 'Activé', status: 'good', recommendation: null },
                            { name: 'Sitemap XML', value: 'Trouvé', status: 'good', recommendation: null },
                            { name: 'Robots.txt', value: 'Présent', status: 'good', recommendation: null },
                            { name: 'Canonical URL', value: 'Non définie', status: 'warning', recommendation: 'Ajoutez une balise canonical pour éviter le contenu dupliqué' },
                        ]
                    },
                    {
                        id: 'mobile',
                        name: 'Mobile',
                        icon: Smartphone,
                        score: 70,
                        status: 'warning',
                        items: [
                            { name: 'Responsive Design', value: 'Oui', status: 'good', recommendation: null },
                            { name: 'Viewport configuré', value: 'Oui', status: 'good', recommendation: null },
                            { name: 'Taille des boutons', value: 'Trop petits', status: 'warning', recommendation: 'Augmentez la taille des éléments cliquables (min 48x48px)' },
                            { name: 'Police lisible', value: '14px', status: 'warning', recommendation: 'Utilisez une taille de police minimum de 16px' },
                        ]
                    },
                ],
                quickWins: [
                    'Ajouter une meta description optimisée',
                    'Corriger la double balise H1',
                    'Ajouter les attributs alt manquants',
                    'Définir une URL canonique',
                ]
            });
            setIsAnalyzing(false);
        }, 3000);
    };

    const toggleSection = (id) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return <CheckCircle size={16} className="status-icon good" />;
            case 'warning': return <AlertTriangle size={16} className="status-icon warning" />;
            case 'error': return <XCircle size={16} className="status-icon error" />;
            default: return null;
        }
    };

    return (
        <div className="audit-page">
            <header className="audit-header">
                <div>
                    <h1>Audit SEO</h1>
                    <p>Analysez n'importe quel site web et obtenez des recommandations personnalisées</p>
                </div>
            </header>

            {/* Search Form */}
            <div className="audit-search-card">
                <form onSubmit={handleAudit} className="audit-form">
                    <div className="input-wrapper">
                        <Globe size={20} className="input-icon" />
                        <input
                            type="url"
                            placeholder="Entrez l'URL du site à analyser (ex: https://example.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={isAnalyzing} className="btn-audit">
                        {isAnalyzing ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                Lancer l'audit
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Analyzing State */}
            {isAnalyzing && (
                <div className="analyzing-state">
                    <div className="analyzing-animation">
                        <div className="analyzing-circle"></div>
                        <Search size={32} className="analyzing-icon" />
                    </div>
                    <h3>Analyse en cours...</h3>
                    <p>Nous analysons {url}</p>
                    <div className="analyzing-steps">
                        <span className="step active">Performance</span>
                        <span className="step active">SEO On-Page</span>
                        <span className="step">Contenu</span>
                        <span className="step">Technique</span>
                        <span className="step">Mobile</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {auditResult && !isAnalyzing && (
                <div className="audit-results">
                    {/* Score Overview */}
                    <div className="score-overview">
                        <div className="main-score">
                            <div 
                                className="score-circle"
                                style={{ '--score-color': getScoreColor(auditResult.score) }}
                            >
                                <svg viewBox="0 0 100 100">
                                    <circle className="score-bg" cx="50" cy="50" r="45" />
                                    <circle 
                                        className="score-fill" 
                                        cx="50" cy="50" r="45"
                                        strokeDasharray={`${auditResult.score * 2.83} 283`}
                                        style={{ stroke: getScoreColor(auditResult.score) }}
                                    />
                                </svg>
                                <div className="score-value">
                                    <span className="score-number">{auditResult.score}</span>
                                    <span className="score-label">/ 100</span>
                                </div>
                            </div>
                            <div className="score-info">
                                <h2>Score SEO Global</h2>
                                <p className="score-url">
                                    <Globe size={14} />
                                    {auditResult.url}
                                </p>
                                <p className="score-date">Analysé le {auditResult.date}</p>
                            </div>
                        </div>

                        <div className="category-scores">
                            {auditResult.categories.map(cat => (
                                <div key={cat.id} className="category-score-item">
                                    <cat.icon size={18} />
                                    <span className="cat-name">{cat.name}</span>
                                    <div className="cat-score-bar">
                                        <div 
                                            className="cat-score-fill"
                                            style={{ 
                                                width: `${cat.score}%`,
                                                background: getScoreColor(cat.score)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="cat-score-value">{cat.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Wins */}
                    <div className="quick-wins-card">
                        <div className="qw-header">
                            <Zap size={20} />
                            <h3>Quick Wins - Actions prioritaires</h3>
                        </div>
                        <ul className="qw-list">
                            {auditResult.quickWins.map((win, i) => (
                                <li key={i}>
                                    <ArrowRight size={14} />
                                    {win}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Detailed Results */}
                    <div className="detailed-results">
                        <h3>Résultats détaillés</h3>
                        
                        {auditResult.categories.map(category => (
                            <div key={category.id} className="result-category">
                                <button 
                                    className="category-header"
                                    onClick={() => toggleSection(category.id)}
                                >
                                    <div className="cat-header-left">
                                        <div className={`cat-icon ${category.status}`}>
                                            <category.icon size={20} />
                                        </div>
                                        <span className="cat-title">{category.name}</span>
                                        <span 
                                            className="cat-badge"
                                            style={{ background: getScoreColor(category.score) }}
                                        >
                                            {category.score}/100
                                        </span>
                                    </div>
                                    {expandedSections[category.id] ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </button>

                                {expandedSections[category.id] && (
                                    <div className="category-items">
                                        {category.items.map((item, i) => (
                                            <div key={i} className="audit-item">
                                                <div className="item-main">
                                                    {getStatusIcon(item.status)}
                                                    <span className="item-name">{item.name}</span>
                                                    <span className={`item-value ${item.status}`}>{item.value}</span>
                                                </div>
                                                {item.recommendation && (
                                                    <div className="item-recommendation">
                                                        <AlertTriangle size={14} />
                                                        {item.recommendation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="audit-actions">
                        <button className="btn-secondary">
                            <Download size={18} />
                            Exporter le rapport
                        </button>
                        <button className="btn-primary" onClick={() => { setAuditResult(null); setUrl(''); }}>
                            <Search size={18} />
                            Nouvel audit
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!auditResult && !isAnalyzing && (
                <div className="audit-empty">
                    <div className="empty-illustration">
                        <Search size={48} />
                    </div>
                    <h3>Prêt à analyser votre site ?</h3>
                    <p>Entrez une URL ci-dessus pour obtenir un audit SEO complet avec des recommandations personnalisées.</p>
                    <div className="empty-features">
                        <div className="feature">
                            <Zap size={20} />
                            <span>Performance</span>
                        </div>
                        <div className="feature">
                            <Search size={20} />
                            <span>SEO On-Page</span>
                        </div>
                        <div className="feature">
                            <FileText size={20} />
                            <span>Contenu</span>
                        </div>
                        <div className="feature">
                            <Shield size={20} />
                            <span>Technique</span>
                        </div>
                        <div className="feature">
                            <Smartphone size={20} />
                            <span>Mobile</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditSEO;






