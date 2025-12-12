import React, { useState, useEffect } from 'react';
import { 
    Send, Calendar, Clock, CheckCircle, Globe, FileText,
    Edit3, Trash2, Eye, ExternalLink, Plus, Filter,
    AlertCircle, RefreshCw, ChevronRight, X, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Publish.css';

const Publish = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [connectedSites, setConnectedSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Modal de publication
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [publishStatus, setPublishStatus] = useState('draft'); // draft or publish
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Charger les articles
            const articlesRes = await fetch(`${API_URL}/api/articles/${user.id}`);
            const articlesData = await articlesRes.json();
            setArticles(articlesData.articles || []);

            // Charger les sites connectés
            const sitesRes = await fetch(`${API_URL}/api/sites/${user.id}`);
            const sitesData = await sitesRes.json();
            setConnectedSites(sitesData.sites || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const openPublishModal = (article) => {
        setSelectedArticle(article);
        setSelectedSite(connectedSites.length > 0 ? connectedSites[0] : null);
        setPublishStatus('publish');
        setPublishError(null);
        setShowPublishModal(true);
    };

    const handlePublish = async () => {
        if (!selectedArticle || !selectedSite) return;

        setIsPublishing(true);
        setPublishError(null);

        try {
            const response = await fetch(`${API_URL}/api/wordpress/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    siteId: selectedSite.id,
                    article: {
                        title: selectedArticle.title,
                        content: selectedArticle.content,
                        excerpt: selectedArticle.excerpt || selectedArticle.meta_description,
                        metaDescription: selectedArticle.meta_description,
                        metaTitle: selectedArticle.meta_title,
                        focusKeyword: selectedArticle.keyword,
                        status: publishStatus
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                // Mettre à jour l'article localement
                setArticles(prev => prev.map(a => 
                    a.id === selectedArticle.id 
                        ? { 
                            ...a, 
                            status: publishStatus === 'publish' ? 'published' : 'draft',
                            published_url: result.url,
                            published_at: new Date().toISOString()
                        } 
                        : a
                ));

                // Mettre à jour en base
                await fetch(`${API_URL}/api/articles/${user.id}/${selectedArticle.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: publishStatus === 'publish' ? 'published' : 'draft',
                        published_url: result.url,
                        published_at: new Date().toISOString(),
                        site_id: selectedSite.id
                    })
                });

                setShowPublishModal(false);
                alert(`✅ Article ${publishStatus === 'publish' ? 'publié' : 'envoyé en brouillon'} avec succès !`);
            } else {
                setPublishError(result.error || 'Erreur lors de la publication');
            }
        } catch (err) {
            console.error('Publish error:', err);
            setPublishError('Impossible de se connecter au serveur');
        } finally {
            setIsPublishing(false);
        }
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            wordpress: '📝',
            webflow: '🌐',
            framer: '🎨'
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
                return <span className="status-badge draft"><Clock size={12} /> Brouillon</span>;
        }
    };

    const filteredArticles = articles.filter(article => {
        return filterStatus === 'all' || article.status === filterStatus;
    });

    const stats = {
        total: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        drafts: articles.filter(a => a.status === 'draft').length,
        scheduled: articles.filter(a => a.status === 'scheduled').length
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="publish-page">
                <div className="loading-state">
                    <Loader2 size={32} className="animate-spin" />
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="publish-page">
            <header className="publish-header">
                <div>
                    <h1>Publications</h1>
                    <p>Publiez vos contenus sur vos sites connectés</p>
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
                <div className="stat-item draft">
                    <span className="stat-number">{stats.drafts}</span>
                    <span className="stat-label">Brouillons</span>
                </div>
                <div className="stat-item scheduled">
                    <span className="stat-number">{stats.scheduled}</span>
                    <span className="stat-label">Programmés</span>
                </div>
            </div>

            <div className="publish-layout">
                {/* Main Content */}
                <div className="publish-main">
                    {/* Filters */}
                    <div className="publish-filters">
                        <h3>Vos articles</h3>
                        <div className="filter-buttons">
                            {['all', 'published', 'draft', 'scheduled'].map(status => (
                                <button
                                    key={status}
                                    className={filterStatus === status ? 'active' : ''}
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status === 'all' ? 'Tous' : 
                                     status === 'published' ? 'Publiés' :
                                     status === 'draft' ? 'Brouillons' : 'Programmés'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Articles List */}
                    <div className="publications-list">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map(article => (
                                <div key={article.id} className={`publication-card ${article.status}`}>
                                    <div className="pub-main">
                                        <div className="pub-icon">
                                            <FileText size={20} />
                                        </div>
                                        <div className="pub-info">
                                            <h4>{article.title}</h4>
                                            <div className="pub-meta">
                                                <span className="meta-keyword">
                                                    🎯 {article.keyword}
                                                </span>
                                                <span className="meta-sep">•</span>
                                                <span className="meta-words">{article.word_count || '-'} mots</span>
                                                {article.published_at && (
                                                    <>
                                                        <span className="meta-sep">•</span>
                                                        <span className="meta-date">Publié le {formatDate(article.published_at)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pub-actions">
                                        {getStatusBadge(article.status)}
                                        <div className="action-buttons">
                                            {article.published_url && (
                                                <a href={article.published_url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Voir sur le site">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            {article.status === 'draft' && connectedSites.length > 0 && (
                                                <button 
                                                    className="btn-icon publish-btn" 
                                                    title="Publier"
                                                    onClick={() => openPublishModal(article)}
                                                >
                                                    <Send size={16} />
                                                </button>
                                            )}
                                            {article.status === 'draft' && connectedSites.length === 0 && (
                                                <a href="/integrations" className="btn-icon" title="Connecter un site d'abord">
                                                    <Plus size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="publications-empty">
                                <FileText size={32} />
                                <p>Aucun article trouvé</p>
                                <a href="/contents" className="btn-primary-small">
                                    Créer un article
                                </a>
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
                            {connectedSites.length > 0 ? (
                                connectedSites.map(site => (
                                    <div key={site.id} className={`site-item ${site.status}`}>
                                        <span className="site-platform">{getPlatformIcon(site.platform)}</span>
                                        <div className="site-info">
                                            <span className="site-name">{site.site_name || new URL(site.site_url).hostname}</span>
                                            <span className="site-platform-name">{site.platform}</span>
                                        </div>
                                        <span className={`site-status ${site.status}`}>
                                            {site.status === 'active' ? (
                                                <CheckCircle size={14} />
                                            ) : (
                                                <AlertCircle size={14} />
                                            )}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-sites">
                                    <p>Aucun site connecté</p>
                                </div>
                            )}
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
                            <li>Utilisez des mots-clés dans vos titres</li>
                            <li>Vérifiez la connexion de vos sites</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Publish Modal */}
            {showPublishModal && selectedArticle && (
                <div className="modal-overlay" onClick={() => !isPublishing && setShowPublishModal(false)}>
                    <div className="modal-content publish-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <Send size={24} />
                                Publier l'article
                            </h2>
                            {!isPublishing && (
                                <button className="modal-close" onClick={() => setShowPublishModal(false)}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {publishError && (
                            <div className="modal-error">
                                <AlertCircle size={18} />
                                {publishError}
                            </div>
                        )}

                        <div className="modal-body">
                            <div className="publish-preview">
                                <h4>{selectedArticle.title}</h4>
                                <p className="preview-keyword">🎯 {selectedArticle.keyword}</p>
                            </div>

                            <div className="form-group">
                                <label>Site de destination</label>
                                <select 
                                    value={selectedSite?.id || ''}
                                    onChange={(e) => setSelectedSite(connectedSites.find(s => s.id === e.target.value))}
                                >
                                    {connectedSites.map(site => (
                                        <option key={site.id} value={site.id}>
                                            {getPlatformIcon(site.platform)} {site.site_name || site.site_url}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Statut de publication</label>
                                <div className="radio-group">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="publishStatus"
                                            value="publish"
                                            checked={publishStatus === 'publish'}
                                            onChange={(e) => setPublishStatus(e.target.value)}
                                        />
                                        <span>Publier immédiatement</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="publishStatus"
                                            value="draft"
                                            checked={publishStatus === 'draft'}
                                            onChange={(e) => setPublishStatus(e.target.value)}
                                        />
                                        <span>Envoyer en brouillon</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowPublishModal(false)}
                                disabled={isPublishing}
                            >
                                Annuler
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={handlePublish}
                                disabled={isPublishing || !selectedSite}
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Publication...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        {publishStatus === 'publish' ? 'Publier' : 'Envoyer en brouillon'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Publish;
