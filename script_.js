(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let w, h, mouse, missile;

  class Missile {
    constructor() {
      this.pos = { x: w / 2, y: h / 2 };
      this.vel = { x: 10, y: 10 };
      this.napr = { x: 1, y: 1 };
    }

    draw(x, y) {
      this.vel.x = this.vel.x * 0.9;
      this.vel.y = this.vel.y * 0.9;
      this.pos.x = x || this.pos.x + this.vel.x * this.napr.x;
      this.pos.y = y || this.pos.y + this.vel.y * this.napr.y;
      createMissile(this.pos.x, this.pos.y, "red");
    }
  }

  function createMissile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 40, 40);
    ctx.fillText(`x: ${x}`, 5, 10);
    ctx.fillText(`y: ${y}`, 5, 20);

    ctx.fillText(`mx: ${mouse.x}`, 200, 10);
    ctx.fillText(`my: ${mouse.y}`, 200, 20);

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.moveTo(x, y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
  }

  function updateMissile() {
    if (missile.pos.x < 0 || missile.pos.x > w - 40)
      missile.napr.x = -1 * missile.napr.x;
    if (missile.pos.y < 0 || missile.pos.y > h - 40)
      missile.napr.y = -1 * missile.napr.y;
    missile.draw();
  }

  function setPos({ layerX, layerY }) {
    [mouse.x, mouse.y] = [layerX, layerY];
  }

  canvas.addEventListener("mousemove", setPos);

  function init() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;

    mouse = { x: 0, y: 0, down: false };
    missile = new Missile();
  }

  function update() {
    updateMissile();
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);

    update();

    window.requestAnimationFrame(loop);
  }

  init();
  loop();
})();
