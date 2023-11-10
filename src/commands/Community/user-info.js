const {SlashCommandBuilder, EmbedBuilder}=require('discord.js')

module.exports={
    data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('This gets the users information')
    .addUserOption(option =>option.setName('user').setDescription(`The user you want to get the info off`).setRequired(false)),
    async execute(interaction){

        const userID = interaction.user.id;
        const{guild} = interaction;
        
       const icon1 = guild.iconURL() || 'https://cdn.discordapp.com/attachments/938389697460338720/1086359572257722388/image.png'
       const roles = guild.emojis.cache.size;
       const emojis = guild.emojis.cache.size;
       const id = guild.id;
       
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const icon = user.displayAvatarURL();
        const tag = user.tag;
        const{name} = guild;
        const banner = await (await interaction.client.users.fetch(user.id, { force: true })).bannerURL({ size: 4096 });

        const embed = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: tag, iconURL: icon})
        .setThumbnail(icon)
        .addFields({ name: "Name of Server", value: `${name}`, inline: false})
        .addFields({ name: "Member", value: `${user}`, inline: false})
        .addFields({ name: "Roles", value: `${member.roles.cache.map(r => r).join(' ')}`, inline: false})
        .addFields({ name: "Joined Server", value: `<t:${parseInt(member.joinedAt / 1000)}:R>`, inline: false})
        .addFields({ name: "Joined Discord", value: `<t:${parseInt(user.createdAt / 1000)}:R>`, inline: false})
        .addFields({ name: "User ID", value: `${user.id}`, inline: false})
        .setFooter({ text: 'User info tracker | By Kkermit'})
        .setTimestamp()
        .setImage(banner)

        await interaction.reply({ embeds: [embed]});
    }
}