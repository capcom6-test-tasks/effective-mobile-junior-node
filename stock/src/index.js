const app = require('./app');
const config = require('./config');
const { migrate } = require('./models');

async function main() {
  await migrate();
  const { port } = config;
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}

main();
