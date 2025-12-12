/**
 * Tag Service - Contact tagging and segmentation
 */

class TagService {
    
    /**
     * Get default system tags
     */
    getSystemTags() {
        return [
            { id: 'sys_hot', name: '🔥 Hot', color: '#EF4444', system: true, description: 'Lead très chaud, prêt à acheter' },
            { id: 'sys_warm', name: '🌡️ Warm', color: '#F59E0B', system: true, description: 'Lead intéressé, à nurture' },
            { id: 'sys_cold', name: '❄️ Cold', color: '#3B82F6', system: true, description: 'Lead froid, pas prêt' },
            { id: 'sys_vip', name: '⭐ VIP', color: '#8B5CF6', system: true, description: 'Client prioritaire' },
            { id: 'sys_callback', name: '📞 À rappeler', color: '#10B981', system: true, description: 'Demande de rappel' },
            { id: 'sys_meeting', name: '📅 RDV pris', color: '#06B6D4', system: true, description: 'Rendez-vous planifié' },
            { id: 'sys_qualified', name: '✅ Qualifié', color: '#22C55E', system: true, description: 'Lead qualifié' },
            { id: 'sys_disqualified', name: '❌ Disqualifié', color: '#6B7280', system: true, description: 'Lead non qualifié' },
            { id: 'sys_nurture', name: '🌱 Nurturing', color: '#84CC16', system: true, description: 'En phase de nurturing' },
            { id: 'sys_won', name: '🏆 Gagné', color: '#22C55E', system: true, description: 'Deal gagné' },
            { id: 'sys_lost', name: '💔 Perdu', color: '#EF4444', system: true, description: 'Deal perdu' }
        ];
    }

    /**
     * Get all tags (system + custom) for a user
     */
    async getAllTags(supabase, userId) {
        const systemTags = this.getSystemTags();
        
        const { data: customTags } = await supabase
            .from('tags')
            .select('*')
            .eq('user_id', userId)
            .order('name', { ascending: true });

        return {
            system: systemTags,
            custom: customTags || []
        };
    }

    /**
     * Create custom tag
     */
    async createTag(supabase, userId, tagData) {
        const { data, error } = await supabase
            .from('tags')
            .insert({
                user_id: userId,
                name: tagData.name,
                color: tagData.color || '#6B7280',
                description: tagData.description || '',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update custom tag
     */
    async updateTag(supabase, tagId, userId, updates) {
        const { data, error } = await supabase
            .from('tags')
            .update(updates)
            .eq('id', tagId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete custom tag
     */
    async deleteTag(supabase, tagId, userId) {
        // First remove tag from all contacts
        await supabase.rpc('remove_tag_from_contacts', { tag_id: tagId });
        
        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', tagId)
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    }

    /**
     * Add tag to contact
     */
    async addTagToContact(supabase, contactId, tagId) {
        // Get current tags
        const { data: contact } = await supabase
            .from('contacts')
            .select('tags')
            .eq('id', contactId)
            .single();

        const currentTags = contact?.tags || [];
        
        if (!currentTags.includes(tagId)) {
            const { error } = await supabase
                .from('contacts')
                .update({ tags: [...currentTags, tagId] })
                .eq('id', contactId);

            if (error) throw error;
        }

        return { success: true };
    }

    /**
     * Remove tag from contact
     */
    async removeTagFromContact(supabase, contactId, tagId) {
        const { data: contact } = await supabase
            .from('contacts')
            .select('tags')
            .eq('id', contactId)
            .single();

        const currentTags = contact?.tags || [];
        const newTags = currentTags.filter(t => t !== tagId);

        const { error } = await supabase
            .from('contacts')
            .update({ tags: newTags })
            .eq('id', contactId);

        if (error) throw error;
        return { success: true };
    }

    /**
     * Get contacts by tag
     */
    async getContactsByTag(supabase, userId, tagId) {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('agent_id', userId)
            .contains('tags', [tagId])
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Auto-tag contact based on score and status
     */
    async autoTagContact(supabase, contactId, score, status) {
        const tagsToAdd = [];
        const tagsToRemove = [];

        // Score-based tagging
        if (score >= 80) {
            tagsToAdd.push('sys_hot');
            tagsToRemove.push('sys_warm', 'sys_cold');
        } else if (score >= 50) {
            tagsToAdd.push('sys_warm');
            tagsToRemove.push('sys_hot', 'sys_cold');
        } else if (score !== null) {
            tagsToAdd.push('sys_cold');
            tagsToRemove.push('sys_hot', 'sys_warm');
        }

        // Status-based tagging
        if (status === 'qualified') {
            tagsToAdd.push('sys_qualified');
        } else if (status === 'disqualified') {
            tagsToAdd.push('sys_disqualified');
        }

        // Get current tags
        const { data: contact } = await supabase
            .from('contacts')
            .select('tags')
            .eq('id', contactId)
            .single();

        let currentTags = contact?.tags || [];
        
        // Remove conflicting tags
        currentTags = currentTags.filter(t => !tagsToRemove.includes(t));
        
        // Add new tags
        for (const tag of tagsToAdd) {
            if (!currentTags.includes(tag)) {
                currentTags.push(tag);
            }
        }

        // Update
        await supabase
            .from('contacts')
            .update({ tags: currentTags })
            .eq('id', contactId);

        return currentTags;
    }

    /**
     * Get predefined segments
     */
    getDefaultSegments() {
        return [
            {
                id: 'seg_hot_leads',
                name: 'Leads chauds',
                description: 'Score > 80',
                filters: { score_min: 80 },
                icon: '🔥'
            },
            {
                id: 'seg_to_follow_up',
                name: 'À relancer',
                description: 'Pas de réponse depuis 2+ jours',
                filters: { no_response_days: 2 },
                icon: '📞'
            },
            {
                id: 'seg_qualified',
                name: 'Qualifiés',
                description: 'Leads qualifiés à traiter',
                filters: { status: 'qualified' },
                icon: '✅'
            },
            {
                id: 'seg_new_today',
                name: 'Nouveaux aujourd\'hui',
                description: 'Leads reçus aujourd\'hui',
                filters: { created_today: true },
                icon: '🆕'
            },
            {
                id: 'seg_vip',
                name: 'VIP',
                description: 'Contacts prioritaires',
                filters: { has_tag: 'sys_vip' },
                icon: '⭐'
            },
            {
                id: 'seg_nurturing',
                name: 'En nurturing',
                description: 'Leads en phase de nurturing',
                filters: { has_tag: 'sys_nurture' },
                icon: '🌱'
            },
            {
                id: 'seg_meetings',
                name: 'RDV planifiés',
                description: 'Leads avec RDV',
                filters: { has_tag: 'sys_meeting' },
                icon: '📅'
            }
        ];
    }

    /**
     * Get contacts for a segment
     */
    async getSegmentContacts(supabase, userId, segmentId) {
        const segments = this.getDefaultSegments();
        const segment = segments.find(s => s.id === segmentId);
        
        if (!segment) return [];

        let query = supabase
            .from('contacts')
            .select('*')
            .eq('agent_id', userId);

        const filters = segment.filters;

        if (filters.score_min) {
            query = query.gte('score', filters.score_min);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.has_tag) {
            query = query.contains('tags', [filters.has_tag]);
        }
        if (filters.created_today) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query = query.gte('created_at', today.toISOString());
        }
        if (filters.no_response_days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - filters.no_response_days);
            query = query.lt('last_message_at', cutoff.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}

module.exports = new TagService();

