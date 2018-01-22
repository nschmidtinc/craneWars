// This section contains some game constants. It is not super interesting
var GAME_WIDTH = 750;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 50;
var ENEMY_HEIGHT = 50;
var MAX_ENEMIES = 5;

var PLAYER_WIDTH = 25;
var PLAYER_HEIGHT = 25;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;
var SHOOT_CODE =  32;
// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = 'up';
var MOVE_DOWN = 'down';
var SHOOT = 'shoot';
// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png', 'explosion.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});




// This section is where you will be doing most of your coding
class Enemy {
    constructor(xPos) {
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.55;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
        //this.x = this.x + timeDiff * this.speed  * Math.random();
    }

    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
        console.log(this.speed)
    }
}

class Player {
    constructor() {
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT -50; //initial offset
        
        this.sprite = images['enemy.png'];
        this.Lives = 3
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
        else if (direction === MOVE_UP && this.y > 0) {
            this.y = this.y - PLAYER_HEIGHT
        }
        else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT * 2) {
            this.y = this.y + PLAYER_HEIGHT
        }
        else if (direction === SHOOT) {

            console.log("BANG BANG");
           
        } 
    }

    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
        
    }
}





/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {

    constructor(element) {


        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    
    resetGame() {
    console.log("is it running");
        if (this.dead) {
            console.log("reset game");
            this.score = 0;
            this.dead = false;
            this.lastFrame = Date.now();
            this.enemies = [];
            this.player = new Player();
            this.gameLoop();

        }
    }
    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = (GAME_WIDTH / ENEMY_WIDTH);

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }
        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();
        this.lives = 3;
        this.dead = false;
        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
            else if (e.keyCode === UP_ARROW_CODE) { 
                this.player.move(MOVE_UP);
            }
            else if (e.keyCode === DOWN_ARROW_CODE) { 
                this.player.move(MOVE_DOWN);
            }
            else if (e.keyCode === SHOOT_CODE) {
                this.player.move(SHOOT);
            }
            else if (e.keyCode === 82) {
                this.resetGame();
            }
        
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;
        lives = 10;
        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + ' Game Over', 5, 30);
            this.ctx.fillText("reset game by pressing spacebar",100,200);
            

            
            
            
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score, 5, 30);
            this.ctx.fillText(this.lives, 5, 70);
            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    isPlayerDead() {
       var enemyHit = (enemy) => {
           
           if (enemy.x === this.player.x && (enemy.y + ENEMY_HEIGHT) >= this.player.y) {
               this.dead = true; //this part is added by luke understand what is going on
               
              return true
       }
    };
    return this.enemies.some(enemyHit);

    }
    
}





// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();