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
  document.getElementById("timer").textContent = "00:00:00.00";
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
  document.getElementById("result").innerHTML = `Calories burned: <strong>${kcal.toFixed(2)} kcal</strong> 🔥`;
  updateTotalKcal();
  
  // Update workout history
  let today = new Date().toISOString().split('T')[0];
  if (!workoutHistory[today]) {
    workoutHistory[today] = {};
  }
  if (!workoutHistory[today][selectedExercise]) {
    workoutHistory[today][selectedExercise] = 0;
  }
  workoutHistory[today][selectedExercise] += kcal;
  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  
  // Update calendar
  renderCalendar();
}

function updateTotalKcal() {
  let totalKcal = Object.values(exercises).reduce((sum, ex) => sum + ex.totalKcal, 0);
  document.getElementById("totalKcal").innerHTML = `${totalKcal.toFixed(2)} kcal 🔥`;
}

function updateProgress() {
  let totalKcal = Object.values(exercises).reduce((sum, ex) => sum + ex.totalKcal, 0);
  let startAngle = 0;
  for (let ex in exercises) {
    let percentage = totalKcal > 0 ? exercises[ex].totalKcal / totalKcal : 0;
    updateCircularProgress(ex, percentage, startAngle);
    startAngle += percentage * 360;
  }
}

function updateCircularProgress(exercise, percentage, startAngle) {
  const radius = window.innerWidth <= 768 ? 90 : 140;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);
  const progressBar = document.getElementById(`${exercise}Progress`);

  progressBar.style.strokeDasharray = circumference;
  progressBar.style.strokeDashoffset = offset;
  progressBar.style.stroke = exercises[exercise].color;
  progressBar.style.transform = `rotate(${startAngle}deg)`;
  progressBar.style.transformOrigin = "center";
}



function renderCalendar() {
  const calendarElement = document.getElementById('calendar');
  calendarElement.innerHTML = '';

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Add month and year header
  const monthYearHeader = document.createElement('div');
  monthYearHeader.className = 'month-year-header';
  monthYearHeader.textContent = `${today.toLocaleString('default', { month: 'long' })} ${currentYear}`;
  calendarElement.appendChild(monthYearHeader);

  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarElement.appendChild(dayHeader);
  });

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarElement.appendChild(emptyDay);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.innerHTML = `
      <div class="day-number">${day}</div>
      <div class="kcal"></div>
    `;

    if (workoutHistory[date]) {
      dayElement.classList.add('has-workout');
      const totalKcal = Object.values(workoutHistory[date]).reduce((sum, kcal) => sum + kcal, 0);
      dayElement.querySelector('.kcal').textContent = `${totalKcal.toFixed(0)} kcal`;
    }

    calendarElement.appendChild(dayElement);
  }
}
function renderCalendar() {
  console.log('Current workout history:', workoutHistory);
  const calendarElement = document.getElementById('calendar');
  calendarElement.innerHTML = '';

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Add month and year header
  const monthYearHeader = document.createElement('div');
  monthYearHeader.className = 'month-year-header';
  monthYearHeader.textContent = `${today.toLocaleString('default', { month: 'long' })} ${currentYear}`;
  calendarElement.appendChild(monthYearHeader);

  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarElement.appendChild(dayHeader);
  });

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarElement.appendChild(emptyDay);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    
    const kcalCount = document.createElement('div');
    kcalCount.className = 'kcal-count';
    
    dayElement.appendChild(dayNumber);
    dayElement.appendChild(kcalCount);

    if (workoutHistory[date]) {
      dayElement.classList.add('has-workout');
      const totalKcal = Object.values(workoutHistory[date]).reduce((sum, kcal) => sum + kcal, 0);
      kcalCount.textContent = `${totalKcal.toFixed(0)} kcal`;
    }

    calendarElement.appendChild(dayElement);
  }
}

// Make sure to call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  renderCalendar();
  updateProgress();
});

// Update the calculateKcal function to call renderCalendar
function calculateKcal() {
  let hours = (Date.now() - startTime) / 3600000;
  let kcal = exercises[selectedExercise].kcalPerHour * hours;
  exercises[selectedExercise].totalKcal += kcal;
  document.getElementById("result").innerHTML = `Calories burned: <strong>${kcal.toFixed(2)} kcal</strong> 🔥`;
  updateTotalKcal();
  
  // Update workout history
  let today = new Date().toISOString().split('T')[0];
  if (!workoutHistory[today]) {
    workoutHistory[today] = {};
  }
  if (!workoutHistory[today][selectedExercise]) {
    workoutHistory[today][selectedExercise] = 0;
  }
  workoutHistory[today][selectedExercise] += kcal;
  
  // Save to localStorage
  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  
  console.log('Workout history updated:', workoutHistory);
  
  // Update calendar
  renderCalendar();
}

// Add this function to load workout history from localStorage
function loadWorkoutHistory() {
  const savedHistory = localStorage.getItem('workoutHistory');
  if (savedHistory) {
    workoutHistory = JSON.parse(savedHistory);
  }
}

// Call this function when the page loads
loadWorkoutHistory();
function addTestWorkout() {
  const today = new Date().toISOString().split('T')[0];
  if (!workoutHistory[today]) {
    workoutHistory[today] = {};
  }
  if (!workoutHistory[today]['running']) {
    workoutHistory[today]['running'] = 0;
  }
  workoutHistory[today]['running'] += 300; // Add 300 kcal for running

  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  renderCalendar();
  console.log('Test workout added:', workoutHistory);
}

// Call this function to test
// addTestWorkout();
function clearWorkoutHistory() {
  localStorage.removeItem('workoutHistory');
  workoutHistory = {};
  renderCalendar();
  console.log('Workout history cleared');
}

// Call this function to clear history
// clearWorkoutHistory();