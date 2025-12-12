import React, { useState, useEffect } from 'react';
import { 
    Globe, 
    Plus, 
    CheckCircle, 
    XCircle,
    Trash2, 
    RefreshCw,
    ExternalLink,
    HelpCircle,
    Loader2,
    X,
    AlertCircle,
    Webhook,
    Calendar,
    Copy,
    Check,
    Save,
    Link2,
    Headphones,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { API_URL, WEBHOOK_BASE_URL } from '../config';
import './Integrations.css';

const Integrations = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState([]);
    const [expertRequests, setExpertRequests] = useState([]);
    
    // Modals
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showExpertModal, setShowExpertModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('wordpress');
    
    // Connection form
    const [connectionForm, setConnectionForm] = useState({
        siteUrl: '',
        siteName: '',
        username: '',
        appPassword: ''
    });
    const [connectionStatus, setConnectionStatus] = useState(null); // 'testing', 'success', 'error'
    const [connectionError, setConnectionError] = useState('');
    const [connecting, setConnecting] = useState(false);
    
    // Expert request form
    const [expertForm, setExpertForm] = useState({
        platform: 'wordpress',
        siteUrl: '',
        phone: '',
        message: ''
    });
    const [submittingExpert, setSubmittingExpert] = useState(false);
    
    // Legacy webhook/calendar states
    const [saving, setSaving] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showJson, setShowJson] = useState(false);
    const [crmWebhookUrl, setCrmWebhookUrl] = useState('');
    const [calendarUrl, setCalendarUrl] = useState('');

    const inboundWebhookUrl = `${WEBHOOK_BASE_URL}/${user?.id}/leads`;

    const platforms = [
        { 
            id: 'wordpress', 
            name: 'WordPress', 
            icon: '📝', 
            color: '#21759b',
            available: true,
            description: 'Publiez automatiquement sur votre site'
        },
        { 
            id: 'webflow', 
            name: 'Webflow', 
            icon: '🌐', 
            color: '#4353ff',
            available: false,
            description: 'Bientôt disponible'
        },
        { 
            id: 'framer', 
            name: 'Framer', 
            icon: '🎨', 
            color: '#0055ff',
            available: false,
            description: 'Bientôt disponible'
        }
    ];

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch connected sites
            const sitesRes = await fetch(`${API_URL}/api/sites/${user.id}`);
            const sitesData = await sitesRes.json();
            setSites(sitesData.sites || []);

            // Fetch expert requests
            const requestsRes = await fetch(`${API_URL}/api/expert-requests/${user.id}`);
            const requestsData = await requestsRes.json();
            setExpertRequests(requestsData.requests || []);

            // Fetch profile config
            const { data, error } = await supabase
                .from('profiles')
                .select('webhook_url, agent_config')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                setCrmWebhookUrl(data.webhook_url || '');
                setCalendarUrl(data.agent_config?.calendarUrl || '');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        setConnectionStatus('testing');
        setConnectionError('');

        try {
            const response = await fetch(`${API_URL}/api/wordpress/test-connection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siteUrl: connectionForm.siteUrl,
                    username: connectionForm.username,
                    appPassword: connectionForm.appPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                setConnectionStatus('success');
            } else {
                setConnectionStatus('error');
                setConnectionError(result.error || 'Erreur de connexion');
            }
        } catch (error) {
            setConnectionStatus('error');
            setConnectionError('Impossible de contacter le serveur');
        }
    };

    const connectSite = async () => {
        setConnecting(true);
        
        try {
            const response = await fetch(`${API_URL}/api/wordpress/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    siteUrl: connectionForm.siteUrl,
                    siteName: connectionForm.siteName,
                    username: connectionForm.username,
                    appPassword: connectionForm.appPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                setSites([result.site, ...sites]);
                setShowConnectModal(false);
                resetConnectionForm();
            } else {
                setConnectionError(result.error || 'Erreur lors de la connexion');
            }
        } catch (error) {
            setConnectionError('Erreur lors de la connexion');
        } finally {
            setConnecting(false);
        }
    };

    const deleteSite = async (siteId) => {
        if (!confirm('Êtes-vous sûr de vouloir déconnecter ce site ?')) return;

        try {
            await fetch(`${API_URL}/api/sites/${user.id}/${siteId}`, {
                method: 'DELETE'
            });
            setSites(sites.filter(s => s.id !== siteId));
        } catch (error) {
            console.error('Error deleting site:', error);
        }
    };

    const submitExpertRequest = async () => {
        setSubmittingExpert(true);

        try {
            const response = await fetch(`${API_URL}/api/expert-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...expertForm
                })
            });

            const result = await response.json();

            if (result.success) {
                setExpertRequests([{ ...result, ...expertForm, status: 'pending', created_at: new Date().toISOString() }, ...expertRequests]);
                setShowExpertModal(false);
                setExpertForm({ platform: 'wordpress', siteUrl: '', phone: '', message: '' });
                alert('✅ Votre demande a été envoyée ! Un expert vous contactera sous 24h.');
            }
        } catch (error) {
            console.error('Error submitting expert request:', error);
            alert('Erreur lors de l\'envoi de la demande');
        } finally {
            setSubmittingExpert(false);
        }
    };

    const resetConnectionForm = () => {
        setConnectionForm({ siteUrl: '', siteName: '', username: '', appPassword: '' });
        setConnectionStatus(null);
        setConnectionError('');
    };

    const saveCrmWebhook = async () => {
        setSaving('crm');
        try {
            await supabase.from('profiles').update({ webhook_url: crmWebhookUrl }).eq('id', user.id);
            alert('Webhook CRM sauvegardé !');
        } catch (error) {
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const saveCalendarUrl = async () => {
        setSaving('calendar');
        try {
            const { data: currentData } = await supabase
                .from('profiles')
                .select('agent_config')
                .eq('id', user.id)
                .single();

            await supabase
                .from('profiles')
                .update({ agent_config: { ...(currentData?.agent_config || {}), calendarUrl } })
                .eq('id', user.id);

            alert('URL de l\'agenda sauvegardée !');
        } catch (error) {
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="page-container integrations-page">
                <div className="loading-spinner">
                    <Loader2 className="spin" size={32} />
                    <span>Chargement...</span>
                </div>
            </div>
        );
    }

    // Check if user has made a choice (connected site, expert request, or manual)
    const hasMadeChoice = sites.length > 0 || expertRequests.length > 0;

    return (
        <div className="page-container integrations-page">
            <header className="page-header">
                <div>
                    <h1>Sites connectés</h1>
                    <p className="text-muted">Publiez automatiquement vos articles SEO</p>
                </div>
            </header>

            {/* Connect Site Banner */}
            {!hasMadeChoice && (
                <div className="connect-banner">
                    <div className="connect-banner-content">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Connectez votre site pour publier automatiquement</strong>
                            <p>Choisissez une plateforme, publication manuelle ou demandez l'aide d'un expert</p>
                        </div>
                    </div>
                    <button 
                        className="btn-banner-connect"
                        onClick={() => setShowConnectModal(true)}
                    >
                        Connecter maintenant
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* Connected Sites Section */}
            <section className="section-block">
                <div className="section-header">
                    <h2><Globe size={20} /> Mes sites</h2>
                    <button className="btn-primary" onClick={() => setShowConnectModal(true)}>
                        <Plus size={16} /> Connecter un site
                    </button>
                </div>

                {sites.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔗</div>
                        <h3>Aucun site connecté</h3>
                        <p>Connectez votre premier site pour publier automatiquement vos articles SEO.</p>
                        <div className="empty-actions">
                            <button className="btn-primary" onClick={() => setShowConnectModal(true)}>
                                <Plus size={16} /> Connecter un site
                            </button>
                            <button className="btn-secondary" onClick={() => setShowExpertModal(true)}>
                                <Headphones size={16} /> Aide d'un expert (gratuit)
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="sites-grid">
                        {sites.map(site => (
                            <div key={site.id} className="site-card">
                                <div className="site-header">
                                    <div className="site-icon wordpress">📝</div>
                                    <div className="site-info">
                                        <h4>{site.site_name || new URL(site.site_url).hostname}</h4>
                                        <span className="site-url">{site.site_url}</span>
                                    </div>
                                    <span className={`status-badge ${site.status}`}>
                                        {site.status === 'active' ? (
                                            <><CheckCircle size={12} /> Connecté</>
                                        ) : (
                                            <><XCircle size={12} /> Erreur</>
                                        )}
                                    </span>
                                </div>
                                <div className="site-footer">
                                    <span className="site-platform">{site.platform}</span>
                                    <div className="site-actions">
                                        <button className="btn-icon" title="Visiter le site">
                                            <a href={site.site_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink size={16} />
                                            </a>
                                        </button>
                                        <button 
                                            className="btn-icon danger" 
                                            title="Déconnecter"
                                            onClick={() => deleteSite(site.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add site card */}
                        <div className="site-card add-card" onClick={() => setShowConnectModal(true)}>
                            <Plus size={32} />
                            <span>Ajouter un site</span>
                        </div>
                    </div>
                )}
            </section>

            {/* Expert Help Banner */}
            <section className="expert-banner">
                <div className="expert-content">
                    <div className="expert-icon">
                        <Sparkles size={24} />
                    </div>
                    <div className="expert-text">
                        <h3>Besoin d'aide pour connecter votre site ?</h3>
                        <p>Un expert SEO Agent vous aide gratuitement à configurer votre intégration.</p>
                    </div>
                    <button className="btn-expert" onClick={() => setShowExpertModal(true)}>
                        <Headphones size={18} />
                        Demander l'aide d'un expert
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* Pending Expert Requests */}
            {expertRequests.length > 0 && (
                <section className="section-block">
                    <h2><HelpCircle size={20} /> Mes demandes d'aide</h2>
                    <div className="requests-list">
                        {expertRequests.map(request => (
                            <div key={request.id} className="request-item">
                                <div className="request-info">
                                    <span className="request-platform">{request.platform}</span>
                                    <span className="request-url">{request.site_url || 'Site non spécifié'}</span>
                                </div>
                                <span className={`request-status ${request.status}`}>
                                    {request.status === 'pending' && '⏳ En attente'}
                                    {request.status === 'in_progress' && '🔧 En cours'}
                                    {request.status === 'completed' && '✅ Terminé'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Available Platforms */}
            <section className="section-block">
                <h2>Plateformes disponibles</h2>
                <div className="platforms-grid">
                    {platforms.map(platform => (
                        <div 
                            key={platform.id} 
                            className={`platform-card ${!platform.available ? 'coming-soon' : ''}`}
                            onClick={() => platform.available && (setSelectedPlatform(platform.id), setShowConnectModal(true))}
                        >
                            <span className="platform-icon">{platform.icon}</span>
                            <div className="platform-info">
                                <h4>{platform.name}</h4>
                                <p>{platform.description}</p>
                            </div>
                            {platform.available ? (
                                <ArrowRight size={20} className="platform-arrow" />
                            ) : (
                                <span className="coming-badge">Bientôt</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Legacy Webhooks Section */}
            <section className="section-block">
                <h2><Webhook size={20} /> Webhooks & Intégrations</h2>
                <div className="integrations-grid">
                    {/* Inbound Webhook */}
                <div className="integration-card">
                    <div className="card-icon-wrapper blue">
                        <Link2 size={24} />
                    </div>
                    <h3>Webhook Entrant</h3>
                    <p className="card-description">
                            Recevez des leads depuis Zapier ou votre site web.
                    </p>
                    <div className="card-content">
                        <label>URL DE VOTRE WEBHOOK</label>
                        <div className="url-display-box">
                            <code className="url-text" title={inboundWebhookUrl}>
                                {`${WEBHOOK_BASE_URL}/${user?.id?.slice(0, 8)}••••/leads`}
                            </code>
                                <button className="btn-copy" onClick={() => copyToClipboard(inboundWebhookUrl)}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                        </div>
                            <button className="btn-secondary btn-json" onClick={() => setShowJson(!showJson)}>
                                {showJson ? 'Masquer le format JSON' : 'Voir le format JSON'}
                        </button>
                        {showJson && (
                            <pre className="json-preview">
{`{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "email": "jean@example.com"
}`}
                            </pre>
                        )}
                    </div>
                </div>

                    {/* CRM Webhook */}
                <div className="integration-card">
                    <div className="card-icon-wrapper orange">
                        <Webhook size={24} />
                    </div>
                    <div className="card-status-row">
                        <h3>CRM Webhook</h3>
                            {crmWebhookUrl && <span className="status-badge connected"><CheckCircle size={12} /> Actif</span>}
                    </div>
                        <p className="card-description">Envoyez les leads qualifiés vers votre CRM.</p>
                    <div className="card-content">
                        <label>URL DU WEBHOOK (SORTANT)</label>
                        <input
                            type="url"
                            placeholder="https://hooks.zapier.com/..."
                            value={crmWebhookUrl}
                            onChange={(e) => setCrmWebhookUrl(e.target.value)}
                            className="input-field"
                        />
                            <button className="btn-primary btn-save" onClick={saveCrmWebhook} disabled={saving === 'crm'}>
                            {saving === 'crm' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                        </button>
                    </div>
                </div>

                    {/* Calendar */}
                <div className="integration-card">
                    <div className="card-icon-wrapper green">
                        <Calendar size={24} />
                    </div>
                    <div className="card-status-row">
                        <h3>Agenda</h3>
                            {calendarUrl && <span className="status-badge connected"><CheckCircle size={12} /> Actif</span>}
                    </div>
                        <p className="card-description">URL de prise de rendez-vous (Calendly, Cal.com...).</p>
                    <div className="card-content">
                            <label>URL DE VOTRE AGENDA</label>
                        <input
                            type="url"
                            placeholder="https://calendly.com/votre-nom"
                            value={calendarUrl}
                            onChange={(e) => setCalendarUrl(e.target.value)}
                            className="input-field"
                        />
                            <button className="btn-primary btn-save" onClick={saveCalendarUrl} disabled={saving === 'calendar'}>
                                {saving === 'calendar' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Connect Site Modal */}
            {showConnectModal && (
                <div className="modal-overlay" onClick={() => setShowConnectModal(false)}>
                    <div className="modal connect-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => { setShowConnectModal(false); resetConnectionForm(); }}>
                            <X size={20} />
                        </button>

                        <div className="modal-header">
                            <div className="modal-icon wordpress">📝</div>
                            <h2>Connecter un site</h2>
                            <p>Publiez automatiquement vos articles SEO sur votre site</p>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>URL de votre site</label>
                                <input
                                    type="url"
                                    placeholder="https://monsite.com"
                                    value={connectionForm.siteUrl}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, siteUrl: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nom du site (optionnel)</label>
                                <input
                                    type="text"
                                    placeholder="Mon Blog"
                                    value={connectionForm.siteName}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, siteName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    placeholder="admin"
                                    value={connectionForm.username}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, username: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Mot de passe d'application
                                    <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="help-link">
                                        <HelpCircle size={14} /> Comment obtenir ?
                                    </a>
                                </label>
                                <input
                                    type="password"
                                    placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                                    value={connectionForm.appPassword}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, appPassword: e.target.value })}
                                />
                                <p className="form-hint">
                                    Créez un mot de passe d'application dans les paramètres de votre site
                                </p>
                            </div>

                            {/* Connection Status */}
                            {connectionStatus && (
                                <div className={`connection-status ${connectionStatus}`}>
                                    {connectionStatus === 'testing' && (
                                        <><Loader2 className="spin" size={16} /> Test de connexion en cours...</>
                                    )}
                                    {connectionStatus === 'success' && (
                                        <><CheckCircle size={16} /> Connexion réussie ! Vous pouvez connecter ce site.</>
                                    )}
                                    {connectionStatus === 'error' && (
                                        <><AlertCircle size={16} /> {connectionError}</>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={testConnection} disabled={connectionStatus === 'testing' || !connectionForm.siteUrl || !connectionForm.username || !connectionForm.appPassword}>
                                {connectionStatus === 'testing' ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
                                Tester la connexion
                            </button>
                        <button
                                className="btn-primary" 
                                onClick={connectSite}
                                disabled={connectionStatus !== 'success' || connecting}
                            >
                                {connecting ? <Loader2 className="spin" size={16} /> : <CheckCircle size={16} />}
                                {connecting ? 'Connexion...' : 'Connecter ce site'}
                            </button>
                        </div>

                        <div className="modal-help">
                            <p>Besoin d'aide ? <button onClick={() => { setShowConnectModal(false); setShowExpertModal(true); }}>Demander l'aide d'un expert (gratuit)</button></p>
                        </div>
                    </div>
                </div>
            )}

            {/* Expert Request Modal */}
            {showExpertModal && (
                <div className="modal-overlay" onClick={() => setShowExpertModal(false)}>
                    <div className="modal expert-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowExpertModal(false)}>
                            <X size={20} />
                        </button>

                        <div className="modal-header expert">
                            <div className="modal-icon expert">
                                <Headphones size={32} />
                            </div>
                            <h2>Aide gratuite d'un expert</h2>
                            <p>Un expert SEO Agent vous contactera sous 24h pour vous aider à connecter votre site.</p>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Plateforme</label>
                                <select 
                                    value={expertForm.platform}
                                    onChange={(e) => setExpertForm({ ...expertForm, platform: e.target.value })}
                                >
                                    <option value="wordpress">WordPress</option>
                                    <option value="webflow">Webflow</option>
                                    <option value="framer">Framer</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>URL de votre site (optionnel)</label>
                                <input
                                    type="url"
                                    placeholder="https://monsite.com"
                                    value={expertForm.siteUrl}
                                    onChange={(e) => setExpertForm({ ...expertForm, siteUrl: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Votre numéro de téléphone</label>
                                <input
                                    type="tel"
                                    placeholder="+33 6 12 34 56 78"
                                    value={expertForm.phone}
                                    onChange={(e) => setExpertForm({ ...expertForm, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Message (optionnel)</label>
                                <textarea
                                    placeholder="Décrivez votre problème ou vos questions..."
                                    value={expertForm.message}
                                    onChange={(e) => setExpertForm({ ...expertForm, message: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="expert-benefits">
                                <h4>✨ Ce service inclut :</h4>
                                <ul>
                                    <li>✅ Appel de 15-30 min avec un expert</li>
                                    <li>✅ Configuration complète de votre intégration</li>
                                    <li>✅ Test de publication d'un article</li>
                                    <li>✅ Réponses à toutes vos questions</li>
                                </ul>
                                <p className="free-badge">🎁 100% gratuit, inclus dans votre abonnement</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowExpertModal(false)}>
                                Annuler
                            </button>
                            <button 
                                className="btn-primary expert-btn"
                                onClick={submitExpertRequest}
                                disabled={submittingExpert || !expertForm.phone}
                            >
                                {submittingExpert ? (
                                    <><Loader2 className="spin" size={16} /> Envoi en cours...</>
                                ) : (
                                    <><Headphones size={16} /> Demander un rappel</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Integrations;
