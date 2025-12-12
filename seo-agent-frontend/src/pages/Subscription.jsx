import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    CheckCircle, ArrowRight, Loader2,
    Clock, CreditCard, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { API_URL } from '../config';
import './Subscription.css';

const Subscription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fromOnboarding = searchParams.get('from') === 'onboarding';
    
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [loading, setLoading] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [spotsLeft] = useState(12);

    useEffect(() => {
        if (user) {
            fetchCurrentSubscription();
        }
    }, [user]);

    const fetchCurrentSubscription = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_plan, subscription_status, trial_ends_at')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setCurrentSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        }
    };

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Idéal pour démarrer votre stratégie SEO',
            originalPrice: 59,
            price: 29,
            features: [
                '10 articles SEO / mois',
                'Recherche de mots-clés illimitée',
                '1 site WordPress connecté',
                'Génération d\'images IA',
                'Planificateur de contenu',
                'Support email'
            ],
            popular: false,
            stripePriceId: 'price_1SdY1tG7TquWCqOJA8uMm6RS'
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Pour les créateurs de contenu sérieux',
            originalPrice: 99,
            price: 49,
            features: [
                '50 articles SEO / mois',
                'Recherche de mots-clés illimitée',
                '5 sites WordPress connectés',
                'Génération d\'images IA illimitée',
                'Planificateur de contenu avancé',
                'Audit SEO de vos pages',
                'Support prioritaire',
                'API access'
            ],
            popular: true,
            stripePriceId: 'price_1SdY29G7TquWCqOJ77Tya1j1'
        }
    ];

    const handleStartTrial = async (planId, stripePriceId) => {
        setLoading(true);
        setSelectedPlan(planId);
        
        try {
            const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    planId: planId,
                    priceId: stripePriceId,
                    trialDays: 7,
                    promoCode: 'EARLYBIRD50', // Toujours appliquer le code promo
                    successUrl: `${window.location.origin}/planner?activated=true`,
                    cancelUrl: `${window.location.origin}/subscription`
                })
            });

            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Erreur lors de la création de la session');
            }
        } catch (error) {
            console.error('Error starting trial:', error);
            alert('Erreur lors de la redirection vers le paiement. Veuillez réessayer.');
            setLoading(false);
        }
    };

    return (
        <div className="subscription-page">
            <div className="subscription-container">
                {/* Header */}
                <div className="subscription-header">
                    <h1>Choisissez votre plan</h1>
                </div>

                {/* Early Bird Banner */}
                <div className="early-bird-banner">
                    <div className="early-bird-content">
                        <div className="early-bird-title">
                            🎉 Offre de lancement : -50% appliqué automatiquement !
                        </div>
                        <div className="early-bird-text">
                            Plus que <strong>{spotsLeft} places</strong> à ce tarif exclusif
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="plans-grid two-plans">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`plan-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <div className="popular-badge">
                                    <Star size={14} />
                                    Recommandé
                                </div>
                            )}
                            
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <p>{plan.description}</p>
                            </div>

                            <div className="plan-price">
                                <div className="price-row">
                                    <span className="price-old">{plan.originalPrice}€</span>
                                    <span className="price-current">{plan.price}€</span>
                                    <span className="price-period">/mois</span>
                                </div>
                                <span className="price-note promo">
                                    <CheckCircle size={14} /> -50% offre de lancement
                                </span>
                            </div>

                            <button 
                                className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartTrial(plan.id, plan.stripePriceId);
                                }}
                                disabled={loading && selectedPlan === plan.id}
                            >
                                {loading && selectedPlan === plan.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Essayer 7 jours gratuit
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <CheckCircle size={16} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Trial Info */}
                <div className="trial-info">
                    <div className="trial-info-item">
                        <Clock size={18} />
                        <span><strong>7 jours d'essai gratuit</strong> • 5 articles offerts</span>
                    </div>
                    <div className="trial-info-item">
                        <CreditCard size={18} />
                        <span>Carte requise • Annulez à tout moment</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
