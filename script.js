window.addEventListener("load", function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === " ") &&
          this.game.keys.indexOf(e.key) === -1
        )
          this.game.keys.push(e.key);
      });
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
      });
    }
  }

  class Rocket {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 6;
      this.height = 3;
      this.speed = 5;
      this.markedForDeletion = false;
    }

    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.9) this.markedForDeletion = true;
    }

    draw(ctx) {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class Particle {}

  class Player {
    constructor(game) {
      this.game = game;
      this.width = 100;
      this.height = 100;
      this.x = 20;
      this.y = 100;
      this.speedX = 0;
      this.speedY = 0;
      this.maxSpeed = 5;
      this.rockets = [];
      this.lives = 0;
      this.reload = 0;
      this.reloadTime = 20;
    }

    update() {
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;

      if (this.game.keys.includes("ArrowLeft")) this.speedX = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowRight"))
        this.speedX = this.maxSpeed;
      else this.speedX = 0;

      if (this.game.keys.includes(" ")) this.shoot();

      this.x += this.speedX;
      this.y += this.speedY;

      this.rockets.forEach((rocket) => {
        rocket.update();
      });

      this.rockets = this.rockets.filter((rocket) => !rocket.markedForDeletion);
    }

    draw(ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      this.rockets.forEach((rocket) => {
        rocket.draw(ctx);
      });
      ctx.fillStyle = "white";
      ctx.fillText(this.lives, this.x + 20, this.y + 20);
    }

    shoot() {
      if (this.game.ammo > 0) {
        if (this.reload === this.reloadTime) {
          this.rockets.push(new Rocket(this.game, this.x + 80, this.y + 40));
          this.game.ammo--;
          this.reload = 0;
        } else this.reload++;
      }
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5;
      this.markedForDeletion = false;
      this.lives = 2;
      this.score = this.lives;
    }
    update() {
      this.x += this.speedX;
      if (this.x + this.width < 0) this.markedForDeletion = true;
    }
    draw(ctx) {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "black";
      ctx.fillText(this.lives, this.x + 20, this.y + 20);
    }
  }

  class Boat1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 200 * 0.2;
      this.height = 150 * 0.2;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
    }
  }

  class Layer {}

  class Background {}

  class UI {
    constructor(game) {
      this.game = game;
      this.fontFamily = "Helvetica";
      this.fontSize = 20;
      this.color = "white";
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowColor = "black";
      ctx.font = this.fontSize + "px " + this.fontFamily;

      // Score
      if (!this.game.gameOver) {
        ctx.fillText(`Score: ${this.game.score}`, 10, 20);
      }

      // Final message
      if (this.game.gameOver) {
        ctx.textAligh = "center";
        ctx.font = "50px " + this.fontFamily;
        ctx.fillStyle = "white";

        let message1;
        if (this.game.score > this.game.winningScore) message1 = "You win!!!";
        else message1 = "Busted!!!";
        ctx.fillText(
          message1,
          this.game.width * 0.5 - 100,
          this.game.height * 0.5
        );
        ctx.fillText(
          `Score: ${this.game.score}`,
          this.game.width * 0.5 - 100,
          this.game.height * 0.5 + 100
        );
      }

      // Timer
      ctx.fillStyle = "violet";
      if (!this.game.gameOver) {
        ctx.fillText(
          ((this.game.gameTimeLimit - this.game.gameTime) * 0.001).toFixed(1),
          this.game.width * 0.5,
          this.game.height - 10
        );
      }

      // UI
      ctx.fillStyle = "green";
      for (let i = 1; i <= this.game.ammo; i++) {
        ctx.fillRect(20 + 5 * i, 50, 5, 20);
      }

      ctx.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.inputHandler = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = [];

      this.ammo = 10;
      this.maxAmmo = 20;
      this.ammoTimer = 0;
      this.ammoInterval = 500;

      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;

      this.score = 0;
      this.winningScore = 10;

      this.gameTime = 0;
      this.gameTimeLimit = 60000;

      this.gameOver = false;
    }

    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.gameTimeLimit) this.gameOver = true;

      this.player.update();
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }

      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkColisions(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.player.lives++;
        }
        this.player.rockets.forEach((rocket) => {
          if (this.checkColisions(rocket, enemy)) {
            enemy.lives--;
            rocket.markedForDeletion = true;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              if (!this.gameOver) this.score += enemy.score;
            }
          }
        });
      });

      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(ctx) {
      this.player.draw(ctx);
      this.enemies.forEach((enemy) => enemy.draw(ctx));
      this.ui.draw(ctx);
    }

    addEnemy() {
      this.enemies.push(new Boat1(this));
    }
    checkColisions(rec1, rec2) {
      return (
        rec1.x < rec2.x + rec2.width &&
        rec1.x + rec1.width > rec2.x &&
        rec1.y < rec2.y + rec2.height &&
        rec1.height + rec1.y > rec2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0);
});
