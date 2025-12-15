import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Zap, CheckCircle } from 'lucide-react';
import './FunnelLanding.css';

const FunnelLanding = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Sauvegarder l'email dans localStorage
            localStorage.setItem('funnel_email', email);
            
            // Rediriger vers la page post-email
            navigate('/funnel/url');
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setIsLoading(false);
        }
    };

    return (
        <div className="funnel-landing">
            <div className="funnel-container">
                {/* Header */}
                <div className="funnel-header">
                    <div className="funnel-logo">
                        <div className="logo-icon">SEO</div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="funnel-hero">
                    <h1 className="funnel-title">
                        Boostez votre trafic SEO de <span className="highlight">+200% en 90 jours</span>
                    </h1>
                    <p className="funnel-subtitle">
                        Recevez votre plan SEO personnalisé en 2 minutes. 
                        <strong> Gratuit, sans carte bancaire.</strong>
                    </p>
                </div>

                {/* Benefits */}
                <div className="funnel-benefits">
                    <div className="benefit-item">
                        <CheckCircle size={20} className="benefit-icon" />
                        <span>Analyse SEO automatique de votre site</span>
                    </div>
                    <div className="benefit-item">
                        <CheckCircle size={20} className="benefit-icon" />
                        <span>Plan de contenu sur 30 jours</span>
                    </div>
                    <div className="benefit-item">
                        <CheckCircle size={20} className="benefit-icon" />
                        <span>Mots-clés à fort potentiel identifiés</span>
                    </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="funnel-form">
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Votre email professionnel"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="email-input"
                            required
                        />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <button 
                        type="submit" 
                        className="funnel-cta"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            'Chargement...'
                        ) : (
                            <>
                                Recevoir mon plan SEO gratuit
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Trust Signals */}
                <div className="funnel-trust">
                    <div className="trust-item">
                        <Clock size={16} />
                        <span>2 minutes</span>
                    </div>
                    <div className="trust-item">
                        <Zap size={16} />
                        <span>100% automatique</span>
                    </div>
                    <div className="trust-item">
                        <TrendingUp size={16} />
                        <span>Résultats garantis</span>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="funnel-footer-note">
                    🔒 Vos données sont protégées. Aucun spam, désinscription en 1 clic.
                </p>
            </div>
        </div>
    );
};

export default FunnelLanding;



