import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Search, TrendingUp, FileText } from 'lucide-react';
import { API_URL } from '../config';
import './FunnelAnalyze.css';

const FunnelAnalyze = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        // Récupérer l'URL depuis localStorage
        const savedUrl = localStorage.getItem('funnel_url');
        if (savedUrl) {
            setUrl(savedUrl);
        }

        // Analyser le site avec le backend
        const analyzeSite = async () => {
            try {
                setIsAnalyzing(true);
                
                // Étape 1: Analyse du site
                setStep(0);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Étape 2: Identification des opportunités
                setStep(1);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Étape 3: Recherche de mots-clés
                setStep(2);
                
                // Appel API pour analyser le site
                const response = await fetch(`${API_URL}/api/funnel/analyze`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: savedUrl || ''
                    })
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de l\'analyse');
                }

                const data = await response.json();
                
                // Sauvegarder les résultats dans localStorage
                localStorage.setItem('funnel_keywords', JSON.stringify(data.keywords));
                localStorage.setItem('funnel_calendar', JSON.stringify(data.calendar));
                localStorage.setItem('funnel_analysis', JSON.stringify(data.analysis || {}));

                // Étape 4: Génération du plan
                setStep(3);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Rediriger vers les résultats
                navigate('/funnel/results');
            } catch (error) {
                console.error('Error analyzing site:', error);
                // En cas d'erreur, utiliser des données par défaut
                const defaultKeywords = [
                    {
                        keyword: 'marketing digital',
                        volume: 12000,
                        difficulty: 35,
                        opportunity: 'Forte opportunité - faible concurrence'
                    },
                    {
                        keyword: 'formation en ligne',
                        volume: 8500,
                        difficulty: 42,
                        opportunity: 'Potentiel de trafic élevé'
                    },
                    {
                        keyword: 'e-commerce',
                        volume: 15000,
                        difficulty: 55,
                        opportunity: 'Volume important - stratégie long terme'
                    }
                ];
                localStorage.setItem('funnel_keywords', JSON.stringify(defaultKeywords));
                navigate('/funnel/results');
            } finally {
                setIsAnalyzing(false);
            }
        };

        analyzeSite();
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



