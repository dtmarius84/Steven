const mineflayer = require('mineflayer')
const { goals: { GoalNear } }= require('mineflayer-pathfinder')
const { Vec3 } = require('vec3');

const { lookatEntity } = require('../index');

async function sleep(bot, defaultMove) {
    bot.removeListener('physicsTick', lookatEntity);
    if (bot.time.isDay) {
        return bot.chat("it's day");
    }

    let block = bot.findBlock({
        matching: block => bot.isABed(block),
        maxDistance: 100
    })

    if (!block) {
        return bot.chat('there are no beds nearby');
    }

    const RANGE_GOAL = 2;
    const pos = block.position;
    const loc = new Vec3(pos.x, pos.y, pos.z);

    bot.pathfinder.setMovements(defaultMove);
    await bot.pathfinder.goto(new GoalNear(loc.x, loc.y, loc.z, RANGE_GOAL));

    try {
        await bot.sleep(block);
        bot.chat('going to sleep');
        console.log('steven is sleeping');
    } catch (err) {
        console.error(`Failed to sleep: ${err}`);
        bot.chat('could not sleep on the bed');
    }

    return bot.on('physicsTick', lookatEntity);    
}

module.exports = { sleep }
