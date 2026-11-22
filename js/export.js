/*
  export.js - Stage 8: download your tasks as an XML file or a JSON file

  Course topics:
    - XML (week 6): one root element, attributes for metadata, elements for data
    - XSD (week 7): the file xml/studyhub-tasks.xsd describes and checks this XML
    - JSON (week 9): JSON.stringify(obj, null, 2) for a pretty-printed file

  The XML we create looks like this (same shape as the lecture's studentList):

    <?xml version="1.0" encoding="UTF-8"?>
    <taskList exportDate="2026-11-22" ...>
      <task id="1763380000000" status="todo" priority="high">
        <title>Finish CSIT884 assignment</title>
        <due>2026-11-20</due>
      </task>
    </taskList>

  Every place that differs from the course style is marked with "MODERN:".
*/


// build the XML text for all tasks
function buildTasksXML() {
  // MODERN: document.implementation.createDocument makes a real XML document
  // in memory, and we add elements to it with the same DOM methods as Stage 2
  // (createElement, setAttribute, appendChild).
  // Why not just join strings like "<title>" + title + "</title>"?
  // Because a title such as  Fish & Chips <3  would break the XML.
  // The DOM escapes & < > for us automatically (& becomes &amp; and so on).
  const xmlDoc = document.implementation.createDocument(null, "taskList", null);
  const root = xmlDoc.documentElement;

  // metadata goes in attributes (lecture rule)
  root.setAttribute("exportDate", todayString());   // todayString() is in validation.js

  // tell XML tools which schema checks this file
  // (the course wrote xsi:schemaLocation; for XML with no namespace the correct
  //  attribute is xsi:noNamespaceSchemaLocation)
  root.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance",
                      "xsi:noNamespaceSchemaLocation", "studyhub-tasks.xsd");

  // one <task> element per task (the tasks array lives in tasks.js)
  tasks.forEach(function (task) {
    const taskElement = xmlDoc.createElement("task");
    taskElement.setAttribute("id", task.id);
    taskElement.setAttribute("status", task.status);
    taskElement.setAttribute("priority", task.priority);

    // the data goes in child elements (lecture rule)
    const title = xmlDoc.createElement("title");
    title.textContent = task.title;
    taskElement.appendChild(title);

    // <due> is optional - only add it if the task has a due date
    if (task.due) {
      const due = xmlDoc.createElement("due");
      due.textContent = task.due;
      taskElement.appendChild(due);
    }

    root.appendChild(taskElement);
  });

  // MODERN: XMLSerializer turns the XML document back into text
  const xmlText = new XMLSerializer().serializeToString(xmlDoc);

  // add the XML declaration on the first line, and put each <task> on its own line
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + prettyPrint(xmlText);
}

// add line breaks and indentation so the file is easy for people to read
function prettyPrint(xmlText) {
  return xmlText
    .replace(/<task /g, "\n  <task ")
    .replace(/<title>/g, "\n    <title>")
    .replace(/<due>/g, "\n    <due>")
    .replace(/<\/task>/g, "\n  </task>")
    .replace(/<\/taskList>/g, "\n</taskList>\n");
  // MODERN: /<task /g is a "regular expression" - a search pattern.
  // The g at the end means "replace every match, not just the first".
}


// download some text as a file
function downloadFile(fileName, text, type) {
  // MODERN: a Blob is a chunk of file data that lives in the browser's memory.
  // URL.createObjectURL gives it a temporary address, and a link with the
  // "download" attribute saves it as a file instead of opening it.
  const blob = new Blob([text], { type: type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();                      // pretend the user clicked the link
  URL.revokeObjectURL(link.href);    // free the memory again
}

// file names like "studyhub-tasks-2026-11-22.xml"
function exportFileName(extension) {
  return `studyhub-tasks-${todayString()}.${extension}`;
}


// the "Export XML" button
function exportXML() {
  downloadFile(exportFileName("xml"), buildTasksXML(), "application/xml");
  showExportMessage("XML file downloaded.");
}

// the "Export JSON" button
function exportJSON() {
  // JSON.stringify(value, null, 2) adds line breaks and 2-space indents (JSON lecture)
  const jsonText = JSON.stringify({ exportDate: todayString(), tasks: tasks }, null, 2);
  downloadFile(exportFileName("json"), jsonText, "application/json");
  showExportMessage("JSON file downloaded.");
}

function showExportMessage(text) {
  const message = document.getElementById("exportMessage");
  message.textContent = tasks.length === 0 ? "You have no tasks yet - the file is empty." : text;
}


// set up the buttons (runs once when the page starts)
function setupExport() {
  document.getElementById("exportXml").addEventListener("click", exportXML);
  document.getElementById("exportJson").addEventListener("click", exportJSON);
}

setupExport();
