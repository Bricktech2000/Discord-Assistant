const { exit } = require('process');
const WolframAlphaAPI = require('wolfram-alpha-api');

const { Client, Intents } = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

if (process.argv.length != 4) {
  console.log('Usage: node . WOLFRAMALPHA_API_KEY DISCORD_BOT_TOKEN');
  exit(1);
}

console.log('Using WolframAlpha API key: ' + process.argv[2]);
console.log('Using Discord bot token: ' + process.argv[3]);

// https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
const waApi = WolframAlphaAPI(process.argv[2]);

client.on('ready', () => {
  console.log('Ready.');
});

client.on('messageCreate', (msg) => {
  // https://stackoverflow.com/questions/49663283/how-to-detect-if-the-author-of-a-message-was-a-discord-bot/49667223#:~:text=If%20you%20want%20to%20check%20if%20the%20message%20author%20is,going%20if%20its%20another%20bot.
  if (msg.author.id === client.user.id) return;
  if (msg.content.split(' ').length < 3) return;

  const bold = (text) => `**${text}**`;

  waApi
    .getShort(msg.content)
    .then((res) =>
      msg.reply(bold(res.replaceAll('Wolfram Alpha', 'Discord Assistant')))
    )
    .catch(() => null);
});

client.login(process.argv[3]);
