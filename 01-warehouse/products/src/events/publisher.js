const { createClient } = require('redis');

class Publisher {
  constructor(
    brokerUrl,
    queueName,
  ) {
    this.client = createClient({ url: brokerUrl });
    this.queueName = queueName;
  }

  async open() {
    await this.client.connect();
  }

  async publish(event) {
    await this.client.rPush(this.queueName, JSON.stringify(event));
  }

  async close() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}

module.exports = Publisher;
