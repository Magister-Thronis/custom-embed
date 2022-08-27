const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent],
  partials: [User, Message, GuildMember, ThreadMember],
});

client.tools = require(`./util/Tools`);
client.config = require("./config.json");
client.commands = new Collection();
client.buttons = new Collection();
client.events = new Collection();

client
  .login(client.config.token)
  .then(() => {
    loadEvents(client);
    loadCommands(client);
    loadButtons(client);
  })
  .catch((err) => console.log(err));
