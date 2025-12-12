const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class ContactService {
    async createContact(agentId, name, phone, extraData = {}) {
        const { data, error } = await supabase
            .from('contacts')
            .insert([
                {
                    agent_id: agentId,
                    name: name,
                    phone: phone,
                    status: 'pending',
                    ...extraData // Spread all other fields (email, company, etc.)
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating contact:', error);
            throw error;
        }

        return data;
    }
}

module.exports = new ContactService();
