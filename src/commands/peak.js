const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const translatePositionText = require("../utils/translatePositionText.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("peak")
    .setDescription("Reivindica uma spot no Secret Peak")
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Magic Square Floor Number (2F)")
        .setRequired(true)
        .addChoice("2F", "2F")
    )
    .addStringOption((option) =>
      option
        .setName("position")
        .setDescription("Choose between Upper or Down and respective locations")
        .setRequired(true)
        .addChoice("Upper-North", "upper-north")
        .addChoice("Upper-South", "upper-south")
        .addChoice("Down-Right", "down-right")
        .addChoice("Down-Left", "down-left")
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
      if (interaction.commandName === "peak");
      console.log(interaction.options.getString("floor"));
      console.log(interaction.options.getString("position"));
      console.log(interaction.options.getString("tickets"));
      const floor = interaction.options.getString("floor");
      const position = interaction.options.getString("position");
      const tickets = interaction.options.getString("tickets");

      const client = interaction.client;
      const guild = client.guilds.cache.get("903985002650411049");
      const channel = guild.channels.cache.get("903985002650411052");
      const member = interaction.member;
      let formattedPosition;

      translatePositionText(position);

      const date = Date.now();
      let queue;
      queue = JSON.parse(
        fs.readFileSync(
          `./src/secret-peak/${floor}/${position}-aggressive.json`
        )
      );
      let queueDateCalc = eval(queue);

      let startedAt = date;
      let endsAt = startedAt;
      let timeToEnter;
      let minutesLeft;

      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );

      if (queue.length > 0 && queue[0].endsAt < date) {
        queue.shift();
      }

      const rolesTicketsCalc =
        !member.roles.cache.some((role) => role.name === "81+") ||
        !member.roles.cache.some((role) => role.name === "85+");

      if (Number(tickets) > 60 && !rolesTicketsCalc) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> você pode usar no máximo 2 tickets. :no_entry_sign:`,
          ephemeral: true,
        });

        return;
      }
      if (
        Number(tickets) > 300 &&
        !member.roles.cache.some((role) => role.name === "85+")
      ) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> você pode usar no máximo 10 tickets. :no_entry_sign:`,
          ephemeral: true,
        });
        return;
      }

      if (queueDateCalc.length == 1) {
        const endsAt01 = queueDateCalc[0].endsAt;
        startedAt = endsAt01;
      }

      if (queueDateCalc.length >= 2) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> essa fila está cheia! :no_entry_sign:`,
          ephemeral: true,
        });

        return;
      }

      const checkUserRole = async () => {
        if (queue.length === 0) return true;
        if (date <= queue[0].endsAt - 1500000) {
          await interaction.reply(
            `\n:no_entry_sign: <@${user.id}> Você ainda não pode dar claim aqui. :no_entry_sign:`
          );
          return false;
        }

        const userRoles = member.roles.cache.map((role) => role.name);
        const seventyFive = userRoles.includes("75+");
        const eightyOne = userRoles.includes("81+");
        const eightyFive = userRoles.includes("85+");
        const hasNoRole = !seventyFive && !eightyOne && !eightyFive;

        if (hasNoRole) {
          await interaction.reply({
            content: `\n:no_entry_sign: <@${user.id}> Você não possui nenhum cargo, portanto não pode claimar quando outro estiver na fila. :no_entry_sign:`,
            ephemeral: true,
          });

          return false;
        }
        if (date >= queue[0].endsAt - 300000 && seventyFive) {
          return true;
        }

        if (date >= queue[0].endsAt - 900000 && eightyOne) {
          return true;
        }

        if (date >= queue[0].endsAt - 1500000 && eightyFive) {
          return true;
        }
      };

      const canClaim = await checkUserRole();

      if (!canClaim) return;

      if (queueDateCalc.length >= 0) {
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

      const player = {
        userName: interaction.user.username,
        id: user.id,
        spot: {
          floor: floor,
          tickets: tickets,
          position: position,
        },
        startedAt: startedAt,
        endsAt: endsAt,
      };

      const playerForAllPlayersQueue = {
        id: user.id,
        floor: floor,
        spot: position,
      };
      //Daqui para Baixo a fila sempre estara populada pelo player que deu o claim
      const newQueue = queue.push(player);
      fs.writeFileSync(
        `./src/secret-peak/${floor}/${position}-aggressive.json`,
        JSON.stringify(queue)
      );

      allPlayersQueue = JSON.parse(
        fs.readFileSync("./src/players-on-queue.json")
      );
      console.log(allPlayersQueue);
      const newAllPlayersQueue = allPlayersQueue.push(playerForAllPlayersQueue);
      fs.writeFileSync(
        `./src/players-on-queue.json`,
        JSON.stringify(allPlayersQueue)
      );

      if (queue.length === 1) {
        await interaction.reply({
          content: `\n:white_check_mark: <@${user.id}> pegou o spot de ${formattedPosition} agressivo no ${floor} por ${tickets} minutos   
            \n:ballot_box_with_check: ${interaction.user.username}, não há ninguem na fila, você está liberado! Entre no Secret Peak!`,
          ephemeral: true,
        });
      }

      if (queue.length > 1) {
        let result = timeToEnter - 300000;
        await interaction.reply({
          content: `:white_check_mark: <@${user.id}> pegou o spot de ${formattedPosition} no ${floor} por ${tickets} minutos   
              \n:stopwatch: Sua vez é em ${minutesLeft} minutos, esteja pronto!`,
          ephemeral: true,
        });

        setTimeout(() => {
          channel.send({
            content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você estara liberado para entrar na Magic Square!`,
            ephemeral: true,
          });
        }, result);
      }

      const queueExit = endsAt - date;

      setTimeout(() => {
        const checkPlayerInQueue = () => {
          const allPlayersOnQueue = JSON.parse(
            fs.readFileSync("./src/players-on-queue.json")
          );
          const check = allPlayersOnQueue.map(
            (player) => player.id === user.id
          );
          console.log(check);
          return check;
        };
        checkPlayerInQueue();

        if (!checkPlayerInQueue) return;

        let timeoutQueue = JSON.parse(
          fs.readFileSync(
            `./src/secret-peak/${floor}/${position}-aggressive.json`
          )
        );
        eval(timeoutQueue);
        timeoutQueue.shift();
        fs.writeFileSync(
          `./src/secret-peak/${floor}/${position}-aggressive.json`,
          JSON.stringify(timeoutQueue)
        );
        allPlayersQueue.shift();
        fs.writeFileSync(
          `./src/players-on-queue.json`,
          JSON.stringify(allPlayersQueue)
        );

        if (timeoutQueue.length === 0) return;
        else {
          channel.send({
            content: `\n:ballot_box_with_check: <@${timeoutQueue[0].id}>, Você está liberado! Entre na Magic Square!`,
            ephemeral: true,
          });
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
