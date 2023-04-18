const { CommandInteraction, ApplicationCommandOptionType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

/**
 * Filter and bulk delete messages based on a target user or all non-system messages
 * @param {Object} interaction The interaction object
 * @param {TextChannel} channel - The channel to fetch messages from and delete them
 * @param {Collection<Snowflake, Message>} messages - The messages to filter and delete
 * @param {Object} targetUser The user object to filter the messages by
 * @param {number} amount The maximum number of messages to delete
 */
async function bulkDeleteFilteredMessages(interaction, channel, messages, targetUser, amount) {
    let i = 0;
    const filtered = [];
    messages.filter(message => {
        (targetUser ? message.author.id === targetUser.id : !message.system) && amount > i ? (filtered.push(message), i++) : null;
    });
    channel.bulkDelete(filtered, true).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)).then(deleted => {
        sendResponse(interaction, `${targetUser ? `${process.env.BOT_CONF} ${deleted.size} messages from ${targetUser} deleted in ${channel}` : `${process.env.BOT_CONF} ${deleted.size} messages deleted in ${channel}`}`);
    });
}

module.exports = {
    name: `delete`,
    description: `Delete a specific number of messages from a channel or user`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 10,
    dm_permission: false,
    options: [{
        name: `amount`,
        description: `Number of messages to delete`,
        type: ApplicationCommandOptionType.Number,
        required: true
    },
    {
        name: `username`,
        description: `Delete a specific user's messages`,
        type: ApplicationCommandOptionType.User,
        required: false
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, member, channel, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const amountToDelete = options.getNumber('amount');
        const targetUser = options.getMember('username');
        const fetchedMessages = await channel.messages.fetch();

        if (!guild.members.me.permissionsIn(channel).has('ManageMessages') || !guild.members.me.permissionsIn(channel).has('SendMessages') || !guild.members.me.permissionsIn(channel).has('ViewChannel'))
            return sendResponse(interaction, `${process.env.BOT_DENY} Missing permissions for ${channel}`);

        if (fetchedMessages.size < 1)
            return sendResponse(interaction, `${process.env.BOT_INFO} I could not find any messages from ${targetUser} in ${channel}`);

        if (amountToDelete < 1 && member.id === process.env.OWNER_ID || amountToDelete > 100 && member.id === process.env.OWNER_ID)
            return sendResponse(interaction, `${process.env.BOT_INFO} Amount must be between 1 and 100`);

        if (amountToDelete < 1 || amountToDelete > 5 && member.id !== process.env.OWNER_ID)
            return sendResponse(interaction, `${process.env.BOT_INFO} Amount must be between 1 and 5`);

        if (!targetUser && member.id !== process.env.OWNER_ID)
            return sendResponse(interaction, `${process.env.BOT_INFO} You must include a username`);

        await bulkDeleteFilteredMessages(interaction, channel, fetchedMessages, targetUser, amountToDelete);
    }
} 