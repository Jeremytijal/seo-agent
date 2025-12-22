import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Sparkles, Search, FileText, Image, Target, BarChart3, 
    CheckCircle, ArrowRight, Globe, RefreshCw, Calendar,
    Shield, TrendingUp, Play, Star, ChevronRight, Menu, X,
    ChevronDown, ExternalLink, Bot, PenTool, Zap,
    Send, Layout, Rocket, Mail, Linkedin, Twitter, Users,
    Clock, Award, Layers, MousePointer, Plus, Eye, Loader2
} from 'lucide-react';
import { CALENDLY_URL } from '../config';
import './LandingPage.css';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            avatar: "MD"
        },
        {
            quote: "On publie 50 articles/mois au lieu de 5. La qualité est bluffante, mes clients sont ravis.",
            author: "Thomas Martin",
            role: "CEO, Agence Digitale",
            avatar: "TM"
        },
        {
            quote: "L'intégration WordPress est parfaite. Je génère, je valide, c'est en ligne. Simple et efficace.",
            author: "Sophie Bernard",
            role: "Blogueuse Pro",
            avatar: "SB"
        }
    ];

    const faqs = [
        {
            question: "Comment l'IA génère-t-elle du contenu SEO de qualité ?",
            answer: "Notre IA analyse votre niche, vos concurrents et les meilleures pratiques SEO pour créer du contenu unique, bien structuré et optimisé. Chaque article inclut les balises, la structure de titres et la densité de mots-clés optimales."
        },
        {
            question: "Le contenu généré est-il détectable par Google ?",
            answer: "Notre IA produit du contenu naturel et original, indétectable par les outils de détection. Nous utilisons des techniques avancées pour garantir un style humain et authentique."
        },
        {
            question: "Puis-je modifier le contenu avant publication ?",
            answer: "Absolument ! Vous avez un contrôle total. Prévisualisez, modifiez et approuvez chaque article. L'IA apprend de vos corrections pour s'améliorer continuellement."
        },
        {
            question: "Quels CMS sont supportés ?",
            answer: "WordPress, Webflow et Framer sont entièrement intégrés. Connectez votre site en quelques clics et publiez automatiquement avec les images et les méta-données."
        },
        {
            question: "Combien d'articles puis-je générer ?",
            answer: "Cela dépend de votre plan : Starter (10/mois), Growth (50/mois) ou Scale (illimité). Tous les plans incluent les images IA et l'accès aux audits SEO."
        },
        {
            question: "Y a-t-il une période d'essai ?",
            answer: "Oui ! Testez gratuitement pendant 7 jours avec toutes les fonctionnalités. Aucune carte bancaire requise pour commencer."
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
                        <a href="#faq">FAQ</a>
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
                        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                        <div className="mobile-menu-cta">
                            <Link to="/login">Connexion</Link>
                            <Link to="/signup" className="btn-nav-cta">Démarrer</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-outrank">
                <div className="hero-bg-effects">
                    <div className="hero-glow"></div>
                    <div className="hero-grid"></div>
                </div>
                
                <div className="hero-content-outrank">
                    <div className="hero-badge-new">
                        <Sparkles size={14} />
                        <span>Propulsé par l'IA</span>
                    </div>

                    <h1>
                        Le meilleur Agent IA SEO<br />
                        <span className="gradient-text">pour WordPress</span>
                    </h1>
                    
                    <p className="hero-desc">
                        Générez, optimisez et publiez automatiquement vos articles SEO sur WordPress. 
                        Audit, mots-clés, rédaction IA, images et publication en un clic.
                    </p>

                    <div className="hero-cta-group">
                        <Link to="/signup" className="btn-hero-primary">
                            Essayer gratuitement
                            <ArrowRight size={18} />
                        </Link>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-hero-secondary">
                            <Play size={18} />
                            Voir la démo
                        </a>
                    </div>

                    <div className="hero-proof">
                        <div className="hero-avatars">
                            <div className="avatar">M</div>
                            <div className="avatar">T</div>
                            <div className="avatar">S</div>
                            <div className="avatar">+</div>
                        </div>
                        <div className="hero-proof-text">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />)}
                </div>
                            <span>Utilisé par <strong>500+</strong> créateurs de contenu</span>
                        </div>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="hero-visual">
                    <div className="hero-dashboard">
                        <div className="dash-header-preview">
                            <div className="dash-dots">
                                <span></span><span></span><span></span>
                    </div>
                            <span className="dash-title">Agent SEO — Tableau de bord</span>
                                    </div>
                        <div className="dash-content-preview">
                            <div className="dash-sidebar-mini">
                                <div className="sidebar-item active"><Search size={14} /></div>
                                <div className="sidebar-item"><Target size={14} /></div>
                                <div className="sidebar-item"><PenTool size={14} /></div>
                                <div className="sidebar-item"><Image size={14} /></div>
                                <div className="sidebar-item"><Send size={14} /></div>
                                </div>
                            <div className="dash-main-preview">
                                <div className="dash-card-mini score">
                                    <span className="card-label">Score SEO</span>
                                    <span className="card-value green">87</span>
                        </div>
                                <div className="dash-card-mini">
                                    <span className="card-label">Articles ce mois</span>
                                    <span className="card-value">24</span>
                                </div>
                                <div className="dash-card-mini">
                                    <span className="card-label">Mots-clés suivis</span>
                                    <span className="card-value">156</span>
                            </div>
                                <div className="dash-article-preview">
                                    <div className="article-row">
                                        <FileText size={14} />
                                        <span>10 Techniques SEO pour 2025</span>
                                        <span className="status published">Publié</span>
                                        </div>
                                    <div className="article-row">
                                        <FileText size={14} />
                                        <span>Guide du référencement local</span>
                                        <span className="status scheduled">Programmé</span>
                                        </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logos Section */}
            <section className="logos-section">
                <p>Publiez automatiquement sur vos plateformes favorites</p>
                <div className="logos-row">
                    {logos.map((logo, i) => (
                        <div key={i} className="logo-item">
                            <span className="logo-emoji">{logo.icon}</span>
                            <span>{logo.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section with Screenshots */}
            <section className="benefits-screenshots">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">Bénéfices</span>
                        <h2>Voyez SEO Agent en action</h2>
                        <p>Découvrez comment notre agent IA transforme votre workflow SEO</p>
                    </div>

                    {/* Dashboard Screenshot */}
                    <div className="benefit-item-screenshot">
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
                                                <span className="preview-kpi-value">24</span>
                                                <span className="preview-kpi-label">Articles créés</span>
                                            </div>
                                        </div>
                                        <div className="preview-kpi-card">
                                            <div className="preview-kpi-icon blue">
                                                <Send size={18} />
                                            </div>
                                            <div className="preview-kpi-content">
                                                <span className="preview-kpi-value">18</span>
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
                    <div className="benefit-item-screenshot reverse">
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
                                            <span className="preview-stat-value">4</span>
                                            <span className="preview-stat-label">Ce mois</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="preview-stat-value">0</span>
                                            <span className="preview-stat-label">Publiés</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="preview-stat-value">3</span>
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
                    <div className="benefit-item-screenshot">
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

            {/* CMS Integration Section */}
            <section className="cms-integration">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">Publication automatique</span>
                        <h2>Publiez directement sur votre CMS</h2>
                        <p>Connectez votre site une fois, publiez automatiquement à chaque fois</p>
                    </div>

                    <div className="cms-flow">
                        <div className="cms-step">
                            <div className="cms-icon">
                                <Zap size={24} />
                            </div>
                            <h3>1. Connectez votre CMS</h3>
                            <p>WordPress, Webflow, Framer ou Wix. Une seule connexion suffit.</p>
                        </div>
                        <div className="cms-arrow">→</div>
                        <div className="cms-step">
                            <div className="cms-icon">
                                <FileText size={24} />
                            </div>
                            <h3>2. Générez votre article</h3>
                            <p>L'IA crée le contenu optimisé avec images et meta tags.</p>
                        </div>
                        <div className="cms-arrow">→</div>
                        <div className="cms-step">
                            <div className="cms-icon">
                                <Send size={24} />
                            </div>
                            <h3>3. Publication automatique</h3>
                            <p>Un clic et votre article est en ligne avec toutes les optimisations.</p>
                        </div>
                    </div>

                    <div className="cms-platforms-grid">
                        <div className="cms-platform-card">
                            <div className="cms-platform-icon wordpress">W</div>
                            <h4>WordPress</h4>
                            <p>Publiez directement via l'API REST. Images, catégories et tags inclus.</p>
                            <div className="cms-badge">✓ Intégré</div>
                        </div>
                        <div className="cms-platform-card">
                            <div className="cms-platform-icon webflow">W</div>
                            <h4>Webflow</h4>
                            <p>Publication automatique avec gestion des collections et des champs personnalisés.</p>
                            <div className="cms-badge">✓ Intégré</div>
                        </div>
                        <div className="cms-platform-card">
                            <div className="cms-platform-icon framer">F</div>
                            <h4>Framer</h4>
                            <p>Connectez votre site Framer et publiez vos articles automatiquement.</p>
                            <div className="cms-badge">✓ Intégré</div>
                                </div>
                        <div className="cms-platform-card">
                            <div className="cms-platform-icon wix">W</div>
                            <h4>Wix</h4>
                            <p>Intégration en cours. Bientôt disponible pour tous les sites Wix.</p>
                            <div className="cms-badge coming">Bientôt</div>
                                </div>
                            </div>
                                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-outrank">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">Fonctionnalités</span>
                        <h2>Tout ce dont vous avez besoin<br />pour dominer le SEO</h2>
                        <p>Un agent IA complet qui gère votre stratégie de contenu de A à Z.</p>
                                </div>

                    <div className="features-grid-outrank">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card-outrank">
                                <div className="feature-icon-outrank" style={{ background: `${feature.color}20`, color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="hiw-outrank">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">Comment ça marche</span>
                        <h2>4 étapes vers le succès SEO</h2>
                    </div>

                    <div className="steps-outrank">
                        {steps.map((step, index) => (
                            <div key={index} className="step-outrank">
                                <div className="step-visual">{step.visual}</div>
                                <div className="step-number">{step.number}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-outrank">
                <div className="section-container">
                    <div className="stats-grid-outrank">
                        <div className="stat-outrank">
                            <span className="stat-value-big">500%</span>
                            <span className="stat-label">Gain de temps</span>
                        </div>
                        <div className="stat-outrank">
                            <span className="stat-value-big">50+</span>
                            <span className="stat-label">Articles/mois</span>
                        </div>
                        <div className="stat-outrank">
                            <span className="stat-value-big">3</span>
                            <span className="stat-label">CMS intégrés</span>
                        </div>
                        <div className="stat-outrank">
                            <span className="stat-value-big">24/7</span>
                            <span className="stat-label">Automatisation</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-outrank">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">Témoignages</span>
                        <h2>Ils nous font confiance</h2>
                    </div>

                    <div className="testimonials-grid">
                        {testimonials.map((t, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-stars">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}
                                </div>
                                <p className="testimonial-quote">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{t.avatar}</div>
                                    <div className="author-info">
                                        <span className="author-name">{t.author}</span>
                                        <span className="author-role">{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-outrank">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">Tarifs</span>
                        <h2>Simple, transparent, sans surprise</h2>
                        <p>Commencez gratuitement, évoluez selon vos besoins.</p>
                    </div>

                    <div className="pricing-banner-outrank">
                        <Zap size={20} />
                        <span><strong>Offre de lancement :</strong> -50% pendant 3 mois pour les 100 premiers inscrits</span>
                    </div>

                    <div className="pricing-grid-outrank">
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
                            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-pricing-outrank">
                                Nous contacter
                            </a>
                        </div>
                    </div>

                    <p className="pricing-note-outrank">
                        ✨ Essai gratuit 7 jours • Sans engagement • Satisfait ou remboursé
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-outrank">
                <div className="section-container">
                    <div className="section-header-outrank">
                        <span className="section-tag">FAQ</span>
                        <h2>Questions fréquentes</h2>
                    </div>

                    <div className="faq-list-outrank">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item-outrank ${openFaq === index ? 'open' : ''}`}
                            >
                                <button 
                                    className="faq-question-outrank"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDown size={20} className="faq-chevron" />
                                </button>
                                {openFaq === index && (
                                    <div className="faq-answer-outrank">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-outrank">
                <div className="cta-container-outrank">
                    <div className="cta-glow"></div>
                    <h2>Prêt à dominer Google ?</h2>
                    <p>Rejoignez les créateurs qui automatisent leur SEO avec l'IA.</p>
                    <div className="cta-buttons">
                        <Link to="/signup" className="btn-cta-main">
                            Commencer gratuitement
                            <ArrowRight size={18} />
                        </Link>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-cta-alt">
                            Réserver une démo
                        </a>
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
        </div>
    );
};

export default LandingPage;
