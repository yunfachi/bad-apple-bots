const mc = require("minecraft-protocol")
const program = require("commander").program
const GENERATED = require("./generated.js").GENERATED;

program
  .option("-H, --host <host>", "", "localhost")
  .option("-p, --port <port>", "", "25565")
  .option("-u, --username <prefix>", "prefix before the ID of the bot. <prefix><x>_<y>", "yunfachi_")

  .option("-o, --offset <offset...>", "", ["0", "0"])
  .option("--yaw [degress]", "", 165)

  .option("-x, --startx [x]", "", 100)
  .option("-y, --starty [y]", "", 100)
  .option("-z, --startz [z]", "", 100)
  .option("-w, --width [width]", "", 5)
  .option("-h, --height [height]", "", 5)
  .parse(process.argv)

const options = program.opts()

const yaw=options.yaw
const pitch=0

class MCBot {
  constructor(username, x, y, z, isFirst) {
    this.username = username
    this.x = x
    this.y = y
    this.z = z
    this.ready = false
    this.alive = false
    this.lastcolor = null
    this.isFirst = isFirst
  
    this.initClient()
  }

  async initClient() {
    console.log(`[${this.username}] init client`)

    this.client = mc.createClient({
      host: options.host,
      port: options.port,
      username: this.username,
      closeTimeout: 0,
      checkTimeoutInterval: 0
    })
    const windows = require('prismarine-windows')(this.client.version)
    this.inventory = windows.createWindow(0, 'minecraft:inventory', 'Inventory')

    this.initEvents()
  }

  onSpawn() {
    console.log(`[${this.username}] spawned`)
    this.teleport()
    this.giveShields()
    this.getShields()
    this.ready = true
    this.nextActionNumber = 0
    this.lastcolor = null
    this.activateItem()
  }

  initEvents() {
    if (this.isFirst) {
      this.client.on('system_chat', fuhrerBotChat)
      this.client.on('playerChat', fuhrerBotChat)
    }

    this.client.once('update_health', (packet) => {
      if (packet.health > 0) {
        this.alive = true
        this.onSpawn()
      } else {
        this.alive = false
        console.log(`[${this.username}] is dead; respawning`)
        this.client.write('client_command', { actionId: 0 })
      }
    })

    this.client.on('update_health', (packet) => {
      if (packet.health > 0) {
        if (!this.alive) {
          this.alive = true
          this.onSpawn()
        }
      } else {
        this.alive = false;
        console.log(`[${this.username}] is dead; respawning`)
        this.client.write('client_command', { actionId: 0 })
      }
    })

    this.client.on('kicked', (reason) => {
      console.log(`[${this.username}] kicked for reason "${reason}"`)
      this.initClient()
    })

    this.client.on('error', (reason) => {
      console.log(`[${this.username}] error with reason "${reason}"`)
      this.initClient()
    })

    this.client.on('end', (reason) => {
      console.log(`[${this.username}] ended for reason "${reason}`)
      this.initClient()
    })
    
    this.client.on('state', (state) => {
      if (state !== mc.states.PLAY) return

      console.log(`[${this.username}] state is play`)
    })
  }

  chat(text) { this.client.chat(text) }

  teleport() {
    this.chat(`/tp ${this.username} ${this.x} ${this.y} ${this.z} ${yaw} ${pitch}`)
    this.chat(`/tp ${this.x} ${this.y} ${this.z} ${yaw} ${pitch}`)
  }

  giveShields() {
    this.chat("/clear")

    this.chat(`/give ${this.username} shield{BlockEntityTag:{Base:15}}`)
    this.chat(`/give ${this.username} shield{BlockEntityTag:{Base:0}}`)
  }

  getShields() {
    this.shields = {
      "0": this.inventory.items().find(item => item.nbt.value.BlockEntityTag.value.Base.value == 15),
      "1": this.inventory.items().find(item => item.nbt.value.BlockEntityTag.value.Base.value == 0),
    }
    // console.log(this.inventory)
  }

  activateItem() {
    this.client.write("use_item", {hand: 0})
  }

