import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Search, TrendingUp, FileText } from 'lucide-react';
import './FunnelAnalyze.css';

const FunnelAnalyze = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [url, setUrl] = useState('');

    useEffect(() => {
        // Récupérer l'URL depuis localStorage
        const savedUrl = localStorage.getItem('funnel_url');
        if (savedUrl) {
            setUrl(savedUrl);
        }

        // Simuler l'analyse avec des étapes
        const steps = [
            { text: 'Analyse de votre site...', duration: 2000 },
            { text: 'Identification des opportunités SEO...', duration: 2000 },
            { text: 'Recherche de mots-clés à fort potentiel...', duration: 2000 },
            { text: 'Génération de votre plan de contenu...', duration: 2000 },
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setStep(currentStep);
                currentStep++;
            } else {
                clearInterval(interval);
                // Rediriger vers les résultats après 1 seconde
                setTimeout(() => {
                    navigate('/funnel/results');
                }, 1000);
            }
        }, steps[0]?.duration || 2000);

        return () => clearInterval(interval);
    }, [navigate]);

    const steps = [
        { icon: Search, text: 'Analyse de votre site...', color: '#3B82F6' },
        { icon: TrendingUp, text: 'Identification des opportunités SEO...', color: '#8B5CF6' },
        { icon: FileText, text: 'Recherche de mots-clés à fort potentiel...', color: '#10B981' },
        { icon: CheckCircle, text: 'Génération de votre plan de contenu...', color: '#F59E0B' },
    ];

    return (
        <div className="funnel-analyze">
            <div className="funnel-container">
                {/* Progress */}
                <div className="funnel-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '66%' }}></div>
                    </div>
                    <span className="progress-text">Étape 2 sur 3</span>
                </div>

                {/* Header */}
                <div className="funnel-header">
                    <h1 className="funnel-title">
                        Analyse de votre site en cours
                    </h1>
                    <p className="funnel-subtitle">
                        {url ? `Analyse de ${url.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : 'Analyse de votre site'}
                    </p>
                </div>

                {/* Analysis Steps */}
                <div className="analysis-steps">
                    {steps.map((stepItem, index) => {
                        const StepIcon = stepItem.icon;
                        const isActive = index === step;
                        const isCompleted = index < step;

                        return (
                            <div 
                                key={index} 
                                className={`analysis-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                <div className="step-icon-wrapper">
                                    {isCompleted ? (
                                        <CheckCircle size={24} className="step-icon" />
                                    ) : isActive ? (
                                        <Loader2 size={24} className="step-icon spinning" />
                                    ) : (
                                        <StepIcon size={24} className="step-icon" />
                                    )}
                                </div>
                                <div className="step-content">
                                    <p className="step-text">{stepItem.text}</p>
                                    {isActive && (
                                        <div className="step-loading">
                                            <div className="loading-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Message */}
                <div className="analysis-info">
                    <p>
                        <strong>Notre IA analyse :</strong>
                    </p>
                    <ul>
                        <li>La structure technique de votre site</li>
                        <li>Les opportunités de mots-clés non exploitées</li>
                        <li>Le potentiel de trafic SEO</li>
                        <li>Un calendrier de contenu optimisé</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FunnelAnalyze;



