

let o; // mathmatical constnts 
let b;
let p; //"you down with OBP (yeah you know me!)"

const num = 100; //number of points
const tsize = 400; //length of point tails
const waitTime = 35 * 30; //time between each shape (seconds * FPS)
let a = []; // array of points

let poof;

/*to add another shape to the system:
add another variable case to lorenz/constructor,
add another function case to lorenz/calculate,
add 1 to numShapes in newLorenz
add another if else case to newLorenz with the initail contitions s (randomness) and speed (runtime speed)
optional : add another text case to draw
*/
function preload() {
  poof = loadImage("foto-1076x1076.jpg");
}

/*****************************************************************************************************************
 * class that holds the position of each individual point, as well as the trail it leaves behind.
 * 
 * calculate function takes the current position, throws it into some funky math, then you get the delta V.
 * add the deltaV*timestep to the current position and you have the moving point.
 * 
 * the position is recorded to an array length "tsize" then a trail using those positions is drawn once per frame.
 * the trail uses the distance between the current point and the next point to decide how smooth to draw the line.
 * I wanted to make the trail fade to trasparent near the end, but I couldn't figure out an easy way to do that.
 ****************************************************************************************************************/
class lorenz {
  constructor(x, y, z, h, k) {
    this.pos = createVector(x, y, z);
    this.dV = createVector(0, 0, 0);

    this.v1 = createVector(0, 0, 0);
    this.v2 = createVector(0, 0, 0);
    this.prev = [];
    this.prev.push(this.pos.array());
    this.prev.push(this.pos.array());
    this.c = h;
    this.avg = 0;


    this.k = k;

    //initailize variables (variable case)
    switch (k) {
      case 0://lorenz attractor
        o = 10;
        p = 28;
        b = 8 / 3;
        break;
      case 1://chen attractor
        o = 40;
        p = 3;
        b = 28;
        break;
      case 2://chua chaotic attractor
        o = 10.82;
        p = 14.286;
        this.h;
        break;
      case 3://"modified" rossler attractor
        o = 0.1;
        p = 0.1;
        b = 14;
        break;

    }
  }

  /*****************************************************************************
   * runs the functions that make the patterns
   * uses the above constants to control the shape
   * all are accurate to the original functions apart from the rossler attractor
   * that was modified to prevent numbers approacing infinity
   ****************************************************************************/
  calculate(t) {
    switch (this.k) { //function cases
      case 0://lorenz
        this.dV.set(this.pos.x + t * o * (this.pos.y - this.pos.x),
          this.pos.y + t * (this.pos.x * (p - this.pos.z) - this.pos.y),
          this.pos.z + t * ((this.pos.x * this.pos.y) - (b * this.pos.z)));
        break;
      case 1://chen
        this.dV.set((this.pos.x + t * o * (this.pos.y - this.pos.x)),
          this.pos.y + t * ((b - o) * this.pos.x - this.pos.x * this.pos.z + b * this.pos.y),
          this.pos.z + t * ((this.pos.x * this.pos.y) - (p * this.pos.z)));
        break;
      case 2://chua
        this.h = -0.11 * sin((PI * this.pos.x) / 2.6);
        this.dV.set((this.pos.x + t * (o * (this.pos.y - this.h))),
          this.pos.y + t * (this.pos.x - this.pos.y + this.pos.z),
          this.pos.z + t * (-p * this.pos.y));
        break;
      case 3://rossler
        this.dV.set(this.pos.x + t * ((-this.pos.y - pow(o * this.pos.z, 2))),
          this.pos.y + t * (this.pos.x + (o * this.pos.y)),
          this.pos.z + t * (p + this.pos.z * (this.pos.x - b)));
        break;
    }
    this.pos.set(this.dV);
  }


