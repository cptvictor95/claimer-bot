const { Client, Intents, Collection } = require("discord.js");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

console.clear();

require("dotenv").config();

const token = process.env.TOKEN;

client.once("ready", () => {
  console.log("Ready!");
});

client.login(`${token}`);
