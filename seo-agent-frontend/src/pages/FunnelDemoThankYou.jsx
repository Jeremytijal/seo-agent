import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    CheckCircle, ArrowRight, Layers, Rocket, Gift, 
    Star, Shield, Calendar, Sparkles, Mail, Play
} from 'lucide-react';
import './FunnelDemoThankYou.css';

const FunnelDemoThankYou = () => {
    const [userData, setUserData] = useState(null);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Retrieve saved data
        const savedData = localStorage.getItem('demo_request');
        if (savedData) {
            setUserData(JSON.parse(savedData));
        }

        // Hide confetti after animation
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="funnel-thank-you">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div 
                            key={i} 
                            className="confetti-piece"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                backgroundColor: ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Background Effects */}
            <div className="thank-you-bg">
                <div className="thank-glow glow-1"></div>
                <div className="thank-glow glow-2"></div>
            </div>

            {/* Header */}
            <header className="thank-you-header">
                <Link to="/landing/redacteur" className="thank-logo">
                    <div className="logo-icon">
                        <Layers size={20} />
                    </div>
                    <span>Agent SEO</span>
                </Link>
            </header>

            {/* Main Content */}
            <div className="thank-you-container">
                {/* Success Card */}
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={48} />
                    </div>

                    <h1 className="success-title">
                        Demande envoyée avec succès !
                    </h1>

                    <p className="success-message">
                        {userData ? (
                            <>
                                Merci <strong>{userData.prenom}</strong> ! Notre équipe va analyser 
                                <strong> {userData.siteInternet}</strong> et vous contacter très rapidement 
                                à <strong>{userData.email}</strong> pour planifier votre démo personnalisée.
                            </>
                        ) : (
                            <>
                                Merci ! Notre équipe va analyser votre site et vous contacter 
                                très rapidement pour planifier votre démo personnalisée.
                            </>
                        )}
                    </p>

                    <div className="success-timeline">
                        <div className="timeline-item">
                            <div className="timeline-icon">
                                <Mail size={18} />
                            </div>
                            <div className="timeline-content">
                                <strong>Sous 24h</strong>
                                <span>Vous recevrez un email de confirmation</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon">
                                <Calendar size={18} />
                            </div>
                            <div className="timeline-content">
                                <strong>Sous 48h</strong>
                                <span>Un expert vous contacte pour planifier</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Offer Card */}
                <div className="offer-card">
                    <div className="offer-badge">
                        <Gift size={16} />
                        <span>Offre exclusive</span>
                    </div>

                    <h2 className="offer-title">
                        Envie de tester Agent SEO maintenant ?
                    </h2>

                    <p className="offer-description">
                        Créez votre compte gratuitement et commencez à générer du contenu SEO 
                        dès aujourd'hui. <strong>7 jours d'essai gratuit</strong>, sans engagement.
                    </p>

                    <div className="offer-benefits">
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Accès immédiat à toutes les fonctionnalités</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Générez vos premiers articles en 5 minutes</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Sans carte bancaire requise</span>
                        </div>
                    </div>

                    <Link to="/signup" className="offer-cta">
                        <Rocket size={20} />
                        Essayer Agent SEO gratuitement
                        <ArrowRight size={18} />
                    </Link>

                    <p className="offer-reassurance">
                        <Shield size={14} />
                        Essai 7 jours • Sans engagement • Annulation en 1 clic
                    </p>
                </div>

                {/* Social Proof */}
                <div className="thank-social-proof">
                    <div className="proof-avatars">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                        <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="User" />
                    </div>
                    <div className="proof-text">
                        <div className="proof-stars">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
                            ))}
                        </div>
                        <span>Rejoint par <strong>500+ entreprises</strong> ce mois</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunnelDemoThankYou;

