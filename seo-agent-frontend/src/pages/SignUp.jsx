import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Search, Target, PenTool, TrendingUp, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Auth.css';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { user } = await signup(name, email, password);
            
            // Notify admin about new user (async, don't wait)
            fetch(`${API_URL}/api/notify/new-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user: { 
                        id: user?.id, 
                        email, 
                        name 
                    } 
                })
            }).catch(err => console.log('Notification error:', err));
            
            navigate('/onboarding');
        } catch (error) {
            console.error('Signup failed', error);
            if (error.message.includes('already registered')) {
                setError('Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.');
            } else {
                setError('Erreur lors de l\'inscription. Veuillez réessayer.');
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
                        <h1>Créer un compte 🚀</h1>
                        <p>Commencez à générer du contenu SEO optimisé en quelques minutes</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="input-field-clean"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email professionnel</label>
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
                                placeholder="Minimum 8 caractères"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field-clean"
                            />
                        </div>

                        <p className="terms-text">
                            En vous inscrivant, vous acceptez nos <Link to="/terms">Conditions d'utilisation</Link> et notre <Link to="/privacy">Politique de confidentialité</Link>.
                        </p>

                        <button type="submit" className="btn-primary-auth" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>Créer mon compte <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="auth-benefits">
                        <div className="benefit-item">
                            <CheckCircle size={16} />
                            <span>7 jours d'essai gratuit</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={16} />
                            <span>Sans carte bancaire</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={16} />
                            <span>Annulation à tout moment</span>
                        </div>
                    </div>

                    <div className="auth-footer-section">
                        <p>Vous avez déjà un compte ? <Link to="/login" className="link-accent">Se connecter</Link></p>
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

export default SignUp;
