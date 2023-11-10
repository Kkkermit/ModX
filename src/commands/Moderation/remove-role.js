const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-role')
        .setDescription('Remove roles from members')
        .addUserOption(option => option.setName('member').setDescription('Select a member to remove a role from').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Select the role to remove from the member').setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');
        if (interaction.member.roles.cache.has(role.id)) {
            return interaction.reply({ content: 'Member doesn\'t have that role!', ephemeral: true });
        }
        else {
            member.roles.remove(role).catch(console.error);
        }
        await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`**${role}** roles has been **removed** from **${member}**`).setColor('Red')] });

    }
}