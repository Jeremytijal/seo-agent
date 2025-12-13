/**
 * WordPress Integration Service
 * Handles connection testing, article publishing, and media uploads
 */

const crypto = require('crypto');

// Encryption key for storing credentials securely
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'seo-agent-default-key-32bytes!!'; // 32 bytes

/**
 * Encrypt sensitive data before storing
 */
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt stored credentials
 */
function decrypt(encryptedText) {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Test connection to a WordPress site
 * @param {string} siteUrl - WordPress site URL
 * @param {string} username - WordPress username
 * @param {string} appPassword - Application password
 * @returns {Object} Connection test result
 */
async function testConnection(siteUrl, username, appPassword) {
    try {
        // Normalize URL
        const baseUrl = siteUrl.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/wp-json/wp/v2/users/me`;

        const credentials = Buffer.from(`${username}:${appPassword}`).toString('base64');

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('WordPress connection test failed:', response.status, errorText);
            
            if (response.status === 401) {
                return { success: false, error: 'Identifiants incorrects. Vérifiez votre mot de passe d\'application.' };
            }
            if (response.status === 404) {
                return { success: false, error: 'API REST WordPress non trouvée. Vérifiez que les permaliens sont activés.' };
            }
            return { success: false, error: `Erreur ${response.status}: ${errorText}` };
        }

        const userData = await response.json();

        // Also check if we can create posts
        const postsUrl = `${baseUrl}/wp-json/wp/v2/posts`;
        const postsResponse = await fetch(postsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        const canPublish = postsResponse.ok;

        return {
            success: true,
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                roles: userData.roles || []
            },
            capabilities: {
                canPublish,
                canUploadMedia: userData.capabilities?.upload_files || false
            },
            siteInfo: {
                url: baseUrl,
                restApiEnabled: true
            }
        };
    } catch (error) {
        console.error('WordPress connection error:', error);
        return {
            success: false,
            error: error.message || 'Impossible de se connecter au site WordPress'
        };
    }
}

/**
 * Publish an article to WordPress
 * @param {Object} site - Site configuration with credentials
 * @param {Object} article - Article data
 * @returns {Object} Published post data
 */
async function publishArticle(site, article) {
    try {
        const baseUrl = site.url.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/wp-json/wp/v2/posts`;

        // Decrypt password if encrypted
        const password = site.password_encrypted 
            ? decrypt(site.password_encrypted) 
            : site.password;

        const credentials = Buffer.from(`${site.username}:${password}`).toString('base64');

        const postData = {
            title: article.title,
            content: article.content,
            status: article.status || 'draft', // 'publish' or 'draft'
            excerpt: article.excerpt || article.metaDescription || '',
            categories: article.categories || [],
            tags: article.tags || []
        };

        // Add featured image if provided
        if (article.featuredImageId) {
            postData.featured_media = article.featuredImageId;
        }

        // Add meta fields for SEO plugins (Yoast, RankMath)
        if (article.metaDescription || article.metaTitle) {
            postData.meta = {};
            if (article.metaDescription) {
                postData.meta._yoast_wpseo_metadesc = article.metaDescription;
                postData.meta.rank_math_description = article.metaDescription;
            }
            if (article.metaTitle) {
                postData.meta._yoast_wpseo_title = article.metaTitle;
                postData.meta.rank_math_title = article.metaTitle;
            }
            if (article.focusKeyword) {
                postData.meta._yoast_wpseo_focuskw = article.focusKeyword;
                postData.meta.rank_math_focus_keyword = article.focusKeyword;
            }
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
        }

        const post = await response.json();

        return {
            success: true,
            postId: post.id,
            url: post.link,
            status: post.status,
            editUrl: `${baseUrl}/wp-admin/post.php?post=${post.id}&action=edit`
        };
    } catch (error) {
        console.error('WordPress publish error:', error);
        return {
            success: false,
            error: error.message || 'Erreur lors de la publication'
        };
    }
}

/**
 * Upload an image to WordPress media library
 * @param {Object} site - Site configuration
 * @param {Buffer|string} imageData - Image data (buffer or base64)
 * @param {string} filename - Image filename
 * @returns {Object} Uploaded media data
 */
async function uploadImage(site, imageData, filename) {
    try {
        const baseUrl = site.url.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/wp-json/wp/v2/media`;

        const password = site.password_encrypted 
            ? decrypt(site.password_encrypted) 
            : site.password;

        const credentials = Buffer.from(`${site.username}:${password}`).toString('base64');

        // Convert base64 to buffer if needed
        const buffer = typeof imageData === 'string' 
            ? Buffer.from(imageData, 'base64')
            : imageData;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'image/jpeg',
                'Content-Disposition': `attachment; filename="${filename}"`
            },
            body: buffer
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Media upload failed: ${response.status} - ${errorText}`);
        }

        const media = await response.json();

        return {
            success: true,
            mediaId: media.id,
            url: media.source_url,
            thumbnail: media.media_details?.sizes?.thumbnail?.source_url
        };
    } catch (error) {
        console.error('WordPress media upload error:', error);
        return {
            success: false,
            error: error.message || 'Erreur lors de l\'upload'
        };
    }
}

/**
 * Get categories from WordPress
 * @param {Object} site - Site configuration
 * @returns {Array} List of categories
 */
async function getCategories(site) {
    try {
        const baseUrl = site.url.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/wp-json/wp/v2/categories?per_page=100`;

        const password = site.password_encrypted 
            ? decrypt(site.password_encrypted) 
            : site.password;

        const credentials = Buffer.from(`${site.username}:${password}`).toString('base64');

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const categories = await response.json();
        return categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat.count
        }));
    } catch (error) {
        console.error('WordPress categories error:', error);
        return [];
    }
}

/**
 * Save WordPress site connection to database
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {Object} siteData - Site connection data
 */
async function saveSiteConnection(supabase, userId, siteData) {
    const encryptedPassword = encrypt(siteData.appPassword);

    const { data, error } = await supabase
        .from('connected_sites')
        .upsert({
            user_id: userId,
            platform: 'wordpress',
            site_url: siteData.url,
            site_name: siteData.siteName || new URL(siteData.url).hostname,
            username: siteData.username,
            password_encrypted: encryptedPassword,
            status: 'active',
            last_sync: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,site_url'
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving site connection:', error);
        throw error;
    }

    return data;
}

/**
 * Get connected sites for a user
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 */
async function getConnectedSites(supabase, userId) {
    const { data, error } = await supabase
        .from('connected_sites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching connected sites:', error);
        return [];
    }

    // Don't return encrypted passwords to frontend
    return (data || []).map(site => ({
        ...site,
        password_encrypted: undefined,
        hasCredentials: !!site.password_encrypted
    }));
}

/**
 * Delete a site connection
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} siteId - Site ID
 */
async function deleteSiteConnection(supabase, userId, siteId) {
    const { error } = await supabase
        .from('connected_sites')
        .delete()
        .eq('id', siteId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting site connection:', error);
        throw error;
    }

    return { success: true };
}

module.exports = {
    testConnection,
    publishArticle,
    uploadImage,
    getCategories,
    saveSiteConnection,
    getConnectedSites,
    deleteSiteConnection,
    encrypt,
    decrypt
};




