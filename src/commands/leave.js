const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

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

      let place;

      if (queue.length === 0) {
        await interaction.reply({
          content: ":no_entry_sign: Não ha ninguem em nenhuma fila",
          ephemeral: true,
        });
        return;
      }

      const removeFromQueue = async () => {
        const findPlayer = queue.find((player) => player.id === user.id);
        const allPlayersQueueIds = queue.map((player) => player.id);
        const place = findPlayer.place;
        const floor = findPlayer.floor;
        const spot = findPlayer.spot;

        if (!findPlayer) {
          await interaction.reply({
            content: `:no_entry_sign: <@${user.id}> você não está em nenhuma fila! :no_entry_sign:`,
            ephemeral: true,
          });
          return;
        }

        queueOfPlayer = JSON.parse(
          fs.readFileSync(`./src/${place}/${floor}/${spot}`)
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

        await interaction.reply({
          content: `:white_check_mark: <@${user.id}> você foi removido com sucesso da fila que estava!`,
          ephemeral: true,
        });
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
