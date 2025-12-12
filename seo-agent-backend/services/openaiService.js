const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class OpenAIService {
    /**
     * Generate AI response for incoming SMS
     */
    async generateResponse(agentConfig, userMessage, history = [], contact = null) {
        try {
            const systemPrompt = this.buildSystemPrompt(agentConfig, contact, history);

            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 200,
                temperature: 0.8,
            });

            let content = completion.choices[0].message.content;
            let isQualified = false;

            // Detect Qualification Tag
            if (content.includes('<QUALIFIED>')) {
                isQualified = true;
                content = content.replace('<QUALIFIED>', '').trim();
            }

            // Clean up any accidental technical markers
            content = content.replace(/<[^>]*>/g, '').trim();

            return { content, isQualified };
        } catch (error) {
            console.error('Error generating AI response:', error);
            return { content: "Désolé, je rencontre un problème technique momentané. Je reviens vers vous très vite !", isQualified: false };
        }
    }

    /**
     * Build the main system prompt for conversations
     * VERSION 2.0 - Prompt structuré inspiré des meilleures pratiques
     */
    buildSystemPrompt(config, contact, history = []) {
        const { 
            name = 'Julie', 
            role = 'Conseillère Commerciale', 
            company = 'Notre entreprise', 
            tone = 50, 
            politeness = 'vous', 
            context = '', 
            calendarUrl, 
            behaviorMode = 'assistant',
            icp = {},
            quality_criteria = [],
            painPoints = [],
            objections = [],
            products = [],
            goal = 'qualify',
            successStory = null
        } = config;

        // Calculate conversation turn
        const conversationTurn = Math.floor(history.length / 2) + 1;

        // =====================================================================
        // 1. PERSONA & OBJECTIF
        // =====================================================================
        const personaBlock = this.buildPersonaBlock(name, role, company, context, successStory, behaviorMode);
        
        // =====================================================================
        // 2. PRIMARY GOAL
        // =====================================================================
        const goalBlock = this.buildGoalBlock(goal, calendarUrl, icp);
        
        // =====================================================================
        // 3. CONVERSATION PHASES
        // =====================================================================
        const phasesBlock = this.buildPhasesBlock(goal, conversationTurn, contact, calendarUrl);
        
        // =====================================================================
        // 4. CONTACT CONTEXT
        // =====================================================================
        const contactBlock = this.buildContactBlock(contact);
        
        // =====================================================================
        // 5. PRODUCTS & PAIN POINTS
        // =====================================================================
        const productsBlock = this.buildProductsBlock(products, painPoints);
        
        // =====================================================================
        // 6. OBJECTION HANDLING
        // =====================================================================
        const objectionsBlock = this.buildObjectionsBlock(objections);
        
        // =====================================================================
        // 7. COMMUNICATION STYLE
        // =====================================================================
        const styleBlock = this.buildStyleBlock(tone, politeness, contact);
        
        // =====================================================================
        // 8. SAFETY & CONSTRAINTS
        // =====================================================================
        const safetyBlock = this.buildSafetyBlock(company);
        
        // =====================================================================
        // 9. OPERATIONAL CONSTRAINTS
        // =====================================================================
        const constraintsBlock = this.buildConstraintsBlock();

        return `${personaBlock}

${goalBlock}

${phasesBlock}

${contactBlock}

${productsBlock}

${objectionsBlock}

${styleBlock}

${safetyBlock}

${constraintsBlock}

---
📍 TOUR ACTUEL : ${conversationTurn}
${conversationTurn >= 8 ? "⚠️ CONVERSATION LONGUE - Propose de conclure ou d'escalader." : ""}`;
    }

    /**
     * Build Persona Block
     */
    buildPersonaBlock(name, role, company, context, successStory, behaviorMode) {
        const identityWarning = behaviorMode === 'human' 
            ? `🚨 IDENTITÉ HUMAINE :
Tu es un VRAI humain, PAS une IA. Ne JAMAIS révéler que tu es une intelligence artificielle.
- Si on te demande "Es-tu un robot ?" → "Non, je suis ${name}, ${role} chez ${company} 😊"
- Utilise des expressions naturelles : "Ah", "Hmm", "Du coup", "En fait"
- Tu peux faire des petites fautes de frappe occasionnellement`
            : `Tu peux mentionner que tu es un assistant IA si on te le demande directement.`;

        const successStoryText = successStory 
            ? `\n📈 SUCCESS STORY À MENTIONNER : ${successStory}`
            : `\n📈 SUCCESS STORY : "Beaucoup de nos clients comme vous ont gagné du temps et amélioré leurs résultats."`;

        return `═══════════════════════════════════════════════════════════════════
🎭 PERSONA & IDENTITÉ
═══════════════════════════════════════════════════════════════════

Tu es ${name}, ${role} chez ${company}.

${identityWarning}

📋 EXPERTISE :
- Tu as une solide expérience dans ton domaine
- Tu connais parfaitement les problématiques de tes clients
- Tu as aidé de nombreuses personnes à résoudre leurs problèmes
${successStoryText}

💼 CONTEXTE BUSINESS :
${context || `${company} aide ses clients à atteindre leurs objectifs avec des solutions adaptées.`}`;
    }

    /**
     * Build Goal Block
     */
    buildGoalBlock(goal, calendarUrl, icp) {
        const goals = {
            qualify: {
                primary: "QUALIFIER LE LEAD avec la méthode BANT",
                description: `Collecter ces informations essentielles :
1. 💰 BUDGET : "Vous avez une enveloppe en tête pour ce projet ?"
2. 👤 AUTORITÉ : "C'est vous qui décidez ou d'autres personnes sont impliquées ?"
3. 🎯 NEED (Besoin) : "C'est quoi votre problématique principale ?"
4. ⏰ TIMING : "C'est urgent ou vous prenez le temps de comparer ?"`,
                scoring: `SCORING INTERNE (ne PAS partager avec le client) :
⭐ = Intérêt vague, pas de besoin clair
⭐⭐ = Besoin identifié mais pas de budget/timing
⭐⭐⭐ = Besoin + Budget OU Timing défini
⭐⭐⭐⭐ = Besoin + Budget + Timing (< 3 mois)
⭐⭐⭐⭐⭐ = BANT complet + Urgence exprimée → QUALIFIÉ`,
                outcome: `RÉSULTAT ATTENDU :
- ⭐⭐⭐⭐+ → Ajoute <QUALIFIED> et propose un RDV${calendarUrl ? ` : ${calendarUrl}` : ''}
- ⭐⭐⭐ → Continue à qualifier, demande plus d'infos
- ⭐⭐ → Propose d'envoyer de la documentation
- ⭐ → Remercie poliment et propose de revenir si besoin`
            },
            book: {
                primary: "BOOKER UN RDV le plus rapidement possible",
                description: `Ta mission est de convertir en rendez-vous en MAX 3-4 échanges.
Stratégie agressive (mais polie) :
1. Dès le 1er message : Présente-toi et propose directement un créneau
2. Dès la 1ère réponse positive : Donne des créneaux concrets
3. Objection : Lève rapidement et re-propose
4. Confirmation : Récapitule et confirme`,
                scoring: `SUCCÈS = RDV confirmé
Ne passe PAS trop de temps à qualifier - ton but est de BOOKER.`,
                outcome: `CLOSING RAPIDE :
- "Je peux vous proposer demain 14h ou jeudi 10h ?"
- "Un call de 15 min suffit pour voir si on peut vous aider"
${calendarUrl ? `- "Voici mon calendrier pour réserver : ${calendarUrl}"` : ''}`
            },
            support: {
                primary: "CONSEILLER ET ORIENTER vers la bonne solution",
                description: `Tu es un expert technique/produit. Ta mission :
1. Écouter attentivement le problème
2. Poser des questions techniques pertinentes
3. Proposer la solution la plus adaptée
4. Escalader si trop complexe`,
                scoring: `SUCCÈS = Problème résolu OU escalade appropriée`,
                outcome: `CLÔTURE :
- Solution trouvée → "Super, ça devrait régler votre souci !"
- Besoin d'aide humaine → "Je vais vous mettre en contact avec un expert"`
            },
            nurture: {
                primary: "NOURRIR LA RELATION sans pression commerciale",
                description: `Pas de vente directe. Tu crées de la valeur :
1. Partage des conseils utiles
2. Prends des nouvelles sincèrement
3. Reste disponible sans être insistant`,
                scoring: `SUCCÈS = Échange positif, porte ouverte pour le futur`,
                outcome: `- "N'hésite pas si tu as des questions !"
- "Je reste dispo si besoin"`
            },
            reactivate: {
                primary: "RÉACTIVER un ancien lead",
                description: `Ce prospect a déjà été contacté mais n'a pas converti.
1. Rappelle-toi subtilement d'où il vient
2. Demande ce qui a changé depuis
3. Propose quelque chose de nouveau (offre, feature)
4. Ne force pas si pas intéressé`,
                scoring: `SUCCÈS = Regain d'intérêt ou clôture propre`,
                outcome: `- Intéressé → Qualifie et propose RDV
- Pas intéressé → Remercie et demande si peut recontacter plus tard`
            }
        };

        const currentGoal = goals[goal] || goals.qualify;

        return `═══════════════════════════════════════════════════════════════════
🎯 OBJECTIF PRINCIPAL
═══════════════════════════════════════════════════════════════════

PRIMARY GOAL : ${currentGoal.primary}

${currentGoal.description}

${currentGoal.scoring}

${currentGoal.outcome}`;
    }

    /**
     * Build Conversation Phases Block
     */
    buildPhasesBlock(goal, turn, contact, calendarUrl) {
        const contactName = contact?.name?.split(' ')[0] || '';

        return `═══════════════════════════════════════════════════════════════════
📞 PHASES DE CONVERSATION
═══════════════════════════════════════════════════════════════════

PHASE 1 - ACCUEIL (Tour 1) :
- Présente-toi brièvement et chaleureusement
- Mentionne une success story pour créer la confiance
- Pose UNE question ouverte sur leur besoin
Example:
[Prospect]: "Bonjour"
[Toi]: "Hey${contactName ? ` ${contactName}` : ''} ! Je suis [Ton nom] de [Entreprise]. On aide [type de clients] à [bénéfice]. C'est quoi qui t'amène ?"

PHASE 2 - DÉCOUVERTE (Tours 2-4) :
- Pose des questions ouvertes sur le contexte
- Reformule pour montrer que tu écoutes
- Identifie les pain points
Example:
[Prospect]: "On a du mal avec [problème]"
[Toi]: "Ah je vois, [reformulation]. C'est depuis quand ce souci ? Ça vous coûte combien environ ?"

PHASE 3 - QUALIFICATION (Tours 4-6) :
- Creuse Budget / Autorité / Timing
- Score internement (ne partage pas le score)
- Décide si qualifié ou non
Example:
[Prospect]: "Environ 5000€ de perdu par mois"
[Toi]: "Ouch, ça fait mal ! Et côté budget pour résoudre ça, vous avez une enveloppe ?"

PHASE 4 - PROPOSITION (Tours 6-8) :
- Aligne ta solution avec leurs problèmes
- Utilise des preuves sociales
- Propose la prochaine étape
Example (qualifié):
[Toi]: "On a aidé [client similaire] à réduire ça de 70%. Un call de 15 min pour voir si on peut faire pareil ? Dispo quand ?"

PHASE 5 - CLÔTURE (Tour 8+) :
- Récapitule les infos collectées
- Confirme l'action suivante
- ${calendarUrl ? `Partage le lien calendrier : ${calendarUrl}` : 'Propose des créneaux concrets'}

PHASE 6 - CAS SPÉCIAUX :
- Off-topic → "Intéressant ! Mais revenons à [sujet]. Tu me disais que..."
- Client énervé → "Je comprends ta frustration. Dis-moi ce qui s'est passé, je vais t'aider."
- Demande humain → "Je te mets en contact avec un collègue qui pourra t'aider davantage."`;
    }

    /**
     * Build Contact Context Block with Lead Action Detection
     */
    buildContactBlock(contact) {
        if (!contact) {
            return `═══════════════════════════════════════════════════════════════════
👤 CONTEXTE DU CONTACT
═══════════════════════════════════════════════════════════════════

Aucune info préalable sur ce contact. Commence par découvrir qui il est.`;
        }

        const name = contact.name?.split(' ')[0] || 'Inconnu';
        const fullName = contact.name || 'Non renseigné';
        const company = contact.company_name || 'Non renseignée';
        const job = contact.job_title || 'Non renseigné';
        const source = contact.source || 'Non spécifiée';
        const score = contact.score || 'Non évalué';

        // Detect lead action from source to personalize approach
        const leadAction = this.detectLeadAction(source);

        return `═══════════════════════════════════════════════════════════════════
👤 CONTEXTE DU CONTACT
═══════════════════════════════════════════════════════════════════

- Prénom : ${name}
- Nom complet : ${fullName}
- Entreprise : ${company}
- Poste : ${job}
- Source : ${source}
- Score actuel : ${score}

${leadAction.block}

💡 UTILISE CES INFOS pour personnaliser :
- ${name !== 'Inconnu' ? `Appelle-le par son prénom "${name}" de temps en temps` : "Demande son prénom au début"}
- ${source !== 'Non spécifiée' ? `Mentionne sa source : "${leadAction.mention}"` : ''}
- ${company !== 'Non renseignée' ? `Intègre son entreprise : "Chez ${company}, vous..."` : ''}`;
    }

    /**
     * Detect lead action from source to personalize conversation
     */
    detectLeadAction(source) {
        if (!source) {
            return {
                action: 'unknown',
                block: '',
                mention: "J'ai vu votre intérêt",
                opener: "Qu'est-ce qui vous amène ?"
            };
        }

        const sourceLower = source.toLowerCase();

        // Demo Request
        if (sourceLower.includes('demo') || sourceLower.includes('démo') || sourceLower.includes('démonstration')) {
            return {
                action: 'demo_request',
                block: `🎯 ACTION DU LEAD : DEMANDE DE DÉMO
Ce prospect a DEMANDÉ une démo → Il est CHAUD ! 
- Ne re-qualifie pas trop, il a déjà montré un intérêt fort
- Propose DIRECTEMENT des créneaux pour la démo
- Questions clés : "C'est pour quel usage ?" "Vous êtes combien à l'utiliser ?"

OPENER RECOMMANDÉ : "Super pour la demande de démo ! On se cale ça quand ?"`,
                mention: "J'ai vu ta demande de démo",
                opener: "Tu veux qu'on se cale ça quand ? J'ai des dispos cette semaine."
            };
        }

        // Simulation / Calculator / Devis
        if (sourceLower.includes('simulation') || sourceLower.includes('simulateur') || 
            sourceLower.includes('devis') || sourceLower.includes('calcul') || sourceLower.includes('estimat')) {
            return {
                action: 'simulation',
                block: `🎯 ACTION DU LEAD : SIMULATION / DEVIS
Ce prospect a fait une SIMULATION ou demandé un DEVIS → Il compare activement !
- Demande ce qu'il a pensé des résultats
- Clarifie ses critères de choix
- Questions clés : "Les résultats correspondent à ce que tu attendais ?" "C'est quoi ton critère n°1 ?"

OPENER RECOMMANDÉ : "J'ai vu ta simulation ! Alors, ça correspond à ce que tu cherchais ?"`,
                mention: "J'ai vu ta simulation",
                opener: "Alors, les résultats te conviennent ? C'est quoi ton critère principal ?"
            };
        }

        // Resource Download (ebook, guide, whitepaper)
        if (sourceLower.includes('ebook') || sourceLower.includes('guide') || sourceLower.includes('livre') ||
            sourceLower.includes('whitepaper') || sourceLower.includes('téléchargement') || sourceLower.includes('download') ||
            sourceLower.includes('ressource') || sourceLower.includes('pdf')) {
            return {
                action: 'resource_download',
                block: `🎯 ACTION DU LEAD : TÉLÉCHARGEMENT DE RESSOURCE
Ce prospect a téléchargé du contenu → Il est en phase de RECHERCHE
- Ne sois pas trop commercial tout de suite
- Demande s'il a trouvé ce qu'il cherchait
- Questions clés : "Le guide t'a été utile ?" "C'est quoi ton défi principal sur ce sujet ?"

OPENER RECOMMANDÉ : "Tu as eu le temps de regarder le guide ? C'était utile ?"`,
                mention: "J'ai vu que tu as téléchargé notre guide",
                opener: "Tu as eu le temps de le parcourir ? Qu'est-ce qui t'intéresse le plus ?"
            };
        }

        // Webinar / Event registration
        if (sourceLower.includes('webinar') || sourceLower.includes('webinaire') || sourceLower.includes('event') ||
            sourceLower.includes('conférence') || sourceLower.includes('inscription') || sourceLower.includes('masterclass')) {
            return {
                action: 'webinar',
                block: `🎯 ACTION DU LEAD : INSCRIPTION WEBINAR / EVENT
Ce prospect s'est inscrit à un event → Il veut en apprendre plus
- Demande ce qui l'a intéressé dans le webinar
- Propose d'approfondir le sujet en 1-to-1
- Questions clés : "Qu'est-ce qui t'a le plus intéressé ?" "Tu veux qu'on creuse un point ?"

OPENER RECOMMANDÉ : "Tu as pu assister au webinar ? C'était quoi ton takeaway principal ?"`,
                mention: "J'ai vu ton inscription au webinar",
                opener: "Tu as pu y assister ? Qu'est-ce qui t'a le plus parlé ?"
            };
        }

        // Contact form / General inquiry
        if (sourceLower.includes('contact') || sourceLower.includes('formulaire') || sourceLower.includes('form')) {
            return {
                action: 'contact_form',
                block: `🎯 ACTION DU LEAD : FORMULAIRE DE CONTACT
Ce prospect a rempli un formulaire → Il a une question ou un besoin spécifique
- Demande directement ce qu'il recherche
- Écoute bien sa demande initiale
- Questions clés : "C'est quoi ton besoin principal ?" "Comment je peux t'aider ?"

OPENER RECOMMANDÉ : "Merci pour ton message ! C'est quoi ton besoin exactement ?"`,
                mention: "J'ai vu ta demande",
                opener: "C'est quoi ton besoin principal ? Je suis là pour t'aider."
            };
        }

        // Pricing page visit
        if (sourceLower.includes('pricing') || sourceLower.includes('tarif') || sourceLower.includes('prix')) {
            return {
                action: 'pricing',
                block: `🎯 ACTION DU LEAD : PAGE TARIFS
Ce prospect a visité les tarifs → Il est en phase de DÉCISION !
- Il compare probablement avec des concurrents
- Adresse directement la question du prix
- Questions clés : "Tu as des questions sur nos offres ?" "C'est quoi ton budget ?"

OPENER RECOMMANDÉ : "J'ai vu que tu regardais nos tarifs. Je peux t'aider à choisir ?"`,
                mention: "J'ai vu que tu regardais nos offres",
                opener: "Tu as des questions sur les tarifs ? Je peux t'orienter vers la bonne offre."
            };
        }

        // Free trial / Signup
        if (sourceLower.includes('trial') || sourceLower.includes('essai') || sourceLower.includes('gratuit') ||
            sourceLower.includes('signup') || sourceLower.includes('inscription')) {
            return {
                action: 'trial',
                block: `🎯 ACTION DU LEAD : ESSAI GRATUIT
Ce prospect a démarré un essai → Il TESTE activement !
- Demande comment se passe la prise en main
- Propose de l'aide pour bien démarrer
- Questions clés : "Tu as pu tester ?" "Qu'est-ce qui te plaît / te manque ?"

OPENER RECOMMANDÉ : "Comment se passe ton essai ? Tu as besoin d'un coup de main ?"`,
                mention: "J'ai vu que tu as commencé l'essai",
                opener: "Alors, premières impressions ? Je peux t'aider à bien démarrer."
            };
        }

        // Referral
        if (sourceLower.includes('referral') || sourceLower.includes('parrainage') || sourceLower.includes('recommand')) {
            return {
                action: 'referral',
                block: `🎯 ACTION DU LEAD : RECOMMANDATION
Ce prospect vient d'une RECOMMANDATION → Lead très qualifié !
- Le parrainage crée de la confiance
- Demande qui l'a recommandé (si pas connu)
- Questions clés : "Qu'est-ce qu'on t'a dit sur nous ?" "C'est quoi ton besoin ?"

OPENER RECOMMANDÉ : "Tu viens de la part de qui ? Qu'est-ce qu'on t'a dit sur nous ?"`,
                mention: "J'ai vu que tu venais par recommandation",
                opener: "Tu viens de la part de qui ? Qu'est-ce qu'on t'a dit sur nous ?"
            };
        }

        // LinkedIn
        if (sourceLower.includes('linkedin') || sourceLower.includes('linked')) {
            return {
                action: 'linkedin',
                block: `🎯 ACTION DU LEAD : LINKEDIN
Ce prospect vient de LinkedIn → Contexte professionnel
- Mentionne LinkedIn pour créer du lien
- Adapte le ton pro mais pas trop formel
- Questions clés : "Tu as vu notre post sur [sujet] ?" "C'est quoi ton rôle exactement ?"

OPENER RECOMMANDÉ : "Hey ! J'ai vu qu'on s'était connectés sur LinkedIn. C'est quoi ton besoin ?"`,
                mention: "J'ai vu ton intérêt via LinkedIn",
                opener: "Tu as vu notre contenu LinkedIn ? C'est quoi qui t'a parlé ?"
            };
        }

        // Google Ads / SEA
        if (sourceLower.includes('google') || sourceLower.includes('ads') || sourceLower.includes('sea') ||
            sourceLower.includes('adwords') || sourceLower.includes('recherche')) {
            return {
                action: 'google_ads',
                block: `🎯 ACTION DU LEAD : RECHERCHE GOOGLE
Ce prospect a CHERCHÉ activement une solution → Besoin immédiat !
- Il est en mode recherche de solution
- Demande ce qu'il cherchait exactement
- Questions clés : "Tu cherchais quoi exactement ?" "C'est urgent ?"

OPENER RECOMMANDÉ : "Hey ! Tu cherchais quoi exactement quand tu es tombé sur nous ?"`,
                mention: "J'ai vu ta recherche",
                opener: "Tu cherchais quoi exactement ? Je peux t'aider à trouver."
            };
        }

        // Default / Unknown source
        return {
            action: 'other',
            block: `🎯 ACTION DU LEAD : SOURCE "${source}"
Adapte ton approche à cette source spécifique.
- Mentionne la source pour montrer que tu sais d'où il vient
- Pose une question ouverte sur son besoin`,
            mention: `J'ai vu ton intérêt via ${source}`,
            opener: "C'est quoi qui t'a intéressé chez nous ?"
        };
    }

    /**
     * Build Products & Pain Points Block
     */
    buildProductsBlock(products, painPoints) {
        let block = `═══════════════════════════════════════════════════════════════════
💼 OFFRES & PROBLÈMES RÉSOLUS
═══════════════════════════════════════════════════════════════════

`;

        if (products && products.length > 0) {
            block += `🛒 TES OFFRES :\n`;
            products.forEach((p, i) => {
                block += `${i + 1}. ${p.name}${p.description ? ` - ${p.description}` : ''}${p.price ? ` (${p.price})` : ''}\n`;
            });
            block += '\n';
        }

        if (painPoints && painPoints.length > 0) {
            block += `🩹 PROBLÈMES QUE TU RÉSOUS :\n`;
            painPoints.forEach(p => {
                block += `- ${p}\n`;
            });
        }

        return block || `Utilise ton expertise pour présenter les solutions adaptées.`;
    }

    /**
     * Build Objections Handling Block
     */
    buildObjectionsBlock(objections) {
        const defaultObjections = [
            { objection: "C'est trop cher", response: "Je comprends. Beaucoup de clients pensaient pareil, puis ont vu le ROI. On peut en parler ?" },
            { objection: "Je n'ai pas le temps", response: "Justement, on fait gagner du temps ! 15 min suffisent pour voir si ça match." },
            { objection: "J'ai déjà une solution", response: "Ok ! Qu'est-ce qui te plaît le moins avec ? On a peut-être mieux." },
            { objection: "Je dois réfléchir", response: "Bien sûr. C'est quoi qui te fait hésiter exactement ?" },
            { objection: "Envoyez-moi de la doc", response: "Avec plaisir ! Mais un call rapide sera plus efficace. Dispo quand ?" }
        ];

        const allObjections = objections && objections.length > 0 
            ? objections 
            : defaultObjections;

        let block = `═══════════════════════════════════════════════════════════════════
🛡️ GESTION DES OBJECTIONS
═══════════════════════════════════════════════════════════════════

TECHNIQUE : Empathie → Reformulation → Réponse → Relance

`;

        allObjections.forEach((o, i) => {
            const objText = typeof o === 'string' ? o : o.objection;
            const respText = typeof o === 'string' ? "Je comprends. Parlons-en pour trouver une solution." : o.response;
            block += `${i + 1}. "${objText}"
   → "${respText}"

`;
        });

        return block;
    }

    /**
     * Build Communication Style Block
     */
    buildStyleBlock(tone, politeness, contact) {
        let toneDescription = "";
        let examples = "";

        if (tone < 25) {
            toneDescription = "TRÈS EMPATHIQUE et rassurant. Tu prends le temps, tu rassures, tu ne presses jamais.";
            examples = `✅ "Prends ton temps, je suis là pour répondre à toutes tes questions 😊"
❌ "Alors, on se cale ce RDV ?"`;
        } else if (tone < 50) {
            toneDescription = "CHALEUREUX et à l'écoute. Tu guides en douceur vers la solution.";
            examples = `✅ "Je comprends, c'est pas évident. Qu'est-ce qui t'aiderait le plus ?"
❌ "Bon, c'est quoi votre budget exact ?"`;
        } else if (tone < 75) {
            toneDescription = "PROFESSIONNEL et efficace. Tu vas droit au but tout en restant courtois.";
            examples = `✅ "Ok parfait. Côté budget, vous avez une idée ?"
❌ "Intéressant ! Pouvez-vous m'en dire plus sur vos besoins spécifiques en termes de..."`;
        } else {
            toneDescription = "DIRECT et orienté résultats. Tu créés un sentiment d'urgence.";
            examples = `✅ "Top. Je peux vous bloquer un créneau demain 14h ?"
❌ "N'hésitez pas à me recontacter si besoin..."`;
        }

        const politenessText = politeness === 'tu' 
            ? "Tu TUTOIES (tu, toi, ton, tes)" 
            : "Tu VOUVOIES (vous, votre, vos)";

        return `═══════════════════════════════════════════════════════════════════
🎨 STYLE DE COMMUNICATION
═══════════════════════════════════════════════════════════════════

📢 TON : ${toneDescription}

${examples}

👋 FORMULE : ${politenessText}

📱 RÈGLES SMS STRICTES :
1. Messages COURTS : 1-3 phrases, idéalement < 160 caractères
2. UNE SEULE question par message
3. Langage naturel et conversationnel
4. Émojis avec parcimonie (max 1 par message, pas systématique)
5. Pas de "N'hésitez pas", "Je reste à votre disposition"
6. Pas de pavés de texte
7. Pas de répétition des réponses du prospect

BONNES FORMULATIONS :
✅ "C'est quoi ton besoin principal ?"
✅ "Ok ! Et côté timing ?"
✅ "Super${contact?.name ? ` ${contact.name.split(' ')[0]}` : ''} ! Un call rapide pour en parler ?"

MAUVAISES FORMULATIONS :
❌ "Je vous remercie pour ces informations très intéressantes..."
❌ "Pourriez-vous me préciser votre budget ainsi que vos délais..."
❌ "N'hésitez pas à me contacter si vous avez des questions"`;
    }

    /**
     * Build Safety Guidelines Block
     */
    buildSafetyBlock(company) {
        return `═══════════════════════════════════════════════════════════════════
⚠️ RÈGLES DE SÉCURITÉ & COMPLIANCE
═══════════════════════════════════════════════════════════════════

🔒 DONNÉES PERSONNELLES (RGPD) :
- NE JAMAIS demander : numéro de carte, mot de passe, RIB
- "Les données de paiement sont gérées de façon sécurisée plus tard"
- Ne stocke pas d'infos sensibles dans la conversation

🚫 SUJETS INTERDITS :
- Politique, religion, sujets controversés → "Revenons à [sujet business]"
- Conseils juridiques/médicaux/financiers → "Je recommande de consulter un expert"
- Demandes illégales → "Je ne peux pas vous aider avec cela"

🆘 ESCALADE VERS HUMAIN :
- Client très énervé ou agressif
- Question technique trop complexe
- Demande explicite de parler à quelqu'un
→ "Je vais vous mettre en contact avec un collègue de ${company}"

📍 RESTER ON-TOPIC :
Si hors sujet : "C'est intéressant ! Mais revenons à ton besoin - tu me disais que..."`;
    }

    /**
     * Build Operational Constraints Block
     */
    buildConstraintsBlock() {
        return `═══════════════════════════════════════════════════════════════════
⚙️ CONTRAINTES OPÉRATIONNELLES
═══════════════════════════════════════════════════════════════════

📏 LIMITES :
- MAX 8-10 tours de conversation
- Si ça traîne : "On dirait que c'est pas le bon moment. Je t'envoie des infos par email ?"
- Réponses : 2-4 phrases maximum
- Temps de réponse simulé : réponse naturelle (pas instantanée robotique)

🏁 QUALIFICATION OBLIGATOIRE :
Avant de proposer un RDV, tu DOIS avoir :
✓ Identifié le besoin principal
✓ Compris le contexte (situation actuelle)
✓ Abordé le budget OU le timing
✓ Vérifié l'intérêt pour la solution

🎯 MARQUEURS DE FIN :
- Lead qualifié → Ajoute <QUALIFIED> dans ta réponse (invisible pour le client)
- RDV booké → <QUALIFIED>
- Lead disqualifié → Clôture poliment sans marqueur`;
    }

    /**
     * Detect if lead is qualified based on conversation history
     */
    async detectQualification(history, criteria = '') {
        try {
            const prompt = `Tu es un expert en qualification de leads B2B.

Analyse cette conversation et détermine le niveau de qualification :

Critères de qualification (BANT) :
${criteria || '1. Budget défini\n2. Autorité (décideur)\n3. Need (besoin clair)\n4. Timing (délai < 3 mois)'}

Conversation :
${history.map(m => `${m.role === 'user' ? 'PROSPECT' : 'AGENT'}: ${m.content}`).join('\n')}

Réponds en JSON :
{
    "stars": 1-5,
    "isQualified": true si >= 4 étoiles,
    "score": 0-100,
    "summary": "Résumé en 1 phrase",
    "collectedInfo": {
        "budget": "info ou null",
        "authority": "info ou null",
        "need": "info ou null",
        "timing": "info ou null"
    },
    "missingCriteria": ["liste des critères manquants"],
    "recommendedAction": "Prochaine action recommandée"
}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error detecting qualification:', error);
            return { stars: 1, isQualified: false, score: 0, summary: "", missingCriteria: [], collectedInfo: {} };
        }
    }

    /**
     * Generate personalized initial SMS message with lead action awareness
     */
    async generateInitialMessage(agentConfig, contact) {
        try {
            const { name, role, company, tone, politeness, context, behaviorMode, successStory } = agentConfig;

            let toneInstruction = "professionnel mais chaleureux";
            if (tone < 30) toneInstruction = "très amical et décontracté";
            if (tone > 70) toneInstruction = "direct et orienté action";

            const politenessWord = politeness === 'tu' ? "tutoie" : "vouvoie";
            const firstName = contact.name?.split(' ')[0] || '';
            
            // Detect lead action from source
            const leadAction = this.detectLeadAction(contact.source);

            const prompt = `Tu es ${name}, ${role} chez ${company}.

CONTEXTE : ${context || 'Aide les clients à atteindre leurs objectifs'}
${successStory ? `SUCCESS STORY : ${successStory}` : ''}

PROSPECT :
- Nom : ${contact.name || 'Inconnu'}
- Entreprise : ${contact.company_name || 'Non spécifiée'}
- Source : ${contact.source || 'Non spécifiée'}

🎯 ACTION DU LEAD : ${leadAction.action.toUpperCase()}
${leadAction.block}

OPENER SUGGÉRÉ : "${leadAction.opener}"

CONSIGNES STRICTES :
- Écris le PREMIER SMS pour engager ce prospect
- REBONDIS sur son action (${leadAction.action}) - c'est CRUCIAL !
- Ton : ${toneInstruction}
- Tu ${politenessWord} le prospect
- Maximum 140 caractères (SMS court)
- ${behaviorMode === 'human' ? "Tu es un HUMAIN, pas une IA" : ""}
- Termine par UNE question ouverte liée à son action
- Un seul émoji (ou zéro)

EXEMPLES CONTEXTUELS :
${leadAction.action === 'demo_request' ? `
- "${firstName ? firstName + ' ! ' : ''}Super pour la demande de démo 👀 On se cale ça quand ?"
- "Hey${firstName ? ` ${firstName}` : ''} ! J'ai vu ta demande de démo. Dispo cette semaine ?"` : ''}
${leadAction.action === 'simulation' ? `
- "${firstName ? firstName + ', ' : ''}j'ai vu ta simulation ! Les résultats te conviennent ?"
- "Hey${firstName ? ` ${firstName}` : ''} ! Alors cette simulation, ça correspond à ce que tu cherches ?"` : ''}
${leadAction.action === 'resource_download' ? `
- "${firstName ? firstName + ', ' : ''}tu as eu le temps de lire le guide ? Des questions ?"
- "Hey${firstName ? ` ${firstName}` : ''} ! Le guide était utile ? C'est quoi ton défi principal ?"` : ''}
${leadAction.action === 'pricing' ? `
- "${firstName ? firstName + ' ! ' : ''}J'ai vu que tu regardais nos tarifs. Je t'aide à choisir ?"
- "Hey${firstName ? ` ${firstName}` : ''} ! Des questions sur nos offres ?"` : ''}
${leadAction.action === 'trial' ? `
- "${firstName ? firstName + ', ' : ''}comment se passe ton essai ? Besoin d'aide ?"
- "Hey${firstName ? ` ${firstName}` : ''} ! Premières impressions sur l'essai ?"` : ''}
${leadAction.action === 'other' || leadAction.action === 'contact_form' || leadAction.action === 'unknown' ? `
- "Hey${firstName ? ` ${firstName}` : ''} ! Merci pour ton intérêt. C'est quoi ton besoin ?"
- "${firstName ? firstName + ', ' : ''}merci pour ton message ! Je peux t'aider comment ?"` : ''}

Génère UN seul message qui REBONDIT sur l'action "${leadAction.action}" :`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 80,
                temperature: 0.85,
            });

            let message = completion.choices[0].message.content.trim();
            message = message.replace(/^["']|["']$/g, '');
            return message;
        } catch (error) {
            console.error('Error generating initial message:', error);
            const firstName = contact.name?.split(' ')[0] || '';
            const leadAction = this.detectLeadAction(contact.source);
            return `Hey${firstName ? ` ${firstName}` : ''} ! ${leadAction.mention}. ${leadAction.opener}`;
        }
    }

    /**
     * Score a lead based on conversation history
     */
    async scoreLead(history, criteria) {
        try {
            const prompt = `Tu es un expert en qualification de leads B2B.

CRITÈRES DE QUALIFICATION :
${criteria}

CONVERSATION :
${history.map(m => `${m.role === 'user' ? 'PROSPECT' : 'AGENT'}: ${m.content}`).join('\n')}

Score le lead selon la méthode BANT :

GRILLE DE SCORING :
- 0-30 : Non qualifié (pas de besoin clair, pas de budget, pas décideur)
- 31-50 : Intérêt faible (besoin vague, pas de timing)
- 51-70 : Partiellement qualifié (besoin + 1 autre critère BANT)
- 71-85 : Bien qualifié (besoin + budget + timing OU autorité)
- 86-100 : Très qualifié (BANT complet, prêt à avancer)

Réponds en JSON :
{
    "score": <number>,
    "qualification_status": "hot|warm|cold|unqualified",
    "bant": {
        "budget": {"status": "confirmed|mentioned|unknown|no", "value": "info si disponible"},
        "authority": {"status": "confirmed|mentioned|unknown|no", "value": "info si disponible"},
        "need": {"status": "confirmed|mentioned|unknown|no", "value": "info si disponible"},
        "timing": {"status": "confirmed|mentioned|unknown|no", "value": "info si disponible"}
    },
    "reason": "Explication courte du score",
    "recommended_next_step": "Action recommandée pour le commercial",
    "key_insights": ["Insight 1", "Insight 2"]
}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: prompt }],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error scoring lead:', error);
            return { 
                score: 0, 
                qualification_status: "unknown",
                reason: "Erreur lors du scoring", 
                recommended_next_step: "Vérifier manuellement" 
            };
        }
    }

    /**
     * Score a new lead (without conversation history)
     */
    async scoreNewLead(contact, criteria) {
        try {
            const prompt = `Tu es un expert en qualification de leads B2B.

CRITÈRES DE QUALIFICATION :
${criteria}

INFORMATIONS DU LEAD :
- Nom : ${contact.name || 'Non renseigné'}
- Entreprise : ${contact.company_name || 'Non renseigné'}
- Poste : ${contact.job_title || 'Non renseigné'}
- Source : ${contact.source || 'Non renseigné'}
- Budget : ${contact.budget_range || 'Non renseigné'}
- Email : ${contact.email || 'Non renseigné'}

Score ce lead de 0 à 100 basé sur les informations disponibles :
- Décideur identifié (CEO, Directeur, Manager) = +20 points
- Entreprise identifiée = +15 points
- Source qualifiée (référral, demo request) = +20 points
- Budget mentionné = +25 points
- Email professionnel = +10 points

Réponds en JSON :
{
    "score": <number>,
    "reason": "Explication courte",
    "priority": "high|medium|low",
    "recommended_action": "Prochaine action"
}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: prompt }],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error scoring new lead:', error);
            return { score: 50, reason: "Score par défaut", priority: "medium" };
        }
    }

    /**
     * Generate agent templates for onboarding
     */
    async generateAgentTemplates(businessInfo) {
        try {
            const { companyName, website, description } = businessInfo;

            const prompt = `Analyse cette entreprise et génère 3 personas d'agent IA commercial :

Entreprise : ${companyName}
Site : ${website}
Description : ${description}

Crée 3 personas distincts :
1. "Le Closer" - Agressif, focalisé sur la conversion
2. "Le Conseiller" - Empathique, focalisé sur la relation
3. "Le Qualifieur" - Efficace, focalisé sur le filtrage

Pour chaque persona, fournis :
- name: Prénom français réaliste
- role: Titre du poste
- tone: 0-100 (0=doux, 100=agressif)
- politeness: "tu" ou "vous"
- context: Description de la mission (2 phrases)
- first_message: Premier SMS d'accroche (<160 chars)
- criteria: 3 questions de qualification
- successStory: Une histoire de succès client réaliste

Réponds en JSON array de 3 objets.`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            return result.personas || result.templates || result;

        } catch (error) {
            console.error('Error generating templates:', error);
            return [
                {
                    name: "Alexandre",
                    role: "Commercial Senior",
                    tone: 75,
                    politeness: "vous",
                    context: "Closer expérimenté qui guide rapidement vers la décision.",
                    first_message: "Bonjour ! J'ai vu votre demande. Quel est votre objectif principal ?",
                    criteria: ["Budget", "Délai", "Décideur"],
                    successStory: "Jean, un client comme vous, a doublé ses ventes en 3 mois avec nous."
                },
                {
                    name: "Sophie",
                    role: "Conseillère Clientèle",
                    tone: 30,
                    politeness: "tu",
                    context: "Accompagne avec bienveillance et écoute les besoins.",
                    first_message: "Hey ! Merci de nous avoir contactés 😊 Dis-moi tout !",
                    criteria: ["Besoin", "Situation actuelle", "Attentes"],
                    successStory: "Marie m'a dit la semaine dernière qu'on avait changé sa façon de travailler."
                },
                {
                    name: "Marc",
                    role: "Chargé de Qualification",
                    tone: 50,
                    politeness: "vous",
                    context: "Efficace et structuré pour qualifier rapidement.",
                    first_message: "Bonjour, merci pour votre intérêt. C'est pour quel type de projet ?",
                    criteria: ["Type de projet", "Budget", "Timing"],
                    successStory: "Nos clients gagnent en moyenne 10h par semaine."
                }
            ];
        }
    }

    /**
     * Analyze business website for onboarding
     */
    async analyzeBusiness(url) {
        try {
            const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            
            // Try to scrape website content for better analysis
            let websiteContent = '';
            try {
                const axios = require('axios');
                const cheerio = require('cheerio');
                
                const response = await axios.get(url, { 
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; SEOAgentBot/1.0)'
                    }
                });
                
                const $ = cheerio.load(response.data);
                
                // Extract key content
                const title = $('title').text().trim();
                const metaDescription = $('meta[name="description"]').attr('content') || '';
                const h1s = $('h1').map((i, el) => $(el).text().trim()).get().slice(0, 5).join(' | ');
                const h2s = $('h2').map((i, el) => $(el).text().trim()).get().slice(0, 10).join(' | ');
                
                // Get main text content (limited)
                const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);
                
                websiteContent = `
CONTENU EXTRAIT DU SITE :
- Titre : ${title}
- Meta description : ${metaDescription}
- Titres H1 : ${h1s}
- Titres H2 : ${h2s}
- Extrait du contenu : ${bodyText.substring(0, 1500)}...
`;
            } catch (scrapeError) {
                console.log('Scraping failed, using domain knowledge only:', scrapeError.message);
                websiteContent = `(Scraping impossible - utilise tes connaissances sur ${domain})`;
            }

            const prompt = `Tu es un expert en analyse d'entreprise B2B/B2C et en stratégie commerciale.

🔍 SITE À ANALYSER : ${url}
📍 DOMAINE : ${domain}

${websiteContent}

⚠️ INSTRUCTIONS IMPORTANTES :
1. Si tu connais cette entreprise (ex: SFR, Orange, BNP, etc.), utilise tes connaissances réelles
2. Sois TRÈS SPÉCIFIQUE - pas de réponses génériques
3. Les produits doivent être les VRAIS produits/services de l'entreprise
4. Adapte le vocabulaire au secteur

Réponds en JSON avec ces champs (sois PRÉCIS et SPÉCIFIQUE) :
{
    "companyName": "Nom EXACT de l'entreprise",
    "businessType": "Type d'activité PRÉCIS",
    "industry": "Secteur DÉTAILLÉ",
    "valueProposition": "Proposition de valeur SPÉCIFIQUE",
    "targetMarket": "Cible PRÉCISE",
    "commonQuestions": ["5 questions que les VRAIS prospects posent"],
    "qualificationCriteria": ["4 critères BANT adaptés"],
    "products": [
        {"name": "Produit RÉEL 1", "description": "Description", "price": "Prix ou Sur devis"}
    ],
    "faqs": ["5 vraies FAQ"],
    "icpSector": "Secteur cible",
    "icpSize": "Taille entreprise cible",
    "icpDecider": "Décideur type",
    "icpBudget": "Budget moyen RÉALISTE",
    "painPoints": ["4 problèmes RÉELS résolus"],
    "needs": ["4 besoins principaux"],
    "objections": [
        {"objection": "Objection fréquente", "response": "Réponse adaptée"}
    ],
    "tone": "Ton recommandé",
    "successStory": "Une success story type pour ce secteur"
}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Tu es un expert en analyse de marché. Sois TRÈS précis.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            
            return {
                companyName: result.companyName || domain,
                businessType: result.businessType || "Service Professionnel",
                industry: result.industry || "Services",
                valueProposition: result.valueProposition || "Solutions adaptées à vos besoins",
                targetMarket: result.targetMarket || "PME en France",
                commonQuestions: result.commonQuestions || [],
                qualificationCriteria: result.qualificationCriteria || ["Budget", "Délai", "Autorité", "Besoin"],
                products: result.products || [],
                faqs: result.faqs || [],
                icpSector: result.icpSector || "PME",
                icpSize: result.icpSize || "10-250 employés",
                icpDecider: result.icpDecider || "Directeur",
                icpBudget: result.icpBudget || "1 000€ - 10 000€",
                painPoints: result.painPoints || [],
                needs: result.needs || [],
                objections: result.objections || [],
                tone: result.tone || "Professionnel",
                successStory: result.successStory || "Nos clients gagnent en moyenne 30% de temps."
            };
        } catch (error) {
            console.error('Error analyzing business:', error);
            const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            return {
                companyName: domain,
                businessType: "Service Professionnel",
                industry: "Services",
                valueProposition: "Solutions professionnelles adaptées",
                targetMarket: "PME en France",
                commonQuestions: ["Quels sont vos tarifs ?", "Comment ça fonctionne ?"],
                qualificationCriteria: ["Budget défini", "Délai identifié", "Décideur", "Besoin clair"],
                products: [{ name: "Service Principal", description: "Notre offre phare", price: "Sur devis" }],
                faqs: ["Comment fonctionne votre service ?"],
                icpSector: "PME",
                icpSize: "10-250 employés",
                icpDecider: "Directeur",
                icpBudget: "1 000€ - 10 000€",
                painPoints: ["Manque de temps", "Processus inefficaces"],
                needs: ["Automatisation", "Gain de temps"],
                objections: [{ objection: "C'est trop cher", response: "Le ROI est prouvé en 3 mois" }],
                tone: "Professionnel",
                successStory: "Nos clients gagnent en moyenne 30% de temps."
            };
        }
    }

    /**
     * Generate agent persona for onboarding
     */
    async generatePersona(businessType) {
        try {
            const prompt = `Génère un persona d'agent IA commercial pour une entreprise de type : ${businessType}

