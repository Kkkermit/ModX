const { Client, GatewayIntentBits, Events, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Partials, ActivityType, ActionRowBuilder, MessageType, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require(`discord.js`);
const fs = require('fs');
require('./functions/processHandlers')()
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
	GatewayIntentBits.GuildMessages, 
	GatewayIntentBits.MessageContent, 
	GatewayIntentBits.GuildMembers, 
	GatewayIntentBits.GuildPresences, 
	GatewayIntentBits.GuildIntegrations, 
	GatewayIntentBits.GuildWebhooks, 
    GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.MessageContent, 
	GatewayIntentBits.GuildEmojisAndStickers, 
	GatewayIntentBits.DirectMessages, 
	GatewayIntentBits.DirectMessageTyping, 
	GatewayIntentBits.GuildModeration, 
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildWebhooks, 
	GatewayIntentBits.AutoModerationConfiguration,
	GatewayIntentBits.GuildScheduledEvents, 
	GatewayIntentBits.GuildMessageTyping, 
	GatewayIntentBits.AutoModerationExecution, 
],  

partials: [
    Partials.GuildMember, 
    Partials.Channel,
    Partials.GuildScheduledEvent, 
    Partials.Message,
    Partials.Reaction, 
    Partials.ThreadMember, 
    Partials.User
]

}); 

client.on("ready", async (client) => {
 
    setInterval(() => {

        let activities = [
            { type: 'Playing', name: 'Moderation simulator.'},
            { type: 'Playing', name: '/help.'},
            { type: 'Playing', name: 'ModX.'},
            { type: 'Watching', name: 'Kkermit!'},
            { type: 'Playing', name: `with my ${client.commands.size} commands.`},
            { type: 'Watching', name: 'Over the staff.'},
            { type: 'Watching', name: `${client.guilds.cache.size} servers!`},
            { type: 'Watching', name: `${client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)} members!`},
            { type: 'Watching', name: `Over the servers`}
        ];

        const status = activities[Math.floor(Math.random() * activities.length)];

        if (status.type === 'Watching') {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Watching }]});
        } else {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Playing }]});
        } 
    }, 5000);
}) 

const Logs = require('discord-logs')
const {handleLogs} = require("./events/handleLogs");
const pfp = require('../src/bot-pfp.json')

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token).then(() => {
        handleLogs(client);
    });
})();

// status //

client.on("ready", () => {
    console.log('Bot is online.');

    client.user.setStatus("dnd");

})

// Modlogs

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
 
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err);
});
 
Logs(client, {
    debug: true
})

// Sticky Message Code //

const stickyschema = require('./Schemas/stickSchema');
const sticky = require('./commands/Moderation/stick-msg');

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    stickyschema.findOne({ ChannelID: message.channel.id}, async (err, data) => {
        if (err) throw err;

        if (!data) {
            return;
        }

        let stickychannel = data.ChannelID;
        let cachedChannel = client.channels.cache.get(stickychannel);
        
        const embed = new EmbedBuilder()
        .setThumbnail(`${pfp}`)
        .setTitle('> Sticky Note')
        .setAuthor({ name: '📝 Sticky Message Tool'})
        .setFooter({ text: '📝 Sticky Message Created'})
        .addFields({ name: '• Sticky Content', value: `> ${data.Message}`})
        .setColor("DarkBlue")
        .setTimestamp()

        if (message.channel.id == (stickychannel)) {

            data.CurrentCount += 1;
            data.save();

            if (data.CurrentCount > data.MaxCount) {
                try {
                    await client.channels.cache.get(stickychannel).messages.fetch(data.LastMessageID).then(async(m) => {
                        await m.delete();
                    })

                    let newMessage = await cachedChannel.send({ embeds: [embed]})

                    data.LastMessageID = newMessage.id;
                    data.CurrentCount = 0;
                    data.save();
                } catch {
                    return;
                }
            }
        }
    })
})

// Help Menu //

