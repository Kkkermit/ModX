const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const pfp = require ('../../bot-pfp.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('bot-website')
    .setDescription("Sends a link to the website for the bot!"),

    async execute (interaction){

        const embed = new EmbedBuilder()
        .setTimestamp()
        .setThumbnail(`${pfp}`)
        .setTitle('> Bots website')
        .setFooter({ text: '🌐 Website | By Kkermit'})
        .setAuthor({ name: '🌐 Bots Website'})
        .addFields({ name: '• Website link', value: '> https://orbit-exe.xyz/'})
        .setColor("DarkVividPink")

        await interaction.reply({ embeds: [embed]});

    }

}