  async moveSlotItem (sourceSlot, destSlot) {
    await this.clickWindow(sourceSlot, 0, 0)
    await this.clickWindow(destSlot, 0, 0)
    // if we're holding an item, put it back where the source item was.
    // otherwise we're done.
    // updateHeldItem()
    // if (bot.inventory.selectedItem) {
    //   await clickWindow(sourceSlot, 0, 0)
    // }
  }

  async equip(item) {

  }

  setQuickBarSlot (slot) {
    // if (bot.quickBarSlot === slot) return
    // bot.quickBarSlot = slot
    this.client.write('held_item_slot', {
      slotId: slot
    })
    // bot.updateHeldItem()
  }

  /*
  color: 0 - black; 1 - white
  */
  setShield(color, equip = true) {
    // if (equip) {
    if(this.lastcolor != color) {
      this.setQuickBarSlot(color) 
      this.activateItem()
      this.lastcolor = color
    }
    // } else {
      // this.moveSlotItem(36+color, 36)

    // }
  }

  createActionNumber () {
    this.nextActionNumber = this.nextActionNumber === 32767 ? 1 : this.nextActionNumber + 1
    return this.nextActionNumber
  }

  async clickWindow (slot, mouseButton, mode) {
    // const Item = require('prismarine-item')()
    let stateId = -1
    // if you click on the quick bar and have dug recently,
    // wait a bit
    // if (slot >= bot.QUICK_BAR_START && bot.lastDigTime != null) {
    //   let timeSinceLastDig
    //   while ((timeSinceLastDig = new Date() - bot.lastDigTime) < DIG_CLICK_TIMEOUT) {
    //     await sleep(DIG_CLICK_TIMEOUT - timeSinceLastDig)
    //   }
    // }
    // const window = bot.currentWindow || bot.inventory

    // assert.ok(mode >= 0 && mode <= 4)
    const actionId = this.createActionNumber()

    const click = {
      slot,
      mouseButton,
      mode,
      id: actionId,
      windowId: this.inventory.id,
      item: slot === -999 ? null : this.inventory.slots[slot]
    }

    let changedSlots
    // if (bot.supportFeature('transactionPacketExists')) {
      // windowClickQueue.push(click)
    // } else {
      if (
      // this array indicates the clicks that return changedSlots
        [
          0,
          // 1,
          // 2,
          3,
          4
          // 5,
          // 6
        ].includes(click.mode)) {
        changedSlots = this.inventory.acceptClick(click)
      } else {
        // this is used as a fallback
        const oldSlots = JSON.parse(JSON.stringify(this.inventory.slots))

        this.inventory.acceptClick(click)

        changedSlots = getChangedSlots(oldSlots, this.inventory.slots)
      }

      changedSlots = changedSlots.map(slot => {
        return {
          location: slot,
          item: Item.toNotch(this.inventory.slots[slot])
        }
      })
    // }

    // WHEN ADDING SUPPORT FOR OTHER CLICKS, MAKE SURE TO CHANGE changedSlots TO SUPPORT THEM
    if (true) { // 1.17.1 +
      this.client.write('window_click', {
        windowId: this.inventory.id,
        stateId,
        slot,
        mouseButton,
        mode,
        changedSlots,
        cursorItem: "minecraft:shield"
        // cursorItem: Item.toNotch(this.inventory.selectedItem)
      })
    // } else if (bot.supportFeature('actionIdUsed')) { // <= 1.16.5
      // bot._client.write('window_click', {
        // windowId: window.id,
        // slot,
        // mouseButton,
        // action: actionId,
        // mode,
        // protocol expects null even if there is an item at the slot in mode 2 and 4
        // item: Item.toNotch((mode === 2 || mode === 4) ? null : click.item)
      // })
    // } else { // 1.17
      // bot._client.write('window_click', {
        // windowId: window.id,
        // slot,
        // mouseButton,
        // mode,
        // changedSlots,
        // cursorItem: Item.toNotch(window.selectedItem)
      // })
    }

    // if (bot.supportFeature('transactionPacketExists')) {
    //   const response = once(bot, `confirmTransaction${actionId}`)
    //   if (!window.transactionRequiresConfirmation(click)) {
    //     confirmTransaction(window.id, actionId, true)
    //   }
    //   const [success] = await withTimeout(response, WINDOW_TIMEOUT)
    //     .catch(() => {
    //       throw new Error(`Server didn't respond to transaction for clicking on slot ${slot} on window with id ${window?.id}.`)
    //     })
    //   if (!success) {
    //     throw new Error(`Server rejected transaction for clicking on slot ${slot}, on window with id ${window?.id}.`)
    //   }
    // } else {
    //   await waitForWindowUpdate(window, slot)
    // }
  }
}

