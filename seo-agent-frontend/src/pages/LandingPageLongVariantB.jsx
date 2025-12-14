import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Zap, TrendingUp, Search, Target, Calendar, Shield, Mail } from 'lucide-react';
import { API_URL } from '../config';
import './LandingPageLongVariantB.css';

// Analytics tracking function (stub)
const track = (eventName, payload = {}) => {
    console.log(`[Analytics] ${eventName}`, payload);
    // TODO: Brancher avec votre solution analytics (GA4, Mixpanel, etc.)
    // Exemple: window.gtag?.('event', eventName, payload);
};

const LandingPageLongVariantB = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Track page view
        track('lp_view', { variant: 'B', source: 'meta' });
    }, []);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e, section = 'hero') => {
        e.preventDefault();
        
        if (!email || !validateEmail(email)) {
            setError('Veuillez entrer une adresse email valide');
            track('lead_error', { variant: 'B', error: 'invalid_email', section });
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Appel API pour sauvegarder le lead
            const response = await fetch(`${API_URL}/api/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    source: 'meta',
                    variant: 'B'
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement');
            }

            // Track success
            track('lead_submit', { variant: 'B', source: 'meta', section });

            // Sauvegarder l'email dans localStorage
            localStorage.setItem('funnel_email', email);
            
            // Rediriger vers l'analyse
            navigate(`/funnel/analyze?email=${encodeURIComponent(email)}`);
        } catch (err) {
            console.error('Error submitting lead:', err);
            setError('Une erreur est survenue. Veuillez réessayer.');
            track('lead_error', { variant: 'B', error: err.message, section });
            setIsLoading(false);
        }
    };

    const EmailForm = ({ section = 'hero', title, subtitle }) => (
        <form onSubmit={(e) => handleSubmit(e, section)} className="email-form">
            {title && <h2 className="form-title">{title}</h2>}
            {subtitle && <p className="form-subtitle">{subtitle}</p>}
            <div className="form-group">
                <input
                    type="email"
                    placeholder="Votre email professionnel"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    className={`email-input ${error ? 'error' : ''}`}
                    required
                />
                {error && <div className="form-error">{error}</div>}
            </div>
            <button 
                type="submit" 
                className="cta-button"
                disabled={isLoading}
            >
                {isLoading ? (
                    'Traitement...'
                ) : (
                    <>
                        Recevoir mon plan SEO gratuit
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
            <p className="form-note">
                🔒 Vos données sont protégées. Aucun spam. Désinscription en 1 clic.
            </p>
        </form>
    );

    return (
        <div className="lp-long-variant-b">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Boostez votre trafic SEO de <span className="highlight">+200% en 90 jours</span>
                        </h1>
                        <p className="hero-subtitle">
                            Recevez votre plan SEO personnalisé en 2 minutes. <strong>Gratuit, sans carte bancaire.</strong>
                        </p>

                        <div className="hero-bullets">
                            <div className="bullet-item">
                                <CheckCircle size={20} />
                                <span>Analyse SEO automatique de votre site</span>
                            </div>
                            <div className="bullet-item">
                                <CheckCircle size={20} />
                                <span>Plan de contenu priorisé sur 30 jours</span>
                            </div>
                            <div className="bullet-item">
                                <CheckCircle size={20} />
                                <span>Mots-clés à fort potentiel identifiés</span>
                            </div>
                        </div>

                        <EmailForm section="hero" />

                        <div className="hero-badges">
                            <div className="badge-item">
                                <Clock size={16} />
                                <span>2 minutes</span>
                            </div>
                            <div className="badge-item">
                                <Zap size={16} />
                                <span>100% automatique</span>
                            </div>
                            <div className="badge-item">
                                <TrendingUp size={16} />
                                <span>Résultats mesurables</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comment ça marche */}
            <section className="how-it-works-section">
                <div className="container">
                    <h2 className="section-title">Comment fonctionne votre plan SEO ?</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">🔍</div>
                            <h3 className="step-title">Analyse automatique de votre site</h3>
                            <p className="step-text">Structure, pages existantes, opportunités SEO</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">🎯</div>
                            <h3 className="step-title">Identification des meilleures opportunités</h3>
                            <p className="step-text">Mots-clés à potentiel, faible concurrence</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">📅</div>
                            <h3 className="step-title">Création de votre calendrier de contenu</h3>
                            <p className="step-text">Articles planifiés sur 30 jours, prêts à être publiés</p>
                        </div>
                    </div>
                    <p className="section-note">Aucune installation. Aucun engagement.</p>
                </div>
            </section>

            {/* Pour qui */}
            <section className="for-who-section">
                <div className="container">
                    <h2 className="section-title">Ce plan SEO est fait pour vous si :</h2>
                    <div className="for-who-list">
                        <div className="for-who-item">
                            <CheckCircle size={20} />
                            <span>Vous voulez plus de trafic sans recruter un rédacteur</span>
                        </div>
                        <div className="for-who-item">
                            <CheckCircle size={20} />
                            <span>Vous n'avez pas le temps de gérer le SEO</span>
                        </div>
                        <div className="for-who-item">
                            <CheckCircle size={20} />
                            <span>Vous êtes freelance, indépendant ou PME</span>
                        </div>
                        <div className="for-who-item">
                            <CheckCircle size={20} />
                            <span>Vous avez un site WordPress, Wix ou Webflow</span>
                        </div>
                    </div>
                    <p className="section-note">Si ce n'est pas votre cas, le plan vous le dira aussi.</p>
                </div>
            </section>

            {/* Ce que vous recevez */}
            <section className="what-you-get-section">
                <div className="container">
                    <h2 className="section-title">Ce que vous allez recevoir</h2>
                    <div className="what-you-get-list">
                        <div className="what-you-get-item">
                            <Target size={24} />
                            <div>
                                <strong>Les 3 opportunités SEO les plus rentables pour votre site</strong>
                            </div>
                        </div>
                        <div className="what-you-get-item">
                            <TrendingUp size={24} />
                            <div>
                                <strong>Une estimation du potentiel de trafic</strong>
                            </div>
                        </div>
                        <div className="what-you-get-item">
                            <Calendar size={24} />
                            <div>
                                <strong>Un calendrier clair pour les 30 prochains jours</strong>
                            </div>
                        </div>
                        <div className="what-you-get-item">
                            <Zap size={24} />
                            <div>
                                <strong>Une vision concrète de ce que l'IA peut automatiser pour vous</strong>
                            </div>
                        </div>
                    </div>
                    <p className="section-note">Pas de blabla, que du concret.</p>
                </div>
            </section>

            {/* Objections */}
            <section className="objections-section">
                <div className="container">
                    <h2 className="section-title">Pourquoi c'est gratuit ?</h2>
                    <p className="objections-text">
                        Le plan SEO vous permet de voir exactement ce que l'IA peut faire pour votre site. 
                        Vous êtes libre de l'activer ou non ensuite.
                    </p>
                    <div className="objections-badges">
                        <div className="objection-badge">
                            <Shield size={18} />
                            <span>Aucune carte bancaire</span>
                        </div>
                        <div className="objection-badge">
                            <CheckCircle size={18} />
                            <span>Aucun engagement</span>
                        </div>
                        <div className="objection-badge">
                            <Mail size={18} />
                            <span>Setup accompagné disponible</span>
                        </div>
                    </div>
                    <p className="objections-note">
                        <strong>80% de nos clients choisissent le setup accompagné.</strong>
                    </p>
                </div>
            </section>

            {/* CTA Final */}
            <section className="cta-final-section">
                <div className="container">
                    <EmailForm 
                        section="final"
                        title="Recevez votre plan SEO personnalisé"
                    />
                </div>
            </section>
        </div>
    );
};

export default LandingPageLongVariantB;

