/**
 * Configuration centralisée de l'application
 * Toutes les URLs et clés sont définies ici
 */

// API Backend URL
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.agentiaseo.com';

// Webhook URL for integrations
export const WEBHOOK_BASE_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://api.agentiaseo.com/webhooks';

// Stripe Public Key
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_VOTRE_CLE_STRIPE';

// App URLs
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.agentiaseo.com';
export const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://agentiaseo.com';
export const DOCS_URL = import.meta.env.VITE_DOCS_URL || 'https://docs.agentiaseo.com';

// External Links
export const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://zcal.co/i/7LMkT11o';
export const CONTACT_URL = `${LANDING_URL}/contact`;
export const SALES_CALL_URL = 'https://zcal.co/i/7LMkT11o';

// API Endpoints helper
export const endpoints = {
    // Auth & Agents
    createAgent: `${API_URL}/api/agents/create`,
    getAgent: (userId) => `${API_URL}/api/agents/${userId}`,
    
    // Onboarding
    analyzeWebsite: `${API_URL}/api/onboarding/analyze`,
    generatePersona: `${API_URL}/api/onboarding/generate-persona`,
    simulateConversation: `${API_URL}/api/onboarding/simulate`,
    playgroundTest: `${API_URL}/api/playground/test`,
    
    // SEO Features
    seoAudit: `${API_URL}/api/seo/audit`,
    keywordResearch: `${API_URL}/api/seo/keywords`,
    generateContent: `${API_URL}/api/seo/content/generate`,
    generateImage: `${API_URL}/api/seo/image/generate`,
    
    // CMS Integrations
    publishWordpress: `${API_URL}/api/publish/wordpress`,
    publishFramer: `${API_URL}/api/publish/framer`,
    publishWebflow: `${API_URL}/api/publish/webflow`,
    
    // Projects & Content
    projects: (userId) => `${API_URL}/api/projects/${userId}`,
    content: (userId) => `${API_URL}/api/content/${userId}`,
    
    // Notifications & Analytics
    notifications: (userId) => `${API_URL}/api/notifications/${userId}`,
    analytics: (userId) => `${API_URL}/api/analytics/${userId}`,
    
    // Stripe
    createCheckoutSession: `${API_URL}/api/stripe/create-checkout-session`,
    createPortalSession: `${API_URL}/api/stripe/create-portal-session`,
    
    // Templates
    templates: (userId) => `${API_URL}/api/templates/${userId}`,
    
    // Tags
    tags: (userId) => `${API_URL}/api/tags/${userId}`,
};

// Feature flags
export const features = {
    demoMode: true,
    seoAudit: true,
    keywordResearch: true,
    contentGeneration: true,
    imageGeneration: true,
    wordpressIntegration: true,
    framerIntegration: true,
    webflowIntegration: true,
    onboardingTour: true,
};

export default {
    API_URL,
    WEBHOOK_BASE_URL,
    STRIPE_PUBLIC_KEY,
    APP_URL,
    LANDING_URL,
    DOCS_URL,
    CALENDLY_URL,
    CONTACT_URL,
    SALES_CALL_URL,
    endpoints,
    features,
};
