const { createClient } = require('redis');

class Publisher {
    constructor(
        brokerUrl,
        key
    ) {
        this.client = createClient({ url: brokerUrl });
        this.key = key;
    }

    async open() {
        await this.client.connect();
    }

    async publish(event) {
        await this.client.rPush(this.key, JSON.stringify(event));
    }

    async close() {
        await this.client.quit();
    }
}

module.exports = Publisher;