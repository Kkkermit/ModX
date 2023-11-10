const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const ghostSchema = require('../../Schemas/ghostping');
const numSchema = require('../../Schemas/ghostNum');
const pfp = require('../../bot-pfp.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('anti-ghost-ping')
    .setDMPermission(false)
    .setDescription('Configure your anti ghost ping moderation system.')
    .addSubcommand(command => command.setName('setup').setDescription('Sets up your anti ghost ping moderation system.'))
    .addSubcommand(command => command.setName('disable').setDescription('Disables your anti ghost ping moderation system.'))
    .addSubcommand(command => command.setName('reset').setDescription(`Resets specified user's ghost ping warn count.`).addUserOption(option => option.setName('user').setDescription(`Specified user's ghost ping warnings will be reset.`).setRequired(true))),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        const { options } = interaction;
        const sub = options.getSubcommand();

        const Data = await ghostSchema.findOne({ Guild: interaction.guild.id });

        switch (sub) {
            case 'setup':
                
            if (Data) return await interaction.reply({ content: `The **anti ghost ping** moderation system is already set up. \n> Do **/anti-ghost-ping disable** to undo.`, ephemeral: true});
            else {
                await ghostSchema.create({
                    Guild: interaction.guild.id
                })

                const embed = new EmbedBuilder()
                .setColor("DarkRed")
                .setThumbnail(`${pfp}`)
                .setTimestamp()
                .setFooter({ text: `👻 Anti Ghost system set up`})
                .setAuthor({ name: `👻 Anti Ghost System`})
                .setTitle(`> Anti Ghost System was \n> successfuly Set Up!`)
                .addFields({ name: `• System Info`, value: `> Your server will now be protected from \n> ghost pingers. Ghost pingers will automatically \n> receive a warning, aswell as a timeout.`})

                await interaction.reply({ embeds: [embed] });
            }

            break;

            case 'disable':

            if (!Data) return await interaction.reply({ content: `The **anti ghost ping** moderation system is not set up, Can't delete nothing.. \n> Do **/anti-ghost-ping setup** to set up one.`, ephemeral: true});
            else {
                
                await ghostSchema.deleteMany({ Guild: interaction.guild.id });

                const embed1 = new EmbedBuilder()
                .setColor("DarkRed")
                .setThumbnail(`${pfp}`)
                .setTimestamp()
                .setFooter({ text: `👻 Anti Ghost disabled`})
                .setAuthor({ name: `👻 Anti Ghost System`})
                .setTitle(`> Anti Ghost System was \n> Disabled`)
                .addFields({ name: `• System Info`, value: `> Your server will no longer be protected from \n> ghost pingers. Ghost pingers will not receive any punishment.`})

                await interaction.reply({ embeds: [embed1] });
            }

            break;

            case 'reset':

            const member = options.getUser('user');
            const data = await numSchema.findOne({ Guild: interaction.guild.id, User: member.id});

            if (!data) return await interaction.reply({ content: `${member} **does not** have any ghost ping warnings, can't reset nothing..`, ephemeral: true});
            else {
                await data.deleteOne({ User: member.id});

                await interaction.reply({ content: `${member}'s ghost **ping warnings** have been reset. Their warn log will not be cleaned.`, ephemeral: true});
            }
        }
    }
}