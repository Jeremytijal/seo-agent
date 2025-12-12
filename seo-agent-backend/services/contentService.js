/**
 * Content Generation Service
 * AI-powered SEO content creation using GPT-4
 */

const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate SEO-optimized article
 * @param {Object} options - Article generation options
 * @param {string} options.keyword - Main target keyword
 * @param {string} options.tone - Writing tone (professional, casual, expert, friendly)
 * @param {number} options.length - Target word count
 * @param {string} options.language - Language (fr, en)
 * @param {Array} options.secondaryKeywords - Secondary keywords to include
 * @param {Object} options.outline - Custom outline (optional)
 */
async function generateArticle(options) {
    const {
        keyword,
        tone = 'professional',
        length = 1500,
        language = 'fr',
        secondaryKeywords = [],
        outline = null,
        includeImages = true,
        includeFAQ = true
    } = options;

    const toneInstructions = getToneInstructions(tone, language);
    const lengthGuide = getLengthGuide(length);

    try {
        // Step 1: Generate article outline if not provided
        let articleOutline = outline;
        if (!articleOutline) {
            articleOutline = await generateOutline(keyword, secondaryKeywords, language);
        }

        // Step 2: Generate the full article
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `Tu es un expert en rédaction SEO avec 15 ans d'expérience. Tu crées du contenu optimisé pour le référencement qui:
- Se positionne en première page Google
- Engage les lecteurs et réduit le taux de rebond  
- Utilise naturellement les mots-clés sans sur-optimisation
- Suit les guidelines E-E-A-T de Google (Experience, Expertise, Authority, Trust)

${toneInstructions}

RÈGLES SEO STRICTES:
1. Titre H1 unique contenant le mot-clé principal (max 60 caractères)
2. Meta description engageante avec le mot-clé (max 155 caractères)
3. Introduction captivante avec le mot-clé dans les 100 premiers mots
4. Structure H2/H3 logique avec mots-clés variés
5. Paragraphes courts (3-4 phrases max)
6. Listes à puces pour la lisibilité
7. Transitions fluides entre sections
8. Conclusion avec call-to-action
9. ${includeFAQ ? 'Section FAQ avec 4-5 questions fréquentes' : ''}
10. Densité de mots-clés: 1-2% naturellement

${includeImages ? 'Suggère des emplacements pour images avec descriptions alt-text optimisées.' : ''}

FORMAT DE SORTIE STRICTEMENT EN JSON VALIDE (pas de markdown autour):
{
    "title": "Titre H1 SEO",
    "metaTitle": "Titre meta (60 chars max)",
    "metaDescription": "Description meta engageante (155 chars max)",
    "slug": "url-slug-optimise",
    "content": "Contenu HTML complet avec balises h2, h3, p, ul, li",
    "excerpt": "Extrait de 2-3 phrases",
    "readingTime": nombre_en_minutes,
    "wordCount": nombre_de_mots,
    "keywords": ["mot-clé1", "mot-clé2"],
    "faq": [
        {"question": "Question 1?", "answer": "Réponse 1"},
        {"question": "Question 2?", "answer": "Réponse 2"}
    ],
    "imagesSuggestions": [
        {"position": "after_intro", "alt": "Description alt", "description": "Description de l'image suggérée"}
    ]
}`
            }, {
                role: 'user',
                content: `Rédige un article SEO ${language === 'fr' ? 'en français' : 'in English'} sur: "${keyword}"

OUTLINE À SUIVRE:
${JSON.stringify(articleOutline, null, 2)}

Mots-clés secondaires à intégrer naturellement: ${secondaryKeywords.join(', ') || 'aucun'}

Longueur cible: ${lengthGuide}

IMPORTANT: Le contenu doit être original, approfondi et apporter une vraie valeur au lecteur.
Retourne UNIQUEMENT du JSON valide, sans \`\`\`json ni autre formatage.`
            }],
            temperature: 0.7,
            max_tokens: 4000
        });

        const content = completion.choices[0].message.content;
        
        // Parse JSON response
        let article;
        try {
            // Try to extract JSON if wrapped in markdown
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            article = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.log('Raw content:', content);
            throw new Error('Failed to parse article JSON');
        }

        // Add metadata
        article.generatedAt = new Date().toISOString();
        article.model = 'gpt-4o';
        article.mainKeyword = keyword;
        article.tone = tone;
        article.targetLength = length;
        article.outline = articleOutline;

        return {
            success: true,
            article
        };

    } catch (error) {
        console.error('Article generation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate article'
        };
    }
}

