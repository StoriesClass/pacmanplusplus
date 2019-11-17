import Phaser from "phaser";
import tile from "./assets/tile.png";
import pacmanSheet from "./assets/basic_pacman.png";
import dot from "./assets/dot.png";
import marioSheet from "./assets/mario_jump.png";
import pongPaddleSprite from "./assets/pong_paddle.png";
import pongBallSprite from "./assets/pong_ball.png";
import invadersMonsterSprite from "./assets/invaders_monster.png";
import invadersCanonSprite from "./assets/invaders_canon.png";
import canonShotSprite from "./assets/canon_shot.png";
import bigDot from "./assets/big_dot.png";

const CELL = 40;
const WIDTH = CELL * 38;
const HEIGHT = CELL * 32;
const PACSIZE = 36;

const PADDLE_WIDTH = 20;
const PADDLE_LENGTH_DELTA = 50;
const BASE_PADDLE_COST = 10;

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
let coinsText;
let aiPaddle;
let userPaddle;
let pongBall;
let invadersCanon;
let marioJumping = false;
let marioCanJump = true;

let pongBallSpeed = 500;

let invadersMonstersGroup;
let canonShotsGroup;

const LEFT_OFFSET = CELL * 6;
const TOP_OFFSET = CELL * 2;
const OBSTACLE = '*';
const FREE = ' ';
const GHOST = 'g';
const PACMAN = 'p';
const BIG_DOT = 'd';
let world = [
    "*************************",
    "*     *       *         *",
    "* * ***p*** * * ******* *",
    "* *   *  d* *   *     * *",
    "* *** * *** ********* * *",
    "*   *   *   *        *  *",
    "*** ***** *** *** * *** *",
    "*   *   *   * * * *     *",
    "* ***** *** * * * * *****",
    "*  g      *    g* *     *",
    "***** *********** *   * *",
    "* *       *  **   *   * *",
    "*     *** * **  *   *   *",
    "* ** ** * *  * *** ** * *",
    "*       * *  g      * * *",
    "* * ** ** *** * *** * ***",
    "* * *   *     *   * * * *",
    "* * * * ***** *** * * * *",
    "* *   *   * *   * * * * *",
    "* *   *   *   * *  g*   *",
    "*** * * *** * * * * *** *",
    "*       *   *** * *   * *",
    "* *** * * ***   * *** * *",
    "*   * ***   ***   *     *",
    "* *   *   *     *   *   *",
    "* *** ******* *** ***** *",
    "*   *                  **",
    "*************************"
];

const Direction = {"up": 1, "down": 2, "left": 3, "right": 4};
const GhostMode = {"normal": 1, "scared": 2};
const BigDotMode = {"small": 1, "large": 2}; // TODO
// making enum
Object.freeze(Direction);
Object.freeze(GhostMode);

let tilesGroup;
let dotsGroup;
let ghostsGroup;
let score = 0;
let coins = 0;
let multiplier = 1;

let paddleLength = 120;
let paddleCostText;
let paddleCost = BASE_PADDLE_COST;

function preload() {
    this.load.spritesheet('pacmanSheet', pacmanSheet, {frameWidth: 14, frameHeight: 14});
    this.load.spritesheet('marioSheet', marioSheet, {frameWidth: 200, frameHeight: 800});

    this.load.image('tile', tile);
    this.load.image('dot', dot);
    this.load.image('pongPaddle', pongPaddleSprite);
    this.load.image('pongBall', pongBallSprite);
    this.load.image('invadersMonster', invadersMonsterSprite);
    this.load.image('invadersCanon', invadersCanonSprite);
    this.load.image('canonShot', canonShotSprite);
    this.load.image('bigDot', bigDot);
}

