const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime.js");
const { checkUserCanClaim } = require("../utils/checkUserCanClaim.js");
const { translatePositionText } = require("../utils/translatePositionText.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("peak")
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
      if (interaction.commandName === "peak");

      const floor = interaction.options.getString("floor");
      const position = interaction.options.getString("position");
      const tickets = interaction.options.getString("tickets");

      const client = interaction.client;
      const guild = client.guilds.cache.get("903985002650411049");
      const channel = guild.channels.cache.get("903985002650411052");
      const member = interaction.member;
      let formattedPosition = translatePositionText(position);

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

      const userRoles = member.roles.cache.map((role) => role.name);

      const isTierOne = userRoles.includes("75+");
      const isTierTwo = userRoles.includes("81+");
      const isTierThree = userRoles.includes("85+");

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

      if (!canClaim) return;

      if (queueDateCalc.length >= 0) {
        timeToEnter = startedAt - date;
        minuteTimeToEnter = timeToEnter / 60000;
        const formattedMinute = minuteTimeToEnter.toString().slice(0, 3);
        minutesLeft = formattedMinute;
      }

      calcEndTime(tickets, startedAt);

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

      // Daqui para Baixo a fila sempre estara populada pelo player que deu o claim

      queue.push(player);
      fs.writeFileSync(
        `./src/secret-peak/${floor}/${position}-aggressive.json`,
        JSON.stringify(queue)
      );

      allPlayersQueue = JSON.parse(
        fs.readFileSync("./src/players-on-queue.json")
      );

      allPlayersQueue.push(playerForAllPlayersQueue);
      fs.writeFileSync(
        `./src/players-on-queue.json`,
        JSON.stringify(allPlayersQueue)
      );

      if (queue.length === 1) {
        await interaction.reply({
          content: `\n:white_check_mark: <@${user.id}> pegou o spot de ${formattedPosition} agressivo no ${floor} por ${tickets} minutos
            \n:ballot_box_with_check: ${interaction.user.username}, você já pode entrar no Secret Peak!`,
          ephemeral: true,
        });
      }

      if (queue.length > 1) {
        let result = timeToEnter - 300000;
        await interaction.reply({
          content: `:white_check_mark: <@${user.id}> pegou o spot de ${formattedPosition} no ${floor} por ${tickets} minutos
              \n:stopwatch: Sua vez é em ${minutesLeft} minutos, esteja pronto!`,
        });

        setTimeout(() => {
          channel.send({
            content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você poderá entrar no Secret Peak!`,
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
            content: `\n:ballot_box_with_check: <@${timeoutQueue[0].id}> Você já pode entrar no Secret Peak!`,
            ephemeral: true,
          });
        }
      }, queueExit);
    } catch (error) {
      await interaction.reply({
        content: `Um erro aconteceu ao executar esse comando, por favor verifique com a staff.\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
