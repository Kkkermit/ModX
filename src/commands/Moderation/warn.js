const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const warningSchema = require("../../Schemas/warnschema");
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('This warns a server member')
    .addUserOption(option => option.setName("user").setDescription("The user you want to warn").setRequired(true))
    .addStringOption(option => option.setName("reason").setDescription("This is the reason for warning the user").setRequired(false)),
    async execute(interaction) {
 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
 
        const { options, guildId, user } = interaction;
 
        const target = options.getUser("user");
        const reason = options.getString("reason") || "No reason given";
 
        const userTag = `${target.username}#${target.discriminator}`
 
        warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag }, async (err, data) => {
 
            if (err) throw err;
 
            if (!data) {
                data = new warningSchema({
                    GuildID: guildId,
                    UserID: target.id,
                    UserTag: userTag,
                    Content: [
                        {
                            ExecuterId: user.id,
                            ExecuterTag: user.tag,
                            Reason: reason
                        }
                    ],
                });
 
            } else {
                const warnContent = {
                    ExecuterId: user.id,
                    ExecuterTag: user.tag,
                    Reason: reason
                }
                data.Content.push(warnContent);
            }
            data.save()
        });
 
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTimestamp()
        .setDescription(`You have been warned in ${interaction.guild.name}!`)
        .setAuthor({ name: `🔨 Warning Command`})
        .setFooter({ text: `🔨 A Warning Has Been Given`})
        .setThumbnail(target.displayAvatarURL())
        .setTitle('> User has been warned')
        .addFields({ name: `• Warning Reason`, value: `> ${reason}`})
 
        const embed2 = new EmbedBuilder()
        .setColor("Blue")
        .setTimestamp()
        .setDescription(`**${target}** has been **warned**`)
        .setAuthor({ name: `🔨 Warning Command`})
        .setFooter({ text: `🔨 A Warning Has Been Given`})
        .setThumbnail(target.displayAvatarURL())
        .setTitle('> User has been warned')
        .addFields({ name: `• Warning Reason`, value: `> ${reason}`})
 
        target.send({ embeds: [embed] }).catch(err => {
            return;
        })
 
        interaction.reply({ embeds: [embed2] });
    }
}