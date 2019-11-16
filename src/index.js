import Phaser from "phaser";
import tile from "./assets/tile.png";
import pacmanSheet from "./assets/basic_pacman.png";
import dot from "./assets/dot.png";
import marioSheet from "./assets/mario_jump.png";
import pongPaddleSprite from "./assets/pong_paddle.png";
import pongBallSprite from "./assets/pong_ball.png";

const WIDTH = 800;
const HEIGHT = 600;
const CELL = 40;
const PACSIZE = 36;

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: WIDTH,
    height: HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
// For input events, handled in update
let cursors;
let input;

let mario;
let pacman;
let scoreText;
let moneyText;
let aiPaddle;
let userPaddle;
let pongBall;
let marioJumping = false;

const LEFT = CELL * 8;
const RIGHT = CELL * 6;
const OBSTACLE = '*';
const FREE = '.';
const GHOST = 'g';
let world = [
    "**.**.",
    "**.**.",
    "......",
    "**.**.",
    "*..**.",
    "*....."
];

const Direction = {"up": 1, "down": 2, "left": 3, "right": 4};
// making enum
Object.freeze(Direction);

let direction = Direction.up;
let nextDirection = Direction.up;

let tilesGroup;
let dotsGroup;
let ghostsGroup;
let score = 0;
let money = 0;
let multiplier = 1;

function preload() {
    this.load.spritesheet('pacmanSheet', pacmanSheet, {frameWidth: 14, frameHeight: 14});
    this.load.spritesheet('marioSheet', marioSheet, {frameWidth: 200, frameHeight: 800});

    this.load.image('tile', tile);
    this.load.image('dot', dot);
    this.load.image('pongPaddle', pongPaddleSprite);
    this.load.image('pongBall', pongBallSprite);
}

function initGhosts() {
    this.anims.create({
        key: 'red_right',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 8, end: 9 }),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'red_left',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 10, end: 11 }),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'red_up',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 12, end: 13 }),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'red_down',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 14, end: 15 }),
        frameRate: 2,
        repeat: -1
    });

    const redGhost = this.physics.add.sprite(CELL*5.5, CELL*5.5, 'pacmanSheet');

    redGhost.play('red_right');
    redGhost.setDisplaySize(PACSIZE, PACSIZE);
    redGhost.direction = Direction.up;
    redGhost.setCollideWorldBounds();

    ghostsGroup.add(redGhost);

    let timer = this.time.addEvent({
        delay: 4,
        callback: moveGhost(redGhost),
        callbackScope: this,
        loop: true
    })
}

function create() {
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 0, end: 1}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 2, end: 3}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 4, end: 5}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 6, end: 7}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'marioJump',
        frames: this.anims.generateFrameNumbers('marioSheet', {start: 1, end: 0}),
        frameRate: 4,
        repeat: 0
    });

    pacman = this.physics.add.sprite(CELL * 2.5, CELL * 2.5, 'pacmanSheet');
    pacman.play('right');
    pacman.setCollideWorldBounds(true);
    // A hack so pacman can easily can get between the tiles
    pacman.setDisplaySize(PACSIZE, PACSIZE);
    cursors = this.input.keyboard.createCursorKeys();
    input = this.input;

    scoreText = this.add.text(32, 16, 'score: 0', {fontSize: '32px', fill: '#fff'});
    moneyText = this.add.text(500, 16, 'money: 0', {fontSize: '32px', fill: '#fff'});
    aiPaddle = this.physics.add.sprite(10, 300, 'pongPaddle');
    aiPaddle.setCollideWorldBounds(true);
    aiPaddle.setBounce(1);
    userPaddle = this.physics.add.sprite(WIDTH - 10, 300, 'pongPaddle');
    userPaddle.setCollideWorldBounds(true);
    userPaddle.setBounce(1);
    pongBall = this.physics.add.sprite(35, 300, 'pongBall');
    pongBall.setCollideWorldBounds(true);
    pongBall.setVelocity(1000, 200);
    pongBall.setBounce(1);

    mario = this.add.sprite(200, 400, 'marioSheet');
    mario.setDisplaySize(CELL, CELL * 4);

    // order matters!
    initWorld.call(this);
    initGhosts.call(this);
    setColliders.call(this);
}

function setColliders() {
    this.physics.add.collider(pacman, tilesGroup);
    this.physics.add.collider(pacman, dotsGroup, eatDot, null, this);
    this.physics.add.collider(pacman, ghostsGroup, collideWithGhost, null, this);
    this.physics.add.collider(aiPaddle, pongBall);
    this.physics.add.collider(userPaddle, pongBall);
}

function eatDot(pacman, dot) {
   dot.disableBody(true, true);
   score += multiplier;
}

function collideWithGhost(pacman, ghost) {
    // TODO
}

function updateScore() {
    scoreText.setText("score: " + score);
}

function updateMoney() {
    moneyText.setText("money: " + money);
}

function getDirectionForGhost(ghost) {
    return Phaser.Math.Between(1, 4);
}

