const app = require('./app');
const config = require('./config');
const { migrate } = require('./models');
const { Publisher } = require('./events');
const { product, stock } = require('./models');

async function initEvents() {
  const publisher = new Publisher(config.brokerUrl, config.eventsKey);
  await publisher.open();

  product.events.on('create', async (event) => {
    await publisher.publish(event);
  });

  stock.events
    .on('replace', async (event) => {
      await publisher.publish(event);
    })
    .on('update', async (event) => {
      await publisher.publish(event);
    });

  return publisher;
}

async function main() {
  await migrate();

  const publisher = await initEvents();

  const { port } = config;
  const server = app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });

  process.on('SIGINT', () => {
    server.close();
    publisher.close();
  });
}

main();
