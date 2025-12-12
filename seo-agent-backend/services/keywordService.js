/**
 * Keyword Research Service
 * Provides keyword data from multiple sources (DataForSEO, SerpAPI, or mock data for testing)
 */

const { OpenAI } = require('openai');

// Initialize OpenAI for keyword suggestions
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Search keywords using DataForSEO API
 * @param {string} keyword - Seed keyword to search
 * @param {string} country - Country code (fr, us, uk, etc.)
 * @param {string} language - Language code (fr, en, etc.)
 */
async function searchKeywordsDataForSEO(keyword, country = 'fr', language = 'fr') {
    const username = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!username || !password) {
        console.log('DataForSEO credentials not configured, using AI suggestions');
        return await generateKeywordSuggestionsAI(keyword, country);
    }

    try {
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');
        
        // Keywords for Site endpoint - gives related keywords
        const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                keyword: keyword,
                location_code: getLocationCode(country),
                language_code: language,
                limit: 50,
                include_seed_keyword: true,
                include_serp_info: true
            }])
        });

        const data = await response.json();

        if (data.status_code !== 20000 || !data.tasks?.[0]?.result?.[0]?.items) {
            console.error('DataForSEO error:', data);
            return await generateKeywordSuggestionsAI(keyword, country);
        }

        const items = data.tasks[0].result[0].items;
        
        return items.map(item => ({
            keyword: item.keyword_data?.keyword || item.keyword,
            volume: item.keyword_data?.keyword_info?.search_volume || 0,
            difficulty: item.keyword_data?.keyword_info?.competition_level === 'HIGH' ? 80 : 
                       item.keyword_data?.keyword_info?.competition_level === 'MEDIUM' ? 50 : 20,
            cpc: item.keyword_data?.keyword_info?.cpc || 0,
            competition: item.keyword_data?.keyword_info?.competition || 0,
            trend: item.keyword_data?.keyword_info?.monthly_searches?.slice(-6).map(m => m.search_volume) || [],
            intent: detectSearchIntent(item.keyword_data?.keyword || item.keyword)
        }));
    } catch (error) {
        console.error('DataForSEO API error:', error);
        return await generateKeywordSuggestionsAI(keyword, country);
    }
}

/**
 * Search keywords using SerpAPI
 */
async function searchKeywordsSerpAPI(keyword, country = 'fr') {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        console.log('SerpAPI key not configured, using AI suggestions');
        return await generateKeywordSuggestionsAI(keyword, country);
    }

    try {
        // Get Google autocomplete suggestions
        const response = await fetch(
            `https://serpapi.com/search.json?engine=google_autocomplete&q=${encodeURIComponent(keyword)}&gl=${country}&api_key=${apiKey}`
        );
        
        const data = await response.json();

        if (!data.suggestions) {
            return await generateKeywordSuggestionsAI(keyword, country);
        }

        // SerpAPI autocomplete doesn't give volume, so we estimate
        return data.suggestions.map((suggestion, index) => ({
            keyword: suggestion.value,
            volume: estimateVolume(index),
            difficulty: Math.floor(Math.random() * 60) + 20,
            cpc: (Math.random() * 2).toFixed(2),
            competition: Math.random().toFixed(2),
            trend: generateMockTrend(),
            intent: detectSearchIntent(suggestion.value)
        }));
    } catch (error) {
        console.error('SerpAPI error:', error);
        return await generateKeywordSuggestionsAI(keyword, country);
    }
}

/**
 * Generate keyword suggestions using AI when APIs are not available
 */
async function generateKeywordSuggestionsAI(seedKeyword, country = 'fr') {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `Tu es un expert SEO. Génère des suggestions de mots-clés pertinents pour le SEO.
                
Pour chaque mot-clé, estime:
- volume: volume de recherche mensuel estimé (nombre)
- difficulty: difficulté SEO de 0 à 100
- cpc: coût par clic estimé en euros
- intent: "informational", "transactional", "navigational" ou "commercial"

Réponds UNIQUEMENT en JSON valide, sans markdown.`
            }, {
                role: 'user',
                content: `Génère 20 mots-clés SEO pertinents pour "${seedKeyword}" en ${country === 'fr' ? 'français' : 'anglais'}.
                
Inclus:
- Variantes longue traîne
- Questions (comment, pourquoi, quel)
- Comparaisons
- Mots-clés transactionnels

Format JSON attendu:
{
    "keywords": [
        {
            "keyword": "mot clé exemple",
            "volume": 1500,
            "difficulty": 45,
            "cpc": 0.85,
            "intent": "informational"
        }
    ]
}`
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = completion.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const result = JSON.parse(jsonMatch[0]);
        
        return result.keywords.map(kw => ({
            ...kw,
            trend: generateMockTrend(),
            competition: (kw.difficulty / 100).toFixed(2),
            source: 'ai'
        }));
    } catch (error) {
        console.error('AI keyword generation error:', error);
        // Return basic mock data as last resort
        return generateMockKeywords(seedKeyword);
    }
}

/**
 * Get keyword data for a specific keyword
 */
async function getKeywordData(keyword, country = 'fr') {
    // Try DataForSEO first, then SerpAPI, then AI
    if (process.env.DATAFORSEO_LOGIN) {
        return await searchKeywordsDataForSEO(keyword, country);
    } else if (process.env.SERPAPI_KEY) {
        return await searchKeywordsSerpAPI(keyword, country);
    } else {
        return await generateKeywordSuggestionsAI(keyword, country);
    }
}