  /****************************
   * draws the points and tails 
   ***************************/
  draw() {
    this.prev.push(this.pos.array()); //array of tail vectors
    if (this.prev.length > tsize) {
      this.prev.splice(0, 1);
    }

    //calculates the color of the trail based on the speed of the point
    let G;
    let R = 1;
    this.v1.set(createVector(this.prev[this.prev.length - 1][0], this.prev[this.prev.length - 1][1], this.prev[this.prev.length - 1][2]));
    this.v2.set(createVector(this.prev[this.prev.length - 2][0], this.prev[this.prev.length - 2][1], this.prev[this.prev.length - 2][2]));
    this.mod = p5.Vector.sub(this.v1, this.v2);
    G = this.mod.mag();
    stroke(this.c, 100, G * 50 + 0);


    //draws the tail
    //uses the distance/speed between points to determine how detailed the trail should be
    beginShape();
    vertex(this.prev[this.prev.length - 1][0], this.prev[this.prev.length - 1][1], this.prev[this.prev.length - 1][2]);
    for (let i = this.prev.length - 2; i >= 0; i -= R) {

      this.v1 = createVector(this.prev[i][0], this.prev[i][1], this.prev[i][2]);
      this.v2 = createVector(this.prev[i + 1][0], this.prev[i + 1][1], this.prev[i + 1][2]);
      this.mod = p5.Vector.sub(this.v1, this.v2);
      G = this.mod.mag();
      R = constrain((round(5 / (G + 1))), 1, tsize / 2);

      vertex(this.prev[i][0], this.prev[i][1], this.prev[i][2]);
    }
    vertex(this.prev[0][0], this.prev[0][1], this.prev[0][2]);
    endShape();

    //yes the point at the front is a sphere
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(0.5, 3, 3);
    pop();
  }

}


/************************************
 * adds subtle glow to the background
 ***********************************/
function glow() {
  tint(C, 100, 50, constrain(sqrt(time / tsize), 0, 1) * 50);
  image(poof, -127, -127, 255, 255);
  pop();
}

let C;
/*******************************************
 * creates and sets up a new attractor shape
 ******************************************/
function newLorenz(A) {
  let numShapes = 4;

  A = (A + 1) % numShapes; //iterates next attractor

  let s = 1;//randomness
  let x = 1;//direction specific randomness
  let y = 1;
  let z = 1;

  //remove previous attractor
  while (a.length > 0) {
    a.pop();
  }

  //setup initial variables
  if (A == 0) {
    s = 20;
    sspeed = 0.0005;
  } else if (A == 1) {
    s = 1;
    sspeed = 0.0005;
  } else if (A == 2) {
    s = 0.01;
    sspeed = 0.01;
  } else if (A == 3) {
    s = 1;
    x = 20;
    y = 20;
    z = 0;
    sspeed = 0.002;
  }

  //make new attractor with randomized colors
  // Blue palette: Hue 55-75 in HSL(100)
  C = random(55, 75);
  for (let i = 0; i < num; i++) {
    a.push(new lorenz(random(x * s, x * -s), random(y * s, y * -s), random(z * s, z * -s), abs(randomGaussian(C, 5)) % 100, A));
  }
  return (A);
}


/*******************************************
 * controls the smooth rotation of the shape
 ******************************************/
let mx;
let mv;
function orbit() {
  if (mouseIsPressed) {
    mv.add((mouseX - pmouseX) / 1000, (pmouseY - mouseY) / 1000);
  }
  mv.mult(0.9);
  mx.add(mv);
  rotateX(mx.y);
  rotateY(mx.x);
}

function setup() {
  mx = createVector(0, 0);
  mv = createVector(0, 0);

  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);

  // -- Integration Code --
  cnv.parent("p5-container");
  cnv.style('width', '100%');
  cnv.style('height', '100%');
  cnv.style('z-index', '-2');
  cnv.style('position', 'absolute');
  cnv.style('top', '0');
  cnv.style('left', '0');
  // ---------------------

  strokeWeight(1);
  noFill();

  background(0);
  perspective(PI / 4, width / height, 1, 1000);
  colorMode(HSL, 100);
  blendMode(ADD);
  camera(0, 0, 150);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

let time = waitTime + 1;
let aType = -1;
let sspeed;

function draw() {
  if (time > waitTime) {
    time = 0;
    aType = newLorenz(aType);
  }
  time++;
  frameRate(30);

  background(0);
  fill(0, 100, 100);

  push();
  translate(0, 0, -100);

  glow();
  orbit();
  noFill();

  push();
  translate(0, 0, -20);
  for (let x = 0; x < num; x++) {
    for (let i = 0; i < 10; i++) {

      a[x].calculate(sspeed);

    }
    //a[x].glow();
    a[x].draw();

  }
  pop();
}


function keyPressed() {
  time = waitTime;
}


