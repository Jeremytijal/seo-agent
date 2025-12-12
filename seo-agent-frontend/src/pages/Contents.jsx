import React, { useState } from 'react';
import { 
    PenTool, Plus, Search, Filter, FileText, Clock, CheckCircle,
    Calendar, Trash2, Edit3, Eye, Copy, MoreVertical, Globe,
    Sparkles, Target, RefreshCw, ArrowRight, X, ChevronDown
} from 'lucide-react';
import './Contents.css';

const Contents = () => {
    const [contents, setContents] = useState([
        {
            id: 1,
            title: '10 Techniques SEO incontournables pour 2025',
            status: 'published',
            site: 'mon-blog.fr',
            keyword: 'techniques seo 2025',
            wordCount: 2450,
            createdAt: '2024-12-10',
            publishedAt: '2024-12-10'
        },
        {
            id: 2,
            title: 'Guide complet du référencement local pour PME',
            status: 'published',
            site: 'mon-blog.fr',
            keyword: 'référencement local',
            wordCount: 3200,
            createdAt: '2024-12-08',
            publishedAt: '2024-12-09'
        },
        {
            id: 3,
            title: 'Comment optimiser vos images pour le SEO',
            status: 'draft',
            site: null,
            keyword: 'optimisation images seo',
            wordCount: 1850,
            createdAt: '2024-12-07',
            publishedAt: null
        },
        {
            id: 4,
            title: 'Les meilleurs outils SEO gratuits en 2024',
            status: 'scheduled',
            site: 'startup-tips.com',
            keyword: 'outils seo gratuits',
            wordCount: 2100,
            createdAt: '2024-12-06',
            scheduledFor: '2024-12-15 10:00'
        },
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);

    // Nouveau contenu form
    const [newContent, setNewContent] = useState({
        keyword: '',
        tone: 'professional',
        length: 'medium',
        includeImages: true
    });

    const handleCreateContent = async () => {
        if (!newContent.keyword) return;
        
        setIsGenerating(true);

        // Simulation de génération (à remplacer par l'appel API)
        setTimeout(() => {
            const generated = {
                id: Date.now(),
                title: `Guide complet: ${newContent.keyword}`,
                status: 'draft',
                site: null,
                keyword: newContent.keyword,
                wordCount: newContent.length === 'short' ? 1200 : newContent.length === 'medium' ? 2000 : 3500,
                createdAt: new Date().toISOString().split('T')[0],
                publishedAt: null
            };
            
            setContents(prev => [generated, ...prev]);
            setShowCreateModal(false);
            setIsGenerating(false);
            setNewContent({ keyword: '', tone: 'professional', length: 'medium', includeImages: true });
        }, 3000);
    };

    const deleteContent = (id) => {
        if (confirm('Supprimer ce contenu ?')) {
            setContents(prev => prev.filter(c => c.id !== id));
        }
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
                return null;
        }
    };

    const filteredContents = contents.filter(content => {
        const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            content.keyword.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: contents.length,
        published: contents.filter(c => c.status === 'published').length,
        drafts: contents.filter(c => c.status === 'draft').length,
        scheduled: contents.filter(c => c.status === 'scheduled').length
    };

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
                                        <span className="meta-item">{content.wordCount} mots</span>
                                        <span className="meta-sep">•</span>
                                        <span className="meta-item">Créé le {content.createdAt}</span>
                                        {content.site && (
                                            <>
                                                <span className="meta-sep">•</span>
                                                <span className="meta-item site">
                                                    <Globe size={12} />
                                                    {content.site}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="content-actions">
                                {getStatusBadge(content.status)}
                                <div className="action-buttons">
                                    <button className="btn-icon" title="Voir">
                                        <Eye size={16} />
                                    </button>
                                    <button className="btn-icon" title="Modifier">
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="btn-icon" title="Dupliquer">
                                        <Copy size={16} />
                                    </button>
                                    <button 
                                        className="btn-icon delete" 
                                        title="Supprimer"
                                        onClick={() => deleteContent(content.id)}
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
                                : 'Créez votre premier article SEO optimisé'
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

                        {isGenerating ? (
                            <div className="generating-state">
                                <div className="generating-animation">
                                    <RefreshCw size={40} className="animate-spin" />
                                </div>
                                <h3>Génération en cours...</h3>
                                <p>Notre IA rédige votre article optimisé SEO</p>
                                <div className="generating-steps">
                                    <div className="step done">
                                        <CheckCircle size={16} />
                                        Analyse du mot-clé
                                    </div>
                                    <div className="step active">
                                        <RefreshCw size={16} className="animate-spin" />
                                        Rédaction du contenu
                                    </div>
                                    <div className="step">
                                        <Clock size={16} />
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
                                            { value: 'educational', label: 'Éducatif' }
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
                                            { value: 'short', label: 'Court (~1000 mots)' },
                                            { value: 'medium', label: 'Moyen (~2000 mots)' },
                                            { value: 'long', label: 'Long (~3500 mots)' }
                                        ].map(option => (
                                            <label key={option.value} className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="length"
                                                    value={option.value}
                                                    checked={newContent.length === option.value}
                                                    onChange={(e) => setNewContent(prev => ({ ...prev, length: e.target.value }))}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newContent.includeImages}
                                            onChange={(e) => setNewContent(prev => ({ ...prev, includeImages: e.target.checked }))}
                                        />
                                        <span>Générer des images pour l'article</span>
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
        </div>
    );
};

export default Contents;

