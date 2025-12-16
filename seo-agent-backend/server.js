// Polyfill for File API (Node.js 18 compatibility with undici/axios)
// This is a workaround until Railway uses Node.js 20
if (typeof global.File === 'undefined') {
    // Minimal File polyfill for undici compatibility
    try {
        const { File: NodeFile } = require('undici');
        global.File = NodeFile;
    } catch (e) {
        // Fallback polyfill if undici File is not available
        global.File = class File {
            constructor(bits, name, options = {}) {
                this.name = name;
                this.lastModified = options.lastModified || Date.now();
                this.size = Array.isArray(bits) ? bits.length : (bits?.length || 0);
                this.type = options.type || '';
            }
        };
    }
}

console.log('🚀 Starting SEO Agent Backend...');
console.log('📦 Loading dependencies...');

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

console.log('✅ Core dependencies loaded');

// Check environment variables
console.log('🔍 Checking environment variables...');
console.log('- PORT:', process.env.PORT || '3000 (default)');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ MISSING');
console.log('- SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ MISSING');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ MISSING');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

const agentService = require('./services/agentService');
const openaiService = require('./services/openaiService');
const historyService = require('./services/historyService');
const webhookService = require('./services/webhookService');
const outboundService = require('./services/outboundService');
const scheduleService = require('./services/scheduleService');
const intelligenceService = require('./services/intelligenceService');
const followUpService = require('./services/followUpService');
const templateService = require('./services/templateService');
const tagService = require('./services/tagService');
const blacklistService = require('./services/blacklistService');
const emailService = require('./services/emailService');
const wordpressService = require('./services/wordpressService');
const expertRequestService = require('./services/expertRequestService');
const keywordService = require('./services/keywordService');
const contentService = require('./services/contentService');

console.log('✅ Services loaded');

// Initialize OpenAI for playground
let openai;
try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI initialized');
} catch (error) {
    console.error('❌ OpenAI initialization failed:', error.message);
}

// Initialize Supabase client
let supabase;
try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase initialized');
} catch (error) {
    console.error('❌ Supabase initialization failed:', error.message);
}

const app = express();
const port = process.env.PORT || 3000;

