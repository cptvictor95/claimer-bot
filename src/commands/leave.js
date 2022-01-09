const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { translatePositionText } = require("../utils/translatePositionText");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Sai da fila que estava"),
  async execute(interaction) {
    try {
      const client = interaction.client;
      const user = client.users.cache.find(
        (u) => u.tag === `${interaction.user.tag}`
      );
      const queue = JSON.parse(fs.readFileSync("./src/players-on-queue.json"));

      if (queue.length === 0) {
        await interaction.reply({
          content: ":no_entry_sign: Não ha ninguem em nenhuma fila",
          ephemeral: true,
        });
        return;
      }

      const removeFromQueue = async () => {
        const findPlayer = queue.find((player) => player.id === user.id);

        if (!findPlayer) {
          await interaction.reply({
            content: `:no_entry_sign: <@${user.id}> você não está em nenhuma fila! :no_entry_sign:`,
            ephemeral: true,
          });
          return;
        }

        const allPlayersQueueIds = queue.map((player) => player.id);
        const place = findPlayer.place;
        const floor = findPlayer.floor;
        let spot = findPlayer.spot;
        let formattedSpot;
        let queueOfPlayer;

        queueOfPlayer = JSON.parse(
          fs.readFileSync(`./src/${place}/${findPlayer.floor}/${spot}`)
        );

        const playerInsideQueue = queueOfPlayer.find(
          (player) => player.id === user.id
        );

        const arrayOfPlayersId = queueOfPlayer.map((player) => player.id);
        const playerIndex = arrayOfPlayersId.indexOf(`${findPlayer.id}`);
        const newQueue = queueOfPlayer.splice(playerIndex, 1);

        const indexOffAllPlayersQueue = allPlayersQueueIds.indexOf(
          `${user.id}`
        );
        const newAllPlayersQueue = queue.splice(indexOffAllPlayersQueue, 1);

        fs.writeFileSync(
          `./src/${place}/${findPlayer.floor}/${findPlayer.spot}`,
          JSON.stringify(queueOfPlayer)
        );

        fs.writeFileSync(`./src/players-on-queue.json`, JSON.stringify(queue));

        if (!playerInsideQueue.spot.name) {
          formattedSpot = translatePositionText(
            playerInsideQueue.spot.position
          );
          await interaction.reply(
            `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila ${floor} ${formattedSpot}`
          );
          return;
        }

        switch (playerInsideQueue.spot.name) {
          case "gold":
            formattedSpot = "Gold Chamber";
            break;
          case "experience":
            formattedSpot = "Experience Chamber";
            break;
          case "training":
            formattedSpot = "Training Chamber";
            break;
          case "white-silver":
            formattedSpot = "White Silver Chamber";
            break;
          case "magic-stone":
            formattedSpot = "Magic Stone Chamber";
            break;
          default:
            break;
        }

        await interaction.reply({
          content: `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila ${floor} ${formattedSpot}!`,
          ephemeral: true,
        });
        return;
      };
      removeFromQueue();
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
