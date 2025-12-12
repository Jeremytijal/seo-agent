/**
 * Template Service - Message templates library
 */

class TemplateService {
    
    /**
     * Get default templates by category
     */
    getDefaultTemplates() {
        return {
            first_contact: [
                {
                    id: 'fc_1',
                    name: 'Accueil classique',
                    category: 'first_contact',
                    message: 'Bonjour {{name}} ! Merci pour votre intérêt. Qu\'est-ce qui vous amène vers nous ? 🙂',
                    variables: ['name'],
                    tone: 'friendly',
                    goal: 'qualify'
                },
                {
                    id: 'fc_2',
                    name: 'Direct et pro',
                    category: 'first_contact',
                    message: 'Bonjour {{name}}, j\'ai bien reçu votre demande. Quel est votre besoin principal ?',
                    variables: ['name'],
                    tone: 'professional',
                    goal: 'qualify'
                },
                {
                    id: 'fc_3',
                    name: 'Personnalisé source',
                    category: 'first_contact',
                    message: 'Hey {{name}} ! J\'ai vu votre inscription via {{source}}. C\'est pour quel type de projet ?',
                    variables: ['name', 'source'],
                    tone: 'casual',
                    goal: 'qualify'
                },
                {
                    id: 'fc_4',
                    name: 'Booking rapide',
                    category: 'first_contact',
                    message: 'Bonjour {{name}} ! Pour mieux vous conseiller, on peut se caler un appel de 15min ? Dispo quand ?',
                    variables: ['name'],
                    tone: 'friendly',
                    goal: 'book'
                }
            ],
            follow_up: [
                {
                    id: 'fu_1',
                    name: 'Relance douce J+1',
                    category: 'follow_up',
                    message: 'Hello {{name}} ! Je voulais juste m\'assurer que vous aviez bien reçu mon message. Toujours intéressé(e) ?',
                    variables: ['name'],
                    tone: 'friendly',
                    delay_days: 1
                },
                {
                    id: 'fu_2',
                    name: 'Relance valeur J+3',
                    category: 'follow_up',
                    message: '{{name}}, petite info qui pourrait vous intéresser : {{value_prop}}. On en parle ?',
                    variables: ['name', 'value_prop'],
                    tone: 'helpful',
                    delay_days: 3
                },
                {
                    id: 'fu_3',
                    name: 'Dernière chance J+7',
                    category: 'follow_up',
                    message: '{{name}}, je ne veux pas vous embêter. C\'est toujours d\'actualité pour vous ? Sinon je ferme le dossier 👋',
                    variables: ['name'],
                    tone: 'direct',
                    delay_days: 7
                },
                {
                    id: 'fu_4',
                    name: 'Question ouverte',
                    category: 'follow_up',
                    message: 'Salut {{name}} ! Comment ça avance de votre côté ?',
                    variables: ['name'],
                    tone: 'casual',
                    delay_days: 2
                }
            ],
            reactivation: [
                {
                    id: 're_1',
                    name: 'Reprise de contact',
                    category: 'reactivation',
                    message: 'Bonjour {{name}} ! On s\'était parlé il y a quelques temps. Votre situation a peut-être évolué depuis ?',
                    variables: ['name'],
                    tone: 'friendly'
                },
                {
                    id: 're_2',
                    name: 'Nouveauté',
                    category: 'reactivation',
                    message: '{{name}}, on a du nouveau qui pourrait vous intéresser ! Vous avez 2 min pour en discuter ?',
                    variables: ['name'],
                    tone: 'excited'
                },
                {
                    id: 're_3',
                    name: 'Offre spéciale',
                    category: 'reactivation',
                    message: 'Hello {{name}} ! Offre flash cette semaine : {{offer}}. Ça vous dit ?',
                    variables: ['name', 'offer'],
                    tone: 'promotional'
                }
            ],
            booking: [
                {
                    id: 'bk_1',
                    name: 'Proposition créneaux',
                    category: 'booking',
                    message: 'Super {{name}} ! Je peux vous proposer {{slot_1}} ou {{slot_2}}. Qu\'est-ce qui vous arrange ?',
                    variables: ['name', 'slot_1', 'slot_2'],
                    tone: 'professional',
                    goal: 'book'
                },
                {
                    id: 'bk_2',
                    name: 'Lien calendrier',
                    category: 'booking',
                    message: 'Parfait {{name}} ! Voici mon calendrier pour bloquer un créneau : {{calendar_link}}',
                    variables: ['name', 'calendar_link'],
                    tone: 'professional',
                    goal: 'book'
                },
                {
                    id: 'bk_3',
                    name: 'Confirmation RDV',
                    category: 'booking',
                    message: 'C\'est noté {{name}} ! RDV {{date}} à {{time}}. Je vous envoie une invitation. À très vite ! 📅',
                    variables: ['name', 'date', 'time'],
                    tone: 'friendly',
                    goal: 'book'
                }
            ],
            objection_handling: [
                {
                    id: 'ob_1',
                    name: 'Trop cher',
                    category: 'objection_handling',
                    message: 'Je comprends {{name}}. Le budget est important. Quel serait le montant idéal pour vous ?',
                    variables: ['name'],
                    objection_type: 'price',
                    tone: 'empathetic'
                },
                {
                    id: 'ob_2',
                    name: 'Pas le moment',
                    category: 'objection_handling',
                    message: 'Pas de souci {{name}} ! C\'est prévu pour quand idéalement ? Je peux vous recontacter à ce moment.',
                    variables: ['name'],
                    objection_type: 'timing',
                    tone: 'understanding'
                },
                {
                    id: 'ob_3',
                    name: 'Doit réfléchir',
                    category: 'objection_handling',
                    message: 'Bien sûr {{name}}. Y a-t-il un point particulier qui vous fait hésiter ?',
                    variables: ['name'],
                    objection_type: 'hesitation',
                    tone: 'curious'
                },
                {
                    id: 'ob_4',
                    name: 'Concurrent moins cher',
                    category: 'objection_handling',
                    message: '{{name}}, le prix est un critère, mais avez-vous comparé {{differentiator}} ? C\'est souvent là que ça fait la différence.',
                    variables: ['name', 'differentiator'],
                    objection_type: 'competitor',
                    tone: 'confident'
                }
            ],
            qualification: [
                {
                    id: 'qa_1',
                    name: 'Question budget',
                    category: 'qualification',
                    message: 'Et côté budget {{name}}, vous avez une enveloppe en tête ?',
                    variables: ['name'],
                    qualification_type: 'budget'
                },
                {
                    id: 'qa_2',
                    name: 'Question timing',
                    category: 'qualification',
                    message: 'C\'est pour quand idéalement {{name}} ? Urgent ou vous avez le temps ?',
                    variables: ['name'],
                    qualification_type: 'timing'
                },
                {
                    id: 'qa_3',
                    name: 'Question décideur',
                    category: 'qualification',
                    message: 'Vous êtes seul(e) à décider ou d\'autres personnes seront impliquées ?',
                    variables: [],
                    qualification_type: 'authority'
                },
                {
                    id: 'qa_4',
                    name: 'Question besoin',
                    category: 'qualification',
                    message: 'Pour être sûr de bien comprendre {{name}}, c\'est quoi votre problème principal aujourd\'hui ?',
                    variables: ['name'],
                    qualification_type: 'need'
                }
            ],
            closing: [
                {
                    id: 'cl_1',
                    name: 'Récap et action',
                    category: 'closing',
                    message: 'Récap {{name}} : {{summary}}. On passe à la suite ? Je vous envoie {{next_step}}.',
                    variables: ['name', 'summary', 'next_step'],
                    tone: 'action'
                },
                {
                    id: 'cl_2',
                    name: 'Soft close',
                    category: 'closing',
                    message: '{{name}}, vu notre échange, je pense qu\'on peut vraiment vous aider. On démarre quand ?',
                    variables: ['name'],
                    tone: 'confident'
                }
            ]
        };
    }

