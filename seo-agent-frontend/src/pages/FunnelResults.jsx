import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, TrendingUp, Calendar, CheckCircle, BarChart3, Mail, MessageCircle, Rocket } from 'lucide-react';
import { API_URL, CALENDLY_URL } from '../config';
import './FunnelResults.css';

// Analytics tracking function
const track = (eventName, payload = {}) => {
    console.log(`[Analytics] ${eventName}`, payload);
    if (window.fbq) {
        window.fbq('track', eventName, payload);
    }
};

const FunnelResults = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    useEffect(() => {
        const savedUrl = localStorage.getItem('funnel_url');
        const savedEmail = localStorage.getItem('funnel_email');
        if (savedUrl) {
            setUrl(savedUrl);
        }
        if (savedEmail) {
            setEmail(savedEmail);
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

    // Générer un planId fictif (à remplacer par un vrai planId si vous avez un système de plans)
    const planId = 'meta_funnel_plan_' + Date.now();

    const handleSendPlanByEmail = async () => {
        if (!email) {
            return;
        }

        track('plan_send_email_clicked', { variant: 'meta_funnel_v2' });
        setIsSendingEmail(true);

        try {
            const response = await fetch(`${API_URL}/api/plan/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    planId
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi');
            }

            track('plan_send_email_success', { variant: 'meta_funnel_v2' });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } catch (error) {
            console.error('Error sending plan:', error);
            track('plan_send_email_error', { variant: 'meta_funnel_v2', error: error.message });
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleExpertCall = () => {
        track('expert_call_clicked', { variant: 'meta_funnel_v2' });
        window.open(CALENDLY_URL, '_blank');
    };

    const handleAutoActivation = () => {
        track('auto_activation_clicked', { variant: 'meta_funnel_v2' });
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

                {/* New CTA Block */}
                <div className="cta-block">
                    <h2 className="cta-block-title">Que souhaitez-vous faire maintenant ?</h2>
                    <p className="cta-block-subtitle">
                        Votre plan est prêt. Choisissez l'option la plus simple pour vous.
                    </p>

                    <div className="cta-options">
                        {/* Option 1 - Email (secondary) */}
                        <button 
                            onClick={handleSendPlanByEmail}
                            disabled={!email || isSendingEmail}
                            className="cta-option secondary"
                        >
                            <Mail size={20} />
                            <div className="cta-option-content">
                                <span className="cta-option-text">Recevoir mon plan par email</span>
                                <span className="cta-option-microcopy">Idéal si vous êtes sur mobile ou pressé</span>
                            </div>
                        </button>

                        {/* Option 2 - Call expert (primary) */}
                        <button 
                            onClick={handleExpertCall}
                            className="cta-option primary"
                        >
                            <MessageCircle size={20} />
                            <div className="cta-option-content">
                                <span className="cta-option-text">Parler à un expert (15 min)</span>
                                <span className="cta-option-microcopy">On le met en place ensemble, sans engagement</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>

                        {/* Option 3 - Auto (tertiary) */}
                        <button 
                            onClick={handleAutoActivation}
                            className="cta-option tertiary"
                        >
                            <Rocket size={20} />
                            <div className="cta-option-content">
                                <span className="cta-option-text">Lancer mon SEO automatiquement</span>
                                <span className="cta-option-microcopy">Setup offert • Activation en 24h • Annulable à tout moment</span>
                            </div>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Trust Note */}
                <p className="trust-note">
                    ✨ Setup offert • Annulable à tout moment • Résultats garantis
                </p>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="toast-notification show">
                    <CheckCircle size={20} />
                    <span>✅ Plan envoyé ! Regardez votre boîte mail.</span>
                </div>
            )}
        </div>
    );
};

export default FunnelResults;



