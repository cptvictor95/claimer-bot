const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime.js");
const { checkUserCanClaim } = require("../utils/checkUserCanClaim.js");
const { translatePositionText } = require("../utils/translatePositionText.js");
const moment = require("moment-timezone");
const guildId =
  process.env.NODE_ENV === "dev"
    ? process.env.DEV_GUILD_ID
    : process.env.PROD_GUILD_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pico")
    .setDescription("Reivindica uma spot no Secret Peak")
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Secret Peak Floor (2F)")
        .setRequired(true)
        .addChoice("2F", "2F")
    )
    .addStringOption((option) =>
      option
        .setName("position")
        .setDescription("Choose between Upper or Down and respective locations")
        .setRequired(true)
        .addChoice("Cima Norte", "upper-north")
        .addChoice("Cima Sul", "upper-south")
        .addChoice("Baixo Direita", "down-right")
        .addChoice("Baixo Esquerda", "down-left")
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
      if (interaction.commandName === "pico");

      const floor = interaction.options.getString("floor");
      const position = interaction.options.getString("position");
      const tickets = interaction.options.getString("tickets");
      const client = interaction.client;
      const guild = client.guilds.cache.get(guildId);
      const channel = interaction.channel;
      const member = interaction.member;
      const date = Date.now();
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );
      let allPlayersQueue = JSON.parse(
        fs.readFileSync("./src/players-on-queue.json")
      );
      let formattedPosition = translatePositionText(position);

      const findPlayer = allPlayersQueue.find(
        (player) => player.id === user.id
      );
      translatePositionText(position);

      if (findPlayer) {
        await interaction.reply({
          content: `:no_entry_sign: <@${user.id}> você já esta numa fila!`,
          ephemeral: true,
        });
        return;
      }

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
      let seconds;
      let minutes;
      let hours;
      let formattedDate;
      let formattedTicket;
      let ticketsHoursCalc;

      if (queue.length > 0 && queue[0].endsAt < date) {
        queue.shift();
      }

      if (!channel.name.includes("2f-spot-agressivo")) {
        await interaction.reply({
          content: `:no_entry_sign: <@${user.id}> é necessario dar claim na sala certa :no_entry_sign:`,
          ephemeral: true,
        });
        return;
      }

      const userRoles = member.roles.cache.map((role) => role.name);

      const isTierOne = userRoles.includes("75+");
      const isTierTwo = userRoles.includes("81+");
      const isTierThree = userRoles.includes("86+");
      const anyTier = !isTierOne && !isTierTwo && !isTierThree;

      if (Number(tickets) > 60 && anyTier) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> você pode usar no máximo 2 tickets. :no_entry_sign:`,
          ephemeral: true,
        });

        return;
      }

      if (Number(tickets) > 60 && isTierOne) {
        await interaction.reply({
          content: `\n:no_entry_sign: <@${user.id}> você pode usar no máximo 2 tickets. :no_entry_sign:`,
          ephemeral: true,
        });

        return;
      }

      if (Number(tickets) > 300 && isTierTwo) {
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

      const canClaim = await checkUserCanClaim(
        date,
        queue,
        isTierOne,
        isTierTwo,
        isTierThree,
        interaction,
        user
      );

      if (!canClaim) {
        return;
      }

      endsAt = calcEndTime(tickets, startedAt);

      if (queueDateCalc.length >= 0) {
        timeToEnter = startedAt - date;
        ticketsInMs = endsAt - startedAt;
        minuteTimeToEnter = timeToEnter / 60000;
        seconds = Math.floor(timeToEnter / 1000) % 60;
        minutes = Math.floor((timeToEnter / (1000 * 60)) % 60);
        hours = Math.floor((timeToEnter / (1000 * 60 * 60)) % 24);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        let ticketsSecCalc = Math.floor(ticketsInMs / 1000) % 60;
        let ticketsMinCalc = Math.floor((ticketsInMs / (1000 * 60)) % 60);
        ticketsHoursCalc = Math.floor((ticketsInMs / (1000 * 60 * 60)) % 24);
        ticketsHoursCalc =
          ticketsHoursCalc < 10 ? "0" + ticketsHoursCalc : ticketsHoursCalc;
        ticketsMinCalc =
          ticketsMinCalc < 10 ? "0" + ticketsMinCalc : ticketsMinCalc;
        ticketsSecCalc =
          ticketsSecCalc < 10 ? "0" + ticketsSecCalc : ticketsSecCalc;
        formattedDate = hours + ":" + minutes + ":" + seconds;
        formattedTicket =
          ticketsHoursCalc + ":" + ticketsMinCalc + ":" + ticketsSecCalc;
      }

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
        place: "secret-peak",
        id: user.id,
        floor: floor,
        spot: `${position}-aggressive.json`,
      };

      // Daqui para Baixo a fila sempre estara populada pelo player que deu o claim

      queue.push(player);
      fs.writeFileSync(
        `./src/secret-peak/${floor}/${position}-aggressive.json`,
        JSON.stringify(queue)
      );

      allPlayersQueue.push(playerForAllPlayersQueue);
      fs.writeFileSync(
        `./src/players-on-queue.json`,
        JSON.stringify(allPlayersQueue)
      );

      if (queue.length === 1) {
        if (ticketsHoursCalc > 0) {
          await interaction.reply({
            content: `\n:white_check_mark: <@${
              user.id
            }> pegou o spot de ${formattedPosition} no ${floor} por ${formattedTicket.slice(
              0,
              5
            )} horas   
            \n:ballot_box_with_check: ${
              interaction.user.username
            } você já pode entrar no Secret Peak!\n ------------------`,
          });
        } else {
          await interaction.reply({
            content: `:white_check_mark: <@${
              user.id
            }> pegou o spot de ${formattedPosition} no ${floor} por ${formattedTicket.slice(
              3,
              8
            )} minutos   
          \n:ballot_box_with_check: ${
            interaction.user.username
          } você já pode entrar na Secret Peak!\n ------------------`,
          });
        }
      }
      if (queue.length > 1) {
        let result = timeToEnter - 300000;
        if (minutes + hours > 0) {
          if (ticketsHoursCalc > 0) {
            await interaction.reply({
              content: `:white_check_mark: <@${
                user.id
              }> pegou o spot de ${formattedPosition} no ${floor} por ${formattedTicket.slice(
                0,
                5
              )} horas   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} minutos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `:white_check_mark: <@${
                user.id
              }> pegou o spot de ${formattedPosition} no ${floor} por ${formattedTicket.slice(
                3,
                8
              )} minutos   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} minutos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          }

          setTimeout(() => {
            channel.send({
              content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você poderá entrar na Secret Peak!\n ------------------`,
              ephemeral: true,
            });
          }, result);
        } else {
          if (ticketsHoursCalc > 0) {
            await interaction.reply({
              content: `:white_check_mark: <@${
                user.id
              }> pegou o spot de ${formattedPosition} no ${floor} por ${formattedTicket.slice(
                0,
                5
              )} horas   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} segundos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `:white_check_mark: <@${
                user.id
              }> pegou o spot de ${formattedPosition} ${chamberNumber} no ${floor} por ${formattedTicket.slice(
                3,
                8
              )} minutos   
              \n:stopwatch: Sua vez é em ${formattedDate.slice(
                3,
                8
              )} segundos, esteja pronto!\n ------------------`,
              ephemeral: true,
            });
          }

          setTimeout(() => {
            channel.send({
              content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você poderá entrar na Secret Peak!\n ------------------`,
              ephemeral: true,
            });
          }, result);
        }
      }

      const queueExit = endsAt - date;

      setTimeout(() => {
        const allPlayersOnQueue = JSON.parse(
          fs.readFileSync("./src/players-on-queue.json")
        );
        const check = allPlayersOnQueue.map((player) => player.id === user.id);

        if (!check) {
          return;
        }

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

        if (timeoutQueue.length === 0) {
          channel.send(
            `:warning: ATUALIZAÇÃO FILA ${formattedPosition} ${floor} :warning: \nAcabou a vez de <@${user.id}>, agora a fila esta vazia!\n ------------------`
          );
          return;
        }
        channel.send({
          content: `\n:ballot_box_with_check: <@${timeoutQueue[0].id}> Você já pode entrar no Secret Peak!\n ------------------`,
          ephemeral: true,
        });
        channel.send(
          `:warning: ATUALIZAÇÃO FILA ${formattedPosition} ${floor} :warning: \n Acabou a vez de <@${
            user.id
          }>, a fila agora contem 1 pessoa: \n <@${
            timeoutQueue[0].userName
          }>\n Começou em: ${moment
            .tz(timeoutQueue[0].startedAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)} \n Acabara em: ${moment
            .tz(timeoutQueue[0].startedAt, "America/Sao_Paulo")
            .format()
            .slice(11, 16)}!\n ------------------`
        );
      }, queueExit);
    } catch (error) {
      await interaction.reply({
        content: `Um erro aconteceu ao executar esse comando, por favor verifique com a staff.\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
