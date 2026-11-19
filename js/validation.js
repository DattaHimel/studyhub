/*
  validation.js - Stage 4: check the "Add a task" form before adding a task

  Course topic: form validation (week 11).
  Same idea as the lecture's validateForm():
    - read each field, trim() the spaces
    - if something is wrong: show a red message in an error <span> and stop
    - if it is fine: clear the message
    - return true (valid) or false (not valid)

  Rules for StudyHub:
    Task name: required, 3 to 60 characters, not the same as a task that is not done yet
    Due date:  optional, but if given it cannot be in the past

  Every place that differs from the course style is marked with "MODERN:".
*/

// MODERN: const for values that never change ("constants"), written in CAPITALS by convention
const TITLE_MIN = 3;
const TITLE_MAX = 60;


// show an error message under a field and make the field's border red
function showError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  // MODERN: classList.add("invalid") turns on a red-border style from the CSS file.
  // The course set colours directly; keeping styles in CSS is easier to change.
  document.getElementById(inputId).classList.add("invalid");
}

// remove the error message and the red border
function clearError(inputId, errorId) {
  document.getElementById(errorId).textContent = "";
  document.getElementById(inputId).classList.remove("invalid");
}


// today's date as "YYYY-MM-DD", the same format the date input gives us
function todayString() {
  const now = new Date();
  // MODERN: padStart(2, "0") turns 7 into "07" (month and day need 2 digits)
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}


// check the task name; return true if it is valid
function validateTitle() {
  const title = document.getElementById("taskTitle").value.trim();

  if (title === "") {
    showError("taskTitle", "titleError", "Please enter a task name.");
    return false;
  }

  if (title.length < TITLE_MIN) {
    showError("taskTitle", "titleError", `Task name must be at least ${TITLE_MIN} characters.`);
    return false;
  }

  if (title.length > TITLE_MAX) {
    showError("taskTitle", "titleError", `Task name must be ${TITLE_MAX} characters or fewer (now ${title.length}).`);
    return false;
  }

  // no duplicates among tasks that are not finished yet
  // MODERN: some() returns true if ANY task matches. toLowerCase() makes
  // "Read notes" and "read notes" count as the same.
  // (the tasks array lives in tasks.js)
  const duplicate = tasks.some(function (task) {
    return task.status !== "done" && task.title.toLowerCase() === title.toLowerCase();
  });
  if (duplicate) {
    showError("taskTitle", "titleError", "You already have this task on your board.");
    return false;
  }

  clearError("taskTitle", "titleError");
  return true;
}


// check the due date; return true if it is valid
function validateDue() {
  const due = document.getElementById("taskDue").value;

  // the due date is optional
  if (due === "") {
    clearError("taskDue", "dueError");
    return true;
  }

  // "YYYY-MM-DD" strings can be compared directly: "2026-11-01" < "2026-11-18"
  if (due < todayString()) {
    showError("taskDue", "dueError", "The due date can't be in the past.");
    return false;
  }

  clearError("taskDue", "dueError");
  return true;
}


// check the whole form; return true only if every field is valid
// (same job as the lecture's validateForm)
function validateTaskForm() {
  // run BOTH checks first, so the user sees every error at once,
  // then combine the answers
  const titleOk = validateTitle();
  const dueOk = validateDue();
  return titleOk && dueOk;
}


// set up the live checks (called once when the page starts)
function setupValidation() {
  const titleInput = document.getElementById("taskTitle");
  const dueInput = document.getElementById("taskDue");

  // stop the date picker offering days in the past
  dueInput.min = todayString();

  // MODERN: the "input" event fires on every key press.
  // As soon as the user starts fixing a field, its old error disappears.
  // (course topic: events - similar to onChange, but instant)
  titleInput.addEventListener("input", function () {
    clearError("taskTitle", "titleError");
  });

  dueInput.addEventListener("change", validateDue);
}
