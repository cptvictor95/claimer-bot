const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client } = require("discord.js");
const fs = require("fs");

/** To Do
 * [x] Add more than 1 user to queue array
 * [] Add startedAt(UTC - Hora, Minuto, segundo || msegundo) Property to queue player object
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription(
      "Claim magic square spot based on Floor, Chamber Name and Number and Tickets used (2 tickets maximum)"
    )
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Magic Square Floor Number (1F-6F)")
        .setRequired(true)
        .addChoice("1F", "1F")
        .addChoice("2F", "2F")
        .addChoice("3F", "3F")
        .addChoice("4F", "4F")
        .addChoice("5F", "5F")
        .addChoice("6F", "6F")
    )
    .addStringOption((option) =>
      option
        .setName("chambername")
        .setDescription(
          "Magic Square Chamber Name (Gold/White Silver/Experience/Training/Magic Stone)"
        )
        .setRequired(true)
        .addChoice("Gold Chamber", "gold")
        .addChoice("White Silver Chamber", "white-silver")
        .addChoice("Experience Chamber", "experience")
        .addChoice("Training Chamber", "training")
        .addChoice("Magic Stone Chamber", "magic-stone")
    )
    .addStringOption((option) =>
      option
        .setName("chambernumber")
        .setDescription("Magic Square Chamber Number (I/II/III)")
        .setRequired(true)
        .addChoice("Chamber I", "1")
        .addChoice("Chamber II", "2")
        .addChoice("Chamber III", "3")
    )
    .addStringOption((option) =>
      option
        .setName("tickets")
        .setDescription("Number of tickets used: 1 or 2")
        .setRequired(true)
        .addChoice("1", "30")
        .addChoice("2", "60")
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand) return;
      if (interaction.commandName === "claim");
      const floor = interaction.options.getString("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const tickets = interaction.options.getString("tickets");

      const date = Date.now();

      const formattedChamber = `${chamberName}-${chamberNumber}.json`;
      let queue;
      queue = JSON.parse(
        fs.readFileSync(`./src/data/${floor}/${formattedChamber}`)
      );

      let queueDateCalc = queue;
      let newQueueDateCalc = eval(queueDateCalc);

      let startedAt = date;
      let endsAt = startedAt;
      let timeToEnter;
      let minutesLeft;

      const client = interaction.client;
      const guild = client.guilds.cache.get("903985002650411049");
      const channel = guild.channels.cache.get("903985002650411052");

      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );

      if (newQueueDateCalc.length == 1) {
        const endsAt01 = queueDateCalc[0].endsAt;
        startedAt = endsAt01;
      }

      if (newQueueDateCalc.length > 1) {
        const ticketsMap = newQueueDateCalc.map((player) => {
          return Number(player.spot.tickets);
        });

        const soma = ticketsMap.reduce((a, b) => a + b, 0);
        const position01 = date - queueDateCalc[0].startedAt;
        const result = soma * 60000 - position01;
        startedAt = date + result;
      }
      if (newQueueDateCalc.length > 0) {
        timeToEnter = startedAt - date;
        minuteTimeToEnter = timeToEnter / 60000;
        const formattedMinute = minuteTimeToEnter.toString().slice(0, 3);
        minutesLeft = formattedMinute;
      }

      if (tickets == "30") {
        endsAt = startedAt + 1800000;
      } else {
        endsAt = startedAt + 3600000;
      }

      const player = {
        userName: interaction.user.username,
        id: user.id,
        spot: {
          floor: floor,
          name: chamberName,
          number: chamberNumber,
          tickets: tickets,
        },
        startedAt: startedAt,
        endsAt: endsAt,
      };

      const newQueue = queue.push(player);
      fs.writeFileSync(
        `./src/data/${floor}/${formattedChamber}`,
        JSON.stringify(queue)
      );

      if (queue.length === 1) {
        await interaction.reply(
          `<@${user.id}> claimed ${
            chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
          } ${chamberNumber} on ${floor} for ${tickets} minutes. 
            \n ${
              interaction.user.username
            } you are ready to go! Enter the Magic Square!`
        );
      }
      if (queue.length > 1) {
        let result = timeToEnter - 300000;

        setTimeout(() => {
          channel.send({
            content: `<@${user.id}>, be ready in 5 minutes you are allowed to enter the Magic Square!`,
            ephemeral: true,
          });
        }, result);

        await interaction.reply(
          `<@${user.id}> claimed ${
            chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
          } ${chamberNumber} on ${floor} for ${tickets} minutes. 
              \nYour turn is in ${minutesLeft} minutes, be ready!`
        );
      }
      const queueExit = endsAt - date;
      setTimeout(() => {
        let timeoutQueue = JSON.parse(
          fs.readFileSync(`./src/data/${floor}/${formattedChamber}`)
        );
        eval(timeoutQueue);
        timeoutQueue.shift();
        fs.writeFileSync(
          `./src/data/${floor}/${formattedChamber}`,
          JSON.stringify(timeoutQueue)
        );
        if (timeoutQueue.length === 0) return;
        else {
          channel.send(
            `<@${timeoutQueue[0].id}>, You are ready to go! Enter the magic square!`
          );
        }
      }, queueExit);
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
