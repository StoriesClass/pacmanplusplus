import Phaser from "phaser";
import tile from "./assets/tile.png";
import pacmanSheet from "./assets/basic_pacman.png";
import dot from "./assets/dot.png";
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

let pacman;
let scoreText;
let aiPaddle;
let userPaddle;
let pongBall;

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
let score = 0;
let multiplier = 1;

function preload() {
    this.load.spritesheet('pacmanSheet', pacmanSheet, {frameWidth: 14, frameHeight: 14});

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

    const redGhost = this.add.sprite(CELL*5.5, CELL*5.5, 'pacmanSheet');
    redGhost.play('red_right');
    redGhost.setDisplaySize(PACSIZE, PACSIZE);
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

    pacman = this.physics.add.sprite(CELL * 2.5, CELL * 2.5, 'pacmanSheet');
    pacman.play('right');
    pacman.setCollideWorldBounds(true);
    // A hack so pacman can easily can get between the tiles
    pacman.setDisplaySize(PACSIZE, PACSIZE);
    cursors = this.input.keyboard.createCursorKeys();
    input = this.input.mousePointer;
    scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#fff'});
    aiPaddle = this.physics.add.sprite(10, 100, 'pongPaddle');
    userPaddle = this.physics.add.sprite(WIDTH - 10, 100, 'pongPaddle');
    pongBall = this.physics.add.sprite(400, 100, 'pongBall');

    initGhosts.call(this);

    initWorld.call(this);
    this.physics.add.collider(pacman, tilesGroup);
    this.physics.add.collider(pacman, dotsGroup, eatDot, null, this);
}

function eatDot(pacman, dot) {
   dot.disableBody(true, true);
   score += multiplier;
}

function updateScore() {
    scoreText.setText("score: " + score);
}

function updateGhosts() {

}

function update() {
    updateScore.call(this);
    handleKeyboard();
    handleMouse();
}

function handleKeyboard() {
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

    const pacmanRectangle = pacman.getBounds();
    let dx = 0, dy = 0;
    if (nextDirection === Direction.left) {
        dx = -7;
    }
    if (nextDirection === Direction.right) {
        dx = 7;
    }
    if (nextDirection === Direction.down) {
        dy = 7;
    }
    if (nextDirection === Direction.up) {
        dy = -7;
    }
    const nextFramePacmanRectangle =
        new Phaser.Geom.Rectangle(pacmanRectangle.left + dx, pacmanRectangle.top + dy, PACSIZE, PACSIZE);

    let overlaps = false;

    updateGhosts.call(this);

    if (nextDirection === direction) {
        return;
    }
    const tiles = tilesGroup.children.entries;
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (Phaser.Geom.Rectangle.Overlaps(nextFramePacmanRectangle, tile.getBounds())) {
            overlaps = true;
            console.log(overlaps)
        }
        console.log("Checking if", nextFramePacmanRectangle, " and ", tile.getBounds(), " do overlap")
    }

    if (!overlaps) {
        console.log("No overlap!!!");
        direction = nextDirection;
    }
}

function handleMouse() {
    userPaddle.y += input.velocity.y / 3;
    userPaddle.y = Math.max(userPaddle.y, userPaddle.height / 2);
    userPaddle.y = Math.min(userPaddle.y, HEIGHT - userPaddle.height / 2);
}

function makeObjectAtCell(x, y, group, key) {
    x = LEFT + x * CELL + CELL / 2;
    y = RIGHT + y * CELL + CELL / 2;

    group.create(x, y, key);
}

// creates and draws the physics world (pWorld)
function initWorld() {
    tilesGroup = this.physics.add.staticGroup();
    dotsGroup = this.physics.add.staticGroup();
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