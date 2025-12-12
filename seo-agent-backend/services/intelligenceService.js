const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Intelligence Service - Advanced AI capabilities
 * Handles: Memory, Intent Detection, Scoring, Escalation, Follow-ups
 */
class IntelligenceService {
    
    /**
     * Extract key information from a message and update contact context
     * This builds the "memory" of the conversation
     */
    async extractContextFromMessage(message, existingContext = {}) {
        try {
            const prompt = `Tu es un expert en extraction d'informations commerciales.

MESSAGE DU PROSPECT :
"${message}"

CONTEXTE EXISTANT :
${JSON.stringify(existingContext, null, 2)}

Extrais UNIQUEMENT les NOUVELLES informations mentionnées dans ce message.
Ne répète pas les informations déjà connues.

Réponds en JSON :
{
    "extracted": {
        "name": "prénom ou nom si mentionné (sinon null)",
        "company": "nom d'entreprise si mentionné (sinon null)",
        "job_title": "poste/fonction si mentionné (sinon null)",
        "budget": "budget ou fourchette si mentionné (sinon null)",
        "timeline": "délai/urgence si mentionné (sinon null)",
        "team_size": "taille équipe si mentionné (sinon null)",
        "pain_points": ["problèmes/douleurs exprimés"],
        "needs": ["besoins exprimés"],
        "objections": ["objections ou hésitations"],
        "competitors": ["concurrents mentionnés"],
        "decision_makers": ["autres décideurs mentionnés"],
        "current_solution": "solution actuelle si mentionnée (sinon null)",
        "interest_level": "high/medium/low/unclear basé sur le ton",
        "key_quotes": ["citations importantes du prospect (max 2)"]
    },
    "summary": "Résumé en 1 phrase de ce que le prospect a dit"
}

RÈGLES :
- Ne mets que les infos EXPLICITEMENT mentionnées
- Si rien de nouveau, laisse les champs à null ou []
- Sois précis sur les chiffres (budget, taille, délai)`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            const result = JSON.parse(completion.choices[0].message.content);
            
            // Merge with existing context
            const mergedContext = this.mergeContext(existingContext, result.extracted);
            
            return {
                newInfo: result.extracted,
                summary: result.summary,
                fullContext: mergedContext
            };
        } catch (error) {
            console.error('Error extracting context:', error);
            return { newInfo: {}, summary: '', fullContext: existingContext };
        }
    }

    /**
     * Merge new context with existing context (don't overwrite with nulls)
     */
    mergeContext(existing, newInfo) {
        const merged = { ...existing };
        
        for (const [key, value] of Object.entries(newInfo || {})) {
            if (value === null || value === undefined) continue;
            if (Array.isArray(value) && value.length === 0) continue;
            
            if (Array.isArray(value) && Array.isArray(merged[key])) {
                // Merge arrays without duplicates
                merged[key] = [...new Set([...(merged[key] || []), ...value])];
            } else if (value) {
                merged[key] = value;
            }
        }
        
        return merged;
    }

    /**
     * Detect the intent behind a prospect's message
     */
    async detectIntent(message, conversationHistory = []) {
        try {
            const historyContext = conversationHistory.slice(-6).map(m => 
                `${m.role === 'user' ? 'PROSPECT' : 'AGENT'}: ${m.content}`
            ).join('\n');

            const prompt = `Tu es un expert en analyse d'intentions commerciales.

HISTORIQUE RÉCENT :
${historyContext}

DERNIER MESSAGE DU PROSPECT :
"${message}"

Analyse l'INTENTION PRINCIPALE du prospect.

Réponds en JSON :
{
    "primary_intent": "Une des valeurs suivantes",
    "confidence": 0.0-1.0,
    "secondary_intents": ["autres intentions possibles"],
    "buying_signals": ["signaux d'achat détectés"],
    "warning_signals": ["signaux d'alerte/objection"],
    "recommended_action": "Action recommandée pour l'agent",
    "urgency": "high/medium/low"
}

INTENTIONS POSSIBLES :
- "information_request" : Demande d'info générale
- "pricing_inquiry" : Demande de prix/tarifs
- "feature_question" : Question sur fonctionnalités
- "objection" : Objection ou hésitation
- "comparison" : Compare avec concurrents
- "ready_to_buy" : Prêt à acheter/signer
- "schedule_meeting" : Veut un RDV
- "not_interested" : Pas intéressé
- "wrong_target" : Pas la bonne cible
- "need_more_time" : Besoin de réfléchir
- "internal_discussion" : Doit en parler en interne
- "budget_concern" : Préoccupation budget
- "timing_concern" : Préoccupation timing
- "trust_building" : Cherche à établir confiance
- "technical_question" : Question technique
- "unclear" : Intention pas claire`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error detecting intent:', error);
            return { 
                primary_intent: 'unclear', 
                confidence: 0, 
                secondary_intents: [],
                buying_signals: [],
                warning_signals: [],
                recommended_action: 'Continue la conversation',
                urgency: 'medium'
            };
        }
    }

