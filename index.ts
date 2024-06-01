import { exec } from '@posthog/hogvm'
import { PostHogEvent, Webhook } from '@posthog/plugin-scaffold'

export function composeWebhook(event: PostHogEvent, { config }: any): Webhook {
    // TODO: ignore if doesn't match event filters
    // TODO: user defining body
    const execOptions = {
        fields: {
            event: event,
        },
    }
    const bytecode = JSON.parse(config.bytecode)
    const res = exec(bytecode, execOptions)
    const body = res.result
    return {
        url: config.url,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    }
}
