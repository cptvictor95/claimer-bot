module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Claimer Bot is online!\nBot tag: ${client.user.tag}`);
  },
};
