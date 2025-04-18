const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `msg`,
    description: `Send a direct message to a user`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `username`,
        description: `The user to send the message to`,
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: `message`,
        description: `The message you want to send`,
        type: ApplicationCommandOptionType.String,
        required: false
    },
    {
        name: `image`,
        description: `If you want to send an image as well`,
        type: ApplicationCommandOptionType.Attachment,
        required: false
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        const target = options.getMember('username');
        const message = options.getString('message');
        const attachment = options.getAttachment('image');

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        target.send({
            content: message ? message : '',
            files: attachment ? [attachment] : []
        }).catch(() => {
            return sendResponse(interaction, `${process.env.BOT_DENY} I could not send a DM to this user`);
        });

        sendResponse(interaction, `${process.env.BOT_CONF} Message sent`);
    }
}