import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Headphones, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import './FunnelConvert.css';

const FunnelConvert = () => {
    const navigate = useNavigate();

    const handleActivate = () => {
        navigate('/funnel/payment');
    };

    const handleCall = () => {
        // Rediriger vers Calendly
        window.open('https://zcal.co/i/7LMkT11o', '_blank');
    };

    return (
        <div className="funnel-convert">
            <div className="funnel-container">
                {/* Header */}
                <div className="funnel-header">
                    <h1 className="funnel-title">
                        Activez votre agent SEO
                    </h1>
                    <p className="funnel-subtitle">
                        Choisissez comment vous souhaitez démarrer
                    </p>
                </div>

                {/* Primary CTA */}
                <div className="cta-card primary">
                    <div className="cta-icon">
                        <Zap size={32} />
                    </div>
                    <h2 className="cta-title">Activation automatique</h2>
                    <p className="cta-description">
                        Votre agent SEO sera configuré et prêt à publier vos articles en moins de 24h.
                    </p>
                    <div className="cta-benefits">
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Setup offert par notre équipe</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Configuration WordPress incluse</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Premier article publié automatiquement</span>
                        </div>
                    </div>
                    <button onClick={handleActivate} className="cta-button primary">
                        Activer mon agent SEO
                        <ArrowRight size={20} />
                    </button>
                    <p className="cta-note">
                        <Clock size={14} />
                        Activation en 24h • Setup offert
                    </p>
                </div>

                {/* Divider */}
                <div className="divider">
                    <span>ou</span>
                </div>

                {/* Secondary CTA */}
                <div className="cta-card secondary">
                    <div className="cta-icon">
                        <Headphones size={32} />
                    </div>
                    <h2 className="cta-title">On le fait ensemble</h2>
                    <p className="cta-description">
                        Réservez un appel de 15 minutes avec un expert pour configurer votre agent SEO ensemble.
                    </p>
                    <div className="cta-benefits">
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Configuration guidée en direct</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Réponses à toutes vos questions</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={18} />
                            <span>Premier article créé ensemble</span>
                        </div>
                    </div>
                    <button onClick={handleCall} className="cta-button secondary">
                        Réserver un appel (15 min)
                        <ArrowRight size={20} />
                    </button>
                    <p className="cta-note">
                        <TrendingUp size={14} />
                        Disponible aujourd'hui • Gratuit
                    </p>
                </div>

                {/* Trust Signals */}
                <div className="trust-signals">
                    <div className="trust-item">
                        <CheckCircle size={16} />
                        <span>Annulable à tout moment</span>
                    </div>
                    <div className="trust-item">
                        <CheckCircle size={16} />
                        <span>Résultats garantis</span>
                    </div>
                    <div className="trust-item">
                        <CheckCircle size={16} />
                        <span>Support inclus</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunnelConvert;

