const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class AgentService {
    async getAgentConfig(phoneNumber) {
        // For MVP, we might just get the first profile found, 
        // or ideally match the 'twilio_phone_number' if we stored it.
        // Let's assume for now we fetch the most recently updated profile 
        // or a specific test user if we had their ID.

        // TODO: In a real multi-tenant app, we'd look up which agent owns 'phoneNumber' (the To number).
        // For this MVP, let's just grab the first profile that has a config.

        const { data, error } = await supabase
            .from('profiles')
            .select('agent_config, webhook_url, first_message_template, source_templates, enable_template_webhook, enable_template_csv, scoring_criteria')
            .not('agent_config', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching agent config:', error);
            return null;
        }

        return {
            ...data?.agent_config,
            webhook_url: data?.webhook_url,
            first_message_template: data?.first_message_template,
            source_templates: data?.source_templates,
            enable_template_webhook: data?.enable_template_webhook,
            enable_template_csv: data?.enable_template_csv,
            scoring_criteria: data?.scoring_criteria
        };
    }

    async getAgentConfigById(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, first_message_template, source_templates, enable_template_webhook, enable_template_csv, scoring_criteria')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching agent config by ID:', error);
            return null;
        }

        return {
            ...data?.agent_config,
            webhook_url: data?.webhook_url,
            first_message_template: data?.first_message_template,
            source_templates: data?.source_templates,
            enable_template_webhook: data?.enable_template_webhook,
            enable_template_csv: data?.enable_template_csv,
            scoring_criteria: data?.scoring_criteria
        };
    }
}

module.exports = new AgentService();
