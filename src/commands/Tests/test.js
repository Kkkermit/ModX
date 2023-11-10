const {SlashCommandBuilder}=require('discord.js');

module.exports={
    data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('testing the bot is online'),
    async execute (interaction){
        await interaction.reply('Bot is online and active')
    }
}