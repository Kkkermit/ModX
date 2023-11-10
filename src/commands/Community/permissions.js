const {
    Client,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
  } = require("discord.js");
  const pfp = require(`../../bot-pfp.json`)
  
  module.exports = {
    category: "util",
    data: new SlashCommandBuilder()
      .setName("permissions")
      .setDescription("Displays Permissions")
      .addUserOption((user) =>
        user.setName("user").setDescription("Select a user").setRequired(true)
      ),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    execute: async (interaction, client) => {
      const { options } = interaction;
      const Member = options.getMember("user");
      const USER = options.getUser("user");
      let Embed = new EmbedBuilder().setColor("Red");
  
      if (!Member)
        return interaction.reply({
          embeds: [Embed.setDescription("The member couldn't be found")],
          ephemeral: true,
        });
  
      let permissionFlags = Object.keys(PermissionFlagsBits);
      let output = `• Permissions of **${Member}**  \n\`\`\``;
      for (let i = 0; i < permissionFlags.length; i++) {
        let permissionName = permissionFlags[i];
        let hasPermission = Member.permissions.has(permissionName);
        output += `${permissionName} ${hasPermission ? "✅" : "❌"}\n`;
      }
      output += `\`\`\``;
      const PermsEmbed = new EmbedBuilder()
        .setTitle(`> ${USER.tag} Permissions within the server!`)
        .setAuthor({ name: '🛠️ Get A Members Permissions'})
        .setDescription(output)
        .setColor("Purple")
        .setThumbnail(`${pfp}`)
        .setFooter({ text: '🛠️ Permissions Tracker | By KKermit'})
        .setTimestamp();
      return interaction.reply({ embeds: [PermsEmbed] });
    },
  };