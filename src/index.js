const { exit } = require('process');
const WolframAlphaAPI = require('wolfram-alpha-api');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { PassThrough } = require('stream');

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

const getEmbedFromPods = (pods) => {
  // https://products.wolframalpha.com/api/explorer/
  const idMap = {
    Definition: definition,
    DefinitionPod: definition,
    BasicDefinitionPod: quote,
    Result: code,
    UnitConversion: code,
    IndefiniteIntegral: code,
    TravelTimes: mathtable,
    Elemental2: mathtable,
    // Thermodynamics: code,
    Material: mathtable,
    Electromagnetic: mathtable,
    // Chemical: code,
    Atomic: mathtable,
    Abundance: mathtable,
    Nuclear: mathtable,
    // Identifier: code,
    BasicInformation: mathtable,
    NotableFacts: quote,
    ScientificContributions: list,
    NetWorth: quote,
    // WikipediaSummary: quote,
    // NutritionLabelSingle: table,
    // Calories: code,
    // Carbohydrates: code,
    // Fats: code,
    // Protein: code,
    // Vitamins: code,
    // Minerals: code,
    // Sterols: code,
    // AlcoholContent: code,
    PhysicalProperties: mathtable,
    AgeDistribution: code,
    ScientificName: quote,
    WikipediaSummary: quote,
    // Synonyms: list,
    Hypernym: list,
    // Anagram: quote,
    SpeciesDataPhysicalProperties: quote,
    HumanComparisons: quote,
    DecimalApproximation: code,
    Numeric: code,
    ContinuedFraction: code,
    InstantaneousWeather: mathtable,
    WeatherForecast: mathtable,
    LocalTemperature: mathtable,
    WeatherStationInformation: mathtable,
    Properties: mathtable,
    StatementPod: quote,
    FormulasPod: quote,
    PropertiesPod: list,
    TimeOffsets: code,
    // Phrase: quote,
    // Rhyme: list,
    GlobalMinimum: code,
    GlobalMaximum: code,
    IndefiniteIntegral: code,
    Root: code,
    ExpandedForm: code,
    AlternateForm: code,
    AlternateFormOfTheIntegral: code,
  };

  const reply = new MessageEmbed().setColor('#0088ff');
  for (var pod of pods) {
    for (var id of pod.id.split(':')) {
      if (idMap[id] === undefined || pod.title === 'Response') continue;
      const values = idMap[id](
        pod.subpods[0].plaintext
          .replaceAll('Wolfram Alpha', 'Discord Assistant')
          .replace(/[ \n]\(.*?\)/g, '')
      );
      for (var value of values) {
        reply.addFields({
          name: nonempty(value == values[0] ? pod.title : ''),
          value: nonempty(value),
          inline: values.length > 1,
        });
      }
    }
  }
  return reply;
};

const quote = (text) => [`> ${text.replaceAll('\n', '\n> ')}`];
const bold = (text) => [`**${text}**`];
const italic = (text) => [`_${text}_`];
const code = (text) => [`\`\`\`\n${text}\n\`\`\``];
const inline = (text) => [`\`${text}\``];
const nonempty = (text) => text || '\u200B';
const list = (text) => [`**-** ${text.split(' | ').join('\n**-** ')}`];
const table = (text, columnMap) => {
  const columns = [];

  for (var e = 0; e < columnMap.length; e++) {
    if (columnMap[e] === null) continue;
    columns.push('');
    for (var line of text.split('\n')) {
      const elements = line.split(' | ');
      if (elements.length != columnMap.length) continue;
      columns[columns.length - 1] += columnMap[e](elements[e]) + '\n';
    }
  }
  console.log(columns);
  return columns;
};
const mathtable = (text) => table(text, [(text) => text, inline]);
const definition = (text) =>
  quote(
    text
      .split('\n')
      .map((line) => bold(line.split(' | ')[1]) + ' - ' + line.split(' | ')[2])
      .join('\n')
  );

client.on('messageCreate', (msg) => {
  // https://stackoverflow.com/questions/49663283/how-to-detect-if-the-author-of-a-message-was-a-discord-bot/49667223#:~:text=If%20you%20want%20to%20check%20if%20the%20message%20author%20is,going%20if%20its%20another%20bot.
  if (msg.author.id === client.user.id) return;
  if (msg.content.split(' ').length <= 2) return;

  waApi.getFull(msg.content).then((res) => {
    // https://discord.js.org/#/docs/main/stable/class/MessageEmbed
    // https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor
    if (res.pods === undefined) return;
    const reply = getEmbedFromPods(res.pods);
    if (reply.fields.length == 0) return;
    console.log(res.pods);

    msg.channel.send({ embeds: [reply] });
  });
});

client.login(discordBotToken);
