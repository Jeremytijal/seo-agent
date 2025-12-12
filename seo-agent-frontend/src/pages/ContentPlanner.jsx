import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, 
    FileText, Target, GripVertical, X, Clock, CheckCircle,
    MoreHorizontal, Edit3, Trash2, ExternalLink, Eye,
    Globe, Loader2, PartyPopper, ArrowRight, Headphones, Zap
} from 'lucide-react';
import './ContentPlanner.css';

const ContentPlanner = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [scheduledArticles, setScheduledArticles] = useState({});

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [draggedArticle, setDraggedArticle] = useState(null);
    const [draggedFromDate, setDraggedFromDate] = useState(null);
    const [initialKeywordData, setInitialKeywordData] = useState(null);
    
    // Banners
    const [showConnectBanner, setShowConnectBanner] = useState(false);
    const [showActivatedBanner, setShowActivatedBanner] = useState(false);
    const [showGeneratingBanner, setShowGeneratingBanner] = useState(false);
    const [showExpertModal, setShowExpertModal] = useState(false);

    // Load scheduled articles from localStorage on mount
    useEffect(() => {
        // Load articles from localStorage (saved during onboarding)
        const savedKeywords = localStorage.getItem('seoagent_selected_keywords');
        if (savedKeywords) {
            try {
                const keywords = JSON.parse(savedKeywords);
                const today = new Date();
                const articles = {};
                
                const formatDateKey = (date) => {
                    return date.toISOString().split('T')[0];
                };
                
                keywords.forEach((kw, index) => {
                    const scheduledDate = new Date(today);
                    scheduledDate.setDate(today.getDate() + (index * 3)); // Every 3 days
                    const dateKey = formatDateKey(scheduledDate);
                    
                    if (!articles[dateKey]) {
                        articles[dateKey] = [];
                    }
                    
                    articles[dateKey].push({
                        id: Date.now() + index,
                        title: `Article sur "${kw.keyword}"`,
                        keyword: kw.keyword,
                        volume: kw.volume || 0,
                        difficulty: kw.difficulty || 0,
                        type: 'Guide',
                        status: index === 0 ? 'generating' : 'scheduled',
                        scheduledFor: scheduledDate.toISOString()
                    });
                });
                
                setScheduledArticles(articles);
            } catch (e) {
                console.error('Error loading articles from localStorage:', e);
            }
        }
    }, []);

    // Check for banners and URL params on mount
    useEffect(() => {
        // Check if coming from subscription activation
        const activated = searchParams.get('activated');
        if (activated === 'true') {
            setShowActivatedBanner(true);
            setSearchParams({});
            // Hide after 5 seconds
            setTimeout(() => setShowActivatedBanner(false), 5000);
        }

        // Check localStorage for connect banner
        const showConnect = localStorage.getItem('seoagent_show_connect_banner');
        if (showConnect === 'true') {
            setShowConnectBanner(true);
            // Show expert modal after 3 seconds if no site connected
            setTimeout(() => {
                const stillShowConnect = localStorage.getItem('seoagent_show_connect_banner');
                if (stillShowConnect === 'true') {
                    setShowExpertModal(true);
                }
            }, 3000);
        }

        // Check if first article is generating
        const generating = localStorage.getItem('seoagent_first_article_generating');
        if (generating === 'true') {
            setShowGeneratingBanner(true);
            // Clear after showing
            localStorage.removeItem('seoagent_first_article_generating');
            // Hide after 8 seconds
            setTimeout(() => setShowGeneratingBanner(false), 8000);
        }
    }, []);

    // Récupérer le mot-clé depuis l'URL (venant de la page Keywords)
    useEffect(() => {
        const keyword = searchParams.get('keyword');
        const volume = searchParams.get('volume');
        const difficulty = searchParams.get('difficulty');
        
        if (keyword) {
            setInitialKeywordData({
                keyword: decodeURIComponent(keyword),
                volume: volume || '',
                difficulty: difficulty || ''
            });
            setSelectedDate(new Date());
            setShowAddModal(true);
            // Nettoyer l'URL
            setSearchParams({});
        }
    }, [searchParams]);

    const dismissConnectBanner = () => {
        setShowConnectBanner(false);
        localStorage.removeItem('seoagent_show_connect_banner');
    };

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

    const getMonthDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Get the day of week (0 = Sunday, we want Monday = 0)
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;
        
        const days = [];
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false
            });
        }
        
        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }
        
        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }
        
        return days;
    };

    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const handleDragStart = (article, dateKey) => {
        setDraggedArticle(article);
        setDraggedFromDate(dateKey);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (targetDateKey) => {
        if (!draggedArticle || !draggedFromDate) return;
        
        if (draggedFromDate === targetDateKey) return;

        setScheduledArticles(prev => {
            const newState = { ...prev };
            
            // Remove from original date
            newState[draggedFromDate] = newState[draggedFromDate].filter(
                a => a.id !== draggedArticle.id
            );
            if (newState[draggedFromDate].length === 0) {
                delete newState[draggedFromDate];
            }
            
            // Add to new date
            if (!newState[targetDateKey]) {
                newState[targetDateKey] = [];
            }
            newState[targetDateKey].push(draggedArticle);
            
            return newState;
        });

        setDraggedArticle(null);
        setDraggedFromDate(null);
    };

    const openAddModal = (date) => {
        setSelectedDate(date);
        setShowAddModal(true);
    };

    const getTypeColor = (type) => {
        const colors = {
            'Guide': '#10B981',
            'How-to': '#3B82F6',
            'Liste': '#8B5CF6',
            'Explainer': '#F59E0B',
            'Tutorial': '#EC4899'
        };
        return colors[type] || '#6B7280';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return <span className="article-status published"><CheckCircle size={10} /> Publié</span>;
            case 'scheduled':
                return <span className="article-status scheduled"><Clock size={10} /> Planifié</span>;
            case 'generating':
                return <span className="article-status generating"><Loader2 size={10} className="spin" /> En génération</span>;
            case 'draft':
                return <span className="article-status draft">Brouillon</span>;
            default:
                return null;
        }
    };

    const deleteArticle = (dateKey, articleId) => {
        setScheduledArticles(prev => {
            const newState = { ...prev };
            newState[dateKey] = newState[dateKey].filter(a => a.id !== articleId);
            if (newState[dateKey].length === 0) {
                delete newState[dateKey];
            }
            return newState;
        });
    };

    const days = getMonthDays(currentDate);

    // Stats
    const stats = {
        thisMonth: Object.entries(scheduledArticles)
            .filter(([date]) => {
                const d = new Date(date);
                return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
            })
            .reduce((acc, [_, articles]) => acc + articles.length, 0),
        published: Object.values(scheduledArticles).flat().filter(a => a.status === 'published').length,
        scheduled: Object.values(scheduledArticles).flat().filter(a => a.status === 'scheduled').length
    };

    return (
        <div className="planner-page">
            {/* Success Banner - Account Activated */}
            {showActivatedBanner && (
                <div className="banner success-banner">
                    <PartyPopper size={20} />
                    <span>🎉 Votre compte est activé ! Bienvenue sur SEO Agent.</span>
                    <button onClick={() => setShowActivatedBanner(false)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Generating Banner */}
            {showGeneratingBanner && (
                <div className="banner generating-banner">
                    <Loader2 size={18} className="spin" />
                    <span>Votre premier article est en cours de génération... Il apparaîtra bientôt ici !</span>
                </div>
            )}

            {/* Connect Site Banner */}
            {showConnectBanner && (
                <div className="banner connect-banner">
                    <Globe size={18} />
                    <span>Connectez votre site WordPress pour publier automatiquement vos articles.</span>
                    <Link to="/integrations" className="banner-btn">
                        Connecter
                        <ArrowRight size={14} />
                    </Link>
                    <button className="banner-close" onClick={dismissConnectBanner}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="planner-header">
                <div className="header-left">
                    <h1>Content Planner</h1>
                    <p>Planifiez et organisez vos articles SEO</p>
                </div>
                <div className="header-actions">
                    <button className="btn-generate">
                        <Sparkles size={18} />
                        Générer des idées
                    </button>
                    <button className="btn-add" onClick={() => openAddModal(new Date())}>
                        <Plus size={18} />
                        Ajouter un article
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="planner-stats">
                <div className="stat-item">
                    <FileText size={18} />
                    <span className="stat-value">{stats.thisMonth}</span>
                    <span className="stat-label">Ce mois</span>
                </div>
                <div className="stat-item">
                    <CheckCircle size={18} />
                    <span className="stat-value">{stats.published}</span>
                    <span className="stat-label">Publiés</span>
                </div>
                <div className="stat-item">
                    <Clock size={18} />
                    <span className="stat-value">{stats.scheduled}</span>
                    <span className="stat-label">Planifiés</span>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="calendar-nav">
                <div className="nav-left">
                    <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button className="nav-btn" onClick={() => navigateMonth(1)}>
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button className="btn-today" onClick={goToToday}>
                    Aujourd'hui
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-container">
                {/* Day Headers */}
                <div className="calendar-header">
                    {dayNames.map(day => (
                        <div key={day} className="day-header">{day}</div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="calendar-grid">
                    {days.map((day, index) => {
                        const dateKey = formatDateKey(day.date);
                        const articles = scheduledArticles[dateKey] || [];
                        const hasArticles = articles.length > 0;

                        return (
                            <div 
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(dateKey)}
                            >
                                <div className="day-number">
                                    {day.date.getDate()}
                                </div>

                                <div className="day-content">
                                    {articles.map(article => (
                                        <div 
                                            key={article.id}
                                            className="article-card"
                                            draggable
                                            onDragStart={() => handleDragStart(article, dateKey)}
                                        >
                                            <div className="article-drag">
                                                <GripVertical size={12} />
                                            </div>
                                            <div className="article-info">
                                                <div className="article-type" style={{ background: `${getTypeColor(article.type)}20`, color: getTypeColor(article.type) }}>
                                                    {article.type}
                                                </div>
                                                <span className="article-title">{article.title}</span>
                                                <div className="article-meta">
                                                    <span className="meta-keyword">
                                                        <Target size={10} />
                                                        {article.keyword}
                                                    </span>
                                                    <span className="meta-stats">
                                                        Vol: <strong>{article.volume}</strong>
                                                        <span className="sep">•</span>
                                                        Diff: <strong>{article.difficulty}</strong>
                                                    </span>
                                                </div>
                                                {getStatusBadge(article.status)}
                                            </div>
                                            <div className="article-actions">
                                                <button className="action-btn" title="Voir">
                                                    <Eye size={12} />
                                                </button>
                                                <button 
                                                    className="action-btn delete" 
                                                    title="Supprimer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteArticle(dateKey, article.id);
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty state / Add button */}
                                    {day.isCurrentMonth && (
                                        <button 
                                            className="add-article-btn"
                                            onClick={() => openAddModal(day.date)}
                                        >
                                            {hasArticles ? (
                                                <Plus size={14} />
                                            ) : (
                                                <>
                                                    <span className="add-text">Glissez ici,</span>
                                                    <span className="add-links">
                                                        <a onClick={(e) => { e.stopPropagation(); openAddModal(day.date); }}>ajouter</a>
                                                        {' ou '}
                                                        <a onClick={(e) => e.stopPropagation()}>générer</a>
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Article Modal */}
            {showAddModal && (
                <AddArticleModal 
                    date={selectedDate}
                    initialData={initialKeywordData}
                    onClose={() => {
                        setShowAddModal(false);
                        setInitialKeywordData(null);
                    }}
                    onAdd={(article) => {
                        const dateKey = formatDateKey(selectedDate);
                        setScheduledArticles(prev => ({
                            ...prev,
                            [dateKey]: [...(prev[dateKey] || []), article]
                        }));
                        setShowAddModal(false);
                        setInitialKeywordData(null);
                    }}
                />
            )}

            {/* Expert Meeting Modal */}
            {showExpertModal && (
                <div className="modal-overlay" onClick={() => setShowExpertModal(false)}>
                    <div className="modal-content expert-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="expert-modal-icon">
                                <Headphones size={32} />
                            </div>
                            <h2>Besoin d'aide pour connecter votre site ?</h2>
                            <p>Un expert SEO Agent vous aide gratuitement à configurer votre intégration WordPress</p>
                        </div>
                        <div className="modal-body">
                            <div className="expert-benefits">
                                <div className="benefit-item">
                                    <CheckCircle size={18} />
                                    <span>Configuration WordPress complète</span>
                                </div>
                                <div className="benefit-item">
                                    <CheckCircle size={18} />
                                    <span>Publication automatique activée</span>
                                </div>
                                <div className="benefit-item">
                                    <CheckCircle size={18} />
                                    <span>Support personnalisé gratuit</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary-modal" 
                                onClick={() => setShowExpertModal(false)}
                            >
                                Plus tard
                            </button>
                            <a 
                                href="https://zcal.co/i/7LMkT11o" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary-modal"
                            >
                                <Calendar size={18} />
                                Prendre rendez-vous
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add Article Modal Component
const AddArticleModal = ({ date, initialData, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        title: initialData?.keyword ? `Article sur ${initialData.keyword}` : '',
        keyword: initialData?.keyword || '',
        volume: initialData?.volume || '',
        difficulty: initialData?.difficulty || '',
        type: 'Guide'
    });

    const types = ['Guide', 'How-to', 'Liste', 'Explainer', 'Tutorial'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.keyword) return;

        onAdd({
            id: Date.now(),
            ...formData,
            volume: parseInt(formData.volume) || 0,
            difficulty: parseInt(formData.difficulty) || 0,
            status: 'scheduled'
        });
    };

    const formatDate = (d) => {
        return d.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Planifier un article</h2>
                        <p className="modal-date">
                            <Calendar size={14} />
                            {formatDate(date)}
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Titre de l'article *</label>
                        <input
                            type="text"
                            placeholder="Ex: Guide complet du SEO pour débutants"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot-clé cible *</label>
                        <div className="input-with-icon">
                            <Target size={16} />
                            <input
                                type="text"
                                placeholder="Ex: seo débutant"
                                value={formData.keyword}
                                onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Volume de recherche</label>
                            <input
                                type="number"
                                placeholder="Ex: 1200"
                                value={formData.volume}
                                onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Difficulté (0-100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Ex: 35"
                                value={formData.difficulty}
                                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Type de contenu</label>
                        <div className="type-selector">
                            {types.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`type-btn ${formData.type === type ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary">
                            <Plus size={16} />
                            Planifier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContentPlanner;

