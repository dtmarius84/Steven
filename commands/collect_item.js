const mineflayer = require('mineflayer')
const { goals: {  GoalBlock } }= require('mineflayer-pathfinder')
const { Vec3 } = require('vec3');

const { lookatEntity } = require('/Codes/mc_bot/index');

async function collectWood(bot, username, message, defaultMove) {
    bot.removeListener('physicsTick', lookatEntity);
    
    const blockNames = ['oak_wood', 'oak_log', 
    'spruce_wood', 'spruce_log', 
    'birch_wood', 'birch_log', 
    'acacia_wood', 'acacia_log', 
    'dark_oak_wood', 'dark_oak_log',
    ];
    
    const number = parseInt(message.substring(13));
    if (!number) return bot.chat("please specify how many blocks you need (example: !collectwood 3)");
    if (number > 32) return bot.chat("that's too many blocks (max: 32)");
    
    let blocks = bot.findBlocks({
        matching: blockNames.map(name => bot.registry.blocksByName[name].id),
        maxDistance: 100,
        count: number
    })
    
    if (!blocks)  {
        bot.chat("there is no wood nearby");
        return console.log('There were no wood blocks found');
    }
                
    for (let pos of blocks) {
        if (!pos) {
            console.error('Invalid block position:', pos);
            continue;
        }
    
        const loc = new Vec3(pos.x, pos.y, pos.z);
        const block = bot.blockAt(loc);
    
        bot.pathfinder.setMovements(defaultMove);
        await bot.pathfinder.goto(new GoalBlock(loc.x, loc.y, loc.z));
    
        try {
            await bot.lookAt(loc);
            await bot.dig(block);
        } catch (err) {
            console.error(`Failed to dig at ${loc}: ${err}`);
        }
    }
    bot.on('physicsTick', lookatEntity);
    bot.chat(`i got ${number} blocks of wood for ${username}`);
    return console.log(`shiina has collected ${number} wood for '${username}'`)
}

module.exports = { collectWood }