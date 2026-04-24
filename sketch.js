/* =========================
   HERO PIXEL BACKGROUND
   + LOGO BRAIN SKETCH
   + BLEND SLIDER
   + SMALL INGREDIENT VISUALS
   + EXPANDED MODAL VISUALS
========================= */



const heroOutlineSketch = (p) => {
  let outlineImgs = [];
  let slides = [];
  let activeSlide = 0;
  let slideStartTime = 0;

  let fittedImg;
  let walkers = [];
  let visited = [];
  let targetPixels = 0;
  let drawnPixels = 0;

  let finished = false;
  let holdFrames = 0;

  const COVER_SCALE = 1.1;
  const OFFSET_X = -40;
  const OFFSET_Y = -50;

  const WALKER_COUNT = 60;
  const STEP_SIZE = 6;
  const SNAP_SIZE = 6;
  const STROKE_WEIGHT = 4;
  const BRIGHT_THRESHOLD = 205;
  const TARGET_PERCENT = 0.9;
  const HOLD_AFTER_FINISH = 200;
  const MAX_SLIDE_TIME = 20000; // 20 seconds
  
  

  p.preload = () => {
    outlineImgs = [
      p.loadImage("chamomile outline white 5pt.png"),
      p.loadImage("green trea outline 5 pt.png"),
      p.loadImage("black tea white outline 5 pt.png")
    ];
  };

  p.setup = () => {
    const hero = document.getElementById("hero");
    const container = document.getElementById("hero-outline-sketch");

    const c = p.createCanvas(hero.offsetWidth, hero.offsetHeight);
    c.parent(container);

    p.pixelDensity(1);
    p.clear();
    p.stroke(255);
    p.strokeWeight(STROKE_WEIGHT);

    slides = Array.from(document.querySelectorAll("#hero-slideshow .bg-slide"));
    showSlide(activeSlide);
    rebuildTarget();
    slideStartTime = p.millis();;
  };

p.draw = () => {
  if (!fittedImg) return;

  const elapsed = p.millis() - slideStartTime;

  if (!finished) {
    for (let w = 0; w < walkers.length; w++) {
      runWalker(walkers[w]);
    }

    const progress = targetPixels > 0 ? drawnPixels / targetPixels : 0;

    if (progress >= TARGET_PERCENT || elapsed >= MAX_SLIDE_TIME) {
      finished = true;
      holdFrames = 0;
    }
  } else {
    holdFrames++;

    if (holdFrames > HOLD_AFTER_FINISH || elapsed >= MAX_SLIDE_TIME + 500) {
      nextSlide();
    }
  }
};

  p.windowResized = () => {
    const hero = document.getElementById("hero");
    p.resizeCanvas(hero.offsetWidth, hero.offsetHeight);
    p.clear();
    rebuildTarget();
  };

  function nextSlide() {
    activeSlide = (activeSlide + 1) % slides.length;
    showSlide(activeSlide);
    p.clear();
    rebuildTarget();
    slideStartTime = p.millis();
  }

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  function rebuildTarget() {
    fittedImg = buildCoverImage(outlineImgs[activeSlide], p.width, p.height);
    fittedImg.loadPixels();

    visited = Array.from({ length: p.width }, () => Array(p.height).fill(false));
    walkers = [];
    targetPixels = 0;
    drawnPixels = 0;
    finished = false;
    holdFrames = 0;

    for (let y = 0; y < p.height; y += SNAP_SIZE) {
    for (let x = 0; x < p.width; x += SNAP_SIZE) {
      const idx = (x + y * fittedImg.width) * 4;
      const r = fittedImg.pixels[idx];
      const g = fittedImg.pixels[idx + 1];
      const b = fittedImg.pixels[idx + 2];
      const a = fittedImg.pixels[idx + 3];
      const bright = (r + g + b) / 3;

      if (a > 10 && bright > BRIGHT_THRESHOLD) {
        targetPixels++;
      }
  }
}

    for (let i = 0; i < WALKER_COUNT; i++) {
      walkers.push(makeWalkerNearBrightPixel());
    }
  }

  function makeWalkerNearBrightPixel() {
    for (let tries = 0; tries < 4000; tries++) {
      const x = Math.floor(p.random(p.width));
      const y = Math.floor(p.random(p.height));
      if (isBrightAt(x, y)) return { x, y };
    }

    return { x: p.width / 2, y: p.height / 2 };
  }

  function runWalker(walker) {
    for (let i = 0; i < 24; i++) {
      let nx = walker.x + p.random(-STEP_SIZE, STEP_SIZE);
      let ny = walker.y + p.random(-STEP_SIZE, STEP_SIZE);

      nx = p.constrain(nx, 1, p.width - 2);
      ny = p.constrain(ny, 1, p.height - 2);

      const currentEdge = edgeStrength(Math.floor(walker.x), Math.floor(walker.y));
      const newEdge = edgeStrength(Math.floor(nx), Math.floor(ny));

      if (newEdge > currentEdge + 5 || p.random() < 0.15) {
        walker.x = nx;
        walker.y = ny;

        const px = p.constrain(Math.round(walker.x / SNAP_SIZE) * SNAP_SIZE, 0, p.width - 1);
        const py = p.constrain(Math.round(walker.y / SNAP_SIZE) * SNAP_SIZE, 0, p.height - 1);

        if (isBrightAt(px, py) && !visited[px][py]) {
          visited[px][py] = true;
          drawnPixels++;

          if (p.random() < 0.4) {
            p.point(px, py);
          }
        }
      }
    }
  }

  function isBrightAt(x, y) {
    const idx = (x + y * fittedImg.width) * 4;
    const r = fittedImg.pixels[idx];
    const g = fittedImg.pixels[idx + 1];
    const b = fittedImg.pixels[idx + 2];
    const a = fittedImg.pixels[idx + 3];
    const bright = (r + g + b) / 3;

    return a > 10 && bright > BRIGHT_THRESHOLD;
  }

  function edgeStrength(px, py) {
    const safeX = p.constrain(px, 0, fittedImg.width - 3);
    const safeY = p.constrain(py, 0, fittedImg.height - 3);

    const i = (safeX + safeY * fittedImg.width) * 4;
    const b = brightnessAt(i);

    const iRight = (safeX + 2 + safeY * fittedImg.width) * 4;
    const iDown = (safeX + (safeY + 2) * fittedImg.width) * 4;

    return Math.abs(b - brightnessAt(iRight)) + Math.abs(b - brightnessAt(iDown));
  }

  function brightnessAt(i) {
    i = p.constrain(i, 0, fittedImg.pixels.length - 4);
    return (fittedImg.pixels[i] + fittedImg.pixels[i + 1] + fittedImg.pixels[i + 2]) / 3;
  }

 function buildCoverImage(sourceImg, targetW, targetH) {
  const g = p.createGraphics(targetW, targetH);
  g.clear();

  const imgRatio = sourceImg.width / sourceImg.height;
  const canvasRatio = targetW / targetH;

  let drawW, drawH, offsetX, offsetY;

  if (imgRatio > canvasRatio) {
    drawH = targetH;
    drawW = drawH * imgRatio;
    offsetX = (targetW - drawW) / 2;
    offsetY = 0;
  } else {
    drawW = targetW;
    drawH = drawW / imgRatio;
    offsetX = 0;
    offsetY = (targetH - drawH) / 2;
  }

  drawW *= COVER_SCALE;
  drawH *= COVER_SCALE;

  offsetX = (targetW - drawW) / 2 + OFFSET_X;
  offsetY = (targetH - drawH) / 2 + OFFSET_Y;

  g.image(sourceImg, offsetX, offsetY, drawW, drawH);
  return g;
}
};

new p5(heroOutlineSketch);

/* =========================
   LOGO / BRAIN SKETCH
========================= */

