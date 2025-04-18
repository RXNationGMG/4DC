const { ThreadChannel } = require('discord.js');
const path = require('path');

module.exports = {
    name: `threadCreate`,
    /**
     * @param {ThreadChannel} thread
     */
    async execute(thread, newlyCreated, client) {
        // Information for video/gfx review threads
        if (newlyCreated && thread.parentId === process.env.REVIEW_CHAN) {
            setTimeout(() => {
                thread.send({
                    content: `This forum is focused on providing feedback about specific aspects of the creation process and not the overall video, graphic or other
* Is your post specific about what you want feedback on?
* Have you provided timestamps of the areas you want reviewed?
* Can you share references to what you would like to achieve?
* Example of a good title: "How can I mix my audio better at 3:20?"
* Example of a bad title: "Does this look good?"
If you need to edit your title or post, please do so now or it may be deleted`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }, 3000);
        }

        // Prevent new users from creating a paid service thread
        if (newlyCreated && thread.parentId === process.env.COMMISSIONS_CHAN) {
            const oneWeek = 24 * 7 * 60 * 60 * 1000;
            const threadOwnerId = thread.ownerId;
            const threadOwner = await thread.guild.members.fetch(threadOwnerId);
            const joinedAt = threadOwner.joinedTimestamp;
            if ((new Date() - joinedAt) < oneWeek) {
                thread.delete().catch(err => { return console.error(`${path.basename(__filename)} There was a problem deleting a thread: `, err) });
            }
        }
    }
}