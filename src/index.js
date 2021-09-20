const { exit } = require('process');
const WolframAlphaAPI = require('wolfram-alpha-api');
const { Client, Intents, MessageEmbed } = require('discord.js');

if (process.argv.length != 4) {
  console.log('Usage: node . WOLFRAMALPHA_API_KEY DISCORD_BOT_TOKEN');
  exit(1);
}

const wolframAlphaApi = process.argv[2];
const discordBotToken = process.argv[3];
console.log('Using WolframAlpha API key: ' + wolframAlphaApi);
console.log('Using Discord bot token: ' + discordBotToken);

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
    Material: mathtable,
    Electromagnetic: mathtable,
    Atomic: mathtable,
    Abundance: mathtable,
    Nuclear: mathtable,
    BasicInformation: mathtable,
    NotableFacts: quote,
    ScientificContributions: list,
    NetWorth: quote,
    PhysicalProperties: mathtable,
    AgeDistribution: code,
    ScientificName: quote,
    WikipediaSummary: quote,
    SpeciesDataPhysicalProperties: mathtable,
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
    GlobalMinimum: code,
    GlobalMaximum: code,
    IndefiniteIntegral: code,
    Root: code,
    ExpandedForm: code,
    AlternateForm: code,
    AlternateFormOfTheIntegral: code,
    BasicUnitDimensions: code,
    CompanyManagement: quote,
    Value: code,
    ConversionToOtherUnits: codetable,
    ConversionFromOtherUnits: codetable,
    UnitType: quote,
    BasalMetabolicRate: code,
    EnergyExpenditure: mathtable,
    RealSolution: code,
    SymbolicSolution: code,
    AlternateForm: code,
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
      values.length > 1 &&
        reply.addFields({ name: nonempty(), value: nonempty() }); //fix inline fields
    }
  }
  if (reply.fields.length == 0) reply.setTitle("Sorry, I didn't get that.");
  else reply.setTitle(pods[0].subpods[0].plaintext);
  return reply;
};

const quote = (text) => [`> ${text.replaceAll('\n', '\n> ')}`];
const bold = (text) => [`**${nonempty(text)}**`];
const italic = (text) => [`_${nonempty(text)}_`];
const code = (text) => [`\`\`\`\n${nonempty(text)}\n\`\`\``];
const inline = (text) => [`\`${nonempty(text)}\``];
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
const codetable = (text) => table(text, [inline, inline]);
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
  if (msg.content.split(' ').length <= 1) return;
  const isMentioned = msg.mentions.members.first()?.id == client.user.id;

  // https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#using-regular-expressions
  waApi.getFull(msg.content.replace(/<@!?(\d+)>/g, '')).then((res) => {
    // https://discord.js.org/#/docs/main/stable/class/MessageEmbed
    // https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor
    if (res.pods === undefined) res.pods = [];
    console.log(res.pods);
    // https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript/29447130
    const ignore = [
      'Definition',
      'CompanyInformation',
      'MusicAlbumData',
      'BoardGameData',
      'MusicWorkData',
      'MovieData',
      'BookData',
      'TelevisionProgramData',
      'AlternateNamesPod',
    ];
    if (
      res.pods.length > 1 &&
      ignore.some((value) => res.pods[1].id.includes(value)) &&
      !isMentioned
    )
      return;
    const reply = getEmbedFromPods(res.pods);
    if (reply.fields.length == 0 && !isMentioned) return;

    msg.channel.send({ embeds: [reply] });
  });
});

client.login(discordBotToken);
