/**
 * Email Service - Send notifications for qualified leads and new users
 * Uses Resend API (more reliable than SMTP on Railway)
 */

const axios = require('axios');

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'SEO Agent <noreply@smart-caller.ai>';

/**
 * Send email using Resend API
 */
const sendEmail = async (to, subject, html) => {
    if (!RESEND_API_KEY) {
        console.log('Resend API key not configured - skipping email');
        return { success: false, reason: 'Email not configured' };
    }

    try {
        const response = await axios.post('https://api.resend.com/emails', {
            from: FROM_EMAIL,
            to: to,
            subject: subject,
            html: html
        }, {
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Email sent to ${to}: ${subject}`);
        return { success: true, id: response.data.id };
    } catch (error) {
        console.error('Error sending email via Resend:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send email notification when a lead is qualified
 */
const sendQualifiedLeadNotification = async (userEmail, lead, score, details) => {
    const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    const scoreLabel = score >= 80 ? '🔥 Lead Chaud' : score >= 60 ? '⚡ Lead Tiède' : '❄️ Lead Froid';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF470F, #FF6B35); padding: 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 1.5rem; }
        .content { padding: 32px; }
        .score-badge { display: inline-block; padding: 8px 16px; background: ${scoreColor}; color: white; border-radius: 20px; font-weight: 600; font-size: 0.9rem; margin-bottom: 20px; }
        .lead-card { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .lead-name { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin: 0 0 4px 0; }
        .lead-phone { color: #6b7280; font-size: 0.95rem; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #6b7280; font-size: 0.9rem; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .score-display { text-align: center; margin: 24px 0; }
        .score-number { font-size: 3rem; font-weight: 800; color: ${scoreColor}; }
        .score-label { color: #6b7280; font-size: 0.9rem; }
        .cta-btn { display: block; width: 100%; padding: 16px; background: #1a1a1a; color: white; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 600; margin-top: 24px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Nouveau Lead Qualifié !</h1>
        </div>
        <div class="content">
            <span class="score-badge">${scoreLabel}</span>
            
            <div class="lead-card">
                <h2 class="lead-name">${lead.name || 'Contact'}</h2>
                <p class="lead-phone">${lead.phone || ''}</p>
            </div>
            
            <div class="score-display">
                <div class="score-number">${score}</div>
                <div class="score-label">Score de qualification</div>
            </div>
            
            <div class="info-row">
                <span class="info-label">Entreprise</span>
                <span class="info-value">${lead.company_name || '—'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Source</span>
                <span class="info-value">${lead.source || 'Direct'}</span>
            </div>
            ${details?.budget ? `
            <div class="info-row">
                <span class="info-label">Budget</span>
                <span class="info-value">${details.budget}</span>
            </div>
            ` : ''}
            ${details?.reason ? `
            <div class="info-row">
                <span class="info-label">Raison</span>
                <span class="info-value">${details.reason}</span>
            </div>
            ` : ''}
            
            <a href="https://app.agentiaseo.com/contacts" class="cta-btn">Voir dans Agent IA SEO →</a>
        </div>
        <div class="footer">
            Agent IA SEO - Votre assistant SEO intelligent
        </div>
    </div>
</body>
</html>
    `;

    const result = await sendEmail(
        userEmail,
        `🎯 Lead qualifié : ${lead.name || 'Nouveau contact'} (Score: ${score})`,
        htmlContent
    );

    if (result.success) {
        console.log(`Email notification sent to ${userEmail} for lead ${lead.name}`);
    }

    return result;
};

/**
 * Send weekly report email
 */
const sendWeeklyReport = async (userEmail, stats) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF470F, #FF6B35); padding: 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 1.5rem; }
        .content { padding: 32px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
        .stat-card { background: #f9fafb; border-radius: 12px; padding: 20px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: 800; color: #1a1a1a; }
        .stat-label { color: #6b7280; font-size: 0.85rem; margin-top: 4px; }
        .highlight { background: linear-gradient(135deg, #FF470F, #FF6B35); color: white; }
        .highlight .stat-value { color: white; }
        .highlight .stat-label { color: rgba(255,255,255,0.9); }
        .cta-btn { display: block; width: 100%; padding: 16px; background: #1a1a1a; color: white; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 600; margin-top: 24px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Votre rapport hebdomadaire</h1>
        </div>
        <div class="content">
            <p>Voici le résumé de votre activité Agent IA SEO cette semaine :</p>
            
            <div class="stats-grid">
                <div class="stat-card highlight">
                    <div class="stat-value">${stats.newLeads || 0}</div>
                    <div class="stat-label">Nouveaux leads</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.qualified || 0}</div>
                    <div class="stat-label">Qualifiés</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.responseRate || 0}%</div>
                    <div class="stat-label">Taux de réponse</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.meetings || 0}</div>
                    <div class="stat-label">RDV réservés</div>
                </div>
            </div>
            
            <a href="https://app.agentiaseo.com/" class="cta-btn">Voir le dashboard complet →</a>
        </div>
        <div class="footer">
            Agent IA SEO - Votre assistant SEO intelligent
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail(
        userEmail,
        `📊 Rapport Agent IA SEO : ${stats.newLeads || 0} contenus cette semaine`,
        htmlContent
    );
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
    const firstName = user.name?.split(' ')[0] || 'là';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <tr>
            <td style="background: #FF470F; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Bienvenue sur Agent IA SEO 🚀</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 32px;">
                <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6; margin: 0 0 24px 0;">
                    Salut ${firstName} ! 👋<br><br>
                    Merci de nous faire confiance. Vous êtes prêt à automatiser votre stratégie SEO.
                </p>
                
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0; font-weight: 600;">🎯 Prochaines étapes :</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="display: inline-block; width: 24px; height: 24px; background: #FF470F; color: white; border-radius: 6px; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 12px;">1</span>
                            <span style="color: #374151; font-size: 14px;">Configurez votre agent</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="display: inline-block; width: 24px; height: 24px; background: #FF470F; color: white; border-radius: 6px; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 12px;">2</span>
                            <span style="color: #374151; font-size: 14px;">Connectez vos formulaires ou importez vos leads</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0;">
                            <span style="display: inline-block; width: 24px; height: 24px; background: #FF470F; color: white; border-radius: 6px; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 12px;">3</span>
                            <span style="color: #374151; font-size: 14px;">Laissez Agent IA SEO créer votre contenu 24/7</span>
                        </td>
                    </tr>
                </table>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center;">
                            <a href="https://app.agentiaseo.com/" style="display: inline-block; padding: 14px 32px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Accéder à mon dashboard →</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 20px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © 2025 Agent IA SEO · <a href="https://agentiaseo.com" style="color: #9ca3af;">Site web</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const result = await sendEmail(
        user.email,
        `🚀 Bienvenue sur Agent IA SEO, ${firstName} !`,
        htmlContent
    );

    if (result.success) {
        console.log(`Welcome email sent to ${user.email}`);
    }

    return result;
};

/**
 * Send Slack notification for new user signup
 */
const sendSlackNewUserNotification = async (user) => {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
        console.log('Slack webhook not configured - skipping notification');
        return { success: false, reason: 'Slack not configured' };
    }

    try {
        const message = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🎉 Nouvel utilisateur inscrit !",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Email:*\n${user.email || 'N/A'}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Nom:*\n${user.name || 'N/A'}`
                        }
                    ]
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Date:*\n${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*ID:*\n\`${user.id?.slice(0, 8) || 'N/A'}...\``
                        }
                    ]
                },
                {
                    type: "divider"
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "📊 <https://app.agentiaseo.com/|Voir le dashboard Agent IA SEO>"
                        }
                    ]
                }
            ]
        };

        await axios.post(slackWebhookUrl, message);
        console.log(`Slack notification sent for new user: ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending Slack notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send Slack notification for new subscription
 */
const sendSlackNewSubscriptionNotification = async (user, planId, amount, currency = 'EUR') => {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
        console.log('Slack webhook not configured - skipping notification');
        return { success: false, reason: 'Slack not configured' };
    }

    try {
        // Format plan name
        const planNames = {
            'starter': 'Starter',
            'growth': 'Growth',
            'scale': 'Scale'
        };
        const planName = planNames[planId?.toLowerCase()] || planId || 'N/A';

        // Format amount
        const formattedAmount = (amount / 100).toFixed(2);
        const currencySymbol = currency === 'EUR' ? '€' : currency;

        const message = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "💰 Nouvel abonnement activé !",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Email:*\n${user.email || 'N/A'}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Plan:*\n${planName}`
                        }
                    ]
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Montant:*\n${formattedAmount} ${currencySymbol}/mois`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Date:*\n${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`
                        }
                    ]
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*ID Utilisateur:*\n\`${user.id?.slice(0, 8) || 'N/A'}...\``
                        },
                        {
                            type: "mrkdwn",
                            text: `*ID Plan:*\n\`${planId || 'N/A'}\``
                        }
                    ]
                },
                {
                    type: "divider"
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "📊 <https://app.agentiaseo.com/|Voir le dashboard Agent IA SEO>"
                        }
                    ]
                }
            ]
        };

        await axios.post(slackWebhookUrl, message);
        console.log(`Slack notification sent for new subscription: ${user.email} - ${planName}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending Slack subscription notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send Slack notification for new funnel lead
 */
const sendSlackNewLeadNotification = async (lead) => {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    console.log('Attempting to send Slack notification for lead:', {
        email: lead.email?.substring(0, 10) + '...',
        source: lead.source,
        variant: lead.variant,
        hasWebhook: !!slackWebhookUrl
    });
    
    if (!slackWebhookUrl) {
        console.warn('⚠️ Slack webhook not configured - skipping lead notification');
        console.warn('   Set SLACK_WEBHOOK_URL environment variable to enable notifications');
        return { success: false, reason: 'Slack not configured' };
    }

    try {
        const sourceLabels = {
            'meta': 'Meta Ads',
            'facebook': 'Facebook',
            'instagram': 'Instagram',
            'google': 'Google Ads',
            'direct': 'Direct',
            'organic': 'Organique',
            'email': 'Email',
            'linkedin': 'LinkedIn',
            'twitter': 'Twitter'
        };

        const variantLabels = {
            'A': 'Variante A',
            'B': 'Variante B',
            'C': 'Variante C'
        };
        
        // Afficher les UTM dans la notification si disponibles
        const utmInfo = lead.utm || {};
        const utmFields = [];
        if (utmInfo.utm_campaign) utmFields.push(`*Campagne:*\n${utmInfo.utm_campaign}`);
        if (utmInfo.utm_medium) utmFields.push(`*Medium:*\n${utmInfo.utm_medium}`);
        if (utmInfo.utm_content) utmFields.push(`*Content:*\n${utmInfo.utm_content}`);

        const message = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🎯 Nouveau lead Funnel SEO",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Email:*\n${lead.email}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Source:*\n${sourceLabels[lead.source] || lead.source}`
                        }
                    ]
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Variante:*\n${variantLabels[lead.variant] || lead.variant}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Date:*\n${new Date(lead.createdAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`
                        }
                    ]
                },
                ${utmFields.length > 0 ? `
                {
                    type: "section",
                    fields: ${JSON.stringify(utmFields.map(field => ({
                        type: "mrkdwn",
                        text: field
                    })))}
                },
                ` : ''}
                {
                    type: "divider"
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `📊 <https://agent-seo.netlify.app/funnel/results|Voir le plan SEO généré>`
                    }
                }
            ]
        };

        const response = await axios.post(slackWebhookUrl, message);
        console.log(`✅ Slack notification sent successfully for lead: ${lead.email}`);
        console.log('   Response status:', response.status);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending Slack lead notification:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
        return { success: false, error: error.message };
    }
};

