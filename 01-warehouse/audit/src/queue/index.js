// @ts-check
const { ClientClosedError } = require('redis');

class Queue {
    constructor(/** @type {import('redis').RedisClientType} */ client) {
        this.client = client;
    }

    async subscribe(
        /** @type {string} */
        queueName,
        /** @type {(message: object) => Promise<void>} */
        handler
    ) {
        const readNext = async () => {
            let interval = 1;
            try {
                const message = await this.client.blPop(queueName, 0.5);
                if (!message) {
                    return;
                }

                const payload = JSON.parse(message.element);
                if (!payload) {
                    console.error(`Invalid payload:`, message.element);
                    return;
                }

                await handler(payload);
                interval = 0;
            } catch (e) {
                if (e instanceof ClientClosedError) {
                    return;
                }

                console.error(e);
            } finally {
                if (timer) {
                    timer = setTimeout(readNext, interval);
                }
            }
        };

        /** @type {NodeJS.Timeout | null} */
        let timer = setTimeout(async () => {
            await readNext();
        }, 0);

        return () => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = null;
        };
    }
}

module.exports = Queue;
