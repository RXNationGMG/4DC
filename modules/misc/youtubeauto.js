const { dbUpdateOne, dbDeleteOne } = require('../../utils/utils');
const ytNotificationSchema = require('../../schemas/misc/yt_notification_schema');
const res = new (require('rss-parser'))();
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const supporterChan = guild.channels.cache.get(process.env.SUPPORTER_CHAN);

    setInterval(async () => {
        const results = await ytNotificationSchema.find();

        for (const { channelId, videoIds, userId } of results) {
            // Check if the user is still a server member
            const member = guild.members.cache.get(userId);
            if (!member) return dbDeleteOne(ytNotificationSchema, { userId: userId });

            const userTag = member.user?.username;
            const isStaff = member?.roles?.cache.has(process.env.STAFF_ROLE);
            const isSubscriber = member?.roles?.cache.has(process.env.SUBSCRIBER_ROLE);
            const isBooster = member?.roles?.cache.has(process.env.BOOSTER_ROLE);

            if (!isBooster && !isStaff && !isSubscriber) return dbDeleteOne(ytNotificationSchema, { userId: userId });

            res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, (err, resolve) => {
                if (err) return;

                resolve.items.forEach(async (item) => {
                    const regex = item.id.replace('yt:video:', '');

                    if (!videoIds.includes(regex)) {
                        videoIds.push(regex);

                        await dbUpdateOne(ytNotificationSchema, { userId }, { userId, channelId, videoIds });

                        if (isBooster || isSubscriber || isStaff) {
                            supporterChan.send({
                                content: `**${userTag}** just uploaded a new video - ${item.link}`,
                            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }
                    }
                });
            });
        }
    }, 300000);
}