import mineflayer from "mineflayer";
import { BADAPPLE } from "./badapple.js";
import { setTimeout } from "timers";

let botArgs = {
    host: "localhost",
    port: "25565",
    physicsEnabled: false
};

class MCBot {
    constructor(username, x, y, z) {
        this.username = username;
        this.x = x;
        this.y = y;
        this.z = z;
        this.host = botArgs["host"];
        this.port = botArgs["port"];
        this.physicsEnabled = botArgs["physicsEnabled"]
        this.ready = false;

        this.initBot();
    }

    initBot() {
        this.bot = mineflayer.createBot({
            "username": this.username,
            "host": this.host,
            "port": this.port,
            "physicsEnabled": this.physicsEnabled
        });

        this.initEvents()
    }

    giveShields() {
        this.bot.chat("/clear")

        this.bot.chat(`/give ${this.username} shield{BlockEntityTag:{Base:15}}`);
        this.bot.chat(`/give ${this.username} shield{BlockEntityTag:{Base:0}}`);
    };

    getShields() {
        this.shields = {
            "0": this.bot.inventory.items().find(item => item.nbt.value.BlockEntityTag.value.Base.value == 15),
            "1": this.bot.inventory.items().find(item => item.nbt.value.BlockEntityTag.value.Base.value == 0),
        };
        this.ready = true;
    };

    isReady() {
        return this.ready;
    }

    initEvents() {
        this.bot.on("spawn", async () => {
            //console.log(`[${this.username}] Spawned...`);

            if (this.bot.entity.position.x!=this.x || this.bot.entity.position.y!=this.y || this.bot.entity.position.z!=this.z) {
                this.bot.chat(`/tp ${this.username} ${this.x} ${this.y} ${this.z} ${yaw} ${pitch}`);
            };
            this.giveShields();
            this.getShields();

            //console.log(`[${this.username}] Ready!`);
        });
    };

    send(message) {
        this.bot.chat(message)
    }

    /*
    color: 0 - black; 1 - white
    */
    setShield(color, equip = true) {
        if (equip) {
            this.bot.equip(this.shields[color]);
            this.bot.activateItem();
        } else {
            //this.bot.moveSlotItem(this.shields[color], 36)
        };
    };
};

function playOnce(animation, fps) {
    for (let frame = 0; frame < animation.length; frame++) {
        setTimeout(() => {for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                bots[y][x].setShield(animation[frame][y+offset.plus.y][x+offset.plus.x]);
            };
        };}, 1000/fps*frame);
    };
};

const start = {
    x: 296,
    y: 88,
    z: -1215
};
const end = {
    x: 278,
    y: 70,
    z: -1215
};
let offset = {
    plus: {
        x: 0,
        y: 0
    },
    minus: {
        x: 0,
        y: 0
    }
};

const width = start.x-end.x-offset.plus.x-offset.minus.x
const height = start.y-end.y-offset.plus.y-offset.minus.y

const yaw=165
const pitch=0

if (process.argv.indexOf("--offset") != -1) {
    let offset_list = Array(4).fill(0);
    let offset_arg = process.argv.slice(process.argv.indexOf("--offset")+1, process.argv.indexOf("--offset")+5)

    for (let index = 0; index < offset_arg.length; index++) {
        offset_list[index] = offset_arg[index];
    };

    offset.plus.x = Number(offset_list[0]);
    offset.plus.y = Number(offset_list[1]);
    offset.minus.x = Number(offset_list[2]);
    offset.minus.y = Number(offset_list[3]);
};

let bots = [];
for (let y = 0; y < height; y++) {
    bots[y] = [];
    for (let x = 0; x < width; x++) {
        bots[y][x] = new MCBot(
            `yunfachi_${y+offset.plus.y}_${x+offset.plus.x}`,
            Math.max(start.x,end.x)-offset.plus.x-x+0.5,
            start.y-offset.plus.y-y,
            start.z+0.5
        );
    };
};

let waitBots = function() {
    setTimeout(() => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (bots[y][x] == undefined || !bots[y][x].isReady()) {
                    console.log(`Bot ${y} ${x} is not ready yet`)
                    waitBots();
                    return;
                };
            };
        };
        playOnce(BADAPPLE, 30);
    }, 1000);
};
waitBots();