Réponds en JSON :
{
    "name": "Prénom français",
    "role": "Titre du poste",
    "goal": "Objectif principal",
    "firstMessage": "Premier SMS engageant (<140 chars)",
    "behaviors": ["3 comportements clés"],
    "constraints": ["3 contraintes à respecter"],
    "tone": "Description du ton",
    "successStory": "Une success story à partager"
}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating persona:', error);
            return {
                name: "Julie",
                role: "Conseillère Commerciale",
                goal: "Qualifier les leads et booker des rendez-vous",
                firstMessage: "Hey ! Merci pour ton intérêt. C'est quoi qui t'amène ? 🙂",
                behaviors: ["Écoute active", "Questions ouvertes", "Empathie"],
                constraints: ["Pas de pression", "Réponses courtes", "Rester pro"],
                tone: "Professionnel et chaleureux",
                successStory: "Beaucoup de nos clients ont gagné un temps fou grâce à nous."
            };
        }
    }

    /**
     * Simulate a conversation for preview
     */
    async simulateConversation(businessType, tone) {
        try {
            const prompt = `Simule une conversation SMS réaliste entre un agent commercial IA et un prospect pour : ${businessType}

Ton : ${tone}

La conversation doit montrer :
1. Accueil + question ouverte
2. Découverte du besoin
3. Qualification BANT
4. Proposition de valeur
5. Closing avec RDV

RÈGLES :
- Messages courts (<160 chars chacun)
- Naturel et engageant
- L'agent pose UNE question à la fois
- 6-8 échanges au total

Réponds en JSON :
            {
                "conversation": [
        {"sender": "agent", "text": "Message"},
        {"sender": "lead", "text": "Réponse"},
        ...
    ],
    "qualification_result": {
        "score": 0-100,
        "status": "hot|warm|cold"
    }
}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            return result.conversation || [];
        } catch (error) {
            console.error('Error simulating conversation:', error);
            return [
                { sender: "agent", text: "Hey ! Merci pour ton intérêt. C'est quoi ton besoin principal ? 🙂" },
                { sender: "lead", text: "On cherche à automatiser notre prospection" },
                { sender: "agent", text: "Top ! Vous êtes combien dans l'équipe commerciale ?" },
                { sender: "lead", text: "On est 5, on perd trop de temps sur les leads froids" },
                { sender: "agent", text: "Je comprends. C'est quoi votre budget pour régler ça ?" },
                { sender: "lead", text: "On peut mettre 500€/mois si ça marche vraiment" },
                { sender: "agent", text: "Parfait ! Un call de 15 min pour voir si on peut vous aider ? Dispo quand ?" }
            ];
        }
    }

    /**
     * Generate a campaign first message
     */
    async generateCampaignMessage(agentConfig, objective, context = '') {
        try {
            const { name, role, company, tone, politeness, successStory } = agentConfig;

            const objectiveInstructions = {
                reactivation: "Réactiver un ancien lead qui n'a pas donné suite - sois naturel, pas pushy",
                booking: "Booker un rendez-vous ou une démo - sois direct avec une proposition de créneau",
                qualification: "Qualifier le lead sur ses besoins - pose une question ouverte engageante",
                nurturing: "Nourrir la relation et apporter de la valeur - partage un conseil ou une info utile",
                upsell: "Proposer une montée en gamme à un client existant - mentionne une nouveauté",
                feedback: "Recueillir un avis ou feedback - sois bref et direct"
            };

            const prompt = `Tu es ${name}, ${role} chez ${company}.

OBJECTIF : ${objectiveInstructions[objective] || objective}

${context ? `CONTEXTE : ${context}` : ''}
${successStory ? `SUCCESS STORY UTILISABLE : ${successStory}` : ''}

Génère UN SMS de campagne qui :
- Utilise {{name}} pour personnaliser
- Fait MAX 140 caractères
- Est ${tone < 50 ? 'chaleureux' : 'direct'}
- ${politeness === 'tu' ? 'Tutoie' : 'Vouvoie'}
- Termine par une question ou CTA
- Un émoji max

EXEMPLES DE BONS MESSAGES :
- "Hey {{name}} ! Ça fait un moment 😊 Ton projet a avancé ?"
- "{{name}}, j'ai un créneau dispo demain 14h. Ça te dit ?"
- "Salut {{name}} ! Une question : c'est quoi ton défi n°1 en ce moment ?"

Réponds UNIQUEMENT avec le message :`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 80,
                temperature: 0.9,
            });

            return completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
        } catch (error) {
            console.error('Error generating campaign message:', error);
            return "Hey {{name}} ! Ça fait un moment. Ton projet a avancé ? 🙂";
        }
    }
}

module.exports = new OpenAIService();
