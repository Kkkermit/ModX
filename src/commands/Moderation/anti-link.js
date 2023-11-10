const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const linkSchema = require('../../Schemas/link');
const pfp = require('../../bot-pfp.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('anti-link')
    .setDMPermission(false)
    .setDescription('Enables/Disables the anti-link moderation system.')
    .addSubcommand(command => 
        command
        .setName('setup')
        .setDescription('Sets up the anti link system.')
        .addStringOption(option => option.setName('permissions').setRequired(true).setDescription('Choose what permissions can bypass the anti-link system.')
        .addChoices(
            { name: 'Manage Channels', value: 'ManageChannels' },
            { name: 'Manage Server', value: 'ManageGuild' },
            { name: 'Embed Links', value: 'EmbedLinks' },
            { name: 'Attach Files', value: 'AttachFiles' },
            { name: 'Manage Messages', value: 'ManageMessages' },
            { name: 'Administrator', value: 'Administrator' }
        )))
    
    .addSubcommand(command => 
        command
        .setName('disable')
        .setDescription('Disables the anti-link moderation system.')
    )
    .addSubcommand(command => 
        command
        .setName('check')
        .setDescription('Provides statistics about the anti-link moderation system.')
    )
    .addSubcommand(command => 
        command
        .setName('edit')
        .setDescription('Edits the currently enabled anti-link moderation system.')
        .addStringOption(option => option.setName('permissions').setRequired(true).setDescription('Choose what permissions can bypass the anti-link system.')
        .addChoices(
            { name: 'Manage Channels', value: 'ManageChannels' },
            { name: 'Manage Server', value: 'ManageGuild' },
            { name: 'Embed Links', value: 'EmbedLinks' },
            { name: 'Attach Files', value: 'AttachFiles' },
            { name: 'Manage Messages', value: 'ManageMessages' },
            { name: 'Administrator', value: 'Administrator' }
        ))),

    async execute(interaction) {
        
        const { options } = interaction;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        const sub = options.getSubcommand();

        switch (sub) {

            case 'setup':
            const permissions = options.getString('permissions');

            const Data = await linkSchema.findOne({ Guild: interaction.guild.id });

            if (Data) return await interaction.reply({ content: 'You already have a **anti-link system** set up. \n> Do **/anti-link disable** to undo.', ephemeral: true});

            if (!Data) {
                await linkSchema.create({
                    Guild: interaction.guild.id,
                    Perms: permissions
                })
            }

            const embed = new EmbedBuilder()
            .setColor("DarkRed")
            .setThumbnail(`${pfp}`)
            .setTitle('> Anti-link system has been \n> successfuly set-up')
            .addFields({ name: '• Anti-link bypass permission', value: `> ${permissions}`})
            .setFooter({ text: '🔨 Anti-Link system set up'})
            .setAuthor({ name: '🔨 Anti-link System'})
            .setTimestamp()

            await interaction.reply({ embeds: [embed] });
        }

        switch (sub) {

            case 'disable':

            const Data = await linkSchema.findOne({ Guild: interaction.guild.id });
            if (!Data) return await interaction.reply({ content: 'You **do not** have a **anti-link system** set up. \n> Do **/anti-link setup** to set one up.', ephemeral: true});
            
            await linkSchema.deleteMany({ Guild: interaction.guild.id });

            const embeddisable = new EmbedBuilder()
            .setColor("DarkRed")
            .setThumbnail(`${pfp}`)
            .setTitle('> Anti-link system has been \n> removed')
            .addFields({ name: '• Anti-link system was removed', value: `> PixelVal will no longer delete links \n> sent by Members.`})
            .setFooter({ text: '🔨 Anti-Link system removed'})
            .setAuthor({ name: '🔨 Anti-link System'})
            .setTimestamp()

            await interaction.reply({ embeds: [embeddisable] });
        }

        switch (sub) {

            case 'check':
            const Data = await linkSchema.findOne({ Guild: interaction.guild.id });

            if (!Data) return await interaction.reply({ content: 'No **anti-link** system was set up.', ephemeral: true});

            const permissions = Data.Perms;

            if (!permissions) return await interaction.reply({ content: 'No **anti-link** system was set up.', ephemeral: true});
            else await interaction.reply({ content: `**Anti-link** system is set up in this server. Bypass permissions: **${permissions}**.`, ephemeral: true})
        }

        switch (sub) {

            case 'edit':
            const Data = await linkSchema.findOne({ Guild: interaction.guild.id });
            const permissions = options.getString('permissions');

            if (!Data) return await interaction.reply({ content: 'No **anti-link** system was set up.', ephemeral: true});
            else {
                await linkSchema.deleteMany();

                await linkSchema.create({
                    Guild: interaction.guild.id,
                    Perms: permissions
                })

                const embededit = new EmbedBuilder()
                .setColor("DarkRed")
                .setThumbnail(`${pfp}`)
                .setTitle('> Anti-link system has been \n> successfuly modified')
                .addFields({ name: '• New anti-link bypass permission', value: `> ${permissions}`})
                .setFooter({ text: '🔨 Anti-Link system edited'})
                .setAuthor({ name: '🔨 Anti-link System'})
                .setTimestamp()

                await interaction.reply({ embeds: [embededit] })
            }
        }
    }

}