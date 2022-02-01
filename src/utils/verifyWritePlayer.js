const fs = require("fs");

module.exports = {
  verifyWritePlayer: function (userId, queueString) {
    const queue = JSON.parse(fs.readFileSync(queueString));
    const allPlayersQueue = JSON.parse(
      fs.readFileSync("./src/players-on-queue.json")
    );
    const verifyQueue = queue.find((player) => player.id === userId);
    const verifyAllQueues = allPlayersQueue.find(
      (player) => player.id === userId
    );

    if (queue.length > 0) {
      if (verifyQueue === undefined) {
        const verifyAllPlayersQueue = allPlayersQueue.find(
          (player) => player.id === userId
        );
        if (verifyAllPlayersQueue === undefined) {
          return "false";
        }
        return "partially";
      }
    }

    if (queue.length === 0) {
      if (verifyAllQueues !== undefined) {
        return "partially";
      }
      return "false";
    }

    if (verifyAllQueues === undefined) {
      if (verifyQueue !== undefined) {
        return "partially";
      }
    }
    return "true";
  },
};
