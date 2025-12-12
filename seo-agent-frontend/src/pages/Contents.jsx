import React, { useState, useEffect } from 'react';
import { 
    PenTool, Plus, Search, Filter, FileText, Clock, CheckCircle,
    Calendar, Trash2, Edit3, Eye, Copy, MoreVertical, Globe,
    Sparkles, Target, RefreshCw, ArrowRight, X, ChevronDown,
    Loader2, AlertCircle, Send, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Contents.css';

const Contents = () => {
    const { user } = useAuth();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewArticle, setPreviewArticle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [error, setError] = useState(null);

    // Nouveau contenu form
    const [newContent, setNewContent] = useState({
        keyword: '',
        tone: 'professional',
        length: 1500,
        includeImages: true,
        includeFAQ: true
    });

    // Charger les articles au démarrage
    useEffect(() => {
        if (user) {
            fetchArticles();
        }
        
        // Récupérer le keyword depuis l'URL si présent
        const urlParams = new URLSearchParams(window.location.search);
        const keywordParam = urlParams.get('keyword');
        if (keywordParam) {
            setNewContent(prev => ({ ...prev, keyword: keywordParam }));
            setShowCreateModal(true);
        }
    }, [user]);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/articles/${user.id}`);
            const data = await response.json();
            setContents(data.articles || []);
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Impossible de charger les articles');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateContent = async () => {
        if (!newContent.keyword) return;
        
        setIsGenerating(true);
        setGenerationStep(1);
        setError(null);

        try {
            // Étape 1: Analyse du mot-clé
            await new Promise(r => setTimeout(r, 1000));
            setGenerationStep(2);

            // Étape 2: Génération du contenu
            const response = await fetch(`${API_URL}/api/content/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    keyword: newContent.keyword,
                    tone: newContent.tone,
                    length: newContent.length,
                    language: 'fr',
                    includeImages: newContent.includeImages,
                    includeFAQ: newContent.includeFAQ
                })
            });

            const data = await response.json();
            
            setGenerationStep(3);
            await new Promise(r => setTimeout(r, 500));

            if (data.success) {
                // Ajouter l'article à la liste
                const newArticle = {
                    id: data.savedId || Date.now(),
                    title: data.article.title,
                    slug: data.article.slug,
                    status: 'draft',
                    keyword: data.article.keywords?.primary || newContent.keyword,
                    word_count: data.article.wordCount,
                    content: data.article.content,
                    meta_title: data.article.metaTitle,
                    meta_description: data.article.metaDescription,
                    faq: data.article.faq,
                    created_at: new Date().toISOString()
                };
                
                setContents(prev => [newArticle, ...prev]);
                setShowCreateModal(false);
                setNewContent({ keyword: '', tone: 'professional', length: 1500, includeImages: true, includeFAQ: true });
                
                // Afficher l'aperçu
                setPreviewArticle(data.article);
                setShowPreviewModal(true);
            } else {
                setError(data.error || 'Erreur lors de la génération');
            }
        } catch (err) {
            console.error('Generation error:', err);
            setError('Erreur de connexion au serveur');
        } finally {
            setIsGenerating(false);
            setGenerationStep(0);
        }
    };

    const deleteContent = async (article) => {
        if (!confirm('Supprimer ce contenu ?')) return;
        
        try {
            await fetch(`${API_URL}/api/articles/${user.id}/${article.id}`, {
                method: 'DELETE'
            });
            setContents(prev => prev.filter(c => c.id !== article.id));
        } catch (err) {
            console.error('Error deleting article:', err);
        }
    };

    const viewArticle = (article) => {
        setPreviewArticle(article);
        setShowPreviewModal(true);
    };

    const copyContent = (article) => {
        navigator.clipboard.writeText(article.content || '');
        alert('Contenu copié dans le presse-papier !');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return <span className="status-badge published"><CheckCircle size={12} /> Publié</span>;
            case 'draft':
                return <span className="status-badge draft"><Clock size={12} /> Brouillon</span>;
            case 'scheduled':
                return <span className="status-badge scheduled"><Calendar size={12} /> Programmé</span>;
            default:
                return <span className="status-badge draft"><Clock size={12} /> Brouillon</span>;
        }
    };

    const filteredContents = contents.filter(content => {
        const matchesSearch = (content.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (content.keyword || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: contents.length,
        published: contents.filter(c => c.status === 'published').length,
        drafts: contents.filter(c => c.status === 'draft').length,
        scheduled: contents.filter(c => c.status === 'scheduled').length
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="contents-page">
                <div className="loading-state">
                    <Loader2 size={32} className="animate-spin" />
                    <p>Chargement des contenus...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contents-page">
            <header className="contents-header">
                <div>
                    <h1>Contenus SEO</h1>
                    <p>Créez et gérez vos articles optimisés pour le référencement</p>
                </div>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Nouveau contenu
                </button>
            </header>

            {/* Stats */}
            <div className="contents-stats">
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

            {/* Filters */}
            <div className="contents-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un contenu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
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

            {/* Contents List */}
            <div className="contents-list">
                {filteredContents.length > 0 ? (
                    filteredContents.map(content => (
                        <div key={content.id} className="content-card">
                            <div className="content-main">
                                <div className="content-icon">
                                    <FileText size={20} />
                                </div>
                                <div className="content-info">
                                    <h3>{content.title}</h3>
                                    <div className="content-meta">
                                        <span className="meta-item">
                                            <Target size={12} />
                                            {content.keyword}
                                        </span>
                                        <span className="meta-sep">•</span>
                                        <span className="meta-item">{content.word_count || '-'} mots</span>
                                        <span className="meta-sep">•</span>
                                        <span className="meta-item">Créé le {formatDate(content.created_at)}</span>
                                        {content.published_url && (
                                            <>
                                                <span className="meta-sep">•</span>
                                                <a href={content.published_url} target="_blank" rel="noopener noreferrer" className="meta-item site">
                                                    <ExternalLink size={12} />
                                                    Voir en ligne
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="content-actions">
                                {getStatusBadge(content.status)}
                                <div className="action-buttons">
                                    <button className="btn-icon" title="Voir" onClick={() => viewArticle(content)}>
                                        <Eye size={16} />
                                    </button>
                                    <button className="btn-icon" title="Copier le contenu" onClick={() => copyContent(content)}>
                                        <Copy size={16} />
                                    </button>
                                    {content.status === 'draft' && (
                                        <button 
                                            className="btn-icon publish" 
                                            title="Publier"
                                            onClick={() => window.location.href = `/publish?articleId=${content.id}`}
                                        >
                                            <Send size={16} />
                                        </button>
                                    )}
                                    <button 
                                        className="btn-icon delete" 
                                        title="Supprimer"
                                        onClick={() => deleteContent(content)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="contents-empty">
                        <div className="empty-icon">
                            <PenTool size={48} />
                        </div>
                        <h3>Aucun contenu trouvé</h3>
                        <p>
                            {searchQuery || filterStatus !== 'all' 
                                ? 'Aucun résultat pour votre recherche'
                                : 'Créez votre premier article SEO optimisé avec l\'IA'
                            }
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Sparkles size={18} />
                                Créer un contenu
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !isGenerating && setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <Sparkles size={24} />
                                Créer un nouveau contenu
                            </h2>
                            {!isGenerating && (
                                <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="modal-error">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {isGenerating ? (
                            <div className="generating-state">
                                <div className="generating-animation">
                                    <Loader2 size={40} className="animate-spin" />
                                </div>
                                <h3>Génération en cours...</h3>
                                <p>Notre IA rédige votre article optimisé SEO</p>
                                <div className="generating-steps">
                                    <div className={`step ${generationStep >= 1 ? 'done' : ''}`}>
                                        {generationStep >= 1 ? <CheckCircle size={16} /> : <Clock size={16} />}
                                        Analyse du mot-clé
                                    </div>
                                    <div className={`step ${generationStep >= 2 ? (generationStep === 2 ? 'active' : 'done') : ''}`}>
                                        {generationStep > 2 ? <CheckCircle size={16} /> : 
                                         generationStep === 2 ? <Loader2 size={16} className="animate-spin" /> : 
                                         <Clock size={16} />}
                                        Rédaction du contenu
                                    </div>
                                    <div className={`step ${generationStep >= 3 ? 'done' : ''}`}>
                                        {generationStep >= 3 ? <CheckCircle size={16} /> : <Clock size={16} />}
                                        Optimisation SEO
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Mot-clé principal *</label>
                                    <div className="input-with-icon">
                                        <Target size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ex: marketing digital, seo local..."
                                            value={newContent.keyword}
                                            onChange={(e) => setNewContent(prev => ({ ...prev, keyword: e.target.value }))}
                                        />
                                    </div>
                                    <span className="form-hint">L'article sera optimisé pour ce mot-clé</span>
                                </div>

                                <div className="form-group">
                                    <label>Ton de l'article</label>
                                    <div className="radio-group">
                                        {[
                                            { value: 'professional', label: 'Professionnel' },
                                            { value: 'casual', label: 'Décontracté' },
                                            { value: 'expert', label: 'Expert' },
                                            { value: 'friendly', label: 'Amical' }
                                        ].map(option => (
                                            <label key={option.value} className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="tone"
                                                    value={option.value}
                                                    checked={newContent.tone === option.value}
                                                    onChange={(e) => setNewContent(prev => ({ ...prev, tone: e.target.value }))}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Longueur</label>
                                    <div className="radio-group">
                                        {[
                                            { value: 1000, label: 'Court (~1000 mots)' },
                                            { value: 1500, label: 'Moyen (~1500 mots)' },
                                            { value: 2000, label: 'Long (~2000 mots)' },
                                            { value: 3000, label: 'Très long (~3000 mots)' }
                                        ].map(option => (
                                            <label key={option.value} className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="length"
                                                    value={option.value}
                                                    checked={newContent.length === option.value}
                                                    onChange={(e) => setNewContent(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-checkboxes">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newContent.includeFAQ}
                                            onChange={(e) => setNewContent(prev => ({ ...prev, includeFAQ: e.target.checked }))}
                                        />
                                        <span>Inclure une FAQ (recommandé pour le SEO)</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newContent.includeImages}
                                            onChange={(e) => setNewContent(prev => ({ ...prev, includeImages: e.target.checked }))}
                                        />
                                        <span>Générer des suggestions d'images</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {!isGenerating && (
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Annuler
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={handleCreateContent}
                                    disabled={!newContent.keyword}
                                >
                                    <Sparkles size={18} />
                                    Générer l'article
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && previewArticle && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
                    <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <Eye size={24} />
                                Aperçu de l'article
                            </h2>
                            <button className="modal-close" onClick={() => setShowPreviewModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body preview-body">
                            <div className="preview-meta">
                                <div className="meta-item">
                                    <strong>Meta Title:</strong>
                                    <span>{previewArticle.metaTitle || previewArticle.meta_title}</span>
                                </div>
                                <div className="meta-item">
                                    <strong>Meta Description:</strong>
                                    <span>{previewArticle.metaDescription || previewArticle.meta_description}</span>
                                </div>
                                <div className="meta-item">
                                    <strong>Mot-clé:</strong>
                                    <span className="keyword-badge">{previewArticle.keywords?.primary || previewArticle.keyword}</span>
                                </div>
                                <div className="meta-item">
                                    <strong>Mots:</strong>
                                    <span>{previewArticle.wordCount || previewArticle.word_count}</span>
                                </div>
                            </div>

                            <div className="preview-content">
                                <h1>{previewArticle.title}</h1>
                                <div 
                                    className="article-content"
                                    dangerouslySetInnerHTML={{ __html: previewArticle.content }}
                                />
                            </div>

                            {previewArticle.faq && previewArticle.faq.length > 0 && (
                                <div className="preview-faq">
                                    <h3>FAQ</h3>
                                    {previewArticle.faq.map((item, index) => (
                                        <div key={index} className="faq-item">
                                            <strong>{item.question}</strong>
                                            <p>{item.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => {
                                navigator.clipboard.writeText(previewArticle.content);
                                alert('Contenu copié !');
                            }}>
                                <Copy size={16} />
                                Copier le contenu
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    setShowPreviewModal(false);
                                    window.location.href = '/publish';
                                }}
                            >
                                <Send size={16} />
                                Publier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contents;
