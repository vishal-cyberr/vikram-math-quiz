const questions = [];
const answers = [];
const userInputs = [];
const attempts = [];
let currentIndex = 0;
let score = 0;

// Load all 50 reward images dynamically
const vikramImages = Array.from({ length: 50 }, (_, i) => `vikramraj/${i + 1}.jpg`);
let currentImageIndex = 0;

// DOM Elements
const questionBox = document.getElementById("questionBox");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const imageBox = document.getElementById("imageBox");
const scoreBox = document.getElementById("score");
const fireworksCanvas = document.getElementById("fireworks");
const ctx = fireworksCanvas.getContext("2d");

// 🎆 Fireworks Animation
function launchFireworks() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: fireworksCanvas.width / 2,
      y: fireworksCanvas.height / 2,
      angle: Math.random() * 2 * Math.PI,
      speed: Math.random() * 4 + 12,
      radius: Math.random() * 23 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    for (let p of particles) {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    if (frame++ < 60) requestAnimationFrame(animate);
  }
  animate();
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
}

// ✅ Check Answer
function checkAnswer() {
  const input = answerInput.value.trim();
  userInputs[currentIndex] = input;

  if (!input) {
    attempts[currentIndex]++;
    feedback.textContent = `❌ Wrong! Correct answer is ${answers[currentIndex]}`;
    feedback.style.color = "red";
    imageBox.innerHTML = "";
    return;
  }

  if (Number(input) === answers[currentIndex]) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    score++;
    scoreBox.textContent = `Score: ${score}`;

    // 🎁 Show reward image
    imageBox.innerHTML = `<img src="${vikramImages[currentImageIndex]}" alt="Reward Image">`;
    if (currentImageIndex < vikramImages.length - 1) currentImageIndex++;

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
  if (!userInputs[currentIndex]) {
    attempts[currentIndex]++;
    feedback.textContent = `❌ Wrong! Correct answer is ${answers[currentIndex]}`;
    feedback.style.color = "red";
  }
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