/**
 * Generate article outline
 */
async function generateOutline(keyword, secondaryKeywords = [], language = 'fr') {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
            role: 'system',
            content: `Tu es un expert SEO. Génère un plan d'article optimisé pour le mot-clé donné.
Le plan doit être logique, couvrir le sujet en profondeur et répondre aux intentions de recherche.

Réponds UNIQUEMENT en JSON valide.`
        }, {
            role: 'user',
            content: `Crée un plan d'article SEO ${language === 'fr' ? 'en français' : 'in English'} pour: "${keyword}"

Mots-clés secondaires: ${secondaryKeywords.join(', ') || 'suggère-en'}

Format JSON attendu:
{
    "title": "Titre suggéré",
    "sections": [
        {
            "heading": "H2: Titre de section",
            "keyPoints": ["Point 1", "Point 2"],
            "subsections": [
                {"heading": "H3: Sous-titre", "keyPoints": ["Point"]}
            ]
        }
    ],
    "suggestedKeywords": ["mot1", "mot2"],
    "estimatedLength": 1500,
    "targetAudience": "Description de l'audience cible"
}`
        }],
        temperature: 0.7,
        max_tokens: 1500
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

/**
 * Improve existing content
 */
async function improveContent(existingContent, improvements = [], language = 'fr') {
    const improvementTypes = {
        seo: 'Optimise le contenu pour le SEO (mots-clés, structure, meta)',
        readability: 'Améliore la lisibilité (phrases plus courtes, transitions)',
        engagement: 'Rends le contenu plus engageant (hooks, exemples, storytelling)',
        depth: 'Ajoute de la profondeur (détails, exemples, données)',
        cta: 'Ajoute des appels à l\'action pertinents'
    };

    const selectedImprovements = improvements.length > 0 
        ? improvements.map(i => improvementTypes[i] || i).join('\n- ')
        : Object.values(improvementTypes).join('\n- ');

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'system',
            content: `Tu es un expert en optimisation de contenu SEO. Améliore le contenu fourni selon les instructions.
Garde le sens et les informations principales, mais améliore la qualité.

Réponds en JSON avec le contenu amélioré.`
        }, {
            role: 'user',
            content: `Améliore ce contenu ${language === 'fr' ? 'en français' : 'in English'}:

CONTENU ACTUEL:
${existingContent}

AMÉLIORATIONS DEMANDÉES:
- ${selectedImprovements}

Format JSON:
{
    "improvedContent": "Contenu amélioré en HTML",
    "changes": ["Changement 1", "Changement 2"],
    "newMetaDescription": "Nouvelle meta description si améliorée",
    "seoScore": { "before": 60, "after": 85 }
}`
        }],
        temperature: 0.6,
        max_tokens: 4000
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

/**
 * Generate meta tags for existing content
 */
async function generateMetaTags(content, keyword, language = 'fr') {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
            role: 'system',
            content: `Tu es un expert SEO. Génère des meta tags optimisés pour le contenu donné.

RÈGLES:
- Meta title: max 60 caractères, mot-clé au début
- Meta description: max 155 caractères, incitation au clic, mot-clé inclus
- Focus keyword variations

Réponds en JSON uniquement.`
        }, {
            role: 'user',
            content: `Génère les meta tags ${language === 'fr' ? 'en français' : 'in English'} pour:

MOT-CLÉ PRINCIPAL: ${keyword}

CONTENU:
${content.substring(0, 1500)}...

Format:
{
    "metaTitle": "Titre meta optimisé",
    "metaDescription": "Description meta engageante",
    "focusKeyword": "mot-clé principal",
    "secondaryKeywords": ["kw1", "kw2"],
    "ogTitle": "Titre Open Graph",
    "ogDescription": "Description Open Graph"
}`
        }],
        temperature: 0.5,
        max_tokens: 500
    });

    const result = completion.choices[0].message.content;
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : result);
}

/**
 * Generate FAQ section for a topic
 */
