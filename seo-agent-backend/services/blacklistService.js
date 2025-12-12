/**
 * Blacklist Service - GDPR Opt-out management
 */

class BlacklistService {
    
    /**
     * Check if a phone number is blacklisted
     */
    async isBlacklisted(supabase, phone, userId = null) {
        // Check global blacklist first
        const { data: globalBlacklist } = await supabase
            .from('blacklist')
            .select('id')
            .eq('phone', phone)
            .is('user_id', null)
            .single();

        if (globalBlacklist) {
            return { blacklisted: true, scope: 'global', reason: 'Numéro sur liste noire globale' };
        }

        // Check user-specific blacklist
        if (userId) {
            const { data: userBlacklist } = await supabase
                .from('blacklist')
                .select('id, reason')
                .eq('phone', phone)
                .eq('user_id', userId)
                .single();

            if (userBlacklist) {
                return { 
                    blacklisted: true, 
                    scope: 'user', 
                    reason: userBlacklist.reason || 'Opt-out demandé'
                };
            }
        }

        return { blacklisted: false };
    }

    /**
     * Add phone to blacklist
     */
    async addToBlacklist(supabase, phone, userId, reason = 'Opt-out demandé', source = 'manual') {
        // Normalize phone number
        const normalizedPhone = this.normalizePhone(phone);

        const { data, error } = await supabase
            .from('blacklist')
            .insert({
                phone: normalizedPhone,
                user_id: userId,
                reason: reason,
                source: source, // 'manual', 'sms_stop', 'api', 'import'
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            // If duplicate, update instead
            if (error.code === '23505') {
                return this.updateBlacklistEntry(supabase, normalizedPhone, userId, { reason, source });
            }
            throw error;
        }

        // Update contact status if exists
        await supabase
            .from('contacts')
            .update({ 
                status: 'opted_out',
                opted_out_at: new Date().toISOString()
            })
            .eq('phone', normalizedPhone)
            .eq('agent_id', userId);

        return data;
    }

    /**
     * Remove from blacklist (with audit trail)
     */
    async removeFromBlacklist(supabase, phone, userId) {
        const normalizedPhone = this.normalizePhone(phone);

        // Move to archive instead of delete (GDPR audit trail)
        const { data: entry } = await supabase
            .from('blacklist')
            .select('*')
            .eq('phone', normalizedPhone)
            .eq('user_id', userId)
            .single();

        if (entry) {
            // Archive the entry
            await supabase
                .from('blacklist_archive')
                .insert({
                    ...entry,
                    removed_at: new Date().toISOString(),
                    removed_reason: 'Manually removed by user'
                });

            // Delete from active blacklist
            await supabase
                .from('blacklist')
                .delete()
                .eq('phone', normalizedPhone)
                .eq('user_id', userId);

            // Update contact status
            await supabase
                .from('contacts')
                .update({ 
                    status: 'pending',
                    opted_out_at: null
                })
                .eq('phone', normalizedPhone)
                .eq('agent_id', userId);
        }

        return { success: true };
    }

    /**
     * Update blacklist entry
     */
    async updateBlacklistEntry(supabase, phone, userId, updates) {
        const { data, error } = await supabase
            .from('blacklist')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('phone', phone)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get all blacklisted numbers for a user
     */
    async getBlacklist(supabase, userId) {
        const { data, error } = await supabase
            .from('blacklist')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Detect STOP keywords in message
     */
    detectStopKeyword(message) {
        const stopKeywords = [
            'stop',
            'stopp',
            'arret',
            'arreter',
            'arrêter',
            'desabonner',
            'désabonner',
            'unsubscribe',
            'desinscrire',
            'désinscrire',
            'ne plus recevoir',
            'ne m\'écrivez plus',
            'ne m\'envoyez plus',
            'laissez moi tranquille',
            'laissez-moi tranquille',
            'spam',
            'harcelement',
            'harcèlement'
        ];

        const normalizedMessage = message.toLowerCase().trim();
        
        for (const keyword of stopKeywords) {
            if (normalizedMessage === keyword || normalizedMessage.startsWith(keyword + ' ')) {
                return { isStop: true, keyword };
            }
        }

        return { isStop: false };
    }

    /**
     * Process incoming message for opt-out
     * Returns true if message was a STOP request
     */
    async processMessageForOptOut(supabase, phone, message, userId) {
        const stopCheck = this.detectStopKeyword(message);
        
        if (stopCheck.isStop) {
            await this.addToBlacklist(supabase, phone, userId, 'SMS STOP reçu', 'sms_stop');
            return { 
                isOptOut: true, 
                keyword: stopCheck.keyword,
                response: 'Vous avez été désinscrit. Vous ne recevrez plus de messages de notre part.'
            };
        }

        return { isOptOut: false };
    }

    /**
     * Bulk import blacklist from CSV
     */
    async bulkImport(supabase, userId, phoneNumbers, reason = 'Import CSV') {
        const results = { added: 0, skipped: 0, errors: [] };

        for (const phone of phoneNumbers) {
            try {
                const normalizedPhone = this.normalizePhone(phone);
                if (!normalizedPhone) {
                    results.skipped++;
                    continue;
                }

                await this.addToBlacklist(supabase, normalizedPhone, userId, reason, 'import');
                results.added++;
            } catch (error) {
                results.errors.push({ phone, error: error.message });
            }
        }

        return results;
    }

    /**
     * Export blacklist for GDPR compliance
     */
    async exportBlacklist(supabase, userId) {
        const { data } = await supabase
            .from('blacklist')
            .select('phone, reason, source, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return data || [];
    }

    /**
     * Normalize phone number
     */
    normalizePhone(phone) {
        if (!phone) return null;
        
        // Remove all non-digit characters except +
        let normalized = phone.replace(/[^\d+]/g, '');
        
        // Ensure it starts with + for international format
        if (!normalized.startsWith('+')) {
            // Assume French number if starts with 0
            if (normalized.startsWith('0')) {
                normalized = '+33' + normalized.substring(1);
            } else if (normalized.startsWith('33')) {
                normalized = '+' + normalized;
            }
        }

        return normalized;
    }

    /**
     * Get statistics
     */
    async getStats(supabase, userId) {
        const { data, count } = await supabase
            .from('blacklist')
            .select('source', { count: 'exact' })
            .eq('user_id', userId);

        const bySource = {};
        for (const entry of data || []) {
            bySource[entry.source] = (bySource[entry.source] || 0) + 1;
        }

        return {
            total: count || 0,
            bySource
        };
    }
}

module.exports = new BlacklistService();

