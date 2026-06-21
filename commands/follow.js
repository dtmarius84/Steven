const mineflayer = require('mineflayer')
const { goals: { GoalNear } }= require('mineflayer-pathfinder')
const { lookatPlayer } = require('/Codes/mc_bot/index');

async function follow(bot, username, defaultMove) {
    const RANGE_GOAL = 1;
    ok = 1;
    bot.on('physicsTick', lookatPlayer);
    const target = bot.players[username].entity;
    if (!target) {
        return bot.chat("you are too far!");
    }
    const { x: playerX, y: playerY, z: playerZ } = target.position;

    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL));

    bot.chat(`i am now following you`);
    return console.log(`shiina is now following "${username}"`);
    }

module.exports = { follow }