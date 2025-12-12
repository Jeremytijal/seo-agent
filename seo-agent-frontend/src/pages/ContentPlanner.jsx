import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, 
    FileText, Target, GripVertical, X, Clock, CheckCircle,
    MoreHorizontal, Edit3, Trash2, ExternalLink, Eye
} from 'lucide-react';
import './ContentPlanner.css';

const ContentPlanner = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [scheduledArticles, setScheduledArticles] = useState({
        '2025-01-13': [
            { id: 1, title: 'Guide SEO pour débutants', keyword: 'seo débutant', volume: 1200, difficulty: 25, type: 'Guide', status: 'scheduled' }
        ],
        '2025-01-15': [
            { id: 2, title: '10 techniques de link building', keyword: 'link building', volume: 890, difficulty: 45, type: 'Liste', status: 'scheduled' }
        ],
        '2025-01-17': [
            { id: 3, title: 'Optimiser ses images pour le SEO', keyword: 'optimisation images seo', volume: 720, difficulty: 18, type: 'How-to', status: 'draft' }
        ],
        '2025-01-20': [
            { id: 4, title: 'Recherche de mots-clés avancée', keyword: 'recherche mots-clés', volume: 1500, difficulty: 52, type: 'Guide', status: 'published' }
        ],
        '2025-01-22': [
            { id: 5, title: 'Audit SEO complet', keyword: 'audit seo', volume: 2100, difficulty: 38, type: 'Explainer', status: 'scheduled' }
        ],
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [draggedArticle, setDraggedArticle] = useState(null);
    const [draggedFromDate, setDraggedFromDate] = useState(null);
    const [initialKeywordData, setInitialKeywordData] = useState(null);

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

