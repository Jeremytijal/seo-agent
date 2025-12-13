/**
 * Expert Request Service
 * Handles free expert consultation requests for site connections
 */

const emailService = require('./emailService');

/**
 * Create an expert request
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {Object} requestData - Request details
 */
async function createExpertRequest(supabase, userId, requestData) {
    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('email, agent_config')
        .eq('id', userId)
        .single();

    const userEmail = profile?.email || requestData.email;
    const userName = profile?.agent_config?.company || requestData.name || 'Client';

    // Save request to database
    const { data, error } = await supabase
        .from('expert_requests')
        .insert({
            user_id: userId,
            type: requestData.type || 'site_connection',
            platform: requestData.platform || 'wordpress',
            site_url: requestData.siteUrl,
            message: requestData.message,
            user_email: userEmail,
            user_name: userName,
            phone: requestData.phone,
            status: 'pending',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating expert request:', error);
        throw error;
    }

    // Send notification email to admin
    try {
        await notifyAdminNewRequest(data, userEmail, userName);
    } catch (emailError) {
        console.error('Error sending admin notification:', emailError);
        // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
        await sendUserConfirmation(userEmail, userName, requestData);
    } catch (emailError) {
        console.error('Error sending user confirmation:', emailError);
    }

    return {
        success: true,
        requestId: data.id,
        message: 'Votre demande a été envoyée. Un expert vous contactera sous 24h.'
    };
}

/**
 * Notify admin of new expert request
 */
async function notifyAdminNewRequest(request, userEmail, userName) {
    const adminEmail = process.env.ADMIN_EMAIL || 'jeremy@agentiaseo.com';
    
    // Use Resend to send email
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: 'SEO Agent <notifications@agentiaseo.com>',
        to: adminEmail,
        subject: `🆘 Nouvelle demande d'aide expert - ${request.platform}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0;">🆘 Nouvelle demande d'aide</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #111827; margin-top: 0;">Détails de la demande</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Client</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${userName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <a href="mailto:${userEmail}" style="color: #10B981;">${userEmail}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Téléphone</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${request.phone || 'Non fourni'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Plateforme</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <span style="background: #DBEAFE; color: #1D4ED8; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                    ${request.platform?.toUpperCase() || 'WORDPRESS'}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">URL du site</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                <a href="${request.site_url}" target="_blank" style="color: #10B981;">${request.site_url || 'Non fourni'}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">Type</td>
                            <td style="padding: 10px 0;">${request.type}</td>
                        </tr>
                    </table>
                    
                    ${request.message ? `
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #10B981;">
                        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px;">Message du client :</p>
                        <p style="color: #111827; margin: 0;">${request.message}</p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="mailto:${userEmail}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            Contacter le client
                        </a>
                    </div>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                    SEO Agent - Demande #${request.id}
                </p>
            </div>
        `
    });
}

/**
 * Send confirmation email to user
 */
async function sendUserConfirmation(userEmail, userName, requestData) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: 'SEO Agent <support@agentiaseo.com>',
        to: userEmail,
        subject: '✅ Votre demande d\'aide a été reçue - SEO Agent',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">✅ Demande reçue !</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p style="color: #111827; font-size: 16px;">
                        Bonjour ${userName},
                    </p>
                    
                    <p style="color: #4b5563;">
                        Nous avons bien reçu votre demande d'aide pour la connexion de votre site 
                        <strong>${requestData.platform || 'WordPress'}</strong>.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                        <h3 style="color: #111827; margin: 0 0 10px 0;">📅 Prochaine étape</h3>
                        <p style="color: #4b5563; margin: 0;">
                            Un expert SEO Agent vous contactera <strong>sous 24 heures</strong> pour vous aider 
                            à connecter votre site et configurer la publication automatique.
                        </p>
                    </div>
                    
                    <p style="color: #4b5563;">
                        Ce service est <strong>100% gratuit</strong> et inclus dans votre abonnement.
                    </p>
                    
                    <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #92400E; margin: 0; font-size: 14px;">
                            💡 <strong>Conseil :</strong> Préparez vos accès WordPress (identifiant admin) 
                            pour que notre expert puisse vous aider rapidement.
                        </p>
                    </div>
                    
                    <p style="color: #4b5563;">
                        Si vous avez des questions urgentes, répondez directement à cet email.
                    </p>
                    
                    <p style="color: #4b5563; margin-top: 30px;">
                        À très bientôt,<br>
                        <strong>L'équipe SEO Agent</strong>
                    </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                    © 2025 SEO Agent - Tous droits réservés
                </p>
            </div>
        `
    });
}

/**
 * Get expert requests for a user
 */
async function getUserRequests(supabase, userId) {
    const { data, error } = await supabase
        .from('expert_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching expert requests:', error);
        return [];
    }

    return data || [];
}

/**
 * Update request status (admin only)
 */
async function updateRequestStatus(supabase, requestId, status, notes) {
    const { data, error } = await supabase
        .from('expert_requests')
        .update({
            status,
            admin_notes: notes,
            updated_at: new Date().toISOString(),
            ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        console.error('Error updating request status:', error);
        throw error;
    }

    return data;
}

module.exports = {
    createExpertRequest,
    getUserRequests,
    updateRequestStatus
};




