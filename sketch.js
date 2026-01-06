let handPose;
let video;
let hands = [];

// Sol y luna
let sun;
let moon;
let sunRadius = 70;
let moonRadius = 40;

// Estados
let allowDrag = false;
let alarmActive = false;
let eclipseDone = false;
let showStars = false;

// Sonido
let alarm;
let alarmVolume = 0.1;

// Estrellas
let stars = [];


function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);

  sun = createVector(width / 2, height / 2);
  randomizeMoon();

  alarm = new p5.Oscillator("sine");
  alarm.freq(880);
  alarm.amp(0);
  alarm.start();

  createStars();
}

// ----------------------------

function draw() {
  if (showStars) {
    drawStarSky();
    drawFinalMessage();
    return;
  }

  background(0);

  drawInstruction();
  drawSun();
  drawMoon();

  detectPalm();
  checkEclipse();

  drawCameraPreview();
}



function drawInstruction() {
  fill(255);
  textAlign(CENTER, TOP);
  textSize(18);
  text("Deten todo y crea un eclipse", width / 2, 20);
}



function drawSun() {
  noStroke();
  fill(255);
  circle(sun.x, sun.y, sunRadius * 2);
}


function drawMoon() {
  if (eclipseDone) return;
  noStroke();
  fill(180);
  circle(moon.x, moon.y, moonRadius * 2);
}


function mousePressed() {
  if (eclipseDone) return;

  let d = dist(mouseX, mouseY, moon.x, moon.y);
  if (d < moonRadius) {
    if (!allowDrag) {
      triggerAlarm();
      randomizeMoon();
    }
  }
}

function mouseDragged() {
  if (!allowDrag || eclipseDone) return;

  let d = dist(mouseX, mouseY, moon.x, moon.y);
  if (d < moonRadius + 10) {
    moon.x = mouseX;
    moon.y = mouseY;
  }
}


function checkEclipse() {
  if (eclipseDone) return;

  let d = dist(moon.x, moon.y, sun.x, sun.y);

  if (d < 10 && allowDrag) {
    eclipseDone = true;
    alarm.amp(0, 0.3);

    
    setTimeout(() => {
      showStars = true;
    }, 800);
  }
}



function triggerAlarm() {
  alarmActive = true;
  allowDrag = false;

  alarmVolume = min(alarmVolume + 0.1, 1);
  alarm.amp(alarmVolume, 0.1);
}


function detectPalm() {
  if (!alarmActive) return;
  if (hands.length === 0) return;

  let hand = hands[0];

  if (hand.keypoints && hand.keypoints.length > 15) {
    alarm.amp(0, 0.2);
    alarmActive = false;
    allowDrag = true;
    alarmVolume = 0.1;
  }
}


function createStars() {
  stars = [];
  for (let i = 0; i < 250; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(1, 2.5)
    });
  }
}

function drawStarSky() {
  background(0);

  noStroke();
  fill(255);
  for (let s of stars) {
    circle(s.x, s.y, s.r);
  }
}


function drawFinalMessage() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("completaste un eclipse, ahora disfruta la noche", width / 2, height / 2);
}



function randomizeMoon() {
  moon = createVector(
    random(80, width - 80),
    random(120, height - 80)
  );
}

function drawCameraPreview() {
  if (showStars) return;

  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 20, height - 140, 160, 120);
  pop();
}


function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sun.set(width / 2, height / 2);
  createStars();
}