function initGhosts() {
    this.anims.create({
        key: 'red_right',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 8, end: 9}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'red_left',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 10, end: 11}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'red_up',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 12, end: 13}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'red_down',
        frames: this.anims.generateFrameNumbers('pacmanSheet', {start: 14, end: 15}),
        frameRate: 2,
        repeat: -1
    });
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
        frameRate: 15,
        repeat: 0
    });

    cursors = this.input.keyboard.createCursorKeys();
    input = this.input.mousePointer;

    scoreText = this.add.text(32, 16, 'score: 0', {fontSize: '32px', fill: '#fff'});
    coinsText = this.add.text(WIDTH - 230, 16, 'coins: 0', {fontSize: '32px', fill: '#fff'});

    aiPaddle = this.physics.add.sprite(10, 300, 'pongPaddle');
    aiPaddle.setCollideWorldBounds(true);
    aiPaddle.setBounce(1);
    userPaddle = this.physics.add.sprite(WIDTH - 10, 300, 'pongPaddle');
    userPaddle.setCollideWorldBounds(true);
    userPaddle.setBounce(1);
    userPaddle.setDisplaySize(PADDLE_WIDTH, paddleLength);
    invadersCanon = this.physics.add.sprite(WIDTH / 2, HEIGHT - 30 / 2, 'invadersCanon');

    invadersMonstersGroup = this.physics.add.staticGroup();
    canonShotsGroup = this.physics.add.staticGroup();

    this.time.addEvent({
        delay: 1000,
        callback: () => fireCanon.call(this),
        callbackScope: this,
        loop: true
    });

    mario = this.add.sprite(WIDTH - CELL * 3, HEIGHT - CELL * 5, 'marioSheet');
    mario.setDisplaySize(CELL * 2, CELL * 8);
    mario.on('animationcomplete', marioFinishesJumping, this);

    // order matters!
    initWorld.call(this);
    initGhosts.call(this);

    pongBall = this.physics.add.sprite(35, 300, 'pongBall');
    pongBall.setCollideWorldBounds(true);
    pongBall.setVelocity(pongBallSpeed, 0);
    pongBall.setBounce(1);

    setColliders.call(this);

    paddleCostText = this.add.text(WIDTH / 2 - 300, HEIGHT - 70, '"P" to upgrade paddle for ' + BASE_PADDLE_COST + ' coins', {
        fontSize: '30px',
        fill: '#fff'
    });
    this.input.keyboard.on('keydown_P', upgradePaddle, this);
}

function initPacman(x, y) {
    pacman = this.physics.add.sprite(CELL * x + CELL / 2, CELL * y + CELL / 2, 'pacmanSheet');
    pacman.play('right');
    pacman.setCollideWorldBounds(true);
    // A hack so pacman can easily can get between the tiles
    pacman.setDisplaySize(PACSIZE, PACSIZE);
    pacman.direction = Direction.down;
    pacman.myAnim = {
        'left': 'left',
        'right': 'right',
        'up': 'up',
        'down': 'down'
    };
}

function setColliders() {
    this.physics.add.collider(pacman, tilesGroup);
    this.physics.add.collider(pacman, dotsGroup, eatDot, null, this);
    this.physics.add.collider(aiPaddle, pongBall, pongBounce, null, this);
    this.physics.add.collider(userPaddle, pongBall, pongBounce, null, this);
    this.physics.add.collider(pongBall, pacman, null, ballHitPacman, this);
}

function pongBounce(paddle, ball) {
    let hitPos = ((paddle.body.y + aiPaddle.height / 2) - (ball.body.y + pongBall.height / 2)) / (aiPaddle.height / 2);
    let angle = hitPos * (Math.PI * 5 / 12);
    if (ball.body.x < WIDTH / 2) {
        ball.body.velocity.x = pongBallSpeed * Math.cos(angle);
    } else {
        ball.body.velocity.x = -pongBallSpeed * Math.cos(angle);
    }
    ball.body.velocity.y = 1000 * -Math.sin(angle);
    paddle.body.velocity.x = 0;
    paddle.body.velocity.y = 0;
}

function gameOver() {
    console.log("gg");
    this.physics.pause();
}

function ballHitPacman() {
    gameOver.call(this);
}

function eatDot(pacman, dot) {
    dot.disableBody(true, true);
    score += multiplier;
}

function eatBigDot(pacman, bigDot) {
    bigDot.disableBody(true, true);
    score += multiplier * 10;

    forEachGhost(g => {
        g.ghostMode = GhostMode.scared;
        g.setTint(0x00ff00);
    });

    this.time.addEvent({
        delay: 10000,
        callback: () => {
            forEachGhost(g => {
                g.ghostMode = GhostMode.normal;
                g.setTint(0xffffff);
            });
        },
        callbackScope: this,
        loop: false
    })
}

