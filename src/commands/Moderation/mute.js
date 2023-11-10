const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timesout specified user for specified amount of time.')
    .setDMPermission(false)
    .addUserOption(option => option.setName('user').setDescription('Specified user will be timed out.').setRequired(true))
    .addNumberOption(option => option.setName('time').setDescription(`Specified amount of time will be applied to specified user's setTimeout.`).setRequired(true))
    .addStringOption(option => option.setName('time-type').setDescription(`Set what kind of time value you want to use (s, m, h, d).`).setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription(`Provide the reason as to why you want to timeout this user.`).setRequired(false)),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        const timedisplay = interaction.options.getNumber('time');
        const user = interaction.options.getMember('user');
        const username = interaction.options.getUser('user');
        let time = interaction.options.getNumber('time');
        const type = interaction.options.getString('time-type') || 's';
        const reason = interaction.options.getString('reason') || 'No reason provided :(';

        if (username.id === interaction.user.id) return await interaction.reply({ content: `You **cannot** timeout yourself, silly goose..`, ephemeral: true})

        if(type === 's') time = time * 1000;
        if(type === 'm') time = time * 60000;
        if(type === 'h') time = time * 3600000;
        if(type === 'd') time = time * 86400000;

        if (time < 5000) {
            return await interaction.reply({ content: `Timeout **cannot** be less than 6 seconds long.`, ephemeral: true})
        }

        if (time > 2073600000) {
            return await interaction.reply({ content: `Timeout **cannot** be longer than 24 days long.`, ephemeral: true})
        }

        const dmembed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Timeout Tool'})
        .setTitle(`> You were muted in "${interaction.guild.name}"`)
        .addFields({ name: '• Server', value: `> ${interaction.guild.name}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .addFields({ name: '• Duration', value: `> ${timedisplay}${type}`, inline: true})
        .setFooter({ text: '🔨 Muted in a server'})
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1129094438669520956/1131553432008937573/ModX.png')

        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Timeout Tool'})
        .setTitle(`> User was muted!`)
        .addFields({ name: '• User', value: `> ${username.tag}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .addFields({ name: '• Duration', value: `> ${timedisplay}${type}`, inline: true})
        .setThumbnail('https://cdn.discordapp.com/attachments/1129094438669520956/1131553432008937573/ModX.png')
        .setFooter({ text: '🔨 Someone was muted'})
        .setTimestamp()

        user.timeout(time).catch(err => {
            return interaction.reply({ content: `**Couldn't** timeout this member! Check my **role position** and try again.`, ephemeral: true})
        })

        await interaction.reply({ embeds: [embed] })
        await user.send({ embeds: [dmembed] }).catch(err => {
            return;
        })
    }
}