// Allowed origins for CORS
const allowedOrigins = [
    'https://app.agentiaseo.com',
    'https://agentiaseo.com',
    'https://www.agentiaseo.com',
    'https://agent-seo.netlify.app',
    process.env.FRONTEND_URL,
    // Allow localhost for development
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:3000'] : [])
].filter(Boolean);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from: ${origin}`);
            callback(null, true); // Still allow but log (for transition period)
            // In strict mode: callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ==========================================================================
// STRIPE WEBHOOK - MUST be before bodyParser to get raw body
// ==========================================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim(); // Trim whitespace

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Stripe webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            const planId = session.metadata?.planId;

            if (userId && planId) {
                // Get user info for notification
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('email, id')
                    .eq('id', userId)
                    .single();

                await supabase
                    .from('profiles')
                    .update({
                        subscription_plan: planId,
                        subscription_status: 'trial',
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                console.log(`Subscription started for user ${userId} on plan ${planId}`);

                // Send Slack notification for new subscription
                if (userProfile) {
                    const amount = session.amount_total || 0;
                    const currency = session.currency?.toUpperCase() || 'EUR';
                    emailService.sendSlackNewSubscriptionNotification(
                        { id: userProfile.id, email: userProfile.email },
                        planId,
                        amount,
                        currency
                    ).catch(err => console.error('Error sending Slack subscription notification:', err));
                }
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (profile) {
                let status = 'active';
                if (subscription.status === 'trialing') status = 'trial';
                else if (subscription.status === 'past_due') status = 'past_due';
                else if (subscription.status === 'canceled') status = 'canceled';
                else if (subscription.status === 'unpaid') status = 'unpaid';

                await supabase
                    .from('profiles')
                    .update({
                        subscription_status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', profile.id);
                
                console.log(`Subscription updated for user ${profile.id}: ${status}`);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'canceled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', profile.id);

                console.log(`Subscription canceled for user ${profile.id}`);
            }
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            const customerId = invoice.customer;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'past_due',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', profile.id);

                console.log(`Payment failed for user ${profile.id}`);
            }
            break;
        }

        case 'invoice.paid': {
            const invoice = event.data.object;
            const customerId = invoice.customer;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, email, subscription_status, subscription_plan')
                .eq('stripe_customer_id', customerId)
                .single();

            if (profile && profile.subscription_status !== 'active') {
                await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', profile.id);

                console.log(`Subscription activated for user ${profile.id} after successful payment`);

                // Send Slack notification when subscription becomes active (after trial or payment)
                if (profile.subscription_plan) {
                    const amount = invoice.amount_paid || 0;
                    const currency = invoice.currency?.toUpperCase() || 'EUR';
                    emailService.sendSlackNewSubscriptionNotification(
                        { id: profile.id, email: profile.email },
                        profile.subscription_plan,
                        amount,
                        currency
                    ).catch(err => console.error('Error sending Slack subscription notification:', err));
                }
            }
            break;
        }

        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Body parsing middleware (after Stripe webhook)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Health Check
app.get('/', (req, res) => {
    res.send('Agent IA SEO Backend is running 🚀');
});

// Incoming SMS Webhook
app.post('/incoming-sms', async (req, res) => {
    try {
        const { Body, From, To } = req.body;
        console.log(`Received SMS from ${From}: ${Body}`);

        // 0. Check for STOP keywords (RGPD opt-out)
        const optOutCheck = await blacklistService.processMessageForOptOut(supabase, From, Body, null);
        if (optOutCheck.isOptOut) {
            console.log(`Opt-out detected from ${From}: "${optOutCheck.keyword}"`);
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message(optOutCheck.response);
            return res.type('text/xml').send(twiml.toString());
        }

        // 1. Fetch Agent Config
        const agentConfig = await agentService.getAgentConfig(To);

        if (!agentConfig) {
            console.warn('No agent config found. Sending default response.');
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message("Le service n'est pas configuré pour le moment.");
            return res.type('text/xml').send(twiml.toString());
        }

        // 2. Get full agent config from profile for schedule and behavior settings
        // Using global supabase client
        
        // 2b. Fetch Contact to get agent_id
        const { data: contact } = await supabase
            .from('contacts')
            .select('*')
            .eq('phone', From)
            .single();

        // Get agent_id from contact (to separate conversations by user/company)
        const agentId = contact?.agent_id || null;

        // Check if number is blacklisted for this agent
        if (agentId) {
            const blacklistCheck = await blacklistService.isBlacklisted(supabase, From, agentId);
            if (blacklistCheck.blacklisted) {
                console.log(`Blacklisted number ${From} tried to message. Ignoring.`);
                const twiml = new twilio.twiml.MessagingResponse();
                // Don't respond to blacklisted numbers (silent ignore)
                return res.type('text/xml').send(twiml.toString());
            }
        }

        // Fetch full agent settings including schedule
        let fullAgentConfig = agentConfig;
        if (agentId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('agent_config')
                .eq('id', agentId)
                .single();
            
            if (profile?.agent_config) {
                fullAgentConfig = { ...agentConfig, ...profile.agent_config };
            }
        }

        // 3. Check if within operating hours
        const schedule = fullAgentConfig.schedule;
        const isWithinSchedule = scheduleService.isWithinSchedule(schedule);
        
        if (!isWithinSchedule) {
            console.log(`Outside schedule hours. Message from ${From} will be queued.`);
            // Save message but send auto-reply
            await historyService.saveMessage(From, 'user', Body, agentId);
            
            const twiml = new twilio.twiml.MessagingResponse();
            const outOfHoursMessage = fullAgentConfig.outOfHoursMessage || 
                `Merci pour votre message ! Notre équipe est disponible du lundi au vendredi de ${schedule?.startTime || '09:00'} à ${schedule?.endTime || '18:00'}. Nous vous répondrons dès que possible.`;
            twiml.message(outOfHoursMessage);
            return res.type('text/xml').send(twiml.toString());
        }

        // 4. Save User Message (with agent_id)
        await historyService.saveMessage(From, 'user', Body, agentId);

        // 5. Fetch History (filtered by agent_id)
        const history = await historyService.getHistory(From, agentId);

        // 6. Generate AI Response
        const { content: aiResponse } = await openaiService.generateResponse(fullAgentConfig, Body, history, contact);
        console.log(`AI Response: ${aiResponse}`);

        // 7. Check behavior mode and apply delay if needed
        const behaviorMode = fullAgentConfig.behaviorMode || 'assistant';
        const responseDelay = fullAgentConfig.responseDelay || 2;
        const delayMs = scheduleService.calculateResponseDelay(behaviorMode, responseDelay);

        if (delayMs > 0) {
            // For human mode, we need to respond to Twilio immediately (empty response)
            // Then send the actual SMS after the delay
            console.log(`Human mode: Scheduling response in ${Math.round(delayMs/1000)}s`);
            
            // Schedule delayed response
            setTimeout(async () => {
                try {
                    // Save AI Response
                    await historyService.saveMessage(From, 'assistant', aiResponse, agentId);
                    
                    // Send SMS via Twilio API (not TwiML since we already responded)
                    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                    await twilioClient.messages.create({
                        body: aiResponse,
                        from: To, // Use the same number that received the message
                        to: From
                    });
                    console.log(`Delayed response sent to ${From}`);
                    
                    // Run async tasks (scoring, qualification, intelligence)
                    runAsyncTasks(From, agentId, fullAgentConfig, history, Body);
                } catch (err) {
                    console.error('Error sending delayed response:', err);
                }
            }, delayMs);

            // Send empty TwiML response immediately
        const twiml = new twilio.twiml.MessagingResponse();
            res.type('text/xml').send(twiml.toString());
        } else {
            // Assistant mode: Respond immediately
            await historyService.saveMessage(From, 'assistant', aiResponse, agentId);
            
            // Run async tasks with intelligence
            runAsyncTasks(From, agentId, fullAgentConfig, history, Body);

            // Send Response via Twilio XML (TwiML)
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message(aiResponse);
        res.type('text/xml').send(twiml.toString());
        }

    } catch (error) {
        console.error('Error processing SMS:', error);
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message("Désolé, une erreur est survenue.");
        res.type('text/xml').send(twiml.toString());
    }
});

// Helper function for async tasks (scoring, qualification, webhook, intelligence)
async function runAsyncTasks(phone, agentId, agentConfig, history, lastUserMessage) {
    try {
        // Using global supabase client

        // Get existing contact
        const { data: contact } = await supabase
            .from('contacts')
            .select('*')
            .eq('phone', phone)
            .eq('agent_id', agentId)
            .single();

        const existingContext = contact?.extracted_context || {};

        // 1. INTELLIGENCE ANALYSIS - Extract context, detect intent, calculate score
        console.log(`[Intelligence] Analyzing message from ${phone}...`);
        const analysis = await intelligenceService.analyzeMessage(
            lastUserMessage,
            history,
            existingContext,
            agentConfig
        );

        console.log(`[Intelligence] Intent: ${analysis.intent.primary_intent}, Score: ${analysis.score.score}`);

        // 2. UPDATE CONTACT with extracted information and score
        const updateData = {
            score: analysis.score.score,
            score_reason: analysis.score.breakdown ? 
                `B:${analysis.score.breakdown.budget?.score || 0} A:${analysis.score.breakdown.authority?.score || 0} N:${analysis.score.breakdown.need?.score || 0} T:${analysis.score.breakdown.timing?.score || 0}` :
                analysis.score.recommended_next_step,
            extracted_context: analysis.context.fullContext,
            last_intent: analysis.intent.primary_intent,
            qualification_status: analysis.score.qualification_status,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Update contact name if extracted
        if (analysis.context.newInfo?.name && !contact?.name) {
            updateData.name = analysis.context.newInfo.name;
        }
        if (analysis.context.newInfo?.company && !contact?.company_name) {
            updateData.company_name = analysis.context.newInfo.company;
        }
        if (analysis.context.newInfo?.job_title && !contact?.job_title) {
            updateData.job_title = analysis.context.newInfo.job_title;
        }

        await supabase
            .from('contacts')
            .update(updateData)
            .eq('phone', phone)
            .eq('agent_id', agentId);

        // 3. CHECK ESCALATION
        if (analysis.escalation.should_escalate) {
            console.log(`[Escalation] Lead ${phone} should be escalated: ${analysis.escalation.reason}`);
            
            // Create escalation notification
            await supabase
                .from('notifications')
                .insert({
                    user_id: agentId,
                    type: 'escalation',
                    title: `🚨 Escalade requise: ${contact?.name || phone}`,
                    message: analysis.escalation.reason,
                    data: {
                        phone,
                        urgency: analysis.escalation.urgency,
                        escalation_type: analysis.escalation.escalation_type,
                        internal_note: analysis.escalation.internal_note
                    },
                    read: false,
                    created_at: new Date().toISOString()
                });

            // Update contact status
            await supabase
                .from('contacts')
                .update({ 
                    status: 'escalated',
                    escalation_reason: analysis.escalation.reason
                })
                .eq('phone', phone)
                .eq('agent_id', agentId);
        }

        // 4. QUALIFICATION CHECK
        if (analysis.score.score >= 70) {
            console.log(`[Qualified] Lead ${phone} qualified with score ${analysis.score.score}!`);
            
            // Trigger webhook if configured
            if (agentConfig.webhook_url) {
                await webhookService.triggerWebhook(agentConfig.webhook_url, {
                    phone: phone,
                    score: analysis.score.score,
                    qualification_status: analysis.score.qualification_status,
                    context: analysis.context.fullContext,
                    recommended_action: analysis.score.recommended_next_step,
                    history: history.slice(-10)
                });
            }

            // Send email notification to user
            try {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('email, email_notifications')
                    .eq('id', agentId)
                    .single();

                if (userProfile?.email && userProfile.email_notifications !== false) {
                    // Get contact details
                    const { data: contactData } = await supabase
                        .from('contacts')
                        .select('*')
                        .eq('phone', phone)
                        .eq('agent_id', agentId)
                        .single();

                    await emailService.sendQualifiedLeadNotification(
                        userProfile.email,
                        contactData || { phone, name: analysis.context.fullContext?.name || 'Contact' },
                        analysis.score.score,
                        {
                            reason: analysis.score.recommended_next_step,
                            budget: analysis.context.fullContext?.budget
                        }
                    );
                }
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
            }

            // Update status
            await supabase
                .from('contacts')
                .update({ status: 'qualified' })
                .eq('phone', phone)
                .eq('agent_id', agentId);
        }

        // 5. LOG HOT LEAD NOTIFICATION
        if (analysis.score.qualification_status === 'hot') {
            await supabase
                .from('notifications')
                .insert({
                    user_id: agentId,
                    type: 'hot_lead',
                    title: `🔥 Lead chaud: ${contact?.name || phone}`,
                    message: `Score: ${analysis.score.score}/100. ${analysis.score.recommended_next_step}`,
                    data: { phone, score: analysis.score.score },
                    read: false,
                    created_at: new Date().toISOString()
                });
        }

        console.log(`[Intelligence] Analysis complete for ${phone}`);

    } catch (error) {
        console.error('Error in async tasks:', error);
    }
}

// Import Leads Endpoint
app.post('/import-leads', async (req, res) => {
    try {
        const { leads, agentId, sendInitialSms } = req.body;
        console.log(`Importing ${leads.length} leads for agent ${agentId}`);

        if (!leads || !agentId) {
            return res.status(400).json({ error: 'Missing leads or agentId' });
        }

        // 1. Fetch Agent Config
        const agentConfig = await agentService.getAgentConfigById(agentId);
        if (!agentConfig) {
            return res.status(404).json({ error: 'Agent config not found' });
        }

        const results = [];

        // 2. Process Leads
        for (const lead of leads) {
            // Insert into Supabase 'contacts' is done by Frontend for now (or could be done here)
            // Assuming Frontend did the insert, we just handle the SMS.
            // BUT, to be safe and atomic, let's assume Frontend sends us the data to insert OR just to message.
            // The plan said "Inserts into contacts table". Let's do that here to be robust.

            // Actually, for MVP speed, let's assume Frontend inserts into Supabase (since it has the client)
            // and just calls this endpoint to trigger SMS. 
            // WAIT, the plan said: "Receives JSON list... Inserts into contacts table... Calls outboundService".
            // So I should do the insert here.

            // However, I need the supabase client here. agentService has it.
            // Let's just do the SMS part here for now to keep it simple, 
            // OR import supabase here. agentService has it private.
            // Let's stick to: Frontend inserts, Backend sends SMS.
            // It's cleaner for RLS if Frontend does it (user context).
            // So this endpoint is purely "Trigger Outbound Campaign".

            if (sendInitialSms) {
                const success = await outboundService.sendInitialMessage(lead, agentConfig);
                results.push({ phone: lead.phone, success });
            }
        }

        res.json({ success: true, results });

    } catch (error) {
        console.error('Error importing leads:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Inbound Lead Webhook
app.post('/webhooks/:agentId/leads', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { name, phone, ...extraData } = req.body; // Capture all other fields

        // Normalize keys to snake_case for Supabase
        const normalizedData = {};
        for (const key in extraData) {
            const lowerKey = key.toLowerCase();
            // Simple mapping for common variations
            if (lowerKey === 'source') normalizedData.source = extraData[key];
            else if (lowerKey === 'company' || lowerKey === 'company name' || lowerKey === 'company_name') normalizedData.company_name = extraData[key];
            else if (lowerKey === 'job' || lowerKey === 'job title' || lowerKey === 'job_title') normalizedData.job_title = extraData[key];
            else if (lowerKey === 'email') normalizedData.email = extraData[key];
            else if (lowerKey === 'budget' || lowerKey === 'budget range') normalizedData.budget_range = extraData[key];
            else normalizedData[key.toLowerCase().replace(/\s+/g, '_')] = extraData[key]; // Fallback: lowercase and snake_case
        }

        console.log(`Received inbound lead for agent ${agentId}: ${name} (${phone})`);

        if (!name || !phone) {
            return res.status(400).json({ error: 'Missing name or phone' });
        }

        // 1. Fetch Agent Config
        const agentConfig = await agentService.getAgentConfigById(agentId);
        if (!agentConfig) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // 2. Score Lead (if criteria exists)
        let scoreData = { score: 0, reason: '' };
        console.log('Scoring Criteria:', agentConfig.scoring_criteria);
        if (agentConfig.scoring_criteria) {
            scoreData = await openaiService.scoreNewLead({ name, phone, ...normalizedData }, agentConfig.scoring_criteria);
            console.log('Score Result:', scoreData);
        } else {
            console.log('No scoring criteria found.');
        }

        // 3. Create Contact
        const contactService = require('./services/contactService');
        const contact = await contactService.createContact(agentId, name, phone, {
            ...normalizedData,
            score: scoreData.score,
            score_reason: scoreData.reason
        });

        // 3. Send Initial SMS
        const success = await outboundService.sendInitialMessage(contact, agentConfig);

        res.json({
            success: true,
            contactId: contact.id,
            smsSent: success
        });

    } catch (error) {
        console.error('Error processing inbound lead:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Generate Agent Templates Endpoint
app.post('/api/generate-templates', async (req, res) => {
    try {
        const { companyName, website, description } = req.body;
        if (!companyName && !website && !description) {
            return res.status(400).json({ error: 'Missing business info' });
        }

        console.log('Generating templates for:', companyName);
        const templates = await openaiService.generateAgentTemplates({ companyName, website, description });
        res.json({ templates });

    } catch (error) {
        console.error('Error generating templates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Onboarding V2 Endpoints

app.post('/api/onboarding/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'Missing URL' });
        const result = await openaiService.analyzeBusiness(url);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing business:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/onboarding/generate-persona', async (req, res) => {
    try {
        const { businessType } = req.body;
        if (!businessType) return res.status(400).json({ error: 'Missing businessType' });
        const result = await openaiService.generatePersona(businessType);
        res.json(result);
    } catch (error) {
        console.error('Error generating persona:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/onboarding/simulate', async (req, res) => {
    try {
        const { businessType, tone } = req.body;
        if (!businessType) return res.status(400).json({ error: 'Missing parameters' });
        const result = await openaiService.simulateConversation(businessType, tone || 'Professional');
        res.json({ conversation: result });
    } catch (error) {
        console.error('Error simulating conversation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create/Update Agent Configuration
app.post('/api/agents/create', async (req, res) => {
    try {
        const { userId, agentConfig, onboardingData } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Using global supabase client

        // Build complete agent configuration
        const fullConfig = {
            // Agent Identity
            name: agentConfig?.name || onboardingData?.agentPersona?.name || 'Agent IA',
            role: agentConfig?.role || onboardingData?.agentPersona?.role || 'Assistant Commercial',
            company: onboardingData?.companyName || onboardingData?.businessType || 'Mon Entreprise',
            
            // Behavior
            tone: agentConfig?.tone || 50,
            politeness: agentConfig?.politeness || 'vous',
            behaviorMode: agentConfig?.behaviorMode || onboardingData?.behaviorMode || 'assistant',
            responseDelay: agentConfig?.responseDelay || onboardingData?.responseDelay || 2,
            
            // Schedule (operating hours)
            schedule: agentConfig?.schedule || onboardingData?.schedule || {
                startTime: '09:00',
                endTime: '18:00',
                days: ['L', 'M', 'Me', 'J', 'V']
            },
            
            // Context & Goals
            context: agentConfig?.context || onboardingData?.valueProposition || '',
            goal: onboardingData?.goal || 'qualify',
            
            // ICP Data
            icp: {
                sector: onboardingData?.icpSector || '',
                size: onboardingData?.icpSize || '',
                decider: onboardingData?.icpDecider || '',
                budget: onboardingData?.icpBudget || ''
            },
            
            // Qualification
            quality_criteria: onboardingData?.qualificationCriteria?.map((c, i) => ({
                id: i,
                text: typeof c === 'string' ? c : c.text,
                type: 'must_have'
            })) || [],
            
            // Pain Points & Needs
            painPoints: onboardingData?.painPoints || [],
            needs: onboardingData?.needs || [],
            objections: onboardingData?.objections || [],
            
            // Products/Services
            products: onboardingData?.products || [],
            faqs: onboardingData?.faqs || [],
            
            // Channels & CRM
            channels: onboardingData?.channels || { sms: true, whatsapp: false },
            crm: onboardingData?.crm || null,
            
            // Calendar URL for booking
            calendarUrl: agentConfig?.calendarUrl || onboardingData?.calendarUrl || null,
            
            // Metadata
            businessType: onboardingData?.businessType || '',
            website: onboardingData?.website || '',
            language: onboardingData?.language || 'Français',
            country: onboardingData?.country || 'France',
            
            // Agent Persona
            agentPersona: onboardingData?.agentPersona || null,
            selectedAgentId: onboardingData?.selectedAgentId || null,
            
            // Timestamps
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Generate scoring criteria text from quality criteria
        const scoringCriteria = fullConfig.quality_criteria
            .map(c => `- ${c.text}`)
            .join('\n');

        // Generate first message template
        const firstMessageTemplate = onboardingData?.agentPersona?.firstMessage || 
            `Bonjour {{name}}, merci pour votre intérêt ! Je suis ${fullConfig.name}, ${fullConfig.role} chez ${fullConfig.company}. Comment puis-je vous aider ?`;

        // Update profile in Supabase
        const { data, error } = await supabase
            .from('profiles')
            .update({
                agent_config: fullConfig,
                first_message_template: firstMessageTemplate,
                scoring_criteria: scoringCriteria,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error saving agent config:', error);
            return res.status(500).json({ error: 'Failed to save agent configuration', details: error.message });
        }

        console.log(`Agent created/updated for user ${userId}`);
        
        res.json({
            success: true,
            agentId: userId,
            config: fullConfig,
            webhookUrl: `https://api.agentiaseo.com/webhooks/${userId}/leads`
        });

    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Agent Configuration
