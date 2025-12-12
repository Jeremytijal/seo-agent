import React, { useState } from 'react';
import { 
    Search, Target, TrendingUp, TrendingDown, ArrowUpRight, Plus,
    Trash2, Star, StarOff, Filter, Download, RefreshCw,
    BarChart3, Globe, Users, DollarSign, ArrowRight
} from 'lucide-react';
import './Keywords.css';

const Keywords = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [savedKeywords, setSavedKeywords] = useState([
        { id: 1, keyword: 'agence seo paris', volume: 1200, difficulty: 45, cpc: 8.50, trend: 'up', saved: true },
        { id: 2, keyword: 'référencement naturel', volume: 8100, difficulty: 72, cpc: 12.30, trend: 'stable', saved: true },
        { id: 3, keyword: 'audit seo gratuit', volume: 2400, difficulty: 38, cpc: 5.20, trend: 'up', saved: true },
        { id: 4, keyword: 'optimisation seo', volume: 3600, difficulty: 55, cpc: 7.80, trend: 'down', saved: true },
    ]);
    const [activeTab, setActiveTab] = useState('research');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsSearching(true);

        // Simulation de recherche (à remplacer par l'appel API réel)
        setTimeout(() => {
            setSearchResults({
                seedKeyword: searchQuery,
                keywords: [
                    { id: 101, keyword: searchQuery, volume: 5400, difficulty: 62, cpc: 9.20, trend: 'up', saved: false },
                    { id: 102, keyword: `${searchQuery} gratuit`, volume: 2100, difficulty: 35, cpc: 4.50, trend: 'up', saved: false },
                    { id: 103, keyword: `meilleur ${searchQuery}`, volume: 1800, difficulty: 48, cpc: 11.00, trend: 'stable', saved: false },
                    { id: 104, keyword: `${searchQuery} 2024`, volume: 3200, difficulty: 28, cpc: 6.30, trend: 'up', saved: false },
                    { id: 105, keyword: `${searchQuery} en ligne`, volume: 890, difficulty: 42, cpc: 7.80, trend: 'stable', saved: false },
                    { id: 106, keyword: `comment faire ${searchQuery}`, volume: 1450, difficulty: 25, cpc: 3.20, trend: 'up', saved: false },
                    { id: 107, keyword: `${searchQuery} prix`, volume: 2800, difficulty: 55, cpc: 15.40, trend: 'up', saved: false },
                    { id: 108, keyword: `${searchQuery} avis`, volume: 1200, difficulty: 32, cpc: 5.60, trend: 'stable', saved: false },
                ]
            });
            setIsSearching(false);
        }, 2000);
    };

    const toggleSaveKeyword = (keyword) => {
        if (keyword.saved) {
            setSavedKeywords(prev => prev.filter(k => k.id !== keyword.id));
            if (searchResults) {
                setSearchResults(prev => ({
                    ...prev,
                    keywords: prev.keywords.map(k => 
                        k.id === keyword.id ? { ...k, saved: false } : k
                    )
                }));
            }
        } else {
            const newKeyword = { ...keyword, saved: true };
            setSavedKeywords(prev => [...prev, newKeyword]);
            if (searchResults) {
                setSearchResults(prev => ({
                    ...prev,
                    keywords: prev.keywords.map(k => 
                        k.id === keyword.id ? { ...k, saved: true } : k
                    )
                }));
            }
        }
    };

    const removeKeyword = (id) => {
        setSavedKeywords(prev => prev.filter(k => k.id !== id));
    };

    const getDifficultyColor = (difficulty) => {
        if (difficulty <= 30) return '#10B981';
        if (difficulty <= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getDifficultyLabel = (difficulty) => {
        if (difficulty <= 30) return 'Facile';
        if (difficulty <= 60) return 'Moyen';
        return 'Difficile';
    };

    const formatVolume = (volume) => {
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`;
        }
        return volume;
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
                    <button className="btn-secondary">
                        <Download size={18} />
                        Exporter
                    </button>
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
                                        <RefreshCw size={18} className="animate-spin" />
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
                                        {searchResults.keywords.map((kw) => (
                                            <tr key={kw.id}>
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
                                                    <span className="cpc-badge">{kw.cpc.toFixed(2)}€</span>
                                                </td>
                                                <td>
                                                    <TrendIcon trend={kw.trend} />
                                                </td>
                                                <td>
                                                    <button 
                                                        className={`btn-save ${kw.saved ? 'saved' : ''}`}
                                                        onClick={() => toggleSaveKeyword(kw)}
                                                    >
                                                        {kw.saved ? <Star size={16} /> : <StarOff size={16} />}
                                                    </button>
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
                            <RefreshCw size={32} className="animate-spin" />
                            <h3>Recherche en cours...</h3>
                            <p>Analyse des données pour "{searchQuery}"</p>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'saved' && (
                <div className="saved-keywords">
                    {savedKeywords.length > 0 ? (
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
                                            {formatVolume(savedKeywords.reduce((acc, k) => acc + k.volume, 0))}
                                        </span>
                                        <span className="stat-label">Volume total</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <BarChart3 size={20} />
                                    <div>
                                        <span className="stat-value">
                                            {Math.round(savedKeywords.reduce((acc, k) => acc + k.difficulty, 0) / savedKeywords.length)}
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
                                                    <span className="cpc-badge">{kw.cpc.toFixed(2)}€</span>
                                                </td>
                                                <td>
                                                    <TrendIcon trend={kw.trend} />
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-action create"
                                                            title="Créer un article"
                                                        >
                                                            <ArrowRight size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn-action delete"
                                                            onClick={() => removeKeyword(kw.id)}
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

