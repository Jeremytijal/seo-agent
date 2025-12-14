import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Clock, Shield, TrendingUp } from 'lucide-react';
import './FunnelPayment.css';

const FunnelPayment = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        
        // Rediriger vers Stripe Checkout
        // TODO: Implémenter l'appel API pour créer la session Stripe
        try {
            // Pour l'instant, redirection vers la page de subscription existante
            navigate('/subscription?plan=starter&funnel=true');
        } catch (error) {
            console.error('Payment error:', error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="funnel-payment">
            <div className="funnel-container">
                {/* Header */}
                <div className="funnel-header">
                    <h1 className="funnel-title">
                        Un seul plan, <span className="highlight">sans engagement</span>
                    </h1>
                    <p className="funnel-subtitle">
                        Commencez dès aujourd'hui. Annulez quand vous voulez.
                    </p>
                </div>

                {/* Plan Card */}
                <div className="plan-card">
                    <div className="plan-badge">Le plus populaire</div>
                    <div className="plan-header">
                        <h2 className="plan-name">Starter</h2>
                        <div className="plan-price">
                            <span className="price-amount">29€</span>
                            <span className="price-period">/mois</span>
                        </div>
                    </div>

                    <div className="plan-features">
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span><strong>10 articles SEO</strong> par mois</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span><strong>Recherche illimitée</strong> de mots-clés</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span><strong>Publication automatique</strong> sur votre site</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span><strong>Calendrier de contenu</strong> optimisé</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span><strong>Support prioritaire</strong> inclus</span>
                        </div>
                    </div>

                    <div className="plan-highlight">
                        <Zap size={20} />
                        <div>
                            <strong>Setup offert</strong>
                            <p>Configuration WordPress incluse par notre équipe</p>
                        </div>
                    </div>
                </div>

                {/* Payment CTA */}
                <button 
                    onClick={handlePayment} 
                    className="payment-button"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        'Traitement en cours...'
                    ) : (
                        <>
                            Activer pour 29€/mois
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>

                {/* Trust Signals */}
                <div className="payment-trust">
                    <div className="trust-item">
                        <Shield size={18} />
                        <span>Paiement sécurisé</span>
                    </div>
                    <div className="trust-item">
                        <Clock size={18} />
                        <span>Annulable à tout moment</span>
                    </div>
                    <div className="trust-item">
                        <TrendingUp size={18} />
                        <span>Résultats garantis</span>
                    </div>
                </div>

                {/* Value Props */}
                <div className="value-props">
                    <div className="value-item">
                        <div className="value-icon">
                            <Zap size={24} />
                        </div>
                        <h3>Gain de temps</h3>
                        <p>Fini les heures passées à rédiger. Votre agent SEO fait le travail pour vous.</p>
                    </div>
                    <div className="value-item">
                        <div className="value-icon">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Trafic garanti</h3>
                        <p>Augmentez votre trafic organique de +200% en 90 jours ou remboursé.</p>
                    </div>
                    <div className="value-item">
                        <div className="value-icon">
                            <Clock size={24} />
                        </div>
                        <h3>Zéro effort</h3>
                        <p>On s'occupe de tout : recherche, rédaction, publication. Vous récoltez les résultats.</p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="payment-footer">
                    🔒 Vos données sont protégées. Aucun engagement, annulation en 1 clic.
                </p>
            </div>
        </div>
    );
};

export default FunnelPayment;

