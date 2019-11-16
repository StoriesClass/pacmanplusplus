import Phaser from "phaser";
import tile from "./assets/tile.png";
import pacmanSheet from "./assets/basic_pacman.png";

const WIDTH = 800;
const HEIGHT = 600;
const CELL = 40;

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

// Representation of the world above in Phaser's physics system. Filled and drawn in create.
let pWorld;

function preload() {
    this.load.spritesheet('pacmanSheet', pacmanSheet, { frameWidth: 14, frameHeight: 14})

    this.load.image('tile', tile);
}

function create() {
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 2, end: 3 }),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 4, end: 5 }),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('pacmanSheet', { start: 6, end: 7 }),
        frameRate: 2,
        repeat: -1
    });

    pacman = this.physics.add.sprite(CELL*2.5, CELL*2.5, 'pacmanSheet');
    pacman.play('right');
    pacman.setCollideWorldBounds(true);
    pacman.setSize(CELL, CELL);
    cursors = this.input.keyboard.createCursorKeys();
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    initWorld.call(this);
    this.physics.add.collider(pacman, pWorld);
}

function update() {
    if (cursors.left.isDown) {
        pacman.setVelocityX(-CELL);
        pacman.setVelocityY(0);
        pacman.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        pacman.setVelocityX(CELL);
        pacman.setVelocityY(0);
        pacman.anims.play('right', true);
    }
    else if (cursors.down.isDown) {
        pacman.setVelocityX(0);
        pacman.setVelocityY(CELL);
        pacman.anims.play('down', true);
    }
    else if (cursors.up.isDown) {
        pacman.setVelocityX(0);
        pacman.setVelocityY(-CELL);
        pacman.anims.play('up', true);
    }
}

// creates and draws the physics world (pWorld)
function initWorld() {
    console.log("init");
    pWorld = this.physics.add.staticGroup();
    let x = CELL/2;
    let y = CELL/2;
    for(let i = 0; i < world.length; i++) {
        const row = world[i];
        for(let j = 0; j < row.length; j++) {
            if (row[j] === OBSTACLE) {
                pWorld.create(x, y, 'tile');
            }
            x += CELL;
        }
        x = CELL/2;
        y += CELL;
    }
}