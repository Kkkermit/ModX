const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to be banned')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No Reason Provided';
    let guild = await interaction.guild.fetch();
  
    const permEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('Invalid Permission')
      .setDescription(`🔨 You do not have permission to use this command. 🔨`)
      .setTimestamp()
      .setFooter({ text: '🔨 The ban hammer requires adequate perms!' });
  
      const unableEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setDescription(`🔨 Unable to send a DM to ${target.tag}. 🔨`)
      .setTimestamp()
      .setFooter({ text: '🔨 The ban hammer struck' });
    
      const dmEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Moderation Notice')
      .setDescription(`🔨 \n ${target.tag}, \n \`You have been banned from ${guild.name}\` \n \n \n **Reason:** \n ${reason} \n \n **Staff Member:** \n ${interaction.user.tag} | (<@${interaction.user.id}>:${interaction.user.id}) \n 🔨`)
      .setTimestamp()
      .setFooter({ text: '🔨 The ban hammer has struck!' });
   
      const banEmbed = new EmbedBuilder()
      .setColor(0x05fc2a)
      .setAuthor({ name: '🔨 Ban Tool'})
      .setTitle('> User was banned!')
      .addFields({ name: "• User", value: `> **${target.tag}**`, inline: true})
      .addFields({ name: "• Reason", value: `> **${reason}**`, inline: true})
      .setTimestamp()
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: '🔨 The ban hammer has spoken!' });
      
    const failbanEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setDescription(`🔨 Failed to ban **${target.tag}**. 🔨`)
      .setTimestamp()
      .setFooter({ text: '🔨 Ban hammer has missed!' });
    const perm = interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers);
    if (!perm)
      return await interaction.channel.sendTyping(),
        interaction.reply({ embeds: [permEmbed], ephemeral: true });
 
    await target.send({ embeds: [dmEmbed] }).catch((err) => { return console.log('Failed to DM user.') });
 
    let ban = await guild.members.ban(target, { reason: `${interaction.user.tag} - ${reason}` }).catch((err) => { console.log("Error with Ban command: " + err) })
    if (ban) {
      await interaction.channel.sendTyping(),
        await interaction.reply({ embeds: [banEmbed] })
    } else if (!ban) {
      interaction.reply({ embeds: [failbanEmbed] })
    }
  }
}