import mineflayer from "mineflayer";
import { program } from "commander";
import { GENERATED } from "./generated.js";
import { setTimeout } from "timers";

program
  .option("-h, --host <host>", "", "localhost")
  .option("-p, --port <port>", "", "25565")
  .option("-u, --username <prefix>", "prefix before the ID of the bot. <prefix><x>_<y>", "yunfachi_")

  .option("-o, --offset <offset...>", "", ["0", "0", "0", "0"])
  .option("-y, --yaw [degress]", "", 165)

  .option("-sx, --startx [x]", "", 150)
  .option("-sy, --starty [y]", "", 150)
  .option("-sz, --startz [z]", "", 100)
  .option("-ex, --endx [x]", "", 100)
  .option("-ey, --endy [y]", "", 100)
  .option("-ez, --endz [z]", "", 100)
  .parse(process.argv);

const options = program.opts();

let botArgs = {
    host: options.host,
    port: options.port,
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
            //this.giveShields();
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
    x: options.startx,
    y: options.starty,
    z: options.startz
};
const end = {
    x: options.endx,
    y: options.endy,
    z: options.endz
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

const yaw=options.yaw
const pitch=0

let offset_list = Array(4).fill(0);
let offset_arg = options.offset;
for (let index = 0; index < offset_arg.length && index < 4; index++) {
    offset_list[index] = offset_arg[index];
};
offset.plus.x = Number(offset_list[0]);
offset.plus.y = Number(offset_list[1]);
offset.minus.x = Number(offset_list[2]);
offset.minus.y = Number(offset_list[3]);


const width = start.x-end.x-offset.plus.x-offset.minus.x;
const height = start.y-end.y-offset.plus.y-offset.minus.y;

let bots = [];
for (let y = 0; y < height; y++) {
    bots[y] = [];
    for (let x = 0; x < width; x++) {
        bots[y][x] = new MCBot(
            `${options.username}${y+offset.plus.y}_${x+offset.plus.x}`,
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
        playOnce(GENERATED, 30);
    }, 1000);
};
waitBots();
