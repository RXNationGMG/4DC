const { EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../utils/utils');
const path = require('path');

module.exports = async (interaction) => {
    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    // Initial embed and buttons
    const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('Premium Ad Information')
        .setDescription(`Select from the following options`)
        .addFields(
            {
                name: `Ad Duration`,
                value: `* 1 Week - **$5**
* 1 Month - **$15** *(save $5) **recommended***
* 3 Month - **$45** *(save $15)*
* 6 Month - **$80** *(save $40)*
*..custom durations can be arranged*`,
                inline: false
            },
            {
                name: `Role Pings`,
                value: `* @everyone Role Ping - **$10** **recommended**
* @here Role Ping - **$7**
* Specific Role Ping - **$3** per role`,
                inline: false
            },
            {
                name: `Optional Extras`,
                value: `* Own Custom Channel - **$5**
* Re-Ping Role - **$3-$10**
* Bump Ad To Bottom - **$1**
* Additional Links - **$1**

*Prices are USD*
*One link per ad spot*
*PayPal only*

**Contact <@438434841617367080> to purchase an ad spot**`,
                inline: false
            })

    sendResponse(interaction, ``, [embed]);
}