const logoBrainSketch = (p) => {
  let img;
  let x, y;

  p.preload = () => {
    img = p.loadImage("brain - 6pt stroke.png");
  };

  p.setup = () => {
    const maxW = 400;
    const scaleFactor = Math.min(1, maxW / img.width);
    img.resize(img.width * scaleFactor, 0);

    const c = p.createCanvas(img.width, img.height);
    c.parent("sketch-container");

    p.clear();
    img.loadPixels();

    x = p.width / 2;
    y = p.height / 2;

    p.strokeWeight(3);
  };

  p.draw = () => {
    for (let i = 0; i < 350; i++) {
      let nx = x + p.random(-6, 6);
      let ny = y + p.random(-6, 6);

      nx = p.constrain(nx, 1, p.width - 2);
      ny = p.constrain(ny, 1, p.height - 2);

      const currentEdge = edgeStrength(Math.floor(x), Math.floor(y));
      const newEdge = edgeStrength(Math.floor(nx), Math.floor(ny));

      if (newEdge > currentEdge + 5 || p.random() < 0.15) {
        x = nx;
        y = ny;

        const iPixel = (Math.floor(x) + Math.floor(y) * img.width) * 4;
        const bright = brightnessAt(iPixel);

        if (bright > 205) {
          p.stroke(255);

          const px = Math.round(x / 4) * 4;
          const py = Math.round(y / 4) * 4;

          if (p.random() < 0.4) {
            p.point(px, py);
          }
        }
      }
    }
  };

  function edgeStrength(px, py) {
    const safeX = p.constrain(px, 0, img.width - 3);
    const safeY = p.constrain(py, 0, img.height - 3);

    const i = (safeX + safeY * img.width) * 4;
    const b = brightnessAt(i);

    const iRight = (safeX + 2 + safeY * img.width) * 4;
    const iDown = (safeX + (safeY + 2) * img.width) * 4;

    return Math.abs(b - brightnessAt(iRight)) + Math.abs(b - brightnessAt(iDown));
  }

  function brightnessAt(i) {
    i = p.constrain(i, 0, img.pixels.length - 4);
    return (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
  }
};

new p5(logoBrainSketch);

/* =========================
   COLOR SYSTEM
========================= */

const blendColors = {
  relaxation: "#a67c3b",
  focus: "#b7c8b1",
  energy: "#ff8c3c"
};

function setModalTheme(blendKey) {
  if (!modalPanel) return;

  const color = getBlendRgb(blendKey);

  modalPanel.style.setProperty("--modal-rgb", `${color.r}, ${color.g}, ${color.b}`);
  modalPanel.style.setProperty("--canvas-rgb", `${color.r}, ${color.g}, ${color.b}`);
}

const relaxationPicker = document.getElementById("relaxation-color");
const focusPicker = document.getElementById("focus-color");
const energyPicker = document.getElementById("energy-color");

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

function getBlendRgb(key) {
  return hexToRgb(blendColors[key]);
}

if (relaxationPicker) {
  relaxationPicker.addEventListener("input", (e) => {
    blendColors.relaxation = e.target.value;
  });
}

if (focusPicker) {
  focusPicker.addEventListener("input", (e) => {
    blendColors.focus = e.target.value;
  });
}

if (energyPicker) {
  energyPicker.addEventListener("input", (e) => {
    blendColors.energy = e.target.value;
  });
}

/* =========================
   BLEND SLIDER
========================= */

const blendSlides = Array.from(document.querySelectorAll(".blend-slide"));
const prevBlendBtn = document.getElementById("blend-prev");
const nextBlendBtn = document.getElementById("blend-next");

let activeBlendIndex = 0;

function renderBlendSlider() {
  if (!blendSlides.length) return;

  const total = blendSlides.length;

  blendSlides.forEach((slide, i) => {
    slide.classList.remove("is-active", "is-left", "is-right", "is-hidden");

    const prevIndex = (activeBlendIndex - 1 + total) % total;
    const nextIndex = (activeBlendIndex + 1) % total;

    if (i === activeBlendIndex) {
      slide.classList.add("is-active");
    } else if (i === prevIndex) {
      slide.classList.add("is-left");
    } else if (i === nextIndex) {
      slide.classList.add("is-right");
    } else {
      slide.classList.add("is-hidden");
    }
  });
}

if (prevBlendBtn && nextBlendBtn && blendSlides.length) {
  prevBlendBtn.addEventListener("click", () => {
    activeBlendIndex =
      (activeBlendIndex - 1 + blendSlides.length) % blendSlides.length;
    renderBlendSlider();
  });

  nextBlendBtn.addEventListener("click", () => {
    activeBlendIndex = (activeBlendIndex + 1) % blendSlides.length;
    renderBlendSlider();
  });

  renderBlendSlider();
}



/* =========================
   SMALL INGREDIENT VISUALS
========================= */

function initIngredientVisuals() {
  if (typeof p5 === "undefined") return;

  createApigeninViz("viz-apigenin");
  createTheanineViz("viz-theanine");
  createCaffeineViz("viz-caffeine");
}

function getVizSize(container) {
  return {
    w: container.offsetWidth || 280,
    h: container.offsetHeight || 170
  };
}

function createApigeninViz(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  new p5((p) => {
    let w, h;
    let neurons = [];
    let particles = [];
    let links = [];

    function setupScene() {
      neurons = [
        { x: w * 0.24, y: h * 0.52, r: 12, phase: p.random(1000) },
        { x: w * 0.50, y: h * 0.34, r: 11, phase: p.random(1000) },
        { x: w * 0.76, y: h * 0.56, r: 12, phase: p.random(1000) }
      ];

      links = [
        [0, 1, -10],
        [1, 2, 12],
        [0, 2, 6]
      ];

      particles = [];
      for (let i = 0; i < 16; i++) {
        particles.push({
          x: p.random(w * 0.08, w * 0.92),
          y: p.random(-40, h),
          speed: p.random(0.25, 0.7),
          size: p.random(2.2, 4.2),
          wobble: p.random(1000),
          targetNeuron: p.floor(p.random(neurons.length)),
          targetReceptor: p.floor(p.random(4)),
          attached: false,
          alpha: p.random(80, 140)
        });
      }
    }

    function drawDottedBezier(ax, ay, bx, by, bend, alpha, size, spacing) {
      const cx1 = p.lerp(ax, bx, 0.35);
      const cy1 = ay + bend;
      const cx2 = p.lerp(ax, bx, 0.65);
      const cy2 = by + bend;

      for (let t = 0; t <= 1; t += spacing) {
        const x = p.bezierPoint(ax, cx1, cx2, bx, t);
        const y = p.bezierPoint(ay, cy1, cy2, by, t);

        p.noStroke();
        p.fill(255, 248, 236, alpha);
        p.circle(x, y, size);
      }
    }

    function receptorPos(neuron, index, timeOffset = 0) {
      const angle = (p.TWO_PI / 4) * index - p.HALF_PI + timeOffset;
      const orbitR = 22;
      return {
        x: neuron.x + Math.cos(angle) * orbitR,
        y: neuron.y + Math.sin(angle) * orbitR,
        angle
      };
    }

    p.setup = () => {
      ({ w, h } = getVizSize(container));
      const c = p.createCanvas(w, h);
      c.parent(container);
      setupScene();
    };

    p.windowResized = () => {
      ({ w, h } = getVizSize(container));
      p.resizeCanvas(w, h);
      setupScene();
    };

    p.draw = () => {
      p.clear();
      const color = getBlendRgb("relaxation");
      const t = p.frameCount * 0.02;

      // soft calm field
      p.noStroke();
      p.fill(color.r, color.g, color.b, 12);
      p.ellipse(w * 0.5, h * 0.5, w * 0.72, h * 0.52);

      // quieter dotted network
      links.forEach(([aIndex, bIndex, bend]) => {
        const a = neurons[aIndex];
        const b = neurons[bIndex];
        drawDottedBezier(a.x, a.y, b.x, b.y, bend, 52, 2.1, 0.09);
      });

      // slow calming wave behind
      p.noFill();
      p.stroke(255, 248, 236, 36);
      p.strokeWeight(1);
      p.beginShape();
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.72 + Math.sin(x * 0.02 + t * 1.4) * 4;
        p.vertex(x, y);
      }
      p.endShape();

      // apigenin particles docking to receptors
      particles.forEach((pt) => {
        const neuron = neurons[pt.targetNeuron];
        const receptor = receptorPos(neuron, pt.targetReceptor, t * 0.25);

        if (!pt.attached) {
          pt.y += pt.speed;
          pt.x += Math.sin(t + pt.wobble) * 0.35;

          const d = p.dist(pt.x, pt.y, receptor.x, receptor.y);
          if (d < 18) pt.attached = true;

          if (pt.y > h + 20) {
            pt.x = p.random(w * 0.08, w * 0.92);
            pt.y = -p.random(20, 100);
            pt.targetNeuron = p.floor(p.random(neurons.length));
            pt.targetReceptor = p.floor(p.random(4));
            pt.attached = false;
            pt.alpha = p.random(80, 140);
          }
        } else {
          pt.x = p.lerp(pt.x, receptor.x, 0.08);
          pt.y = p.lerp(pt.y, receptor.y, 0.08);
          pt.alpha = 110 + Math.sin(t * 2 + pt.wobble) * 20;
        }

        p.noStroke();
        p.fill(color.r, color.g, color.b, pt.alpha * 0.18);
        p.circle(pt.x, pt.y, pt.size * 4.2);

        p.fill(255, 252, 244, pt.alpha);
        p.circle(pt.x, pt.y, pt.size);

        p.fill(color.r, color.g, color.b, pt.alpha * 0.75);
        p.circle(pt.x, pt.y, pt.size * 0.45);
      });

      // neurons + receptor sites
      neurons.forEach((n, i) => {
        const pulse = 1 + Math.sin(t * 1.8 + i * 0.8) * 0.04;

        for (let r = 0; r < 4; r++) {
          const rp = receptorPos(n, r, t * 0.25);

          p.noStroke();
          p.fill(color.r, color.g, color.b, 22);
          p.circle(rp.x, rp.y, 12);

          p.stroke(95, 70, 28, 150);
          p.strokeWeight(1.2);
          p.noFill();
          p.circle(rp.x, rp.y, 7);

          p.noStroke();
          p.fill(255, 248, 236, 90);
          p.circle(rp.x, rp.y, 2.5);
        }

        p.noStroke();
        p.fill(color.r, color.g, color.b, 22);
        p.circle(n.x, n.y, 54 * pulse);

        p.fill(130, 96, 40, 120);
        p.circle(n.x, n.y, 18 * pulse);

        p.fill(255, 248, 236, 195);
        p.circle(n.x, n.y, 7.5 * pulse);

        p.fill(color.r, color.g, color.b, 215);
        p.circle(n.x, n.y, 3.5 * pulse);
      });
    };
  });
}