/**
 * Send email notification to admin for new funnel lead
 */
const sendAdminNewLeadEmail = async (lead) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'jeremy@agentiaseo.com';
    
    if (!RESEND_API_KEY) {
        console.log('Resend API key not configured - skipping admin email');
        return { success: false, reason: 'Email not configured' };
    }

    const sourceLabels = {
        'meta': 'Meta Ads',
        'google': 'Google Ads',
        'direct': 'Direct',
        'organic': 'Organique'
    };

    const variantLabels = {
        'A': 'Variante A',
        'B': 'Variante B',
        'C': 'Variante C'
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 1.5rem; }
        .content { padding: 24px; }
        .info-row { padding: 16px 0; border-bottom: 1px solid #e5e5e5; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #6b7280; font-size: 0.9rem; margin-bottom: 4px; }
        .info-value { font-weight: 600; color: #1a1a1a; font-size: 1rem; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Nouveau Lead Funnel SEO</h1>
        </div>
        <div class="content">
            <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">${lead.email}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label">Source</div>
                <div class="info-value">${sourceLabels[lead.source] || lead.source}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label">Variante</div>
                <div class="info-value">${variantLabels[lead.variant] || lead.variant}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label">Date</div>
                <div class="info-value">${new Date(lead.createdAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</div>
            </div>
        </div>
        <div class="footer">
            SEO Agent - Funnel Meta Ads
        </div>
    </div>
</body>
</html>
    `;

    try {
        const result = await sendEmail(
            adminEmail,
            `🎯 Nouveau lead Funnel SEO - ${lead.email}`,
            htmlContent
        );
        return result;
    } catch (error) {
        console.error('Error in sendAdminNewLeadEmail:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send email notification for new user signup (to admin)
 */
const sendNewUserEmailNotification = async (user) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
        console.log('Admin email not configured - skipping new user notification');
        return { success: false, reason: 'Admin email not configured' };
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 1.5rem; }
        .content { padding: 32px; }
        .user-card { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .user-email { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin: 0 0 4px 0; }
        .user-name { color: #6b7280; font-size: 0.95rem; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #6b7280; font-size: 0.9rem; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .cta-btn { display: block; width: 100%; padding: 16px; background: #1a1a1a; color: white; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 600; margin-top: 24px; box-sizing: border-box; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Nouvel utilisateur inscrit !</h1>
        </div>
        <div class="content">
            <div class="user-card">
                <h2 class="user-email">${user.email || 'N/A'}</h2>
                <p class="user-name">${user.name || 'Nom non renseigné'}</p>
            </div>
            
            <div class="info-row">
                <span class="info-label">Date d'inscription</span>
                <span class="info-value">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
            </div>
            <div class="info-row">
                <span class="info-label">ID Utilisateur</span>
                <span class="info-value">${user.id?.slice(0, 8) || 'N/A'}...</span>
            </div>
            
            <a href="https://app.agentiaseo.com/" class="cta-btn">Voir le dashboard →</a>
        </div>
        <div class="footer">
            Agent IA SEO - Notification Admin
        </div>
    </div>
</body>
</html>
    `;

    const result = await sendEmail(
        adminEmail,
        `🎉 Nouvel utilisateur : ${user.email}`,
        htmlContent
    );

    if (result.success) {
        console.log(`New user email notification sent to admin for: ${user.email}`);
    }

    return result;
};

/**
 * Notify about new user signup (Slack, Admin Email, and Welcome Email to user)
 */
const notifyNewUserSignup = async (user) => {
    const results = await Promise.allSettled([
        sendSlackNewUserNotification(user),
        sendNewUserEmailNotification(user),
        sendWelcomeEmail(user)
    ]);
    
    return {
        slack: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason },
        adminEmail: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason },
        welcomeEmail: results[2].status === 'fulfilled' ? results[2].value : { success: false, error: results[2].reason }
    };
};

/**
 * Send SEO plan by email to user
 */
const sendPlanEmail = async (email, planId, planData) => {
    if (!RESEND_API_KEY) {
        console.log('Resend API key not configured - skipping plan email');
        return { success: false, reason: 'Email not configured' };
    }

    // Valider les données
    if (!planData || !planData.keywords || !Array.isArray(planData.keywords)) {
        console.error('Invalid planData provided to sendPlanEmail:', planData);
        return { success: false, error: 'Invalid plan data' };
    }

    // S'assurer que tous les mots-clés ont les propriétés nécessaires
    const validKeywords = planData.keywords
        .filter(kw => kw && (kw.keyword || typeof kw === 'string'))
        .map((kw, index) => {
            if (typeof kw === 'string') {
                return {
                    keyword: kw,
                    volume: 0,
                    difficulty: 0
                };
            }
            return {
                keyword: kw.keyword || `Mot-clé ${index + 1}`,
                volume: kw.volume || 0,
                difficulty: kw.difficulty || 0
            };
        })
        .slice(0, 10); // Limiter à 10 mots-clés

    if (validKeywords.length === 0) {
        console.error('No valid keywords found in planData');
        return { success: false, error: 'No valid keywords' };
    }

    const keywordsHtml = validKeywords.map((kw, index) => `
        <div style="background: #F9FAFB; padding: 14px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10B981;">
            <h3 style="margin: 0 0 6px 0; color: #111827; font-size: 1rem; font-weight: 600;">
                ${index + 1}. ${kw.keyword}
            </h3>
            <div style="display: flex; gap: 16px; font-size: 0.85rem; color: #6B7280;">
                <span>📊 ${kw.volume.toLocaleString()} recherches/mois</span>
                <span>📈 Difficulté: ${kw.difficulty}%</span>
            </div>
        </div>
    `).join('');

    // Générer le calendrier HTML si disponible (utiliser tables HTML pour compatibilité email)
    let calendarHtml = '';
    if (planData.calendar && Array.isArray(planData.calendar) && planData.calendar.length > 0) {
        const calendarDays = planData.calendar.slice(0, 30);
        const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        
        // Grouper par semaines
        const weeks = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weeks.push(calendarDays.slice(i, i + 7));
        }

        // Générer les cellules de la semaine avec padding pour égaliser
        const generateWeekRow = (week) => {
            return week.map((day, dayIndex) => {
                const date = new Date(day.date || day);
                const dayNum = date.getDate();
                const hasArticle = day.hasArticle || day.has_content;
                const isToday = date.toDateString() === new Date().toDateString();
                
                const bgColor = hasArticle ? '#ECFDF5' : (isToday ? '#FEF3C7' : '#FFFFFF');
                const borderColor = hasArticle ? '#10B981' : (isToday ? '#FCD34D' : '#E5E7EB');
                const textColor = hasArticle ? '#065F46' : (isToday ? '#92400E' : '#374151');
                const fontWeight = hasArticle || isToday ? '700' : '500';
                
                return `
                    <td style="
                        width: 14.28%;
                        background: ${bgColor};
                        border: 2px solid ${borderColor};
                        border-radius: 6px;
                        padding: 8px 4px;
                        text-align: center;
                        font-size: 13px;
                        font-weight: ${fontWeight};
                        color: ${textColor};
                        vertical-align: middle;
                    ">
                        <div style="line-height: 1.2;">${dayNum}</div>
                        ${hasArticle ? '<div style="width: 5px; height: 5px; background: #10B981; border-radius: 50%; margin: 4px auto 0; display: block;"></div>' : ''}
                    </td>
                `;
            }).join('');
        };

        calendarHtml = `
            <h2 style="color: #111827; margin-top: 32px; margin-bottom: 16px; font-size: 18px;">📅 Votre calendrier SEO (30 jours)</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-collapse: separate; border-spacing: 4px;">
                <!-- En-tête jours de la semaine -->
                <tr>
                    ${weekDays.map(day => `
                        <td style="text-align: center; font-weight: 700; font-size: 11px; color: #6B7280; padding: 8px 4px;">
                            ${day}
                        </td>
                    `).join('')}
                </tr>
                <!-- Semaines -->
                ${weeks.map(week => `
                    <tr>
                        ${generateWeekRow(week)}
                        ${week.length < 7 ? Array(7 - week.length).fill('<td style="width: 14.28%;"></td>').join('') : ''}
                    </tr>
                `).join('')}
            </table>
            <p style="text-align: center; font-size: 14px; color: #6B7280; margin-top: 12px; margin-bottom: 0;">
                <strong style="color: #10B981;">${planData.articlesCount} articles</strong> planifiés sur les 30 prochains jours
            </p>
        `;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 1.75rem; }
        .content { padding: 32px; }
        .cta-button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10B981, #059669); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Votre plan SEO est prêt !</h1>
        </div>
        <div class="content">
            <p style="color: #111827; font-size: 16px; line-height: 1.6;">
                Bonjour,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Voici votre plan SEO personnalisé avec <strong>${planData.articlesCount} articles</strong> planifiés sur les <strong>${planData.duration} prochains jours</strong>.
            </p>
            
            <h2 style="color: #111827; margin-top: 32px; margin-bottom: 16px;">📌 Vos ${validKeywords.length} mots-clés prioritaires</h2>
            ${keywordsHtml}
            
            ${calendarHtml}
            
            <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 24px; border-radius: 12px; margin: 32px 0; border: 2px solid #10B981;">
                <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 1.2rem;">🚀 Mettez votre plan en application</h3>
                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                    Réservez un appel de 15 minutes avec un expert pour mettre en place votre calendrier SEO automatiquement sur votre site.
                </p>
                <a href="https://zcal.co/i/7LMkT11o" style="
                    display: inline-block;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #10B981, #059669);
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 15px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                ">📅 Réserver un appel (15 min)</a>
                <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 0.85rem; font-style: italic;">
                    On configure tout ensemble • Sans engagement • Gratuit
                </p>
            </div>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #10B981;">
                <h3 style="margin: 0 0 8px 0; color: #111827;">💡 Autres options</h3>
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Vous préférez activer automatiquement ? 
                    <a href="https://agent-seo.netlify.app/funnel/convert" style="color: #10B981; font-weight: 600;">Activez votre agent SEO →</a>
                </p>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                Besoin d'aide ? Répondez simplement à cet email.
            </p>
        </div>
        <div class="footer">
            <p>© 2025 SEO Agent - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const result = await sendEmail(
            email,
            '🎯 Votre plan SEO personnalisé - SEO Agent',
            htmlContent
        );
        return result;
    } catch (error) {
        console.error('Error in sendPlanEmail:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendQualifiedLeadNotification,
    sendWeeklyReport,
    sendSlackNewUserNotification,
    sendSlackNewSubscriptionNotification,
    sendSlackNewLeadNotification,
    sendNewUserEmailNotification,
    sendAdminNewLeadEmail,
    sendWelcomeEmail,
    notifyNewUserSignup,
    sendPlanEmail
};
