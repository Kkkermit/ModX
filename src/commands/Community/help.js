const { SlashCommandBuilder, StringSelectMenuBuilder, PermissionsBitField, ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const pfp = require('../../bot-pfp.json')
var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Cannot find what you were wishing to? Check this out!')
    .addSubcommand(command => command.setName('server').setDescription('Join our official support server for Orbit!'))
    .addSubcommand(command => command.setName('list').setDescription('Get some information on our bot commands and plans.')),
    async execute(interaction, client) {

        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'server':

            const button = new ActionRowBuilder()
            .addComponents(
            new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/xcMVwAVjSD")
            )
        

            const embedhelpserver = new EmbedBuilder()
            .setColor("DarkOrange")
            .setTitle('> Join our support server for \n> further help!')
            .setFooter({ text: `🔨 Support server`})
            .setTimestamp()
            .setAuthor({ name: `🔨 Support server Command`})
            .setThumbnail(`${pfp}`)
            .addFields({ name: `• Manual link to the Discord server:`, value: `> https://discord.gg/xcMVwAVjSD`})
        
            await interaction.reply({ embeds: [embedhelpserver], components: [button] })

            break;
            case 'list':

            const helprow1 = new ActionRowBuilder()
            .addComponents(

            new StringSelectMenuBuilder()
            .setMinValues(1)
            .setMaxValues(1)
            .setCustomId('selecthelp')
            .setPlaceholder('• Select a menu')
            .addOptions(
                {
                    label: '• Help Center',
                    description: 'Navigate to the Help Center.',
                    value: 'helpcenter',
                },

                {
                    label: '• How to add the bot',
                    description: 'Displays how to add ModX to your amazing server.',
                    value: 'howtoaddbot'
                },

                {
                    label: '• Feedback',
                    description: 'Displays how to contribute to the devlopment of ModX by giving feedback.',
                    value: 'feedback'
                },

                {
                    label: '• Commands Help',
                    description: 'Navigate to the Commands help page.',
                    value: 'commands',
                },
            ),
        );

        const embed = new EmbedBuilder()
        .setColor("DarkOrange")
        .setTitle('> Get Help')
        .setAuthor({ name: `🔨 Help Command`})
        .setFooter({ text: `🔨 Help command: Help Center`})
        .setThumbnail(`${pfp}`)
        .addFields({ name: `• Commands Help`, value: `> Get all **Commands** (**${client.commands.size}**) purposes.`})
        .addFields({ name: "• How to add Bot", value: "> Quick guide on how to add our **Bot** \n> to your server."})
        .addFields({ name: "• Feedback", value: "> How to send us feedback and suggestions."})
        .addFields({ name: "• Exclusive Functionality", value: "> Guide on how to receive permission to \n> use exclusive functionality."})
        .setTimestamp()

        await interaction.reply({ embeds: [embed], components: [helprow1] });

       
    
           
        }
    }
}