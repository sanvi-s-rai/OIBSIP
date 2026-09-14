const STORE_TASKS = "sanctuary_tasks_v4";
const STORE_WATER = "sanctuary_water_v4";
const STORE_NOTES = "sanctuary_notes_v4";

let taskItems = [];
let waterGlasses = 0;
let editingId = null;
let incompleteReminderTimer = null;
let waterReminderTimer = null;

window.addEventListener("DOMContentLoaded", () => {
  initDateDisplay();
  loadTasksFromStorage();
  loadWaterFromStorage();
  loadNotesFromStorage();
  renderTasksView();
  setupIncompleteTaskReminderTimer();
  setupWaterTimer();
  setupDueScheduleChecker();
});

function initDateDisplay() {
  const opts = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  document.getElementById("dateHeader").textContent =
    new Date().toLocaleDateString(undefined, opts);

  document.getElementById("inputDate").value =
    new Date().toISOString().split('T')[0];
}

// Task Functions
function loadTasksFromStorage() {
  try {
    taskItems = JSON.parse(localStorage.getItem(STORE_TASKS)) || [];
  } catch (e) {
    taskItems = [];
  }
}

function saveTasksToStorage() {
  localStorage.setItem(STORE_TASKS, JSON.stringify(taskItems));
  renderTasksView();
}

function handleCreateTask(e) {
  e.preventDefault();

  const descInput = document.getElementById("inputDesc");
  const dateInput = document.getElementById("inputDate");
  const timeInput = document.getElementById("inputTime");

  const text = descInput.value.trim();

  if (!text) return;

  const now = new Date();

  const createdAt =
    now.toLocaleDateString() +
    " " +
    now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  const newTask = {
    id: "task_" + Date.now(),
    text: text,
    date: dateInput.value || "No date",
    time: timeInput.value || "--:--",
    status: "pending",
    createdAt: createdAt,
    resolvedAt: null
  };

  taskItems.unshift(newTask);

  saveTasksToStorage();

  descInput.value = "";
  timeInput.value = "";

  sendToast("Task added to pending list.");
}

// Ticking Right (✓) or Wrong (✕)
function setTaskStatus(id, newStatus) {
  const task = taskItems.find(t => t.id === id);

  if (!task) return;

  if (task.status === newStatus) {

    // Toggle back to pending
    task.status = "pending";
    task.resolvedAt = null;

    sendToast("Task reset to pending.");

  } else {

    task.status = newStatus;

    task.resolvedAt =
      new Date().toLocaleDateString() +
      " " +
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

    if (newStatus === "right") {
      playSuccessChime();
      sendToast("Task marked Right (✓ Completed)! ☕");

    } else if (newStatus === "wrong") {
      playAlertTone();
      sendToast(
        "Task marked Wrong (✕ Incomplete)! ⚠️",
        "toast-warning"
      );
    }
  }

  saveTasksToStorage();
}

function deleteTaskItem(id) {
  taskItems = taskItems.filter(t => t.id !== id);

  saveTasksToStorage();

  sendToast("Task removed.");
}

function clearCompletedRight() {
  taskItems = taskItems.filter(t => t.status !== "right");

  saveTasksToStorage();

  sendToast("Completed right tasks cleared.");
}

function clearMarkedWrong() {
  taskItems = taskItems.filter(t => t.status !== "wrong");

  saveTasksToStorage();

  sendToast("Missed tasks cleared.");
}

// Inline Editing
function startEdit(id) {
  editingId = id;
  renderTasksView();
}

function cancelEdit() {
  editingId = null;
  renderTasksView();
}

function saveEdit(id) {
  const input =
    document.getElementById("inlineEditInput_" + id);

  if (!input) return;

  const newText = input.value.trim();

  if (!newText) return;

  const task = taskItems.find(t => t.id === id);

  if (task) {
    task.text = newText;
    saveTasksToStorage();
  }

  editingId = null;

  renderTasksView();

  sendToast("Task updated.");
}

