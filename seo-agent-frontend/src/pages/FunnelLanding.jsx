import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Zap, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';
import './FunnelLanding.css';

const FunnelLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [utmParams, setUtmParams] = useState({});

    // Capturer les UTM et paramètres de tracking depuis l'URL
    useEffect(() => {
        const utm = {
            utm_source: searchParams.get('utm_source') || null,
            utm_medium: searchParams.get('utm_medium') || null,
            utm_campaign: searchParams.get('utm_campaign') || null,
            utm_content: searchParams.get('utm_content') || null,
            utm_term: searchParams.get('utm_term') || null,
            fbclid: searchParams.get('fbclid') || null,
            gclid: searchParams.get('gclid') || null,
            ref: searchParams.get('ref') || null
        };
        setUtmParams(utm);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Déterminer source et variant depuis les UTM
            const source = utmParams.utm_source || (utmParams.fbclid ? 'meta' : 'direct');
            const variant = utmParams.utm_content || 'A';

            // Appel API pour sauvegarder le lead et déclencher les notifications
            const response = await fetch(`${API_URL}/api/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    source,
                    variant,
                    utm_params: utmParams
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
            }

            // Sauvegarder l'email dans localStorage
            localStorage.setItem('funnel_email', email);
            
            // Rediriger vers la page post-email
            navigate('/funnel/url');
        } catch (err) {
            console.error('Error submitting lead:', err);
            setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
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