    /**
     * Calculate real-time lead score based on conversation
     */
    async calculateRealtimeScore(conversationHistory, extractedContext, agentConfig) {
        try {
            const criteria = agentConfig.quality_criteria || [];
            const criteriaText = criteria.map(c => typeof c === 'string' ? c : c.text).join(', ');

            const prompt = `Tu es un expert en scoring de leads B2B.

CRITÈRES DE QUALIFICATION DE L'ENTREPRISE :
${criteriaText || 'Budget, Autorité, Besoin, Délai (BANT)'}

INFORMATIONS EXTRAITES DU PROSPECT :
${JSON.stringify(extractedContext, null, 2)}

CONVERSATION (${conversationHistory.length} messages) :
${conversationHistory.slice(-10).map(m => `${m.role === 'user' ? 'PROSPECT' : 'AGENT'}: ${m.content}`).join('\n')}

Calcule un score de 0 à 100 basé sur :
- BUDGET (25 pts max) : Budget mentionné et réaliste ?
- AUTORITÉ (25 pts max) : Est-ce le décideur ou peut-il influencer ?
- BESOIN (25 pts max) : Besoin clair et urgent ?
- TIMING (25 pts max) : Délai raisonnable (<3 mois) ?

Réponds en JSON :
{
    "score": 0-100,
    "breakdown": {
        "budget": {"score": 0-25, "reason": "explication courte"},
        "authority": {"score": 0-25, "reason": "explication courte"},
        "need": {"score": 0-25, "reason": "explication courte"},
        "timing": {"score": 0-25, "reason": "explication courte"}
    },
    "qualification_status": "hot/warm/cold/unqualified",
    "missing_info": ["infos manquantes pour mieux qualifier"],
    "next_question": "Prochaine question à poser pour qualifier",
    "commercial_potential": "high/medium/low",
    "recommended_next_step": "RDV/Appel/Email/Nurturing/Disqualifier"
}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error calculating score:', error);
            return { 
                score: 50, 
                breakdown: {},
                qualification_status: 'warm',
                missing_info: [],
                next_question: '',
                commercial_potential: 'medium',
                recommended_next_step: 'Continue la qualification'
            };
        }
    }

    /**
     * Determine if conversation should be escalated to human
     */
    async shouldEscalate(message, conversationHistory, extractedContext, intentData) {
        try {
            const prompt = `Tu es un expert en gestion de la relation client.

DERNIER MESSAGE :
"${message}"

INTENTION DÉTECTÉE : ${intentData.primary_intent}
SIGNAUX D'ALERTE : ${JSON.stringify(intentData.warning_signals)}

CONTEXTE DU PROSPECT :
${JSON.stringify(extractedContext, null, 2)}

NOMBRE DE MESSAGES : ${conversationHistory.length}

Détermine si cette conversation doit être ESCALADÉE à un humain.

Réponds en JSON :
{
    "should_escalate": true/false,
    "urgency": "immediate/soon/can_wait",
    "reason": "Raison de l'escalade",
    "escalation_type": "Type d'escalade nécessaire",
    "suggested_message": "Message à envoyer au prospect si escalade",
    "internal_note": "Note pour le commercial qui reprend"
}

RAISONS D'ESCALADER :
- Lead très chaud (score > 80, prêt à acheter)
- Demande spécifique trop complexe
- Négociation de prix avancée
- Demande explicite de parler à un humain
- Client VIP ou gros compte potentiel
- Plainte ou insatisfaction
- Question technique très pointue
- Après 10+ messages sans avancer

NE PAS ESCALADER SI :
- Questions standard
- Qualification en cours normale
- Lead froid ou non qualifié`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error checking escalation:', error);
            return { should_escalate: false, urgency: 'can_wait', reason: '' };
        }
    }

    /**
     * Generate smart follow-up message if no response
     */
    async generateFollowUp(conversationHistory, extractedContext, daysSinceLastMessage, followUpCount) {
        try {
            const lastMessages = conversationHistory.slice(-4);
            const lastAgentMessage = lastMessages.filter(m => m.role === 'assistant').pop();

            const prompt = `Tu es un expert en relance commerciale par SMS.

DERNIERS ÉCHANGES :
${lastMessages.map(m => `${m.role === 'user' ? 'PROSPECT' : 'AGENT'}: ${m.content}`).join('\n')}

DERNIER MESSAGE DE L'AGENT :
"${lastAgentMessage?.content || 'Aucun'}"

CONTEXTE PROSPECT :
- Nom : ${extractedContext.name || 'Inconnu'}
- Entreprise : ${extractedContext.company || 'Inconnue'}
- Intérêt détecté : ${extractedContext.interest_level || 'Inconnu'}
- Problèmes mentionnés : ${JSON.stringify(extractedContext.pain_points || [])}

INFOS RELANCE :
- Jours depuis dernier message : ${daysSinceLastMessage}
- Nombre de relances déjà envoyées : ${followUpCount}

Génère un message de relance adapté.

Réponds en JSON :
{
    "should_follow_up": true/false,
    "message": "Message de relance (<160 chars)",
    "tone": "Ton utilisé (amical/direct/curieux/valeur)",
    "strategy": "Stratégie de la relance",
    "next_follow_up_days": "Jours avant prochaine relance si pas de réponse"
}

RÈGLES :
- Relance 1 (J+1) : Rappel léger, question ouverte
- Relance 2 (J+3) : Apporter de la valeur, info utile
- Relance 3 (J+7) : Dernière chance, FOMO léger
- Après 3 relances : Arrêter (should_follow_up: false)
- Message COURT (<160 chars)
- Pas de "Je me permets de vous relancer"
- Être naturel, pas robotique`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.7
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating follow-up:', error);
            return { 
                should_follow_up: false, 
                message: '', 
                tone: '',
                strategy: '',
                next_follow_up_days: 7
            };
        }
    }

    /**
     * Enhance the AI response with context and intent awareness
     */
    async enhanceResponse(baseResponse, intentData, extractedContext, scoreData) {
        // Add context-aware modifications
        let enhancedResponse = baseResponse;
        
        // If hot lead, make sure we're pushing for action
        if (scoreData.qualification_status === 'hot' && !baseResponse.includes('RDV') && !baseResponse.includes('rdv')) {
            // Agent should be proposing a meeting
            console.log('Hot lead detected - should propose meeting');
        }
        
        // If objection detected, make sure we're addressing it
        if (intentData.primary_intent === 'objection') {
            console.log('Objection detected - ensure response addresses it');
        }
        
        return enhancedResponse;
    }

    /**
     * Full intelligence analysis of a message
     * Returns all insights in one call
     */
    async analyzeMessage(message, conversationHistory, existingContext, agentConfig) {
        try {
            // Run analyses in parallel for speed
            const [contextResult, intentResult] = await Promise.all([
                this.extractContextFromMessage(message, existingContext),
                this.detectIntent(message, conversationHistory)
            ]);

            // Score depends on context, so run after
            const scoreResult = await this.calculateRealtimeScore(
                conversationHistory, 
                contextResult.fullContext, 
                agentConfig
            );

            // Check escalation
            const escalationResult = await this.shouldEscalate(
                message, 
                conversationHistory, 
                contextResult.fullContext, 
                intentResult
            );

            return {
                context: contextResult,
                intent: intentResult,
                score: scoreResult,
                escalation: escalationResult,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error in full analysis:', error);
            return {
                context: { fullContext: existingContext },
                intent: { primary_intent: 'unclear' },
                score: { score: 50 },
                escalation: { should_escalate: false }
            };
        }
    }
}

module.exports = new IntelligenceService();

