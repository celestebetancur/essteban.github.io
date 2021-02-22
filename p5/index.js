
var img;
var snBrush;
var iters = 5;
var offset = 125;

function preload() {
  img = loadImage("foto-1076x1076.jpg");
  img.resize(500,500);
}

function setup() {
  let cnv = createCanvas(img.width, img.height);
  background(30,30,30,30);
  snBrush = new SnakeBrush(random(width), random(height), 20, brushShape);
  cnv.parent("p5");
  cnv.position(0,0);
  cnv.style('width','95%');
  cnv.style('left','2.5%');
  cnv.style('height','100%');
  cnv.style('z-index','1');
  cnv.style('object-fit','cover');
}

function draw() {
  if (mouseIsPressed) {
    snBrush.setPos(mouseX, mouseY).updateSegmentsPos().draw();
  } else {
    for (var i = iters; i > 0; --i) {
      snBrush.addToPos(random(-snBrush.step, snBrush.step), random(-snBrush.step, snBrush.step)).updateSegmentsPos().draw();
    }
  }
  fill(150,150,255,0.5);
  stroke(255,255,255,0);
  rect(0,0,img.width,img.height);
  fill(255);
}

function SnakeBrush(x, y, segmentsCount, shapeDrawFn) {
  this.xPos = x;
  this.yPos = y;
  this.wdth = 25;
  this.hght = 10;
  this.scale = 1;
  this.step = 55;
  this.segments = segmentsCount; // number of brush segments
  this.posArr = [];   // position of each segment
  this.dist = 8;      // distance between each segment
  this.strokeWgt = 1.5;
  this.shapeDrawFn = shapeDrawFn;

  for (var i = 0; i < this.segments; i++) {
    this.posArr[i] = createVector(i * this.dist, height / 2);
  }

  this.setPos = function (x, y) {
    this.xPos = constrain(x, 1, width - 5);
    this.yPos = constrain(y, 1, height - 5);

    return this;
  };

  this.addToPos = function (x, y) {
    this.setPos(this.xPos += x, this.yPos += y);

    return this;
  };

  this.updateSegmentsPos = function () {
    this.posArr[0] = createVector(this.xPos, this.yPos);

    for (var itr = 1; itr < this.segments; ++itr) {
      if (p5.Vector.dist(this.posArr[itr], this.posArr[itr - 1]) > this.dist) {
        var tmpVector = p5.Vector.sub(this.posArr[itr - 1], this.posArr[itr]).normalize().mult(this.dist);
        this.posArr[itr] = p5.Vector.sub(this.posArr[itr - 1], tmpVector);
      }
    }

    return this;
  };

  this.draw = function () {
    for (var i = this.segments - 1; i > -1; --i) {
      push();
      fill(getImgColor(img, this.posArr[i].x, this.posArr[i].y, 40));
      translate(this.posArr[i].x, this.posArr[i].y);
      if (i > 0) {
        rotate(atan2(this.posArr[i].y - this.posArr[i - 1].y, this.posArr[i].x - this.posArr[i - 1].x) + HALF_PI);
        stroke(getImgColor(img, this.posArr[i].x + 5, this.posArr[i].y + 5, 230));
        strokeWeight(this.strokeWgt);
        this.shapeDrawFn(-this.wdth / 2, 0, this.wdth, this.hght);
      }
      pop();
    }
  };
}

// you can make any shape you want
function brushShape(xCtr, yCtr, width, height) {
  rect(xCtr, yCtr, width, height); /*line(xCtr, yCtr, width, height);*/
}

function keyTyped() {
  switch (key.toLowerCase()) {
    case 'c': background(30); break;
    case '[': iters -= 3; break;
    case ']': iters += 3; break;
    case 'z': snBrush.step -= 3; break;
    case 'x': snBrush.step += 3; break;
    case 'q': snBrush.scale -= .1; break;
    case 'w': snBrush.scale += .1; break;
  }

  if (~'qw'.indexOf(key.toLowerCase())) {
    snBrush.scale = constrain(snBrush.scale, .1, 20);
    snBrush.step = 50 * snBrush.scale;
    snBrush.wdth = 25 * snBrush.scale;
    snBrush.hght = 10 * snBrush.scale;
    snBrush.dist = 5  * snBrush.scale;
    snBrush.strokeWgt = 1.5 * snBrush.scale;
  }
}

function getImgColor(img, x, y, alpha) {
  if (!img.pixels.length) { img.loadPixels(); }

  x = Math.floor(x || 0);
  y = Math.floor(y || 0);

  if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
    return 0;
  }

  var targetIdx = (y * this.width * 4 + x * 4);

  return img.pixels ? color(img.pixels[targetIdx], img.pixels[targetIdx + 1], img.pixels[targetIdx + 2], alpha || img.pixels[targetIdx + 3]) : 0;
}