// Render Tables
function renderTasksView() {
  const pendingTbody =
    document.getElementById("pendingTbody");

  const rightTbody =
    document.getElementById("rightTbody");

  const wrongTbody =
    document.getElementById("wrongTbody");

  const pendingEmpty =
    document.getElementById("pendingEmptyNotice");

  const rightEmpty =
    document.getElementById("rightEmptyNotice");

  const wrongEmpty =
    document.getElementById("wrongEmptyNotice");

  pendingTbody.innerHTML = "";
  rightTbody.innerHTML = "";
  wrongTbody.innerHTML = "";

  const pendingTasks =
    taskItems.filter(t => t.status === "pending");

  const rightTasks =
    taskItems.filter(t => t.status === "right");

  const wrongTasks =
    taskItems.filter(t => t.status === "wrong");

  document.getElementById("statPendingCount").textContent =
    pendingTasks.length;

  document.getElementById("statRightCount").textContent =
    rightTasks.length;

  document.getElementById("statWrongCount").textContent =
    wrongTasks.length;

  document.getElementById("badgePending").textContent =
    `${pendingTasks.length} pending`;

  document.getElementById("badgeRight").textContent =
    `${rightTasks.length} completed`;

  document.getElementById("badgeWrong").textContent =
    `${wrongTasks.length} missed`;

  const unfinishedCount =
    pendingTasks.length + wrongTasks.length;

  document.getElementById("pendingAlertPill").textContent =
    `${unfinishedCount} Unfinished`;

  // 1. Pending Table
  if (pendingTasks.length === 0) {

    pendingEmpty.style.display = "block";
    document.getElementById("pendingTable").style.display = "none";

  } else {

    pendingEmpty.style.display = "none";
    document.getElementById("pendingTable").style.display = "table";

    pendingTasks.forEach(task =>
      pendingTbody.appendChild(buildRow(task))
    );
  }

  // 2. Right (✓) Table
  if (rightTasks.length === 0) {

    rightEmpty.style.display = "block";
    document.getElementById("rightTable").style.display = "none";

  } else {

    rightEmpty.style.display = "none";
    document.getElementById("rightTable").style.display = "table";

    rightTasks.forEach(task =>
      rightTbody.appendChild(buildRow(task))
    );
  }

  // 3. Wrong (✕) Table
  if (wrongTasks.length === 0) {

    wrongEmpty.style.display = "block";
    document.getElementById("wrongTable").style.display = "none";

  } else {

    wrongEmpty.style.display = "none";
    document.getElementById("wrongTable").style.display = "table";

    wrongTasks.forEach(task =>
      wrongTbody.appendChild(buildRow(task))
    );
  }
}

function buildRow(task) {
  const tr = document.createElement("tr");

  tr.className =
    "task-row " +
    (
      task.status === "right"
        ? "row-right"
        : task.status === "wrong"
          ? "row-wrong"
          : ""
    );

  const isEditing = editingId === task.id;

  // Column 1: Ticking Right (✓) or Wrong (✕)
  const tdTick = document.createElement("td");

  tdTick.className = "col-tick";

  if (task.status === "pending") {

    tdTick.innerHTML = `
      <div class="tick-controls">
        <button
          type="button"
          class="btn-tick btn-tick-right"
          title="Mark Right / Done (✓)"
          onclick="setTaskStatus('${task.id}', 'right')"
        >
          ✓
        </button>

        <button
          type="button"
          class="btn-tick btn-tick-wrong"
          title="Mark Wrong / Missed (✕)"
          onclick="setTaskStatus('${task.id}', 'wrong')"
        >
          ✕
        </button>
      </div>
    `;

  } else if (task.status === "right") {

    tdTick.innerHTML = `
      <span
        class="status-badge-inline status-right"
        title="Click to undo back to pending"
        onclick="setTaskStatus('${task.id}', 'right')"
      >
        ✓ Done
      </span>
    `;

  } else if (task.status === "wrong") {

    tdTick.innerHTML = `
      <span
        class="status-badge-inline status-wrong"
        title="Click to undo back to pending"
        onclick="setTaskStatus('${task.id}', 'wrong')"
      >
        ✕ Missed
      </span>
    `;
  }

  // Column 2: Description + Timestamp
  const tdDesc = document.createElement("td");

  tdDesc.className = "col-desc";

  if (isEditing) {

    tdDesc.innerHTML = `
      <input
        type="text"
        id="inlineEditInput_${task.id}"
        class="inline-edit"
        value="${escapeHtml(task.text)}"
      >
    `;

  } else {

    const stamp = task.resolvedAt
      ? `${task.status === 'right' ? 'Completed' : 'Marked'}: ${task.resolvedAt}`
      : `Created: ${task.createdAt}`;

    tdDesc.innerHTML = `
      <div class="task-text">
        ${escapeHtml(task.text)}
      </div>

      <span class="task-time-stamp">
        ${stamp}
      </span>
    `;
  }

  // Column 3: Date
  const tdDate = document.createElement("td");

  tdDate.className = "col-date";
  tdDate.textContent = task.date;

  // Column 4: Time
  const tdTime = document.createElement("td");

  tdTime.className = "col-time";
  tdTime.textContent = task.time;

  // Column 5: Actions
  const tdActions = document.createElement("td");

  tdActions.className = "col-actions";

  if (isEditing) {

    tdActions.innerHTML = `
      <button
        class="btn-action btn-save"
        onclick="saveEdit('${task.id}')"
      >
        Save
      </button>

      <button
        class="btn-action btn-cancel"
        onclick="cancelEdit()"
      >
        Cancel
      </button>
    `;

  } else {

    tdActions.innerHTML = `
      <button
        class="btn-action btn-edit"
        onclick="startEdit('${task.id}')"
      >
        Edit
      </button>

      <button
        class="btn-action btn-delete"
        onclick="deleteTaskItem('${task.id}')"
      >
        Delete
      </button>
    `;
  }

  tr.appendChild(tdTick);
  tr.appendChild(tdDesc);
  tr.appendChild(tdDate);
  tr.appendChild(tdTime);
  tr.appendChild(tdActions);

  return tr;
}

