/**
 * Content Generation Service
 * Generates SEO-optimized articles using OpenAI GPT-4
 */

const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a full SEO-optimized article
 */
async function generateArticle(params) {
    const {
        keyword,
        tone = 'professional',
        length = 1500,
        language = 'fr',
        secondaryKeywords = [],
        outline = null,
        includeImages = true,
        includeFAQ = true
    } = params;

    try {
        const toneInstructions = getToneInstructions(tone, language);
        const secondaryKwList = secondaryKeywords.length > 0 
            ? `\nMots-clés secondaires à inclure naturellement: ${secondaryKeywords.join(', ')}`
            : '';

        const systemPrompt = `Tu es un expert en rédaction SEO ${language === 'fr' ? 'français' : 'anglais'}. 
Tu dois écrire un article optimisé pour le référencement sur le mot-clé principal: "${keyword}".

${toneInstructions}

RÈGLES SEO STRICTES:
1. Le mot-clé principal doit apparaître:
   - Dans le titre (H1)
   - Dans le premier paragraphe (dans les 100 premiers mots)
   - Dans au moins 2 H2
   - Naturellement dans le corps (densité ~1-2%)
   - Dans la meta description

2. Structure:
   - Titre H1 accrocheur avec le mot-clé
   - Introduction engageante (150-200 mots)
   - 4-6 sections avec H2
   - Sous-sections H3 si nécessaire
   - Conclusion avec call-to-action
   ${includeFAQ ? '- FAQ avec 3-5 questions (format schema.org)' : ''}

3. Optimisations:
   - Paragraphes courts (3-4 phrases max)
   - Listes à puces quand pertinent
   - Transition fluide entre sections
${secondaryKwList}

LONGUEUR CIBLE: ${length} mots (${length - 100} à ${length + 100} mots)

${outline ? `STRUCTURE À SUIVRE:\n${outline}` : ''}

Retourne un JSON avec cette structure exacte:
{
  "title": "Titre H1 optimisé SEO",
  "metaTitle": "Meta Title (60 chars max)",
  "metaDescription": "Meta description engageante (155 chars max)",
  "slug": "url-slug-optimise",
  "excerpt": "Extrait pour les previews (200 chars)",
  "content": "Contenu HTML complet avec balises H2, H3, p, ul, li",
  "outline": ["Section 1", "Section 2", ...],
  "wordCount": ${length},
  "readingTime": "${Math.ceil(length / 250)} min",
  "keywords": {
    "primary": "${keyword}",
    "secondary": ${JSON.stringify(secondaryKeywords)},
    "lsi": ["terme lié 1", "terme lié 2"]
  },
  ${includeFAQ ? `"faq": [
    {"question": "Question 1?", "answer": "Réponse 1"},
    {"question": "Question 2?", "answer": "Réponse 2"}
  ],` : ''}
  ${includeImages ? `"imagePrompts": [
    {"prompt": "Description pour génération d'image", "placement": "header", "altText": "Texte alternatif SEO"}
  ],` : ''}
  "internalLinkSuggestions": ["Sujet lié 1", "Sujet lié 2"]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Génère un article complet pour: "${keyword}"` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000
        });

        const article = JSON.parse(completion.choices[0].message.content);

        // Add metadata
        article.generatedAt = new Date().toISOString();
        article.params = params;
        article.status = 'draft';

        return { success: true, article };
    } catch (error) {
        console.error('Article generation error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate article outline
 */
async function generateOutline(keyword, secondaryKeywords = [], language = 'fr') {
    try {
        const secondaryKwText = secondaryKeywords.length > 0 
            ? `\nMots-clés secondaires: ${secondaryKeywords.join(', ')}`
            : '';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO. Génère une structure d'article optimisée pour le mot-clé "${keyword}".
${secondaryKwText}

La structure doit inclure:
- Un titre H1 accrocheur
- 5-7 sections H2 logiquement ordonnées
- Des sous-sections H3 pour les sections complexes
- Une section FAQ à la fin

Retourne un JSON avec:
{
  "h1": "Titre principal",
  "sections": [
    {
      "h2": "Titre de section",
      "h3": ["Sous-section 1", "Sous-section 2"],
      "keyPoints": ["Point clé 1", "Point clé 2"]
    }
  ],
  "faq": ["Question 1?", "Question 2?"]
}`
                },
                { role: 'user', content: keyword }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Outline generation error:', error);
        return null;
    }
}

/**
 * Generate FAQ for a topic
 */
async function generateFAQ(keyword, existingContent = '', count = 5, language = 'fr') {
    try {
        const contextInfo = existingContent 
            ? `\n\nContexte de l'article existant (premiers 1000 chars):\n${existingContent.substring(0, 1000)}` 
            : '';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO. Génère ${count} questions FAQ optimisées pour le SEO sur le sujet "${keyword}".
${contextInfo}

Les questions doivent:
- Être celles que les utilisateurs posent vraiment sur Google
- Inclure des questions "comment", "pourquoi", "quand", "combien"
- Avoir des réponses concises mais complètes (50-150 mots)

Retourne un JSON avec:
{
  "faq": [
    {"question": "Question?", "answer": "Réponse détaillée."}
  ]
}`
                },
                { role: 'user', content: keyword }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('FAQ generation error:', error);
        return { faq: [] };
    }
}

/**
 * Generate meta tags for content
 */
async function generateMetaTags(content, keyword, language = 'fr') {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO. Génère des meta tags optimisés pour ce contenu.
Mot-clé principal: "${keyword}"

Retourne un JSON avec:
{
  "metaTitle": "Titre SEO (max 60 chars, inclure le mot-clé)",
  "metaDescription": "Description engageante (max 155 chars, inclure le mot-clé et CTA)",
  "slug": "url-optimisee-seo",
  "ogTitle": "Titre pour partage social",
  "ogDescription": "Description pour réseaux sociaux"
}`
                },
                { role: 'user', content: content.substring(0, 2000) }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Meta tags generation error:', error);
        return {};
    }
}

/**
 * Improve existing content
 */
async function improveContent(content, improvements = [], language = 'fr') {
    try {
        const improvementsList = improvements.length > 0 
            ? improvements.join(', ')
            : 'lisibilité, SEO, engagement, structure';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert en rédaction SEO. Améliore ce contenu en te concentrant sur: ${improvementsList}.

Améliorations à faire:
1. Optimiser pour le SEO (structure, mots-clés naturels)
2. Améliorer la lisibilité (paragraphes courts, listes)
3. Rendre plus engageant
4. Corriger toute erreur
5. Ajouter des transitions fluides

Retourne un JSON avec:
{
  "improvedContent": "Le contenu amélioré en HTML",
  "changes": ["Changement 1", "Changement 2"],
  "seoScore": 85,
  "readabilityScore": 90,
  "suggestions": ["Suggestion supplémentaire 1"]
}`
                },
                { role: 'user', content: content }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Content improvement error:', error);
        return { improvedContent: content, changes: [], seoScore: 0 };
    }
}

/**
 * Save article to database
 */
async function saveArticle(supabase, userId, articleData) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert({
                user_id: userId,
                title: articleData.title,
                slug: articleData.slug,
                meta_title: articleData.metaTitle,
                meta_description: articleData.metaDescription,
                excerpt: articleData.excerpt,
                content: articleData.content,
                keyword: articleData.keywords?.primary || articleData.keyword,
                secondary_keywords: articleData.keywords?.secondary || [],
                word_count: articleData.wordCount,
                reading_time: articleData.readingTime,
                faq: articleData.faq || [],
                image_prompts: articleData.imagePrompts || [],
                status: articleData.status || 'draft',
                generation_params: articleData.params,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Save article error:', error);
        throw error;
    }
}

/**
 * Get user's articles
 */
async function getArticles(supabase, userId, status = null, limit = 50) {
    try {
        let query = supabase
            .from('articles')
            .select('*')
            .eq('user_id', userId);

        if (status) {
            query = query.eq('status', status);
        }

        query = query.order('created_at', { ascending: false }).limit(limit);

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Get articles error:', error);
        return [];
    }
}

/**
 * Get single article by ID
 */
async function getArticleById(supabase, userId, articleId) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get article error:', error);
        return null;
    }
}

/**
 * Update article
 */
async function updateArticle(supabase, userId, articleId, updates) {
    try {
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

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update article error:', error);
        throw error;
    }
}

/**
 * Delete article
 */
async function deleteArticle(supabase, userId, articleId) {
    try {
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', articleId)
            .eq('user_id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Delete article error:', error);
        throw error;
    }
}

// Helper function
function getToneInstructions(tone, language) {
    const tones = {
        professional: language === 'fr' 
            ? 'Ton professionnel et expert. Vocabulaire précis. Crédibilité et autorité.'
            : 'Professional and expert tone. Precise vocabulary. Credibility and authority.',
        casual: language === 'fr'
            ? 'Ton décontracté et accessible. Langage simple. Proche du lecteur.'
            : 'Casual and accessible tone. Simple language. Close to the reader.',
        expert: language === 'fr'
            ? 'Ton très technique et expert. Termes spécialisés. Pour audience avancée.'
            : 'Very technical and expert tone. Specialized terms. For advanced audience.',
        friendly: language === 'fr'
            ? 'Ton amical et chaleureux. Empathique. Conseils bienveillants.'
            : 'Friendly and warm tone. Empathetic. Kind advice.',
        persuasive: language === 'fr'
            ? 'Ton persuasif et commercial. Arguments de vente. Appels à l\'action.'
            : 'Persuasive and commercial tone. Sales arguments. Calls to action.'
    };
    return `TON: ${tones[tone] || tones.professional}`;
}

module.exports = {
    generateArticle,
    generateOutline,
    generateFAQ,
    generateMetaTags,
    improveContent,
    saveArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle
};
