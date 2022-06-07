require("dotenv").config();
const { getYoutubeVideoId, getAllVideoMessageIds, convertTimestampToRelativeTime, isAway, deleteVideosFromNonChannelMembers, addVideo, deleteVideosBefore } = require('./utilities');
const ccVideoQueue = require('../../schemas/creator_crew/video_queue');
const path = require("path");

async function deleteMessages(messageIds, channel) {
    messageIds.forEach(messageId => {
        channel.messages.fetch(messageId)
            .then(messages => {
                if (messages instanceof Map) {
                    messages.first().delete();
                } else {
                    messages.delete();
                }
            })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem finding and deleting a message: `, err));
    });
}

async function checkPreviousPosts(client) {
    console.log("Checking previously posted messages in Creator Crew.");
    let startTime = new Date();
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const ccChannel = guild.channels.cache.get(process.env.CCREW_CHAN);
    let allVideoMessageIds = await getAllVideoMessageIds();
    let timestampMap = new Map();

    await ccChannel.messages.fetch({ limit: 100 }).then(messages => {
        messages.forEach(async message => {
            let content = message.content;
            let author = message.author;
            let authorId = author.id;
            let messageId = message.id;
            let timestamp = message.createdAt;

            // Check if the message ID matches any of the video IDs in the DB - if it does, then we can ignore this message
            if (!allVideoMessageIds.includes(messageId)) {
                let videoIdArray = getYoutubeVideoId(content);
                if (videoIdArray != null) {
                    let youtubeVideoId = videoIdArray[1];
                    await addVideo(authorId, messageId, timestamp.valueOf(), youtubeVideoId);
                }
            }
        });
    }).catch(err => console.error(`${path.basename(__filename)} Failed to find previous messages in Creator Crew: `, err));

    console.log(`Processed previous messages in Creator Crew in ${(new Date - startTime).valueOf()}ms.`)
}

async function setupChecks(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(async () => {
        const ccChannel = guild.channels.cache.get(process.env.CCREW_CHAN);
        const ccRole = guild.roles.cache.get(process.env.CCREW_ROLE);
        const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
        const modsRole = guild.roles.cache.get(process.env.MOD_ROLE);

        const oneMonth = 31 * 24 * 60 * 60 * 1000;

        // Remove videos older than 1 month - we assume 1 month is an even 31 days
        let oneMonthAgo = new Date(new Date().valueOf() - oneMonth);
        let messageIds = await deleteVideosBefore(oneMonthAgo.valueOf());
        await deleteMessages(messageIds, ccChannel);

        // Clean videos from non-mods-choice members
        let allowedMembers = ccRole.members.map(m => m.id)
            .concat(staffRole.members.map(m => m.id))
            .concat(modsRole.members.map(m => m.id))
            .filter((value, index, array) => array.indexOf(value) === index);
        messageIds = await deleteVideosFromNonChannelMembers(allowedMembers);
        await deleteMessages(messageIds, ccChannel);

        // Check all video timestamps in all Creator Crew members queues - notify users/staff if videos haven't been watched
        const staffChan = guild.channels.cache.get(process.env.STAFF_CHAN);
        const getUsersVideoQueue = await ccVideoQueue.find();

        for (const data of getUsersVideoQueue) {
            const { userId, videoId, timestamp, notified3, notified5 } = data;
            const ccMember = guild.members.cache.get(userId);
            const isUserAway = await isAway(userId);
            // If user isn't set as away, check there timestamps and warn if needed
            if (!isUserAway) {
                if (convertTimestampToRelativeTime(timestamp) != undefined) {
                    if (convertTimestampToRelativeTime(timestamp) === 3) {
                        if (!notified3) {
                            //Notify the member
                            ccMember.send({
                                content: `A video with the ID \`${videoId}\` has been in your Creator Crew Queue for 3 days. You must wacth all videos before 3 days. Continuing to miss this 3 day requirement may result in you being removed from the Creator Crew role`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err));
                            // Mark this video as notified so we don't notify again
                            await ccVideoQueue.findOneAndUpdate({
                                userId: userId,
                                videoId: videoId
                            }, {
                                notified3: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                        }
                    } else if (convertTimestampToRelativeTime(timestamp) === 5) {
                        if (!notified5) {
                            ccMember.send({
                                content: `A video with the ID \`${videoId}\` has been in your Creator Crew Queue for 5 days. Staff have been notified and you may be removed from the Creator Crew role`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err));
                            // Notify staff
                            staffChan.send({
                                content: `${process.env.STAFF_ROLE}
<@${userId}> has not watched a video is their queue for greater than 5 days`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                            // Mark this video as notified so we don't notify again
                            await ccVideoQueue.findOneAndUpdate({
                                userId: userId,
                                videoId: videoId
                            }, {
                                notified5: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                        }
                    }
                }
            }
        }
    }, 15 * 60 * 1000);
}

module.exports = {
    checkPreviousPosts,
    setupChecks
};
