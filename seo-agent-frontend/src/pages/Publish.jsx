import React, { useState } from 'react';
import { 
    Send, Calendar, Clock, CheckCircle, Globe, FileText,
    Edit3, Trash2, Eye, ExternalLink, Plus, Filter,
    AlertCircle, RefreshCw, ChevronRight, X
} from 'lucide-react';
import './Publish.css';

const Publish = () => {
    const [publications, setPublications] = useState([
        {
            id: 1,
            title: '10 Techniques SEO incontournables pour 2025',
            status: 'published',
            site: { name: 'mon-blog.fr', platform: 'wordpress' },
            publishedAt: '2024-12-10 14:30',
            url: 'https://mon-blog.fr/techniques-seo-2025'
        },
        {
            id: 2,
            title: 'Guide complet du référencement local pour PME',
            status: 'published',
            site: { name: 'mon-blog.fr', platform: 'wordpress' },
            publishedAt: '2024-12-09 10:00',
            url: 'https://mon-blog.fr/referencement-local-pme'
        },
        {
            id: 3,
            title: 'Les meilleurs outils SEO gratuits',
            status: 'scheduled',
            site: { name: 'startup-tips.com', platform: 'webflow' },
            scheduledFor: '2024-12-15 10:00',
            url: null
        },
        {
            id: 4,
            title: 'Comment optimiser vos images pour le SEO',
            status: 'draft',
            site: null,
            publishedAt: null,
            url: null
        },
        {
            id: 5,
            title: 'Stratégies de link building efficaces',
            status: 'failed',
            site: { name: 'blog.example.com', platform: 'framer' },
            error: 'Connexion au site impossible',
            publishedAt: null
        },
    ]);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const connectedSites = [
        { id: 1, name: 'mon-blog.fr', platform: 'wordpress', status: 'connected' },
        { id: 2, name: 'startup-tips.com', platform: 'webflow', status: 'connected' },
        { id: 3, name: 'blog.example.com', platform: 'framer', status: 'error' },
    ];

    const getPlatformIcon = (platform) => {
        const icons = {
            wordpress: '🔵',
            webflow: '🟣',
            framer: '⚫'
        };
        return icons[platform] || '🌐';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return <span className="status-badge published"><CheckCircle size={12} /> Publié</span>;
            case 'scheduled':
                return <span className="status-badge scheduled"><Calendar size={12} /> Programmé</span>;
            case 'draft':
                return <span className="status-badge draft"><Clock size={12} /> Brouillon</span>;
            case 'failed':
                return <span className="status-badge failed"><AlertCircle size={12} /> Échec</span>;
            default:
                return null;
        }
    };

    const filteredPublications = publications.filter(pub => {
        return filterStatus === 'all' || pub.status === filterStatus;
    });

    const stats = {
        total: publications.length,
        published: publications.filter(p => p.status === 'published').length,
        scheduled: publications.filter(p => p.status === 'scheduled').length,
        failed: publications.filter(p => p.status === 'failed').length
    };

    const retryPublication = (id) => {
        setPublications(prev => prev.map(p => 
            p.id === id ? { ...p, status: 'scheduled', scheduledFor: 'En cours...', error: null } : p
        ));
        
        // Simulation de republication
        setTimeout(() => {
            setPublications(prev => prev.map(p => 
                p.id === id ? { 
                    ...p, 
                    status: 'published', 
                    publishedAt: new Date().toLocaleString('fr-FR'),
                    url: 'https://example.com/article'
                } : p
            ));
        }, 2000);
    };

    const cancelScheduled = (id) => {
        if (confirm('Annuler cette publication programmée ?')) {
            setPublications(prev => prev.map(p => 
                p.id === id ? { ...p, status: 'draft', scheduledFor: null, site: null } : p
            ));
        }
    };

    return (
        <div className="publish-page">
            <header className="publish-header">
                <div>
                    <h1>Publications</h1>
                    <p>Gérez la publication de vos contenus sur vos sites connectés</p>
                </div>
            </header>

            {/* Stats */}
            <div className="publish-stats">
                <div className="stat-item">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item published">
                    <span className="stat-number">{stats.published}</span>
                    <span className="stat-label">Publiés</span>
                </div>
                <div className="stat-item scheduled">
                    <span className="stat-number">{stats.scheduled}</span>
                    <span className="stat-label">Programmés</span>
                </div>
                <div className="stat-item failed">
                    <span className="stat-number">{stats.failed}</span>
                    <span className="stat-label">Échecs</span>
                </div>
            </div>

            <div className="publish-layout">
                {/* Main Content */}
                <div className="publish-main">
                    {/* Filters */}
                    <div className="publish-filters">
                        <h3>Historique des publications</h3>
                        <div className="filter-buttons">
                            {['all', 'published', 'scheduled', 'draft', 'failed'].map(status => (
                                <button
                                    key={status}
                                    className={filterStatus === status ? 'active' : ''}
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status === 'all' ? 'Tous' : 
                                     status === 'published' ? 'Publiés' :
                                     status === 'scheduled' ? 'Programmés' :
                                     status === 'draft' ? 'Brouillons' : 'Échecs'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Publications List */}
                    <div className="publications-list">
                        {filteredPublications.length > 0 ? (
                            filteredPublications.map(pub => (
                                <div key={pub.id} className={`publication-card ${pub.status}`}>
                                    <div className="pub-main">
                                        <div className="pub-icon">
                                            <FileText size={20} />
                                        </div>
                                        <div className="pub-info">
                                            <h4>{pub.title}</h4>
                                            <div className="pub-meta">
                                                {pub.site ? (
                                                    <span className="meta-site">
                                                        {getPlatformIcon(pub.site.platform)}
                                                        {pub.site.name}
                                                    </span>
                                                ) : (
                                                    <span className="meta-no-site">Aucun site sélectionné</span>
                                                )}
                                                {pub.publishedAt && (
                                                    <>
                                                        <span className="meta-sep">•</span>
                                                        <span className="meta-date">Publié le {pub.publishedAt}</span>
                                                    </>
                                                )}
                                                {pub.scheduledFor && (
                                                    <>
                                                        <span className="meta-sep">•</span>
                                                        <span className="meta-date scheduled">
                                                            <Calendar size={12} />
                                                            {pub.scheduledFor}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {pub.error && (
                                                <div className="pub-error">
                                                    <AlertCircle size={14} />
                                                    {pub.error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pub-actions">
                                        {getStatusBadge(pub.status)}
                                        <div className="action-buttons">
                                            {pub.url && (
                                                <a href={pub.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Voir sur le site">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            {pub.status === 'draft' && (
                                                <button className="btn-icon publish-btn" title="Publier">
                                                    <Send size={16} />
                                                </button>
                                            )}
                                            {pub.status === 'failed' && (
                                                <button 
                                                    className="btn-icon retry-btn" 
                                                    title="Réessayer"
                                                    onClick={() => retryPublication(pub.id)}
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            )}
                                            {pub.status === 'scheduled' && (
                                                <button 
                                                    className="btn-icon cancel-btn" 
                                                    title="Annuler"
                                                    onClick={() => cancelScheduled(pub.id)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="publications-empty">
                                <Send size={32} />
                                <p>Aucune publication trouvée</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Connected Sites */}
                <div className="publish-sidebar">
                    <div className="sidebar-card">
                        <div className="sidebar-header">
                            <h3>
                                <Globe size={18} />
                                Sites connectés
                            </h3>
                            <a href="/integrations" className="link-btn">
                                Gérer <ChevronRight size={14} />
                            </a>
                        </div>
                        <div className="sites-list">
                            {connectedSites.map(site => (
                                <div key={site.id} className={`site-item ${site.status}`}>
                                    <span className="site-platform">{getPlatformIcon(site.platform)}</span>
                                    <div className="site-info">
                                        <span className="site-name">{site.name}</span>
                                        <span className="site-platform-name">{site.platform}</span>
                                    </div>
                                    <span className={`site-status ${site.status}`}>
                                        {site.status === 'connected' ? (
                                            <CheckCircle size={14} />
                                        ) : (
                                            <AlertCircle size={14} />
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <a href="/integrations" className="btn-add-site">
                            <Plus size={16} />
                            Connecter un site
                        </a>
                    </div>

                    <div className="sidebar-card tips-card">
                        <h4>💡 Conseils de publication</h4>
                        <ul>
                            <li>Publiez régulièrement pour améliorer votre SEO</li>
                            <li>Planifiez vos contenus aux heures de forte audience</li>
                            <li>Vérifiez la connexion de vos sites régulièrement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Publish;