app.get('/api/agents/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client

        const { data, error } = await supabase
            .from('profiles')
            .select('agent_config, first_message_template, scoring_criteria, onboarding_completed')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({
            agentConfig: data.agent_config,
            firstMessageTemplate: data.first_message_template,
            scoringCriteria: data.scoring_criteria,
            onboardingCompleted: data.onboarding_completed
        });

    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// STRIPE INTEGRATION
// =============================================================================

// Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
        const { userId, userEmail, planId, priceId, trialDays, promoCode, successUrl, cancelUrl } = req.body;

        console.log('Stripe checkout request:', { userId, userEmail, planId, priceId, trialDays, promoCode });

        if (!userId || !planId || !priceId) {
            console.error('Missing required fields:', { userId, planId, priceId });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is not configured');
            return res.status(500).json({ error: 'Stripe is not configured on the server' });
        }

        // Coupon ID for -50% (EARLYBIRD50) - create in Stripe Dashboard
        // Le coupon est toujours appliqué automatiquement pour l'offre de lancement
        const earlyBirdCouponId = process.env.STRIPE_EARLYBIRD_COUPON_ID || null;
        const shouldApplyCoupon = earlyBirdCouponId ? true : false; // Toujours appliquer si le coupon existe
        console.log('Applying coupon:', shouldApplyCoupon ? earlyBirdCouponId : 'none (no coupon ID configured)');

        const sessionConfig = {
            customer_email: userEmail,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: trialDays || 7,
                metadata: {
                    userId: userId,
                    planId: planId
                }
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: userId,
                planId: planId,
                promoCode: promoCode || ''
            }
        };

        // Apply early bird coupon if promo code is valid
        if (shouldApplyCoupon) {
            try {
                // Verify coupon exists before adding it
                await stripe.coupons.retrieve(earlyBirdCouponId);
                sessionConfig.discounts = [{
                    coupon: earlyBirdCouponId
                }];
            } catch (couponError) {
                console.warn('Coupon not found or invalid, proceeding without discount:', couponError.message);
                // Continue without the coupon
            }
        }

        console.log('Creating Stripe session with config:', JSON.stringify(sessionConfig, null, 2));
        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log('Stripe session created:', session.id);
        res.json({ url: session.url, sessionId: session.id });

    } catch (error) {
        console.error('Stripe checkout error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ 
            error: error.message,
            type: error.type || 'unknown',
            code: error.code || 'unknown'
        });
    }
});

