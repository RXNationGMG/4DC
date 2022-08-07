const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const index = require('../../../lists/index');
const path = require('path');

module.exports = {
    name: `index`,
    description: `Pre-written content for specific channels`,
    access: 'owner',
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `data`,
        description: `Data to send`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'welcome', value: 'welcome' },
        { name: 'rules', value: 'rules' },
        { name: 'servermap', value: 'servermap' },
        { name: 'faqs', value: 'faqs' },
        { name: 'usefullinks', value: 'usefullinks' },
        { name: 'creatorcrew', value: 'creatorcrew' },
        { name: 'selfroles', value: 'selfroles' },
        { name: 'featuredstream', value: 'featuredstream' }]
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { channel, client, options } = interaction;

        const avatarURL = await client.user.avatarURL({ format: 'png', size: 256 });

        // WELCOME
        switch (options.getString('data')) {
            case 'welcome': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.welcome.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.welcome[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }

        // WELCOME
        switch (options.getString('data')) {
            case 'rules': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.rules.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.rules[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }

        // SERVER MAP
        switch (options.getString('data')) {
            case 'servermap': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.servermap.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.servermap[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }

        // FAQ SERVER
        switch (options.getString('data')) {
            case 'faqs': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.faqs.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.faqs[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 20000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
            }

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // USEFUL LINKS
        switch (options.getString('data')) {
            case 'usefullinks': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                    for (let i = 0; i < index.usefullinks.length; i++) {
                        setTimeout(function () {
                            webhook.send({
                                content: `${index.usefullinks[i]}`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }, i * 1000);
                    }
                    setTimeout(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    }, 10000);
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }

        // CREATOR CREW
        switch (options.getString('data')) {
            case 'creatorcrew': {
                const response = new EmbedBuilder()
                    .setColor('#32BEA6')
                    .setDescription(`${index.creatorcrew}`)

                channel.send({
                    embeds: [response]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
            }

                interaction.reply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // SELF ROLES
        switch (options.getString('data')) {
            case 'selfroles': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                const select1 = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('color-select')
                            .setPlaceholder('Select')
                            .addOptions([
                                { label: 'Blue', value: 'blue', emoji: '996661870461210655' },
                                { label: 'Red', value: 'red', emoji: '996661868011716670' },
                                { label: 'Green', value: 'green', emoji: '996661865784545302' },
                                { label: 'Orange', value: 'orange', emoji: '996661864371081336' },
                                { label: 'Yellow', value: 'yellow', emoji: '996661862714327080' },
                                { label: 'Pink', value: 'pink', emoji: '996661860080304138' },
                                { label: 'Purple', value: 'purple', emoji: '996661858025099275' }
                            ]),
                    );

                const select2 = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('platform-select')
                            .setPlaceholder('Select')
                            .addOptions([
                                { label: 'Twitch', value: 'twitch', emoji: '837083090283003964' },
                                { label: 'YouTube', value: 'youtube', emoji: '837083090441994240' },
                                { label: 'Instagram', value: 'instagram', emoji: '837325424744595466' },
                                { label: 'TikTok', value: 'tiktok', emoji: '837325423712796762' },
                                { label: 'Snapchat', value: 'snapchat', emoji: '1003006430065983488' },
                                { label: 'Spotify', value: 'spotify', emoji: '1003022473702412318' },
                                { label: 'SoundCloud', value: 'soundcloud', emoji: '1003021533272346664' },
                                { label: 'Developer', value: 'developer', emoji: '1003006427117391892' },
                                { label: 'Writer', value: 'writer', emoji: '1003006425301266512' },
                                { label: 'Musician', value: 'musician', emoji: '1003021536292257913' },
                                { label: 'Photographer', value: 'photographer', emoji: '1003104549629870230' }
                            ]),
                    );

                const select3 = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('age-select')
                            .setPlaceholder('Select')
                            .addOptions([
                                { label: '13-17', value: '13-17', emoji: '👶' },
                                { label: '18-29', value: '18-29', emoji: '👦' },
                                { label: '30+', value: '30+', emoji: '👨' }
                            ]),
                    );

                const select4 = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('region-select')
                            .setPlaceholder('Select')
                            .addOptions([
                                { label: 'America', value: 'america', emoji: '🏈' },
                                { label: 'Europe', value: 'europe', emoji: '🎡' },
                                { label: 'Oceania', value: 'oceania', emoji: '🏝️' },
                                { label: 'Asia', value: 'asia', emoji: '🐉' },
                                { label: 'Africa', value: 'africa', emoji: '🦁' }
                            ]),
                    );

                const select5 = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('gender-select')
                            .setPlaceholder('Select')
                            .addOptions([
                                { label: 'Male', value: 'male', emoji: '🙋‍♂️' },
                                { label: 'Female', value: 'female', emoji: '🙋‍♀️' },
                                { label: 'Non-binary', value: 'non-binary', emoji: '🙋' }
                            ]),
                    );

                const select6 = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('custom-select')
                            .setPlaceholder('Select')
                            .addOptions([
                                { label: 'Announcements', value: 'announcements', emoji: '📢' },
                                { label: 'Game Deals', value: 'deals', emoji: '🎲' },
                                { label: 'Disboard Bump', value: 'bump', emoji: '📣' }
                            ]),
                    );

                await channel.send({ content: `https://www.forthecontent.xyz/images/creatorhub/banner_selfroles.png` }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `**Select your roles from the dropdown menus below. Select a role again to remove it**

**Choose your nickname color**`, components: [select1]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your content types**`, components: [select2]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your age**`, components: [select3]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your region**`, components: [select4]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your gender**`, components: [select5]
                }).catch(err => console.error(`Could not send a message: `, err));

                await channel.send({
                    content: `⠀
**Choose your optional pings**`, components: [select6]
                }).catch(err => console.error(`Could not send a message: `, err));
            }

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // FEATURED STREAM
        switch (options.getString('data')) {
            case 'featuredstream': {
                await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                const liveNowEmbed = new EmbedBuilder()
                    .setColor("#9c59ff")
                    .setTitle(`🎥 Featured Stream`)
                    .setDescription(`**What Is It?**
A server member who is currently streaming on either Twitch or YouTube will be picked at random to be featured in this channel, they will also be given the <@&998861546530820207> role. After 2 hours, the channel will be reset and a new streamer will be featured`);

                channel.send({ embeds: [liveNowEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    }
}