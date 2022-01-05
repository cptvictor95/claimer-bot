const { Client } = require("discord.js");
const { Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

/** To Do
 * [x] Add more than 1 user to queue array
 * [] Add startedAt(UTC - Hora, Minuto, segundo || msegundo) Property to queue player object
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription(
      "Reivindica uma sala na Magic Square baseado no andar, nome e numero da chamber e tickets"
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
        .addChoice("Experience Chamber", "experience")
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
        .addChoice("3", "90")
        .addChoice("4", "120")
        .addChoice("5", "150")
        .addChoice("6", "180")
        .addChoice("7", "210")
        .addChoice("8", "240")
        .addChoice("9", "270")
        .addChoice("10", "300")
        .addChoice("11", "330")
        .addChoice("12", "360")
        .addChoice("13", "390")
        .addChoice("14", "420")
        .addChoice("15", "450")
        .addChoice("16", "480")
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand) return;
      if (interaction.commandName === "claim");
      const floor = interaction.options.getString("floor");
      const chamberName = interaction.options.getString("chambername");
      const chamberNumber = interaction.options.getString("chambernumber");
      const tickets = interaction.options.getString("tickets");

      const client = interaction.client;
      const guild = client.guilds.cache.get("903985002650411049");
      const channel = guild.channels.cache.get("903985002650411052");
      const member = interaction.member;

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

      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );

      if (
        tickets > 60 &&
        !member.roles.cache.some((role) => role.name === "75+")
      ) {
        await channel.send(
          `:no_entry_sign: <@${user.id}> você não é level 75+, portanto so pode utilizar 2 tickets`
        );
        return;
      } else if (
        tickets > 300 &&
        !member.roles.cache.some((role) => role.name === "81+")
      ) {
        await channel.send(
          `:no_entry_sign: <@${user.id}> você não é level 81+, portanto so pode utilizar 10 tickets`
        );
        return;
      }

      if (newQueueDateCalc.length == 1) {
        const endsAt01 = queueDateCalc[0].endsAt;
        startedAt = endsAt01;
      }

      if (newQueueDateCalc.length >= 2) {
        await interaction.reply(
          `:no_entry_sign: <@${user.id}>, essa fila esta cheia!`
        );
        return;
      }
      const checkUserRole = () => {
        if (queue.length === 0) return;
        if (date <= queue[0].endsAt - 1500000)
          return channel.send("Cannot Claim");
        const userRoles = member.roles.cache.map((role) => role.name);
        const seventyFive = userRoles.includes("75+");
        const eightyOne = userRoles.includes("81+");
        const eightyFive = userRoles.includes("85+");
        const hasNoRole = !seventyFive && !eightyOne && !eightyFive;
        if (hasNoRole) {
          channel.send("Cannot Claim");
          return;
        }
        if (date >= queue[0].endsAt - 300000 && seventyFive) {
          console.log("seventyFive");
          return true;
        }

        if (date >= queue[0].endsAt - 900000 && eightyOne) {
          console.log("eightyOne");
          return true;
        }
        if (date >= queue[0].endsAt - 1500000 && eightyFive) {
          console.log("eightyFive");
          return true;
        }
      };
      const canClaim = checkUserRole();
      if (!canClaim) return;
      if (newQueueDateCalc.length >= 0) {
        timeToEnter = startedAt - date;
        minuteTimeToEnter = timeToEnter / 60000;
        const formattedMinute = minuteTimeToEnter.toString().slice(0, 3);
        minutesLeft = formattedMinute;
      }

      const calcEndTime = (tickets) => {
        switch (tickets) {
          case "30":
            endsAt = startedAt + 1800000;
            break;
          case "60":
            endsAt = startedAt + 3600000;
            break;
          case "90":
            endsAt = startedAt + 5400000;
            break;
          case "120":
            endsAt = startedAt + 7200000;
            break;
          case "150":
            endsAt = startedAt + 9000000;
            break;
          case "180":
            endsAt = startedAt + 10800000;
            break;
          case "210":
            endsAt = startedAt + 12600000;
            break;
          case "240":
            endsAt = startedAt + 14400000;
            break;
          case "270":
            endsAt = startedAt + 16200000;
            break;
          case "300":
            endsAt = startedAt + 18000000;
            break;
          case "330":
            endsAt = startedAt + 19800000;
            break;
          case "360":
            endsAt = startedAt + 21600000;
            break;
          case "390":
            endsAt = startedAt + 23400000;
            break;
          case "420":
            endsAt = startedAt + 25200000;
            break;
          case "450":
            endsAt = startedAt + 27000000;
            break;
          case "480":
            endsAt = startedAt + 28800000;
            break;

          default:
            break;
        }
      };
      calcEndTime(tickets);

      // endsAt = startedAt + 1440000;

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

      if (queue.length == 1) {
        if (
          (date >= queue[0].endsAt - 1800000 &&
            date >= queue[0].endsAt - 1500000) ||
          date >= queue[0].endsAt - 1800000
        ) {
          await interaction.reply(
            `:no_entry_sign: <@${user.id}> Você não pode claimar 30 minutos antes do proximo na fila`
          );
          return;
        }
        if (
          date >= queue[0].endsAt - 300000 &&
          !member.roles.cache.some((role) => role.name === "75+")
        ) {
          await interaction.reply(
            `:no_entry_sign: <@${user.id}> Você não pode claimar 5 minutos antes do proximo pois não é 75+`
          );
          return;
        } else if (
          date >= queue[0].endsAt - 900000 &&
          !member.roles.cache.some((role) => role.name === "81+")
        ) {
          await interaction.reply(
            `:no_entry_sign: <@${user.id}> Você não pode claimar 15 minutos antes do proximo pois não é 81+`
          );
          return;
        } else if (
          date >= queue[0].endsAt - 1500000 &&
          !member.roles.cache.some((role) => role.name === "85+")
        ) {
          await interaction.reply(
            `:no_entry_sign: <@${user.id}> Você não pode claimar 25 minutos antes do proximo pois não é 85+`
          );
          return;
        }
      }

      const newQueue = queue.push(player);
      fs.writeFileSync(
        `./src/data/${floor}/${formattedChamber}`,
        JSON.stringify(queue)
      );
      if (queue.length === 1) {
        await interaction.reply(
          `:white_check_mark: <@${user.id}> reivindicou ${
            chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
          } ${chamberNumber} no ${floor} por ${tickets} minutos   
            \n :ballot_box_with_check: ${
              interaction.user.username
            } você esta liberado! Entre na Magic Square!`
        );
      }
      if (queue.length > 1) {
        let result = timeToEnter - 300000;
        await interaction.reply(
          `:white_check_mark: <@${user.id}> reivindicou ${
            chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
          } ${chamberNumber} no ${floor} por ${tickets} minutos   
              \n :stopwatch: Sua vez é em ${minutesLeft} minutos, esteja pronto!`
        );

        setTimeout(() => {
          channel.send({
            content: `:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você estara liberado para entrar na Magic Square!`,
            ephemeral: true,
          });
        }, result);
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
            `:ballot_box_with_check: <@${timeoutQueue[0].id}>, Você esta liberado! Entre na Magic Square!`
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