// Incomplete Task Reminder System
function toggleIncompleteReminder() {
  const active =
    document.getElementById("incompleteReminderToggle").checked;

  if (active) {

    setupIncompleteTaskReminderTimer();

    sendToast("Incomplete reminder enabled.");

  } else {

    if (incompleteReminderTimer)
      clearInterval(incompleteReminderTimer);

    sendToast("Incomplete reminder paused.");
  }
}

function updateReminderFrequency() {
  setupIncompleteTaskReminderTimer();

  sendToast("Reminder frequency updated.");
}

function setupIncompleteTaskReminderTimer() {
  if (incompleteReminderTimer)
    clearInterval(incompleteReminderTimer);

  const minutes =
    parseInt(
      document.getElementById("reminderIntervalSelect").value || "20",
      10
    );

  const intervalMs =
    minutes * 60 * 1000;

  incompleteReminderTimer =
    setInterval(() => {

      const active =
        document.getElementById("incompleteReminderToggle").checked;

      if (active) {
        fireIncompleteTaskReminder(false);
      }

    }, intervalMs);
}

function fireIncompleteTaskReminder(isManualTest = false) {

  const unfinished =
    taskItems.filter(
      t => t.status === "pending" || t.status === "wrong"
    );

  if (unfinished.length > 0) {

    playAlertTone();

    const firstTwo =
      unfinished
        .slice(0, 2)
        .map(t => `"${t.text}"`)
        .join(", ");

    const moreCount =
      unfinished.length > 2
        ? ` and ${unfinished.length - 2} more`
        : "";

    sendToast(
      `🔔 Pending Alert: You have ${unfinished.length} unfinished/missed task(s)! ${firstTwo}${moreCount}.`,
      "toast-warning"
    );

  } else {

    if (isManualTest) {

      playSuccessChime();

      sendToast(
        "☕ Wonderful! All tasks are marked Right (✓)!",
        "toast-water"
      );
    }
  }
}

// Water Tracker
function loadWaterFromStorage() {

  waterGlasses =
    parseInt(
      localStorage.getItem(STORE_WATER) || "0",
      10
    );

  renderWaterDisplay();
}

function saveWaterToStorage() {

  localStorage.setItem(
    STORE_WATER,
    waterGlasses.toString()
  );

  renderWaterDisplay();
}

function logWaterGlass() {

  if (waterGlasses < 8) {

    waterGlasses++;

    saveWaterToStorage();

    playWaterChime();

    sendToast(
      "Logged 1 glass of water 💧",
      "toast-water"
    );

  } else {

    sendToast(
      "8 glasses daily water goal achieved! 🌿",
      "toast-water"
    );
  }
}

function resetWaterTracker() {

  waterGlasses = 0;

  saveWaterToStorage();

  sendToast("Water tracker reset.");
}

function renderWaterDisplay() {

  document.getElementById("waterNumber").textContent =
    waterGlasses;

  document.getElementById("statWaterCount").textContent =
    `${waterGlasses}/8`;

  const container =
    document.getElementById("waterIconsContainer");

  container.innerHTML = "";

  for (let i = 1; i <= 8; i++) {

    const drop =
      document.createElement("div");

    drop.className =
      "water-drop " +
      (i <= waterGlasses ? "filled" : "");

    drop.textContent = "💧";

    drop.title = `Glass ${i}`;

    drop.onclick = () => {

      waterGlasses = i;

      saveWaterToStorage();

      playWaterChime();
    };

    container.appendChild(drop);
  }

  const statusEl =
    document.getElementById("waterFeedback");

  if (waterGlasses >= 8)
    statusEl.textContent = "Goal Achieved! 🏆";

  else if (waterGlasses >= 4)
    statusEl.textContent = "Halfway there 💧";

  else
    statusEl.textContent = "Stay hydrated!";
}

