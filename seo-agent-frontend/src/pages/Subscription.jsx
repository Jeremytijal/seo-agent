import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    CheckCircle, Zap, Users, FileText, Globe, 
    Headphones, Shield, ArrowRight, Loader2, Gift,
    Clock, CreditCard, Star, Sparkles, Target, Image
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
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
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
            price: 59,
            priceWithPromo: 29.50,
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
            price: 99,
            priceWithPromo: 49.50,
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

    const applyPromoCode = () => {
        if (promoCode.toUpperCase() === 'EARLYBIRD50') {
            setPromoApplied(true);
        } else {
            alert('Code promo invalide');
        }
    };

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
                    promoCode: promoApplied ? 'EARLYBIRD50' : null,
                    successUrl: `${window.location.origin}/?activated=true`,
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
                    {fromOnboarding && (
                        <div className="success-badge">
                            <CheckCircle size={18} />
                            <span>Bienvenue sur SEO Agent !</span>
                        </div>
                    )}
                    <h1>Choisissez votre plan</h1>
                    <p>Générez du contenu SEO optimisé automatiquement avec l'IA</p>
                </div>

                {/* Early Bird Banner */}
                <div className="early-bird-banner">
                    <div className="early-bird-icon">
                        <Gift size={24} />
                    </div>
                    <div className="early-bird-content">
                        <div className="early-bird-title">
                            🎉 Offre Early Bird : -50% avec le code EARLYBIRD50
                        </div>
                        <div className="early-bird-text">
                            Plus que <strong>{spotsLeft} places</strong> à ce tarif exclusif
                        </div>
                    </div>
                </div>

                {/* Promo Code Input */}
                <div className="promo-section">
                    <div className="promo-input-wrapper">
                        <input
                            type="text"
                            placeholder="Code promo"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            disabled={promoApplied}
                            className={promoApplied ? 'applied' : ''}
                        />
                        <button 
                            onClick={applyPromoCode} 
                            disabled={promoApplied || !promoCode}
                            className={promoApplied ? 'applied' : ''}
                        >
                            {promoApplied ? (
                                <>
                                    <CheckCircle size={16} />
                                    -50% appliqué !
                                </>
                            ) : (
                                'Appliquer'
                            )}
                        </button>
                    </div>
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
                                {promoApplied ? (
                                    <>
                                        <div className="price-row">
                                            <span className="price-old">{plan.price}€</span>
                                            <span className="price-current">{plan.priceWithPromo}€</span>
                                            <span className="price-period">/mois</span>
                                        </div>
                                        <span className="price-note promo">-50% avec EARLYBIRD50</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="price-row">
                                            <span className="price-current">{plan.price}€</span>
                                            <span className="price-period">/mois</span>
                                        </div>
                                        <span className="price-note">Utilisez EARLYBIRD50 pour -50%</span>
                                    </>
                                )}
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <CheckCircle size={16} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

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
                        </div>
                    ))}
                </div>

                {/* What you get */}
                <div className="features-summary">
                    <h4>Ce que vous obtenez</h4>
                    <div className="features-grid">
                        <div className="feature-item">
                            <FileText size={24} />
                            <span>Articles SEO optimisés</span>
                        </div>
                        <div className="feature-item">
                            <Target size={24} />
                            <span>Recherche de mots-clés</span>
                        </div>
                        <div className="feature-item">
                            <Globe size={24} />
                            <span>Publication WordPress</span>
                        </div>
                        <div className="feature-item">
                            <Image size={24} />
                            <span>Images IA générées</span>
                        </div>
                    </div>
                </div>

                {/* Guarantees */}
                <div className="guarantees">
                    <div className="guarantee-item">
                        <Shield size={20} />
                        <span>Satisfait ou remboursé 14 jours</span>
                    </div>
                    <div className="guarantee-item">
                        <Zap size={20} />
                        <span>Activation instantanée</span>
                    </div>
                    <div className="guarantee-item">
                        <Headphones size={20} />
                        <span>Support réactif</span>
                    </div>
                </div>

                {/* FAQ Mini */}
                <div className="subscription-faq">
                    <h4>Questions fréquentes</h4>
                    <div className="faq-items">
                        <div className="faq-item">
                            <strong>Que se passe-t-il après les 7 jours d'essai ?</strong>
                            <p>Votre carte sera débitée du premier mois. Vous pouvez annuler à tout moment avant la fin de l'essai.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Les articles générés sont-ils vraiment SEO-optimisés ?</strong>
                            <p>Oui ! Notre IA génère des articles avec structure H1/H2/H3, meta descriptions, FAQ, et optimisation des mots-clés.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Puis-je changer de plan plus tard ?</strong>
                            <p>Oui, vous pouvez upgrader ou downgrader à tout moment depuis les paramètres.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
