import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Search, Target, PenTool, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
            if (error.message.includes('Email not confirmed')) {
                setError('Veuillez confirmer votre email avant de vous connecter.');
            } else if (error.message.includes('Invalid login credentials')) {
                setError('Email ou mot de passe incorrect.');
            } else {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-container">
            {/* Left Side - Form */}
            <div className="auth-form-side">
                <motion.div
                    className="auth-form-content"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-logo-section">
                        <div className="auth-logo-container">
                            <img src="/seo-agent-icon.png" alt="SEO Agent" className="auth-logo-img" />
                            <div className="auth-logo-glow"></div>
                        </div>
                        <div className="auth-logo-text-wrapper">
                            <span className="auth-logo-text">SEO Agent</span>
                            <span className="auth-logo-subtitle">Agent IA</span>
                        </div>
                    </div>

                    <div className="auth-header-section">
                        <h1>Bon retour ! 👋</h1>
                        <p>Connectez-vous pour continuer à optimiser votre SEO</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field-clean"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field-clean"
                            />
                        </div>

                        <div className="form-options">
                            <Link to="/forgot-password" className="forgot-link">Mot de passe oublié ?</Link>
                        </div>

                        <button type="submit" className="btn-primary-auth" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>Se connecter <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-section">
                        <p>Pas encore de compte ? <Link to="/signup" className="link-accent">S'inscrire</Link></p>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Features */}
            <div className="auth-features-side">
                <motion.div
                    className="features-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="features-header">
                        <h2>Générez du contenu SEO <span className="highlight-green">automatiquement</span></h2>
                        <p>Votre agent IA crée, optimise et publie vos articles 24/7</p>
                    </div>

                    <div className="features-grid">
                        <motion.div 
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="feature-icon">
                                <Search size={24} />
                            </div>
                            <h3>Audit SEO Intelligent</h3>
                            <p>Analysez n'importe quel site en profondeur et obtenez des recommandations actionnables</p>
                        </motion.div>

                        <motion.div 
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="feature-icon">
                                <Target size={24} />
                            </div>
                            <h3>Recherche de Mots-clés</h3>
                            <p>Découvrez des opportunités cachées avec notre analyse IA de mots-clés</p>
                        </motion.div>

                        <motion.div 
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="feature-icon">
                                <PenTool size={24} />
                            </div>
                            <h3>Contenu Optimisé</h3>
                            <p>Générez des articles de 2000+ mots optimisés SEO en quelques secondes</p>
                        </motion.div>

                        <motion.div 
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="feature-icon">
                                <TrendingUp size={24} />
                            </div>
                            <h3>Publication Automatique</h3>
                            <p>Publiez directement sur WordPress, Webflow ou Framer sans intervention</p>
                        </motion.div>
                    </div>

                    <div className="features-stats">
                        <div className="stat-item">
                            <span className="stat-value">&lt;30s</span>
                            <span className="stat-label">Génération d'article</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">2000+</span>
                            <span className="stat-label">Mots par article</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">24/7</span>
                            <span className="stat-label">Disponibilité</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