client.on(Events.InteractionCreate, async (interaction, err) => {

    const helprow2 = new ActionRowBuilder()
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

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId === 'selecthelp') {
        let choices = "";

        const centerembed = new EmbedBuilder()
        .setColor("DarkOrange")
        .setTitle('> Get Help')
        .setAuthor({ name: `🔨 Help Command`})
        .setFooter({ text: `🔨 Help command: Help Center`})
        .setThumbnail(`${pfp}`)
        .addFields({ name: "• Commands Help", value: `> Get all **Commands** (**${client.commands.size}**) purposes.`})
        .addFields({ name: "• How to add Bot", value: "> Quick guide on how to add our **Bot** \n> to your server."})
        .addFields({ name: "• Feedback", value: "> How to send us feedback and suggestions."})
        .setTimestamp()

        interaction.values.forEach(async (value) => {
            choices += `${value}`;

            if (value === 'helpcenter') {

                setTimeout(() => {
                    interaction.update({ embeds: [centerembed] }).catch(err);
                }, 100)

            }

            if (value === 'howtoaddbot') {

                setTimeout(() => {
                    const howtoaddembed = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> How to add our Bot')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: How To Add Bot` })
                    .setThumbnail(`${pfp}`)
                    .addFields({ name: "• How to add our bot to your server", value: "> To add ModX to your server, follow this link: https://discord.com/api/oauth2/authorize?client_id=1094255490084638891&permissions=8&scope=applications.commands%20bot" })
                    .addFields({ name: "• Wait.. what Official Discord server..", value: "> This is our Discord server: https://discord.gg/xcMVwAVjSD" })
                    .addFields({ name: "• Our official website..", value: "> This is our official website: https://orbit-exe.xyz/ "})
                    .setTimestamp();

                    interaction.update({ embeds: [howtoaddembed] }).catch(err);
                }, 100)
            }

            if (value === 'feedback') {

                setTimeout(() => {
                    const feedbackembed = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> How to give us Feedback')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: Feedback` })
                    .setThumbnail(`${pfp}`)
                    .addFields({ name: "• How can I give Feedback?", value: "> The creator of ModX appreciates your opinion on our the bot. To send feedback, use the command below." })
                    .addFields({ name: "• /feedback", value: "> Opens up a feedback form" })
                    .setTimestamp();

                    interaction.update({ embeds: [feedbackembed] }).catch(err);
                }, 100)
            }

            if (value === 'commands') {

                const commandpage1 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: Commands Page 1/2` })
                    .setThumbnail(`${pfp}`)
                    .addFields({ name: "• /automod flagged-words", value: "> Blocks profanity, specific content and slurs from being sent." })
                    .addFields({ name: "• /automod keyword", value: "> Block a specific keywords." })
                    .addFields({ name: "• /automod mention-spam", value: "> Stops users spam pinging members." })
                    .addFields({ name: "• /automod spam-messages", value: "> Stops spam being sent." })
                    .addFields({ name: "• /bot stats", value: "> Shows some basic info about the bot." })
                    .addFields({ name: "• /bot-website", value: "> Sends a link to bots website." })
                    .addFields({ name: "• /bot online", value: "> Shows the online status of the bot." })
                    .addFields({ name: "• /bot specs", value: "> Shows the specification that the bot uses." })
                    .addFields({ name: "• /bot ping", value: "> Displays the bots ping." })
                    .addFields({ name: "• /nick", value: "> Changes your or someone else's nickname." })
                    .addFields({ name: "• /help-list", value: "> Displays this help menu system." })
                    .addFields({ name: "• /help-server", value: "> Displays a link to the help server for the bot." })
                    .addFields({ name: "• /permissions", value: "> Shows the permission that a member has within the server." })
                    .addFields({ name: "• /role-info", value: "> Displays advanced info about a given role." })
                    .addFields({ name: "• /server-info", value: "> Displays advanced info about the server." })
                    .addFields({ name: "• /warn", value: "> Warns a member within a server." })
                    .addFields({ name: "• /clear-warnings", value: "> Clears a users warnings within a server." })
                    .addFields({ name: "• /show-warnings", value: "> Displays a users warnings amount and why they recieved them." })
                    .addFields({ name: "• /ban", value: "> Bans the user specified for specified reason." })
                    .addFields({ name: "• /unban", value: "> Unbans the user specified for specified reason." })
                    .addFields({ name: "• /user-info", value: "> Displays advanced user info about a member in the server." })
                    .addFields({ name: "• /add-role", value: "> Gives a role to a given member." })
                    .addFields({ name: "• /remove-role", value: "> Removes a role from a given member." })
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                const commandpage2 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: Commands Page 2/2` })
                    .setThumbnail(`${pfp}`)
                    .addFields({ name: "• /clear", value: "> Clears a given amount of messages within the server." })
                    .addFields({ name: "• /kick", value: "> Kicks a given member from the server." })
                    .addFields({ name: "• /mod-panel", value: "> Displays an advanced mod-panel used to moderate users in a server." })
                    .addFields({ name: "• /mod-logs enable", value: "> Enable the use of modlogs in your server." })
                    .addFields({ name: "• /mod-logs disable", value: "> Disables the use of modlogs in your server." })
                    .addFields({ name: "• /mute", value: "> mutes a given member in the server." })
                    .addFields({ name: "• /unmute", value: "> unmutes a given member in the server." })
                    .addFields({ name: "• /sticky set", value: "> Enables the use of sticky messages in the server." })
                    .addFields({ name: "• /sticky remove", value: "> Disables the use of sticky messages in the server." })
                    .addFields({ name: "• /test", value: "> Test command to show the bot is online and active." })
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                /*const commandpage3 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: Commands Page 3` })
                    .setThumbnail(`${pfp}`)
                    .addFields({ name: "• /give-xp", value: "> Gives specified user specified XP. Use with caution, still in BETA." })
                    .addFields({ name: "• /soundboard", value: "> Allows a user to use sound effects." })
                    .addFields({ name: "• /economy", value: "> Sets up your economy account for the economy system. This command also allows you to delete your account if needed." })
                    .addFields({ name: "• /beg", value: "> Beg for money. Results may vary." })
                    .addFields({ name: "• /bal", value: "> Displays your balance." })
                    .addFields({ name: "• /give-currency", value: "> Gives specified user specified amount of economy currency." })
                    .addFields({ name: "• /withdraw", value: `> Withdraws specified amount of balance from your bank to your wallet. Use "all" to withdraw all of your balance from your bank.` })
                    .addFields({ name: "• /deposit", value: `> Deposits specified amount of balance to the bank. Use "all" to deposit all of your wallet balance.` })
                    .addFields({ name: "• /reset currency", value: "> Resets specified user's economy currency." })
                    .addFields({ name: "• /reset all-currency", value: "> Resets your server's Economy system. This means that all balances will be set to $**0** and your Members will need to create new **accounts**." })
                    .addFields({ name: "• /mute", value: "> Times out specified user for specified reason for specified amount of time. Types are: s for seconds, m for minutes, h for hours, d for days. Cannot be shorter than 5 seconds, cannot be longer than 24 days." })
                    .addFields({ name: "• /unmute", value: "> Un-timesout specified user for specified reason." })
                    .addFields({ name: "• /spotify", value: "> Displays information about the song specified user is listening to." })
                    .addFields({ name: "• /test", value: "> Test command to show commands are working." })
                    .addFields({ name: "• /coin-flip", value: "> Flips a coin." })
                    .addFields({ name: "• /minigame tic-tac-toe", value: "> Starts a game of tic-tac-toe." })
                    .addFields({ name: "• /time", value: "> Displays the current time." })
                    .addFields({ name: "• /ascii", value: "> Replys with text in ascii model." })
                    .addFields({ name: "• /oogway", value: "> Creates an Oogway quote." })
                    .addFields({ name: "• /pp", value: "> Displays the length of a users pp." })
                    .addFields({ name: "• /add-role", value: "> Gives a role to a specified user." })
                    .addFields({ name: "• /remove-role", value: "> Removes a role from a specified user." })
                    .addFields({ name: "• /addsticker", value: "> Adds a sticker to the server." })
                    .addFields({ name: "• /server-info", value: "> Displays advanced info about the server." })
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                const commandpage4 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .addFields({ name: "• /announcement", value: "> Sends an announcement into a specified channel." })
                    .addFields({ name: "• /how gay", value: "> Displays an accurate percentage of how gay you are." })
                    .addFields({ name: "• /how sus", value: "> Displays an accurate percentage of how sus you are." })  
                    .addFields({ name: "• Hey Orbit", value: "> Send this message in a server to acknowledge the bot."})
                    .addFields({ name: "• /how stupid", value: "> Displays an accurate percentage of how stupid you are." }) 
                    .addFields({ name: "• /clear", value: "> Clears messages. can clear up to 99 at a time!" })
                    .addFields({ name: "• /setupmodlog", value: "> Sets up a modlog in the server!" })
                    .addFields({ name: "• /disablemodlog", value: "> Disables the modlog in a server!" })
                    .addFields({ name: "• /dm", value: "> Sends a DM to the user." })
                    .addFields({ name: "• /minigame snake", value: "> Starts a game of good old snake." })
                    .addFields({ name: "• /mod-panel", value: "> Displays a mod-panel for Admins to look over members." })
                    .addFields({ name: "• /nuke", value: "> Nukes a channel with custom text." })
                    .addFields({ name: "• /sticky", value: "> Sends a sticky message in the channel."})
                    .addFields({ name: "• /userinfo", value: "> Displays a users information." })
                    .addFields({ name: "• /minigame minesweeper", value: "> Starts a game of minesweeper." })
                    .addFields({ name: "• /members-vc total-set", value: "> Sets up your total members voice channel." })
                    .addFields({ name: "• /members-vc total-remove", value: "> Disables/Removes your total members voice channel." })
                    .addFields({ name: "• /members-vc bot-set", value: "> Sets up your total bots voice channel." })
                    .addFields({ name: "• /members-vc bot-remove", value: "> Disables/Removes your total bots voice channel." })
                    .addFields({ name: "• /giveaway start", value: "> Starts a giveaway with specified fields." })
                    .addFields({ name: "• /giveaway end", value: "> Ends specified giveaway." })
                    .addFields({ name: "• /giveaway edit", value: "> Edits specified giveaway." })
                    .addFields({ name: "• /giveaway reroll", value: "> Rerolls specified giveaway's winners." })
                    .addFields({ name: "• /minigame would-you-rather", value: "> Starts a game of would you rather." })
                     
                    .setFooter({ text: `🔨 Help command: Commands Page 4` })
                    .setThumbnail(`${pfp}`)
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                    const commandpage5 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .addFields({ name: "• /interaction hug", value: "> Hugs specified user, how cute!" })
                    .addFields({ name: "• /interaction profile", value: "> Shows specified user's interaction profile." })
                    .addFields({ name: "• /interaction slap", value: "> Slaps specified user, how rude :(" })
                    .addFields({ name: "• /interaction kill", value: "> Kills specified user, how evil >:(" })     
                    .addFields({ name: "• /interaction kiss", value: "> Kisses specified user, how romantic <3" })  
                    .addFields({ name: "• /minigame would-you-rather", value: "> Starts a game of would you rather." })
                    .addFields({ name: "• /leveling enable", value: "> Enables leveling for your server." })
                    .addFields({ name: "• /leveling disable", value: "> Disables leveling for your server." })
                    .addFields({ name: "• /leveling role-multiplier", value: "> Sets up an XP multiplier role for you." })
                    .addFields({ name: "• /leveling disable-multiplier", value: "> Disables your XP multiplier role." })
                    .addFields({ name: "• /marry", value: "> Marrys a given user (if they accept!)." })
                    .addFields({ name: "• /divorce", value: "> Divorces your partner!." })
                    .addFields({ name: "• /check-marriage", value: "> Checks a users marital status." })
                    .addFields({ name: "• /verify", value: "> Sets up a server verification system using captcha!"})
                    .addFields({ name: "• /bot-website", value: "> Sends a link to the bots website!"})
                    .addFields({ name: "• /my-iq", value: "> Generates the users IQ level."})
                    .addFields({ name: "• /warn", value: "> Warns a user within the server."})
                    .addFields({ name: "• /show-warnings", value: "> Displays how many warnings a user has!"})
                    .addFields({ name: "• /clear-warnings", value: "> Clears a users warnings resetting the count back to 0."})
                    .addFields({ name: "• /permissions", value: "> Check a users Permissions within the server."})
                    .addFields({ name: "• @Orbit.exe", value: "> When tagged, responds with information about the bot!"})
                    .addFields({ name: "• /bot online", value: "> Displays weather the bot is online or not."})
                    .addFields({ name: "• /bot ping", value: "> Displays the bots ping."})
                    .addFields({ name: "• /bot specs", value: "> Displays the bots hardware it runs on."})
                    .addFields({ name: "• /bot stats", value: "> Displays the statistics for the bot."})

                    .setFooter({ text: `🔨 Help command: Commands Page 5` })
                    .setThumbnail(`${pfp}`)
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                    const commandpage6 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: Commands Page 6` })
                    .addFields({ name: "• Orbit.exe", value: "> Replys with some info on the bot and the support server!"})
                    .addFields({ name: "• /role-info", value: "> Displays the info about a given role!"})
                    .addFields({ name: "• /egg", value: "> Replaces text with either the word 'egg' or egg emojis."})
                    .addFields({ name: "• /mc-skin", value: "> Displays the skin currently being used for a given minecraft user!"})
                    .addFields({ name: "• /kanye-quotes", value: "> Replys with a random quote said by Kanye West."})
                    .addFields({ name: "• /radio", value: "> Plays a chosen radio station in a vc."})
                    .addFields({ name: "• /birthday-setup", value: "> Sets up the Birthday System in the server!"})
                    .addFields({ name: "• /birthday-disable", value: "> Disables the Birthday System in the server!"})
                    .addFields({ name: "• /birthday-set", value: "> Sets a Birthday reminder for the user."})
                    .addFields({ name: "• /birthday-remove", value: "> Removes the Birthday reminder for the user."})
                    .addFields({ name: "• /rock-paper-scissors", value: "> Plays a game of rock paper scissors against another server member."})
                    .addFields({ name: "• /automod flagged-words", value: "> Blocks profanity, specific content and slurs for being sent."})
                    .addFields({ name: "• /automod keyword", value: "> Blocks a specified word in the server."})
                    .addFields({ name: "• /automod mention-spam", value: "> Stops users spam pinging members."})
                    .addFields({ name: "• /automod spam-messages", value: "> Stops spam from being sent."})
                    .addFields({ name: "• /khaled-quotes", value: "> Replys with a quote from DJ Khaled."})
                    .addFields({ name: "• /Kanye-quote", value: "> Replys with a quote from Kanye West."})
                    .setThumbnail(`${pfp}`)
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                    const commandpage7 = new EmbedBuilder()
                    .setColor("DarkOrange")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🔨 Help Command` })
                    .setFooter({ text: `🔨 Help command: Commands Page 7` })
                    .addFields({ name: '• More commands comming soon...', value: '> Coming soon.....'})
                    .setThumbnail(`${pfp}`)
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png') 
                    .setTimestamp(); 
                    */

                    


                const commandbuttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                       /*    new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Primary), */

                        new ButtonBuilder()
                            .setCustomId('pageleft')
                            .setLabel('◀')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright')
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                        /*    new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary) */
                    );

                const commandbuttons1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton1')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                       /*     new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary), */

                        new ButtonBuilder()
                            .setCustomId('pageleft1')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright1')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                        /*    new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary) */
                        );

                    const commandbuttons2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton2')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                        /*    new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary), */

                        new ButtonBuilder()
                            .setCustomId('pageleft2')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright2')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                       /*     new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary) */
                    );

             /*   const commandbuttons3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton3')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                        /*    new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary), */

                   /*     new ButtonBuilder()
                            .setCustomId('pageleft3')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright3')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                        /*   new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary) */
                   /* );

                const commandbuttons4 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton4')
                            .setLabel('Help Center')   
                            .setStyle(ButtonStyle.Success),

                       /*    new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary), */

                     /*   new ButtonBuilder()
                            .setCustomId('pageleft4')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright4')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                  /*      new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Primary) */
                            
                 /*   );
                
                    const commandbuttons5 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton5')
                            .setLabel('Help Center')   
                            .setStyle(ButtonStyle.Success),

                     /*       new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary), */

                     /*   new ButtonBuilder()
                            .setCustomId('pageleft5')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright5')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                    /*    new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Primary) */
                            
                 /*   );

                    const commandbuttons6 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton6')
                            .setLabel('Help Center')   
                            .setStyle(ButtonStyle.Success),

                     /*       new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary), */

                    /*    new ButtonBuilder()
                            .setCustomId('pageleft6')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright6')
                            .setDisabled(true)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                     /*   new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Primary) */ 
                            
                 /*   ); */


                await interaction.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                const collector = interaction.message.createMessageComponentCollector({ componentType: ComponentType.Button });

                collector.on('collect', async (i, err) => {

                  /* if (i.customId === 'last') {
                        i.update({ embeds: [commandpage7], components: [commandbuttons6] }).catch(err);
                    } */

                    if (i.customId === 'first') {
                        i.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageleft') { 
                        i.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                    }

                    if (i.customId === 'pageright') { 
                        i.update({ embeds: [commandpage2], components: [commandbuttons1] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton1') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }
/*
                    if (i.customId === 'pageright1') {
                        i.update({ embeds: [commandpage3], components: [commandbuttons2] }).catch(err);
                    } */

                    if (i.customId === 'pageleft1') {
                        i.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton2') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }
/*
                    if (i.customId === 'pageright2') {
                        i.update({ embeds: [commandpage4], components: [commandbuttons3] }).catch(err);
                    } */

                    if (i.customId === 'pageleft2') {
                        i.update({ embeds: [commandpage2], components: [commandbuttons1] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton3') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err)
                    }
/*
                    if (i.customId === 'pageright3') {
                        i.update({ embeds: [commandpage5], components: [commandbuttons4] }).catch(err);
                    }

                    if (i.customId === 'pageleft3') {
                        i.update({ embeds: [commandpage3], components: [commandbuttons2] }).catch(err);
                    } */

                    if (i.customId === 'helpcenterbutton4') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }
/*
                    if (i.customId === 'pageright4') {
                        i.update({ embeds: [commandpage6], components: [commandbuttons5] }).catch(err);
                    } 

                    if (i.customId === 'pageleft4') {
                        i.update({ embeds: [commandpage4], components: [commandbuttons3] }).catch(err);
                    } */

                    if (i.customId === 'helpcenterbutton5') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }
/*
                    if (i.customId === 'pageright5') {
                        i.update({ embeds: [commandpage7], components: [commandbuttons6] }).catch(err);
                    } 

                    if (i.customId === 'pageleft5') {
                        i.update({ embeds: [commandpage5], components: [commandbuttons4] }).catch(err);
                    } */

                    if (i.customId === 'helpcenterbutton6') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }
/*
                    if (i.customId === 'pageright6') {
                        i.update({ embeds: [commandpage7], components: [commandbuttons6] }).catch(err);
                    } 

                    if (i.customId === 'pageleft6') {
                        i.update({ embeds: [commandpage6], components: [commandbuttons5] }).catch(err);
                    } */
                });
            }
        })
    }
})

