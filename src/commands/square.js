const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { calcEndTime } = require("../utils/calcEndTime");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("square")
    .setDescription(
      "Reivindica uma sala na Magic Square baseado no andar, nome e número da chamber e tickets"
    )
    .addStringOption((option) =>
      option
        .setName("floor")
        .setDescription("Número do Floor (1F-6F)")
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
        .setDescription("Nome da Chamber (Gold/Experience/Magic Stone)")
        .setRequired(true)
        .addChoice("Gold Chamber", "gold")
        .addChoice("Experience Chamber", "experience")
        .addChoice("Magic Stone Chamber", "magic-stone")
    )
    .addStringOption((option) =>
      option
        .setName("chambernumber")
        .setDescription("Número da Chamber (I/II/III)")
        .setRequired(true)
        .addChoice("Chamber I", "1")
        .addChoice("Chamber II", "2")
        .addChoice("Chamber III", "3")
    )
    .addStringOption((option) =>
      option
        .setName("tickets")
        .setDescription("Número de tickets: 1 or 2")
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
      if (interaction.commandName === "square");
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
        fs.readFileSync(`./src/magic-square/${floor}/${formattedChamber}`)
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
        const isTierOne = userRoles.includes("75+");
        const isTierTwo = userRoles.includes("81+");
        const isTierThree = userRoles.includes("85+");
        const hasNoRole = !isTierOne && !isTierTwo && !isTierThree;

        if (hasNoRole) {
          await interaction.reply({
            content: `\n:no_entry_sign: <@${user.id}> Você não possui nenhum cargo, por favor verifique com a staff. :no_entry_sign:`,
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

      calcEndTime(tickets, startedAt);

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

      const playerForAllPlayersQueue = {
        id: user.id,
        floor: floor,
        spot: formattedChamber,
      };

      queue.push(player);

      fs.writeFileSync(
        `./src/magic-square/${floor}/${formattedChamber}`,
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
          content: `\n:white_check_mark: <@${user.id}> reivindicou ${
            chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
          } ${chamberNumber} no ${floor} por ${tickets} minutos   
            \n:ballot_box_with_check: ${
              interaction.user.username
            } você já pode entrar na Magic Square!`,
          ephemeral: true,
        });
      }

      if (queue.length > 1) {
        let result = timeToEnter - 300000;
        await interaction.reply({
          content: `:white_check_mark: <@${user.id}> reivindicou ${
            chamberName.charAt(0).toUpperCase() + chamberName.slice(1)
          } ${chamberNumber} no ${floor} por ${tickets} minutos   
              \n:stopwatch: Sua vez é em ${minutesLeft} minutos, esteja pronto!`,
          ephemeral: true,
        });

        setTimeout(() => {
          channel.send({
            content: `\n:rotating_light: <@${user.id}>, esteja pronto! Em 5 minutos você poderá entrar na Magic Square!`,
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
          fs.readFileSync(`./src/magic-square/${floor}/${formattedChamber}`)
        );
        eval(timeoutQueue);
        timeoutQueue.shift();
        fs.writeFileSync(
          `./src/magic-square/${floor}/${formattedChamber}`,
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
        content: `Um erro aconteceu ao executar esse comando, por favor verifique com a staff.\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
