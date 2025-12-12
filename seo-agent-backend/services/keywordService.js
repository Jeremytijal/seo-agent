/**
 * Keyword Research Service
 * Provides keyword data, volume, difficulty, and suggestions
 * 
 * For MVP: Uses OpenAI to generate realistic keyword data
 * For Production: Integrate DataForSEO, SEMrush, or Ahrefs API
 */

const { OpenAI } = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');

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

/**
 * Scrape website content for SEO analysis
 */
async function scrapeWebsite(url) {
    try {
        // Normalize URL
        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        const response = await axios.get(normalizedUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SeoAgentBot/1.0; +https://agentiaseo.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
            },
            maxRedirects: 5
        });

        const $ = cheerio.load(response.data);
        
        // Remove scripts, styles, and other non-content elements
        $('script, style, nav, footer, header, aside, .ad, .ads, .advertisement').remove();
        
        const title = $('title').text().trim() || '';
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
        
        // Extract headings
        const h1s = $('h1').map((i, el) => $(el).text().trim()).get().slice(0, 5);
        const h2s = $('h2').map((i, el) => $(el).text().trim()).get().slice(0, 15);
        const h3s = $('h3').map((i, el) => $(el).text().trim()).get().slice(0, 20);
        
        // Extract main content (prioritize main, article, content areas)
        let mainContent = '';
        const contentSelectors = ['main', 'article', '[role="main"]', '.content', '.post-content', '.entry-content'];
        
        for (const selector of contentSelectors) {
            const content = $(selector).first();
            if (content.length > 0) {
                mainContent = content.text().replace(/\s+/g, ' ').trim().substring(0, 5000);
                break;
            }
        }
        
        // Fallback to body if no main content found
        if (!mainContent) {
            mainContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
        }
        
        // Extract links (internal keywords)
        const internalLinks = $('a[href^="/"], a[href*="' + normalizedUrl.split('/')[2] + '"]')
            .map((i, el) => $(el).text().trim())
            .get()
            .filter(text => text.length > 3 && text.length < 100)
            .slice(0, 20);
        
        // Extract alt texts from images
        const imageAlts = $('img[alt]')
            .map((i, el) => $(el).attr('alt'))
            .get()
            .filter(alt => alt && alt.length > 5)
            .slice(0, 15);
        
        return {
            url: normalizedUrl,
            domain: new URL(normalizedUrl).hostname,
            title,
            metaDescription,
            metaKeywords,
            h1s,
            h2s,
            h3s,
            mainContent: mainContent.substring(0, 3000), // Limit for AI context
            internalLinks,
            imageAlts,
            success: true
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split('/')[0];
        return {
            url,
            domain,
            success: false,
            error: error.message,
            // Fallback: use domain name for basic analysis
            title: domain,
            metaDescription: '',
            h1s: [],
            h2s: [],
            h3s: [],
            mainContent: '',
            internalLinks: [],
            imageAlts: []
        };
    }
}

/**
 * Analyze website and competitors to generate intelligent keyword suggestions
 * This is the improved function that analyzes real content
 */
