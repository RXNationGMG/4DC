const { Message } = require('discord.js');
const letterCurrents = require('../../schemas/games/letter_currents_schema');
const letterLeaderboard = require('../../schemas/games/letter_lb_schema');
const letterVals = require('../../lists/letter_values');
const fetch = require('node-fetch');
const { dbCreate, dbUpdateOne } = require('../../utils/utils');
const path = require('path');

/**
 * Sends the current number if a user's message is edited or deleted in the counting game
 * @param {Message} message The message to be checked
 */
async function checkDeletedLetterMessage(message) {
    if (message?.channel.id === process.env.LL_CHAN && !message.author.bot) {
        const results = await letterCurrents.find();
        for (const data of results) {
            if (message?.content.toLowerCase() === data.previousWord) {
                message?.channel.send({
                    content: `${process.env.BOT_INFO} ${message.author}'s message was edited or deleted
Their word was \`${data.previousWord.toUpperCase()}\``
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        }
    }
}

/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message.channel.id === process.env.LL_CHAN && !message.author.bot) {
        // Ignore message that start with '>'
        if (message.content.startsWith('>')) return;

        // Get current level from the database
        let results = await letterCurrents.find();

        // Ignore if still processing previous word
        if (results[0].processing === true) {
            return message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }

        // If the entry doesn't exist, create it
        if (results < 1) {
            await dbCreate(letterCurrents, {
                lastLetter: 'null',
                currentLevel: 0,
                currentRecord: 0,
                previousUsedWords: [],
                previousSubmitter: 'null',
                status: 'null',
                searchFor: 'letterCurrents'
            });
            results = await letterCurrents.find();
        }

        for (const data of results) {
            // Set some needed variables
            lastLetter = data.lastLetter;
            currentLevel = data.currentLevel;
            currentRecord = data.currentRecord;
            previousUsedWords = data.previousUsedWords
            previousSubmitter = data.previousSubmitter;
            failed = false;
            deleted = false;

            // Set status as processing. We do this because it can take a while for the bot to process the current word and we want to ignore words submitted during that time
            await dbUpdateOne(letterCurrents, { searchFor: 'letterCurrents' }, { processing: true });

            // Get the first letter of the newly submitted word
            const firstLetter = message.content.charAt(0).toLowerCase();

            // If the message contains more than one word, delete the message and notify the user
            if (!failed && message.content.split(' ').length > 1) {
                failed = true;
                message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                resetProcessing();
                return message.reply({
                    content: `${process.env.BOT_DENY} To send chat messages, put a '> ' (greater than followed by a space) in front of your message`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                        }, 10000);
                    });
            }

            // If the message contains a symbol or number, delete the message and notify the user
            let hasSymbol = /^[a-zA-Z]+$/;
            const test = !hasSymbol.test(message.content);
            if (!failed && test) {
                failed = true;
                resetProcessing();
                message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                return message.reply({
                    content: `${process.env.BOT_DENY} Your word cannot contain numbers or letters. Try again!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                        }, 10000);
                    });
            }

            // If the same user tries to add two messages in a row, delete the message and notify the user
            if (!failed && previousSubmitter === message.author.id) {
                failed = true;
                resetProcessing();
                message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                return message.reply({
                    content: `${process.env.BOT_DENY} You can't add two words in a row. You must wait for another player to submit a word first`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                        }, 10000);
                    });
            }

            // If a message is not longer than 2 characters, delete the message and notify the user
            if (!failed && message.content.length <= 2) {
                failed = true;
                resetProcessing();
                message.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                return message.reply({
                    content: `${process.env.BOT_DENY} All words must be longer than 2 characters. Try again!`,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => { console.error(`${path.basename(__filename)} There was a problem sending a message: `, err) })
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(err => { console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                        }, 10000);
                    });
            }

            // If the last letter and first letter don't match, fail the game
            if (!failed && lastLetter !== firstLetter) {
                failMessage = `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLevel}** \n> Your letter was \`${lastLetter.toUpperCase()}\` but you used \`${firstLetter.toUpperCase()}\` \n> The next letter is \`${lastLetter.toUpperCase()}\` \n> The record to beat is \`${currentRecord}\``;
                return failGame();
            }

            // If the word has been used too soon, fail the game
            if (!failed && previousUsedWords.includes(message.content.toLowerCase())) {
                failMessage = `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLevel}** \n> The word \`${message.content.toUpperCase()}\` was used in the last 5 messages \n> The next letter is \`${lastLetter.toUpperCase()}\` \n> The record to beat is \`${currentRecord}\``;
                return failGame();
            }

            // Check if the word is in the English dictionary
            if (!failed) {
                dictionaryCheckOne(message.content.toLowerCase());
            }
        }

        // Check if the dictionary contains a lowercase version of the word
        async function dictionaryCheckOne(wordToCheck) {
            const resolve = await fetch(`https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${wordToCheck}`);
            const response = await resolve.json();
            const error = response?.error;
            if (!error) {
                // If the response contains an English entry
                const sections = response.parse.sections;
                let sectionsArr = [];
                sections.forEach(section => {
                    sectionsArr.push(section.anchor)
                });
                if (sectionsArr.includes('English')) {
                    passGameAndUpdateDatabase();
                } else {
                    dictionaryCheckTwo(wordToCheck);
                }
            } else {
                dictionaryCheckTwo(wordToCheck);
            }
        }

        // Check if the dictionary contains a capitilized version of the word
        async function dictionaryCheckTwo(wordToCheck) {
            const resolve = await fetch(`https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${capitalizeFirstLetter(wordToCheck)}`);
            const response = await resolve.json();
            const error = response?.error;
            if (!error) {
                // If the response contains an English entry
                const sections = response.parse.sections;
                let sectionsArr = [];
                sections.forEach(section => {
                    sectionsArr.push(section.anchor)
                });
                if (sectionsArr.includes('English')) {
                    passGameAndUpdateDatabase();
                } else {
                    dictionaryCheckThree(wordToCheck);
                }
            } else {
                dictionaryCheckThree();
            }
        }

        // Check if the dictionary contains an exact matching version of the word
        async function dictionaryCheckThree() {
            const resolve = await fetch(`https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${message.content}`);
            const response = await resolve.json();
            const error = response?.error;
            if (!error) {
                // If the response contains an English entry
                const sections = response.parse.sections;
                let sectionsArr = [];
                sections.forEach(section => {
                    sectionsArr.push(section.anchor)
                });
                if (sectionsArr.includes('English')) {
                    passGameAndUpdateDatabase();
                } else {
                    failMessage = `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLevel}** \n> The word \`${message.content.toUpperCase()}\` isn't in the English dictionary - <https://en.wiktionary.org/wiki/${message.content.toLowerCase()}> \n> The next letter is \`${lastLetter.toUpperCase()}\` \n> The record to beat is \`${currentRecord}\``;
                    return failGame();
                }
            } else {
                failMessage = `${process.env.BOT_DENY} ${message.author} **FAILED at ${currentLevel}** \n> The word \`${message.content.toUpperCase()}\` isn't in the English dictionary - <https://en.wiktionary.org/wiki/${message.content.toLowerCase()}> \n> The next letter is \`${lastLetter.toUpperCase()}\` \n> The record to beat is \`${currentRecord}\``;
                return failGame();
            }
        }

        // If a message doesn't pass all checks, fail the game
        function failGame() {
            failed = true;
            // React to the message with a fail
            message.react(process.env.BOT_DENY);
            message.reply({
                content: `${failMessage}`,
                allowedMentions: { repliedUser: true },
                failIfNotExists: false
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem replying to a message: `, err));
            resetDatabaseEntry();
        }

        // Update the database entry if the message passed
        async function passGameAndUpdateDatabase() {
            // Increment the current level
            currentLevel++;
            // React to the message with a pass
            message.react(process.env.BOT_CONF);
            // We only need to store the previous 10 words
            if (previousUsedWords.length >= 5) {
                previousUsedWords.shift();
                previousUsedWords.push(message.content.toLowerCase());
            } else {
                previousUsedWords.push(message.content.toLowerCase());
            }
            await dbUpdateOne(letterCurrents, { searchFor: 'letterCurrents' }, {
                lastLetter: message.content.toLowerCase().slice(-1),
                previousWord: message.content.toLowerCase(),
                currentLevel: currentLevel,
                previousUsedWords: previousUsedWords,
                previousSubmitter: message.author.id,
                processing: false
            });
            // Check if we need to update the record
            if (currentLevel > currentRecord) {
                updateRecordLevel();
            }
            // Update the users leaderboard entry
            updateUserEntry();
        }

        // If the current level is higher than the record level, update it
        async function updateRecordLevel() {
            await dbUpdateOne(letterCurrents, { searchFor: 'letterCurrents' }, { currentRecord: currentLevel });
        }

        // Update the users leaderboard entry, this involves breaking down their word and applying a letter value to each letter
        async function updateUserEntry() {
            // find the value of each letter in a submission
            let tens = 0;
            let eights = 0;
            let fives = 0;
            let fours = 0;
            let threes = 0;
            let twos = 0;
            let ones = 0;
            for (let i = 0; i < message?.content?.length; i++) {
                const letters = message?.content?.toLowerCase().split('');
                letters.forEach(letter => {
                    if (letterVals.tens.letters.includes(letter[i])) {
                        tens++;
                    }
                    if (letterVals.eights.letters.includes(letter[i])) {
                        eights++;
                    }
                    if (letterVals.fives.letters.includes(letter[i])) {
                        fives++;
                    }
                    if (letterVals.fours.letters.includes(letter[i])) {
                        fours++;
                    }
                    if (letterVals.threes.letters.includes(letter[i])) {
                        threes++;
                    }
                    if (letterVals.twos.letters.includes(letter[i])) {
                        twos++;
                    }
                    if (letterVals.ones.letters.includes(letter[i])) {
                        ones++;
                    }
                })
            }
            const tensMath = tens * letterVals.tens.value;
            const eightsMath = eights * letterVals.eights.value;
            const fivesMath = fives * letterVals.fives.value;
            const foursMath = fours * letterVals.fours.value;
            const threesMath = threes * letterVals.threes.value;
            const twosMath = twos * letterVals.twos.value;
            const onesMath = ones * letterVals.ones.value;
            const totalPoints = tensMath + eightsMath + fivesMath + foursMath + threesMath + twosMath + onesMath;

            // Find the user's entry
            const results = await letterLeaderboard.find({ userId: message.author.id });
            // If the user doesn't exist in the database
            if (results < 1) {
                await dbCreate(letterLeaderboard, {
                    userId: message.author.id,
                    username: message.author.username,
                    avatar: message.author.avatar,
                    correctCount: totalPoints,
                    searchFor: 'currentCount'
                });
            } else {
                for (const data of results) {
                    correctCount = parseInt(data.correctCount);
                    // Add the total points to the current count
                    newCorrectCount = correctCount + totalPoints;
                    await dbUpdateOne(letterLeaderboard, { userId: message.author.id }, {
                        username: message.author.username,
                        avatar: message.author.avatar,
                        correctCount: newCorrectCount
                    });
                }
            }
        }

        // Reset the current counts if the game fails
        async function resetDatabaseEntry() {
            await dbUpdateOne(letterCurrents, { searchFor: 'letterCurrents' }, { currentLevel: 0, previousUsedWords: [], previousSubmitter: message.author.id, processing: false });
        }

        async function resetProcessing() {
            await dbUpdateOne(letterCurrents, { searchFor: 'letterCurrents' }, { processing: false });
        }

        // Capitilize the first letter of a word
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
}

module.exports.checkDeletedLetterMessage = checkDeletedLetterMessage;