const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: `embed`,
    description: `Create a new embed or edit an existing one`,
    permission: `ADMINISTRATOR`,
    type: `CHAT_INPUT`,
    options: [{
        name: `create`,
        description: `Create a new embed`,
        permission: `ADMINISTRATOR`,
        type: `SUB_COMMAND`,
        options: [{
            name: `description`,
            description: `The description for the embed`,
            type: `STRING`,
            required: true,
        },
        {
            name: `title`,
            description: `The title for the embed`,
            type: `STRING`,
            required: false,
        },
        {
            name: `color`,
            description: `The color for the embed. Must be a valid #hex color`,
            type: `STRING`,
            required: false,
        },
        {
            name: `thumbnail`,
            description: `The thumbnail image URL for the embed`,
            type: `STRING`,
            required: false,
        },
        {
            name: `image`,
            description: `The image URL for the embed`,
            type: `STRING`,
            required: false,
        },
        {
            name: `author`,
            description: `Do you want to show who created this embed?`,
            type: `STRING`,
            required: false,
            choices: [{ name: `yes`, value: `yes` }],
        }],
    },
    {
        name: `edit`,
        description: `Edit an existing embed`,
        permission: `ADMINISTRATOR`,
        type: `SUB_COMMAND`,
        options: [{
            name: `id`,
            description: `The id of the message containing the embed you want to edit`,
            type: `STRING`,
            required: true,
        },
        {
            name: `description`,
            description: `The description for the embed`,
            type: `STRING`,
            required: false,
        },
        {
            name: `title`,
            description: `The title for the embed`,
            type: `STRING`,
            required: false,
        },
        {
            name: `color`,
            description: `The color for the embed. Must be a valid #hex color`,
            type: `STRING`,
            required: false,
        },
        {
            name: `thumbnail`,
            description: `The thumbnail image URL for the embed`,
            type: `STRING`,
            required: false,
        },
        {
            name: `image`,
            description: `The image URL for the embed`,
            type: `STRING`,
            required: false,
        }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { user, channel, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'create': {
                    const title = options.getString('title');
                    const description = options.getString('description');
                    const color = options.getString('color') || '#32BEA6';
                    const thumbnail = options.getString('thumbnail');
                    const image = options.getString('image');
                    const author = options.getString('author');

                    const hexRegex = /^#[0-9A-F]{6}$/i;
                    const isHex = hexRegex.test(color);

                    if (!isHex) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`You must enter a valid #hex color\``,
                            ephemeral: true
                        });
                    }

                    const create = new MessageEmbed()
                        .setDescription(`${description}`)
                        .setColor(`${color}`)

                    if (title) create.setTitle(`${title}`);
                    if (thumbnail) create.setThumbnail(`${thumbnail}`);
                    if (image) create.setImage(`${image}`);
                    if (author === 'yes') create.setFooter(`Created by ${user.tag}`, `${user.displayAvatarURL({ dynamic: true })}`)

                    channel.send({
                        embeds: [create],
                    }).then(() => {
                        interaction.reply({
                            content: `${process.env.BOT_CONF} \`Embed created and sent\``,
                        }).then(() => setTimeout(() => {
                            interaction.deleteReply()
                        }, 1500));
                    });

                }
            }
            switch (options.getSubcommand()) {
                case 'edit': {
                    const id = options.getString('id');
                    const title = options.getString('title');
                    const description = options.getString('description');
                    const color = options.getString('color');
                    const thumbnail = options.getString('thumbnail');
                    const image = options.getString('image');

                    const letterRegex = /[a-zA-Z]/g;
                    const hasLetter = letterRegex.test(id);

                    const hexRegex = /^#[0-9A-F]{6}$/i;
                    const isHex = hexRegex.test(color);

                    if (hasLetter === true) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`You must enter a valid message id\``,
                            ephemeral: true
                        });
                    }

                    if (color && isHex === false) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`You must enter a valid #hex color\``,
                            ephemeral: true
                        });
                    }

                    channel.messages.fetch(id).then(fetched => {
                        let embed = fetched?.embeds[0];

                        if (!embed) {
                            interaction.reply({
                                content: `${process.env.BOT_DENY} \`This message does not contain an embed\``,
                                ephemeral: true
                            });
                        } else {
                            if (title) embed.setTitle(`${title}`);
                            if (description) embed.setDescription(`${description}`);
                            if (color) embed.setColor(`${color}`);
                            if (thumbnail) embed.setThumbnail(`${thumbnail}`);
                            if (image) embed.setImage(`${image}`);

                            fetched.edit({ embeds: [embed] });

                            interaction.reply({
                                content: `${process.env.BOT_CONF} \`Embed edited successfully\``,
                            }).then(() => setTimeout(() => {
                                interaction.deleteReply()
                            }, 1500));
                        }
                    });
                }
            }
        } catch (err) {
            if (err) console.log(err);
        }
    }
}