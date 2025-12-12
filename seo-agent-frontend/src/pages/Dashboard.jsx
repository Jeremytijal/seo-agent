import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, Search, Image, Send, Globe, TrendingUp, 
    Target, PenTool, ArrowRight, RefreshCw, Plus,
    CheckCircle, Clock, AlertCircle, Sparkles, BarChart3,
    ExternalLink, Zap, Calendar, Eye, MousePointer
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const [metrics, setMetrics] = useState({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalKeywords: 0,
        totalAudits: 0,
        connectedSites: 0,
        imagesGenerated: 0
    });

    const [recentContents, setRecentContents] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [sitePerformance, setSitePerformance] = useState([]);
    const [hasMadeChoice, setHasMadeChoice] = useState(false);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            // Check if user has made a choice (connected site or expert request)
            let sites = [];
            let expertRequests = [];
            
            try {
                const sitesRes = await fetch(`${API_URL}/api/sites/${user.id}`);
                const sitesData = await sitesRes.json();
                sites = sitesData.sites || [];
            } catch (e) {
                console.error('Error fetching sites:', e);
        }

        try {
                const requestsRes = await fetch(`${API_URL}/api/expert-requests/${user.id}`);
                const requestsData = await requestsRes.json();
                expertRequests = requestsData.requests || [];
            } catch (e) {
                console.error('Error fetching expert requests:', e);
            }
            
            setHasMadeChoice(sites.length > 0 || expertRequests.length > 0);
            
            // For now, load demo data - will be replaced with real data later
        setMetrics({
                totalArticles: 24,
                publishedArticles: 18,
                draftArticles: 6,
                totalKeywords: 156,
                totalAudits: 8,
                connectedSites: sites.length || 2,
                imagesGenerated: 42
            });

            setRecentContents([
                { 
                    id: 1, 
                    title: '10 Techniques SEO pour 2025', 
                    status: 'published', 
                    site: 'mon-blog.fr',
                    date: 'Aujourd\'hui',
                    views: 234
                },
                { 
                    id: 2, 
                    title: 'Guide complet du référencement local', 
                    status: 'published', 
                    site: 'mon-blog.fr',
                    date: 'Hier',
                    views: 189
                },
                { 
                    id: 3, 
                    title: 'Comment optimiser vos images pour le SEO', 
                    status: 'draft', 
                    site: '—',
                    date: 'Il y a 2 jours',
                    views: 0
                },
                { 
                    id: 4, 
                    title: 'Les meilleurs outils SEO gratuits', 
                    status: 'scheduled', 
                    site: 'startup-tips.com',
                    date: 'Demain 10h',
                    views: 0
                },
            ]);

            setWeeklyData([
                { name: 'Lun', articles: 2, keywords: 15 },
                { name: 'Mar', articles: 3, keywords: 22 },
                { name: 'Mer', articles: 1, keywords: 8 },
                { name: 'Jeu', articles: 4, keywords: 31 },
                { name: 'Ven', articles: 2, keywords: 18 },
                { name: 'Sam', articles: 1, keywords: 12 },
                { name: 'Dim', articles: 0, keywords: 5 },
            ]);

            setSitePerformance([
                { name: 'WordPress', value: 12, color: '#21759B' },
                { name: 'Webflow', value: 8, color: '#4353FF' },
                { name: 'Framer', value: 4, color: '#0055FF' },
            ]);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { 
            icon: Search, 
            label: 'Nouvel audit SEO', 
            desc: 'Analysez un site web',
            path: '/audit',
            color: '#10B981'
        },
        { 
            icon: Target, 
            label: 'Recherche mots-clés', 
            desc: 'Trouvez des opportunités',
            path: '/keywords',
            color: '#3B82F6'
        },
        { 
            icon: PenTool, 
            label: 'Créer un article', 
            desc: 'Générez du contenu SEO',
            path: '/contents',
            color: '#8B5CF6'
        },
        { 
            icon: Image, 
            label: 'Générer des images', 
            desc: 'Visuels IA uniques',
            path: '/images',
            color: '#F59E0B'
        },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'published':
                return <CheckCircle size={14} className="status-icon published" />;
            case 'draft':
                return <Clock size={14} className="status-icon draft" />;
            case 'scheduled':
                return <Calendar size={14} className="status-icon scheduled" />;
            default:
                return <AlertCircle size={14} className="status-icon" />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'published': return 'Publié';
            case 'draft': return 'Brouillon';
            case 'scheduled': return 'Programmé';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <RefreshCw className="animate-spin" size={24} />
                <span>Chargement...</span>
            </div>
        );
    }

    return (
        <div className="dashboard-seo">
            {/* Header */}
            <header className="dash-header">
                <div className="dash-header-left">
                    <h1>Tableau de bord</h1>
                    <span className="dash-subtitle">Bienvenue sur votre Agent IA SEO</span>
                </div>
                <div className="dash-header-right">
                    <button className="btn-primary-dash" onClick={() => navigate('/contents')}>
                        <Plus size={18} />
                        Nouveau contenu
                    </button>
                </div>
            </header>

            {/* Connect Site Banner */}
            {!hasMadeChoice && (
                <div className="dashboard-connect-banner">
                    <div className="dashboard-connect-content">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Connectez votre site pour publier automatiquement</strong>
                            <p>Choisissez une plateforme, publication manuelle ou demandez l'aide d'un expert gratuitement</p>
                        </div>
                    </div>
                    <button 
                        className="btn-banner-connect-dash"
                        onClick={() => navigate('/integrations')}
                    >
                        Connecter un site
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                    <button 
                        key={index} 
                        className="quick-action-card"
                        onClick={() => navigate(action.path)}
                    >
                        <div className="qa-icon" style={{ background: `${action.color}15`, color: action.color }}>
                            <action.icon size={24} />
                        </div>
                        <div className="qa-content">
                            <span className="qa-label">{action.label}</span>
                            <span className="qa-desc">{action.desc}</span>
                        </div>
                        <ArrowRight size={18} className="qa-arrow" />
                    </button>
                ))}
                </div>

            {/* Main KPIs */}
            <div className="kpi-grid-seo">
                <div className="kpi-card-seo">
                    <div className="kpi-icon-wrap green">
                        <FileText size={20} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value-seo">{metrics.totalArticles}</span>
                        <span className="kpi-label-seo">Articles créés</span>
                    </div>
                    <div className="kpi-badge">
                        <TrendingUp size={12} />
                        <span>+5 cette semaine</span>
                    </div>
                </div>

                <div className="kpi-card-seo">
                    <div className="kpi-icon-wrap blue">
                        <Send size={20} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value-seo">{metrics.publishedArticles}</span>
                        <span className="kpi-label-seo">Publiés</span>
                    </div>
                    <div className="kpi-sub">
                        {metrics.draftArticles} brouillons
                    </div>
                </div>

                <div className="kpi-card-seo">
                    <div className="kpi-icon-wrap purple">
                        <Target size={20} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value-seo">{metrics.totalKeywords}</span>
                        <span className="kpi-label-seo">Mots-clés suivis</span>
                    </div>
                </div>

                <div className="kpi-card-seo">
                    <div className="kpi-icon-wrap orange">
                        <Search size={20} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value-seo">{metrics.totalAudits}</span>
                        <span className="kpi-label-seo">Audits réalisés</span>
                    </div>
                </div>

                <div className="kpi-card-seo">
                    <div className="kpi-icon-wrap teal">
                        <Globe size={20} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value-seo">{metrics.connectedSites}</span>
                        <span className="kpi-label-seo">Sites connectés</span>
                    </div>
                </div>

                <div className="kpi-card-seo">
                    <div className="kpi-icon-wrap pink">
                        <Image size={20} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value-seo">{metrics.imagesGenerated}</span>
                        <span className="kpi-label-seo">Images générées</span>
                </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section-seo">
                {/* Activity Chart */}
                <div className="chart-card-seo">
                    <div className="chart-header">
                        <h3>Activité de la semaine</h3>
                        <div className="chart-legend-inline">
                            <span><i style={{ background: '#10B981' }}></i> Articles</span>
                            <span><i style={{ background: '#3B82F6' }}></i> Mots-clés</span>
                            </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weeklyData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Bar dataKey="articles" fill="#10B981" radius={[4, 4, 0, 0]} name="Articles" />
                                <Bar dataKey="keywords" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Mots-clés" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sites Distribution */}
                <div className="chart-card-seo sites-chart">
                    <div className="chart-header">
                        <h3>Publications par plateforme</h3>
                    </div>
                    <div className="sites-distribution">
                        {sitePerformance.map((site, index) => (
                            <div key={index} className="site-row">
                                <div className="site-info">
                                    <span className="site-dot" style={{ background: site.color }}></span>
                                    <span className="site-name">{site.name}</span>
                                </div>
                                <div className="site-bar-wrap">
                                    <div 
                                        className="site-bar" 
                                        style={{ 
                                            width: `${(site.value / Math.max(...sitePerformance.map(s => s.value))) * 100}%`,
                                            background: site.color 
                                        }}
                                    ></div>
                                </div>
                                <span className="site-count">{site.value}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn-connect-site" onClick={() => navigate('/integrations')}>
                        <Plus size={16} />
                        Connecter un site
                    </button>
                </div>
            </div>

            {/* Recent Contents */}
            <div className="recent-section">
                <div className="section-header">
                    <h3>Derniers contenus</h3>
                    <button className="see-all-btn" onClick={() => navigate('/contents')}>
                        Voir tout <ArrowRight size={14} />
                    </button>
                </div>

                <div className="contents-list">
                    {recentContents.map((content) => (
                        <div key={content.id} className="content-row">
                            <div className="content-main">
                                {getStatusIcon(content.status)}
                                <div className="content-info">
                                    <span className="content-title">{content.title}</span>
                                    <span className="content-meta">
                                        {content.site !== '—' && (
                                            <>
                                                <Globe size={12} />
                                                {content.site}
                                                <span className="meta-sep">•</span>
                                            </>
                                        )}
                                        {content.date}
                                    </span>
                                </div>
                        </div>
                            <div className="content-actions">
                                <span className={`status-badge ${content.status}`}>
                                    {getStatusLabel(content.status)}
                                </span>
                                {content.views > 0 && (
                                    <span className="views-count">
                                        <Eye size={12} />
                                        {content.views}
                                    </span>
                                )}
                                <button className="btn-icon-small">
                                    <ExternalLink size={14} />
                                </button>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>

            {/* Getting Started Tips */}
            {metrics.totalArticles === 0 && (
                <div className="getting-started">
                    <div className="gs-icon">
                        <Sparkles size={32} />
                    </div>
                    <h3>Prêt à booster votre SEO ?</h3>
                    <p>Commencez par auditer votre site ou créez votre premier article optimisé !</p>
                    <div className="gs-actions">
                        <button className="btn-primary" onClick={() => navigate('/audit')}>
                            <Search size={18} />
                            Lancer un audit
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/contents')}>
                            <PenTool size={18} />
                            Créer un article
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
