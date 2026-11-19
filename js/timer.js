/*
  timer.js - Stage 5: a 25-minute focus timer (the "Pomodoro" study method)

  Course topic: animation with setInterval / clearInterval (lecture 5B).
  Same idea as the lecture's clock and slideshow:
    - setInterval runs a function again and again (here: every second)
    - clearInterval stops it
    - an animOn flag stops a second click on Start from running two timers

  Extra features:
    - Stop pauses the timer; Start carries on from where it stopped
    - Reset goes back to 25:00
    - the browser tab title shows the time left
    - finished focus sessions are counted and saved in localStorage

  Every place that differs from the course style is marked with "MODERN:".
*/

const FOCUS_MINUTES = 25;
const SESSIONS_KEY = "studyhub-sessions";

// seconds left on the timer (25 minutes = 1500 seconds)
let secondsLeft = FOCUS_MINUTES * 60;

// the setInterval schedule, so we can stop it
let timerSchedule;

// whether the timer is running (same idea as the lecture's animOn)
let animOn = false;

// the exact time (in milliseconds) when the timer should reach 0:00
let endTime = 0;


// turn 1500 seconds into "25:00"
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;    // % gives the remainder: 1501 % 60 = 1
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// show the time on the page and in the browser tab
function showTime() {
  const time = formatTime(secondsLeft);
  document.getElementById("timerDisplay").textContent = time;

  // MODERN: document.title changes the text on the browser tab,
  // so you can see the time even while you are in another tab
  document.title = animOn ? `${time} · Focus · StudyHub` : "StudyHub - Student Productivity Dashboard";
}


// start (or continue) the timer
function startTimer() {
  // only start if it is not already running (the lecture's animOn check)
  if (animOn) {
    return;
  }

  // if the timer had finished, start a fresh 25 minutes
  if (secondsLeft === 0) {
    secondsLeft = FOCUS_MINUTES * 60;
  }

  animOn = true;

  // MODERN: work out WHEN the timer should end, instead of just subtracting 1 each second.
  // The course style was: every second, seconds = seconds - 1.
  // Problem: browsers slow down setInterval in background tabs, so a "1 second" tick
  // can take longer and the timer drifts. Comparing with the real clock (Date.now())
  // keeps it exact even if the tab is in the background.
  endTime = Date.now() + secondsLeft * 1000;

  document.getElementById("timerMessage").textContent = "Focus! You've got this.";
  document.getElementById("timerCard").classList.add("running");

  // update the display 4 times a second (smooth, and never skips a number)
  timerSchedule = setInterval(tick, 250);
  showTime();
}

// runs every 250 ms while the timer is on
function tick() {
  // how many whole seconds are left until endTime
  secondsLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  showTime();

  if (secondsLeft === 0) {
    finishSession();
  }
}

// stop (pause) the timer
function stopTimer() {
  if (!animOn) {
    return;
  }

  clearInterval(timerSchedule);
  animOn = false;

  document.getElementById("timerCard").classList.remove("running");
  document.getElementById("timerMessage").textContent = "Paused.";
  showTime();
}

// stop the timer and go back to 25:00
function resetTimer() {
  clearInterval(timerSchedule);
  animOn = false;
  secondsLeft = FOCUS_MINUTES * 60;

  document.getElementById("timerCard").classList.remove("running");
  document.getElementById("timerMessage").textContent = "";
  showTime();
}

// the timer reached 0:00
function finishSession() {
  clearInterval(timerSchedule);
  animOn = false;
  document.getElementById("timerCard").classList.remove("running");

  // count one more finished session and save it
  const sessions = loadSessions() + 1;
  localStorage.setItem(SESSIONS_KEY, sessions);
  showSessions(sessions);

  document.getElementById("timerMessage").textContent = "Time's up! Take a 5-minute break. ☕";
  showTime();
}


// read how many sessions have been finished (0 the first time)
function loadSessions() {
  // MODERN: "|| 0" means "use 0 if there is nothing saved yet"
  return Number(localStorage.getItem(SESSIONS_KEY)) || 0;
}

// show the number of finished sessions
function showSessions(sessions) {
  const word = sessions === 1 ? "session" : "sessions";
  document.getElementById("sessionCount").textContent = `${sessions} focus ${word} completed`;
}


// set up the buttons (runs once when the page starts)
function setupTimer() {
  document.getElementById("startTimer").addEventListener("click", startTimer);
  document.getElementById("stopTimer").addEventListener("click", stopTimer);
  document.getElementById("resetTimer").addEventListener("click", resetTimer);

  showTime();
  showSessions(loadSessions());
}

// this file sets itself up (it does not need anything from tasks.js)
setupTimer();
