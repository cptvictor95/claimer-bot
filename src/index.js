const fs = require("fs");
const { Client, Intents, Collection } = require("discord.js");
const config = require("../config.json");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

require("dotenv").config();

const token = process.env.TOKEN;

client.commands = new Collection();

// Command files iterator
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.data.name, command);
}
[config.antiCrash ? "antiCrash" : null].filter(Boolean).forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});
// Event files iterator
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(`${token}`);
