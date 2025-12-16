import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, TrendingUp, Calendar, CheckCircle, BarChart3, Mail, MessageCircle, Rocket, Loader2 } from 'lucide-react';
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

    const [keywords, setKeywords] = useState([]);
    const [calendarDays, setCalendarDays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUrl = localStorage.getItem('funnel_url');
        const savedEmail = localStorage.getItem('funnel_email');
        const savedKeywords = localStorage.getItem('funnel_keywords');
        const savedCalendar = localStorage.getItem('funnel_calendar');
        
        if (savedUrl) {
            setUrl(savedUrl);
        }
        if (savedEmail) {
            setEmail(savedEmail);
        }

        // Charger les mots-clés depuis localStorage
        if (savedKeywords) {
            try {
                const parsedKeywords = JSON.parse(savedKeywords);
                setKeywords(parsedKeywords);
            } catch (e) {
                console.error('Error parsing keywords:', e);
            }
        }

        // Charger le calendrier depuis localStorage
        if (savedCalendar) {
            try {
                const parsedCalendar = JSON.parse(savedCalendar);
                // Convertir les dates ISO en objets Date
                const calendarWithDates = parsedCalendar.map(day => ({
                    ...day,
                    date: new Date(day.date)
                }));
                setCalendarDays(calendarWithDates);
            } catch (e) {
                console.error('Error parsing calendar:', e);
            }
        }

            // Si pas de données sauvegardées, utiliser des valeurs par défaut
        if (!savedKeywords) {
            const defaultKeywords = [
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
                },
                {
                    keyword: 'référencement naturel',
                    volume: 6800,
                    difficulty: 38,
                    opportunity: 'Opportunité SEO moyenne'
                },
                {
                    keyword: 'création de site web',
                    volume: 9200,
                    difficulty: 45,
                    opportunity: 'Volume élevé - concurrence modérée'
                },
                {
                    keyword: 'stratégie SEO',
                    volume: 5400,
                    difficulty: 32,
                    opportunity: 'Faible concurrence - bonne opportunité'
                }
            ];
            setKeywords(defaultKeywords);
            
            // Générer un calendrier par défaut
            const defaultCalendar = Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return {
                    date: date,
                    day: date.getDate(),
                    month: date.getMonth(),
                    weekday: date.getDay(),
                    hasArticle: i > 0 && i % 3 === 0,
                    keyword: i > 0 && i % 3 === 0 ? defaultKeywords[Math.floor((i / 3) % 3)].keyword : null,
                    articleNumber: i > 0 && i % 3 === 0 ? Math.floor(i / 3) : null
                };
            });
            setCalendarDays(defaultCalendar);
        }

        setIsLoading(false);
    }, []);

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
                    planId,
                    keywords,
                    calendar: calendarDays
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
        window.open('https://zcal.co/i/7LMkT11o', '_blank');
    };

    const handleAutoActivation = async () => {
        track('auto_activation_clicked', { variant: 'meta_funnel_v2' });
        
        if (!email) {
            // Si pas d'email, rediriger vers la page de conversion classique
            navigate('/funnel/convert');
            return;
        }

        try {
            setIsSendingEmail(true); // Réutiliser le state de loading
            
            // Créer une session Stripe checkout pour le funnel
            const response = await fetch(`${API_URL}/api/funnel/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    planId: 'starter', // Plan par défaut pour le funnel
                    source: 'meta_funnel'
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la session de paiement');
            }

            const data = await response.json();
            
            if (data.url) {
                // Rediriger vers Stripe checkout
                window.location.href = data.url;
            } else {
                throw new Error('URL de checkout non disponible');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            // En cas d'erreur, rediriger vers la page de conversion classique
            navigate('/funnel/convert');
        } finally {
            setIsSendingEmail(false);
        }
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
                        <h2>{keywords.length} mots-clés à fort potentiel</h2>
                    </div>
                    <div className="keywords-grid">
                        {keywords.map((kw, index) => (
                            <div key={index} className="keyword-card">
                                <div className="keyword-header-row">
                                    <div className="keyword-badge">{index + 1}</div>
                                    <h3 className="keyword-text">{kw.keyword}</h3>
                                </div>
                                <div className="keyword-metrics-row">
                                    <div className="metric-badge">
                                        <TrendingUp size={14} />
                                        <span className="metric-text">
                                            <strong>{kw.volume.toLocaleString()}</strong> recherches/mois
                                        </span>
                                    </div>
                                    <div className="metric-badge">
                                        <BarChart3 size={14} />
                                        <span className="metric-text">
                                            Difficulté <strong>{kw.difficulty}%</strong>
                                        </span>
                                    </div>
                                </div>
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
                        {/* En-tête du calendrier avec jours de la semaine */}
                        <div className="calendar-weekdays">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                                <div key={index} className="weekday-label">{day}</div>
                            ))}
                        </div>
                        
                        <div className="calendar-grid">
                            {calendarDays.slice(0, 30).map((day, index) => {
                                const isToday = day.date.toDateString() === new Date().toDateString();
                                const isPast = day.date < new Date() && !isToday;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`calendar-day ${day.hasArticle ? 'has-article' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                                        title={day.hasArticle ? `Article ${day.articleNumber}: ${day.keyword}` : ''}
                                    >
                                        <span className="day-number">{day.day}</span>
                                        {day.hasArticle && (
                                            <div className="article-indicator">
                                                <div className="article-dot"></div>
                                                {index < 14 && (
                                                    <span className="article-keyword">{day.keyword?.substring(0, 15)}...</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="calendar-stats">
                            <div className="stat-item">
                                <div className="stat-dot has-article"></div>
                                <span>{calendarDays.filter(d => d.hasArticle).length} articles planifiés</span>
                            </div>
                            <div className="stat-item">
                                <div className="stat-dot today"></div>
                                <span>Aujourd'hui</span>
                            </div>
                        </div>
                        
                        <p className="calendar-note">
                            <strong>{calendarDays.filter(d => d.hasArticle).length} articles</strong> planifiés sur les 30 prochains jours
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
                            disabled={isSendingEmail}
                            className="cta-option tertiary"
                        >
                            <Rocket size={20} />
                            <div className="cta-option-content">
                                <span className="cta-option-text">Lancer mon SEO automatiquement</span>
                                <span className="cta-option-microcopy">Setup offert • Activation en 24h • Annulable à tout moment</span>
                            </div>
                            {isSendingEmail ? (
                                <Loader2 size={20} className="spinning" />
                            ) : (
                                <ArrowRight size={20} />
                            )}
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



