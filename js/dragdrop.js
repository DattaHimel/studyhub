/*
  dragdrop.js - Stage 3: drag task cards between To Do, Doing and Done

  Course topic: drag and drop (week 11, helloWorld.html).
  The idea is exactly the same as the lecture:
    1. dragStart: remember WHICH item is being dragged (store its id in dataTransfer)
    2. dragOver:  call preventDefault() so the browser allows a drop here
    3. drop:      read the id back from dataTransfer and do the logic

  The only real difference: the lecture checked a correct/incorrect pair,
  here the "logic" is changing the task's status to the column it was dropped on.

  Every place that differs from the course style is marked with "MODERN:".
*/


// the columns in order, used by the arrow buttons
const COLUMN_ORDER = ["todo", "doing", "done"];

// add the ← → buttons that move a card one column left or right.
// Stage 9: HTML5 drag and drop does not work on touch screens,
// so phones need buttons. They also help keyboard users.
function addMoveButtons(card, task) {
  const position = COLUMN_ORDER.indexOf(task.status);   // 0, 1 or 2

  const row = document.createElement("div");
  row.className = "move-row";

  // the ← button (not shown in the first column)
  if (position > 0) {
    const left = document.createElement("button");
    left.className = "move-btn";
    left.textContent = "\u2190";                    // ←
    // MODERN: aria-label tells screen readers what an icon-only button does
    left.setAttribute("aria-label", "Move to " + columnName(COLUMN_ORDER[position - 1]));
    left.title = left.getAttribute("aria-label");
    left.addEventListener("click", function () {
      moveTask(task.id, COLUMN_ORDER[position - 1]);   // moveTask is in tasks.js
    });
    row.appendChild(left);
  }

  // the → button (not shown in the last column)
  if (position < COLUMN_ORDER.length - 1) {
    const right = document.createElement("button");
    right.className = "move-btn";
    right.textContent = "\u2192";                   // →
    right.setAttribute("aria-label", "Move to " + columnName(COLUMN_ORDER[position + 1]));
    right.title = right.getAttribute("aria-label");
    right.addEventListener("click", function () {
      moveTask(task.id, COLUMN_ORDER[position + 1]);
    });
    row.appendChild(right);
  }

  card.appendChild(row);
}

// "doing" -> "Doing"
function columnName(status) {
  return { todo: "To Do", doing: "Doing", done: "Done" }[status];
}


// make one task card movable: by dragging, or with the arrow buttons
// (called by createTaskCard in tasks.js)
function makeCardDraggable(card, task) {
  // Stage 9: the arrow buttons for phones and keyboards
  addMoveButtons(card, task);

  // Stage 9: play the fade-in animation only on a card that was JUST added.
  // The board is redrawn after every change, so animating every card would make
  // the whole board flicker. A task's id is the time it was created (Date.now()),
  // so "created less than 1 second ago" means "just added".
  if (Date.now() - task.id < 1000) {
    card.classList.add("is-new");
  }

  // course: draggable="true" in the HTML. Here we set it from JavaScript
  // because the cards are created by JavaScript.
  card.draggable = true;

  // MODERN: addEventListener("dragstart", ...) instead of onDragStart="dragStart(event)"
  card.addEventListener("dragstart", function (event) {
    // store the dragged task's id in the dataTransfer object (same as the lecture)
    event.dataTransfer.setData("text/plain", task.id);

    // make the card look faded while it is being dragged
    // MODERN: classList.add / classList.remove switch a CSS class on and off.
    // The course changed styles one by one with element.style.xxx.
    card.classList.add("dragging");
  });

  // when the drag finishes (dropped anywhere, or cancelled), un-fade the card
  card.addEventListener("dragend", function () {
    card.classList.remove("dragging");
  });
}


// make the three columns accept drops (called once when the page starts)
function setupDragAndDrop() {
  const columns = document.querySelectorAll(".column");
  // MODERN: querySelectorAll(".column") finds every element with class "column"
  // using a CSS selector. The course used getElementsByClassName("column").

  columns.forEach(function (column) {

    // a card is being dragged over this column
    column.addEventListener("dragover", function (event) {
      // allow the drop (same as the lecture's dragOver)
      event.preventDefault();
      // highlight the column so the user can see where the card will land
      column.classList.add("drag-over");
    });

    // the card has left this column without dropping
    column.addEventListener("dragleave", function (event) {
      // only remove the highlight if the mouse really left the column
      // (not just moved onto a card inside it)
      if (!column.contains(event.relatedTarget)) {
        column.classList.remove("drag-over");
      }
    });

    // the card was dropped on this column
    column.addEventListener("drop", function (event) {
      event.preventDefault();
      column.classList.remove("drag-over");

      // read the dragged task's id back (same as the lecture)
      // it comes back as text, so turn it into a number
      const taskId = Number(event.dataTransfer.getData("text/plain"));

      // MODERN: event.currentTarget instead of event.target.
      // The lecture used event.target.id, which is the exact element under the mouse.
      // If you drop on top of another card, event.target would be that CARD, not the column!
      // currentTarget is always the element this listener belongs to: the column.
      const newStatus = event.currentTarget.id;   // "todo", "doing" or "done"

      moveTask(taskId, newStatus);
    });
  });
}