function toggleWaterChime() {

  const enabled =
    document.getElementById("waterChimeToggle").checked;

  if (enabled) {

    setupWaterTimer();

    sendToast("Water reminder active.");

  } else {

    if (waterReminderTimer)
      clearInterval(waterReminderTimer);

    sendToast("Water reminder paused.");
  }
}

function setupWaterTimer() {

  if (waterReminderTimer)
    clearInterval(waterReminderTimer);

  waterReminderTimer =
    setInterval(() => {

      const enabled =
        document.getElementById("waterChimeToggle").checked;

      if (enabled) {

        playWaterChime();

        sendToast(
          "💧 Hydration reminder: Take a sip of water!",
          "toast-water"
        );
      }

    }, 45 * 60 * 1000);
}

// Notes
function loadNotesFromStorage() {

  const notes =
    localStorage.getItem(STORE_NOTES) || "";

  const area =
    document.getElementById("notesArea");

  area.value = notes;

  document.getElementById("notesCharCounter").textContent =
    `${notes.length} chars`;
}

function saveNotesText() {

  const area =
    document.getElementById("notesArea");

  localStorage.setItem(
    STORE_NOTES,
    area.value
  );

  document.getElementById("notesCharCounter").textContent =
    `${area.value.length} chars`;
}

// Schedule Checker
function setupDueScheduleChecker() {

  setInterval(() => {

    const now = new Date();

    const dateStr =
      now.toISOString().split('T')[0];

    const timeStr =
      now.toTimeString().substring(0, 5);

    taskItems.forEach(t => {

      if (
        t.status === "pending" &&
        t.date === dateStr &&
        t.time === timeStr
      ) {

        playAlertTone();

        sendToast(
          `⏰ Due Alert: Task "${t.text}" is due right now!`,
          "toast-warning"
        );
      }

    });

  }, 30000);
}

// Web Audio Chimes
function playSuccessChime() {

  try {

    const AudioClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioClass) return;

    const ctx = new AudioClass();

    [523.25, 659.25].forEach((freq, i) => {

      const osc =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      osc.type = "sine";

      osc.frequency.setValueAtTime(
        freq,
        ctx.currentTime + i * 0.1
      );

      gain.gain.setValueAtTime(
        0.12,
        ctx.currentTime + i * 0.1
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.1 + 0.4
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(
        ctx.currentTime + i * 0.1
      );

      osc.stop(
        ctx.currentTime + i * 0.1 + 0.4
      );
    });

  } catch (e) {}
}

function playAlertTone() {

  try {

    const AudioClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioClass) return;

    const ctx = new AudioClass();

    const osc =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    osc.type = "triangle";

    osc.frequency.setValueAtTime(
      440,
      ctx.currentTime
    );

    osc.frequency.setValueAtTime(
      370,
      ctx.currentTime + 0.15
    );

    gain.gain.setValueAtTime(
      0.15,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.35
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    osc.stop(
      ctx.currentTime + 0.35
    );

  } catch (e) {}
}

function playWaterChime() {

  try {

    const AudioClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioClass) return;

    const ctx = new AudioClass();

    const osc =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    osc.type = "sine";

    osc.frequency.setValueAtTime(
      659.25,
      ctx.currentTime
    );

    osc.frequency.exponentialRampToValueAtTime(
      880,
      ctx.currentTime + 0.12
    );

    gain.gain.setValueAtTime(
      0.1,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.35
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    osc.stop(
      ctx.currentTime + 0.35
    );

  } catch (e) {}
}

function sendToast(message, variant = "") {

  const tray =
    document.getElementById("toastTray");

  const toast =
    document.createElement("div");

  toast.className =
    "toast " + variant;

  toast.textContent =
    message;

  tray.appendChild(toast);

  setTimeout(() => {

    toast.style.opacity = "0";

    toast.style.transition =
      "opacity 0.3s ease";

    setTimeout(
      () => toast.remove(),
      350
    );

  }, 3500);
}

function escapeHtml(str) {

  const d =
    document.createElement("div");

  d.textContent = str;

  return d.innerHTML;
}
