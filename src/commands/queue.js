const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    if (this.items.length === 0) return;
    return this.items[0];
  }

  getSize() {
    return this.items.length;
  }

  isEmpty() {
    return this.getSize() === 0;
  }
}

/** To Do
 * [x] Transform json queue into a array of objects
 * [x] Add more than 1 user to queue array
 * [] Show startedAt(UTC - Hora, Minuto, segundo || msegundo) Property on queue of each player
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription(
      "Lists the queue of players in each Chamber of the Magic Square"
    ),
  async execute(interaction) {
    try {
      const queue = new Queue();
      let queueFile = JSON.parse(fs.readFileSync("./src/data/queue.json"));
      queue.items = queueFile;
      await interaction.reply({
        content: `${queue.items.map((item, index) => {
          if (item.userName == interaction.user.username) {
            return `${item.userName}'s position is ${index + 1}`;
          }
        })}`,
      });

      await interaction.followUp({
        content: `This is the actual queue of players in the Magic Square.\n${queue.items.map(
          (item, index) => {
            console.info("item", item.userName);
            return `\n${index + 1}. ${item.userName} is on ${item.spot.name} ${
              item.spot.number
            } on floor ${item.spot.floor}`;
          }
        )}`,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error while executing this command!\nError:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
