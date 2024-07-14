let timer;
let startTime;
let selectedExercise = "";
let isRunning = false;
let exercises = {
  running: { kcalPerHour: 600, totalKcal: 0, color: "#FF4136" },
  swimming: { kcalPerHour: 500, totalKcal: 0, color: "#0074D9" },
  weights: { kcalPerHour: 300, totalKcal: 0, color: "#2ECC40" },
};

let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || {};

function selectExercise(exercise) {
  selectedExercise = exercise;
  document.getElementById("result").textContent = `Selected: ${exercise}`;
  resetTimer();
}

function toggleTimer() {
  const startStopBtn = document.getElementById("startStopBtn");

  if (!isRunning) {
    if (!selectedExercise) {
      alert("Please select an exercise first!");
      return;
    }
    startTimer();
    startStopBtn.textContent = "Stop";
    startStopBtn.classList.add("active");
  } else {
    stopTimer();
    startStopBtn.textContent = "Start";
    startStopBtn.classList.remove("active");
    resetTimer();
  }

  isRunning = !isRunning;
}

function startTimer() {
  startTime = Date.now();
  timer = setInterval(updateTimer, 10);
}

function stopTimer() {
  clearInterval(timer);
  calculateKcal();
  updateProgress();
}

function resetTimer() {
  clearInterval(timer);
  document.getElementById("timer").textContent = "00:00:00.000";
  isRunning = false;
  const startStopBtn = document.getElementById("startStopBtn");
  startStopBtn.textContent = "Start";
  startStopBtn.classList.remove("active");
}

function updateTimer() {
  let elapsedTime = Date.now() - startTime;
  let hrs = Math.floor(elapsedTime / 3600000);
  let mins = Math.floor((elapsedTime % 3600000) / 60000);
  let secs = Math.floor((elapsedTime % 60000) / 1000);
  let ms = elapsedTime % 1000;
  document.getElementById("timer").textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}



function calculateKcal() {
  let hours = (Date.now() - startTime) / 3600000;

  let kcal = exercises[selectedExercise].kcalPerHour * hours;
  
  exercises[selectedExercise].totalKcal += kcal;
 
  document.getElementById('result').innerHTML =
       `Calories burned: ${kcal.toFixed(2)} kcal🔥`;
  updateTotalKcal();
}

function updateTotalKcal() {
  let totalKcal = Object.values(exercises).reduce((sum, ex) => {
   
    return sum + ex.totalKcal;
  }, 0);
  
  document.getElementById('totalKcal').innerHTML =`  ${totalKcal.toFixed(2)} kcal 🔥`;
  
  let startAngle = 0;
  for (let ex in exercises) {
    let percentage = totalKcal > 0 ? exercises[ex].totalKcal / totalKcal : 0;
    updateCircularProgress(ex, percentage, startAngle);
    startAngle += percentage * 360;
  }
}



function updateCircularProgress(exercise, percentage, startAngle) {
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);
  const progressBar = document.getElementById(`${exercise}Progress`);

  progressBar.style.strokeDasharray = circumference;
  progressBar.style.strokeDashoffset = offset;
  progressBar.style.stroke = exercises[exercise].color;
  progressBar.style.transform = `rotate(${startAngle}deg)`;
  progressBar.style.transformOrigin = "center";
}
function toggleProgress() {
  let progressSection = document.getElementById("progressSection");
  if (progressSection.style.display === "none" || progressSection.style.display === "") {
    progressSection.style.display = "block";
  } else {
    progressSection.style.display = "none";
  }
}
function resetExercises() {
  for (let ex in exercises) {
    exercises[ex].totalKcal = 0;
  }
 resetTimer();
  updateTotalKcal();
  alert('Progress has been reset!');
}

  updateTotalKcal();
  resetTimer();