/**
 * Save favorite keyword to database
 */
async function saveFavoriteKeyword(supabase, userId, keywordData) {
    const { data, error } = await supabase
        .from('favorite_keywords')
        .upsert({
            user_id: userId,
            keyword: keywordData.keyword,
            volume: keywordData.volume,
            difficulty: keywordData.difficulty,
            cpc: keywordData.cpc,
            intent: keywordData.intent,
            trend: keywordData.trend,
            created_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,keyword'
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving favorite keyword:', error);
        throw error;
    }

    return data;
}

/**
 * Get user's favorite keywords
 */
async function getFavoriteKeywords(supabase, userId) {
    const { data, error } = await supabase
        .from('favorite_keywords')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching favorite keywords:', error);
        return [];
    }

    return data || [];
}

/**
 * Delete favorite keyword
 */
async function deleteFavoriteKeyword(supabase, userId, keywordId) {
    const { error } = await supabase
        .from('favorite_keywords')
        .delete()
        .eq('id', keywordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting favorite keyword:', error);
        throw error;
    }

    return { success: true };
}

/**
 * Get keyword search history
 */
async function getSearchHistory(supabase, userId, limit = 10) {
    const { data, error } = await supabase
        .from('keyword_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching search history:', error);
        return [];
    }

    return data || [];
}

/**
 * Log keyword search
 */
async function logKeywordSearch(supabase, userId, keyword, resultsCount) {
    await supabase
        .from('keyword_searches')
        .insert({
            user_id: userId,
            keyword: keyword,
            results_count: resultsCount,
            created_at: new Date().toISOString()
        });
}

// Helper functions

function getLocationCode(country) {
    const codes = {
        'fr': 2250,  // France
        'us': 2840,  // United States
        'uk': 2826,  // United Kingdom
        'de': 2276,  // Germany
        'es': 2724,  // Spain
        'it': 2380,  // Italy
        'ca': 2124,  // Canada
        'be': 2056,  // Belgium
        'ch': 2756   // Switzerland
    };
    return codes[country.toLowerCase()] || 2250;
}

function detectSearchIntent(keyword) {
    const kw = keyword.toLowerCase();
    
    // Transactional
    if (/acheter|prix|tarif|devis|commander|achat|pas cher|promo|solde|buy|price|order|discount/.test(kw)) {
        return 'transactional';
    }
    
    // Commercial investigation
    if (/meilleur|comparatif|avis|test|vs|versus|alternative|best|review|compare/.test(kw)) {
        return 'commercial';
    }
    
    // Navigational
    if (/login|connexion|site|officiel|contact/.test(kw)) {
        return 'navigational';
    }
    
    // Default to informational
    return 'informational';
}

function estimateVolume(index) {
    // Higher ranked suggestions typically have more volume
    const baseVolumes = [5000, 3500, 2800, 2200, 1800, 1400, 1100, 900, 700, 500];
    return baseVolumes[index] || Math.floor(Math.random() * 400) + 100;
}

function generateMockTrend() {
    // Generate 6 months of trend data
    const base = Math.floor(Math.random() * 1000) + 500;
    return Array.from({ length: 6 }, () => 
        Math.floor(base * (0.8 + Math.random() * 0.4))
    );
}

function generateMockKeywords(seedKeyword) {
    const prefixes = ['comment', 'pourquoi', 'quel', 'meilleur', 'prix', 'avis', 'guide', 'tutoriel'];
    const suffixes = ['2024', 'pas cher', 'en ligne', 'gratuit', 'professionnel', 'débutant', 'comparatif'];
    
    const keywords = [
        { keyword: seedKeyword, volume: 5000, difficulty: 50, cpc: 1.20, intent: 'informational' }
    ];
    
    prefixes.forEach((prefix, i) => {
        keywords.push({
            keyword: `${prefix} ${seedKeyword}`,
            volume: Math.floor(Math.random() * 3000) + 500,
            difficulty: Math.floor(Math.random() * 60) + 20,
            cpc: (Math.random() * 2).toFixed(2),
            intent: detectSearchIntent(`${prefix} ${seedKeyword}`)
        });
    });
    
    suffixes.forEach((suffix, i) => {
        keywords.push({
            keyword: `${seedKeyword} ${suffix}`,
            volume: Math.floor(Math.random() * 2000) + 200,
            difficulty: Math.floor(Math.random() * 50) + 15,
            cpc: (Math.random() * 1.5).toFixed(2),
            intent: detectSearchIntent(`${seedKeyword} ${suffix}`)
        });
    });
    
    return keywords.map(kw => ({
        ...kw,
        trend: generateMockTrend(),
        competition: (kw.difficulty / 100).toFixed(2),
        source: 'mock'
    }));
}

module.exports = {
    getKeywordData,
    searchKeywordsDataForSEO,
    searchKeywordsSerpAPI,
    generateKeywordSuggestionsAI,
    saveFavoriteKeyword,
    getFavoriteKeywords,
    deleteFavoriteKeyword,
    getSearchHistory,
    logKeywordSearch,
    detectSearchIntent
};

