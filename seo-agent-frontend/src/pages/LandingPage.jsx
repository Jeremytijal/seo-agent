import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Zap, Search, FileText, Image, Target, BarChart3, 
    CheckCircle, ArrowRight, Globe, RefreshCw, Calendar,
    Shield, TrendingUp, Play, Star, ChevronRight, Menu, X,
    ChevronDown, ExternalLink, Bot, Sparkles, PenTool,
    Send, Layout, Rocket, Mail, Linkedin, Settings
} from 'lucide-react';
import { CALENDLY_URL } from '../config';
import './LandingPage.css';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const successCases = [
        { company: "TechStartup", metric: "+340%", label: "Trafic organique", color: "#10B981" },
        { company: "E-commerce Pro", metric: "50+", label: "Articles/mois", color: "#3B82F6" },
        { company: "Agence Digital", metric: "x5", label: "Clients servis", color: "#8B5CF6" }
    ];

    const features = [
        {
            icon: <Search size={24} />,
            title: "Audit SEO Complet",
            description: "Analysez votre site en profondeur : technique, contenu, backlinks. Identifiez les problèmes et opportunités d'amélioration."
        },
        {
            icon: <Target size={24} />,
            title: "Recherche de Mots-clés",
            description: "Découvrez les mots-clés les plus pertinents pour votre niche avec analyse de la concurrence et volume de recherche."
        },
        {
            icon: <PenTool size={24} />,
            title: "Création de Contenu SEO",
            description: "Générez des articles de blog optimisés, avec la bonne structure, les bons mots-clés et un ton adapté à votre marque."
        },
        {
            icon: <Image size={24} />,
            title: "Génération d'Images",
            description: "Créez automatiquement des visuels uniques et optimisés pour illustrer vos articles et améliorer l'engagement."
        }
    ];

    const integrations = [
        { name: "WordPress", icon: "🔌", description: "Publication directe sur votre site WordPress" },
        { name: "Framer", icon: "🎨", description: "Intégration native avec Framer Sites" },
        { name: "Webflow", icon: "🌐", description: "Publiez directement sur Webflow CMS" }
    ];

    const faqs = [
        {
            question: "Comment l'IA génère-t-elle du contenu SEO de qualité ?",
            answer: "Notre IA analyse votre niche, vos concurrents et les meilleures pratiques SEO pour créer du contenu unique, bien structuré et optimisé pour les moteurs de recherche. Chaque article est personnalisé selon votre ton et votre audience."
        },
        {
            question: "L'audit SEO détecte-t-il tous les problèmes techniques ?",
            answer: "Oui, notre audit couvre les aspects techniques (vitesse, mobile, crawlabilité), le contenu (balises, structure, mots-clés) et les backlinks. Vous recevez un rapport détaillé avec des recommandations priorisées."
        },
        {
            question: "Puis-je réviser le contenu avant publication ?",
            answer: "Absolument ! Vous pouvez prévisualiser, modifier et approuver chaque article avant publication. L'IA apprend de vos corrections pour s'améliorer continuellement."
        },
        {
            question: "Comment fonctionne l'intégration WordPress/Webflow/Framer ?",
            answer: "Connectez votre site en quelques clics via API. L'agent publie directement vos articles avec les images, les balises méta et la mise en forme optimale."
        },
        {
            question: "Les images générées sont-elles libres de droits ?",
            answer: "Oui, toutes les images sont générées par IA et vous appartiennent entièrement. Vous pouvez les utiliser sans restriction sur votre site et vos réseaux sociaux."
        },
        {
            question: "Combien d'articles puis-je générer par mois ?",
            answer: "Cela dépend de votre plan. Le plan Starter permet 10 articles/mois, Growth 50 articles/mois, et Scale offre une génération illimitée."
        }
    ];

    const workflowSteps = [
        { icon: <Search size={20} />, title: "Audit & Analyse", desc: "Analysez votre site et identifiez les opportunités" },
        { icon: <Target size={20} />, title: "Stratégie Mots-clés", desc: "Trouvez les mots-clés à fort potentiel" },
        { icon: <PenTool size={20} />, title: "Création Contenu", desc: "Générez des articles SEO optimisés" },
        { icon: <Image size={20} />, title: "Visuels IA", desc: "Créez des images uniques pour chaque article" },
        { icon: <Send size={20} />, title: "Publication Auto", desc: "Publiez directement sur votre CMS" }
    ];

    return (
        <div className="landing-page patagon-style">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon seo-green">
                            <Sparkles size={18} />
                        </div>
                        <span>Agent IA SEO</span>
                    </Link>

                    <div className="nav-links desktop-only">
                        <a href="#features">Fonctionnalités</a>
                        <a href="#how-it-works">Comment ça marche</a>
                        <a href="#faq">FAQ</a>
                        <a href="#pricing">Tarifs</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <Link to="/login" className="btn-nav-text">Connexion</Link>
                        <Link to="/signup" className="btn-nav-primary">
                            Commencer gratuitement
                        </Link>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
                        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                        <div className="mobile-menu-actions">
                            <Link to="/login">Connexion</Link>
                            <Link to="/signup" className="btn-nav-primary">Commencer</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-eyebrow">🚀 Automatisez votre SEO avec l'IA</span>
                    <h1>Créez du contenu SEO<br />qui se classe vraiment</h1>
                    <p className="hero-description">
                        Agent IA SEO audite votre site, trouve les meilleurs mots-clés, 
                        crée des articles optimisés avec images et les publie automatiquement sur votre CMS.
                    </p>
                    
                    <div className="hero-badges">
                        <div className="hero-badge">
                            <Search size={16} />
                            <span>Audit SEO</span>
                        </div>
                        <div className="hero-badge">
                            <Target size={16} />
                            <span>Mots-clés</span>
                        </div>
                        <div className="hero-badge">
                            <PenTool size={16} />
                            <span>Contenu IA</span>
                        </div>
                        <div className="hero-badge">
                            <Send size={16} />
                            <span>Publication auto</span>
                        </div>
                    </div>

                    <div className="hero-actions">
                        <Link to="/signup" className="btn-primary-large">
                            Essayer gratuitement
                        </Link>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary-large">
                            Réserver une démo
                        </a>
                    </div>
                </div>
            </section>

            {/* Success Cases */}
            <section className="success-section">
                <div className="success-container">
                    {successCases.map((item, index) => (
                        <div key={index} className="success-card">
                            <span className="success-company">{item.company}</span>
                            <span className="success-metric" style={{ color: item.color }}>{item.metric}</span>
                            <span className="success-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Value Prop */}
            <section id="features" className="value-section">
                <div className="value-container">
                    <div className="value-header">
                        <span className="section-eyebrow">Fonctionnalités</span>
                        <h2>Tout ce qu'il faut pour<br />dominer Google</h2>
                    </div>

                    <div className="features-grid-4">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card-new">
                                <div className="feature-icon-new">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="integrations-section">
                <div className="integrations-container">
                    <div className="integrations-header">
                        <span className="section-eyebrow">Intégrations</span>
                        <h2>Publiez sur votre CMS en un clic</h2>
                        <p>Connectez votre site et laissez l'IA publier automatiquement vos articles optimisés.</p>
                    </div>

                    <div className="integrations-grid">
                        {integrations.map((integration, index) => (
                            <div key={index} className="integration-card-new">
                                <span className="integration-icon-large">{integration.icon}</span>
                                <h3>{integration.name}</h3>
                                <p>{integration.description}</p>
                                <span className="integration-status">
                                    <CheckCircle size={14} /> Disponible
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works - Workflow */}
            <section id="how-it-works" className="howitworks-section">
                <div className="howitworks-container">
                    <span className="section-eyebrow">Comment ça marche</span>
                    <h2>De l'audit à la publication en 5 étapes</h2>

                    <div className="workflow-steps">
                        {workflowSteps.map((step, index) => (
                            <div key={index} className="workflow-step">
                                <div className="step-icon">{step.icon}</div>
                                <div className="step-content">
                                    <span className="step-number">0{index + 1}</span>
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                                {index < workflowSteps.length - 1 && (
                                    <div className="step-arrow">
                                        <ArrowRight size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="howitworks-cta">
                        <Link to="/signup" className="btn-primary-large">Commencer maintenant</Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    <div className="stat-box">
                        <span className="stat-number">+500%</span>
                        <span className="stat-desc">Gain de temps vs rédaction manuelle</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">100%</span>
                        <span className="stat-desc">Contenu unique et optimisé SEO</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">3</span>
                        <span className="stat-desc">CMS supportés (WordPress, Framer, Webflow)</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">24/7</span>
                        <span className="stat-desc">Création et publication automatique</span>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-section">
                <div className="faq-container">
                    <span className="section-eyebrow">FAQ</span>
                    <h2>Questions fréquentes</h2>
                    <p className="faq-subtitle">Tout ce que vous devez savoir sur Agent IA SEO</p>

                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="faq-question">
                                    <span>{faq.question}</span>
                                    <ChevronDown size={20} className="faq-icon" />
                                </div>
                                {openFaq === index && (
                                    <div className="faq-answer">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="faq-contact">
                        <p>Encore des questions ?</p>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-text-link">Contactez-nous →</a>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="pricing-container">
                    <span className="section-eyebrow">Tarifs</span>
                    <h2>Choisissez votre plan SEO</h2>
                    <p className="pricing-subtitle">Commencez gratuitement, évoluez selon vos besoins</p>

                    {/* Early Bird Banner */}
                    <div className="early-bird-banner">
                        <div className="early-bird-icon">🎁</div>
                        <div className="early-bird-content">
                            <span className="early-bird-title">Offre de lancement</span>
                            <span className="early-bird-text">-50% pendant 3 mois pour les premiers utilisateurs</span>
                        </div>
                        <div className="early-bird-badge">Limité</div>
                    </div>

                    <div className="pricing-grid">
                        {/* Starter */}
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3>Starter</h3>
                                <p className="pricing-desc">Pour démarrer votre stratégie SEO</p>
                            </div>
                            <div className="pricing-price">
                                <div className="price-wrapper">
                                    <span className="price-old">58€</span>
                                    <span className="price">29€</span>
                                    <span className="price-period">/mois</span>
                                </div>
                                <span className="price-note">pendant 3 mois, puis 58€/mois</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={18} /> 10 articles/mois</li>
                                <li><CheckCircle size={18} /> Audit SEO basique</li>
                                <li><CheckCircle size={18} /> Recherche mots-clés</li>
                                <li><CheckCircle size={18} /> Images IA incluses</li>
                                <li><CheckCircle size={18} /> 1 site connecté</li>
                                <li><CheckCircle size={18} /> Support email</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Growth - Featured */}
                        <div className="pricing-card featured">
                            <div className="pricing-badge">Populaire</div>
                            <div className="pricing-header">
                                <h3>Growth</h3>
                                <p className="pricing-desc">Pour scaler votre contenu</p>
                            </div>
                            <div className="pricing-price">
                                <div className="price-wrapper">
                                    <span className="price-old">118€</span>
                                    <span className="price">59€</span>
                                    <span className="price-period">/mois</span>
                                </div>
                                <span className="price-note">pendant 3 mois, puis 118€/mois</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={18} /> 50 articles/mois</li>
                                <li><CheckCircle size={18} /> Audit SEO complet</li>
                                <li><CheckCircle size={18} /> Analyse concurrence</li>
                                <li><CheckCircle size={18} /> Images IA illimitées</li>
                                <li><CheckCircle size={18} /> 3 sites connectés</li>
                                <li><CheckCircle size={18} /> Publication automatique</li>
                                <li><CheckCircle size={18} /> Support prioritaire</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing featured">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Scale */}
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3>Scale</h3>
                                <p className="pricing-desc">Pour les agences & gros volumes</p>
                            </div>
                            <div className="pricing-price">
                                <div className="price-wrapper">
                                    <span className="price">Sur mesure</span>
                                </div>
                                <span className="price-note">Contactez-nous</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={18} /> Articles illimités</li>
                                <li><CheckCircle size={18} /> Tout Growth +</li>
                                <li><CheckCircle size={18} /> Sites illimités</li>
                                <li><CheckCircle size={18} /> API access</li>
                                <li><CheckCircle size={18} /> White-label option</li>
                                <li><CheckCircle size={18} /> Account manager dédié</li>
                                <li><CheckCircle size={18} /> SLA garanti</li>
                            </ul>
                            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-pricing">
                                Nous contacter
                            </a>
                        </div>
                    </div>

                    <p className="pricing-guarantee">
                        ✨ Essai gratuit 7 jours • Sans engagement • Satisfait ou remboursé
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Prêt à booster votre SEO avec l'IA ?</h2>
                    <p>Rejoignez les entreprises qui automatisent leur stratégie de contenu</p>
                    <div className="cta-actions">
                        <Link to="/signup" className="btn-cta-primary">
                            Commencer gratuitement
                        </Link>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-cta-secondary">
                            Réserver une démo
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="logo-icon seo-green">
                                    <Sparkles size={18} />
                                </div>
                                <span>Agent IA SEO</span>
                            </div>
                            <p>L'agent IA qui automatise votre stratégie SEO de A à Z.</p>
                            <div className="footer-social">
                                <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                                <a href="#" aria-label="Website"><Globe size={20} /></a>
                                <a href="#" aria-label="Email"><Mail size={20} /></a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Produit</h4>
                                <a href="#features">Fonctionnalités</a>
                                <a href="#pricing">Tarifs</a>
                                <a href="#how-it-works">Comment ça marche</a>
                            </div>
                            <div className="footer-column">
                                <h4>Ressources</h4>
                                <a href="#">Blog</a>
                                <a href="#">Documentation</a>
                                <a href="#">Guides SEO</a>
                            </div>
                            <div className="footer-column">
                                <h4>Entreprise</h4>
                                <a href="#">À propos</a>
                                <a href="#">Contact</a>
                                <a href="#">Partenaires</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2025 Agent IA SEO. Tous droits réservés.</p>
                        <div className="footer-legal">
                            <Link to="/privacy">Politique de confidentialité</Link>
                            <Link to="/terms">CGU</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
