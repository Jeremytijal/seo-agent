import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, TrendingUp, Calendar, CheckCircle, BarChart3 } from 'lucide-react';
import './FunnelResults.css';

const FunnelResults = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');

    useEffect(() => {
        const savedUrl = localStorage.getItem('funnel_url');
        if (savedUrl) {
            setUrl(savedUrl);
        }
    }, []);

    // Mots-clés auto-sélectionnés (simulation)
    const keywords = [
        {
            keyword: 'marketing digital',
            volume: 12000,
            difficulty: 35,
            opportunity: 'Forte opportunité - faible concurrence'
        },
        {
            keyword: 'formation en ligne',
            volume: 8500,
            difficulty: 42,
            opportunity: 'Potentiel de trafic élevé'
        },
        {
            keyword: 'e-commerce',
            volume: 15000,
            difficulty: 55,
            opportunity: 'Volume important - stratégie long terme'
        }
    ];

    // Calendrier simplifié (30 jours)
    const calendarDays = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            date: date,
            hasContent: i % 3 === 0 && i > 0, // Un article tous les 3 jours
            keyword: i % 3 === 0 && i > 0 ? keywords[i % 3].keyword : null
        };
    });

    const handleContinue = () => {
        navigate('/funnel/convert');
    };

    return (
        <div className="funnel-results">
            <div className="funnel-container">
                {/* Progress */}
                <div className="funnel-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '100%' }}></div>
                    </div>
                    <span className="progress-text">Étape 3 sur 3</span>
                </div>

                {/* Success Header */}
                <div className="funnel-header">
                    <div className="success-icon">
                        <CheckCircle size={48} />
                    </div>
                    <h1 className="funnel-title">
                        Votre plan SEO est prêt !
                    </h1>
                    <p className="funnel-subtitle">
                        Voici les opportunités identifiées pour votre site
                    </p>
                </div>

                {/* Keywords Section */}
                <div className="results-section">
                    <div className="section-header">
                        <Target size={24} />
                        <h2>3 mots-clés à fort potentiel</h2>
                    </div>
                    <div className="keywords-list">
                        {keywords.map((kw, index) => (
                            <div key={index} className="keyword-card">
                                <div className="keyword-header">
                                    <span className="keyword-number">{index + 1}</span>
                                    <h3 className="keyword-text">{kw.keyword}</h3>
                                </div>
                                <div className="keyword-stats">
                                    <div className="stat-item">
                                        <TrendingUp size={16} />
                                        <span>{kw.volume.toLocaleString()}/mois</span>
                                    </div>
                                    <div className="stat-item">
                                        <BarChart3 size={16} />
                                        <span>Difficulté: {kw.difficulty}%</span>
                                    </div>
                                </div>
                                <p className="keyword-opportunity">{kw.opportunity}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Preview */}
                <div className="results-section">
                    <div className="section-header">
                        <Calendar size={24} />
                        <h2>Votre calendrier SEO (30 jours)</h2>
                    </div>
                    <div className="calendar-preview">
                        <div className="calendar-grid">
                            {calendarDays.slice(0, 14).map((day, index) => (
                                <div 
                                    key={index} 
                                    className={`calendar-day ${day.hasContent ? 'has-content' : ''}`}
                                >
                                    <span className="day-number">{day.date.getDate()}</span>
                                    {day.hasContent && (
                                        <div className="day-content">
                                            <div className="content-dot"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="calendar-note">
                            <strong>10 articles</strong> planifiés sur les 30 prochains jours
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <button onClick={handleContinue} className="funnel-cta">
                    Activer mon agent SEO
                    <ArrowRight size={20} />
                </button>

                {/* Trust Note */}
                <p className="trust-note">
                    ✨ Setup offert • Annulable à tout moment • Résultats garantis
                </p>
            </div>
        </div>
    );
};

export default FunnelResults;

