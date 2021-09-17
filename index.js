const { exit } = require('process');
const WolframAlphaAPI = require('wolfram-alpha-api');

if (process.argv.length != 4) {
  console.log('Usage: node . WOLFRAMALPHA_API_KEY DISCORD_BOT_API_KEY');
  exit(1);
}

console.log('Using WolframAlpha key: ' + process.argv[2]);
console.log('Using Discord key: ' + process.argv[3]);

// https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
const waApi = WolframAlphaAPI(process.argv[2]);

waApi
  .getShort('what is the mass of the earth')
  .then(console.log)
  .catch(console.error);
