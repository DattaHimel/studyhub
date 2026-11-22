/*
  chart.js - Stage 6: draw a progress chart on the <canvas>

  Course topic: canvas (week 11).
  Same tools as the lecture:
    - canvas.getContext("2d") gives us a "pen" (the context)
    - fillStyle / fillRect      draw filled rectangles (the bars)
    - fillText                  writes text
    - beginPath / moveTo / lineTo / stroke   draw a line (the axis)
    - clearRect                 wipes the canvas before redrawing

  The chart shows how many tasks are in To Do, Doing and Done,
  and what percentage of all tasks is finished.

  Every place that differs from the course style is marked with "MODERN:".
*/

// the three bars: which status, its label and its colour
const CHART_BARS = [
  { status: "todo",  label: "To Do", color: "#94a3b8" },
  { status: "doing", label: "Doing", color: "#f59e0b" },
  { status: "done",  label: "Done",  color: "#10b981" }
];


// draw the whole chart (called by renderBoard in tasks.js, and when the window resizes)
function drawChart() {
  // get the canvas and its 2d context (same as the lecture)
  const canvas = document.getElementById("progressChart");
  const context = canvas.getContext("2d");

  // MODERN: make the drawing sharp on high-resolution screens (most laptops and phones).
  // The canvas is stretched by CSS to fill its card. If its pixel size stays 600x220,
  // the browser blows it up and it looks blurry. So we:
  //   1. read how big it is on screen (getBoundingClientRect)
  //   2. give it that many REAL pixels, times the screen's pixel density
  //   3. scale the pen so we can keep drawing in normal "CSS pixels"
  const box = canvas.getBoundingClientRect();
  const density = window.devicePixelRatio || 1;
  canvas.width = box.width * density;
  canvas.height = box.height * density;
  context.scale(density, density);

  const width = box.width;
  const height = box.height;

  // wipe the old drawing (course: clearRect)
  context.clearRect(0, 0, width, height);

  // Stage 9: read the colours from the CSS variables, so the chart
  // matches light and dark mode (a canvas can't use CSS directly)
  // MODERN: getComputedStyle reads the final CSS values of an element
  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--text").trim();
  const mutedColor = styles.getPropertyValue("--muted").trim();
  const trackColor = styles.getPropertyValue("--column").trim();

  // count the tasks in each column (the tasks array lives in tasks.js)
  // MODERN: map() turns each bar into its count, giving e.g. [3, 1, 2]
  const counts = CHART_BARS.map(function (bar) {
    return tasks.filter(task => task.status === bar.status).length;
  });
  const total = tasks.length;
  const doneCount = counts[2];

  context.font = "15px Segoe UI, Roboto, Arial, sans-serif";
  context.textBaseline = "middle";

  // nothing to show yet
  if (total === 0) {
    context.fillStyle = mutedColor;
    context.textAlign = "center";
    context.fillText("Add a task to see your progress.", width / 2, height / 2);
    return;
  }

  // the headline: "2 of 5 tasks done (40%)"
  const percent = Math.round((doneCount / total) * 100);
  context.fillStyle = textColor;
  context.textAlign = "left";
  context.font = "600 16px Segoe UI, Roboto, Arial, sans-serif";
  context.fillText(`${doneCount} of ${total} tasks done (${percent}%)`, 0, 16);

  // layout of the bars
  const labelWidth = 60;              // space on the left for "To Do", "Doing", "Done"
  const countWidth = 40;              // space on the right for the numbers
  const barAreaWidth = width - labelWidth - countWidth;
  const top = 48;                     // where the first bar starts
  const barHeight = 30;
  const gap = 18;
  const largest = Math.max(...counts, 1);
  // MODERN: "...counts" (spread) passes each number in the array to Math.max separately

  context.font = "15px Segoe UI, Roboto, Arial, sans-serif";

  CHART_BARS.forEach(function (bar, i) {
    const y = top + i * (barHeight + gap);

    // the label on the left
    context.fillStyle = textColor;
    context.textAlign = "left";
    context.fillText(bar.label, 0, y + barHeight / 2);

    // the light grey "track" behind the bar
    context.fillStyle = trackColor;
    context.fillRect(labelWidth, y, barAreaWidth, barHeight);

    // the coloured bar - its length depends on the count (course: fillRect)
    const barLength = (counts[i] / largest) * barAreaWidth;
    context.fillStyle = bar.color;
    context.fillRect(labelWidth, y, barLength, barHeight);

    // the number on the right
    context.fillStyle = textColor;
    context.textAlign = "right";
    context.fillText(counts[i], width, y + barHeight / 2);
  });

  // a thin axis line on the left of the bars (course: beginPath, moveTo, lineTo, stroke)
  context.beginPath();
  context.moveTo(labelWidth, top - 6);
  context.lineTo(labelWidth, top + 3 * (barHeight + gap) - gap + 6);
  context.strokeStyle = mutedColor;
  context.lineWidth = 1;
  context.stroke();
}


// MODERN: redraw when the window changes size, so the chart always fits its card.
// "resize" is an event on the whole window (course: events, week 3)
window.addEventListener("resize", drawChart);