async function analyzeCompetitors(websiteUrl, competitors = []) {
    try {
        console.log(`Analyzing website: ${websiteUrl} with ${competitors.length} competitors`);
        
        // Scrape all sites in parallel
        const sitesToAnalyze = [websiteUrl, ...competitors].filter(url => url && url.trim());
        const scrapePromises = sitesToAnalyze.map(url => scrapeWebsite(url));
        const scrapedData = await Promise.all(scrapePromises);
        
        const mainSite = scrapedData[0];
        const competitorSites = scrapedData.slice(1);
        
        // Build comprehensive analysis prompt
        let analysisPrompt = `Tu es un expert SEO français. Analyse ces sites web pour générer des suggestions de mots-clés intelligentes et pertinentes.

SITE PRINCIPAL À OPTIMISER:
- URL: ${mainSite.url}
- Domaine: ${mainSite.domain}
- Titre: ${mainSite.title}
- Meta description: ${mainSite.metaDescription}
- Titres H1: ${mainSite.h1s.join(' | ')}
- Titres H2: ${mainSite.h2s.slice(0, 10).join(' | ')}
- Contenu principal: ${mainSite.mainContent.substring(0, 2000)}
- Liens internes: ${mainSite.internalLinks.slice(0, 10).join(', ')}

`;

        if (competitorSites.length > 0) {
            analysisPrompt += `SITES CONCURRENTS ANALYSÉS:\n\n`;
            competitorSites.forEach((site, index) => {
                if (site.success) {
                    analysisPrompt += `Concurrent ${index + 1} (${site.domain}):
- Titre: ${site.title}
- Meta: ${site.metaDescription}
- H1: ${site.h1s.slice(0, 3).join(' | ')}
- H2: ${site.h2s.slice(0, 8).join(' | ')}
- Contenu: ${site.mainContent.substring(0, 1500)}

`;
                }
            });
        }

        analysisPrompt += `OBJECTIF:
Génère 15-20 suggestions de mots-clés SEO pertinents pour le site principal en analysant:
1. Le contenu réel du site principal
2. Les opportunités identifiées en comparant avec les concurrents
3. Les mots-clés que les concurrents utilisent mais pas le site principal
4. Les variations longue traîne basées sur le contenu réel
5. Les questions que les utilisateurs pourraient se poser

Pour chaque mot-clé, fournis:
- keyword: le mot-clé (en français)
- volume: volume de recherche mensuel estimé (50-10000, réaliste pour le marché français)
- difficulty: difficulté SEO (0-100, basée sur la compétition réelle)
- opportunity: opportunité ("high", "medium", "low") - basée sur la comparaison avec concurrents
- intent: intention ("informational", "transactional", "commercial", "navigational")
- reason: pourquoi ce mot-clé est pertinent (1 phrase basée sur l'analyse du contenu)

Priorise:
- Les mots-clés avec opportunité "high" (concurrents les utilisent, site principal non)
- Les variations longue traîne basées sur le contenu réel
- Les questions fréquentes liées au domaine
- Les mots-clés transactionnels si le site semble commercial

Retourne UNIQUEMENT un JSON valide avec un tableau "keywords".`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: analysisPrompt
                },
                {
                    role: 'user',
                    content: `Analyse ces sites et génère les suggestions de mots-clés optimisées pour ${mainSite.domain}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 3000
        });

        const result = JSON.parse(completion.choices[0].message.content);
        
        // Format and enhance keywords
        const keywords = (result.keywords || []).map((kw, index) => ({
            id: `kw_${Date.now()}_${index}`,
            keyword: kw.keyword,
            volume: kw.volume || Math.floor(Math.random() * 2000) + 100,
            difficulty: kw.difficulty || Math.floor(Math.random() * 50) + 20,
            opportunity: kw.opportunity || 'medium',
            intent: kw.intent || 'informational',
            reason: kw.reason || 'Pertinent pour le contenu analysé',
            trend: 'stable',
            competition: kw.difficulty > 60 ? 'high' : kw.difficulty > 30 ? 'medium' : 'low',
            cpc: kw.intent === 'transactional' ? (Math.random() * 5 + 0.5).toFixed(2) : (Math.random() * 2 + 0.1).toFixed(2)
        }));

        // Sort by opportunity and volume
        keywords.sort((a, b) => {
            const opportunityOrder = { high: 3, medium: 2, low: 1 };
            if (opportunityOrder[a.opportunity] !== opportunityOrder[b.opportunity]) {
                return opportunityOrder[b.opportunity] - opportunityOrder[a.opportunity];
            }
            return b.volume - a.volume;
        });

        return {
            success: true,
            keywords: keywords.slice(0, 20), // Return top 20
            analysis: {
                mainSite: {
                    domain: mainSite.domain,
                    title: mainSite.title,
                    scraped: mainSite.success
                },
                competitorsAnalyzed: competitorSites.filter(s => s.success).length,
                totalKeywords: keywords.length
            }
        };
    } catch (error) {
        console.error('Analyze competitors error:', error);
        throw error;
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
    clusterKeywords,
    analyzeCompetitors
};
