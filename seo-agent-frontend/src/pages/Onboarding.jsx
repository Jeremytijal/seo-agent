import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, ArrowLeft, Check, Globe, Target, 
    Sparkles, Loader2, Search, Plus, X,
    CheckCircle2, Send, HelpCircle, Copy,
    Rocket, PartyPopper, TrendingUp, Users
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
        competitors: ['', '', ''],
        hasWordPress: null,
        wordpressUrl: '',
        wordpressUsername: '',
        wordpressPassword: '',
        needsExpertHelp: false
    });

    // Keyword suggestions from analysis
    const [suggestedKeywords, setSuggestedKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    const steps = [
        { id: 'welcome', title: 'Bienvenue', icon: Rocket },
        { id: 'sites', title: 'Vos sites', icon: Globe },
        { id: 'keywords', title: 'Mots-clés', icon: Target },
        { id: 'publish', title: 'Publication', icon: Send },
        { id: 'ready', title: 'Prêt !', icon: PartyPopper }
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

    const handleFinish = async () => {
        if (!user) return;
        
        setLoading(true);
        
        try {
            // Save onboarding data to profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    website_url: formData.websiteUrl,
                    competitors: formData.competitors.filter(c => c.trim() !== ''),
                    selected_keywords: selectedKeywords,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Save selected keywords as favorites
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

            // WordPress connection
            if (formData.hasWordPress && formData.wordpressUrl) {
                try {
                    await fetch(`${API_URL}/api/sites/connect`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            siteUrl: formData.wordpressUrl,
                            username: formData.wordpressUsername,
                            password: formData.wordpressPassword,
                            platform: 'wordpress'
                        })
                    });
                } catch (wpError) {
                    console.error('WordPress connection error:', wpError);
                }
            }

            // Expert help request
            if (formData.needsExpertHelp) {
                try {
                    await fetch(`${API_URL}/api/expert-request`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            userEmail: user.email,
                            requestType: 'wordpress_setup',
                            siteUrl: formData.websiteUrl,
                            message: 'Demande d\'aide pour connecter mon site'
                        })
                    });
                } catch (expertError) {
                    console.error('Expert request error:', expertError);
                }
            }

            navigate('/subscription?from=onboarding');
        } catch (error) {
            console.error('Finish error:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 0: return true;
            case 1: return formData.websiteUrl.length > 5;
            case 2: return true; // Keywords are optional
            case 3: return formData.hasWordPress !== null;
            case 4: return true;
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
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Analyser et trouver des mots-clés
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
                        <p>Sélectionnez ceux qui vous intéressent. On les ajoutera à votre liste pour créer du contenu.</p>
                        
                        <div className="keywords-grid">
                            {suggestedKeywords.map((kw, index) => (
                                <button
                                    key={index}
                                    className={`keyword-card ${selectedKeywords.includes(kw.keyword) ? 'selected' : ''}`}
                                    onClick={() => toggleKeyword(kw.keyword)}
                                >
                                    <div className="keyword-main">
                                        <span className="keyword-text">{kw.keyword}</span>
                                        {selectedKeywords.includes(kw.keyword) && (
                                            <CheckCircle2 size={18} className="check" />
                                        )}
                                    </div>
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

            case 3: // Publication method
                return (
                    <motion.div 
                        className="step-content publish-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>Comment publier vos articles ?</h2>
                        <p>Connectez votre site pour publier automatiquement.</p>
                        
                        <div className="publish-options">
                            <button
                                className={`publish-option ${formData.hasWordPress === true ? 'selected' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, hasWordPress: true, needsExpertHelp: false }))}
                            >
                                <div className="option-icon wordpress">
                                    <img src="https://s.w.org/style/images/about/WordPress-logotype-simplified.png" alt="WordPress" />
                                </div>
                                <div className="option-content">
                                    <h4>WordPress</h4>
                                    <p>Publication automatique</p>
                                </div>
                                {formData.hasWordPress === true && <CheckCircle2 size={24} className="check" />}
                            </button>

                            <button
                                className={`publish-option ${formData.hasWordPress === false && !formData.needsExpertHelp ? 'selected' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, hasWordPress: false, needsExpertHelp: false }))}
                            >
                                <div className="option-icon manual">
                                    <Copy size={28} />
                                </div>
                                <div className="option-content">
                                    <h4>Manuel</h4>
                                    <p>Je copie les articles</p>
                                </div>
                                {formData.hasWordPress === false && !formData.needsExpertHelp && <CheckCircle2 size={24} className="check" />}
                            </button>

                            <button
                                className={`publish-option expert ${formData.needsExpertHelp ? 'selected' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, hasWordPress: false, needsExpertHelp: true }))}
                            >
                                <div className="option-icon">
                                    <HelpCircle size={28} />
                                </div>
                                <div className="option-content">
                                    <h4>Besoin d'aide</h4>
                                    <p>Un expert vous aide</p>
                                    <span className="free-badge">Gratuit</span>
                                </div>
                                {formData.needsExpertHelp && <CheckCircle2 size={24} className="check" />}
                            </button>
                        </div>

                        {formData.hasWordPress === true && (
                            <motion.div 
                                className="wordpress-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <div className="input-group">
                                    <input
                                        type="url"
                                        placeholder="URL WordPress (ex: https://monsite.com)"
                                        value={formData.wordpressUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, wordpressUrl: e.target.value }))}
                                    />
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Nom d'utilisateur"
                                        value={formData.wordpressUsername}
                                        onChange={(e) => setFormData(prev => ({ ...prev, wordpressUsername: e.target.value }))}
                                    />
                                </div>
                                <div className="input-group">
                                    <input
                                        type="password"
                                        placeholder="Mot de passe d'application"
                                        value={formData.wordpressPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, wordpressPassword: e.target.value }))}
                                    />
                                </div>
                                <a 
                                    href="https://wordpress.org/documentation/article/application-passwords/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="help-link"
                                >
                                    <HelpCircle size={14} />
                                    Comment créer un mot de passe d'application ?
                                </a>
                            </motion.div>
                        )}
                    </motion.div>
                );

            case 4: // Ready
                return (
                    <motion.div 
                        className="step-content ready-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="ready-icon">
                            <PartyPopper size={64} />
                        </div>
                        <h2>C'est prêt ! 🎉</h2>
                        <p>Votre SEO Agent est configuré et prêt à créer du contenu.</p>
                        
                        <div className="summary-card">
                            <div className="summary-item">
                                <Globe size={18} />
                                <span>{formData.websiteUrl}</span>
                            </div>
                            {selectedKeywords.length > 0 && (
                                <div className="summary-item">
                                    <Target size={18} />
                                    <span>{selectedKeywords.length} mot(s)-clé(s) sélectionné(s)</span>
                                </div>
                            )}
                            <div className="summary-item">
                                <Send size={18} />
                                <span>
                                    {formData.hasWordPress 
                                        ? 'Publication WordPress' 
                                        : formData.needsExpertHelp 
                                            ? 'Un expert vous contactera'
                                            : 'Publication manuelle'}
                                </span>
                            </div>
                        </div>

                        <div className="next-steps">
                            <h4>Prochaine étape</h4>
                            <p>Choisissez votre plan pour commencer à générer du contenu SEO optimisé !</p>
                        </div>
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
