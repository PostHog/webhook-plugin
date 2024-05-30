import { PostHogEvent, Webhook } from '@posthog/plugin-scaffold'

const { composeWebhook } = require('./index')

const event: PostHogEvent = {
    uuid: '123',
    team_id: 1,
    distinct_id: 'alice',
    event: 'pageview',
    timestamp: new Date('2023-01-01T00:00:00.000Z'),
    properties: {
        prop: 'value',
    },
}

describe('webhook plugin', () => {
    it('should have sensible defaults', () => {
        const webhook: Webhook = composeWebhook(event, { config: { url: 'https://example.com' } })
        expect(webhook).toMatchInlineSnapshot(`
            Object {
              "body": "{\\"uuid\\":\\"123\\",\\"team_id\\":1,\\"distinct_id\\":\\"alice\\",\\"event\\":\\"pageview\\",\\"timestamp\\":\\"2023-01-01T00:00:00.000Z\\",\\"properties\\":{\\"prop\\":\\"value\\"}}",
              "headers": Object {
                "Content-Type": "application/json",
              },
              "method": "POST",
              "url": "https://example.com",
            }
        `)
    })

    it('should allow overriding config options', () => {
        const webhook: Webhook = composeWebhook(event, {
            config: {
                url: 'https://example.com',
                payload: JSON.stringify({ my: 'payload' }),
                headers: {
                    'X-My-Header': 'my-value',
                },
                method: 'PUT',
            },
        })
        expect(webhook).toMatchInlineSnapshot(`
            Object {
              "body": "{\\"my\\":\\"payload\\"}",
              "headers": Object {
                "Content-Type": "application/json",
                "X-My-Header": "my-value",
              },
              "method": "PUT",
              "url": "https://example.com",
            }
        `)
    })

    it('should base64 encode basic auth headers', () => {
        let webhook: Webhook = composeWebhook(event, {
            config: {
                url: 'https://example.com',
                headers: {
                    Authorization: 'Basic user:password',
                },
            },
        })
        expect(webhook.headers?.Authorization).toMatchInlineSnapshot(`"Basic dXNlcjpwYXNzd29yZA=="`)

        webhook = composeWebhook(event, {
            config: {
                url: 'https://example.com',
                headers: {
                    authorization: 'Basic user:password',
                },
            },
        })
        expect(webhook.headers?.authorization).toMatchInlineSnapshot(`"Basic dXNlcjpwYXNzd29yZA=="`)
    })

    it('should not base64 encode non basic auth headers', () => {
        const webhook: Webhook = composeWebhook(event, {
            config: {
                url: 'https://example.com',
                headers: {
                    Authorization: 'Bearer user:password',
                },
            },
        })
        expect(webhook.headers?.Authorization).toMatchInlineSnapshot(`"Bearer user:password"`)
    })
})