// Ghost Ping Code //

const ghostSchema = require('./Schemas/ghostping');
const numSchema = require('./Schemas/ghostNum');

client.on(Events.MessageDelete, async message => {

    if (message.guild === null) return;

    const Data = await ghostSchema.findOne({ Guild: message.guild.id });
    if (!Data) return;

    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.author.id === client.user.id) return;
    if (message.author === message.mentions.users.first()) return;

    if (message.mentions.users.first() || message.type === MessageType.reply) {

        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        let number;
        let time = 30;

        const data = await numSchema.findOne({ Guild: message.guild.id, User: message.author.id });
        if (!data) {
            await numSchema.create({
                Guild: message.guild.id,
                User: message.author.id,
                Number: 1
            })

            number = 1;
        } else {
            data.Number += 1;
            await data.save();

            number = data.Number;
        }

        if (number == 2) time = 60;
        if (number == 3) time = 300;
        if (number == 4) time = 600;
        if (number == 5) time = 6000;
        if (number == 6) time = 12000;
        if (number == 7) time = 300000;
        if (number >= 8) time = 600000;

        const ghostembed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTimestamp()
        .setThumbnail(`${pfp}`)
        .setFooter({ text: `🔨 Ghost ping Detected`})
        .setAuthor({ name: `🔨 Anti-Ghost-Ping System`})
        .setTitle('Ghost pings are not Allowed')
        .setDescription(`> **${message.author}**, stop ghosting people.`)

        const ghostdmembed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTimestamp()
        .setThumbnail(`${pfp}`)
        .setFooter({ text: `🔨 Warned for ghost pinging`})
        .setAuthor({ name: `🔨 Anti-Ghost-Ping System`})
        .setTitle('Ghost pings are not Allowed')
        .setDescription(`> You were warned and timedout in **${message.guild.name}** for ghost pinging`)

        const msg = await message.channel.send({ embeds: [ghostembed] });
        setTimeout(() => msg.delete(), 5000);

        const member = message.member;

        
        await member.timeout(time * 1000, 'Ghost pinging.');
        await member.send({ embeds: [ghostdmembed] }).catch(err => {
            return;
        })

            warningSchema.findOne({ GuildID: message.guild.id, UserID: message.author.id, UserTag: message.author.tag }, async (err, data) => {

            if (err) throw err;
    
            if (!data) {
                data = new warningSchema({
                    GuildID: message.guild.id,
                    UserID: message.author.id,
                    UserTag: message.author.tag,
                    Content: [
                        {
                            ExecuterId: '1094255490084638891',
                            ExecuterTag: 'ModX#9838',
                            Reason: 'Ghost Pinging/Replying'
                        }
                    ],
                });
     
            } else {
                const warnContent = {
                    ExecuterId: '1094255490084638891',
                    ExecuterTag: 'ModX#9838',
                    Reason: 'Ghost Pinging/Replying'
                }
                data.Content.push(warnContent);
            }
            data.save()
        })
        
    }
})