function forEachGhost(callback) {
    const gs = ghostsGroup.children.entries;
    for (let i = 0; i < gs.length; i++) {
        callback(gs[i]);
    }
}

function collideWithGhost(pacman, ghost) {
    console.log("colliding with a ghost");
    if (ghost.ghostMode === GhostMode.normal) {
        gameOver();
    } else if (ghost.ghostMode === GhostMode.scared) {
        eatGhost.call(this, ghost);
        spawnGhost.call(this);
    }
}

// This is very bad
function spawnGhost() {
    let freeSpace = 0;
    for (let i = 0; i < world.length; i++) {
        const row = world[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === FREE) {
                freeSpace++;
            }
        }
    }
    let newGhostPos = Phaser.Math.Between(0, freeSpace);
    for (let i = 0; i < world.length; i++) {
        const row = world[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === FREE) {
                newGhostPos--;
                if (newGhostPos === 0) {
                    initGhost.call(this, j, i);
                    return;
                }
            }
        }
    }
}

function eatGhost(ghost) {
    ghost.disableBody(true, true);
}

function updateScore() {
    scoreText.setText("score: " + score);
}

function updateMoney() {
    coinsText.setText("coins: " + coins);
}

function getDirectionForGhost(ghost) {
    return Phaser.Math.Between(1, 4);
}

function updateGhosts() {
    const gs = ghostsGroup.children.entries;
    for (let i = 0; i < gs.length; i++) {
        moveObject(gs[i]);
    }
}

function changeGhostDirection(g) {
    g.nextDirection = getDirectionForGhost(g);
    if (canGo(g)) {
        g.direction = g.nextDirection;
    }
    //console.log("Change ghost direction for " + g);
}

function update() {
    updateScore.call(this);
    updateMoney.call(this);
    updateGhosts.call(this);
    updateAiPaddle.call(this);
    moveObject(pacman);
    handleKeyboard();
    handleMouse();
}

function fireCanon() {
    let shot = this.physics.add.sprite(invadersCanon.x, invadersCanon.y - invadersCanon.height / 2 - 5, 'canonShot');
    shot.setVelocity(0, -1000);
    // shot.setCollideWorldBounds(true);
}

function updateAiPaddle() {
    aiPaddle.body.y = pongBall.body.y + pongBall.height / 2 - aiPaddle.height / 2;
    aiPaddle.body.y = Math.max(aiPaddle.body.y, 0);
    aiPaddle.body.y = Math.min(aiPaddle.body.y, HEIGHT - aiPaddle.height);
}

function updateDirection(object, directionIntent) {
    if (directionIntent === Direction.left) {
        if (object.direction === Direction.right) {
            object.direction = Direction.left;
        }
    } else if (directionIntent === Direction.right) {
        if (object.direction === Direction.left) {
            object.direction = Direction.right;
        }
    } else if (directionIntent === Direction.down) {
        if (object.direction === Direction.up) {
            object.direction = Direction.down;
        }
    } else if (directionIntent === Direction.up) {
        if (object.direction === Direction.down) {
            object.direction = Direction.up;
        }
    }
    object.nextDirection = directionIntent;
}

const PACSPEED = 3;

function moveObject(object) {
    const direction = object.direction;
    if (direction === Direction.left) {
        object.setVelocityX(-CELL * PACSPEED);
        object.setVelocityY(0);
        object.anims.play(object.myAnim.left, true);
    } else if (direction === Direction.right) {
        object.setVelocityX(CELL * PACSPEED);
        object.setVelocityY(0);
        object.anims.play(object.myAnim.right, true);
    } else if (direction === Direction.down) {
        object.setVelocityX(0);
        object.setVelocityY(CELL * PACSPEED);
        object.anims.play(object.myAnim.down, true);
    } else if (direction === Direction.up) {
        object.setVelocityX(0);
        object.setVelocityY(-CELL * PACSPEED);
        object.anims.play(object.myAnim.up, true);
    }
}

function handleMario() {
    if (cursors.space.isDown && !marioJumping && marioCanJump) {
        marioJumping = true;
        marioCanJump = false;
        mario.play('marioJump', true);
    }

    if (!marioCanJump && !marioJumping && !cursors.space.isDown) {
        marioCanJump = true;
    }
}

