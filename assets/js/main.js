const addBtn = document.querySelector('.addBtn');
const message = document.querySelector('.message');
const list = document.querySelector(".list");
const checkbox = document.querySelector('#checkbox');
const themeBox = document.querySelector('.themeBox');
const deleteSelectedBtn = document.querySelector('.deleteSelectedBtn');
const confirmationModal = document.querySelector(".confirmationModal");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const taskInput = document.querySelector("#inputText");

let taskToDelete = null;

// Set up local storage
function setToLocalStorage(data) {
    localStorage.setItem("todolist", JSON.stringify(data));
}

function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("todolist")) || [];
}

// Batch update local storage and UI
function updateLocalStorageAndUI(updatedList) {
    setToLocalStorage(updatedList);
    deleteShowHide(updatedList);
}

// Show/Hide delete selected button
function deleteShowHide(todolist) {
    deleteSelectedBtn.style.display = todolist.length < 2 ? 'none' : 'block';
}

// Load tasks on page load
function loadList() {
    const todolist = getFromLocalStorage();
    todolist.forEach(item => showInList(item.text, item.cmp, item.id));

    if (localStorage.getItem("mode") === 'dark') {
        document.body.classList.add('darkMode');
        checkbox.checked = true;
    }
    deleteShowHide(todolist);
}

document.addEventListener("DOMContentLoaded", loadList);

// Theme toggle
themeBox.addEventListener('click', () => {
    document.body.classList.toggle('darkMode', checkbox.checked);
    localStorage.setItem("mode", checkbox.checked ? "dark" : "light");
});

// Add task function
addBtn.addEventListener('click', function () {
    const listText = taskInput.value.trim();
    let todolist = getFromLocalStorage();

    if (!listText) {
        showMessage('Please enter a task');
        return;
    }

    if (todolist.some(task => task.text.toLowerCase() === listText.toLowerCase())) {
        showMessage('Task already exists!');
        return;
    }

    const newTaskId = Date.now();
    const newTask = { id: newTaskId, text: listText, cmp: false };
    todolist.push(newTask);
    updateLocalStorageAndUI(todolist);
    showInList(listText, false, newTaskId);
    taskInput.value = "";
});

// Show message function
function showMessage(text) {
    message.style.display = 'block';
    message.textContent = text;
    setTimeout(() => message.style.display = "none", 1000);
}

// Display task in list
function showInList(text, cmp = false, id) {
    const li = document.createElement("li");
    li.className = cmp ? "completed" : "";
    li.dataset.id = id;
    li.innerHTML = `
        <span>${text}</span>
        <span>
            <button class="tickBtn"><span></span><span></span></button>
            <button class="deleteBtn"><i class="fa-solid fa-trash-can"></i></button>
            <input type="checkbox" class="taskCheckbox">
        </span>
        <span class="completeSpan">Completed</span>
    `;
    list.prepend(li);
}

// Toggle completion status
function toggleComplete(task) {
    const taskId = parseInt(task.dataset.id);
    let todolist = getFromLocalStorage().map(item => {
        if (item.id === taskId) item.cmp = !item.cmp;
        return item;
    });
    updateLocalStorageAndUI(todolist);
    task.classList.toggle("completed");
}

// Remove task function
function removeList(task) {
    taskToDelete = task;
    confirmationModal.style.display = "flex";
}

// Confirm delete action
confirmDeleteBtn.addEventListener('click', () => {
    if (taskToDelete) {
        let todolist = getFromLocalStorage().filter(task => task.id !== parseInt(taskToDelete.dataset.id));
        updateLocalStorageAndUI(todolist);
        taskToDelete.remove();
        taskToDelete = null;
        confirmationModal.style.display = "none";
    }
});

cancelDeleteBtn.addEventListener('click', () => {
    taskToDelete = null;
    confirmationModal.style.display = "none";
});

// Bulk delete selected tasks
deleteSelectedBtn.addEventListener("click", () => {
    const checkedTasks = document.querySelectorAll('.taskCheckbox:checked');

    if (checkedTasks.length < 2) {
        showMessage('Please select at least two items to delete');
        return;
    }

    confirmationModal.style.display = "flex";
    const tasksToDelete = Array.from(checkedTasks).map(task => task.closest('li'));
    const taskIdsToDelete = new Set(tasksToDelete.map(task => parseInt(task.dataset.id)));

    confirmDeleteBtn.onclick = () => {
        let todolist = getFromLocalStorage().filter(task => !taskIdsToDelete.has(task.id));
        updateLocalStorageAndUI(todolist);
        tasksToDelete.forEach(task => task.remove());
        confirmationModal.style.display = "none";
    };

    cancelDeleteBtn.onclick = () => {
        confirmationModal.style.display = "none";
    };
});

// Event delegation for handling task actions efficiently
list.addEventListener("click", (e) => {
    if (e.target.closest(".deleteBtn")) removeList(e.target.closest("li"));
    if (e.target.closest(".tickBtn")) toggleComplete(e.target.closest("li"));
});

// Add task with Enter key
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addBtn.click();
});
