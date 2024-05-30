import { PostHogEvent, Webhook } from '@posthog/plugin-scaffold'

export function composeWebhook(event: PostHogEvent, { config }: any): Webhook {
    const headers = {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
    }

    let authHeader: [string, string] | undefined
    ;['Authorization', 'authorization'].forEach((header) => {
        if (headers[header]) {
            authHeader = [header, headers[header]]
            delete headers[header]
        }
    })

    if (authHeader) {
        if (authHeader[1].startsWith('Basic ')) {
            // base64 encoding helper
            const encoded = Buffer.from(authHeader[1].replace('Basic ', '')).toString('base64')
            headers[authHeader[0]] = `Basic ${encoded}`
        } else {
            headers[authHeader[0]] = authHeader[1]
        }
    }

    return {
        url: config.url,
        body: config.payload || JSON.stringify(event),
        headers,
        method: config.method || 'POST',
    }
}