// Anti-link System //

const linkSchema = require('./Schemas/link');

client.on(Events.MessageCreate, async (message) => {

    if (message.guild === null) return;
     
    if (message.content.startsWith('http') || message.content.startsWith('discord.gg') || message.content.includes('https://') || message.content.includes('http://') || message.content.includes('discord.gg/') || message.content.includes('www.') || message.content.includes('.net') || message.content.includes('.com')) {

        const Data = await linkSchema.findOne({ Guild: message.guild.id });

        if (!Data) return;

        const memberPerms = Data.Perms;

        const user = message.author;
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Anti-link system'})
        .setTitle('Message removed')
        .setFooter({ text: '🔨 Anti-link detected a link'})
        .setThumbnail(`${pfp}`)
        .setDescription(`> ${message.author}, links are **disabled** in **${message.guild.name}**.`)
        .setTimestamp()

        if (member.permissions.has(memberPerms)) return;
        else {
            await message.channel.send({ embeds: [embed] }).then (msg => {
                setTimeout(() => msg.delete(), 5000)
            })

            ;(await message).delete();

            warningSchema.findOne({ GuildID: message.guild.id, UserID: message.author.id, UserTag: message.author.tag }, async (err, data) => {

                if (err) throw err;
    
                if (!data) {
                    data = new warningSchema({
                        GuildID: message.guild.id,
                        UserID: message.author.id,
                        UserTag: message.author.tag,
                        Content: [
                            {
                                ExecuterId: '1094255490084638891',
                                ExecuterTag: 'ModX#9838',
                                Reason: 'Use of forbidden links'
                            }
                        ],
                    });
     
                } else {
                    const warnContent = {
                        ExecuterId: '1094255490084638891',
                        ExecuterTag: 'ModX#9838',
                        Reason: 'Use of forbidden links'
                    }
                    data.Content.push(warnContent);
                }
                data.save()
            })
        }
    }
})

// test

const GiveawaysManager = require("./utils/giveaway");

client.giveawayManager = new GiveawaysManager(client, {
    default: {
      botsCanWin: false,
      embedColor: "#a200ff",
      embedColorEnd: "#550485",
      reaction: "🎉",
    },
});