function createTheanineViz(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  new p5((p) => {
    let w, h;
    let neurons = [];
    let packets = [];
    let waves = [];

    function setupScene() {
      neurons = [
        { x: w * 0.26, y: h * 0.34, phase: p.random(1000), size: 1.05 },
        { x: w * 0.36, y: h * 0.64, phase: p.random(1000), size: 0.9 },
        { x: w * 0.57, y: h * 0.62, phase: p.random(1000), size: 0.95 },
        { x: w * 0.64, y: h * 0.32, phase: p.random(1000), size: 0.82 },
        { x: w * 0.82, y: h * 0.31, phase: p.random(1000), size: 1.0 },
        { x: w * 0.85, y: h * 0.54, phase: p.random(1000), size: 0.86 }
      ];

      packets = [
        { a: 0, b: 1, offset: 0.00, speed: 0.006 },
        { a: 1, b: 2, offset: 0.18, speed: 0.0055 },
        { a: 2, b: 3, offset: 0.35, speed: 0.005 },
        { a: 3, b: 4, offset: 0.52, speed: 0.0065 },
        { a: 3, b: 5, offset: 0.72, speed: 0.0058 },
        { a: 2, b: 5, offset: 0.88, speed: 0.0052 }
      ];

      waves = [
        { y: h * 0.46, amp: 5, freq: 0.022, speed: 0.032, alpha: 18 },
        { y: h * 0.58, amp: 4, freq: 0.018, speed: 0.026, alpha: 12 }
      ];
    }

    function drawDottedBezier(ax, ay, bx, by, bend, alpha, size, spacing) {
      const cx1 = p.lerp(ax, bx, 0.35);
      const cy1 = ay + bend;
      const cx2 = p.lerp(ax, bx, 0.65);
      const cy2 = by + bend;

      for (let t = 0; t <= 1; t += spacing) {
        const x = p.bezierPoint(ax, cx1, cx2, bx, t);
        const y = p.bezierPoint(ay, cy1, cy2, by, t);

        p.noStroke();
        p.fill(245, 247, 242, alpha);
        p.circle(x, y, size);
      }
    }

    p.setup = () => {
      ({ w, h } = getVizSize(container));
      const c = p.createCanvas(w, h);
      c.parent(container);
      setupScene();
    };

    p.windowResized = () => {
      ({ w, h } = getVizSize(container));
      p.resizeCanvas(w, h);
      setupScene();
    };

    p.draw = () => {
      p.clear();
      const color = getBlendRgb("focus");
      const t = p.frameCount * 0.02;

      // soft atmospheric haze
      for (let i = 0; i < 4; i++) {
        const fogX = w * (0.18 + i * 0.2) + Math.sin(t + i * 0.8) * 10;
        const fogY = h * (0.28 + (i % 2) * 0.22);
        p.noStroke();
        p.fill(color.r, color.g, color.b, 10);
        p.ellipse(fogX, fogY, 90 + i * 15, 46 + i * 8);
      }

      // subtle alpha-wave bands
      waves.forEach((wave, i) => {
        p.noFill();
        p.stroke(245, 247, 242, wave.alpha);
        p.strokeWeight(1);

        p.beginShape();
        for (let x = -10; x <= w + 10; x += 8) {
          const y =
            wave.y +
            Math.sin(x * wave.freq + t * (wave.speed * 10) + i * 1.7) * wave.amp;
          p.vertex(x, y);
        }
        p.endShape();
      });

      // network lines
      const connections = [
        [0, 1, 16],
        [0, 2, 6],
        [1, 2, 9],
        [2, 3, -15],
        [3, 4, -5],
        [3, 5, 12],
        [2, 5, 6]
      ];

      connections.forEach(([aIndex, bIndex, bend]) => {
        const a = neurons[aIndex];
        const b = neurons[bIndex];

        const ax = a.x + Math.sin(t + a.phase) * 2.5;
        const ay = a.y + Math.cos(t * 1.1 + a.phase) * 1.8;
        const bx = b.x + Math.sin(t + b.phase) * 2.5;
        const by = b.y + Math.cos(t * 1.1 + b.phase) * 1.8;

        drawDottedBezier(ax, ay, bx, by, bend, 140, 3.2, 0.07);
      });

      // moving signal packets
      packets.forEach((packet) => {
        const a = neurons[packet.a];
        const b = neurons[packet.b];

        const prog = (t * (packet.speed * 40) + packet.offset) % 1;
        const x = p.lerp(a.x, b.x, prog);
        const y = p.lerp(a.y, b.y, prog);

        p.noStroke();
        p.fill(color.r, color.g, color.b, 30);
        p.circle(x, y, 15);

        p.fill(245, 247, 242, 150);
        p.circle(x, y, 4.5);

        p.fill(color.r, color.g, color.b, 210);
        p.circle(x, y, 2.2);
      });

      // neurons
      neurons.forEach((n, i) => {
        const pulse = 1 + Math.sin(t * 2.4 + i * 0.8) * 0.08;
        const x = n.x + Math.sin(t + n.phase) * 2.5;
        const y = n.y + Math.cos(t * 1.1 + n.phase) * 1.8;

        // OUTER GLOW (bigger + stronger)
        p.noStroke();
        p.fill(color.r, color.g, color.b, 28);
        p.circle(x, y, 90 * n.size * pulse);

        // MID GLOW (white haze)
        p.fill(245, 247, 242, 28);
        p.circle(x, y, 60 * n.size * pulse);

        // CORE (this is what makes it readable)
        p.fill(255, 255, 255, 220);
        p.circle(x, y, 16 * n.size * pulse);

        // INNER COLOR CORE (gives identity)
        p.fill(color.r, color.g, color.b, 220);
        p.circle(x, y, 8 * n.size * pulse);
      });
    };
  });
}

function createCaffeineViz(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  new p5((p) => {
    let w, h;
    let sparks = [];
    let columns = [];

    function seedScene() {
      sparks = [];
      columns = [];

      for (let i = 0; i < 7; i++) {
        columns.push({
          x: p.map(i, 0, 6, w * 0.16, w * 0.84),
          phase: p.random(1000)
        });
      }

      for (let i = 0; i < 24; i++) {
        sparks.push({
          x: p.random(w * 0.12, w * 0.88),
          y: p.random(h * 0.28, h * 0.84),
          speed: p.random(0.8, 2),
          size: p.random(1.8, 4),
          drift: p.random(1000)
        });
      }
    }

    p.setup = () => {
      ({ w, h } = getVizSize(container));
      const c = p.createCanvas(w, h);
      c.parent(container);
      seedScene();
    };

    p.windowResized = () => {
      ({ w, h } = getVizSize(container));
      p.resizeCanvas(w, h);
      seedScene();
    };

    p.draw = () => {
      p.clear();
      const color = getBlendRgb("energy");
      const t = p.frameCount * 0.035;

      // activation columns
      columns.forEach((col, i) => {
        const pulse = (Math.sin(t * 2 + i * 0.6) + 1) * 0.5;
        const top = h * (0.55 - pulse * 0.2);

        p.drawingContext.setLineDash([1.5, 7]);
        p.stroke(255, 255, 255, 72 + pulse * 36);
        p.strokeWeight(1.4);
        p.line(col.x, h * 0.82, col.x, top);
      });
      p.drawingContext.setLineDash([]);

      // alertness wave
      p.noFill();
      p.stroke(255, 255, 255, 105);
      p.strokeWeight(1.15);
      p.beginShape();
      for (let x = 0; x <= w; x += 7) {
        const y = h * 0.72 + Math.sin(x * 0.042 + t * 4.5) * 6;
        p.vertex(x, y);
      }
      p.endShape();

      // upward sparks
      sparks.forEach((s) => {
        s.y -= s.speed;
        s.x += Math.sin(t + s.drift) * 0.4;

        if (s.y < h * 0.18) {
          s.y = p.random(h * 0.65, h * 0.84);
          s.x = p.random(w * 0.12, w * 0.88);
        }

        p.noStroke();
        p.fill(color.r, color.g, color.b, 34);
        p.circle(s.x, s.y, s.size * 3.2);

        p.fill(255, 255, 255, 170);
        p.circle(s.x, s.y, s.size * 1.05);

        p.fill(color.r, color.g, color.b, 220);
        p.circle(s.x, s.y, s.size * 0.55);
      });
    };
  });
}

/* =========================
   EXPANDED MODAL VISUALS
========================= */

const blendModal = document.getElementById("blend-modal");
const modalTitle = document.getElementById("modal-title");
const modalKicker = document.getElementById("modal-kicker");
const modalDescription = document.getElementById("modal-description");
const modalDots = document.getElementById("modal-dots");
const modalStageLabel = document.getElementById("modal-stage-label");
const modalCanvasContainer = document.getElementById("modal-canvas-container");
const blendTriggers = Array.from(document.querySelectorAll(".blend-trigger"));
const modalPanel = document.querySelector(".blend-modal-panel");
const modalCloseBtn = document.getElementById("modal-close-btn");

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeBlendModal);
}

let expandedSketch = null;
let expandedBlendKey = null;
let expandedPhase = 0;

