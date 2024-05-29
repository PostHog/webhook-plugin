import { PostHogEvent, Webhook } from '@posthog/plugin-scaffold'

export function composeWebhook(event: PostHogEvent, { config }: any): Webhook {
    return {
        url: config.url,
        body: config.payload || JSON.stringify(event),
        headers: {
            'Content-Type': 'application/json',
            ...(config.headers || {}),
        },
        method: config.method || 'POST',
    }
}
