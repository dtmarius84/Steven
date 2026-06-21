//fight back (attack damage)
//drop blocks
//eat

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear, GoalBlock } }= require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin;
const { Vec3 } = require('vec3');
const { MongoClient } = require('mongodb');
require('dotenv').config({path: './dc_bots/echo/.env'});

//const foodlist = []

const uri = process.env.DB_PASSWORD;
const dbclient = new MongoClient(uri);
const db = dbclient.db('channels');

const bot = mineflayer.createBot({
    host: 'localhost', //minecraft server 
    port: 56160,
    //auth: 'microsoft',
    username: "Steven",
    version: '1.21.1'
})

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.on('login', () => {
    bot.chat("/trigger tpa add 1");
    let botSocket = bot._client.socket;
    console.log(`steven logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
});

bot.on('end', () => {
    console.log(`Disconnected`);
});

function lookatEntity() {
    const nearestEntity = bot.nearestEntity();
    if (!nearestEntity) return;
    const pos = nearestEntity.position.offset(0, nearestEntity.height, 0);
    bot.lookAt(pos);
};

function lookatPlayer() {
    const playerEntity = bot.nearestEntity(entity => entity.type === 'player');
    if (!playerEntity) return;
    const pos = playerEntity.position.offset(0, playerEntity.height, 0);
    bot.lookAt(pos);
}
module.exports = { lookatPlayer, lookatEntity };

const { follow } = require('./commands/follow'); //check if works and do rest
const { stopFollow } = require('./commands/stopfollow')
const { collectWood } = require('./commands/collect_item')
const { sleep } = require('./commands/sleep')

bot.on('death', () =>{
    bot.respawn();
    return console.log('steven respawned');
})

bot.on('spawn', () => {
    const defaultMove = new Movements(bot);
    let ok = 0;

    let ping = 0;
    let botHealth = bot.health;
    bot.on('health', () => { //attack back (still gotta debug + make it work even if the bot doesnt have a sword)
        if (bot.health < botHealth) return
        //const entity = bot.entities();
        //console.log(entity);
        //if (!entity) return;

        if (bot.food < 1) {
            while (bot.food <= 20) {
                const slot = bot.inventory.items().find(item => item.name.includes('cooked') || item.name.includes('bread'));
                if (slot) {
                    bot.equip(slot, 'hand', err => {
                    if (err) {
                        return console.error(err)
                    }
                    })
                }
                bot.consume();
            }
            return;
        }

        ping++;
        setTimeout(() => {
            bot.pvp.stop()
        }, 15000);

        if (ping >= 3) {
            const filter = e => (e.type === 'hostile' || e.type === 'mob' || e.type === 'player') && e.position.distanceTo(bot.entity.position) < 10 && e.displayName !== 'Armor Stand' 
            const slot = bot.inventory.items().find(item => item.name.includes('sword') || item.name.includes('axe'));

            if (slot) {
                bot.equip(slot, 'hand', err => {
                if (err) {
                    return console.error(err)
                }
                })
            }

            const target = bot.nearestEntity(filter);
            bot.pvp.attack(target)
            console.log(`steven is attacking ${target.username || target.mobType}`);
            ping = 0;
        }

        return botHealth = bot.health;
    });

    bot.on('chat', async (username, message) => {
        let messages = [];
        if (username === bot.username) return;
    
        if (message === '!quit' && username === 'Xperiaz96') { //disconnect
        return bot.quit();
        }

        if (message === '!help')
            return bot.chat("!follow - bot will follow you\n!stopfollow - will stop following you\n!collectwood - will collect wood (probably broken)\n!bed - will go to the nearest bed and sleep\n!location - will send the current location of the bot");

        if ( message === '!follow' ) { //follow
            try {
                follow(bot, username, defaultMove);
            } catch (error) {
                console.error("error in following player:", error);
            }
        }

        if ( message === '!stopfollow' ) { //stop follow
            try {
                stopFollow(bot, username);
            } catch (error) {
                console.error("error in unfollowing player:", error);
            }
        }


        if ( message.includes('!collectwood') ) { //collect wood
            try {
                collectWood(bot, username, message, defaultMove);
            } catch (error) {
                console.error("error in collecting wood:", error);
            }
        }

        if ( message === '!sleep' ) { //bed command
            try {
                sleep(bot, defaultMove);
            } catch (error) {
                console.error("error in bot sleep:", error);
            }
        }

        if ( message === '!location' ) { //find bot's location
            return bot.chat(`i am at: ${bot.entity.position.x} ${bot.entity.position.y} ${bot.entity.position.z}`);
        }

        if (message === '!clearinventory') {
            const slot = bot.inventory.items();
            while (slot) {
                bot.equip(slot, 'hand', err => {
                    bot.simpleClick.leftMouse(slot);
                    if (err) {
                        return console.error(err)
                }
                });
            const slot = bot.inventory.items();
            }
        }

        if (message.toLowerCase().includes('steven')) { //chat reply
            try {
                await dbclient.connect();
                const dbmessages = db.collection('messages');
                const messageData = await dbmessages.find({}, { projection: {message: true, _id: false} }).toArray();
                messages = messageData.map(item => item.message);
            } catch (err) {
                console.error(err);
            }

            const randomcollected = messages[Math.floor(Math.random() * messages.length)];
            bot.chat(randomcollected);
            return console.log(`Sent message: "${randomcollected}"`);
        }
    })

});
