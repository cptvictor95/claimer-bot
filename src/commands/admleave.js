// const { SlashCommandBuilder } = require("@discordjs/builders");
// const { MessageEmbed } = require("discord.js");
// const fs = require("fs");

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("admleave")
//     .setDescription("Retira um player especifico da fila")
//     .addStringOption((option) =>
//       option
//         .setName("floor")
//         .setDescription("Número do Floor (1F-6F)")
//         .setRequired(true)
//         .addChoice("1F", "1F")
//         .addChoice("2F", "2F")
//         .addChoice("3F", "3F")
//         .addChoice("4F", "4F")
//         .addChoice("5F", "5F")
//         .addChoice("6F", "6F")
//     )
//     .addStringOption((option) =>
//       option
//         .setName("chambername")
//         .setDescription("Nome da Chamber (Gold/Experience/Magic Stone)")
//         .setRequired(true)
//         .addChoice("Gold Chamber", "gold")
//         .addChoice("Experience Chamber", "experience")
//         .addChoice("Magic Stone Chamber", "magic-stone")
//     )
//     .addStringOption((option) =>
//       option
//         .setName("chambernumber")
//         .setDescription("Número da Chamber (I/II/III)")
//         .setRequired(true)
//         .addChoice("Chamber I", "1")
//         .addChoice("Chamber II", "2")
//         .addChoice("Chamber III", "3")
//     )
//     .addStringOption((option) =>
//       option
//         .setName("position")
//         .setDescription("Escolhe entre a chamber do Meio Esquerda ou Direita")
//         .setRequired(true)
//         .addChoice("Esquerda", "left")
//         .addChoice("Meio", "middle")
//         .addChoice("Direita", "right")
//     ),

//   async execute(interaction) {
//     try {
//       const floor = interaction.options.getString("floor");
//       const chamberName = interaction.options.getString("chambername");
//       const chamberNumber = interaction.options.getString("chambernumber");
//       const position = interaction.options.getString("position");
//       const message = interaction.message;
//       const channel = interaction.channel;

//       message.channel.send("Adpokwaopkdswdwa");

//       const options = {
//         max: 1,
//         time: 60000,
//         errors: ["time"],
//       };

//       message.channel
//         .awaitMessages(options)
//         .then((collected) => {
//           const title = collected.first().content;
//           const embed = new MessageEmbed()
//             .setTitle(title)
//             .setDescription("This embed has a custom title");
//           message.channel.send(embed);
//         })
//         .catch((collected) => console.log(collected));
//     } catch (error) {}
//   },
// };
