import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Sparkles, Search, FileText, Image, Target, BarChart3, 
    CheckCircle, ArrowRight, Globe, RefreshCw, Calendar,
    Shield, TrendingUp, Play, Star, ChevronRight, Menu, X,
    ChevronDown, ExternalLink, Bot, PenTool, Zap,
    Send, Layout, Rocket, Mail, Linkedin, Twitter, Users,
    Clock, Award, Layers, MousePointer, Plus, Eye, Loader2,
    UserCheck, Headphones, Settings, Gift, Quote, TrendingDown,
    DollarSign, AlertCircle, Coffee, Phone, Video, BookOpen
} from 'lucide-react';
import './LandingPage.css';

const LandingPageRedacteur = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showFloatingCTA, setShowFloatingCTA] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            // Show floating CTA after scrolling 300px
            setShowFloatingCTA(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll animations with Intersection Observer
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: <Search size={28} />,
            title: "Audit SEO Intelligent",
            description: "Analysez n'importe quel site en profondeur. Obtenez un score détaillé et des recommandations actionnables.",
            color: "#10B981"
        },
        {
            icon: <Target size={28} />,
            title: "Recherche de Mots-clés",
            description: "Découvrez des opportunités cachées avec notre analyse de mots-clés alimentée par l'IA.",
            color: "#3B82F6"
        },
        {
            icon: <PenTool size={28} />,
            title: "Contenu SEO Automatisé",
            description: "Générez des articles optimisés de 2000+ mots en quelques secondes, prêts à être publiés.",
            color: "#8B5CF6"
        },
        {
            icon: <Image size={28} />,
            title: "Images IA Uniques",
            description: "Créez des visuels originaux pour chaque article. Fini les photos stock génériques.",
            color: "#F59E0B"
        },
        {
            icon: <Send size={28} />,
            title: "Publication Automatique",
            description: "Publiez directement sur WordPress, Webflow ou Framer. Zéro copier-coller.",
            color: "#EC4899"
        },
        {
            icon: <BarChart3 size={28} />,
            title: "Analytics & Suivi",
            description: "Suivez vos positions et mesurez l'impact de chaque article sur votre trafic.",
            color: "#14B8A6"
        }
    ];

    const steps = [
        { 
            number: "01", 
            title: "Auditez", 
            desc: "Analysez votre site ou celui de vos concurrents",
            visual: "🔍"
        },
        { 
            number: "02", 
            title: "Planifiez", 
            desc: "Identifiez les mots-clés à fort potentiel",
            visual: "🎯"
        },
        { 
            number: "03", 
            title: "Créez", 
            desc: "Générez des articles SEO optimisés avec l'IA",
            visual: "✨"
        },
        { 
            number: "04", 
            title: "Publiez", 
            desc: "Publiez automatiquement sur votre CMS",
            visual: "🚀"
        }
    ];

    const testimonials = [
        {
            quote: "J'ai multiplié mon trafic organique par 5 en 3 mois. L'IA génère du contenu que Google adore.",
            author: "Marie Dupont",
            role: "Fondatrice, TechStartup.io",
            avatar: "MD",
            platform: "twitter"
        },
        {
            quote: "On publie 50 articles/mois au lieu de 5. La qualité est bluffante, mes clients sont ravis.",
            author: "Thomas Martin",
            role: "CEO, Agence Digitale",
            avatar: "TM",
            platform: "twitter"
        },
        {
            quote: "L'intégration WordPress est parfaite. Je génère, je valide, c'est en ligne. Simple et efficace.",
            author: "Sophie Bernard",
            role: "Blogueuse Pro",
            avatar: "SB",
            platform: "twitter"
        }
    ];

    // Témoignages Twitter style (plus détaillés avec métriques)
    const twitterTestimonials = [
        {
            name: "Romain L.",
            handle: "@romainbuilds",
            avatar: "RL",
            avatarImage: "https://i.pravatar.cc/150?img=12",
            content: "On a fait passer le Domain Authority de notre site de 12 à 34 en 4 mois grâce à Agent SEO. Les articles générés sont vraiment de qualité pro.",
            metric: { label: "Domain Rating", before: "12", after: "34" },
            date: "Dec 28, 2025",
            likes: 24,
            verified: true
        },
        {
            name: "Alex P.",
            handle: "@alexpro_seo",
            avatar: "AP",
            avatarImage: "https://i.pravatar.cc/150?img=33",
            content: "J'étais sceptique sur l'IA pour le SEO... 3 mois plus tard : +4600 visiteurs organiques. Le contenu est indétectable et rank super bien.",
            metric: { label: "Trafic organique", before: "800", after: "5,400" },
            date: "Dec 15, 2025",
            likes: 47,
            verified: true
        },
        {
            name: "Julie M.",
            handle: "@juliemkt",
            avatar: "JM",
            avatarImage: "https://i.pravatar.cc/150?img=47",
            content: "L'accompagnement avec l'expert était top. Tout configuré en 30min, mes premiers articles publiés le jour même. Je recommande !",
            date: "Dec 20, 2025",
            likes: 18,
            verified: false,
            screenshot: {
                image: "/images/google-search-console-performance.png",
                title: "Performance Google Search Console",
                metrics: [
                    { label: "Clics totaux", value: "52,9K" },
                    { label: "Impressions", value: "8,91M" },
                    { label: "CTR moyen", value: "0,6%" },
                    { label: "Position moyenne", value: "4,7" }
                ],
                caption: "Croissance continue du trafic organique en 3 mois"
            }
        },
        {
            name: "Marc D.",
            handle: "@marcdupont_dev",
            avatar: "MD",
            avatarImage: "https://i.pravatar.cc/150?img=51",
            content: "60% de notre trafic vient maintenant du SEO. On publie 30 articles/mois en autopilote. Le ROI est dingue.",
            metric: { label: "Articles/mois", before: "3", after: "30" },
            date: "Dec 22, 2025",
            likes: 33,
            verified: true,
            screenshot: {
                image: "/images/seo-dashboard-positions.png",
                title: "Dashboard SEO - Positions",
                metrics: [
                    { label: "Position moyenne", value: "67" },
                    { label: "% en Top 10", value: "5%" },
                    { label: "Trafic prévu", value: "1,686" },
                    { label: "Visibilité", value: "0,4" }
                ],
                caption: "Amélioration continue : +1% en top 10 chaque mois"
            }
        },
        {
            name: "Sarah K.",
            handle: "@sarahkontent",
            avatar: "SK",
            avatarImage: "https://i.pravatar.cc/150?img=68",
            content: "En tant que blogueuse, je passais des heures à écrire. Maintenant l'IA me génère des brouillons parfaits que j'adapte en 10 min. Game changer.",
            date: "Dec 18, 2025",
            likes: 29,
            verified: false
        },
        {
            name: "Pierre B.",
            handle: "@pierrebiz",
            avatar: "PB",
            avatarImage: "https://i.pravatar.cc/150?img=15",
            content: "Le setup avec l'expert m'a permis de tout comprendre rapidement. Support hyper réactif. Mon site WordPress publie maintenant automatiquement.",
            metric: { label: "Temps gagné", before: "20h", after: "2h/semaine" },
            date: "Dec 25, 2025",
            likes: 41,
            verified: true
        }
    ];

    // Exemples d'articles générés
    const articleExamples = [
        {
            title: "10 Stratégies de Marketing Digital pour 2025",
            site: "MarketingPro.fr",
            siteIcon: "🎯",
            type: "Listicle",
            seoScore: 94,
            words: 2847,
            excerpt: "Le marketing digital évolue rapidement. Découvrez les 10 stratégies incontournables pour booster votre visibilité en ligne et générer plus de leads qualifiés..."
        },
        {
            title: "Comment Créer une Stratégie SEO Efficace : Guide Complet",
            site: "TechStartup.io",
            siteIcon: "🚀",
            type: "Guide",
            seoScore: 97,
            words: 3254,
            excerpt: "Une stratégie SEO bien pensée peut transformer votre acquisition de trafic. Ce guide détaille étape par étape comment construire une présence organique durable..."
        },
        {
            title: "WordPress vs Webflow : Quel CMS Choisir en 2025 ?",
            site: "DevBlog.com",
            siteIcon: "💻",
            type: "Comparatif",
            seoScore: 91,
            words: 2156,
            excerpt: "Le choix d'un CMS impacte directement votre productivité et vos résultats SEO. Analyse complète des forces et faiblesses de WordPress et Webflow..."
        }
    ];

    const logos = [
        { name: "WordPress", icon: "🔵" },
        { name: "Webflow", icon: "🟣" },
        { name: "Framer", icon: "⚫" },
        { name: "Wix", icon: "🟡" },
    ];

    return (
        <div className="landing-outrank">
            {/* Navigation */}
            <nav className={`nav-outrank ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon-new">
                            <Layers size={20} />
                        </div>
                        <span>Agent SEO</span>
                    </Link>

                    <div className="nav-links desktop-only">
                        <a href="#features">Fonctionnalités</a>
                        <a href="#how-it-works">Comment ça marche</a>
                        <a href="#pricing">Tarifs</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <Link to="/login" className="btn-nav-ghost">Connexion</Link>
                        <Link to="/signup" className="btn-nav-cta">
                            Démarrer gratuitement
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu-outrank">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                        <div className="mobile-menu-cta">
                            <Link to="/login">Connexion</Link>
                            <Link to="/signup" className="btn-nav-cta">Démarrer</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section - Outrank Style with Floating Cards */}
            <section className="hero-outrank hero-floating">
                <div className="hero-bg-effects">
                    <div className="hero-glow"></div>
                    <div className="hero-grid"></div>
                </div>
                
                {/* Floating Cards Container */}
                <div className="floating-cards-container">
                    {/* Top Left - SEO Score */}
                    <div className="floating-card float-tl seo-score-card">
                        <span className="floating-card-label">SEO Score</span>
                        <div className="floating-score-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" className="score-bg" />
                                <circle cx="50" cy="50" r="40" className="score-fill" />
                            </svg>
                            <span className="floating-score-value">97%</span>
                        </div>
                    </div>

                    {/* Top Right - Images AI */}
                    <div className="floating-card float-tr images-card">
                        <Image size={18} className="floating-card-icon" />
                        <span>Images IA</span>
                    </div>

                    {/* Left - Keywords */}
                    <div className="floating-card float-l keywords-card">
                        <Target size={18} className="floating-card-icon" />
                        <span>Mots-clés</span>
                    </div>

                    {/* Right - Article Published */}
                    <div className="floating-card float-r article-card">
                        <div className="floating-article-mini">
                            <div className="article-mini-header">
                                <span className="article-mini-day">4</span>
                                <span className="article-mini-status">Publié</span>
                            </div>
                            <span className="article-mini-title">articles SEO optimisés</span>
                            <span className="article-mini-stats">Vol: 2154 • KD: 9</span>
                        </div>
                    </div>

                    {/* Bottom Left - Calendar */}
                    <div className="floating-card float-bl calendar-card">
                        <div className="calendar-mini">
                            <Calendar size={16} />
                            <span>30 articles/mois</span>
                        </div>
                    </div>

                    {/* Bottom Right - Auto Publish */}
                    <div className="floating-card float-br publish-card">
                        <Send size={18} className="floating-card-icon" />
                        <span>Auto-publish</span>
                    </div>
                </div>
                
                {/* Main Hero Content */}
                <div className="hero-content-outrank">
                    {/* Guarantee Badge */}
                    <div className="hero-guarantee-badge">
                        <Shield size={18} />
                        <span><strong>Garantie 90 jours</strong> : Remboursé si pas en 1ère page</span>
                    </div>

                    <h1>
                        Générez des clients en <span className="gradient-text">autopilote</span>
                    </h1>
                    
                    <p className="hero-desc">
                        L'IA génère des articles SEO, les publie automatiquement et vous ramène 
                        du trafic Google & ChatGPT. <strong>Essai gratuit 7 jours • Sans engagement</strong>
                    </p>

                    <div className="hero-cta-group">
                        <Link to="/landing/redacteur/demo" className="btn-hero-primary">
                            <Phone size={18} />
                            Demander une démo gratuite
                        </Link>
                        <Link to="/signup" className="btn-hero-secondary">
                            Essayer gratuitement
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="hero-proof">
                        <div className="hero-avatars">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="avatar-img" />
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="avatar-img" />
                            <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="User" className="avatar-img" />
                            <div className="avatar-more">+</div>
                        </div>
                        <div className="hero-proof-text">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />)}
                            </div>
                            <span><strong>10K+</strong> articles générés</span>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator">
                    <span className="scroll-text">Découvrez comment</span>
                    <div className="scroll-arrow">
                        <ChevronDown size={24} />
                            </div>
                        </div>
            </section>

            {/* Transition Wave */}
            <div className="hero-transition">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,70 1440,60 L1440,120 L0,120 Z" fill="#ffffff"/>
                </svg>
                            </div>

            {/* Social Proof Banner */}
            <section className="social-proof-banner">
                <div className="social-proof-content">
                    <div className="social-proof-item">
                        <Users size={20} />
                        <div>
                            <span className="social-proof-value">500+</span>
                            <span className="social-proof-label">entreprises actives</span>
                        </div>
                                </div>
                    <div className="social-proof-divider"></div>
                    <div className="social-proof-item">
                        <Star size={20} fill="#FBBF24" color="#FBBF24" />
                        <div>
                            <span className="social-proof-value">4.9/5</span>
                            <span className="social-proof-label">satisfaction client</span>
                                </div>
                                    </div>
                    <div className="social-proof-divider"></div>
                    <div className="social-proof-item">
                        <TrendingUp size={20} />
                        <div>
                            <span className="social-proof-value">+250%</span>
                            <span className="social-proof-label">trafic moyen gagné</span>
                                    </div>
                                </div>
                    <div className="social-proof-divider"></div>
                    <div className="social-proof-item">
                        <FileText size={20} />
                        <div>
                            <span className="social-proof-value">10K+</span>
                            <span className="social-proof-label">articles générés</span>
                            </div>
                    </div>
                </div>
            </section>

            {/* Trust Logos Section */}
            <section className="trust-logos-section">
                <div className="section-container">
                    <p className="trust-logos-label">Ils nous font confiance</p>
                    <div className="trust-logos-grid">
                        <div className="trust-logo-item">
                            <div className="trust-logo-bilik">
                                <span>Bilik</span>
                            </div>
                        </div>
                        <div className="trust-logo-item">
                            <div className="trust-logo-melvita">
                                <span>Melvita</span>
                            </div>
                        </div>
                        <div className="trust-logo-item">
                            <div className="trust-logo-learnylib">
                                <div className="learnylib-icon"></div>
                                <span>LearnyLib</span>
                            </div>
                        </div>
                        <div className="trust-logo-item">
                            <div className="trust-logo-mooly">
                                <span>MOOL<span className="mooly-y-icon">Y</span></span>
                                <span className="mooly-tagline">DÉFINIS TES PROPRES RÈGLES</span>
                            </div>
                        </div>
                    </div>
                        </div>
            </section>

            {/* Problem / Solution Section */}
            <section className="problem-solution-section">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Le problème</span>
                        <h2>Votre problème<br /><span className="gradient-text">Notre solution</span></h2>
                        </div>

                    <div className="problem-solution-grid animate-on-scroll">
                        {/* Problems Column */}
                        <div className="problems-column">
                            <div className="problem-card">
                                <div className="problem-avatar">
                                    <DollarSign size={20} />
                                </div>
                                <div className="problem-content">
                                    <p>Les abonnements aux outils SEO (<strong>Ahrefs</strong>, <strong>SEMrush</strong>, etc.) coûtent <span className="problem-highlight">+500€/mois</span> de budget marketing.</p>
                                </div>
                                    </div>

                            <div className="problem-card">
                                <div className="problem-avatar">
                                    <AlertCircle size={20} />
                                    </div>
                                <div className="problem-content">
                                    <p>Jongler entre <strong>ChatGPT</strong>, <strong>Canva</strong>, et d'autres services — <span className="problem-highlight">perte de temps et d'efficacité</span>.</p>
                                </div>
                            </div>

                            <div className="problem-card">
                                <div className="problem-avatar">
                                    <Coffee size={20} />
                                </div>
                                <div className="problem-content">
                                    <p><span className="problem-highlight">Des heures perdues à apprendre les outils SEO</span> au lieu de développer votre business.</p>
                                </div>
                            </div>
                        </div>

                        {/* Solution Column */}
                        <div className="solution-column">
                            <div className="solution-card">
                                <div className="solution-header">
                                    <div className="solution-logo">
                                        <Layers size={24} />
                                    </div>
                                    <span>Agent SEO</span>
                                </div>
                                <p className="solution-tagline">Remplacez tous vos outils par une seule plateforme :</p>
                                <ul className="solution-features">
                                    <li>
                                        <CheckCircle size={18} />
                                        <span>Recherche de mots-clés</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={18} />
                                        <span>Génération de contenu IA</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={18} />
                                        <span>Optimisation SEO automatique</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={18} />
                                        <span>Images IA incluses</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={18} />
                                        <span>Publication automatique</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                        </div>
            </section>

            {/* Expert Setup Section */}
            <section className="expert-setup-section">
                <div className="section-container">
                    <div className="expert-setup-content animate-on-scroll">
                        <div className="expert-setup-text">
                            <span className="section-tag">Accompagnement personnalisé</span>
                            <h2>Un expert configure <span className="gradient-text">tout pour vous</span></h2>
                            <p className="expert-setup-desc">
                                Pas envie de passer des heures à configurer ? Notre équipe s'occupe de tout. 
                                Réservez un appel et bénéficiez d'une démo personnalisée + paramétrage complet offert.
                            </p>

                            <div className="expert-benefits">
                                <div className="expert-benefit">
                                    <div className="expert-benefit-icon">
                                        <Video size={24} />
                        </div>
                                    <div className="expert-benefit-content">
                                        <h4>Démo personnalisée</h4>
                                        <p>Découvrez Agent SEO adapté à votre cas d'usage spécifique</p>
                                    </div>
                                </div>

                                <div className="expert-benefit">
                                    <div className="expert-benefit-icon">
                                        <Settings size={24} />
                                    </div>
                                    <div className="expert-benefit-content">
                                        <h4>Paramétrage offert</h4>
                                        <p>Connexion CMS, configuration des mots-clés, personnalisation du ton</p>
                                    </div>
                                </div>

                                <div className="expert-benefit">
                                    <div className="expert-benefit-icon">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="expert-benefit-content">
                                        <h4>Formation incluse</h4>
                                        <p>Apprenez à tirer le maximum de l'outil en 30 minutes</p>
                                    </div>
                                </div>
                            </div>

                            <Link to="/landing/redacteur/demo" className="expert-cta-btn">
                                <Phone size={20} />
                                Réserver mon appel gratuit
                                <ArrowRight size={18} />
                            </Link>

                            <div className="expert-guarantee">
                                <Shield size={16} />
                                <span>100% gratuit • Sans engagement • 30 min chrono</span>
                            </div>
                        </div>

                        <div className="expert-setup-visual">
                            <div className="expert-card-preview">
                                <div className="expert-card-header">
                                    <div className="expert-avatar-large">
                                        <UserCheck size={32} />
                                    </div>
                                    <div className="expert-card-info">
                                        <h4>Votre Expert SEO</h4>
                                        <p>Disponible pour vous accompagner</p>
                                    </div>
                                </div>
                                <div className="expert-card-features">
                                    <div className="expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Analyse de votre site</span>
                                    </div>
                                    <div className="expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Stratégie de mots-clés</span>
                                    </div>
                                    <div className="expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Configuration complète</span>
                                    </div>
                                    <div className="expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Support prioritaire</span>
                                    </div>
                                </div>
                                <div className="expert-card-badge">
                                    <Gift size={16} />
                                    <span>Offert</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Before/After Section */}
            <section className="before-after-section">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Transformation</span>
                        <h2>Votre situation <span className="gradient-text">avant & après</span></h2>
                        <p>Découvrez comment Agent SEO transforme votre stratégie SEO</p>
                    </div>

                    <div className="before-after-grid animate-on-scroll">
                        {/* Before Column */}
                        <div className="before-after-column before-column">
                            <div className="before-after-header">
                                <AlertCircle size={24} className="before-icon" />
                                <h3>Avant Agent SEO</h3>
                            </div>
                            <div className="before-after-content">
                                <div className="before-after-item">
                                    <Clock size={20} />
                                    <div>
                                        <strong>3h par article</strong>
                                        <span>Rédaction manuelle</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <FileText size={20} />
                                    <div>
                                        <strong>5 articles/mois max</strong>
                                        <span>Limite de temps</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <DollarSign size={20} />
                                    <div>
                                        <strong>500€+ d'outils SEO</strong>
                                        <span>Ahrefs, SEMrush, etc.</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <TrendingDown size={20} />
                                    <div>
                                        <strong>Trafic stagnant</strong>
                                        <span>Pas de croissance</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <RefreshCw size={20} />
                                    <div>
                                        <strong>Copier-coller manuel</strong>
                                        <span>Sur WordPress</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arrow/VS */}
                        <div className="before-after-vs">
                            <ArrowRight size={32} className="vs-arrow" />
                            <span className="vs-text">VS</span>
                        </div>

                        {/* After Column */}
                        <div className="before-after-column after-column">
                            <div className="before-after-header">
                                <CheckCircle size={24} className="after-icon" />
                                <h3>Avec Agent SEO</h3>
                            </div>
                            <div className="before-after-content">
                                <div className="before-after-item">
                                    <Zap size={20} />
                                    <div>
                                        <strong>30 secondes</strong>
                                        <span>Génération automatique</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <FileText size={20} />
                                    <div>
                                        <strong>30+ articles/mois</strong>
                                        <span>En autopilote</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <DollarSign size={20} />
                                    <div>
                                        <strong>29€/mois tout inclus</strong>
                                        <span>Outils + IA + Publication</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <TrendingUp size={20} />
                                    <div>
                                        <strong>+250% de trafic</strong>
                                        <span>En 3 mois en moyenne</span>
                                    </div>
                                </div>
                                <div className="before-after-item">
                                    <Send size={20} />
                                    <div>
                                        <strong>Publication automatique</strong>
                                        <span>WordPress, Webflow, Framer</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="before-after-cta animate-on-scroll">
                        <Link to="/landing/redacteur/demo" className="btn-hero-primary">
                            <Phone size={18} />
                            Voir une démo personnalisée
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it Works - Simplified Visual */}
            <section className="how-it-works-visual">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Comment ça marche</span>
                        <h2>Comment on fait <span className="gradient-text">la magie</span></h2>
                        <p>On gère le SEO pour vous. Relaxez pendant qu'on crée du contenu qui rank.</p>
                    </div>

                    <div className="how-cards-grid animate-on-scroll">
                        <div className="how-card">
                            <div className="how-card-visual">
                                <div className="how-input-demo">
                                    <span className="how-label">Site à analyser</span>
                                    <div className="how-input-field">
                                        <Globe size={16} />
                                        <span>votresite.com</span>
                                    </div>
                                    <button className="how-analyze-btn">
                                        Analyser votre site
                                    </button>
                                </div>
                                <div className="how-cursor-icon">
                                    <MousePointer size={20} />
                                </div>
                            </div>
                            <h3>Analyse approfondie de votre business</h3>
                            <p>On explore votre niche, vos concurrents et votre audience cible. Découvrez des mots-clés cachés à fort potentiel.</p>
                        </div>

                        <div className="how-card">
                            <div className="how-card-visual">
                                <div className="how-calendar-demo">
                                    <div className="calendar-header">
                                        <span className="cal-day">4</span>
                                        <span className="cal-label">Sam</span>
                                    </div>
                                    <div className="calendar-article">
                                        <span className="cal-status">Publié</span>
                                        <span className="cal-title">Comment écrire des articles SEO</span>
                                        <div className="cal-stats">
                                            <span>Volume: 2154</span>
                                            <span>Difficulté: 9</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="handwritten-note bottom-right small">
                                    <span>Plan automatique</span>
                                </div>
                            </div>
                            <h3>Un plan de contenu sur 30 jours</h3>
                            <p>Créez un calendrier stratégique où chaque jour cible un mot-clé à fort potentiel pour votre business.</p>
                        </div>

                        <div className="how-card">
                            <div className="how-card-visual">
                                <div className="how-score-demo">
                                    <span className="score-title">SEO Content Score</span>
                                    <div className="score-circle">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" className="score-bg" />
                                            <circle cx="50" cy="50" r="40" className="score-fill" />
                                        </svg>
                                        <span className="score-value">97%</span>
                                    </div>
                                    <div className="score-meta">
                                        <span>Mots: 2,554</span>
                                        <span>Headings: 7</span>
                                    </div>
                                </div>
                            </div>
                            <h3>Articles générés en autopilote</h3>
                            <p>On crée et publie des articles optimisés SEO basés sur vos mots-clés. Votre blog grandit automatiquement.</p>
                        </div>
                    </div>

                    <div className="how-cta-center animate-on-scroll">
                        <Link to="/landing/redacteur/demo" className="btn-hero-primary">
                            <Phone size={18} />
                            Demander ma démo gratuite
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section with Screenshots */}
            <section className="benefits-screenshots">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Fonctionnalités</span>
                        <h2>Débloquez votre <span className="gradient-text">croissance SEO</span></h2>
                        <p>Des articles optimisés chaque jour, sans effort.</p>
                    </div>

                    {/* Dashboard Screenshot */}
                    <div className="benefit-item-screenshot animate-on-scroll">
                        <div className="benefit-content">
                            <div className="benefit-icon-large">
                                <BarChart3 size={32} />
                            </div>
                            <h3>Tableau de bord complet</h3>
                            <p>Visualisez toutes vos métriques SEO en un coup d'œil : articles créés, mots-clés suivis, audits réalisés, et bien plus.</p>
                            <ul className="benefit-features">
                                <li><CheckCircle size={16} /> KPIs en temps réel</li>
                                <li><CheckCircle size={16} /> Graphiques d'activité</li>
                                <li><CheckCircle size={16} /> Contenu récent</li>
                            </ul>
                        </div>
                        <div className="screenshot-wrapper">
                            <div className="dashboard-preview">
                                <div className="preview-header">
                                    <div className="preview-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <span>Tableau de bord - SEO Agent</span>
                                </div>
                                <div className="preview-content dashboard-preview-content">
                                    {/* KPIs */}
                                    <div className="preview-kpis">
                                        <div className="preview-kpi-card">
                                            <div className="preview-kpi-icon green">
                                                <FileText size={18} />
                                            </div>
                                            <div className="preview-kpi-content">
                                                <span className="preview-kpi-value">30</span>
                                                <span className="preview-kpi-label">Articles créés</span>
                                            </div>
                                        </div>
                                        <div className="preview-kpi-card">
                                            <div className="preview-kpi-icon blue">
                                                <Send size={18} />
                                            </div>
                                            <div className="preview-kpi-content">
                                                <span className="preview-kpi-value">28</span>
                                                <span className="preview-kpi-label">Publiés</span>
                                            </div>
                                        </div>
                                        <div className="preview-kpi-card">
                                            <div className="preview-kpi-icon purple">
                                                <Target size={18} />
                                            </div>
                                            <div className="preview-kpi-content">
                                                <span className="preview-kpi-value">156</span>
                                                <span className="preview-kpi-label">Mots-clés</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Content */}
                                    <div className="preview-recent">
                                        <div className="preview-articles">
                                            <div className="preview-article-item">
                                                <FileText size={14} />
                                                <span>Guide SEO 2025</span>
                                                <span className="preview-status published">Publié</span>
                                            </div>
                                            <div className="preview-article-item">
                                                <FileText size={14} />
                                                <span>Marketing digital</span>
                                                <span className="preview-status scheduled">Programmé</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planner Screenshot */}
                    <div className="benefit-item-screenshot reverse animate-on-scroll">
                        <div className="benefit-content">
                            <div className="benefit-icon-large">
                                <Calendar size={32} />
                            </div>
                            <h3>Planificateur de contenu intelligent</h3>
                            <p>Organisez vos articles avec un calendrier visuel. Glissez-déposez, planifiez et suivez votre stratégie de contenu.</p>
                            <ul className="benefit-features">
                                <li><CheckCircle size={16} /> Vue calendrier mensuelle</li>
                                <li><CheckCircle size={16} /> Drag & drop intuitif</li>
                                <li><CheckCircle size={16} /> Planification automatique</li>
                            </ul>
                        </div>
                        <div className="screenshot-wrapper">
                            <div className="planner-preview">
                                <div className="preview-header">
                                    <div className="preview-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <span>Planificateur de contenu</span>
                                </div>
                                <div className="preview-content planner-preview-content">
                                    {/* Stats */}
                                    <div className="preview-planner-stats">
                                        <div className="preview-stat">
                                            <span className="preview-stat-value">30</span>
                                            <span className="preview-stat-label">Ce mois</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="preview-stat-value">28</span>
                                            <span className="preview-stat-label">Publiés</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="preview-stat-value">2</span>
                                            <span className="preview-stat-label">Planifiés</span>
                                        </div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="preview-calendar-grid">
                                        {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map(day => (
                                            <div key={day} className="preview-cal-day-header">{day}</div>
                                        ))}
                                        {Array.from({ length: 35 }, (_, i) => {
                                            const day = i + 1;
                                            
                                            // Articles marketing/SEO répartis sur le mois
                                            const articles = {
                                                3: { title: 'SEO local', type: 'Guide', vol: 2400, kd: 28 },
                                                5: { title: 'Content marketing', type: 'How-to', vol: 1800, kd: 32 },
                                                8: { title: 'Backlinks stratégie', type: 'Guide', vol: 3200, kd: 45 },
                                                10: { title: 'Email marketing', type: 'Liste', vol: 1500, kd: 25 },
                                                13: { title: 'SEO technique', type: 'Guide', vol: 2100, kd: 38, generating: true },
                                                15: { title: 'Growth hacking', type: 'How-to', vol: 1900, kd: 30 },
                                                17: { title: 'Marketing automation', type: 'Guide', vol: 2800, kd: 42 },
                                                19: { title: 'SEO on-page', type: 'Tutorial', vol: 2200, kd: 35 },
                                                22: { title: 'Social media SEO', type: 'Guide', vol: 1600, kd: 28 },
                                                24: { title: 'Inbound marketing', type: 'How-to', vol: 2000, kd: 33 },
                                                26: { title: 'SEO e-commerce', type: 'Guide', vol: 3500, kd: 48 },
                                                28: { title: 'Marketing digital', type: 'Liste', vol: 1700, kd: 27 },
                                                30: { title: 'SEO international', type: 'Guide', vol: 1200, kd: 22 }
                                            };
                                            
                                            const article = articles[day];
                                            
                                            return (
                                                <div key={i} className={`preview-cal-day ${article ? 'has-article' : ''}`}>
                                                    <span className="preview-cal-day-number">{day <= 31 ? day : ''}</span>
                                                    {article && (
                                                        <div className="preview-cal-article">
                                                            <div className="preview-cal-article-type">{article.type}</div>
                                                            <div className="preview-cal-article-title">{article.title}</div>
                                                            {article.generating && (
                                                                <div className="preview-cal-article-status generating">
                                                                    <Loader2 size={8} className="spin" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Creation Screenshot */}
                    <div className="benefit-item-screenshot animate-on-scroll">
                        <div className="benefit-content">
                            <div className="benefit-icon-large">
                                <PenTool size={32} />
                            </div>
                            <h3>Génération d'articles optimisés</h3>
                            <p>Créez des articles de 2000+ mots optimisés SEO en moins de 30 secondes. L'IA analyse votre mot-clé et génère un contenu prêt à publier.</p>
                            <ul className="benefit-features">
                                <li><CheckCircle size={16} /> 2000+ mots par article</li>
                                <li><CheckCircle size={16} /> Optimisation SEO automatique</li>
                                <li><CheckCircle size={16} /> FAQ et meta tags inclus</li>
                            </ul>
                        </div>
                        <div className="screenshot-wrapper">
                            <div className="content-preview">
                                <div className="preview-header">
                                    <div className="preview-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <span>Création d'article</span>
                                </div>
                                <div className="preview-content content-preview-content">
                                    {/* Form */}
                                    <div className="preview-form">
                                        <div className="preview-form-group">
                                            <label>Mot-clé principal</label>
                                            <input type="text" value="marketing digital 2025" readOnly />
                                        </div>
                                        <button className="preview-generate-btn">
                                            <Sparkles size={16} />
                                            Générer l'article
                                        </button>
                                    </div>

                                    {/* Article Preview */}
                                    <div className="preview-article-result">
                                        <div className="preview-article-header">
                                            <h3>Marketing Digital 2025 : Guide Complet</h3>
                                            <div className="preview-article-meta">
                                                <span>2000 mots</span>
                                                <span>•</span>
                                                <span>SEO optimisé</span>
                                            </div>
                                        </div>
                                        <div className="preview-article-content">
                                            <p>Le marketing digital évolue rapidement. Découvrez les stratégies qui fonctionnent en 2025 pour générer plus de leads et augmenter vos ventes...</p>
                                            <h4>1. SEO et Content Marketing</h4>
                                            <p>Combinez SEO et content marketing pour maximiser votre visibilité organique et convertir vos visiteurs...</p>
                                        </div>
                                        <div className="preview-article-actions">
                                            <button className="preview-action-btn primary">
                                                <Send size={14} />
                                                Publier
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CMS Integration Section - Simplified */}
            <section id="features" className="cms-integration">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Intégrations</span>
                        <h2>Publiez sur votre CMS <span className="gradient-text">en 1 clic</span></h2>
                    </div>

                    <div className="cms-platforms-row animate-on-scroll">
                        <div className="cms-platform-mini">
                            <div className="cms-platform-icon wordpress">W</div>
                            <span>WordPress</span>
                            </div>
                        <div className="cms-platform-mini">
                            <div className="cms-platform-icon webflow">W</div>
                            <span>Webflow</span>
                        </div>
                        <div className="cms-platform-mini">
                            <div className="cms-platform-icon framer">F</div>
                            <span>Framer</span>
                            </div>
                        <div className="cms-platform-mini coming">
                            <div className="cms-platform-icon wix">W</div>
                            <span>Wix</span>
                            <span className="coming-badge">Bientôt</span>
                        </div>
                            </div>
                        </div>
            </section>

            {/* Stats Section */}
            <section className="stats-outrank">
                <div className="section-container">
                    <div className="stats-grid-outrank animate-on-scroll">
                        <div className="stat-outrank">
                            <span className="stat-value-big">30</span>
                            <span className="stat-label">Articles/mois</span>
                        </div>
                        <div className="stat-outrank">
                            <span className="stat-value-big">95%</span>
                            <span className="stat-label">Économies</span>
                        </div>
                        <div className="stat-outrank">
                            <span className="stat-value-big">2min</span>
                            <span className="stat-label">Par article</span>
                        </div>
                        <div className="stat-outrank">
                            <span className="stat-value-big">97%</span>
                            <span className="stat-label">Score SEO</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Examples Section */}
            <section className="article-examples-section">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Exemples de contenu</span>
                        <h2>Du contenu IA que <span className="gradient-text">les humains adorent lire</span></h2>
                        <p>Impossible à distinguer d'un rédacteur pro</p>
                        <div className="handwritten-note inline">
                            <svg width="30" height="25" viewBox="0 0 30 25" fill="none">
                                <path d="M5 15C10 10 15 8 25 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M25 5L20 8M25 5L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>Voir exemples</span>
                        </div>
                    </div>

                    <div className="article-examples-grid animate-on-scroll">
                        {/* Article List */}
                        <div className="article-list">
                            {articleExamples.map((article, index) => (
                                <div key={index} className={`article-example-card ${index === 0 ? 'active' : ''}`}>
                                    <div className="article-example-header">
                                        <h4>{article.title}</h4>
                                        <span className="article-type-badge">{article.type}</span>
                                </div>
                                    <div className="article-example-meta">
                                        <span className="article-site">
                                            <span className="site-icon">{article.siteIcon}</span>
                                            {article.site}
                                        </span>
                                    </div>
                                    <div className="article-example-stats">
                                        <div className="article-stat">
                                            <span className="stat-label">Score SEO</span>
                                            <span className="stat-value seo-score">{article.seoScore}%</span>
                                        </div>
                                        <div className="article-stat">
                                            <span className="stat-label">Mots</span>
                                            <span className="stat-value">{article.words.toLocaleString()}</span>
                                        </div>
                                    </div>
                            </div>
                        ))}
                        </div>

                        {/* Article Preview */}
                        <div className="article-preview-panel">
                            <div className="article-preview-header">
                                <div className="preview-browser-bar">
                                    <div className="preview-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <div className="preview-url">marketingpro.fr/blog/strategies-2025</div>
                                </div>
                            </div>
                            <div className="article-preview-content">
                                <div className="preview-article-image">
                                    <div className="preview-image-placeholder">
                                        <Image size={32} />
                                        <span>Image IA générée</span>
                                    </div>
                                </div>
                                <h3>{articleExamples[0].title}</h3>
                                <p className="preview-excerpt">{articleExamples[0].excerpt}</p>
                                <div className="preview-article-body">
                                    <h4>1. L'Intelligence Artificielle au service du marketing</h4>
                                    <p>En 2025, l'IA n'est plus une option mais une nécessité. Les entreprises qui l'adoptent constatent une augmentation moyenne de 40% de leur productivité marketing...</p>
                                    <h4>2. Le SEO conversationnel</h4>
                                    <p>Avec l'essor des assistants vocaux et des chatbots, optimiser pour les requêtes conversationnelles devient crucial pour capturer le trafic de demain...</p>
                                </div>
                            </div>
                            <div className="article-preview-footer">
                                <div className="preview-score-badge">
                                    <CheckCircle size={16} />
                                    <span>Score SEO : 94%</span>
                                </div>
                                <div className="preview-human-badge">
                                    <Users size={16} />
                                    <span>Indétectable IA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="article-examples-cta">
                        <p>Envie de voir d'autres exemples personnalisés pour votre niche ?</p>
                        <Link to="/landing/redacteur/demo" className="btn-hero-secondary">
                            <Play size={18} />
                            Demander une démo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials XL - Twitter Style */}
            <section className="testimonials-xl-section">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Témoignages vérifiés</span>
                        <h2>Adoré par les <span className="gradient-text">entrepreneurs ambitieux</span></h2>
                        <p>Découvrez les résultats réels de nos clients avec preuves à l'appui</p>
                    </div>

                    {/* Metrics Banner */}
                    <div className="testimonials-metrics-banner animate-on-scroll">
                        <div className="metric-item">
                            <span className="metric-value">500+</span>
                            <span className="metric-label">Clients satisfaits</span>
                        </div>
                        <div className="metric-divider"></div>
                        <div className="metric-item">
                            <span className="metric-value">4.9/5</span>
                            <span className="metric-label">Note moyenne</span>
                        </div>
                        <div className="metric-divider"></div>
                        <div className="metric-item">
                            <span className="metric-value">+250%</span>
                            <span className="metric-label">Trafic moyen gagné</span>
                        </div>
                        <div className="metric-divider"></div>
                        <div className="metric-item">
                            <span className="metric-value">200+</span>
                            <span className="metric-label">Avis vérifiés</span>
                        </div>
                    </div>

                    {/* Featured Testimonials with Screenshots - Highlighted */}
                    <div className="testimonials-featured animate-on-scroll">
                        <h3 className="testimonials-featured-title">
                            <Star size={20} fill="#FBBF24" color="#FBBF24" />
                            Témoignages avec preuves de résultats
                        </h3>
                        <div className="testimonials-featured-grid">
                            {twitterTestimonials.filter(t => t.screenshot).map((tweet, index) => (
                                <div key={`featured-${index}`} className="twitter-card featured-testimonial">
                                    <div className="twitter-card-header">
                                        <div className="twitter-avatar">
                                            {tweet.avatarImage ? (
                                                <img src={tweet.avatarImage} alt={tweet.name} className="twitter-avatar-img" />
                                            ) : (
                                                <span>{tweet.avatar}</span>
                                            )}
                                        </div>
                                        <div className="twitter-user-info">
                                            <div className="twitter-name">
                                                {tweet.name}
                                                {tweet.verified && (
                                                    <CheckCircle size={14} className="verified-badge" />
                                                )}
                                            </div>
                                            <div className="twitter-handle">{tweet.handle}</div>
                                        </div>
                                        <div className="twitter-logo">
                                            <Twitter size={18} />
                                        </div>
                                    </div>

                                    <div className="twitter-content">
                                        <p>{tweet.content}</p>
                                    </div>

                                    {tweet.metric && (
                                        <div className="twitter-metric-card">
                                            <div className="twitter-metric-label">{tweet.metric.label}</div>
                                            <div className="twitter-metric-values">
                                                <span className="metric-before">{tweet.metric.before}</span>
                                                <ArrowRight size={16} className="metric-arrow" />
                                                <span className="metric-after">{tweet.metric.after}</span>
                                            </div>
                                        </div>
                                    )}

                                    {tweet.screenshot && (
                                        <div className="twitter-screenshot">
                                            <div className="twitter-screenshot-header">
                                                <BarChart3 size={16} />
                                                <span>{tweet.screenshot.title}</span>
                                            </div>
                                            <div className="twitter-screenshot-image">
                                                <img 
                                                    src={tweet.screenshot.image} 
                                                    alt={tweet.screenshot.title}
                                                    className="screenshot-img"
                                                />
                                            </div>
                                            <div className="twitter-screenshot-caption">
                                                <strong>{tweet.screenshot.caption}</strong>
                                            </div>
                                        </div>
                                    )}

                                    <div className="twitter-footer">
                                        <span className="twitter-date">{tweet.date}</span>
                                        <div className="twitter-likes">
                                            <Star size={14} />
                                            <span>{tweet.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Regular Testimonials Grid */}
                    <div className="testimonials-regular-title animate-on-scroll">
                        <h3>Plus de témoignages</h3>
                    </div>
                    <div className="twitter-testimonials-grid animate-on-scroll">
                        {twitterTestimonials.filter(t => !t.screenshot).map((tweet, index) => (
                            <div key={index} className="twitter-card">
                                <div className="twitter-card-header">
                                    <div className="twitter-avatar">
                                        {tweet.avatarImage ? (
                                            <img src={tweet.avatarImage} alt={tweet.name} className="twitter-avatar-img" />
                                        ) : (
                                            <span>{tweet.avatar}</span>
                                        )}
                                    </div>
                                    <div className="twitter-user-info">
                                        <div className="twitter-name">
                                            {tweet.name}
                                            {tweet.verified && (
                                                <CheckCircle size={14} className="verified-badge" />
                                            )}
                        </div>
                                        <div className="twitter-handle">{tweet.handle}</div>
                        </div>
                                    <div className="twitter-logo">
                                        <Twitter size={18} />
                        </div>
                        </div>

                                <div className="twitter-content">
                                    <p>{tweet.content}</p>
                    </div>

                                {tweet.metric && (
                                    <div className="twitter-metric-card">
                                        <div className="twitter-metric-label">{tweet.metric.label}</div>
                                        <div className="twitter-metric-values">
                                            <span className="metric-before">{tweet.metric.before}</span>
                                            <ArrowRight size={16} className="metric-arrow" />
                                            <span className="metric-after">{tweet.metric.after}</span>
                    </div>
                                    </div>
                                )}

                                {tweet.screenshot && (
                                    <div className="twitter-screenshot">
                                        <div className="twitter-screenshot-header">
                                            <BarChart3 size={16} />
                                            <span>{tweet.screenshot.title}</span>
                                </div>
                                        <div className="twitter-screenshot-image">
                                            <img 
                                                src={tweet.screenshot.image} 
                                                alt={tweet.screenshot.title}
                                                className="screenshot-img"
                                            />
                                            <div className="twitter-screenshot-overlay">
                                                <div className="twitter-screenshot-metrics">
                                                    {tweet.screenshot.metrics.map((metric, idx) => (
                                                        <div key={idx} className="twitter-screenshot-metric">
                                                            <span className="screenshot-metric-label">{metric.label}</span>
                                                            <span className="screenshot-metric-value">{metric.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="twitter-screenshot-caption">
                                            <strong>{tweet.screenshot.caption}</strong>
                                        </div>
                                    </div>
                                )}

                                <div className="twitter-footer">
                                    <span className="twitter-date">{tweet.date}</span>
                                    <div className="twitter-likes">
                                        <Star size={14} />
                                        <span>{tweet.likes}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="why-us-section">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Différenciation</span>
                        <h2>Pourquoi choisir <span className="gradient-text">Agent SEO</span> ?</h2>
                        <p>Ce qui nous rend unique sur le marché</p>
                        </div>

                    <div className="why-us-grid animate-on-scroll">
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Shield size={28} />
                        </div>
                            <h3>Garantie de résultats</h3>
                            <p>Seul outil SEO avec <strong>garantie 90 jours</strong> : remboursé si pas en 1ère page d'un mot-clé long traîne. Aucun concurrent n'offre ça.</p>
                        </div>

                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <UserCheck size={28} />
                        </div>
                            <h3>Setup avec expert offert</h3>
                            <p>Un expert configure <strong>tout gratuitement</strong> en 30 min. Pas besoin de tout comprendre, on s'occupe de tout.</p>
                        </div>

                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Bot size={28} />
                            </div>
                            <h3>Contenu indétectable IA</h3>
                            <p>Notre IA génère du contenu <strong>0% détectable</strong> par Google et les outils de détection. Testé et prouvé.</p>
                        </div>

                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Send size={28} />
                            </div>
                            <h3>Publication automatique native</h3>
                            <p>Publiez directement sur WordPress, Webflow, Framer <strong>sans plugin</strong>. Intégration native, zéro configuration.</p>
                        </div>

                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Zap size={28} />
                            </div>
                            <h3>Le plus rapide du marché</h3>
                            <p>Générez un article SEO de <strong>2000+ mots en 30 secondes</strong>. Aucun outil n'est aussi rapide.</p>
                        </div>

                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Award size={28} />
                            </div>
                            <h3>N°1 en France</h3>
                            <p><strong>500+ entreprises</strong> nous font confiance. Leader français de l'automatisation SEO avec IA.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Objections Section */}
            <section className="objections-section">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Questions fréquentes</span>
                        <h2>Vous vous demandez <span className="gradient-text">peut-être...</span></h2>
                        <p>On répond à vos doutes les plus courants</p>
                    </div>

                    <div className="objections-grid animate-on-scroll">
                        <div className="objection-card">
                            <div className="objection-header">
                                <AlertCircle size={24} className="objection-icon" />
                                <h3>Le contenu IA est-il détectable par Google ?</h3>
                                </div>
                            <div className="objection-content">
                                <p><strong>Non, absolument pas.</strong> Notre IA génère du contenu 0% détectable par les outils de détection (GPTZero, Originality.ai, etc.).</p>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>Testé et prouvé sur 10,000+ articles</span>
                                    </div>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>Score de détection : 0% sur tous nos tests</span>
                                </div>
                            </div>
                        </div>

                        <div className="objection-card">
                            <div className="objection-header">
                                <AlertCircle size={24} className="objection-icon" />
                                <h3>Ça marche vraiment ? Vous avez des preuves ?</h3>
                            </div>
                            <div className="objection-content">
                                <p><strong>Oui, absolument.</strong> Regardez les captures d'écran dans nos témoignages : +500% de trafic, positions en top 10, Domain Rating qui explose.</p>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>500+ entreprises actives</span>
                                </div>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>Résultats réels avec screenshots</span>
                                </div>
                            </div>
                        </div>

                        <div className="objection-card">
                            <div className="objection-header">
                                <AlertCircle size={24} className="objection-icon" />
                                <h3>C'est trop cher pour mon budget ?</h3>
                            </div>
                            <div className="objection-content">
                                <p><strong>Non, c'est l'inverse.</strong> À 29€/mois, vous économisez 500€+ d'outils SEO (Ahrefs, SEMrush) + des heures de rédaction.</p>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>Essai gratuit 7 jours pour tester</span>
                                </div>
                            </div>
                        </div>

                        <div className="objection-card">
                            <div className="objection-header">
                                <AlertCircle size={24} className="objection-icon" />
                                <h3>C'est compliqué à configurer ?</h3>
                            </div>
                            <div className="objection-content">
                                <p><strong>Pas du tout.</strong> Un expert configure tout pour vous gratuitement en 30 minutes. Vous n'avez rien à faire.</p>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>Setup offert avec un expert</span>
                                </div>
                                <div className="objection-proof">
                                    <CheckCircle size={16} />
                                    <span>30 minutes chrono, tout prêt</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risk Reversal Section */}
            <section className="risk-reversal-section">
                <div className="section-container">
                    <div className="risk-reversal-content animate-on-scroll">
                        <div className="risk-reversal-header">
                            <Shield size={48} className="risk-reversal-icon" />
                            <h2>100% Sans Risque</h2>
                            <p>On prend tous les risques à notre charge</p>
                        </div>

                        <div className="risk-reversal-grid">
                            <div className="risk-reversal-item">
                                <div className="risk-reversal-icon-small">
                                    <Gift size={24} />
                                </div>
                                <h3>Essai gratuit 7 jours</h3>
                                <p>Testez toutes les fonctionnalités sans carte bancaire. Annulez à tout moment.</p>
                            </div>

                            <div className="risk-reversal-item">
                                <div className="risk-reversal-icon-small">
                                    <Shield size={24} />
                                </div>
                                <h3>Garantie 90 jours</h3>
                                <p>Remboursé 100% si votre site n'arrive pas en 1ère page d'un mot-clé long traîne en 90 jours.</p>
                            </div>

                            <div className="risk-reversal-item">
                                <div className="risk-reversal-icon-small">
                                    <RefreshCw size={24} />
                                </div>
                                <h3>Annulation à tout moment</h3>
                                <p>Pas d'engagement, pas de frais cachés. Résiliez quand vous voulez, sans justification.</p>
                            </div>

                            <div className="risk-reversal-item">
                                <div className="risk-reversal-icon-small">
                                    <UserCheck size={24} />
                                </div>
                                <h3>Setup offert</h3>
                                <p>Un expert configure tout gratuitement. Vous n'avez rien à faire, on s'occupe de tout.</p>
                            </div>
                        </div>

                        <div className="risk-reversal-cta">
                            <Link to="/landing/redacteur/demo" className="btn-hero-primary">
                                <Phone size={18} />
                                Tester gratuitement maintenant
                            </Link>
                            <p className="risk-reversal-note">
                                <Shield size={16} />
                                <span>Aucune carte bancaire requise • 100% gratuit • Sans engagement</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-outrank">
                <div className="section-container">
                    <div className="section-header-outrank animate-on-scroll">
                        <span className="section-tag">Tarifs</span>
                        <h2>Simple et transparent</h2>
                    </div>

                    <div className="pricing-banner-outrank animate-on-scroll">
                        <Zap size={20} />
                        <span><strong>Offre de lancement :</strong> -50% pendant 3 mois pour les <strong id="spots-remaining">47</strong> premiers inscrits</span>
                        <span className="pricing-urgency">⚡ Places limitées</span>
                    </div>

                    <div className="pricing-grid-outrank animate-on-scroll">
                        {/* Starter */}
                        <div className="pricing-card-outrank">
                            <div className="pricing-tier">Starter</div>
                            <div className="pricing-price-outrank">
                                <span className="price-old">58€</span>
                                <span className="price-new">29€</span>
                                    <span className="price-period">/mois</span>
                            </div>
                            <p className="pricing-desc-outrank">Pour démarrer votre stratégie SEO</p>
                            <ul className="pricing-list-outrank">
                                <li><CheckCircle size={18} /> 10 articles/mois</li>
                                <li><CheckCircle size={18} /> Audit SEO basique</li>
                                <li><CheckCircle size={18} /> Recherche mots-clés</li>
                                <li><CheckCircle size={18} /> Images IA incluses</li>
                                <li><CheckCircle size={18} /> 1 site connecté</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing-outrank">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Growth - Featured */}
                        <div className="pricing-card-outrank featured">
                            <div className="pricing-popular">Le plus populaire</div>
                            <div className="pricing-tier">Growth</div>
                            <div className="pricing-price-outrank">
                                <span className="price-old">118€</span>
                                <span className="price-new">59€</span>
                                    <span className="price-period">/mois</span>
                            </div>
                            <p className="pricing-desc-outrank">Pour scaler votre contenu</p>
                            <ul className="pricing-list-outrank">
                                <li><CheckCircle size={18} /> 50 articles/mois</li>
                                <li><CheckCircle size={18} /> Audit SEO complet</li>
                                <li><CheckCircle size={18} /> Analyse concurrence</li>
                                <li><CheckCircle size={18} /> Images IA illimitées</li>
                                <li><CheckCircle size={18} /> 3 sites connectés</li>
                                <li><CheckCircle size={18} /> Support prioritaire</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing-outrank featured">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Scale */}
                        <div className="pricing-card-outrank">
                            <div className="pricing-tier">Scale</div>
                            <div className="pricing-price-outrank">
                                <span className="price-new">Sur mesure</span>
                            </div>
                            <p className="pricing-desc-outrank">Pour les agences & gros volumes</p>
                            <ul className="pricing-list-outrank">
                                <li><CheckCircle size={18} /> Articles illimités</li>
                                <li><CheckCircle size={18} /> Tout Growth +</li>
                                <li><CheckCircle size={18} /> Sites illimités</li>
                                <li><CheckCircle size={18} /> API access</li>
                                <li><CheckCircle size={18} /> White-label</li>
                                <li><CheckCircle size={18} /> Account manager</li>
                            </ul>
                            <Link to="/landing/redacteur/demo" className="btn-pricing-outrank">
                                Nous contacter
                            </Link>
                        </div>
                    </div>

                    <p className="pricing-note-outrank">
                        ✨ Essai gratuit 7 jours • Sans engagement • Satisfait ou remboursé
                    </p>
                </div>
            </section>

            {/* CTA Section - Expert Setup Style */}
            <section className="cta-expert-section">
                <div className="section-container">
                    <div className="cta-expert-content animate-on-scroll">
                        <div className="cta-expert-left">
                            <span className="section-tag">Accompagnement personnalisé</span>
                            <h2>Un expert configure <span className="gradient-text">tout pour vous</span></h2>
                            <p className="cta-expert-desc">
                                Pas envie de passer des heures à configurer ? Notre équipe s'occupe de tout. 
                                Réservez un appel et bénéficiez d'une démo personnalisée + paramétrage complet offert.
                            </p>

                            <div className="cta-expert-benefits">
                                <div className="cta-expert-benefit">
                                    <div className="cta-expert-benefit-icon">
                                        <Video size={24} />
                                    </div>
                                    <div className="cta-expert-benefit-content">
                                        <h4>Démo personnalisée</h4>
                                        <p>Découvrez Agent SEO adapté à votre cas d'usage spécifique</p>
                                    </div>
                    </div>

                                <div className="cta-expert-benefit">
                                    <div className="cta-expert-benefit-icon">
                                        <Settings size={24} />
                                    </div>
                                    <div className="cta-expert-benefit-content">
                                        <h4>Paramétrage offert</h4>
                                        <p>Connexion CMS, configuration des mots-clés, personnalisation du ton</p>
                            </div>
                    </div>

                                <div className="cta-expert-benefit">
                                    <div className="cta-expert-benefit-icon">
                                        <BookOpen size={24} />
                </div>
                                    <div className="cta-expert-benefit-content">
                                        <h4>Formation incluse</h4>
                                        <p>Apprenez à tirer le maximum de l'outil en 30 minutes</p>
                                    </div>
                                </div>
                            </div>

                            <Link 
                                to="/landing/redacteur/demo"
                                className="cta-expert-btn"
                                aria-label="Réserver un appel gratuit avec un expert"
                            >
                                <Phone size={20} aria-hidden="true" />
                                <span>Demander ma démo gratuite</span>
                                <ArrowRight size={18} aria-hidden="true" />
                            </Link>

                            <p className="cta-expert-guarantee">
                                <span>100% gratuit</span>
                                <span className="cta-guarantee-divider" aria-hidden="true">•</span>
                                <span>Sans engagement</span>
                                <span className="cta-guarantee-divider" aria-hidden="true">•</span>
                                <span>30 min chrono</span>
                            </p>
                        </div>

                        <div className="cta-expert-right">
                            <div className="cta-expert-card">
                                <div className="cta-expert-card-badge">
                                    <Gift size={16} />
                                    <span>Offert</span>
                                </div>
                                <div className="cta-expert-card-header">
                                    <div className="cta-expert-avatar">
                                        <UserCheck size={32} />
                                    </div>
                                    <div className="cta-expert-card-info">
                                        <h4>Votre Expert SEO</h4>
                                        <p>Disponible pour vous accompagner</p>
                                    </div>
                                </div>
                                <div className="cta-expert-card-features">
                                    <div className="cta-expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Analyse de votre site</span>
                                    </div>
                                    <div className="cta-expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Stratégie de mots-clés</span>
                                    </div>
                                    <div className="cta-expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Configuration complète</span>
                                    </div>
                                    <div className="cta-expert-card-feature">
                                        <CheckCircle size={16} />
                                        <span>Support prioritaire</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-outrank">
                <div className="footer-container-outrank">
                    <div className="footer-top">
                        <div className="footer-brand-outrank">
                            <div className="footer-logo-outrank">
                                <div className="logo-icon-new">
                                    <Layers size={18} />
                                </div>
                                <span>Agent SEO</span>
                            </div>
                            <p>L'agent IA qui automatise votre stratégie SEO de A à Z.</p>
                            <div className="footer-social-outrank">
                                <a href="#"><Twitter size={18} /></a>
                                <a href="#"><Linkedin size={18} /></a>
                                <a href="#"><Mail size={18} /></a>
                            </div>
                        </div>

                        <div className="footer-links-outrank">
                            <div className="footer-col">
                                <h4>Produit</h4>
                                <a href="#features">Fonctionnalités</a>
                                <a href="#pricing">Tarifs</a>
                                <a href="#how-it-works">Comment ça marche</a>
                            </div>
                            <div className="footer-col">
                                <h4>Ressources</h4>
                                <a href="#">Blog</a>
                                <a href="#">Documentation</a>
                                <a href="#">Guides SEO</a>
                            </div>
                            <div className="footer-col">
                                <h4>Légal</h4>
                                <Link to="/privacy">Confidentialité</Link>
                                <Link to="/terms">CGU</Link>
                                <a href="#">Mentions légales</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom-outrank">
                        <p>© 2025 Agent SEO. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>

            {/* Floating CTA */}
            <div className={`floating-cta ${showFloatingCTA ? 'visible' : ''}`}>
                <div className="floating-cta-content">
                    <div className="floating-cta-text">
                        <span className="floating-cta-title">Prêt à automatiser votre SEO ?</span>
                        <span className="floating-cta-subtitle">Essai gratuit 7 jours • Sans engagement</span>
                    </div>
                    <div className="floating-cta-buttons">
                        <Link to="/landing/redacteur/demo" className="floating-cta-primary">
                            <Phone size={16} />
                            Demander une démo
                        </Link>
                        <Link to="/signup" className="floating-cta-secondary">
                            Essayer gratuitement
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPageRedacteur;

