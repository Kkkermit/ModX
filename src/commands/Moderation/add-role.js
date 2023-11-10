const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-role')
        .setDescription('Give roles to members')
        .addUserOption(option => option.setName('member').setDescription('Select a member to assign a role to').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Select the role to assign to the member').setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');
        if (interaction.member.roles.cache.has(role.id)) {
            return interaction.reply({ content: 'Member already have that role!', ephemeral: true });
        }
        else {
            member.roles.add(role).catch(console.error);
        }
        await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`**${role}** roles has been **added** to **${member}**`).setColor('Green')] });
    }
}