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
                payload: { my: 'payload' },
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
})
