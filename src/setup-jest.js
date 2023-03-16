// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID(),
  },
});
