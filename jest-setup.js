const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const testEnv = dotenv.parse(fs.readFileSync('.env.test'));
Object.keys(testEnv).forEach(key => {
  process.env[key] = testEnv[key];
});
