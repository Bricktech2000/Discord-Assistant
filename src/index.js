const { exit } = require('process');
const WolframAlphaAPI = require('wolfram-alpha-api');
const { Client, Intents } = require('discord.js');

if (process.argv.length != 4) {
  console.log('Usage: node . WOLFRAMALPHA_API_KEY DISCORD_BOT_TOKEN');
  exit(1);
}

const wolframAlphaApi = process.argv[2];
const discordBotToken = process.argv[3];
console.log('Using WolframAlpha API key: ' + wolframAlphaApi);
console.log('Using Discord bot token: ' + discordBotToken);

// https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
const waApi = WolframAlphaAPI(wolframAlphaApi);

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

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

client.login(discordBotToken);
