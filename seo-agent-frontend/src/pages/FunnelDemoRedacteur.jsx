import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowRight, ArrowLeft, User, Mail, Globe, Phone, 
    CheckCircle, Layers, Shield, Star, Sparkles
} from 'lucide-react';
import { API_URL } from '../config';
import './FunnelDemoRedacteur.css';

const FunnelDemoRedacteur = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        siteInternet: '',
        telephone: ''
    });

    const totalSteps = 2;

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!formData.prenom.trim()) {
                newErrors.prenom = 'Le prénom est requis';
            }
            if (!formData.nom.trim()) {
                newErrors.nom = 'Le nom est requis';
            }
        }
        
        if (step === 2) {
            if (!formData.email.trim()) {
                newErrors.email = 'L\'adresse email est requise';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Veuillez entrer une adresse email valide';
            }
            if (!formData.siteInternet.trim()) {
                newErrors.siteInternet = 'L\'URL du site est requise';
            } else if (!/^https?:\/\/.+/.test(formData.siteInternet) && !formData.siteInternet.includes('.')) {
                newErrors.siteInternet = 'Veuillez entrer une URL valide (ex: https://monsite.com)';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep(2)) {
            return;
        }
        
        setIsLoading(true);

        try {
            // Format URL if needed
            let siteUrl = formData.siteInternet.trim();
            if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
                siteUrl = 'https://' + siteUrl;
            }

            const submissionData = {
                prenom: formData.prenom.trim(),
                nom: formData.nom.trim(),
                email: formData.email.trim().toLowerCase(),
                site_internet: siteUrl,
                telephone: formData.telephone.trim() || null,
                source: 'landing_redacteur'
            };

            // Send to backend (saves to Supabase + sends Slack notification)
            try {
                await fetch(`${API_URL}/api/demo-requests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submissionData)
                });
            } catch (apiError) {
                console.error('API error:', apiError);
                // Continue anyway - we don't want to block the user
            }

            // Save data to localStorage for thank you page
            localStorage.setItem('demo_request', JSON.stringify({
                ...formData,
                siteInternet: siteUrl,
                submittedAt: new Date().toISOString()
            }));

            // Navigate to thank you page
            navigate('/landing/redacteur/merci');
        } catch (err) {
            console.error('Error submitting form:', err);
            // Still navigate to thank you page even if Supabase fails
            localStorage.setItem('demo_request', JSON.stringify({
                ...formData,
                submittedAt: new Date().toISOString()
            }));
            navigate('/landing/redacteur/merci');
        }
    };

    const getProgressWidth = () => {
        return `${(currentStep / totalSteps) * 100}%`;
    };

    const renderStepIndicator = () => (
        <div className="demo-steps-indicator">
            {[1, 2].map((step) => (
                <div 
                    key={step} 
                    className={`step-dot ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                >
                    {currentStep > step ? <CheckCircle size={16} /> : step}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="demo-step-content">
            <div className="step-icon-wrapper">
                <User size={32} />
            </div>
            <h2 className="step-title">Comment vous appelez-vous ?</h2>
            <p className="step-subtitle">Nous aimons savoir à qui nous parlons !</p>

            <div className="demo-form-fields">
                <div className="form-field">
                    <label htmlFor="prenom">
                        Prénom <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        placeholder="Votre prénom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className={errors.prenom ? 'error' : ''}
                        autoFocus
                    />
                    {errors.prenom && <span className="error-message">{errors.prenom}</span>}
                </div>

                <div className="form-field">
                    <label htmlFor="nom">
                        Nom <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        placeholder="Votre nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className={errors.nom ? 'error' : ''}
                    />
                    {errors.nom && <span className="error-message">{errors.nom}</span>}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="demo-step-content">
            <div className="step-icon-wrapper">
                <Globe size={32} />
            </div>
            <h2 className="step-title">Parlez-nous de votre projet</h2>
            <p className="step-subtitle">Pour préparer une démo personnalisée</p>

            <div className="demo-form-fields">
                <div className="form-field">
                    <label htmlFor="email">
                        <Mail size={16} />
                        Adresse email <span className="required">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="vous@entreprise.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        autoFocus
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-field">
                    <label htmlFor="siteInternet">
                        <Globe size={16} />
                        Site internet <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="siteInternet"
                        name="siteInternet"
                        placeholder="https://votresite.com"
                        value={formData.siteInternet}
                        onChange={handleChange}
                        className={errors.siteInternet ? 'error' : ''}
                    />
                    {errors.siteInternet && <span className="error-message">{errors.siteInternet}</span>}
                    <p className="field-hint">Nous analyserons votre site avant la démo</p>
                </div>

                <div className="form-field">
                    <label htmlFor="telephone">
                        <Phone size={16} />
                        Numéro de téléphone <span className="optional">(facultatif)</span>
                    </label>
                    <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        placeholder="+33 6 12 34 56 78"
                        value={formData.telephone}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="funnel-demo-redacteur">
            {/* Header */}
            <header className="demo-header">
                <Link to="/landing/redacteur" className="demo-logo">
                    <div className="logo-icon">
                        <Layers size={20} />
                    </div>
                    <span>Agent SEO</span>
                </Link>
            </header>

            {/* Main Content */}
            <div className="demo-container">
                {/* Form Card */}
                <div className="demo-form-card">
                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}

                        {/* Navigation Buttons */}
                        <div className="demo-nav-buttons">
                            {currentStep > 1 && (
                                <button 
                                    type="button" 
                                    className="demo-btn secondary"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft size={18} />
                                    Retour
                                </button>
                            )}

                            {currentStep < totalSteps ? (
                                <button 
                                    type="button" 
                                    className="demo-btn primary"
                                    onClick={handleNext}
                                >
                                    Continuer
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    className="demo-btn primary submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            Demander ma démo gratuite
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Progress Bar & Step Indicator */}
                <div className="demo-progress-bottom">
                    {renderStepIndicator()}
                    <div className="demo-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: getProgressWidth() }}></div>
                        </div>
                        <span className="progress-text">Étape {currentStep} sur {totalSteps}</span>
                    </div>
                </div>

                {/* Trust Elements */}
                <div className="demo-trust">
                    <div className="trust-item">
                        <Shield size={16} />
                        <span>Démo gratuite et sans engagement</span>
                    </div>
                    <div className="trust-item">
                        <Star size={16} />
                        <span>+500 entreprises nous font confiance</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunnelDemoRedacteur;