function sleep(secs) {
  return new Promise((resolve) => {
    setTimeout(() => {resolve("")}, secs)
  })
}


let size = {
  start: {
      x: 0,
      y: 0
  },
  end: {
      x: 0,
      y: 0
  }
};
let offset_list = Array(2).fill(0);
let offset_arg = options.offset;
for (let index = 0; index < offset_arg.length && index < 2; index++) {
    offset_list[index] = offset_arg[index];
};
size.start.x = Number(offset_list[0]);
size.start.y = Number(offset_list[1]);
size.end.x = Number(options.width);
size.end.y = Number(options.height);

const width = size.end.x-size.start.x
const height = size.end.y-size.start.y
const start_x = parseFloat(options.startx)
const start_y = parseFloat(options.starty)
const start_z = parseFloat(options.startz)

let bots = []

let startMillisecond = 0;
function getWaitUntilFrame(frame, fps) {
  return (1000/fps*frame) - ((new Date()).getTime() - startMillisecond)
}

async function playOnce(animation, fps) {
  startMillisecond = (new Date()).getTime()
  for (let frame = 0; frame < animation.length; frame++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        bots[y][x].setShield(animation[frame][size.start.y+y][size.start.x+x]);
      };
    };
    console.log(getWaitUntilFrame(frame, fps))
    await sleep(getWaitUntilFrame(frame, fps));
  };
  console.log("SEBETE KOWASA NONARA KURO NI NARE! !")
  console.log("Nani mo mitenai?")
  isStarted = false;
};

async function waitBots(prev_y=null,prev_x=null,prev_count=0) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (bots[y][x] == undefined || !bots[y][x].ready) {
        console.log(`Bot ${y} ${x} is not ready yet (is undefined: ${bots[y][x] == undefined}; isReady: ${bots[y][x].ready};`)
        await sleep(1000)
        if (prev_count >= 4) {
          bots[y][x].client.end()
          console.log(`Bot ${y} ${x} kicked for prev_count (${prev_count})`)
          await sleep(1000)
        }
        waitBots(y,x,prev_y==y && prev_x==x ? (prev_count+1 > 4 ? 0 : prev_count+1) : 0)
        return
      }
    }
  }
  console.log("NAGARETE KU TOKI...")
  // playOnce(GENERATED, 30);
}

let isStarted = false

function fuhrerBotChat(packet) {
  content = packet.plainMessage ?? packet.content?.value?.with?.value?.value[1]?.text?.value
  if (content == undefined) return;

  console.log(`[message-${(new Date()).getMilliseconds()}] ${JSON.stringify(content)}`)
  if (content.toLowerCase().startsWith("nagarete") && !isStarted) {
    playOnce(GENERATED, 30);
    console.log("NO NAKA DE DEMO!")
    isStarted = true
  }
}

async function start() {
  let isFirst = true

  for (let y = 0; y < height; y++) {
    bots[y] = []
    for (let x = 0; x < width; x++) {
      bots[y][x] = new MCBot(
        `${options.username}${y+size.start.y}_${x+size.start.x}`,
        start_x-size.start.x-x,
        start_y-size.start.y-y,
        start_z,
        isFirst
      )
      if (isFirst) {
        isFirst = false
      }
      // await sleep(10)
    }
    // await sleep(1080)
  }
  await waitBots()
}

start()
