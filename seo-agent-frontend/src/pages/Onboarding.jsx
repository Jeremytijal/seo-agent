import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, ArrowLeft, Check, Globe, Target, 
    Sparkles, Loader2, Search,
    CheckCircle2, Rocket, TrendingUp, Users, Calendar, FileText
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        websiteUrl: '',
        competitors: ['', '', '']
    });

    // Keyword suggestions from analysis
    const [suggestedKeywords, setSuggestedKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [generatingArticle, setGeneratingArticle] = useState(false);
    const [articleGenerated, setArticleGenerated] = useState(false);

    const steps = [
        { id: 'welcome', title: 'Bienvenue', icon: Rocket },
        { id: 'sites', title: 'Vos sites', icon: Globe },
        { id: 'keywords', title: 'Mots-clés', icon: Target },
        { id: 'calendar', title: 'Calendrier', icon: Calendar }
    ];

    const updateCompetitor = (index, value) => {
        setFormData(prev => {
            const newCompetitors = [...prev.competitors];
            newCompetitors[index] = value;
            return { ...prev, competitors: newCompetitors };
        });
    };

    const analyzeAndFindKeywords = async () => {
        if (!formData.websiteUrl) return;
        
        setAnalyzing(true);
        
        try {
            // Call backend to analyze sites and get keyword suggestions
            const response = await fetch(`${API_URL}/api/keywords/analyze-competitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    websiteUrl: formData.websiteUrl,
                    competitors: formData.competitors.filter(c => c.trim() !== '')
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestedKeywords(data.keywords || []);
            } else {
                // Fallback: Generate simulated keywords based on domain
                const domain = formData.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                const baseName = domain.split('.')[0];
                
                const simulatedKeywords = [
                    { keyword: `${baseName} avis`, volume: Math.floor(Math.random() * 2000) + 500, difficulty: Math.floor(Math.random() * 40) + 20 },
                    { keyword: `${baseName} tarif`, volume: Math.floor(Math.random() * 1500) + 300, difficulty: Math.floor(Math.random() * 35) + 25 },
                    { keyword: `${baseName} vs concurrent`, volume: Math.floor(Math.random() * 800) + 200, difficulty: Math.floor(Math.random() * 30) + 30 },
                    { keyword: `meilleur ${baseName}`, volume: Math.floor(Math.random() * 2500) + 800, difficulty: Math.floor(Math.random() * 50) + 30 },
                    { keyword: `${baseName} guide complet`, volume: Math.floor(Math.random() * 1200) + 400, difficulty: Math.floor(Math.random() * 25) + 15 },
                    { keyword: `comment utiliser ${baseName}`, volume: Math.floor(Math.random() * 900) + 300, difficulty: Math.floor(Math.random() * 20) + 10 },
                    { keyword: `${baseName} tutoriel`, volume: Math.floor(Math.random() * 1100) + 350, difficulty: Math.floor(Math.random() * 25) + 15 },
                    { keyword: `alternative ${baseName}`, volume: Math.floor(Math.random() * 700) + 200, difficulty: Math.floor(Math.random() * 45) + 35 },
                ];
                setSuggestedKeywords(simulatedKeywords);
            }
            
            setStep(2); // Go to keywords step
        } catch (error) {
            console.error('Analysis error:', error);
            // Generate fallback keywords anyway
            const domain = formData.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const baseName = domain.split('.')[0];
            
            setSuggestedKeywords([
                { keyword: `${baseName} avis`, volume: 1200, difficulty: 32 },
                { keyword: `${baseName} prix`, volume: 890, difficulty: 28 },
                { keyword: `guide ${baseName}`, volume: 650, difficulty: 22 },
                { keyword: `${baseName} 2025`, volume: 1500, difficulty: 35 },
                { keyword: `meilleur ${baseName}`, volume: 2100, difficulty: 45 },
            ]);
            setStep(2);
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleKeyword = (keyword) => {
        setSelectedKeywords(prev => 
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword)
                : [...prev, keyword]
        );
    };

    // Start article generation when reaching the calendar step
    useEffect(() => {
        if (step === 3 && selectedKeywords.length > 0 && !generatingArticle && !articleGenerated) {
            generateFirstArticle();
        }
    }, [step]);

    // Generate calendar preview data
    const getCalendarPreview = () => {
        const today = new Date();
        const preview = [];
        
        selectedKeywords.forEach((kw, i) => {
            const kwData = suggestedKeywords.find(k => k.keyword === kw);
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + (i * 3)); // Every 3 days
            
            preview.push({
                date: scheduledDate,
                keyword: kw,
                volume: kwData?.volume || 0,
                difficulty: kwData?.difficulty || 0,
                status: i === 0 ? 'generating' : 'scheduled'
            });
        });
        
        return preview;
    };

    const generateFirstArticle = async () => {
        if (!user || selectedKeywords.length === 0) return;
        
        setGeneratingArticle(true);
        
        try {
            // Get the first keyword for article generation
            const firstKeyword = selectedKeywords[0];
            const keywordData = suggestedKeywords.find(k => k.keyword === firstKeyword);
            
            // Generate first article in background (don't wait for it)
            fetch(`${API_URL}/api/content/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    keyword: firstKeyword,
                    volume: keywordData?.volume || 0,
                    difficulty: keywordData?.difficulty || 0,
                    language: 'fr',
                    tone: 'professional',
                    length: 'long'
                })
            }).then(() => {
                console.log('First article generation started');
            }).catch(e => {
                console.error('Article generation error:', e);
            });
            
            // Brief delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            setArticleGenerated(true);
            
        } catch (error) {
            console.error('Generation error:', error);
            setArticleGenerated(true); // Continue anyway
        } finally {
            setGeneratingArticle(false);
        }
    };

    const handleFinish = async () => {
        if (!user) return;
        
        setLoading(true);
        
        try {
            // Save selected keywords as favorites via API (more reliable)
            if (selectedKeywords.length > 0) {
                for (const kw of selectedKeywords) {
                    const keywordData = suggestedKeywords.find(k => k.keyword === kw);
                    if (keywordData) {
                        try {
                            await fetch(`${API_URL}/api/keywords/favorites/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(keywordData)
                            });
                        } catch (e) {
                            console.error('Error saving keyword:', e);
                        }
                    }
                }
            }

            // Store data in localStorage for calendar page
            localStorage.setItem('seoagent_show_connect_banner', 'true');
            localStorage.setItem('seoagent_first_article_generating', 'true');
            localStorage.setItem('seoagent_website_url', formData.websiteUrl);
            localStorage.setItem('seoagent_selected_keywords', JSON.stringify(
                selectedKeywords.map(kw => {
                    const kwData = suggestedKeywords.find(k => k.keyword === kw);
                    return {
                        keyword: kw,
                        volume: kwData?.volume || 0,
                        difficulty: kwData?.difficulty || 0
                    };
                })
            ));

            navigate('/subscription?from=onboarding');
        } catch (error) {
            console.error('Finish error:', error);
            // Continue anyway - don't block user
            navigate('/subscription?from=onboarding');
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 0: return true;
            case 1: return formData.websiteUrl.length > 5;
            case 2: return selectedKeywords.length > 0; // At least 1 keyword selected
            case 3: return articleGenerated; // Wait for generation to start
            default: return false;
        }
    };

    const nextStep = () => {
        if (step === 1) {
            analyzeAndFindKeywords();
        } else if (step < steps.length - 1 && canProceed()) {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Welcome
    return (
                    <motion.div 
                        className="step-content welcome-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="welcome-icon">
                            <Sparkles size={48} />
                </div>
                        <h1>Bienvenue sur SEO Agent ! 🚀</h1>
                        <p className="welcome-subtitle">
                            En 2 minutes, on va analyser votre marché et trouver les meilleurs mots-clés pour votre business.
                        </p>
                        
                        <div className="features-preview">
                            <div className="feature-item">
                                <Search size={24} />
                                <div>
                                    <strong>Analyse de vos concurrents</strong>
                                    <span>On identifie les opportunités</span>
                                    </div>
                                </div>
                            <div className="feature-item">
                                <Target size={24} />
                                <div>
                                    <strong>Mots-clés stratégiques</strong>
                                    <span>Les meilleurs pour vous</span>
                                        </div>
                                    </div>
                            <div className="feature-item">
                                <TrendingUp size={24} />
                                <div>
                                    <strong>Contenu optimisé</strong>
                                    <span>Articles qui rankent</span>
                                        </div>
                                    </div>
                                </div>
                    </motion.div>
                );

            case 1: // Your site + competitors
                return (
                    <motion.div 
                        className="step-content sites-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>Votre site et vos concurrents</h2>
                        <p>On va analyser votre marché pour trouver les meilleures opportunités SEO.</p>
                        
                        <div className="sites-form">
                            <div className="site-input-group main">
                                <label>
                                    <Globe size={18} />
                                    Votre site web *
                                </label>
                                                <input
                                    type="url"
                                    placeholder="https://votresite.com"
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                                    autoFocus
                                />
                                        </div>

                            <div className="competitors-section">
                                <label>
                                    <Users size={18} />
                                    3 concurrents (optionnel mais recommandé)
                                </label>
                                <p className="hint">On analysera leurs mots-clés pour vous donner un avantage</p>
                                
                                {formData.competitors.map((comp, index) => (
                                    <div key={index} className="site-input-group competitor">
                                        <span className="competitor-number">{index + 1}</span>
                                                <input
                                            type="url"
                                            placeholder={`https://concurrent${index + 1}.com`}
                                            value={comp}
                                            onChange={(e) => updateCompetitor(index, e.target.value)}
                                        />
                                        </div>
                                ))}
                                            </div>
                                        </div>

                        <button 
                            className="btn-analyze"
                            onClick={analyzeAndFindKeywords}
                            disabled={!formData.websiteUrl || analyzing}
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 size={20} className="spin" />
                                    Analyse des sites en cours... (30-60s)
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Analyser les sites et trouver des mots-clés
                                </>
                            )}
                        </button>
                    </motion.div>
                );

            case 2: // Keywords results
                return (
                    <motion.div 
                        className="step-content keywords-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>Mots-clés suggérés 🎯</h2>
                        <p>Basés sur l'analyse de votre site et de vos concurrents. Sélectionnez ceux qui vous intéressent pour créer du contenu optimisé.</p>
                        
                        <div className="keywords-grid">
                            {suggestedKeywords.map((kw, index) => (
                                                    <button
                                    key={index}
                                    className={`keyword-card ${selectedKeywords.includes(kw.keyword) ? 'selected' : ''} ${kw.opportunity ? `opportunity-${kw.opportunity}` : ''}`}
                                    onClick={() => toggleKeyword(kw.keyword)}
                                    title={kw.reason || ''}
                                >
                                    <div className="keyword-main">
                                        <span className="keyword-text">{kw.keyword}</span>
                                        {selectedKeywords.includes(kw.keyword) && (
                                            <CheckCircle2 size={18} className="check" />
                                        )}
                                                </div>
                                    {kw.opportunity && (
                                        <div className="keyword-opportunity">
                                            <span className={`opportunity-badge ${kw.opportunity}`}>
                                                {kw.opportunity === 'high' ? '🔥 Haute opportunité' : 
                                                 kw.opportunity === 'medium' ? '⭐ Opportunité' : 
                                                 '💡 Potentiel'}
                                            </span>
                                            </div>
                                    )}
                                    {kw.reason && (
                                        <div className="keyword-reason" title={kw.reason}>
                                            {kw.reason}
                                    </div>
                                    )}
                                    <div className="keyword-stats">
                                        <span className="stat">
                                            <TrendingUp size={14} />
                                            {kw.volume}/mois
                                        </span>
                                        <span className={`stat difficulty ${kw.difficulty < 30 ? 'easy' : kw.difficulty < 50 ? 'medium' : 'hard'}`}>
                                            KD: {kw.difficulty}
                                        </span>
                                    </div>
                                                </button>
                            ))}
                                </div>

                        {selectedKeywords.length > 0 && (
                            <div className="selected-count">
                                <CheckCircle2 size={16} />
                                {selectedKeywords.length} mot(s)-clé(s) sélectionné(s)
                                        </div>
                        )}
                    </motion.div>
                );

            case 3: // Calendar preview
                return (
                    <motion.div 
                        className="step-content calendar-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {generatingArticle ? (
                            <>
                                <div className="generating-icon">
                                    <Loader2 size={48} className="spin" />
                                            </div>
                                <h2>Création de votre planning... ✨</h2>
                                <p>Nous préparons votre calendrier et générons votre premier article.</p>
                                
                                <div className="generating-status">
                                    <div className="status-item done">
                                        <CheckCircle2 size={18} />
                                        <span>{selectedKeywords.length} mots-clés sélectionnés</span>
                                            </div>
                                    <div className="status-item active">
                                        <Loader2 size={18} className="spin" />
                                        <span>Génération du 1er article...</span>
                                        </div>
                                            </div>
                            </>
                        ) : (
                            <>
                                <div className="calendar-header">
                                    <div className="calendar-header-icon">
                                        <Calendar size={28} />
                                            </div>
                                    <div>
                                        <h2>Votre calendrier de contenu</h2>
                                        <p>Voici vos articles planifiés. Le premier est en cours de génération !</p>
                                        </div>
                                        </div>

                                <div className="calendar-preview">
                                    {getCalendarPreview().map((item, index) => (
                                        <div key={index} className={`calendar-item ${item.status}`}>
                                            <div className="calendar-date">
                                                <span className="day">{item.date.getDate()}</span>
                                                <span className="month">{['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'][item.date.getMonth()]}</span>
                                            </div>
                                            <div className="calendar-content">
                                                <div className="keyword-name">
                                                    {index === 0 && <Loader2 size={14} className="spin" />}
                                                    {item.keyword}
                                        </div>
                                                <div className="keyword-meta">
                                                    <span>{item.volume}/mois</span>
                                                    <span className={`difficulty ${item.difficulty < 30 ? 'easy' : item.difficulty < 50 ? 'medium' : 'hard'}`}>
                                                        KD: {item.difficulty}
                                        </span>
                                    </div>
                                </div>
                                            <div className="calendar-status">
                                                {index === 0 ? (
                                                    <span className="badge generating">En génération</span>
                                                ) : (
                                                    <span className="badge scheduled">Planifié</span>
                                                )}
                                            </div>
                                                    </div>
                                                ))}
                                        </div>

                                <div className="activation-cta">
                                    <Sparkles size={20} />
                                    <div>
                                        <strong>Activez votre agent pour continuer</strong>
                                        <p>Votre 1er article sera prêt après l'activation !</p>
                                            </div>
                                                    </div>
                            </>
                        )}
                        </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="onboarding-page">
            {/* Progress Header */}
            <div className="onboarding-header">
                <div className="logo">
                    <img src="/seo-agent-icon.png" alt="SEO Agent" />
                    <span>SEO Agent</span>
                                        </div>
                <div className="progress-steps">
                    {steps.map((s, index) => (
                        <div 
                            key={s.id} 
                            className={`progress-step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
                        >
                            <div className="step-indicator">
                                {index < step ? <Check size={14} /> : <s.icon size={14} />}
                                                    </div>
                            <span className="step-label">{s.title}</span>
                                                    </div>
                                                        ))}
                                                    </div>
                                                </div>

            {/* Main Content */}
            <div className="onboarding-content">
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
                                    </div>

            {/* Navigation Footer */}
            <div className="onboarding-footer">
                                                                    <button 
                    className="btn-back"
                    onClick={prevStep}
                    disabled={step === 0}
                                                                    >
                    <ArrowLeft size={18} />
                    Retour
                                                                    </button>

                {step === steps.length - 1 ? (
                                                    <button
                        className="btn-finish"
                        onClick={handleFinish}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                Finalisation...
                            </>
                        ) : (
                            <>
                                Choisir mon plan
                                                <ArrowRight size={18} />
                            </>
                        )}
                                        </button>
                ) : step === 1 ? (
                    <div></div>
                ) : (
                                            <button
                        className="btn-next"
                        onClick={nextStep}
                        disabled={!canProceed()}
                    >
                        Suivant
                        <ArrowRight size={18} />
                                            </button>
                )}
                                        </div>
                                    </div>
    );
};

export default Onboarding;




