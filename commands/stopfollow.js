const mineflayer = require('mineflayer')
const { lookatEntity } = require('../index');

async function stopFollow(bot, username) {
    if (ok == 0) {
        return bot.chat('i am not following anyone');
    }
    
    bot.pathfinder.stop();
    bot.on('physicsTick', lookatEntity);
    ok = 0;
    return console.log(`steven is no longer following "${username}"`);
}

module.exports = { stopFollow }
