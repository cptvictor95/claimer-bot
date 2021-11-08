const fs = require("fs");
const { Client, Intents, Collection } = require("discord.js");
const claim = require("./commands/claim");
const { execute } = require("./commands/claim");
const fiveMinutesMessage = require("./events/fiveMinutesMessage");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

// console.clear();

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

let queue;
let newQueue;

client.on("ready", () => {
  const guild = client.guilds.cache.get("903985002650411049");
  const channel = guild.channels.cache.get("903985002650411052");

  setInterval(() => {
    queue = JSON.parse(fs.readFileSync("./src/data/queue.json"));
    newQueue = eval(queue);
    const date = Date.now();
    if (newQueue.length === 0) return;
    if (newQueue[0].endsAt <= date) {
      newQueue.shift();
      fs.writeFileSync("./src/data/queue.json", JSON.stringify(newQueue));
      channel.send(
        `${newQueue[0].userName}, You are ready to go! Enter the magic square!`
      );
    }
  }, 100);
});
