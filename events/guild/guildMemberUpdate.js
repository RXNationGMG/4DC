const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        // Premium member subscription
        if (!oldMember._roles.includes(process.env.SUBSCRIBER_ROLE) && newMember._roles.includes(process.env.SUBSCRIBER_ROLE)) {
            newMember.send({
                content: `Thank you for supporting ContentCreator!
                
Here are a list of perks you now have access, and how you can go about claiming them;
* **Share Your Server** - FTC++ only. Share your Discord server invites in the content share section
* **Premium Ad** - FTC++ only. Claim a free 1-week premium ad spot by contacting a staff member
* **Automatic Link Sharing** - will share your YouTube and Twitch links when you go upload a new video or go live. Contact a staff member to get access
* **Live Now Role** - will be automatically applied when you go live on YouTube or Twitch. You will need to use a compatible streaming program such as OBS, Streamlabs OBS, or XSplit. You will also need to link your YouTube and Twitch channel to your Discord account
* **Link Embeds** - link embeds will be automatically added to your messages when sharing links in the content share channels
* **Double XP** - will be automatically gained when chatting in the server
* **Custom Flair** - can be created for you upon request. Contact a staff member to get your custom flair`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // Timeouts
        let error = false;
        if (newMember.communicationDisabledUntilTimestamp > new Date().getTime()) {
            // Fetch auditlogs for MemberUpdate events
            const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, action: AuditLogEvent.MemberUpdate, })
                .catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem fetching audit logs: `, err);
                    error = true;
                });

            if (error) return;

            const muteLog = fetchedLogs.entries.first();
            const { executor, reason } = muteLog;
            const toReason = reason;

            // Prevent repeated logs when timed out by AutoMod
            if (newMember?.id === executor?.id) return;

            // Log to channel
            let log = new EmbedBuilder()
                .setColor("#E04F5F")
                .setAuthor({ name: `${executor?.username}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${newMember?.user.username} *(${newMember?.user.id})*
**Expires:** <t:${Math.round(newMember.communicationDisabledUntilTimestamp / 1000)}> (<t:${Math.round(newMember.communicationDisabledUntilTimestamp / 1000)}:R>)
**Reason:** ${toReason}`)
                .setFooter({ text: `Timeout • ${uuidv4()}`, iconURL: process.env.LOG_TIMEOUT })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }
    }
}