const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const pfp = require('../../bot-pfp.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDMPermission(false)
    .setDescription('Kicks specified user.')
    .addUserOption(option => option.setName('user').setDescription('Specify the user you want to kick.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason as to why you want to kick specified user.').setRequired(false)),
    async execute(interaction, client) {
        
        const users = interaction.options.getUser('user');
        const ID = users.id;
        const kickedmember = interaction.options.getMember('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers) && interaction.user.id !== '619944734776885276') return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        if (interaction.member.id === ID) return await interaction.reply({ content: 'You **cannot** use the kick power on you, silly goose..', ephemeral: true});

        if (!kickedmember) return await interaction.reply({ content: `That user **does not** exist within your server.`, ephemeral: true});
    
        const reason = interaction.options.getString('reason') || 'No reason provided :(';
        
        const dmembed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Kick Tool'})
        .setTitle(`> You were kicked from "${interaction.guild.name}"`)
        .addFields({ name: '• Server', value: `> ${interaction.guild.name}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .setFooter({ text: '🔨 Kicked from a server'})
        .setTimestamp()
        .setThumbnail(`${pfp}`)

        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Kick Tool'})
        .setTitle(`> User was kicked!`)
        .addFields({ name: '• User', value: `> ${users.tag}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .setThumbnail(`${pfp}`)
        .setFooter({ text: '🔨 Someone got kicked hard'})
        .setTimestamp()

        await kickedmember.send({ embeds: [dmembed] }).catch(err => {
            return;
        })

        await kickedmember.kick().catch(err => {
            return interaction.reply({ content: `**Couldn't** kick this member! Check my **role position** and try again.`, ephemeral: true});
        })

        await interaction.reply({ embeds: [embed] });
    }
}