async function generateFAQ(keyword, existingContent = '', count = 5, language = 'fr') {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
            role: 'system',
            content: `Tu es un expert SEO. Génère une section FAQ optimisée pour les featured snippets Google.

RÈGLES:
- Questions que les utilisateurs posent vraiment (PAA - People Also Ask)
- Réponses concises (40-60 mots) mais complètes
- Structure Schema.org FAQPage compatible
- Questions variées (comment, pourquoi, combien, etc.)

Réponds en JSON uniquement.`
        }, {
            role: 'user',
            content: `Génère ${count} FAQ ${language === 'fr' ? 'en français' : 'in English'} pour: "${keyword}"

${existingContent ? `Contexte du contenu:\n${existingContent.substring(0, 1000)}` : ''}

Format:
{
    "faq": [
        {
            "question": "Question fréquente?",
            "answer": "Réponse concise et utile."
        }
    ],
    "schemaMarkup": "Code JSON-LD Schema.org"
}`
        }],
        temperature: 0.7,
        max_tokens: 1500
    });

    const result = completion.choices[0].message.content;
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : result);
}

/**
 * Save article to database
 */
async function saveArticle(supabase, userId, articleData) {
    const { data, error } = await supabase
        .from('articles')
        .insert({
            user_id: userId,
            title: articleData.title,
            slug: articleData.slug || generateSlug(articleData.title),
            content: articleData.content,
            excerpt: articleData.excerpt,
            meta_title: articleData.metaTitle,
            meta_description: articleData.metaDescription,
            main_keyword: articleData.mainKeyword,
            keywords: articleData.keywords,
            faq: articleData.faq,
            word_count: articleData.wordCount,
            reading_time: articleData.readingTime,
            tone: articleData.tone,
            status: 'draft',
            outline: articleData.outline,
            images_suggestions: articleData.imagesSuggestions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving article:', error);
        throw error;
    }

    return data;
}

/**
 * Get user's articles
 */
async function getArticles(supabase, userId, status = null, limit = 50) {
    let query = supabase
        .from('articles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    return data || [];
}

/**
 * Update article
 */
async function updateArticle(supabase, userId, articleId, updates) {
    const { data, error } = await supabase
        .from('articles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating article:', error);
        throw error;
    }

    return data;
}

/**
 * Delete article
 */
async function deleteArticle(supabase, userId, articleId) {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting article:', error);
        throw error;
    }

    return { success: true };
}

/**
 * Get article by ID
 */
async function getArticleById(supabase, userId, articleId) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching article:', error);
        return null;
    }

    return data;
}

// Helper functions

function getToneInstructions(tone, language) {
    const tones = {
        professional: language === 'fr' 
            ? 'Adopte un ton professionnel et expert. Vocabulaire précis, phrases structurées, données factuelles.'
            : 'Use a professional, expert tone. Precise vocabulary, structured sentences, factual data.',
        casual: language === 'fr'
            ? 'Adopte un ton décontracté et accessible. Tutoiement possible, expressions du quotidien, exemples concrets.'
            : 'Use a casual, approachable tone. Everyday expressions, concrete examples.',
        expert: language === 'fr'
            ? 'Adopte un ton d\'expert technique. Terminologie spécialisée, analyses approfondies, références sectorielles.'
            : 'Use a technical expert tone. Specialized terminology, in-depth analysis, industry references.',
        friendly: language === 'fr'
            ? 'Adopte un ton chaleureux et bienveillant. Empathie, encouragements, conseils pratiques.'
            : 'Use a warm, supportive tone. Empathy, encouragement, practical advice.',
        persuasive: language === 'fr'
            ? 'Adopte un ton persuasif orienté conversion. Arguments forts, preuves sociales, urgence.'
            : 'Use a persuasive, conversion-focused tone. Strong arguments, social proof, urgency.'
    };
    return tones[tone] || tones.professional;
}

function getLengthGuide(length) {
    if (length <= 800) return 'Article court (600-800 mots) - Vue d\'ensemble rapide';
    if (length <= 1500) return 'Article moyen (1200-1500 mots) - Couverture complète';
    if (length <= 2500) return 'Article long (2000-2500 mots) - Guide approfondi';
    return 'Article pilier (3000+ mots) - Ressource définitive du sujet';
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
}

module.exports = {
    generateArticle,
    generateOutline,
    improveContent,
    generateMetaTags,
    generateFAQ,
    saveArticle,
    getArticles,
    updateArticle,
    deleteArticle,
    getArticleById,
    generateSlug
};

