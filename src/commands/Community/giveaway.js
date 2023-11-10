const { SlashCommandBuilder, PermissionsBitField, Client } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway or configure an existing one')
    .addSubcommand(command => command.setName('start').setDescription('Starts a giveway').addStringOption(Option => Option.setName('duration').setDescription('The duration of the giveaway (ie. 1m, 1d, 1h etc)').setRequired(true)).addIntegerOption(Option => Option.setName('winners').setDescription('The winners of the giveaway (in numbers)').setRequired(true)).addStringOption(Option => Option.setName('prize').setDescription('What the winners will win aka the prize').setRequired(true)).addChannelOption(Option => Option.setName('channel').setDescription('The channel the giveaway shold happen in').setRequired(false)).addStringOption(Option => Option.setName('content').setDescription('The content will be used for the giveaway embed').setRequired(false)))
    .addSubcommand(command => command.setName('edit').setDescription('Edits a giveaway').addStringOption(Option => Option.setName('message-id').setDescription('The id of the giveaway').setRequired(true)).addStringOption(Option => Option.setName('time').setDescription('The added dursation of the giveaway in MS').setRequired(true)).addIntegerOption(Option => Option.setName('winners').setDescription('The updated number of winners of the giveaway').setRequired(true)).addStringOption(Option => Option.setName('prze').setDescription('The new prize of the giveaway').setRequired(false)))
    .addSubcommand(command => command.setName('end').setDescription('End an exiting giveaway').addStringOption(Option => Option.setName('message-id').setDescription('The ID of the giveaway').setRequired(true)))
    .addSubcommand(command => command.setName('reroll').setDescription('Reroll a giveaway').addStringOption(Option => Option.setName('message-id').setDescription('The ID of the givaway message').setRequired(true))),
    async execute (interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: `You **do not** have the permission to do that!`, ephemeral: true});
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case'start':
            await interaction.reply({ content: `starting your giveaway...`, ephemeral: true});

            const duration = ms(interaction.options.getString('duration') || "");
            const winnerCount = interaction.options.getInteger('winners');
            const prize = interaction.options.getString('prize');
            const contentmain = interaction.options.getString('content');
            const channel = interaction.options.getChannel('channel');
            const showchannel = interaction.options.getChannel('channel') || interaction.channel;
            if (!channel && !contentmain)   

            client.giveawayManager.start(interaction.channel, {
                prize,
                winnerCount,
                duration,
                hostedBy: interaction.user,
                lestChance: {
                    enabled: false,
                    content: contentmain,
                    threshold: 60000000000_000,
                    embedColor: `#000000`

                }
                
                    
            })

            else if (!channel)
            client.giveawayManager.start(interaction.channel, {
                prize,
                winnerCount,
                duration,
                hostedBy: interaction.user,
                lestChance: {
                    enabled: true,
                    content: contentmain,
                    threshold: 60000000000_000,
                    embedColor: `#000000`
                }
            })

            else if (!contentmain)
            client.giveawayManager.start(channel, {
                prize,
                winnerCount,
                duration,
                hostedBy: interaction.user,
                lestChance: {
                    enabled: false,
                    content: contentmain,
                    threshold: 60000000000_000,
                    embedColor: `#000000`
                }
            })
            
            else
            client.giveawayManager.start(channel, {
               prize,
               winnerCount,
               duration,
               hostedBy: interaction.user,
               lestChance: {
                enabled: true,
                content: contentmain,
                threshold: 60000000000_000,
                embedColor: `#000000`
               }

            });

            interaction.editReply({ content: `Your giveaway has been started! Check ${showchannel} for your giveaway`, ephemeral: true });

            break;
            case 'edit':

            await interaction.reply({ content: `Editing your giveaway...`, ephemeral: true});

            const newprize = interaction.options.getString('prize');
            const newduration = interaction.options.getString('time');
            const newwinners = interaction.options.getInteger('winners');
            const messageId = interaction.options.getString('message-id');

            client.giveawayManager.edit(messageId, {
                addTime: ms(newduration),
                newWinnerCount: newwinners,
                newPrize: newprize
            }).than(() => {
                interaction.editReply({ content: `Your giveaway has been edited`, ephemeral: true});
            }).catch(err => {
                interaction.editReply({ content: `There was an error while editing your giveaway!`, ephemeral: true});
            });

            break;
            case 'end':

            await interaction.reply({ content: `Ending your giveaway...`, ephemeral: true});

            const messageId1 = interaction.options.getString('message-id');

            client.giveawayManager.end(messageId1).than(() => {
                interaction.editReply({ content: `Your giveaway has been ended`, ephemeral: true})
           }).catch(err => {
            interaction.editReply({ content: `An error occured while trying to end your giveaway`, ephemeral: true});
           });

           break;
           case 'reroll':

           await interaction.reply({ content: `Rerolling your giveaway...`, ephemeral: true});

           const query = interaction.options.getString('message-id');
           const giveaway = client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query) || client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query)
           
           if (!giveaway) return interaction.editReply({ content: `I could not find a giveaway with the message ID you provided`, ephemeral: true});
           const messageId2 = interaction.options.getString('message-id');
           client.giveawayManager.reroll(messageId2).then(() => {
            interaction.editReply({ content: `Your giveaway has been rerolled`, ephemeral: true});
           }).catch(err => {
            interaction.editReply({ content: `There was an error trying to reroll your giveaway`, ephemeral: true})
           })

        
        }
    
    }

}