// Create Stripe Customer Portal session
app.post('/api/stripe/create-portal-session', async (req, res) => {
    try {
        const { userId, returnUrl } = req.body;

        // Using global supabase client

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (!profile?.stripe_customer_id) {
            return res.status(400).json({ error: 'No Stripe customer found' });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl
        });

        res.json({ url: portalSession.url });

    } catch (error) {
        console.error('Portal session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// =============================================================================
// PLAYGROUND API - Test agent responses in onboarding
// =============================================================================

app.post('/api/playground/test', async (req, res) => {
    try {
        const { message, conversationHistory, agentConfig } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build context from agent config
        const systemPrompt = buildPlaygroundPrompt(agentConfig);
        
        // Format conversation history for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.forEach(msg => {
                messages.push({
                    role: msg.sender === 'lead' ? 'user' : 'assistant',
                    content: msg.text
                });
            });
        }

        // Add the new user message
        messages.push({ role: 'user', content: message });

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 200,
            temperature: 0.7
        });

        const agentResponse = completion.choices[0].message.content;

        res.json({ 
            response: agentResponse,
            success: true 
        });

    } catch (error) {
        console.error('Playground error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// Build prompt for playground testing
function buildPlaygroundPrompt(config) {
    const agentName = config?.agentName || 'Assistant Commercial';
    const company = config?.company || 'notre entreprise';
    const firstMessage = config?.firstMessage || 'Bonjour ! Comment puis-je vous aider ?';
    const behaviorMode = config?.behaviorMode || 'assistant';
    const goal = config?.goal || 'qualify';

    let goalInstructions = '';
    switch (goal) {
        case 'qualify':
            goalInstructions = `🎯 OBJECTIF : QUALIFIER LE LEAD
Tu dois découvrir ces 4 éléments (BANT) :
1. BUDGET : "Vous avez une enveloppe en tête ?"
2. AUTORITÉ : "C'est vous qui décidez ?"
3. BESOIN : "C'est quoi votre problème principal ?"
4. TIMING : "C'est urgent ? Vous voulez avancer quand ?"

FLOW : Accueil → Besoin → Contexte → Budget → Timing → Si qualifié, propose un RDV`;
            break;
        case 'book':
            goalInstructions = `🎯 OBJECTIF : BOOKER UN RDV RAPIDEMENT
Tu es un BOOKING ASSISTANT. Ta mission est de CONVERTIR en RDV.

STRATÉGIE :
- DÈS le 2ème ou 3ème message, propose un RDV
- Donne des créneaux concrets : "Demain 14h ou jeudi 10h ?"
- Si hésitation, insiste gentiment : "15 min suffisent pour voir si on peut vous aider"
- Ne fais pas de longue qualification, va droit au but

PHRASES CLÉS :
- "Je peux vous proposer demain à 14h, ça vous va ?"
- "On se cale un call rapide de 15 min ?"
- "J'ai un créneau dispo cette semaine, vous préférez quel jour ?"

⚠️ Tu dois PROPOSER UN RDV dans tes 3 premiers messages.`;
            break;
        case 'expert':
        case 'support':
            goalInstructions = `🎯 OBJECTIF : CONSEILLER ET ORIENTER
Tu es un EXPERT ADVISOR. Tu guides vers la bonne solution.

STRATÉGIE :
- Écoute le besoin technique
- Pose des questions précises
- Propose des solutions adaptées
- Si complexe, suggère un appel avec un expert`;
            break;
        case 'nurture':
            goalInstructions = `🎯 OBJECTIF : NOURRIR LA RELATION
Pas de pression, juste de la valeur et des conseils utiles.`;
            break;
        case 'reactivate':
            goalInstructions = `🎯 OBJECTIF : RÉACTIVER UN ANCIEN LEAD
Rappelle la relation passée, demande ce qui a changé, propose quelque chose de nouveau.`;
            break;
        default:
            goalInstructions = `Ton objectif est de qualifier ce lead et comprendre ses besoins.`;
    }

    let behaviorInstructions = '';
    if (behaviorMode === 'human') {
        behaviorInstructions = `🚨 MODE HUMAIN :
- Tu es un VRAI humain, pas une IA
- Si on demande "Es-tu un robot ?" → "Non, je suis ${agentName} de ${company} 😊"
- Expressions naturelles : "ah", "hmm", "en fait", "du coup"
- Sois chaleureux et empathique`;
    } else {
        behaviorInstructions = `Tu es un assistant IA professionnel et transparent.`;
    }

    return `Tu es ${agentName}, commercial pour ${company}.

${behaviorInstructions}

${goalInstructions}

📱 RÈGLES SMS :
1. Messages COURTS (max 160 caractères)
2. UNE SEULE question par message
3. Langage naturel et conversationnel
4. Un emoji occasionnel (pas systématique)
5. Avance vers ton objectif à chaque message

C'est une SIMULATION DE TEST. Réponds comme en vrai conversation SMS.

Message d'accueil de référence : "${firstMessage}"`;
}

// =============================================================================
// NOTIFICATIONS API
// =============================================================================

// Get notifications for a user
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client

        // Get hot leads (score > 80) from last 24h
        const { data: hotLeads } = await supabase
            .from('contacts')
            .select('id, name, score, created_at')
            .eq('agent_id', userId)
            .gte('score', 80)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(5);

        // Get recent messages (last 1h)
        const { data: recentMessages } = await supabase
            .from('messages')
            .select('id, phone_number, content, created_at')
            .eq('agent_id', userId)
            .eq('role', 'user')
            .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(5);

        // Get inactive leads (no response in 48h)
        const { data: inactiveLeads } = await supabase
            .from('contacts')
            .select('id, name, updated_at')
            .eq('agent_id', userId)
            .lt('updated_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
            .is('score', null)
            .limit(10);

        // Build notifications
        const notifications = [];

        // Hot lead notifications
        (hotLeads || []).forEach(lead => {
            notifications.push({
                id: `hot-${lead.id}`,
                type: 'hot_lead',
                title: '🔥 Lead chaud !',
                message: `${lead.name} vient d'être qualifié (Score: ${lead.score})`,
                time: getRelativeTime(lead.created_at),
                read: false,
                priority: 'high'
            });
        });

        // Recent reply notifications
        (recentMessages || []).forEach(msg => {
            notifications.push({
                id: `msg-${msg.id}`,
                type: 'reply',
                title: '💬 Nouvelle réponse',
                message: `${msg.content.substring(0, 50)}...`,
                time: getRelativeTime(msg.created_at),
                read: false,
                priority: 'medium'
            });
        });

        // Inactive leads warning
        if ((inactiveLeads || []).length > 0) {
            notifications.push({
                id: 'inactive-warning',
                type: 'warning',
                title: '⚠️ Inactivité détectée',
                message: `${inactiveLeads.length} lead(s) n'ont pas répondu depuis 48h`,
                time: 'Action requise',
                read: false,
                priority: 'low'
            });
        }

        // Sort by priority and time
        notifications.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        res.json({ notifications });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Helper function for relative time
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
}

// =============================================================================
// TEMPLATES API
// =============================================================================

// Get all templates (default + custom)
app.get('/api/templates/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client
        
        const templates = await templateService.getAllTemplates(supabase, userId);
        res.json(templates);
    } catch (error) {
        console.error('Error getting templates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get templates by category
app.get('/api/templates/category/:category', (req, res) => {
    try {
        const { category } = req.params;
        const templates = templateService.getTemplatesByCategory(category);
        res.json(templates);
    } catch (error) {
        console.error('Error getting templates by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create custom template
app.post('/api/templates/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const templateData = req.body;
        
        // Using global supabase client
        
        const template = await templateService.createTemplate(supabase, userId, templateData);
        res.json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete custom template
app.delete('/api/templates/:userId/:templateId', async (req, res) => {
    try {
        const { userId, templateId } = req.params;
        
        // Using global supabase client
        
        await templateService.deleteTemplate(supabase, templateId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Preview template with variables
app.post('/api/templates/preview', (req, res) => {
    try {
        const { template, variables } = req.body;
        const preview = templateService.replaceVariables(template, variables);
        res.json({ preview });
    } catch (error) {
        console.error('Error previewing template:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// TAGS & SEGMENTS API
// =============================================================================

// Get all tags
app.get('/api/tags/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client
        
        const tags = await tagService.getAllTags(supabase, userId);
        res.json(tags);
    } catch (error) {
        console.error('Error getting tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create custom tag
app.post('/api/tags/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const tagData = req.body;
        
        // Using global supabase client
        
        const tag = await tagService.createTag(supabase, userId, tagData);
        res.json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete custom tag
app.delete('/api/tags/:userId/:tagId', async (req, res) => {
    try {
        const { userId, tagId } = req.params;
        
        // Using global supabase client
        
        await tagService.deleteTag(supabase, tagId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add tag to contact
app.post('/api/contacts/:contactId/tags/:tagId', async (req, res) => {
    try {
        const { contactId, tagId } = req.params;
        
        // Using global supabase client
        
        await tagService.addTagToContact(supabase, contactId, tagId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Remove tag from contact
app.delete('/api/contacts/:contactId/tags/:tagId', async (req, res) => {
    try {
        const { contactId, tagId } = req.params;
        
        // Using global supabase client
        
        await tagService.removeTagFromContact(supabase, contactId, tagId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get segments
app.get('/api/segments', (req, res) => {
    try {
        const segments = tagService.getDefaultSegments();
        res.json(segments);
    } catch (error) {
        console.error('Error getting segments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get contacts by segment
app.get('/api/segments/:segmentId/contacts/:userId', async (req, res) => {
    try {
        const { segmentId, userId } = req.params;
        
        // Using global supabase client
        
        const contacts = await tagService.getSegmentContacts(supabase, userId, segmentId);
        res.json({ contacts, count: contacts.length });
    } catch (error) {
        console.error('Error getting segment contacts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// BLACKLIST / RGPD API
// =============================================================================

// Get blacklist
app.get('/api/blacklist/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client
        
        const blacklist = await blacklistService.getBlacklist(supabase, userId);
        const stats = await blacklistService.getStats(supabase, userId);
        
        res.json({ blacklist, stats });
    } catch (error) {
        console.error('Error getting blacklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Check if phone is blacklisted
app.get('/api/blacklist/:userId/check/:phone', async (req, res) => {
    try {
        const { userId, phone } = req.params;
        
        // Using global supabase client
        
        const result = await blacklistService.isBlacklisted(supabase, phone, userId);
        res.json(result);
    } catch (error) {
        console.error('Error checking blacklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add to blacklist
app.post('/api/blacklist/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { phone, reason } = req.body;
        
        // Using global supabase client
        
        const result = await blacklistService.addToBlacklist(supabase, phone, userId, reason, 'manual');
        res.json(result);
    } catch (error) {
        console.error('Error adding to blacklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Remove from blacklist
app.delete('/api/blacklist/:userId/:phone', async (req, res) => {
    try {
        const { userId, phone } = req.params;
        
        // Using global supabase client
        
        await blacklistService.removeFromBlacklist(supabase, phone, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing from blacklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Bulk import blacklist
app.post('/api/blacklist/:userId/import', async (req, res) => {
    try {
        const { userId } = req.params;
        const { phoneNumbers, reason } = req.body;
        
        // Using global supabase client
        
        const result = await blacklistService.bulkImport(supabase, userId, phoneNumbers, reason);
        res.json(result);
    } catch (error) {
        console.error('Error importing blacklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export blacklist (GDPR)
app.get('/api/blacklist/:userId/export', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client
        
        const data = await blacklistService.exportBlacklist(supabase, userId);
        res.json(data);
    } catch (error) {
        console.error('Error exporting blacklist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// FOLLOW-UP API
// =============================================================================

// Get contacts needing follow-up
app.get('/api/follow-ups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client
        
        const contacts = await followUpService.getContactsNeedingFollowUp(supabase, userId);
        
        res.json({ 
            count: contacts.length,
            contacts: contacts.map(c => ({
                id: c.contact.id,
                name: c.contact.name,
                phone: c.contact.phone,
                daysSinceLastMessage: c.daysSinceLastMessage,
                followUpNumber: c.followUpNumber,
                reason: c.reason
            }))
        });
    } catch (error) {
        console.error('Error getting follow-ups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Trigger follow-ups for a user
app.post('/api/follow-ups/:userId/send', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Using global supabase client
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        // Get agent config
        const { data: profile } = await supabase
            .from('profiles')
            .select('agent_config')
            .eq('id', userId)
            .single();
        
        const agentConfig = profile?.agent_config || {};
        
        const results = await followUpService.processUserFollowUps(
            supabase,
            twilioClient,
            userId,
            agentConfig
        );
        
        res.json(results);
    } catch (error) {
        console.error('Error sending follow-ups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// INTELLIGENCE API - Analyze messages on demand
// =============================================================================

// Analyze a specific conversation
app.post('/api/intelligence/analyze', async (req, res) => {
    try {
        const { message, conversationHistory, existingContext, agentConfig } = req.body;
        
        const analysis = await intelligenceService.analyzeMessage(
            message,
            conversationHistory || [],
            existingContext || {},
            agentConfig || {}
        );
        
        res.json(analysis);
    } catch (error) {
        console.error('Error in intelligence analysis:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get contact intelligence summary
app.get('/api/intelligence/contact/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        
        // Using global supabase client
        
        const { data: contact, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
            .single();
        
        if (error || !contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json({
            contact: {
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                company: contact.company_name,
                job_title: contact.job_title
            },
            intelligence: {
                score: contact.score,
                score_breakdown: contact.score_reason,
                qualification_status: contact.qualification_status,
                last_intent: contact.last_intent,
                extracted_context: contact.extracted_context || {},
                escalation_reason: contact.escalation_reason
            }
        });
    } catch (error) {
        console.error('Error getting contact intelligence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// ANALYTICS API
// =============================================================================

// Get analytics data for dashboard
app.get('/api/analytics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { range = '7d' } = req.query;
        
        // Using global supabase client

        // Calculate date range
        let daysAgo = 7;
        if (range === '30d') daysAgo = 30;
        if (range === '90d') daysAgo = 90;
        const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

        // Fetch contacts in range
        const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .eq('agent_id', userId)
            .gte('created_at', startDate);

        // Fetch messages in range
        const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('agent_id', userId)
            .gte('created_at', startDate);

        // Calculate metrics
        const total = (contacts || []).length;
        const qualified = (contacts || []).filter(c => c.score >= 70).length;
        const disqualified = (contacts || []).filter(c => c.score !== null && c.score < 30).length;
        const scoredContacts = (contacts || []).filter(c => c.score !== null);
        const avgScore = scoredContacts.length > 0
            ? Math.round(scoredContacts.reduce((acc, c) => acc + c.score, 0) / scoredContacts.length)
            : 0;

        const messagesSent = (messages || []).filter(m => m.role === 'assistant').length;
        const messagesReceived = (messages || []).filter(m => m.role === 'user').length;
        const responseRate = messagesSent > 0 ? Math.round((messagesReceived / messagesSent) * 100) : 0;

        // Source performance
        const sourceMap = {};
        (contacts || []).forEach(c => {
            const source = c.source || 'Direct';
            if (!sourceMap[source]) sourceMap[source] = { leads: 0, qualified: 0 };
            sourceMap[source].leads++;
            if (c.score >= 70) sourceMap[source].qualified++;
        });

        const sourceData = Object.entries(sourceMap)
            .map(([source, data]) => ({
                source,
                leads: data.leads,
                qualified: data.qualified,
                rate: data.leads > 0 ? Math.round((data.qualified / data.leads) * 100) : 0
            }))
            .sort((a, b) => b.leads - a.leads)
            .slice(0, 5);

        // Daily breakdown
        const dailyMap = {};
        for (let i = daysAgo - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            dailyMap[key] = { leads: 0, qualified: 0 };
        }

        (contacts || []).forEach(c => {
            const key = new Date(c.created_at).toISOString().split('T')[0];
            if (dailyMap[key]) {
                dailyMap[key].leads++;
                if (c.score >= 70) dailyMap[key].qualified++;
            }
        });

        const trendData = Object.entries(dailyMap).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            leads: data.leads,
            qualified: data.qualified
        }));

        res.json({
            metrics: {
                total,
                qualified,
                disqualified,
                avgScore,
                qualificationRate: total > 0 ? Math.round((qualified / total) * 100) : 0,
                messagesSent,
                messagesReceived,
                responseRate
            },
            sourceData,
            trendData
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ==========================================================================
// NEW USER SIGNUP NOTIFICATION
// ==========================================================================

app.post('/api/notify/new-user', async (req, res) => {
    try {
        const { user } = req.body;
        
        if (!user || !user.email) {
            return res.status(400).json({ error: 'User data required' });
        }

        console.log(`New user signup notification requested for: ${user.email}`);
        
        const result = await emailService.notifyNewUserSignup(user);
        
        res.json({ 
            success: true, 
            message: 'Notifications sent',
            results: result
        });
    } catch (error) {
        console.error('Error sending new user notifications:', error);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});

// =============================================================================
// WORDPRESS INTEGRATION API
// =============================================================================

// Test WordPress connection
app.post('/api/wordpress/test-connection', async (req, res) => {
    try {
        const { siteUrl, username, appPassword } = req.body;

        if (!siteUrl || !username || !appPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL, nom d\'utilisateur et mot de passe requis' 
            });
        }

        console.log(`Testing WordPress connection to: ${siteUrl}`);
        const result = await wordpressService.testConnection(siteUrl, username, appPassword);
        
        res.json(result);
    } catch (error) {
        console.error('WordPress test connection error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save WordPress site connection
app.post('/api/wordpress/connect', async (req, res) => {
    try {
        const { userId, siteUrl, siteName, username, appPassword } = req.body;

        if (!userId || !siteUrl || !username || !appPassword) {
            return res.status(400).json({ error: 'Données de connexion manquantes' });
        }

        // First test the connection
        const testResult = await wordpressService.testConnection(siteUrl, username, appPassword);
        
        if (!testResult.success) {
            return res.status(400).json({ 
                success: false, 
                error: testResult.error 
            });
        }

        // Save to database
        const site = await wordpressService.saveSiteConnection(supabase, userId, {
            url: siteUrl,
            siteName: siteName || testResult.siteInfo?.url,
            username,
            appPassword
        });

        console.log(`WordPress site connected for user ${userId}: ${siteUrl}`);

        res.json({
            success: true,
            site: {
                id: site.id,
                url: site.site_url,
                name: site.site_name,
                platform: site.platform,
                status: site.status
            },
            user: testResult.user,
            capabilities: testResult.capabilities
        });
    } catch (error) {
        console.error('WordPress connect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get connected sites for a user
app.get('/api/sites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sites = await wordpressService.getConnectedSites(supabase, userId);
        res.json({ sites });
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a connected site
app.delete('/api/sites/:userId/:siteId', async (req, res) => {
    try {
        const { userId, siteId } = req.params;
        await wordpressService.deleteSiteConnection(supabase, userId, siteId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Publish article to WordPress
app.post('/api/wordpress/publish', async (req, res) => {
    try {
        const { userId, siteId, article } = req.body;

        if (!userId || !siteId || !article) {
            return res.status(400).json({ error: 'Données manquantes' });
        }

        // Get site from database
        const { data: site } = await supabase
            .from('connected_sites')
            .select('*')
            .eq('id', siteId)
            .eq('user_id', userId)
            .single();

        if (!site) {
            return res.status(404).json({ error: 'Site non trouvé' });
        }

        const result = await wordpressService.publishArticle({
            url: site.site_url,
            username: site.username,
            password_encrypted: site.password_encrypted
        }, article);

        if (result.success) {
            // Update last sync
            await supabase
                .from('connected_sites')
                .update({ last_sync: new Date().toISOString() })
                .eq('id', siteId);
        }

        res.json(result);
    } catch (error) {
        console.error('WordPress publish error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get WordPress categories
app.get('/api/wordpress/:siteId/categories', async (req, res) => {
    try {
        const { siteId } = req.params;
        const { userId } = req.query;

        const { data: site } = await supabase
            .from('connected_sites')
            .select('*')
            .eq('id', siteId)
            .eq('user_id', userId)
            .single();

        if (!site) {
            return res.status(404).json({ error: 'Site non trouvé' });
        }

        const categories = await wordpressService.getCategories({
            url: site.site_url,
            username: site.username,
            password_encrypted: site.password_encrypted
        });

        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// EXPERT REQUEST API - Free help for site connections
// =============================================================================

// Create expert request
// ============================================================================
// LEADS API - Funnel Meta Ads
// ============================================================================

app.post('/api/leads', async (req, res) => {
    try {
        const { email, source = 'meta', variant = 'A' } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Sauvegarder le lead dans Supabase
        const { data, error } = await supabase
            .from('leads')
            .insert({
                email: email.toLowerCase().trim(),
                source,
                variant,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            // Si l'email existe déjà, on retourne quand même un succès
            if (error.code === '23505') { // Duplicate key
                console.log(`Lead déjà existant: ${email}`);
                return res.json({ 
                    success: true, 
                    message: 'Lead enregistré',
                    existing: true 
                });
            }
            throw error;
        }

        console.log(`Nouveau lead enregistré: ${email} (source: ${source}, variant: ${variant})`);

        res.json({ 
            success: true, 
            message: 'Lead enregistré avec succès',
            lead: data
        });
    } catch (error) {
        console.error('Error saving lead:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'enregistrement du lead',
            details: error.message 
        });
    }
});

// ============================================================================
// PLAN EMAIL API - Send SEO plan by email
// ============================================================================

app.post('/api/plan/send', async (req, res) => {
    try {
        const { email, planId, keywords, calendar } = req.body;

        console.log('Plan send request received:', { 
            email: email ? email.substring(0, 10) + '...' : 'missing',
            planId,
            keywordsCount: keywords?.length || 0,
            calendarCount: calendar?.length || 0
        });

        if (!email || !email.includes('@')) {
            console.error('Invalid email provided');
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Valider et formater les mots-clés
        let formattedKeywords = [];
        if (Array.isArray(keywords) && keywords.length > 0) {
            formattedKeywords = keywords.map(kw => ({
                keyword: kw.keyword || kw,
                volume: kw.volume || 0,
                difficulty: kw.difficulty || 0
            }));
        } else {
            // Mots-clés par défaut
            formattedKeywords = [
                { keyword: 'marketing digital', volume: 12000, difficulty: 35 },
                { keyword: 'formation en ligne', volume: 8500, difficulty: 42 },
                { keyword: 'e-commerce', volume: 15000, difficulty: 55 }
            ];
        }

        // Calculer le nombre d'articles
        let articlesCount = 10;
        if (Array.isArray(calendar)) {
            const articlesInCalendar = calendar.filter(d => d.hasArticle || d.has_content);
            articlesCount = articlesInCalendar.length || 10;
        }

        const planData = {
            keywords: formattedKeywords.slice(0, 10), // Limiter à 10 mots-clés max
            articlesCount: articlesCount,
            duration: 30,
            calendar: calendar || []
        };

        console.log('Sending plan email with data:', {
            email: email.substring(0, 10) + '...',
            keywordsCount: planData.keywords.length,
            articlesCount: planData.articlesCount
        });

        // Envoyer l'email via emailService
        const emailResult = await emailService.sendPlanEmail(
            email.toLowerCase().trim(),
            planId || 'meta_funnel_plan',
            planData
        );

        if (!emailResult.success) {
            console.error('Error sending plan email:', emailResult.error || emailResult.reason);
            return res.status(500).json({ 
                error: 'Erreur lors de l\'envoi de l\'email',
                details: emailResult.error || emailResult.reason
            });
        }

        console.log(`Plan email sent successfully to: ${email} (Plan ID: ${planId})`);
        res.json({ success: true, message: 'Plan envoyé avec succès' });
    } catch (error) {
        console.error('Error processing plan send request:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message 
        });
    }
});

app.post('/api/expert-request', async (req, res) => {
    try {
        const { userId, platform, siteUrl, message, phone, name, email } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID requis' });
        }

        const result = await expertRequestService.createExpertRequest(supabase, userId, {
            type: 'site_connection',
            platform: platform || 'wordpress',
            siteUrl,
            message,
            phone,
            name,
            email
        });

        res.json(result);
    } catch (error) {
        console.error('Expert request error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la demande' });
    }
});

// Get user's expert requests
app.get('/api/expert-requests/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const requests = await expertRequestService.getUserRequests(supabase, userId);
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching expert requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// KEYWORD RESEARCH API
// =============================================================================

// Search keywords
app.post('/api/keywords/search', async (req, res) => {
    try {
        const { userId, keyword, country = 'fr', language = 'fr' } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        console.log(`Keyword search: "${keyword}" for user ${userId}`);

        const results = await keywordService.getKeywordData(keyword, country, language);

        // Log search if userId provided
        if (userId) {
            await keywordService.logKeywordSearch(supabase, userId, keyword, results.length);
        }

        res.json({
            success: true,
            keyword,
            count: results.length,
            results
        });
    } catch (error) {
        console.error('Keyword search error:', error);
        res.status(500).json({ error: 'Failed to search keywords' });
    }
});

// Analyze website and competitors to generate keyword suggestions
app.post('/api/keywords/analyze-competitors', async (req, res) => {
    try {
        const { websiteUrl, competitors = [] } = req.body;

        if (!websiteUrl) {
            return res.status(400).json({ error: 'Website URL is required' });
        }

        console.log(`Analyzing competitors for: ${websiteUrl} with ${competitors.length} competitors`);

        const result = await keywordService.analyzeCompetitors(websiteUrl, competitors);

        res.json(result);
    } catch (error) {
        console.error('Analyze competitors error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze competitors',
            message: error.message 
        });
    }
});

// ============================================================================
// FUNNEL CHECKOUT API - Create Stripe checkout for funnel (no auth required)
// ============================================================================

app.post('/api/funnel/checkout', async (req, res) => {
    try {
        const { email, planId = 'starter', source = 'meta_funnel' } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Verify Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is not configured');
            return res.status(500).json({ error: 'Stripe is not configured on the server' });
        }

        // Configuration des plans (utiliser les price IDs Stripe)
        // Price IDs par défaut pour le plan Starter à 29€ (test et production)
        const DEFAULT_STARTER_PRICE_ID = 'price_1SdY1tG7TquWCqOJA8uMm6RS'; // Plan Starter 29€
        const DEFAULT_PRO_PRICE_ID = 'price_1SdY29G7TquWCqOJ77Tya1j1'; // Plan Pro 49€
        
        const plans = {
            starter: {
                priceId: process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_TEST_PRICE_ID_STARTER || DEFAULT_STARTER_PRICE_ID,
                name: 'Starter',
                price: 29,
                trialDays: 7
            },
            pro: {
                priceId: process.env.STRIPE_PRICE_ID_PRO || process.env.STRIPE_TEST_PRICE_ID_PRO || DEFAULT_PRO_PRICE_ID,
                name: 'Pro',
                price: 49,
                trialDays: 7
            }
        };

        const selectedPlan = plans[planId] || plans.starter;
        
        console.log(`Using plan: ${selectedPlan.name} (${selectedPlan.price}€/mois) with priceId: ${selectedPlan.priceId}`);
        
        if (!selectedPlan.priceId) {
            console.error('Price ID not configured for plan:', planId);
            return res.status(500).json({ error: 'Plan non configuré - Price ID manquant' });
        }

        // URLs de redirection
        const frontendUrl = process.env.FRONTEND_URL || 'https://agent-seo.netlify.app';
        const successUrl = `${frontendUrl}/funnel/payment-success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${frontendUrl}/funnel/results`;

        // Coupon early bird si disponible
        const earlyBirdCouponId = process.env.STRIPE_EARLYBIRD_COUPON_ID || null;

        const sessionConfig = {
            customer_email: email.toLowerCase().trim(),
            payment_method_types: ['card'],
            line_items: [{
                price: selectedPlan.priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: selectedPlan.trialDays,
                metadata: {
                    planId: planId,
                    source: source,
                    funnel: 'meta_ads'
                }
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                planId: planId,
                source: source,
                funnel: 'meta_ads',
                email: email
            }
        };

        // Appliquer le coupon early bird si disponible
        // Note: On ne peut pas utiliser allow_promotion_codes ET discounts en même temps
        if (earlyBirdCouponId) {
            try {
                await stripe.coupons.retrieve(earlyBirdCouponId);
                sessionConfig.discounts = [{
                    coupon: earlyBirdCouponId
                }];
                console.log(`Applying early bird coupon: ${earlyBirdCouponId}`);
            } catch (couponError) {
                console.warn('Coupon not found, allowing promotion codes instead:', couponError.message);
                // Si le coupon n'existe pas, permettre les codes promo manuels
                sessionConfig.allow_promotion_codes = true;
            }
        } else {
            // Pas de coupon automatique, permettre les codes promo manuels
            sessionConfig.allow_promotion_codes = true;
        }

        console.log(`Creating Stripe checkout session for funnel: ${email} (plan: ${planId})`);
        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log(`Stripe checkout session created: ${session.id}`);
        res.json({ url: session.url, sessionId: session.id });

    } catch (error) {
        console.error('Funnel checkout error:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création de la session de paiement',
            message: error.message 
        });
    }
});

// ============================================================================
// FUNNEL ANALYSIS API - Analyze site for Meta Ads funnel
// ============================================================================

app.post('/api/funnel/analyze', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !url.trim()) {
            // Si pas d'URL, générer des mots-clés génériques basés sur des tendances
            const genericKeywords = [
                {
                    keyword: 'marketing digital',
                    volume: 12000,
                    difficulty: 35,
                    opportunity: 'Forte opportunité - faible concurrence',
                    intent: 'informational',
                    reason: 'Mot-clé générique à fort potentiel'
                },
                {
                    keyword: 'formation en ligne',
                    volume: 8500,
                    difficulty: 42,
                    opportunity: 'Potentiel de trafic élevé',
                    intent: 'commercial',
                    reason: 'Secteur en croissance avec bonne opportunité'
                },
                {
                    keyword: 'e-commerce',
                    volume: 15000,
                    difficulty: 55,
                    opportunity: 'Volume important - stratégie long terme',
                    intent: 'informational',
                    reason: 'Mot-clé principal avec volume élevé'
                },
                {
                    keyword: 'référencement naturel',
                    volume: 6800,
                    difficulty: 38,
                    opportunity: 'Opportunité SEO moyenne',
                    intent: 'informational',
                    reason: 'Mot-clé technique avec bon potentiel'
                },
                {
                    keyword: 'création de site web',
                    volume: 9200,
                    difficulty: 45,
                    opportunity: 'Volume élevé - concurrence modérée',
                    intent: 'commercial',
                    reason: 'Mot-clé transactionnel intéressant'
                },
                {
                    keyword: 'stratégie SEO',
                    volume: 5400,
                    difficulty: 32,
                    opportunity: 'Faible concurrence - bonne opportunité',
                    intent: 'informational',
                    reason: 'Longue traîne avec bon potentiel'
                },
                {
                    keyword: 'optimisation SEO',
                    volume: 4800,
                    difficulty: 40,
                    opportunity: 'Opportunité moyenne',
                    intent: 'informational',
                    reason: 'Mot-clé technique avec volume correct'
                },
                {
                    keyword: 'contenu SEO',
                    volume: 3600,
                    difficulty: 35,
                    opportunity: 'Faible concurrence',
                    intent: 'informational',
                    reason: 'Longue traîne intéressante'
                },
                {
                    keyword: 'audit SEO',
                    volume: 2900,
                    difficulty: 30,
                    opportunity: 'Très faible concurrence',
                    intent: 'commercial',
                    reason: 'Mot-clé transactionnel avec bonne opportunité'
                },
                {
                    keyword: 'backlinks SEO',
                    volume: 2100,
                    difficulty: 45,
                    opportunity: 'Opportunité moyenne',
                    intent: 'informational',
                    reason: 'Mot-clé technique spécialisé'
                }
            ];

            const defaultCalendar = generateCalendar(genericKeywords, 30);
            return res.json({
                success: true,
                keywords: genericKeywords,
                calendar: defaultCalendar
            });
        }

        // Normaliser l'URL
        let websiteUrl = url.trim();
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            websiteUrl = 'https://' + websiteUrl;
        }

        console.log(`Funnel analysis for: ${websiteUrl}`);

        // Analyser le site (sans concurrents pour aller plus vite)
        const result = await keywordService.analyzeCompetitors(websiteUrl, []);

        // Sélectionner jusqu'à 10 meilleurs mots-clés (opportunité high prioritaire)
        const topKeywords = result.keywords
            .filter(kw => kw.opportunity === 'high')
            .slice(0, 10);

        // Si pas assez de mots-clés avec opportunité high, prendre les meilleurs par volume
        if (topKeywords.length < 10) {
            const sortedByVolume = [...result.keywords]
                .sort((a, b) => b.volume - a.volume)
                .filter(kw => !topKeywords.find(tk => tk.keyword === kw.keyword))
                .slice(0, 10 - topKeywords.length);
            topKeywords.push(...sortedByVolume);
        }

        // Prendre les 10 meilleurs
        const selectedKeywords = topKeywords.slice(0, 10);

        // Générer le calendrier avec les mots-clés sélectionnés
        const calendar = generateCalendar(selectedKeywords, 30);

        res.json({
            success: true,
            keywords: selectedKeywords.map(kw => ({
                keyword: kw.keyword,
                volume: kw.volume,
                difficulty: kw.difficulty,
                opportunity: kw.reason || 'Opportunité identifiée pour votre site',
                intent: kw.intent
            })),
            calendar: calendar,
            analysis: result.analysis
        });
    } catch (error) {
        console.error('Funnel analysis error:', error);
        
        // En cas d'erreur, retourner des mots-clés génériques
        const fallbackKeywords = [
            {
                keyword: 'marketing digital',
                volume: 12000,
                difficulty: 35,
                opportunity: 'Forte opportunité - faible concurrence',
                intent: 'informational'
            },
            {
                keyword: 'formation en ligne',
                volume: 8500,
                difficulty: 42,
                opportunity: 'Potentiel de trafic élevé',
                intent: 'commercial'
            },
            {
                keyword: 'e-commerce',
                volume: 15000,
                difficulty: 55,
                opportunity: 'Volume important - stratégie long terme',
                intent: 'informational'
            },
            {
                keyword: 'référencement naturel',
                volume: 6800,
                difficulty: 38,
                opportunity: 'Opportunité SEO moyenne',
                intent: 'informational'
            },
            {
                keyword: 'création de site web',
                volume: 9200,
                difficulty: 45,
                opportunity: 'Volume élevé - concurrence modérée',
                intent: 'commercial'
            },
            {
                keyword: 'stratégie SEO',
                volume: 5400,
                difficulty: 32,
                opportunity: 'Faible concurrence - bonne opportunité',
                intent: 'informational'
            },
            {
                keyword: 'optimisation SEO',
                volume: 4800,
                difficulty: 40,
                opportunity: 'Opportunité moyenne',
                intent: 'informational'
            },
            {
                keyword: 'contenu SEO',
                volume: 3600,
                difficulty: 35,
                opportunity: 'Faible concurrence',
                intent: 'informational'
            },
            {
                keyword: 'audit SEO',
                volume: 2900,
                difficulty: 30,
                opportunity: 'Très faible concurrence',
                intent: 'commercial'
            },
            {
                keyword: 'backlinks SEO',
                volume: 2100,
                difficulty: 45,
                opportunity: 'Opportunité moyenne',
                intent: 'informational'
            }
        ];

        const fallbackCalendar = generateCalendar(fallbackKeywords, 30);
        res.json({
            success: true,
            keywords: fallbackKeywords,
            calendar: fallbackCalendar,
            error: 'Utilisation de mots-clés génériques suite à une erreur d\'analyse'
        });
    }
});

// Helper function to generate calendar
function generateCalendar(keywords, days = 30) {
    const calendar = [];
    const today = new Date();
    const totalArticles = Math.min(10, keywords.length * 2); // ~10 articles max, ou 2 par mot-clé
    const articlesPerKeyword = Math.ceil(totalArticles / keywords.length);
    
    let articleIndex = 0;
    let keywordRotation = 0;
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // Répartir les articles sur 30 jours (environ tous les 3 jours)
        const hasArticle = i > 0 && i % 3 === 0 && articleIndex < totalArticles;
        let keywordIndex = null;
        
        if (hasArticle) {
            // Rotation des mots-clés pour varier
            keywordIndex = keywordRotation % keywords.length;
            keywordRotation++;
        }
        
        calendar.push({
            date: date.toISOString(),
            day: date.getDate(),
            month: date.getMonth(),
            weekday: date.getDay(),
            hasArticle: hasArticle,
            keyword: hasArticle && keywordIndex !== null && keywordIndex < keywords.length ? keywords[keywordIndex].keyword : null,
            articleNumber: hasArticle ? articleIndex + 1 : null
        });
        
        if (hasArticle) articleIndex++;
    }
    
    return calendar;
}

// Get favorite keywords
app.get('/api/keywords/favorites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const favorites = await keywordService.getFavoriteKeywords(supabase, userId);
        res.json({ favorites });
    } catch (error) {
        console.error('Error fetching favorite keywords:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Save favorite keyword
app.post('/api/keywords/favorites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const keywordData = req.body;

        const saved = await keywordService.saveFavoriteKeyword(supabase, userId, keywordData);
        res.json({ success: true, keyword: saved });
    } catch (error) {
        console.error('Error saving favorite keyword:', error);
        res.status(500).json({ error: 'Failed to save keyword' });
    }
});

// Delete favorite keyword
app.delete('/api/keywords/favorites/:userId/:keywordId', async (req, res) => {
    try {
        const { userId, keywordId } = req.params;
        await keywordService.deleteFavoriteKeyword(supabase, userId, keywordId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting favorite keyword:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get keyword search history
app.get('/api/keywords/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        const history = await keywordService.getSearchHistory(supabase, userId, parseInt(limit));
        res.json({ history });
    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// CONTENT GENERATION API
// =============================================================================

// Generate article
app.post('/api/content/generate', async (req, res) => {
    try {
        const { 
            userId, 
            keyword, 
            tone = 'professional', 
            length = 1500,
            language = 'fr',
            secondaryKeywords = [],
            outline = null,
            includeImages = true,
            includeFAQ = true
        } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        console.log(`Generating article for keyword: "${keyword}", user: ${userId}`);

        const result = await contentService.generateArticle({
            keyword,
            tone,
            length,
            language,
            secondaryKeywords,
            outline,
            includeImages,
            includeFAQ
        });

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        // Save to database if userId provided
        let savedArticle = null;
        if (userId) {
            try {
                savedArticle = await contentService.saveArticle(supabase, userId, result.article);
            } catch (saveError) {
                console.error('Error saving article:', saveError);
                // Still return the article even if save fails
            }
        }

        res.json({
            success: true,
            article: result.article,
            savedId: savedArticle?.id
        });
    } catch (error) {
        console.error('Content generation error:', error);
        res.status(500).json({ error: 'Failed to generate article' });
    }
});

// Generate article outline only
app.post('/api/content/outline', async (req, res) => {
    try {
        const { keyword, secondaryKeywords = [], language = 'fr' } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        const outline = await contentService.generateOutline(keyword, secondaryKeywords, language);
        res.json({ success: true, outline });
    } catch (error) {
        console.error('Outline generation error:', error);
        res.status(500).json({ error: 'Failed to generate outline' });
    }
});

// Generate FAQ
app.post('/api/content/faq', async (req, res) => {
    try {
        const { keyword, existingContent = '', count = 5, language = 'fr' } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        const faq = await contentService.generateFAQ(keyword, existingContent, count, language);
        res.json({ success: true, ...faq });
    } catch (error) {
        console.error('FAQ generation error:', error);
        res.status(500).json({ error: 'Failed to generate FAQ' });
    }
});

// Generate meta tags
app.post('/api/content/meta-tags', async (req, res) => {
    try {
        const { content, keyword, language = 'fr' } = req.body;

        if (!content || !keyword) {
            return res.status(400).json({ error: 'Content and keyword are required' });
        }

        const metaTags = await contentService.generateMetaTags(content, keyword, language);
        res.json({ success: true, ...metaTags });
    } catch (error) {
        console.error('Meta tags generation error:', error);
        res.status(500).json({ error: 'Failed to generate meta tags' });
    }
});

// Improve existing content
app.post('/api/content/improve', async (req, res) => {
    try {
        const { content, improvements = [], language = 'fr' } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const improved = await contentService.improveContent(content, improvements, language);
        res.json({ success: true, ...improved });
    } catch (error) {
        console.error('Content improvement error:', error);
        res.status(500).json({ error: 'Failed to improve content' });
    }
});

// Get user's articles
app.get('/api/articles/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 50 } = req.query;

        const articles = await contentService.getArticles(supabase, userId, status, parseInt(limit));
        res.json({ articles, count: articles.length });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get single article
app.get('/api/articles/:userId/:articleId', async (req, res) => {
    try {
        const { userId, articleId } = req.params;
        const article = await contentService.getArticleById(supabase, userId, articleId);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ article });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update article
app.put('/api/articles/:userId/:articleId', async (req, res) => {
    try {
        const { userId, articleId } = req.params;
        const updates = req.body;

        const article = await contentService.updateArticle(supabase, userId, articleId, updates);
        res.json({ success: true, article });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete article
app.delete('/api/articles/:userId/:articleId', async (req, res) => {
    try {
        const { userId, articleId } = req.params;
        await contentService.deleteArticle(supabase, userId, articleId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Save article (for drafts or manual saves)
app.post('/api/articles/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const articleData = req.body;

        const article = await contentService.saveArticle(supabase, userId, articleData);
        res.json({ success: true, article });
    } catch (error) {
        console.error('Error saving article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
