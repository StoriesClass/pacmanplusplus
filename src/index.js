import Phaser from "phaser";
import tile from "./assets/tile.png";
import pacmanSheet from "./assets/basic_pacman.png";

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
let pacman;
let scoreText;

const OBSTACLE = '*';
const FREE = '.';
let world = [
    "**.**",
    "**.**",
    ".....",
    "**.**",
    "**.**"
];

const Direction = {"up": 1, "down": 2, "left": 3, "right": 4};
// making enum
Object.freeze(Direction);

let direction = Direction.up;
let nextDirection = Direction.up;

// Representation of the world above in Phaser's physics system. Filled and drawn in create.
let pWorld;

function preload() {
    this.load.spritesheet('pacmanSheet', pacmanSheet, {frameWidth: 14, frameHeight: 14});

    this.load.image('tile', tile);
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
    scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});

    initWorld.call(this);
    this.physics.add.collider(pacman, pWorld);
}

function update() {
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

    if (nextDirection === direction) {
        return;
    }
    const tiles = pWorld.children.entries;
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

// creates and draws the physics world (pWorld)
function initWorld() {
    console.log("init");
    pWorld = this.physics.add.staticGroup();
    let x = CELL / 2;
    let y = CELL / 2;
    for (let i = 0; i < world.length; i++) {
        const row = world[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === OBSTACLE) {
                pWorld.create(x, y, 'tile');
            }
            x += CELL;
        }
        x = CELL / 2;
        y += CELL;
    }
}