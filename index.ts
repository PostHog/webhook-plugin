import { PostHogEvent, Webhook } from '@posthog/plugin-scaffold'

export function composeWebhook(event: PostHogEvent, { config }: any): Webhook {
    // TODO: ignore if doesn't match event filters
    // TODO: user defining body
    return {
        url: config.url,
        body: JSON.stringify(event),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    }
}
