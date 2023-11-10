const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('nick')
    .setDMPermission(false)
    .setDescription(`Change specified user's nickname.`)
    .addStringOption(option => option.setName('nick').setDescription(`Specified nickname will become specified user's new nickname.`).setRequired(true).setMaxLength(32).setMinLength(1))
    .addUserOption(option => option.setName('user').setDescription(`Specified user's nickname will be changed.`)),
    async execute(interaction) {

        const nick = await interaction.options.getString('nick');
        const user = await interaction.options.getUser('user');
        const member = await interaction.options.getMember('user');

        if (user === interaction.user || user === null) {

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ChangeNickname)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

            await interaction.member.setNickname(nick).catch(err => {
                return interaction.reply({ content: `**Couldn't** change your nickname! **Check** my permissions and **role position** and try again.`, ephemeral: true});
            })

            await interaction.reply({ content: `Your **nickname** has been set to "**${nick}**"!`, ephemeral: true})

        } else {

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return await interaction.reply({ content: `You **do not** have the permission to change someone **else's** nickname!`, ephemeral: true});
            else {

                await member.setNickname(nick).catch(err => {
                    return interaction.reply({ content: `**Couldn't** change the nickname of ${user}! **Check** my permissions and **role position** and try again.`, ephemeral: true});
                });
                await interaction.reply({ content: `You **successfuly** set ${member}'s nickname to "**${nick}**"!`, ephemeral: true})
            }

        }
    }
}