function updateGhosts() {
    const gs = ghostsGroup.children.entries;
    for (let i = 0; i < gs.length; i++) {
        const g = gs[i];
        //moveGhost.call(this, g)
        //console.log("Checking if", nextFrameRectangle, " and ", tile.getBounds(), " do overlap")
    }
}

function moveGhost(g) {
    const nextGhostDirection = getDirectionForGhost(g);
    if (canGo(g, nextGhostDirection)) {
        g.direction = nextGhostDirection;
    }
    if (g.direction === Direction.left) {
        g.setVelocityX(-CELL);
        g.setVelocityY(0);
        g.anims.play('red_left', true);
    } else if (g.direction === Direction.right) {
        g.setVelocityX(CELL);
        g.setVelocityY(0);
        g.anims.play('red_right', true);
    } else if (g.direction === Direction.down) {
        g.setVelocityX(0);
        g.setVelocityY(CELL);
        g.anims.play('red_down', true);
    } else if (g.direction === Direction.up) {
        g.setVelocityX(0);
        g.setVelocityY(-CELL);
        g.anims.play('red_up', true);
    }
}

function update() {
    updateScore.call(this);
    updateMoney.call(this);
    updateGhosts.call(this);
    updateAiPaddle.call(this);
    handleKeyboard();
    handleMouse();
}

function updateAiPaddle() {
    aiPaddle.body.y = pongBall.body.y + pongBall.height / 2 - aiPaddle.height / 2;
    aiPaddle.body.y = Math.max(aiPaddle.body.y, 0);
    aiPaddle.body.y = Math.min(aiPaddle.body.y, HEIGHT - aiPaddle.height);
}

function handleKeyboard() {
    if (cursors.space.isDown) {
        mario.play('marioJump', true);
        money++;
    }

    if (cursors.left.isDown) {
        if (direction === Direction.right) {
            direction = Direction.left;
        }
        nextDirection = Direction.left;
    } else if (cursors.right.isDown) {
        if (direction === Direction.left) {
            direction = Direction.right;
        }
        nextDirection = Direction.right;
    } else if (cursors.down.isDown) {
        if (direction === Direction.up) {
            direction = Direction.down;
        }
        nextDirection = Direction.down;
    } else if (cursors.up.isDown) {
        if (direction === Direction.down) {
            direction = Direction.up;
        }
        nextDirection = Direction.up;
    }

    if (direction === Direction.left) {
        pacman.setVelocityX(-CELL);
        pacman.setVelocityY(0);
        pacman.anims.play('left', true);
    } else if (direction === Direction.right) {
        pacman.setVelocityX(CELL);
        pacman.setVelocityY(0);
        pacman.anims.play('right', true);
    } else if (direction === Direction.down) {
        pacman.setVelocityX(0);
        pacman.setVelocityY(CELL);
        pacman.anims.play('down', true);
    } else if (direction === Direction.up) {
        pacman.setVelocityX(0);
        pacman.setVelocityY(-CELL);
        pacman.anims.play('up', true);
    }

    const pacmanCanGo = canGo(pacman, nextDirection);

    if (pacmanCanGo) {
        direction = nextDirection;
    }
}

// checks if the given game object may move in the given direction
function canGo(gameObject, direction) {
    const rectangle = pacman.getBounds();
    let dx = 0, dy = 0;
    if (direction === Direction.left) {
        dx = -7;
    }
    if (direction === Direction.right) {
        dx = 7;
    }
    if (direction === Direction.down) {
        dy = 7;
    }
    if (direction === Direction.up) {
        dy = -7;
    }
    const nextFrameRectangle =
        new Phaser.Geom.Rectangle(rectangle.left + dx, rectangle.top + dy, PACSIZE, PACSIZE);

    let overlaps = false;

    const tiles = tilesGroup.children.entries;
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (Phaser.Geom.Rectangle.Overlaps(nextFrameRectangle, tile.getBounds())) {
            overlaps = true;
        }
        //console.log("Checking if", nextFrameRectangle, " and ", tile.getBounds(), " do overlap")
    }

    return !overlaps;
}

function handleMouse() {
    userPaddle.body.velocity.y = (input.y - userPaddle.body.y - userPaddle.height / 2) * 100;
    userPaddle.body.velocity.y = Math.min(userPaddle.body.velocity.y, 1000);
    userPaddle.body.velocity.y = Math.max(userPaddle.body.velocity.y, -1000);
}

function makeObjectAtCell(x, y, group, key) {
    x = LEFT + x * CELL + CELL / 2;
    y = RIGHT + y * CELL + CELL / 2;

    return group.create(x, y, key);
}

// creates and draws the physics world (pWorld)
function initWorld() {
    tilesGroup = this.physics.add.staticGroup();
    dotsGroup = this.physics.add.staticGroup();
    ghostsGroup = this.physics.add.staticGroup();
    for (let i = 0; i < world.length; i++) {
        const row = world[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === OBSTACLE) {
                makeObjectAtCell(j, i, tilesGroup, 'tile');
            }
            else if (row[j] === FREE) {
                makeObjectAtCell(j, i, dotsGroup,'dot');
            }
            else if (row[j] === GHOST) {
                makeObjectAtCell(j, i, ghostsGroup, 'ghost')
            }
        }
    }
}