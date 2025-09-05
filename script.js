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

// 🎆 Pro Fireworks Animation
function launchFireworks() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  const particles = [];

  // Create multiple firework bursts
  for (let i = 0; i < 5; i++) {
    let centerX = Math.random() * fireworksCanvas.width;
    let centerY = Math.random() * fireworksCanvas.height / 2; // upper half
    let colorHue = Math.random() * 360;

    for (let j = 0; j < 80; j++) {
      particles.push({
        x: centerX,
        y: centerY,
        angle: Math.random() * 2 * Math.PI,
        speed: Math.random() * 4 + 2,
        radius: Math.random() * 3 + 1,
        color: `hsl(${colorHue}, 100%, 50%)`,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  }

  function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // fade effect
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        i--;
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.alpha})`;
      ctx.fill();
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// Helper: convert HSL color to RGB
function hexToRgb(hsl) {
  let temp = document.createElement("div");
  temp.style.color = hsl;
  document.body.appendChild(temp);

  let rgb = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  return rgb.match(/\d+/g).slice(0, 3).join(",");
}

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


