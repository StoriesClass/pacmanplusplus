import Phaser from "phaser";
import pacmanSheet from "./assets/basic_pacman.png"

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 800,
    height: 600,
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

function preload() {
    this.load.spritesheet('pacmanSheet', pacmanSheet, { frameWidth: 14, frameHeight: 14})
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

    pacman = this.physics.add.sprite(50, 50, 'pacmanSheet');
    pacman.play('right');
    pacman.setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update() {
    if (cursors.left.isDown) {
        pacman.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        pacman.anims.play('right', true);
    }
    else if (cursors.down.isDown) {
        pacman.anims.play('down', true);
    }
    else if (cursors.up.isDown) {
        pacman.anims.play('up', true);
    }
}