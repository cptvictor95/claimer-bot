const fs = require("fs");
const { Client, Intents, Collection } = require("discord.js");
const claim = require("./commands/claim");

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

client.on("ready", () => {
  setInterval(() => {
    let queue = JSON.parse(fs.readFileSync("./src/data/queue.json"));
    const newQueue = eval(queue);
    const date = Date.now();
    if (newQueue.length === 0) return;
    if (newQueue[0].endsAt <= date) {
      console.log("TESTE01");
      newQueue.shift();
      console.log("QUEUE:", newQueue);
      fs.writeFileSync("./src/data/queue.json", JSON.stringify(newQueue));
    }
  }, 200);
});
