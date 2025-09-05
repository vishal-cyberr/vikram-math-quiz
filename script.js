const questions = [];
const answers = [];
const userInputs = [];
const attempts = [];
let currentIndex = 0;
let score = 0;

// ✅ Load all 52 reward images dynamically (from root folder)
const vikramImages = Array.from({ length: 52 }, (_, i) => `${i + 1}.jpg`);

// DOM Elements
const questionBox = document.getElementById("questionBox");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const imageBox = document.getElementById("imageBox");
const scoreBox = document.getElementById("score");
const fireworksCanvas = document.getElementById("fireworks");
const ctx = fireworksCanvas.getContext("3d");
// PRO fireworks: robust, pro-like bursts with trails
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fireworks');
  if (!canvas) return; // safety
  const ctx = canvas.getContext('2d');

  // resize canvas to full window size (CSS sets width/height but we must set internal resolution)
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // fix for high DPI
  }
  window.addEventListener('resize', resize);
  resize();

  // helper: convert H,S,L to RGB array [r,g,b]
  function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return [r, g, b];
  }

  // particle array and control
  let particles = [];
  let running = false;

  // create a burst of particles at (cx, cy)
  function createBurst(cx, cy, hue, count = 90) {
    hue = hue === undefined ? Math.random() * 360 : hue;
    const [r, g, b] = hslToRgb(hue, 100, 55);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * (0.7 + Math.random() * 1.6);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 2.6 + 0.6,
        life: 1,
        decay: Math.random() * 0.015 + 0.006,
        rgb: [r, g, b],
        gravity: 0.02 + Math.random() * 0.03
      });
    }
  }

  // main animation loop
  function animate() {
    // fade with slight trail
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; // trail fade amount (adjust)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw bright particles with additive blending
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      // physics
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.998; // small air drag
      p.vy *= 0.998;

      // fade
      p.life -= p.decay;
      if (p.life <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }

      // draw particle (glow)
      const alpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${alpha})`;
      ctx.arc(p.x, p.y, p.r + (1 - p.life) * 2, 0, Math.PI * 2);
      ctx.fill();

      // tiny spark (center)
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.arc(p.x, p.y, Math.max(0.3, p.r * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      running = false;
    }
  }

  // public launcher — creates several bursts across the top half of the screen
  function launchFireworks(ProOptions = {}) {
    const bursts = ProOptions.bursts || Math.floor(3 + Math.random() * 3); // 3-5 bursts
    for (let b = 0; b < bursts; b++) {
      const cx = Math.random() * window.innerWidth;
      const cy = Math.random() * (window.innerHeight * 0.45) + 40; // upper area
      const hue = Math.random() * 360;
      createBurst(cx, cy, hue, 80 + Math.floor(Math.random() * 40));
    }

    // start animation loop if not running
    if (!running) {
      running = true;
      requestAnimationFrame(animate);
    }
  }

  // expose globally so other code (e.g., checkAnswer) can call it
  window.launchFireworks = launchFireworks;

  // small demo: remove/comment out in production
  // launchFireworks(); // optional auto test
});

// 🔢 Generate Math Question
function generateQuestion() {
  let num1, num2, op, answer;
  const operators = ["+", "-", "×", "÷"];
  do {
    num1 = Math.floor(Math.random() * 260) + 1;
    num2 = Math.floor(Math.random() * 210) + 1;
    op = operators[Math.floor(Math.random() * operators.length)];
    if (op === "+") answer = num1 + num2;
    else if (op === "-") answer = num1 - num2;
    else if (op === "×") answer = num1 * num2;
    else if (op === "÷" && num1 % num2 === 0) answer = num1 / num2;
  } while (op === "÷" && num1 % num2 !== 0);

  questions.push(`${num1} ${op} ${num2}`);
  answers.push(answer);
  userInputs.push("");
  attempts.push(0);
}

// 📜 Show Question
function showQuestion(index) {
  if (index >= questions.length) generateQuestion();
  questionBox.textContent = `Q${index + 1}: ${questions[index]} = `;
  answerInput.value = userInputs[index];
  feedback.textContent = "";
  imageBox.innerHTML = ""; // clear reward when moving to next question
}

// ✅ Check Answer
function checkAnswer() {
  const input = answerInput.value.trim();
  userInputs[currentIndex] = input;

  if (!input) {
    feedback.textContent = "⚠ Please enter an answer!";
    feedback.style.color = "orange";
    imageBox.innerHTML = "";
    return;
  }

  if (Number(input) === answers[currentIndex]) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    score++;
    scoreBox.textContent = `Score: ${score}`;

    // 🎁 Show a random reward image
    const randomIndex = Math.floor(Math.random() * vikramImages.length);
    imageBox.innerHTML = `<img src="${vikramImages[randomIndex]}" alt="Reward Image">`;

    launchFireworks();
  } else {
    attempts[currentIndex]++;
    if (attempts[currentIndex] >= 2) {
      feedback.textContent = `❌ Wrong! Correct answer is ${answers[currentIndex]}`;
      feedback.style.color = "red";
    } else {
      feedback.textContent = `⚠ Try again!`;
      feedback.style.color = "orange";
    }
    imageBox.innerHTML = "";
  }
}

// 🔀 Navigation
function nextQuestion() {
  currentIndex++;
  showQuestion(currentIndex);
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion(currentIndex);
  }
}

// 🎯 Event Listeners
document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("nextBtn").addEventListener("click", nextQuestion);
document.getElementById("prevBtn").addEventListener("click", prevQuestion);

// 🚀 Start Game
generateQuestion();
showQuestion(0);



