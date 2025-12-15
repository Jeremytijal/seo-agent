import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Mail, AlertCircle } from 'lucide-react';
import './FunnelURL.css';

const FunnelURL = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Récupérer l'email depuis localStorage
        const savedEmail = localStorage.getItem('funnel_email');
        if (!savedEmail) {
            // Si pas d'email, rediriger vers la landing
            navigate('/funnel');
            return;
        }
        setEmail(savedEmail);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Sauvegarder l'URL si fournie
            if (url.trim()) {
                localStorage.setItem('funnel_url', url.trim());
            }
            
            // Rediriger vers l'analyse
            navigate('/funnel/analyze');
        } catch (err) {
            console.error('Error:', err);
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        // Sauvegarder un flag pour indiquer qu'on a skip
        localStorage.setItem('funnel_url_skipped', 'true');
        navigate('/funnel/analyze');
    };

    return (
        <div className="funnel-url">
            <div className="funnel-container">
                {/* Progress */}
                <div className="funnel-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '33%' }}></div>
                    </div>
                    <span className="progress-text">Étape 1 sur 3</span>
                </div>

                {/* Header */}
                <div className="funnel-header">
                    <h1 className="funnel-title">
                        Analysez votre site en <span className="highlight">2 minutes</span>
                    </h1>
                    <p className="funnel-subtitle">
                        Entrez l'URL de votre site pour recevoir votre analyse SEO personnalisée.
                    </p>
                </div>

                {/* Info Box */}
                <div className="info-box">
                    <Mail size={20} />
                    <div>
                        <strong>Vous pouvez compléter plus tard</strong>
                        <p>Si vous n'avez pas l'URL sous la main, vous pouvez la fournir par email après avoir reçu votre plan SEO.</p>
                    </div>
                </div>

                {/* URL Form */}
                <form onSubmit={handleSubmit} className="funnel-form">
                    <div className="form-group">
                        <label className="form-label">
                            <Globe size={18} />
                            URL de votre site
                        </label>
                        <input
                            type="url"
                            placeholder="https://votresite.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="url-input"
                        />
                        <p className="form-hint">
                            Exemple : https://monblog.fr ou https://www.monentreprise.com
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="funnel-cta primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            'Analyse en cours...'
                        ) : (
                            <>
                                Analyser mon site
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Skip Option */}
                <button 
                    onClick={handleSkip}
                    className="funnel-cta secondary"
                    disabled={isLoading}
                >
                    Je préfère le faire plus tard
                </button>

                {/* Email Display */}
                <div className="email-display">
                    <Mail size={16} />
                    <span>Nous enverrons les résultats à : <strong>{email}</strong></span>
                </div>
            </div>
        </div>
    );
};

export default FunnelURL;



