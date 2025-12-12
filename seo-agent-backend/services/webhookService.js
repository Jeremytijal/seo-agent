const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

class WebhookService {
    async triggerWebhook(url, payload) {
        if (!url) return;

        try {
            console.log(`Triggering webhook to ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`Webhook failed with status ${response.status}`);
            } else {
                console.log('Webhook triggered successfully');
            }
        } catch (error) {
            console.error('Error triggering webhook:', error);
        }
    }
}

module.exports = new WebhookService();
