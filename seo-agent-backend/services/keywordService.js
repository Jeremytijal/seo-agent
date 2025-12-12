/**
 * Keyword Research Service
 * Provides keyword data, volume, difficulty, and suggestions
 * 
 * For MVP: Uses OpenAI to generate realistic keyword data
 * For Production: Integrate DataForSEO, SEMrush, or Ahrefs API
 */

const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Get keyword data with metrics
 * @param {string} keyword - Search query/seed keyword
 * @param {string} country - Country code (fr, us, etc.)
 * @param {string} language - Language code (fr, en, etc.)
 * @returns {Array} Keyword data with metrics
 */
async function getKeywordData(keyword, country = 'fr', language = 'fr') {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO. Génère des données de mots-clés réalistes pour la recherche "${keyword}".

Pour chaque mot-clé, fournis:
- keyword: le mot-clé
- volume: volume de recherche mensuel estimé (100-50000)
- difficulty: difficulté SEO (0-100)
- cpc: coût par clic moyen en euros (0.10-15.00)
- trend: tendance ("up", "down", "stable")
- intent: intention de recherche ("informational", "transactional", "navigational", "commercial")
- competition: niveau de compétition ("low", "medium", "high")

Retourne UNIQUEMENT un JSON valide avec un tableau "keywords" de 10-15 mots-clés pertinents.
Inclus le mot-clé principal et des variations longue traîne.
Les données doivent être réalistes pour le marché ${country.toUpperCase()} en ${language === 'fr' ? 'français' : 'anglais'}.`
                },
                {
                    role: 'user',
                    content: `Génère les données pour: "${keyword}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const result = JSON.parse(completion.choices[0].message.content);
        
        // Add IDs to each keyword
        return (result.keywords || []).map((kw, index) => ({
            id: `kw_${Date.now()}_${index}`,
            ...kw,
            searchedAt: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Keyword data error:', error);
        throw error;
    }
}

/**
 * Log keyword search to history
 */
async function logKeywordSearch(supabase, userId, keyword, resultCount) {
    try {
        await supabase
            .from('keyword_searches')
            .insert({
                user_id: userId,
                keyword,
                result_count: resultCount,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error logging keyword search:', error);
        // Don't throw - this is non-critical
    }
}

/**
 * Get search history
 */
async function getSearchHistory(supabase, userId, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('keyword_searches')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching search history:', error);
        return [];
    }
}

/**
 * Get favorite keywords for a user
 */
async function getFavoriteKeywords(supabase, userId) {
    try {
        const { data, error } = await supabase
            .from('keywords')
            .select('*')
            .eq('user_id', userId)
            .eq('is_favorite', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

/**
 * Save a keyword to favorites
 */
async function saveFavoriteKeyword(supabase, userId, keywordData) {
    try {
    const { data, error } = await supabase
            .from('keywords')
        .upsert({
            user_id: userId,
            keyword: keywordData.keyword,
            volume: keywordData.volume,
            difficulty: keywordData.difficulty,
            cpc: keywordData.cpc,
                trend: keywordData.trend,
            intent: keywordData.intent,
                competition: keywordData.competition,
                is_favorite: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,keyword'
        })
        .select()
        .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving favorite:', error);
        throw error;
    }
}

/**
 * Delete a favorite keyword
 */
async function deleteFavoriteKeyword(supabase, userId, keywordId) {
    try {
    const { error } = await supabase
            .from('keywords')
        .delete()
        .eq('id', keywordId)
        .eq('user_id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
    }
}

/**
 * Get keyword suggestions (related, questions, longtail)
 */
async function getKeywordSuggestions(seedKeyword, type = 'related') {
    try {
        let prompt = '';
        
        switch (type) {
            case 'questions':
                prompt = `Génère 10 questions fréquemment posées autour du sujet "${seedKeyword}". 
                Format: questions naturelles que les utilisateurs tapent dans Google.
                Inclus des questions "comment", "pourquoi", "quand", "où", "quel".`;
                break;
            case 'longtail':
                prompt = `Génère 10 mots-clés longue traîne (3-6 mots) autour de "${seedKeyword}".
                Ces mots-clés doivent être spécifiques et avoir moins de concurrence.`;
                break;
            default:
                prompt = `Génère 10 mots-clés sémantiquement liés à "${seedKeyword}".
                Inclus des synonymes, termes associés et variantes.`;
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO français. ${prompt}
                    
Pour chaque suggestion, fournis:
- keyword: le mot-clé/question
- volume: volume estimé (50-10000)
- difficulty: difficulté (0-100)
- relevance: pertinence par rapport au mot-clé source (0-100)

Retourne UNIQUEMENT un JSON valide avec un tableau "suggestions".`
                },
                { role: 'user', content: seedKeyword }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result.suggestions || [];
    } catch (error) {
        console.error('Keyword suggestions error:', error);
        return [];
    }
}

/**
 * Analyze a keyword for SERP and competition
 */
async function analyzeKeyword(keyword) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO. Analyse le mot-clé "${keyword}" et fournis:

1. serp_features: features SERP probables (featured_snippet, people_also_ask, images, videos, local_pack, etc.)
2. competition_level: niveau de compétition (low, medium, high)
3. content_type: type de contenu qui rank (blog, product, category, tool, etc.)
4. word_count_recommendation: nombre de mots recommandé pour ranker
5. top_competitors: 3-5 types de sites qui rankent
6. optimization_tips: 3-5 conseils SEO spécifiques
7. related_entities: entités liées à inclure dans le contenu
8. user_intent_analysis: analyse détaillée de l'intention

Retourne UNIQUEMENT un JSON valide.`
                },
                { role: 'user', content: keyword }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Keyword analysis error:', error);
        throw error;
    }
}

/**
 * Cluster keywords into topic groups
 */
async function clusterKeywords(keywords) {
    try {
        const keywordList = keywords.map(k => typeof k === 'string' ? k : k.keyword).join('\n');
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert SEO. Groupe ces mots-clés en clusters thématiques.

Pour chaque cluster, fournis:
- name: nom du cluster (thème principal)
- keywords: liste des mots-clés du cluster
- main_keyword: le mot-clé principal du cluster
- content_suggestion: suggestion de type de contenu

Retourne UNIQUEMENT un JSON valide avec un tableau "clusters".`
                },
                { role: 'user', content: keywordList }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result.clusters || [];
    } catch (error) {
        console.error('Cluster keywords error:', error);
        return [];
    }
}

module.exports = {
    getKeywordData,
    logKeywordSearch,
    getSearchHistory,
    getFavoriteKeywords,
    saveFavoriteKeyword,
    deleteFavoriteKeyword,
    getKeywordSuggestions,
    analyzeKeyword,
    clusterKeywords
};
