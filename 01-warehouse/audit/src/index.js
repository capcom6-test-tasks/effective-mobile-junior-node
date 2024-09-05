const redis = require('redis');

const app = require('./app');
const config = require('./config');
const { migrate, events } = require('./models');
const Queue = require('./queue');
const pool = require('./db');

async function initQueue() {
  const client = redis.createClient(config.brokerUrl);
  await client.connect();

  const queue = new Queue(client);
  const unsubscribe = await queue.subscribe(config.queueName, async (event) => {
    await events.insert(pool, event);
  });

  return async () => {
    unsubscribe();
    if (client.isOpen) {
      await client.quit();
    }
  };
}

async function main() {
  await migrate();

  const stop = await initQueue();

  const { port } = config;
  const server = app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });

  process.on('SIGINT', async () => {
    /* eslint-disable no-console */
    console.log('Shutting down...');
    server.close();
    await stop();
    console.log('Bye!');
    /* eslint-enable no-console */
  });
}

main();
