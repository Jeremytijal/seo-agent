import React, { useState, useEffect } from 'react';
import { 
    Search, Target, TrendingUp, TrendingDown, ArrowUpRight, Plus,
    Trash2, Star, StarOff, Filter, Download, RefreshCw,
    BarChart3, Globe, Users, DollarSign, ArrowRight, Loader2, AlertCircle,
    CalendarPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Keywords.css';

const Keywords = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [savedKeywords, setSavedKeywords] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [activeTab, setActiveTab] = useState('research');
    const [error, setError] = useState(null);

    // Charger les mots-clés favoris au démarrage
    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            setLoadingFavorites(true);
            const response = await fetch(`${API_URL}/api/keywords/favorites/${user.id}`);
            const data = await response.json();
            setSavedKeywords((data.favorites || []).map(kw => ({ ...kw, saved: true })));
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setLoadingFavorites(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsSearching(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/keywords/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    keyword: searchQuery,
                    country: 'fr',
                    language: 'fr'
                })
            });

            const data = await response.json();

            if (data.success) {
                // Marquer les mots-clés déjà sauvegardés
                const savedIds = new Set(savedKeywords.map(k => k.keyword.toLowerCase()));
                const resultsWithSaved = data.results.map(kw => ({
                    ...kw,
                    saved: savedIds.has(kw.keyword.toLowerCase())
                }));

                setSearchResults({
                    seedKeyword: searchQuery,
                    keywords: resultsWithSaved
                });
            } else {
                setError(data.error || 'Erreur lors de la recherche');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Impossible de se connecter au serveur');
        } finally {
            setIsSearching(false);
        }
    };

    const toggleSaveKeyword = async (keyword) => {
        if (keyword.saved) {
            // Supprimer des favoris
            try {
                await fetch(`${API_URL}/api/keywords/favorites/${user.id}/${keyword.id}`, {
                    method: 'DELETE'
                });
                setSavedKeywords(prev => prev.filter(k => k.keyword !== keyword.keyword));
                
                if (searchResults) {
                    setSearchResults(prev => ({
                        ...prev,
                        keywords: prev.keywords.map(k => 
                            k.keyword === keyword.keyword ? { ...k, saved: false } : k
                        )
                    }));
                }
            } catch (err) {
                console.error('Error removing favorite:', err);
            }
        } else {
            // Ajouter aux favoris
            try {
                const response = await fetch(`${API_URL}/api/keywords/favorites/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(keyword)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const newKeyword = { ...data.keyword, saved: true };
                    setSavedKeywords(prev => [...prev, newKeyword]);
                    
                    if (searchResults) {
                        setSearchResults(prev => ({
                            ...prev,
                            keywords: prev.keywords.map(k => 
                                k.keyword === keyword.keyword ? { ...k, saved: true, id: data.keyword.id } : k
                            )
                        }));
                    }
                }
            } catch (err) {
                console.error('Error saving favorite:', err);
            }
        }
    };

    const removeKeyword = async (keyword) => {
        try {
            await fetch(`${API_URL}/api/keywords/favorites/${user.id}/${keyword.id}`, {
                method: 'DELETE'
            });
            setSavedKeywords(prev => prev.filter(k => k.id !== keyword.id));
        } catch (err) {
            console.error('Error removing keyword:', err);
        }
    };

    const exportKeywords = () => {
        const data = savedKeywords.map(k => ({
            'Mot-clé': k.keyword,
            'Volume': k.volume,
            'Difficulté': k.difficulty,
            'CPC': k.cpc,
            'Tendance': k.trend
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keywords_seoagent_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getDifficultyColor = (difficulty) => {
        if (difficulty <= 30) return '#10B981';
        if (difficulty <= 60) return '#F59E0B';
        return '#EF4444';
    };

    const formatVolume = (volume) => {
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`;
        }
        return volume;
    };

    const addToCalendar = (keyword) => {
        // Naviguer vers le planificateur avec le mot-clé pré-rempli
        navigate(`/planner?keyword=${encodeURIComponent(keyword.keyword)}&volume=${keyword.volume || 0}&difficulty=${keyword.difficulty || 0}`);
    };

    const TrendIcon = ({ trend }) => {
        if (trend === 'up') return <TrendingUp size={14} className="trend-icon up" />;
        if (trend === 'down') return <TrendingDown size={14} className="trend-icon down" />;
        return <span className="trend-icon stable">—</span>;
    };

    return (
        <div className="keywords-page">
            <header className="keywords-header">
                <div>
                    <h1>Recherche de mots-clés</h1>
                    <p>Trouvez les meilleures opportunités SEO pour votre contenu</p>
                </div>
                <div className="header-actions">
                    {savedKeywords.length > 0 && (
                        <button className="btn-secondary" onClick={exportKeywords}>
                            <Download size={18} />
                            Exporter
                        </button>
                    )}
                </div>
            </header>

            {/* Tabs */}
            <div className="keywords-tabs">
                <button 
                    className={activeTab === 'research' ? 'active' : ''}
                    onClick={() => setActiveTab('research')}
                >
                    <Search size={18} />
                    Recherche
                </button>
                <button 
                    className={activeTab === 'saved' ? 'active' : ''}
                    onClick={() => setActiveTab('saved')}
                >
                    <Star size={18} />
                    Sauvegardés ({savedKeywords.length})
                </button>
            </div>

            {activeTab === 'research' && (
                <>
                    {/* Search Form */}
                    <div className="keywords-search-card">
                        <form onSubmit={handleSearch} className="keywords-form">
                            <div className="input-wrapper">
                                <Target size={20} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Entrez un mot-clé principal (ex: marketing digital)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={isSearching} className="btn-search">
                                {isSearching ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Recherche...
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} />
                                        Rechercher
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="keywords-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults && !isSearching && (
                        <div className="keywords-results">
                            <div className="results-header">
                                <h3>
                                    Résultats pour "<span>{searchResults.seedKeyword}</span>"
                                </h3>
                                <span className="results-count">{searchResults.keywords.length} mots-clés trouvés</span>
                            </div>

                            <div className="keywords-table-wrapper">
                                <table className="keywords-table">
                                    <thead>
                                        <tr>
                                            <th>Mot-clé</th>
                                            <th>
                                                <Users size={14} />
                                                Volume
                                            </th>
                                            <th>
                                                <BarChart3 size={14} />
                                                Difficulté
                                            </th>
                                            <th>
                                                <DollarSign size={14} />
                                                CPC
                                            </th>
                                            <th>Tendance</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.keywords.map((kw, index) => (
                                            <tr key={kw.id || index}>
                                                <td className="kw-cell">
                                                    <span className="kw-text">{kw.keyword}</span>
                                                </td>
                                                <td>
                                                    <span className="volume-badge">{formatVolume(kw.volume)}</span>
                                                </td>
                                                <td>
                                                    <div className="difficulty-cell">
                                                        <div className="difficulty-bar">
                                                            <div 
                                                                className="difficulty-fill"
                                                                style={{ 
                                                                    width: `${kw.difficulty}%`,
                                                                    background: getDifficultyColor(kw.difficulty)
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span 
                                                            className="difficulty-label"
                                                            style={{ color: getDifficultyColor(kw.difficulty) }}
                                                        >
                                                            {kw.difficulty}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="cpc-badge">{(kw.cpc || 0).toFixed(2)}€</span>
                                                </td>
                                                <td>
                                                    <TrendIcon trend={kw.trend} />
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-action calendar"
                                                            onClick={() => addToCalendar(kw)}
                                                            title="Ajouter au calendrier"
                                                        >
                                                            <CalendarPlus size={16} />
                                                        </button>
                                                        <button 
                                                            className={`btn-save ${kw.saved ? 'saved' : ''}`}
                                                            onClick={() => toggleSaveKeyword(kw)}
                                                            title={kw.saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                        >
                                                            {kw.saved ? <Star size={16} /> : <StarOff size={16} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!searchResults && !isSearching && (
                        <div className="keywords-empty">
                            <div className="empty-illustration">
                                <Target size={48} />
                            </div>
                            <h3>Trouvez vos mots-clés</h3>
                            <p>Entrez un mot-clé principal pour découvrir des opportunités SEO avec le volume de recherche, la difficulté et le CPC.</p>
                            <div className="empty-examples">
                                <span>Exemples:</span>
                                <button onClick={() => setSearchQuery('marketing digital')}>marketing digital</button>
                                <button onClick={() => setSearchQuery('formation en ligne')}>formation en ligne</button>
                                <button onClick={() => setSearchQuery('e-commerce')}>e-commerce</button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isSearching && (
                        <div className="keywords-loading">
                            <Loader2 size={32} className="animate-spin" />
                            <h3>Recherche en cours...</h3>
                            <p>Analyse des données pour "{searchQuery}"</p>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'saved' && (
                <div className="saved-keywords">
                    {loadingFavorites ? (
                        <div className="keywords-loading">
                            <Loader2 size={32} className="animate-spin" />
                            <p>Chargement des favoris...</p>
                        </div>
                    ) : savedKeywords.length > 0 ? (
                        <>
                            <div className="saved-stats">
                                <div className="stat-card">
                                    <Target size={20} />
                                    <div>
                                        <span className="stat-value">{savedKeywords.length}</span>
                                        <span className="stat-label">Mots-clés</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Users size={20} />
                                    <div>
                                        <span className="stat-value">
                                            {formatVolume(savedKeywords.reduce((acc, k) => acc + (k.volume || 0), 0))}
                                        </span>
                                        <span className="stat-label">Volume total</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <BarChart3 size={20} />
                                    <div>
                                        <span className="stat-value">
                                            {Math.round(savedKeywords.reduce((acc, k) => acc + (k.difficulty || 0), 0) / savedKeywords.length)}
                                        </span>
                                        <span className="stat-label">Difficulté moy.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="keywords-table-wrapper">
                                <table className="keywords-table">
                                    <thead>
                                        <tr>
                                            <th>Mot-clé</th>
                                            <th>Volume</th>
                                            <th>Difficulté</th>
                                            <th>CPC</th>
                                            <th>Tendance</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savedKeywords.map((kw) => (
                                            <tr key={kw.id}>
                                                <td className="kw-cell">
                                                    <span className="kw-text">{kw.keyword}</span>
                                                </td>
                                                <td>
                                                    <span className="volume-badge">{formatVolume(kw.volume || 0)}</span>
                                                </td>
                                                <td>
                                                    <div className="difficulty-cell">
                                                        <div className="difficulty-bar">
                                                            <div 
                                                                className="difficulty-fill"
                                                                style={{ 
                                                                    width: `${kw.difficulty || 0}%`,
                                                                    background: getDifficultyColor(kw.difficulty || 0)
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span 
                                                            className="difficulty-label"
                                                            style={{ color: getDifficultyColor(kw.difficulty || 0) }}
                                                        >
                                                            {kw.difficulty || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="cpc-badge">{(kw.cpc || 0).toFixed(2)}€</span>
                                                </td>
                                                <td>
                                                    <TrendIcon trend={kw.trend} />
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-action calendar"
                                                            title="Ajouter au calendrier"
                                                            onClick={() => addToCalendar(kw)}
                                                        >
                                                            <CalendarPlus size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn-action create"
                                                            title="Créer un article"
                                                            onClick={() => navigate(`/contents?keyword=${encodeURIComponent(kw.keyword)}`)}
                                                        >
                                                            <ArrowRight size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn-action delete"
                                                            onClick={() => removeKeyword(kw)}
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="keywords-empty">
                            <div className="empty-illustration">
                                <Star size={48} />
                            </div>
                            <h3>Aucun mot-clé sauvegardé</h3>
                            <p>Recherchez des mots-clés et sauvegardez ceux qui vous intéressent pour les retrouver ici.</p>
                            <button className="btn-primary" onClick={() => setActiveTab('research')}>
                                <Search size={18} />
                                Rechercher des mots-clés
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Keywords;
