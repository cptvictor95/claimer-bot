const fs = require("fs");

require("dotenv").config();

const clientId = process.env.CLIENT_ID;
const guildId =
  process.env.NODE_ENV === "dev"
    ? process.env.DEV_GUILD_ID
    : process.env.PROD_GUILD_ID;

const token = process.env.TOKEN;

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [];
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.info("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.info("Commands registered!");
  } catch (error) {
    console.error(error);
  }
})();
