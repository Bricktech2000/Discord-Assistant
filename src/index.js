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
  if (msg.content.split(' ').length <= 2) return;

  const quote = (text) => `> ${text.replaceAll('\n', '\n> ')}\n`;
  const bold = (text) => `**${text}**`;
  const code = (text) => `\`\`\`\n${text}\n\`\`\``;
  const table = (text) => `> ${text.replaceAll('\n', '\n> ')}\n`;
  // https://products.wolframalpha.com/api/explorer/
  const idMap = {
    Definition: quote,
    DefinitionPod: quote,
    BasicDefinitionPod: quote,
    Result: code,
    UnitConversion: code,
    IndefiniteIntegral: code,
    TravelTimes: code,
    Elemental2: table,
    // Thermodynamics: code,
    Material: table,
    Electromagnetic: table,
    // Chemical: code,
    Atomic: table,
    Abundance: table,
    Nuclear: table,
    // Identifier: code,
    BasicInformation: quote,
    NotableFacts: quote,
    ScientificContributions: quote,
    NetWorth: quote,
    // WikipediaSummary: quote,
    NutritionLabelSingle: table,
    // Calories: code,
    // Carbohydrates: code,
    // Fats: code,
    // Protein: code,
    // Vitamins: code,
    // Minerals: code,
    // Sterols: code,
    AlcoholContent: code,
    PhysicalProperties: code,
    AgeDistribution: code,
    ScientificName: quote,
    WikipediaSummary: quote,
    Synonyms: quote,
    Hypernym: quote,
    // Anagram: quote,
    SpeciesDataPhysicalProperties: quote,
    HumanComparisons: quote,
    DecimalApproximation: code,
    Numeric: code,
    ContinuedFraction: code,
    InstantaneousWeather: table,
    WeatherForecast: table,
    LocalTemperature: table,
    WeatherStationInformation: table,
  };

  waApi.getFull(msg.content).then((res) => {
    var reply = '';
    const pods = res.pods;
    console.log(pods);
    if (pods === undefined) return;

    for (var pod of pods) {
      for (var id of pod.id.split(':')) {
        if (idMap[id] !== undefined && pod.title !== 'Response') {
          reply += bold(pod.title) + '\n' + idMap[id](pod.subpods[0].plaintext);
        }
      }
    }
    if (reply === '') return;
    console.log(reply);
    msg.reply(reply.replaceAll('Wolfram Alpha', 'Discord Assistant'));
  });
  // .catch(() => null);
});

client.login(discordBotToken);