const BLEND_DATA = {
  relaxation: {
    title: "relaxation",
    kicker: "apigenin",
    description:
      "As apigenin docks at receptor sites, inhibitory signals become more effective, guiding the system from heightened activity toward a quieter, more settled state.",
    phases: ["active", "binding", "calm"]
  },
  focus: {
    title: "focus",
    kicker: "l-theanine",
    description:
      "supports relaxed focus by steadying excitatory signaling, increasing neural steadiness, and shifting activity toward alpha-wave associated calm attention.",
    phases: [
      "baseline signaling",
      "drinking",
      "post-tea"
    ]
  },
 energy: {
    title: "energy",
    kicker: "caffeine",
    description:
      "Caffeine is visualized here as blocking adenosine receptors, reducing the brain’s normal fatigue signaling and allowing alertness-related activity to remain elevated.",
    phases: ["baseline", "binding", "alert"]
  }
};

function openBlendModal(blendKey) {
  const data = BLEND_DATA[blendKey];
  if (!data || !blendModal) return;

  expandedBlendKey = blendKey;
  expandedPhase = 0;

  modalTitle.textContent = data.title;
  modalKicker.textContent = data.kicker;
  modalDescription.textContent = data.description;

  setModalTheme(blendKey);
  renderModalControls(data.phases);
  createExpandedSketch(blendKey);

  blendModal.classList.add("is-open");
  blendModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeBlendModal() {
  if (!blendModal) return;

  blendModal.classList.remove("is-open");
  blendModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (expandedSketch) {
    expandedSketch.remove();
    expandedSketch = null;
  }

  if (modalCanvasContainer) {
    modalCanvasContainer.innerHTML = "";
  }

  if (modalPanel) {
  modalPanel.addEventListener("dblclick", closeBlendModal);
}
}

function renderModalControls(phases) {
  if (!modalDots || !modalStageLabel) return;

  modalDots.innerHTML = "";
  modalStageLabel.textContent = phases[0] || "";

  phases.forEach((label, i) => {
    const dot = document.createElement("button");
    dot.className = "blend-phase-dot" + (i === 0 ? " is-active" : "");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to stage: ${label}`);

    dot.addEventListener("click", () => {
      expandedPhase = i;

      modalDots
        .querySelectorAll(".blend-phase-dot")
        .forEach((d, idx) => d.classList.toggle("is-active", idx === i));

      modalStageLabel.textContent = label;
    });

    modalDots.appendChild(dot);
  });
}

function createExpandedSketch(blendKey) {
  if (!modalCanvasContainer || typeof p5 === "undefined") return;

  modalCanvasContainer.innerHTML = "";

  if (expandedSketch) {
    expandedSketch.remove();
    expandedSketch = null;
  }

  if (blendKey === "relaxation") expandedSketch = new p5(relaxationExpandedSketch);
  if (blendKey === "focus") expandedSketch = new p5(focusExpandedSketch);
  if (blendKey === "energy") expandedSketch = new p5(energyExpandedSketch);
}

/* ---------- relaxation expanded ---------- */
const relaxationExpandedSketch = (p) => {
  let w, h;
  let neurons = [];
  let apigeninParticles = [];
  let inhibitoryPackets = [];
  let inhibitoryWaves = [];

  class RelaxNeuron {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseR = 13;
      this.r = this.baseR;
      this.activity = p.random(0.45, 0.85);
      this.fireTimer = p.random(120);
      this.fireRate = p.random(24, 44);
      this.connections = [];
      this.excPulses = [];
      this.receptors = [];

      const receptorCount = 4;
      for (let i = 0; i < receptorCount; i++) {
        this.receptors.push({
          angle: (p.TWO_PI / receptorCount) * i + p.random(-0.22, 0.22),
          orbitR: p.random(28, 38),
          bound: 0,
          gated: 0
        });
      }
    }

    getBoundLevel() {
      let total = 0;
      for (let r of this.receptors) total += r.bound;
      return total / this.receptors.length;
    }

    update() {
      const boundLevel = this.getBoundLevel();
      this.fireTimer++;

      if (expandedPhase === 0) {
        if (this.fireTimer > this.fireRate) {
          this.activity = 1;
          this.fireTimer = 0;

          for (let c of this.connections) {
            this.excPulses.push({
              target: c,
              progress: 0,
              strength: 1
            });
          }
        }
      } else if (expandedPhase === 1) {
        const slowedRate = this.fireRate * (1.3 + boundLevel * 1.1);
        if (this.fireTimer > slowedRate) {
          this.activity = 0.65 - boundLevel * 0.16;
          this.fireTimer = 0;

          for (let c of this.connections) {
            if (p.random() > 0.34 + boundLevel * 0.22) {
              this.excPulses.push({
                target: c,
                progress: 0,
                strength: 0.58 - boundLevel * 0.16
              });
            }
          }
        }
      } else {
        const calmRate = this.fireRate * (2.2 + boundLevel * 1.5);
        if (this.fireTimer > calmRate) {
          this.activity = 0.22 + (1 - boundLevel) * 0.08;
          this.fireTimer = 0;

          if (p.random() > 0.86) {
            const c = this.connections[p.floor(p.random(this.connections.length))];
            if (c) {
              this.excPulses.push({
                target: c,
                progress: 0,
                strength: 0.2
              });
            }
          }
        }
      }

      for (let receptor of this.receptors) {
        const targetBound =
          expandedPhase === 0 ? 0 :
          expandedPhase === 1 ? 0.55 :
          0.96;

        receptor.bound = p.lerp(receptor.bound, targetBound, 0.018);
        receptor.gated = p.lerp(receptor.gated, receptor.bound, 0.03);
        receptor.angle += expandedPhase === 2 ? 0.002 : 0.004;
      }

      this.activity *= expandedPhase === 2 ? 0.91 : 0.945;
      this.r = this.baseR + this.activity * 5.6;

      for (let i = this.excPulses.length - 1; i >= 0; i--) {
        const speed =
          expandedPhase === 0 ? 0.03 :
          expandedPhase === 1 ? 0.022 :
          0.014;

        this.excPulses[i].progress += speed;
        if (this.excPulses[i].progress > 1) this.excPulses.splice(i, 1);
      }
    }

    draw(color) {
      const boundLevel = this.getBoundLevel();

      const lineAlpha =
        expandedPhase === 0 ? 135 :
        expandedPhase === 1 ? 100 - boundLevel * 18 :
        58;

      for (let idx = 0; idx < this.connections.length; idx++) {
        const c = this.connections[idx];
        const bend =
          Math.sin((this.x + c.x) * 0.01 + p.frameCount * 0.018 + idx) *
          (expandedPhase === 0 ? 22 : expandedPhase === 1 ? 14 : 8);

        drawDottedBezier(
          this.x,
          this.y,
          c.x,
          c.y,
          bend,
          lineAlpha,
          expandedPhase === 0 ? 2.5 : 2.1,
          0.08
        );
      }

      // excitatory pulses
      for (let pulse of this.excPulses) {
        const px = p.lerp(this.x, pulse.target.x, pulse.progress);
        const py = p.lerp(this.y, pulse.target.y, pulse.progress);
        const a = p.sin(pulse.progress * p.PI) * (120 * pulse.strength);

        p.noStroke();
        p.fill(190, 120, 40, a * 0.22);
        p.circle(px, py, 14);

        p.fill(255, 246, 228, a);
        p.circle(px, py, 4.2);
      }

      drawReceptors(this, color);

        // outer glow
        p.noStroke();
        p.fill(color.r, color.g, color.b, 40 + this.activity * 40);
        p.circle(this.x, this.y, this.r * 5);

        // main body (darker anchor)
        p.fill(122, 92, 40, 120 + this.activity * 100);
        p.circle(this.x, this.y, this.r * 1.15);

        // inner bright signal core
        p.fill(255, 248, 236, 200);
        p.circle(this.x, this.y, this.r * 0.6);
            }
  }

  class ApigeninParticle {
    constructor() {
      this.reset();
      this.y = p.random(-20, h);
    }

    reset() {
      this.x = p.random(w * 0.08, w * 0.92);
      this.y = -p.random(20, 130);
      this.speed = p.random(0.32, 0.85);
      this.size = p.random(2.4, 5.2);
      this.wobble = p.random(1000);
      this.alpha = p.random(70, 130);
      this.attached = false;
      this.targetNeuron = null;
      this.targetReceptor = null;
    }

    update() {
      if (this.attached && this.targetNeuron && this.targetReceptor) {
        const rx =
          this.targetNeuron.x +
          p.cos(this.targetReceptor.angle) * this.targetReceptor.orbitR;
        const ry =
          this.targetNeuron.y +
          p.sin(this.targetReceptor.angle) * this.targetReceptor.orbitR;

        this.x = p.lerp(this.x, rx, 0.07);
        this.y = p.lerp(this.y, ry, 0.07);
        this.alpha *= 0.988;

        this.targetReceptor.bound = p.lerp(this.targetReceptor.bound, 1, 0.05);

        if (this.alpha < 10) this.reset();
      } else {
        this.y += this.speed;
        this.x += p.sin(p.frameCount * 0.02 + this.wobble) * 0.45;

        if (expandedPhase >= 1) {
          let best = null;
          let bestD = Infinity;

          for (let n of neurons) {
            for (let r of n.receptors) {
              const rx = n.x + p.cos(r.angle) * r.orbitR;
              const ry = n.y + p.sin(r.angle) * r.orbitR;
              const d = p.dist(this.x, this.y, rx, ry);

              if (d < 34 && d < bestD && r.bound < 0.92) {
                best = { neuron: n, receptor: r };
                bestD = d;
              }
            }
          }

          if (best) {
            this.attached = true;
            this.targetNeuron = best.neuron;
            this.targetReceptor = best.receptor;
          }
        }

        if (this.y > h + 30) this.reset();
      }
    }

    draw(color) {
      if (expandedPhase === 0) return;

      p.noStroke();
      p.fill(color.r, color.g, color.b, this.alpha * 0.14);
      p.circle(this.x, this.y, this.size * 4.8);

      p.fill(255, 252, 244, this.alpha);
      p.circle(this.x, this.y, this.size);

      p.fill(color.r, color.g, color.b, this.alpha * 0.72);
      p.circle(this.x, this.y, this.size * 0.46);
    }
  }

  class InhibitoryPacket {
    constructor(neuron, receptor) {
      this.neuron = neuron;
      this.receptor = receptor;
      this.angleOffset = p.random(p.TWO_PI);
      this.progress = p.random(1);
      this.orbitR = p.random(18, 32);
    }

    update() {
      this.progress += 0.012 + this.receptor.gated * 0.01;
    }

    draw(color) {
      const rx =
        this.neuron.x +
        p.cos(this.receptor.angle) * this.receptor.orbitR;
      const ry =
        this.neuron.y +
        p.sin(this.receptor.angle) * this.receptor.orbitR;

      const approach = (Math.sin(this.progress + this.angleOffset) + 1) * 0.5;

      const x = p.lerp(this.neuron.x, rx, approach);
      const y = p.lerp(this.neuron.y, ry, approach);

      const alpha =
        expandedPhase === 0 ? 20 :
        expandedPhase === 1 ? 55 + this.receptor.gated * 70 :
        95 + this.receptor.gated * 90;

      p.noStroke();
      p.fill(235, 210, 150, alpha * 0.18);
      p.circle(x, y, 12);

      p.fill(255, 248, 236, alpha);
      p.circle(x, y, 4.6);
    }
  }

  class InhibitoryWave {
    constructor(y, offset) {
      this.y = y;
      this.offset = offset;
      this.amp = 0;
      this.targetAmp = 0;
    }

    update() {
      this.targetAmp =
        expandedPhase === 0 ? p.random(1, 3) :
        expandedPhase === 1 ? p.random(4, 8) :
        p.random(10, 16);

      this.amp = p.lerp(this.amp, this.targetAmp, 0.03);
    }

    draw(color) {
      const alpha =
        expandedPhase === 0 ? 12 :
        expandedPhase === 1 ? 40 :
        70;

      p.noFill();
      p.stroke(255, 248, 236, alpha * 0.6);
      p.strokeWeight(1.05);
      p.beginShape();
      for (let x = 0; x <= w; x += 7) {
        const y =
          this.y +
          Math.sin(x * 0.016 + p.frameCount * 0.018 + this.offset) * this.amp;
        p.vertex(x, y);
      }
      p.endShape();

      p.stroke(color.r, color.g, color.b, alpha * 0.42);
      p.beginShape();
      for (let x = 0; x <= w; x += 7) {
        const y =
          this.y +
          Math.sin(x * 0.016 + p.frameCount * 0.018 + this.offset + 0.85) *
            (this.amp * 0.72);
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  function drawDottedBezier(ax, ay, bx, by, bend, alpha, size, spacing) {
    const mx = (ax + bx) * 0.5;
    const my = (ay + by) * 0.5 + bend;

    for (let t = 0; t <= 1; t += spacing) {
      const x = p.bezierPoint(ax, mx, mx, bx, t);
      const y = p.bezierPoint(ay, my, my, by, t);

      p.noStroke();
      p.fill(255, 250, 240, alpha + 30);
      p.circle(x, y, size);
    }
  }

  function drawReceptors(neuron, color) {
  for (let receptor of neuron.receptors) {
    const rx = neuron.x + p.cos(receptor.angle) * receptor.orbitR;
    const ry = neuron.y + p.sin(receptor.angle) * receptor.orbitR;

    const openAmt = 1 - receptor.bound * 0.6; // closes when bound

    p.push();
    p.translate(rx, ry);
    p.rotate(receptor.angle + p.HALF_PI);

    // === OUTER SHAPE (clear + bold) ===
    p.noFill();
    p.stroke(82, 60, 24, 180); // darker + more contrast
    p.strokeWeight(1.6);

    const wShape = 7 * openAmt;
    const hShape = 12;

    // left side
    p.beginShape();
    p.vertex(-wShape, -hShape * 0.5);
    p.bezierVertex(
      -wShape * 1.4,
      -hShape * 0.1,
      -wShape * 1.2,
      hShape * 0.2,
      -wShape * 0.3,
      hShape * 0.6
    );
    p.endShape();

    // right side
    p.beginShape();
    p.vertex(wShape, -hShape * 0.5);
    p.bezierVertex(
      wShape * 1.4,
      -hShape * 0.1,
      wShape * 1.2,
      hShape * 0.2,
      wShape * 0.3,
      hShape * 0.6
    );
    p.endShape();

    // === GLOW RING (NEW → helps it pop) ===
    p.noStroke();
    p.fill(color.r, color.g, color.b, 20 + receptor.bound * 60);
    p.circle(0, 0, 14 + receptor.bound * 6);

    // === BINDING STATE (MOST IMPORTANT) ===
    if (receptor.bound > 0.1) {
      // outer fill (golden)
      p.fill(176, 134, 58, 70 + receptor.bound * 120);
      p.circle(0, 0, 8 + receptor.bound * 6);

      // bright core (interaction point)
      p.fill(255, 250, 240, 140 + receptor.bound * 120);
      p.circle(0, 0, 3.5 + receptor.bound * 1.5);
    } else {
      // EMPTY receptor → faint center
      p.fill(90, 70, 30, 60);
      p.circle(0, 0, 3);
    }

    p.pop();
  }
}

  function setupScene() {
    neurons = [];
    apigeninParticles = [];
    inhibitoryPackets = [];
    inhibitoryWaves = [];

    const cols = 3;
    const rows = 2;
    const spacingX = w / (cols + 1);
    const spacingY = h / (rows + 1.4);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = spacingX * (c + 1) + p.random(-24, 24);
        const ny = spacingY * (r + 1) + p.random(-18, 18) + 22;
        neurons.push(new RelaxNeuron(nx, ny));
      }
    }

    for (let n of neurons) {
      const others = neurons.filter((o) => o !== n);
      others.sort((a, b) => p.dist(n.x, n.y, a.x, a.y) - p.dist(n.x, n.y, b.x, b.y));
      n.connections = others.slice(0, 2 + p.floor(p.random(2)));
    }

    for (let i = 0; i < 24; i++) {
      apigeninParticles.push(new ApigeninParticle());
    }

    for (let n of neurons) {
      for (let r of n.receptors) {
        inhibitoryPackets.push(new InhibitoryPacket(n, r));
      }
    }

    for (let i = 0; i < 4; i++) {
      inhibitoryWaves.push(new InhibitoryWave(h * (0.24 + i * 0.16), p.random(1000)));
    }
  }

  p.setup = () => {
    w = modalCanvasContainer.offsetWidth || 900;
    h = modalCanvasContainer.offsetHeight || 520;
    const c = p.createCanvas(w, h);
    c.parent(modalCanvasContainer);
    setupScene();
  };

  p.windowResized = () => {
    w = modalCanvasContainer.offsetWidth || 900;
    h = modalCanvasContainer.offsetHeight || 520;
    p.resizeCanvas(w, h);
    setupScene();
  };

  p.draw = () => {
    const color = getBlendRgb("relaxation");

    const bgBase =
      expandedPhase === 0
        ? { r: 210, g: 198, b: 158 }
        : expandedPhase === 1
        ? { r: 216, g: 204, b: 166 }
        : { r: 222, g: 210, b: 176 };

    p.background(bgBase.r, bgBase.g, bgBase.b);

    for (let wave of inhibitoryWaves) {
      wave.update();
      wave.draw(color);
    }

    for (let n of neurons) n.update();
    for (let n of neurons) n.draw(color);

    for (let packet of inhibitoryPackets) {
      packet.update();
      packet.draw(color);
    }

    for (let particle of apigeninParticles) {
      particle.update();
      particle.draw(color);
    }

    p.noStroke();
    p.fill(72, 54, 22, 240);
    p.textAlign(p.CENTER);
    p.textSize(12);

    const labels = [
      "Neural activity is high, with frequent signaling between neurons.\n Receptor sites remain unoccupied, and excitatory communication moves quickly through the network.",
      "Apigenin begins to dock at receptor sites (GABA-A) around each neuron.\nAs binding increases, inhibitory signaling (from GABA) becomes more effective and overall activity starts to slow.",
      "With more receptors occupied, inhibitory signals are amplified\n Neural communication becomes quieter and more regulated, resulting in a calmer, more stable state."
    ];

    p.text(labels[expandedPhase], w / 2, h - 24);
  };
};

/* ---------- focus expanded ---------- */
const focusExpandedSketch = (p) => {
  let w, h;
  let neurons = [];
  let theanineParticles = [];
  let alphaWaves = [];
  let gabaParticles = [];

  class Neuron {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseRadius = 15;
      this.radius = this.baseRadius;
      this.firing = 0;
      this.fireTimer = p.random(180);
      this.fireRate = 34 + p.random(26);
      this.connections = [];
      this.pulses = [];
    }

    update(stateStrength) {
      this.fireTimer++;

      if (expandedPhase === 0) {
        if (this.fireTimer > this.fireRate) {
          this.firing = 1;
          this.fireTimer = 0;
          this.fireRate = 28 + p.random(24);

          for (let c of this.connections) {
            this.pulses.push({ target: c, progress: 0 });
          }
        }
      } else if (expandedPhase === 1) {
        const slowedRate = p.lerp(this.fireRate, this.fireRate * 2.8, stateStrength);
        if (this.fireTimer > slowedRate) {
          this.firing = 0.5;
          this.fireTimer = 0;

          if (p.random() > 0.45 * stateStrength) {
            for (let c of this.connections) {
              this.pulses.push({ target: c, progress: 0 });
            }
          }
        }
      } else {
        if (this.fireTimer > this.fireRate * 3.8) {
          this.firing = 0.28;
          this.fireTimer = 0;
        }
      }

      this.firing *= 0.94;
      this.radius = this.baseRadius + this.firing * 5.5;

      for (let i = this.pulses.length - 1; i >= 0; i--) {
        this.pulses[i].progress += expandedPhase === 2 ? 0.016 : 0.024;
        if (this.pulses[i].progress > 1) {
          this.pulses.splice(i, 1);
        }
      }
    }

    draw(color) {
        const lineAlpha =
        expandedPhase === 0 ? 110 :
        expandedPhase === 1 ? 78 : 52;

      for (let idx = 0; idx < this.connections.length; idx++) {
        const c = this.connections[idx];
        const bend =
          Math.sin((this.x + c.x) * 0.01 + p.frameCount * 0.02 + idx) *
          (expandedPhase === 0 ? 22 : expandedPhase === 1 ? 14 : 10);

        drawDottedBezier(
          this.x,
          this.y,
          c.x,
          c.y,
          bend,
          lineAlpha,
          expandedPhase === 0 ? 2.8 : 2.4,
          0.075
        );
      }

        for (let pulse of this.pulses) {
        const px = p.lerp(this.x, pulse.target.x, pulse.progress);
        const py = p.lerp(this.y, pulse.target.y, pulse.progress);
        const a = p.sin(pulse.progress * p.PI) * (expandedPhase === 0 ? 165 : 105);

        p.noStroke();
        p.fill(color.r, color.g, color.b, a * 0.16);
        p.circle(px, py, 14);

        p.fill(245, 247, 242, a);
        p.circle(px, py, 4.4);
      }

     p.noStroke();
      p.fill(color.r, color.g, color.b, 16 + this.firing * 24);
      p.circle(this.x, this.y, this.radius * 4.8);

      p.fill(245, 247, 242, 140 + this.firing * 28);
      p.circle(this.x, this.y, this.radius * 1.9);

      p.fill(color.r, color.g, color.b, 55 + this.firing * 20);
      p.circle(this.x, this.y, this.radius * 3);
    }
  }

  class TheanineParticle {
    constructor() {
      this.reset();
      this.y = p.random(h);
    }

    reset() {
      this.x = p.random(w * 0.12, w * 0.88);
      this.y = -p.random(20, 90);
      this.speed = p.random(0.35, 0.95);
      this.size = p.random(2.5, 5.2);
      this.wobble = p.random(1000);
      this.alpha = p.random(60, 130);
      this.attached = false;
      this.attachTarget = null;
    }

    update() {
      if (this.attached && this.attachTarget) {
        this.x = p.lerp(this.x, this.attachTarget.x, 0.035);
        this.y = p.lerp(this.y, this.attachTarget.y, 0.035);
        this.alpha *= 0.985;

        if (this.alpha < 5) this.reset();
      } else {
        this.y += this.speed;
        this.x += p.sin(p.frameCount * 0.018 + this.wobble) * 0.4;

        if (expandedPhase >= 1) {
          for (let n of neurons) {
            const d = p.dist(this.x, this.y, n.x, n.y);
            if (d < 34) {
              this.attached = true;
              this.attachTarget = n;
              break;
            }
          }
        }

        if (this.y > h + 30) this.reset();
      }
    }

    draw(color) {
      if (expandedPhase === 0) return;

      p.noStroke();
      p.fill(214, 168, 74, this.alpha * 0.22);
      p.circle(this.x, this.y, this.size * 4.4);

      p.fill(245, 247, 242, this.alpha * 0.92);
      p.circle(this.x, this.y, this.size);
  }
}

  class AlphaWave {
    constructor(y, offset) {
      this.y = y;
      this.offset = offset;
      this.amp = 0;
      this.targetAmp = 0;
    }

    update() {
      this.targetAmp =
        expandedPhase === 2 ? p.random(10, 22) :
        expandedPhase === 1 ? p.random(3, 8) :
        0;

      this.amp = p.lerp(this.amp, this.targetAmp, 0.03);
    }

    draw(color) {
      const alpha =
        expandedPhase === 2 ? 75 :
        expandedPhase === 1 ? 26 : 0;

      p.noFill();
      p.stroke(color.r, color.g, color.b, alpha);
      p.strokeWeight(1.1);

      p.beginShape();
      for (let x = 0; x <= w; x += 6) {
        const freq = expandedPhase === 2 ? 0.013 : 0.022;
        const yy =
          this.y +
          p.sin(x * freq + p.frameCount * 0.025 + this.offset) * this.amp;
        p.vertex(x, yy);
      }
      p.endShape();
    }
  }

  class GabaParticle {
    constructor(neuron) {
      this.neuron = neuron;
      this.angle = p.random(p.TWO_PI);
      this.orbitR = p.random(24, 38);
      this.alpha = 0;
      this.targetAlpha = 0;
      this.x = neuron.x;
      this.y = neuron.y;
    }

    update() {
      this.targetAlpha = expandedPhase >= 1 ? 105 : 0;
      this.alpha = p.lerp(this.alpha, this.targetAlpha, 0.035);
      this.angle += 0.012;

      this.x = this.neuron.x + p.cos(this.angle) * this.orbitR;
      this.y = this.neuron.y + p.sin(this.angle) * this.orbitR;
    }

    draw(color) {
      if (this.alpha < 2) return;

           p.noStroke();
      p.fill(color.r, color.g, color.b, this.alpha * 0.12);
      p.circle(this.x, this.y, 12);

      p.fill(238, 244, 236, this.alpha);
      p.circle(this.x, this.y, 4.8);
    }
  }
  
    function drawDottedBezier(ax, ay, bx, by, bend, alpha, size, spacing) {
    const mx = (ax + bx) * 0.5;
    const my = (ay + by) * 0.5 + bend;

    for (let t = 0; t <= 1; t += spacing) {
      const x = p.bezierPoint(ax, mx, mx, bx, t);
      const y = p.bezierPoint(ay, my, my, by, t);

      p.noStroke();
      p.fill(245, 247, 242, alpha);
      p.circle(x, y, size);
    }
  }

  function drawSoftGlow(x, y, size, alpha, color) {
    p.noStroke();
    p.fill(color.r, color.g, color.b, alpha * 0.18);
    p.circle(x, y, size * 2.8);

    p.fill(245, 247, 242, alpha);
    p.circle(x, y, size);
  }

  function setupScene() {
    neurons = [];
    theanineParticles = [];
    alphaWaves = [];
    gabaParticles = [];

    const cols = 3;
    const rows = 2;
    const spacingX = w / (cols + 1);
    const spacingY = h / (rows + 1.45);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = spacingX * (c + 1) + p.random(-24, 24);
        const ny = spacingY * (r + 1) + p.random(-18, 18) + 22;
        neurons.push(new Neuron(nx, ny));
      }
    }

    for (let n of neurons) {
      const others = neurons.filter((o) => o !== n);
      others.sort((a, b) => p.dist(n.x, n.y, a.x, a.y) - p.dist(n.x, n.y, b.x, b.y));
      n.connections = others.slice(0, 2 + p.floor(p.random(2)));
    }

    for (let i = 0; i < 30; i++) {
      theanineParticles.push(new TheanineParticle());
    }

    for (let i = 0; i < 4; i++) {
      alphaWaves.push(new AlphaWave(h * (0.22 + i * 0.17), p.random(1000)));
    }

    for (let n of neurons) {
      for (let j = 0; j < 2; j++) {
        gabaParticles.push(new GabaParticle(n));
      }
    }
  }

  p.setup = () => {
    w = modalCanvasContainer.offsetWidth || 900;
    h = modalCanvasContainer.offsetHeight || 520;
    const c = p.createCanvas(w, h);
    c.parent(modalCanvasContainer);
    setupScene();
  };

  p.windowResized = () => {
    w = modalCanvasContainer.offsetWidth || 900;
    h = modalCanvasContainer.offsetHeight || 520;
    p.resizeCanvas(w, h);
    setupScene();
  };

  p.draw = () => {
    const color = getBlendRgb("focus");
      const bgBase = {
        r: color.r * 0.35,
        g: color.g * 0.42,
        b: color.b * 0.38
};

p.background(bgBase.r, bgBase.g, bgBase.b);

    const stateStrength =
      expandedPhase === 0 ? 0 :
      expandedPhase === 1 ? 0.55 : 1;

    for (let wave of alphaWaves) {
      wave.update();
      wave.draw(color);
    }

    for (let n of neurons) n.update(stateStrength);
    for (let n of neurons) n.draw(color);

    for (let g of gabaParticles) {
      g.update();
      g.draw(color);
    }

    for (let particle of theanineParticles) {
      particle.update();
      particle.draw(color);
    }

    p.noStroke();
    p.fill(255, 255, 255, 180);
    p.textAlign(p.CENTER);
    p.textSize(12);

    const labels = [
      "neurons firing — high excitatory signaling",
      "L-theanine begins to bind, rebalance signaling, GABA rises, Alpha waves begin",
      "GABA elevated, alphas waves emerge, alpha-associated relaxed focus"
    ];

    p.text(labels[expandedPhase], w / 2, h - 24);
  };
};

/* ---------- energy expanded ---------- */
const energyExpandedSketch = (p) => {
  let w, h;
  let neurons = [];
  let caffeineParticles = [];
  let adenosinePackets = [];
  let alertPackets = [];
  let corticalWaves = [];

  class EnergyNeuron {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseR = 14;
      this.r = this.baseR;
      this.activity = p.random(0.35, 0.7);
      this.fireTimer = p.random(120);
      this.fireRate = p.random(32, 52);
      this.connections = [];
      this.alertPulses = [];
      this.receptors = [];

      const receptorCount = 4;
      for (let i = 0; i < receptorCount; i++) {
        this.receptors.push({
          angle: (p.TWO_PI / receptorCount) * i + p.random(-0.18, 0.18),
          orbitR: p.random(28, 38),
          caffeineBound: 0
        });
      }
    }

    getBlockedLevel() {
      let total = 0;
      for (let r of this.receptors) total += r.caffeineBound;
      return total / this.receptors.length;
    }

    update() {
      const blockedLevel = this.getBlockedLevel();
      this.fireTimer++;

      if (expandedPhase === 0) {
        // baseline: adenosine signaling present, moderate activity
        if (this.fireTimer > this.fireRate * 1.15) {
          this.activity = 0.45;
          this.fireTimer = 0;

          if (p.random() > 0.28) {
            for (let c of this.connections) {
              this.alertPulses.push({
                target: c,
                progress: 0,
                strength: 0.55
              });
            }
          }
        }
      } else if (expandedPhase === 1) {
        // caffeine begins binding, fatigue signaling drops
        const newRate = this.fireRate * (1.0 - blockedLevel * 0.18);
        if (this.fireTimer > newRate) {
          this.activity = 0.62 + blockedLevel * 0.18;
          this.fireTimer = 0;

          for (let c of this.connections) {
            if (p.random() > 0.15) {
              this.alertPulses.push({
                target: c,
                progress: 0,
                strength: 0.72 + blockedLevel * 0.12
              });
            }
          }
        }
      } else {
        // receptors more occupied by caffeine -> adenosine less effective
        const alertRate = this.fireRate * 0.72;
        if (this.fireTimer > alertRate) {
          this.activity = 0.9;
          this.fireTimer = 0;

          for (let c of this.connections) {
            this.alertPulses.push({
              target: c,
              progress: 0,
              strength: 0.95
            });
          }
        }
      }

      for (let receptor of this.receptors) {
        const targetBound =
          expandedPhase === 0 ? 0 :
          expandedPhase === 1 ? 0.55 :
          0.95;

        receptor.caffeineBound = p.lerp(receptor.caffeineBound, targetBound, 0.022);
        receptor.angle += 0.002;
      }

      this.activity *= expandedPhase === 2 ? 0.95 : 0.94;
      this.r = this.baseR + this.activity * 6.2;

      for (let i = this.alertPulses.length - 1; i >= 0; i--) {
        const speed =
          expandedPhase === 0 ? 0.02 :
          expandedPhase === 1 ? 0.026 :
          0.034;

        this.alertPulses[i].progress += speed;
        if (this.alertPulses[i].progress > 1) this.alertPulses.splice(i, 1);
      }
    }

    draw(color) {
      const blockedLevel = this.getBlockedLevel();

      const lineAlpha =
        expandedPhase === 0 ? 82 :
        expandedPhase === 1 ? 112 :
        148;

      for (let idx = 0; idx < this.connections.length; idx++) {
        const c = this.connections[idx];
        const bend =
          Math.sin((this.x + c.x) * 0.01 + p.frameCount * 0.02 + idx) *
          (expandedPhase === 0 ? 12 : expandedPhase === 1 ? 16 : 22);

        drawDottedBezier(
          this.x,
          this.y,
          c.x,
          c.y,
          bend,
          lineAlpha,
          expandedPhase === 0 ? 2.0 : 2.4,
          0.075
        );
      }

      // alert pulses
      for (let pulse of this.alertPulses) {
        const px = p.lerp(this.x, pulse.target.x, pulse.progress);
        const py = p.lerp(this.y, pulse.target.y, pulse.progress);
        const a = p.sin(pulse.progress * p.PI) * (150 * pulse.strength);

        p.noStroke();
        p.fill(color.r, color.g, color.b, a * 0.16);
        p.circle(px, py, 18);

        p.fill(255, 248, 238, a);
        p.circle(px, py, 5.4);

        p.fill(color.r, color.g, color.b, a * 0.9);
        p.circle(px, py, 2.6);
      }

      drawAdenosineReceptors(this, color);

      // neuron glow/body
      p.noStroke();
      p.fill(color.r, color.g, color.b, 26 + this.activity * 40);
      p.circle(this.x, this.y, this.r * 5.4);

      p.fill(130, 74, 34, 110 + blockedLevel * 65 + this.activity * 35);
      p.circle(this.x, this.y, this.r * 1.25);

      p.fill(255, 246, 234, 205);
      p.circle(this.x, this.y, this.r * 0.62);

      p.fill(color.r, color.g, color.b, 215);
      p.circle(this.x, this.y, this.r * 0.3);
    }
  }

  class CaffeineParticle {
    constructor() {
      this.reset();
      this.y = p.random(-20, h);
    }

    reset() {
      this.x = p.random(w * 0.08, w * 0.92);
      this.y = -p.random(20, 120);
      this.speed = p.random(0.45, 1.1);
      this.size = p.random(2.8, 5.4);
      this.wobble = p.random(1000);
      this.alpha = p.random(90, 140);
      this.attached = false;
      this.targetNeuron = null;
      this.targetReceptor = null;
    }

    update() {
      if (this.attached && this.targetNeuron && this.targetReceptor) {
        const rx =
          this.targetNeuron.x +
          p.cos(this.targetReceptor.angle) * this.targetReceptor.orbitR;
        const ry =
          this.targetNeuron.y +
          p.sin(this.targetReceptor.angle) * this.targetReceptor.orbitR;

        this.x = p.lerp(this.x, rx, 0.08);
        this.y = p.lerp(this.y, ry, 0.08);
        this.alpha *= 0.992;

        this.targetReceptor.caffeineBound = p.lerp(this.targetReceptor.caffeineBound, 1, 0.055);

        if (this.alpha < 16) this.reset();
      } else {
        this.y += this.speed;
        this.x += Math.sin(p.frameCount * 0.022 + this.wobble) * 0.55;

        if (expandedPhase >= 1) {
          let best = null;
          let bestD = Infinity;

          for (let n of neurons) {
            for (let r of n.receptors) {
              const rx = n.x + p.cos(r.angle) * r.orbitR;
              const ry = n.y + p.sin(r.angle) * r.orbitR;
              const d = p.dist(this.x, this.y, rx, ry);

              if (d < 34 && d < bestD && r.caffeineBound < 0.92) {
                best = { neuron: n, receptor: r };
                bestD = d;
              }
            }
          }

          if (best) {
            this.attached = true;
            this.targetNeuron = best.neuron;
            this.targetReceptor = best.receptor;
          }
        }

        if (this.y > h + 30) this.reset();
      }
    }

    draw(color) {
      if (expandedPhase === 0) return;

      p.noStroke();
      p.fill(color.r, color.g, color.b, this.alpha * 0.18);
      p.circle(this.x, this.y, this.size * 4.8);

      p.fill(255, 248, 238, this.alpha);
      p.circle(this.x, this.y, this.size);

      p.fill(color.r, color.g, color.b, this.alpha * 0.85);
      p.circle(this.x, this.y, this.size * 0.46);
    }
  }

  class AdenosinePacket {
    constructor(neuron, receptor) {
      this.neuron = neuron;
      this.receptor = receptor;
      this.progress = p.random(1);
      this.speed = p.random(0.006, 0.012);
      this.offset = p.random(1000);
    }

    update() {
      this.progress += this.speed;
      if (this.progress > 1) this.progress = 0;
    }

    draw() {
      // adenosine signal is strongest in baseline, weaker as caffeine binds
      const blocked = this.receptor.caffeineBound;
      const visible =
        expandedPhase === 0 ? 1 :
        expandedPhase === 1 ? 1 - blocked * 0.72 :
        1 - blocked * 0.92;

      if (visible < 0.06) return;

      const rx =
        this.neuron.x + p.cos(this.receptor.angle) * this.receptor.orbitR;
      const ry =
        this.neuron.y + p.sin(this.receptor.angle) * this.receptor.orbitR;

      const px = p.lerp(this.neuron.x, rx, this.progress);
      const py = p.lerp(this.neuron.y, ry, this.progress);

      p.noStroke();
      p.fill(120, 90, 65, 60 * visible);
      p.circle(px, py, 14);

      p.fill(255, 238, 220, 115 * visible);
      p.circle(px, py, 4.4);
    }
  }

  class CorticalWave {
    constructor(y, offset) {
      this.y = y;
      this.offset = offset;
      this.amp = 0;
      this.targetAmp = 0;
    }

    update() {
      this.targetAmp =
        expandedPhase === 0 ? p.random(2, 4) :
        expandedPhase === 1 ? p.random(5, 9) :
        p.random(8, 14);

      this.amp = p.lerp(this.amp, this.targetAmp, 0.03);
    }

    draw(color) {
      const alpha =
        expandedPhase === 0 ? 18 :
        expandedPhase === 1 ? 36 :
        58;

      p.noFill();
      p.stroke(255, 246, 236, alpha * 0.55);
      p.strokeWeight(1.1);
      p.beginShape();
      for (let x = 0; x <= w; x += 7) {
        const y =
          this.y +
          Math.sin(x * 0.018 + p.frameCount * 0.024 + this.offset) * this.amp;
        p.vertex(x, y);
      }
      p.endShape();

      p.stroke(color.r, color.g, color.b, alpha * 0.65);
      p.beginShape();
      for (let x = 0; x <= w; x += 7) {
        const y =
          this.y +
          Math.sin(x * 0.018 + p.frameCount * 0.024 + this.offset + 0.8) *
            (this.amp * 0.7);
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  function drawDottedBezier(ax, ay, bx, by, bend, alpha, size, spacing) {
    const mx = (ax + bx) * 0.5;
    const my = (ay + by) * 0.5 + bend;

    for (let t = 0; t <= 1; t += spacing) {
      const x = p.bezierPoint(ax, mx, mx, bx, t);
      const y = p.bezierPoint(ay, my, my, by, t);

      p.noStroke();
      p.fill(255, 247, 238, alpha);
      p.circle(x, y, size);
    }
  }

  function drawAdenosineReceptors(neuron, color) {
    for (let receptor of neuron.receptors) {
      const rx = neuron.x + p.cos(receptor.angle) * receptor.orbitR;
      const ry = neuron.y + p.sin(receptor.angle) * receptor.orbitR;

      p.push();
      p.translate(rx, ry);
      p.rotate(receptor.angle + p.HALF_PI);

      // receptor outline
      p.noFill();
      p.stroke(90, 54, 24, 180);
      p.strokeWeight(1.5);

      const openAmt = 1 - receptor.caffeineBound * 0.45;
      const wShape = 7 * openAmt;
      const hShape = 12;

      p.beginShape();
      p.vertex(-wShape, -hShape * 0.5);
      p.bezierVertex(
        -wShape * 1.4, -hShape * 0.1,
        -wShape * 1.2,  hShape * 0.2,
        -wShape * 0.3,  hShape * 0.6
      );
      p.endShape();

      p.beginShape();
      p.vertex(wShape, -hShape * 0.5);
      p.bezierVertex(
        wShape * 1.4, -hShape * 0.1,
        wShape * 1.2,  hShape * 0.2,
        wShape * 0.3,  hShape * 0.6
      );
      p.endShape();

      // glow / blocked state
      p.noStroke();
      p.fill(color.r, color.g, color.b, 24 + receptor.caffeineBound * 70);
      p.circle(0, 0, 13 + receptor.caffeineBound * 6);

      if (receptor.caffeineBound > 0.08) {
        p.fill(color.r, color.g, color.b, 85 + receptor.caffeineBound * 120);
        p.circle(0, 0, 8 + receptor.caffeineBound * 5);

        p.fill(255, 248, 238, 130 + receptor.caffeineBound * 100);
        p.circle(0, 0, 3.4 + receptor.caffeineBound * 1.2);
      } else {
        p.fill(85, 66, 40, 60);
        p.circle(0, 0, 3);
      }

      p.pop();
    }
  }

  function setupScene() {
    neurons = [];
    caffeineParticles = [];
    adenosinePackets = [];
    alertPackets = [];
    corticalWaves = [];

    const cols = 3;
    const rows = 2;
    const spacingX = w / (cols + 1);
    const spacingY = h / (rows + 1.45);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = spacingX * (c + 1) + p.random(-24, 24);
        const ny = spacingY * (r + 1) + p.random(-18, 18) + 22;
        neurons.push(new EnergyNeuron(nx, ny));
      }
    }

    for (let n of neurons) {
      const others = neurons.filter((o) => o !== n);
      others.sort((a, b) => p.dist(n.x, n.y, a.x, a.y) - p.dist(n.x, n.y, b.x, b.y));
      n.connections = others.slice(0, 2 + p.floor(p.random(2)));
    }

    for (let i = 0; i < 26; i++) {
      caffeineParticles.push(new CaffeineParticle());
    }

    for (let n of neurons) {
      for (let r of n.receptors) {
        adenosinePackets.push(new AdenosinePacket(n, r));
      }
    }

    for (let i = 0; i < 4; i++) {
      corticalWaves.push(new CorticalWave(h * (0.22 + i * 0.17), p.random(1000)));
    }
  }

  p.setup = () => {
    w = modalCanvasContainer.offsetWidth || 900;
    h = modalCanvasContainer.offsetHeight || 520;
    const c = p.createCanvas(w, h);
    c.parent(modalCanvasContainer);
    setupScene();
  };

  p.windowResized = () => {
    w = modalCanvasContainer.offsetWidth || 900;
    h = modalCanvasContainer.offsetHeight || 520;
    p.resizeCanvas(w, h);
    setupScene();
  };

  p.draw = () => {
    const color = getBlendRgb("energy");

    const bgBase =
      expandedPhase === 0
        ? { r: 208, g: 178, b: 145 }
        : expandedPhase === 1
        ? { r: 220, g: 170, b: 122 }
        : { r: 235, g: 160, b: 88 };

    p.background(bgBase.r, bgBase.g, bgBase.b);

    for (let wave of corticalWaves) {
      wave.update();
      wave.draw(color);
    }

    for (let packet of adenosinePackets) {
      packet.update();
      packet.draw();
    }

    for (let n of neurons) n.update();
    for (let n of neurons) n.draw(color);

    for (let particle of caffeineParticles) {
      particle.update();
      particle.draw(color);
    }

    p.noStroke();
    p.fill(78, 46, 20, 220);
    p.textAlign(p.CENTER);
    p.textSize(12);

    const labels = [
      "Adenosine signaling applies a normal braking effect to neural activity, helping limit arousal as fatigue builds.",
      "Caffeine begins binding to adenosine receptors, blocking more of that fatigue-related signaling at the receptor sites.",
      "With adenosine signaling reduced, neural activity remains more active and alertness-related signaling is sustained."
    ];

    p.text(labels[expandedPhase], w / 2, h - 24);
  };
};

/* =========================
   EVENTS
========================= */

blendTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const slide = trigger.closest(".blend-slide");
    if (!slide || !slide.classList.contains("is-active")) return;

    const blendKey = trigger.dataset.blend;
    openBlendModal(blendKey);
  });
});



if (blendModal) {
  blendModal.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("blend-modal-backdrop") ||
      e.target === blendModal
    ) {
      closeBlendModal();
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBlendModal();
});



function initCircularHintText() {
  const hints = document.querySelectorAll(".blend-open-hint");
  if (!hints.length) return;

  hints.forEach((hint) => {
    const text = hint.getAttribute("data-text") || hint.textContent.trim();
    hint.setAttribute("data-text", text);
    hint.innerHTML = "";

    const radius = 235;      // move closer/farther from center
    const totalArc = 120;    // how much of the circle the text spans
    const startAngle = 220;  // where the text starts

    const letters = [...text];

    letters.forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;

      const angle =
        startAngle + (i / Math.max(letters.length - 1, 1)) * totalArc;

      span.style.transform = `
        rotate(${angle}deg)
        translateY(-${radius}px)
        rotate(0deg)
      `;

      hint.appendChild(span);
    });
  });
}

function initMockupScrollReveal() {
  const section = document.getElementById("mockups-section");
  const cards = document.querySelectorAll(".mockup-card");

  if (!section || !cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add("is-visible");
            }, index * 220); // controls left-to-right delay
          });

          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.25
    }
  );

  observer.observe(section);
}


window.addEventListener("DOMContentLoaded", () => {
  if (typeof initIngredientVisuals === "function") initIngredientVisuals();
  if (typeof initCircularHintText === "function") initCircularHintText();
  if (typeof initMockupScrollReveal === "function") initMockupScrollReveal();
});