const { Message } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message?.author.bot) return;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const promoChan = guild.channels.cache.get(process.env.CONTENT_SHARE);
    const premChan = guild.channels.cache.get(process.env.PREM_CHAN);
    const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

    // Content share
    if (message?.channel.id === process.env.CONTENT_SHARE) {
        let found = false;
        await promoChan.messages.fetch({ limit: 5 }).then(messages => {
            messages.forEach(async message => {
                if (message.author.id === client.user.id && message.content.includes('friendly reminder')) {
                    found = true;
                    if (found) {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                        promoChan.send({
                            content: `:warning: Hey there, just a friendly reminder that a more effective way of growing your audience is by chatting with other creators in <#820889004055855147>. Feel free to come introduce yourself and meet the other members on the server :warning:`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));

        if (!found) {
            promoChan.send({
                content: `:warning: Hey there, just a friendly reminder that a more effective way of growing your audience is by chatting with other creators in <#820889004055855147>. Feel free to come introduce yourself and meet the other members on the server :warning:`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    }

    // Premium Ads
    if (message?.channel.id === process.env.PREM_CHAN) {
        let found = false;
        await premChan.messages.fetch({ limit: 5 }).then(messages => {
            messages.forEach(async message => {
                if (message.author.id === client.user.id && message.content.includes('purchase an ad spot')) {
                    found = true;
                    if (found) {
                        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                        premChan.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                            webhook.send({
                                content: `${process.env.BOT_INFO} Looking to purchase an ad spot? Take a look at [this post](https://discord.com/channels/820889004055855144/907446635435540551/907463741174587473)`,
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));

        if (!found) {
            premChan.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                webhook.send({
                    content: `${process.env.BOT_INFO} Looking to purchase an ad spot? Take a look at [this post](https://discord.com/channels/820889004055855144/907446635435540551/907463741174587473)`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
        }
    }
}

// ${process.env.BOT_INFO} Looking to purchase an ad spot? Take a look at this post