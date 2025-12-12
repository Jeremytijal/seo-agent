/**
 * Follow-Up Service - Automatic follow-up management
 * Handles: Scheduling, sending, and tracking follow-ups
 */

const intelligenceService = require('./intelligenceService');

class FollowUpService {
    
    /**
     * Check if a contact needs a follow-up
     */
    async checkFollowUpNeeded(contact, lastMessageDate, followUpCount = 0) {
        const now = new Date();
        const lastMessage = new Date(lastMessageDate);
        const daysSinceLastMessage = Math.floor((now - lastMessage) / (1000 * 60 * 60 * 24));
        
        // Define follow-up schedule
        const followUpSchedule = [
            { day: 1, maxFollowUps: 1 },   // After 1 day, 1st follow-up
            { day: 3, maxFollowUps: 2 },   // After 3 days, 2nd follow-up
            { day: 7, maxFollowUps: 3 },   // After 7 days, 3rd follow-up
        ];
        
        // Check if follow-up is needed based on schedule
        for (const schedule of followUpSchedule) {
            if (daysSinceLastMessage >= schedule.day && followUpCount < schedule.maxFollowUps) {
                return {
                    needed: true,
                    daysSinceLastMessage,
                    followUpNumber: followUpCount + 1,
                    reason: `${daysSinceLastMessage} jours sans réponse, relance ${followUpCount + 1}/3`
                };
            }
        }
        
        // Max follow-ups reached or too soon
        if (followUpCount >= 3) {
            return {
                needed: false,
                reason: 'Maximum de relances atteint (3/3)',
                daysSinceLastMessage,
                action: 'archive'
            };
        }
        
        return {
            needed: false,
            reason: 'Pas encore le moment de relancer',
            daysSinceLastMessage,
            nextFollowUpIn: this.getNextFollowUpDays(followUpCount, daysSinceLastMessage)
        };
    }
    
    /**
     * Calculate days until next follow-up
     */
    getNextFollowUpDays(currentFollowUps, daysSinceLastMessage) {
        const schedule = [1, 3, 7];
        const nextThreshold = schedule[currentFollowUps] || 999;
        return Math.max(0, nextThreshold - daysSinceLastMessage);
    }
    
    /**
     * Get all contacts needing follow-up for a user
     */
    async getContactsNeedingFollowUp(supabase, userId) {
        try {
            // Get contacts with pending status and no recent messages
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('agent_id', userId)
                .in('status', ['pending', 'contacted'])
                .lt('updated_at', oneDayAgo)
                .order('updated_at', { ascending: true })
                .limit(50);
            
            if (error) throw error;
            
            const needsFollowUp = [];
            
            for (const contact of contacts || []) {
                const followUpCount = contact.follow_up_count || 0;
                const lastMessageDate = contact.last_message_at || contact.updated_at;
                
                const result = await this.checkFollowUpNeeded(
                    contact, 
                    lastMessageDate, 
                    followUpCount
                );
                
                if (result.needed) {
                    needsFollowUp.push({
                        contact,
                        ...result
                    });
                }
            }
            
            return needsFollowUp;
        } catch (error) {
            console.error('Error getting contacts for follow-up:', error);
            return [];
        }
    }
    
    /**
     * Generate and send a follow-up message
     */
    async sendFollowUp(supabase, twilioClient, contact, agentConfig, conversationHistory) {
        try {
            const followUpCount = contact.follow_up_count || 0;
            const lastMessageDate = contact.last_message_at || contact.updated_at;
            const daysSinceLastMessage = Math.floor(
                (new Date() - new Date(lastMessageDate)) / (1000 * 60 * 60 * 24)
            );
            
            // Get extracted context from contact
            const extractedContext = {
                name: contact.name,
                company: contact.company_name,
                interest_level: contact.score >= 70 ? 'high' : contact.score >= 40 ? 'medium' : 'low',
                pain_points: contact.pain_points || []
            };
            
            // Generate follow-up message
            const followUpData = await intelligenceService.generateFollowUp(
                conversationHistory,
                extractedContext,
                daysSinceLastMessage,
                followUpCount
            );
            
            if (!followUpData.should_follow_up || !followUpData.message) {
                console.log(`Follow-up not needed for ${contact.phone}: ${followUpData.strategy || 'Max relances'}`);
                return { sent: false, reason: 'Follow-up not recommended' };
            }
            
            // Send SMS via Twilio
            const message = await twilioClient.messages.create({
                body: followUpData.message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phone
            });
            
            // Update contact in database
            await supabase
                .from('contacts')
                .update({
                    follow_up_count: followUpCount + 1,
                    last_follow_up_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', contact.id);
            
            // Save message to history
            await supabase
                .from('messages')
                .insert({
                    agent_id: contact.agent_id,
                    phone_number: contact.phone,
                    role: 'assistant',
                    content: followUpData.message,
                    message_type: 'follow_up',
                    created_at: new Date().toISOString()
                });
            
            console.log(`Follow-up sent to ${contact.phone}: "${followUpData.message}"`);
            
            return {
                sent: true,
                message: followUpData.message,
                strategy: followUpData.strategy,
                followUpNumber: followUpCount + 1,
                twilioSid: message.sid
            };
        } catch (error) {
            console.error('Error sending follow-up:', error);
            return { sent: false, error: error.message };
        }
    }
    
    /**
     * Process all follow-ups for a user
     */
    async processUserFollowUps(supabase, twilioClient, userId, agentConfig) {
        try {
            const contactsToFollowUp = await this.getContactsNeedingFollowUp(supabase, userId);
            
            console.log(`Found ${contactsToFollowUp.length} contacts needing follow-up for user ${userId}`);
            
            const results = [];
            
            for (const item of contactsToFollowUp) {
                // Get conversation history for this contact
                const { data: messages } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('agent_id', userId)
                    .eq('phone_number', item.contact.phone)
                    .order('created_at', { ascending: true })
                    .limit(20);
                
                const history = (messages || []).map(m => ({
                    role: m.role,
                    content: m.content
                }));
                
                // Send follow-up
                const result = await this.sendFollowUp(
                    supabase,
                    twilioClient,
                    item.contact,
                    agentConfig,
                    history
                );
                
                results.push({
                    contactId: item.contact.id,
                    phone: item.contact.phone,
                    ...result
                });
                
                // Small delay between messages to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            return {
                processed: results.length,
                sent: results.filter(r => r.sent).length,
                failed: results.filter(r => !r.sent).length,
                details: results
            };
        } catch (error) {
            console.error('Error processing follow-ups:', error);
            return { processed: 0, sent: 0, failed: 0, error: error.message };
        }
    }
}

module.exports = new FollowUpService();

