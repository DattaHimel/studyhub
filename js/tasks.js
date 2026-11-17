/*
  tasks.js - Stage 2: add tasks, show them on the board, save them in the browser

  Course topics used here:
  - DOM (week 9): createElement, appendChild, removing elements
  - JSON (week 9): JSON.stringify and JSON.parse
  - localStorage (lecture example: toDoList.html)

  Every place that differs from the course style is marked with "MODERN:".
*/

// MODERN: const instead of var.
// const = this name will always point to the same thing (it can't be reassigned).
// The course used var for everything; const/let avoid accidental overwriting bugs.
const STORAGE_KEY = "studyhub-tasks";

// MODERN: let instead of var.
// let = a variable that can change, but only exists inside its { } block.
// This array holds every task object, like the lecture's toDoList array.
let tasks = [];


/* ===================== Saving and loading ===================== */

// save the tasks array into localStorage
function saveTasks() {
  // translate the array into a JSON string, then store it (same as the lecture)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// load the tasks array from localStorage
function loadTasks() {
  // read the saved JSON string (it is null the very first time)
  const savedJSON = localStorage.getItem(STORAGE_KEY);

  // translate it back into an array, or start with an empty array
  // MODERN: the "?" ":" (ternary) is a short if/else on one line
  tasks = savedJSON ? JSON.parse(savedJSON) : [];
}


/* ===================== Adding and deleting ===================== */

// add a new task from the form
function addTask(event) {
  // MODERN: event.preventDefault() stops the form from reloading the page.
  // The course used onSubmit="return false" in the HTML; this is the
  // JavaScript-only way, used with addEventListener (see the bottom of this file).
  event.preventDefault();

  // get the values from the form
  const titleInput = document.getElementById("taskTitle");
  const title = titleInput.value.trim();
  const due = document.getElementById("taskDue").value;
  const priority = document.getElementById("taskPriority").value;

  // do nothing if the title is empty (full validation comes in Stage 4)
  if (title === "") {
    return;
  }

  // create the task object (like the lecture's taskObj)
  // MODERN: object literal written in one go instead of property by property
  const task = {
    id: Date.now(),          // unique id: the number of milliseconds since 1970
    title: title,
    due: due,
    priority: priority,
    status: "todo"           // "todo", "doing" or "done" - which column it is in
  };

  // add it to the array, save, and redraw the board
  tasks.push(task);
  saveTasks();
  renderBoard();

  // clear the form ready for the next task
  // MODERN: form.reset() empties every field at once
  document.getElementById("taskForm").reset();
  titleInput.focus();
}

// delete the task with this id
function deleteTask(id) {
  // MODERN: filter() makes a new array that keeps only the tasks whose id is different.
  // The course looped with for and used splice(i, 1); filter does the same in one line.
  // "task => task.id !== id" is an arrow function: a short way to write
  // function(task) { return task.id !== id; }
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  renderBoard();
}


/* ===================== Drawing the board ===================== */

// build the HTML element (a "card") for one task
function createTaskCard(task) {
  // create the outer card <div> (course: document.createElement)
  const card = document.createElement("div");
  card.className = "task-card priority-" + task.priority;
  card.id = "task-" + task.id;

  // the task title
  const title = document.createElement("p");
  title.className = "task-title";
  // MODERN/SAFE: textContent instead of innerHTML.
  // innerHTML would run any HTML a user types (e.g. <img onerror=...>), which is a
  // security hole called XSS. textContent always shows it as plain text.
  title.textContent = task.title;

  // the due date and priority line
  const meta = document.createElement("p");
  meta.className = "task-meta";
  const dueText = task.due ? "Due " + formatDate(task.due) : "No due date";
  // "high" -> "High" (capital first letter)
  const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  // MODERN: template literal - a string in backticks where ${ } inserts a value.
  // Same result as dueText + " · " + priorityText, but easier to read.
  meta.textContent = `${dueText} · ${priorityText}`;

  // the delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.title = "Delete task";
  deleteButton.textContent = "✕";   // the ✕ symbol

  // MODERN: addEventListener instead of onClick="..." in the HTML.
  // It keeps HTML and JavaScript separate, and lets us attach a function
  // that remembers which task this button belongs to.
  deleteButton.addEventListener("click", function () {
    deleteTask(task.id);
  });

  // put the pieces inside the card (course: appendChild)
  card.appendChild(deleteButton);
  card.appendChild(title);
  card.appendChild(meta);

  return card;
}

// draw every task in the right column and update the counts
function renderBoard() {
  // the three columns, matching the "status" values
  const columns = ["todo", "doing", "done"];

  // MODERN: forEach runs the function once for each item in the array (instead of a for loop)
  columns.forEach(function (status) {
    // get the list for this column, e.g. id="todoList"
    const list = document.getElementById(status + "List");

    // clear the old cards
    list.innerHTML = "";

    // keep only the tasks that belong in this column
    const columnTasks = tasks.filter(task => task.status === status);

    // add one card per task
    columnTasks.forEach(function (task) {
      list.appendChild(createTaskCard(task));
    });

    // show an empty message if there are no tasks
    if (columnTasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "No tasks";
      list.appendChild(empty);
    }

    // update the count bubble, e.g. id="todoCount"
    document.getElementById(status + "Count").textContent = columnTasks.length;
  });
}

// turn "2026-11-20" into "20 Nov"
function formatDate(isoDate) {
  // MODERN: toLocaleDateString formats a date for people to read.
  // The course built dates by hand with getDate(), getMonth() ...
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}


/* ===================== Start up ===================== */

// MODERN: this script is loaded with "defer" in the <head>, so this code runs
// after the whole page is built - no need for <body onLoad="...">.
loadTasks();
renderBoard();

// MODERN: addEventListener("submit", ...) instead of onSubmit="..." in the HTML
document.getElementById("taskForm").addEventListener("submit", addTask);
