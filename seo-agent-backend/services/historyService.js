const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class HistoryService {
    async getHistory(phoneNumber, agentId = null, limit = 10) {
        let query = supabase
            .from('messages')
            .select('role, content')
            .eq('phone_number', phoneNumber)
            .order('created_at', { ascending: false })
            .limit(limit);

        // Filter by agent_id if provided
        if (agentId) {
            query = query.eq('agent_id', agentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching history:', error);
            return [];
        }

        // Reverse to get chronological order for OpenAI
        return data.reverse();
    }

    async saveMessage(phoneNumber, role, content, agentId = null) {
        const messageData = { 
            phone_number: phoneNumber, 
            role, 
            content 
        };

        // Add agent_id if provided
        if (agentId) {
            messageData.agent_id = agentId;
        }

        const { error } = await supabase
            .from('messages')
            .insert([messageData]);

        if (error) {
            console.error('Error saving message:', error);
        }
    }
}

module.exports = new HistoryService();