function marioFinishesJumping() {
    marioJumping = false;
    coins++;
}

function handleKeyboard() {
    handleMario();

    if (cursors.left.isDown) {
        updateDirection(pacman, Direction.left);
    } else if (cursors.right.isDown) {
        updateDirection(pacman, Direction.right);
    } else if (cursors.down.isDown) {
        updateDirection(pacman, Direction.down);
    } else if (cursors.up.isDown) {
        updateDirection(pacman, Direction.up);
    }

    const pacmanCanGo = canGo(pacman);

    if (pacmanCanGo) {
        pacman.direction = pacman.nextDirection;
    }
}

// checks if the given game object may move in the given direction
function canGo(gameObject) {
    const rectangle = gameObject.getBounds();
    const nextDirection = gameObject.nextDirection;
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

    if (!overlaps) {
        //console.log("NO overlap");
    }

    return !overlaps;
}

function handleMouse() {
    if (Math.abs(input.y - userPaddle.body.y - userPaddle.height / 2) < 50) {
        userPaddle.body.velocity.y = 0;
        userPaddle.body.y = input.y - userPaddle.height / 2;
    } else {
        userPaddle.body.velocity.y = (input.y - userPaddle.body.y - userPaddle.height / 2) * 100;
        userPaddle.body.velocity.y = Math.min(userPaddle.body.velocity.y, 10000);
        userPaddle.body.velocity.y = Math.max(userPaddle.body.velocity.y, -10000);
    }

    invadersCanon.body.velocity.x = (input.x - invadersCanon.body.x - invadersCanon.width / 2) * 100;
    invadersCanon.body.velocity.x = Math.min(invadersCanon.body.velocity.x, 10000);
    invadersCanon.body.velocity.x = Math.max(invadersCanon.body.velocity.x, -10000);
}

function makeObjectAtCell(x, y, group, key) {
    x = LEFT_OFFSET + x * CELL + CELL / 2;
    y = TOP_OFFSET + y * CELL + CELL / 2;

    return group.create(x, y, key);
}

function initGhost(x, y) {
    const ghost = this.physics.add.sprite(LEFT_OFFSET + x * CELL + CELL / 2, TOP_OFFSET + y * CELL + CELL / 2, 'pacmanSheet');
    ghost.myAnim = {
        'left': 'red_left',
        'right': 'red_right',
        'up': 'red_up',
        'down': 'red_down'
    };

    ghost.play('red_right');
    ghost.setDisplaySize(PACSIZE, PACSIZE);
    ghost.direction = Direction.up;
    ghost.setCollideWorldBounds();
    ghost.ghostMode = GhostMode.normal;

    ghostsGroup.add(ghost);

    this.time.addEvent({
        delay: 4000,
        callback: () => changeGhostDirection(ghost),
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(ghost, tilesGroup, null, () => changeGhostDirection(ghost), this);
    this.physics.add.collider(pacman, ghost, null, collideWithGhost, this);
}

function initBigDot(x, y) {
    const bigDot = this.physics.add.sprite(x * CELL + CELL / 2, y * CELL + CELL / 2, 'bigDot');

    this.physics.add.collider(pacman, bigDot, null, eatBigDot, this);
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
            } else if (row[j] === FREE) {
                makeObjectAtCell(j, i, dotsGroup, 'dot');
            } else if (row[j] === PACMAN) {
                initPacman.call(this, j, i);
            } else if (row[j] === BIG_DOT) {
                initBigDot.call(this, j, i);
            }
        }
    }

    for (let i = 0; i < world.length; i++) {
        const row = world[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === GHOST) {
                // we want to initialize ghosts after pacman initialization
                initGhost.call(this, j, i)
            }
        }
    }
}

function upgradePaddle() {
    if (coins >= paddleCost) {
        coins -= paddleCost;
        paddleLength += PADDLE_LENGTH_DELTA;
        userPaddle.setDisplaySize(PADDLE_WIDTH, paddleLength);
        paddleCost += BASE_PADDLE_COST;
        paddleCostText.setText('"P" to upgrade paddle for ' + paddleCost + ' coins');
    }
}