    /**
     * Get all templates (default + custom)
     */
    async getAllTemplates(supabase, userId) {
        const defaultTemplates = this.getDefaultTemplates();
        
        // Get custom templates from database
        const { data: customTemplates } = await supabase
            .from('message_templates')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return {
            default: defaultTemplates,
            custom: customTemplates || []
        };
    }

    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        const all = this.getDefaultTemplates();
        return all[category] || [];
    }

    /**
     * Replace variables in template
     */
    replaceVariables(template, variables) {
        let message = template;
        for (const [key, value] of Object.entries(variables)) {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        }
        // Clean up any remaining unreplaced variables
        message = message.replace(/{{[^}]+}}/g, '').trim();
        return message;
    }

    /**
     * Create custom template
     */
    async createTemplate(supabase, userId, templateData) {
        const { data, error } = await supabase
            .from('message_templates')
            .insert({
                user_id: userId,
                name: templateData.name,
                category: templateData.category,
                message: templateData.message,
                variables: templateData.variables || [],
                tone: templateData.tone,
                goal: templateData.goal,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update custom template
     */
    async updateTemplate(supabase, templateId, userId, updates) {
        const { data, error } = await supabase
            .from('message_templates')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', templateId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete custom template
     */
    async deleteTemplate(supabase, templateId, userId) {
        const { error } = await supabase
            .from('message_templates')
            .delete()
            .eq('id', templateId)
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    }
}

module.exports = new TemplateService();

