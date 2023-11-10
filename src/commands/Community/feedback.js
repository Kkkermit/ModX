const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("Feeback for the bot")
    .addStringOption(option => option
        .setName("feedback")
        .setDescription("The feedback")
        .setRequired(true)
    ),
 
    async execute (interaction, client) {
 
        const feedback = interaction.options.getString("feedback");
        const userx = interaction.user.id;
 
        const embed = new EmbedBuilder()
        .setTitle("NEW FEEDBACK!")
        .setColor("Green")
        .addFields({ name:"User: ", value:`<@${userx}>`, inline: false})
        .setDescription(`${feedback}`)
        .setTimestamp()
 
        const xEmbed = new EmbedBuilder()
        .setTitle("You send us some feedback!")
        .setDescription(`${feedback}`)
        .setColor("Green")
 
        const channel = interaction.client.channels.cache.get('1135678993442537624');
                                                  
        channel.send({
            embeds: [embed]
        }).catch(err => {
            return;
        });
 
        return interaction.reply({ embeds: [xEmbed], ephemeral: true}).catch(err => {
            return;
        });
 
 
    }
}