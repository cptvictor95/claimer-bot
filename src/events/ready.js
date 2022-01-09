module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Claimer Bot is online!\nBot tag: ${client.user.tag}`);

    const currentServer = client.guilds.cache.map((guild) => `\n- ${guild}`);
    console.log(`Current Servers: ${currentServer}`);
  },
};
