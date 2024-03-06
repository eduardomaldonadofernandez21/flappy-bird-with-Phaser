let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

// to bring in images for our application, such as the background.
function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('road', 'assets/road.png');
    this.load.image('column', 'assets/column.png');
    this.load.spritesheet('bird', 'assets/bird.png', { 
        frameWidth: 64, 
        frameHeight: 96 
    });
}

let bird; // Create the bird
let hasLanded = false;
let cursors;
let hasBumped = false; // Variable for detecting when the bird has hit a column.

let isGameStarted = false; // Variable for starting when the user presses th enter key.
let messageToPlayer;

//to generate elements that will appear in our game, such as images that were brought in from the preload()
function create() {
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    const roads = this.physics.add.staticGroup();

    const topColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 }
    });

    const bottomColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300 },
    });

    const road = roads.create(400, 568, 'road').setScale(2).refreshBody();

    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
    bird.setBounce(0.2); // We specify that the bird should bound  slightly if it collides with something.
    bird.setCollideWorldBounds(true); // Method makes it so that our bird can bump into the edges of the screen

    this.physics.add.overlap(bird, road, () => hasLanded = true, null, this);
    this.physics.add.collider(bird, road); // Make sure the bird lands on top of the road

    this.physics.add.overlap(bird, topColumns, ()=> hasBumped = true, null, this);
    this.physics.add.overlap(bird, bottomColumns, ()=> hasBumped = true, null, this);
    this.physics.add.collider(bird, topColumns); // the bird will not pass through the top and bottom columns.
    this.physics.add.collider(bird, bottomColumns);

    cursors = this.input.keyboard.createCursorKeys(); // Creates and returns an object containing 4 hotkeys for UP, DOWN LEFT and RIGHT and also Space Bar and shift.
    messageToPlayer = this.add.text(0, 0, `Instructions: Press space bar to start`, { 
        fontFamily: '"Comic Sans MS", Times, serif', 
        fontSize:"20px", 
        color: "white", 
        backgroundColor: "black"
    });
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);
}

// It runs continually, and will respond to any user interactions or variables that change
function update () {
    if (cursors.space.isDown && !isGameStarted) { // if the user presses the space key, and the isGameStarted variable is false.
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "UP" button to stay upright\nAnd don\'t hit the columns or ground';
    }

    if (!isGameStarted) {
        bird.setVelocityY(-160);
    }

    if (cursors.up.isDown  && !hasLanded && !hasBumped) { //If the user presses the UP button, then give the bird an upward velocity of -160 and bird cannot move up if it has landed.
        bird.setVelocityY(-160);
    }

    if (isGameStarted && (!hasLanded || !hasBumped)) { // If the bird hasn't landed, then give it a velocity of 50 in the x-direction.
        bird.body.velocity.x = 50;
    } else { // If it lands, make the velocity in the x-direction 0.
        bird.body.velocity.x = 0;
    }

    if (hasBumped || hasLanded) {
        messageToPlayer.text = `Oh no! You crashed!`;
    }

    if (bird.x > 750) {
        bird.setVelocityY(40);
        messageToPlayer.text = `Congrats! You won!`;
    }
}