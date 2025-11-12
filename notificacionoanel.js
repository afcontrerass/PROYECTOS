// Toggle notification panel
document.getElementById('notificationBell').addEventListener('click', function(e) {
    e.stopPropagation();
    const panel = document.getElementById('notificationPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// Close notification panel when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('#notificationPanel') && !e.target.closest('#notificationBell')) {
        document.getElementById('notificationPanel').style.display = 'none';
    }
});

// Task modal functionality
const taskModal = document.getElementById('taskModal');
const newTaskBtn = document.getElementById('newTaskBtn');
const closeModal = document.querySelector('.close-modal');

newTaskBtn.addEventListener('click', function() {
    taskModal.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
    taskModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === taskModal) {
        taskModal.style.display = 'none';
    }
});

// Mark notifications as read
const markAllRead = document.querySelector('.mark-all-read');
const unreadNotifications = document.querySelectorAll('.unread');

markAllRead.addEventListener('click', function() {
    unreadNotifications.forEach(notification => {
        notification.classList.remove('unread');
    });
    document.querySelector('.notification-count').textContent = '0';
});

// File upload interaction
const fileUpload = document.querySelector('.file-upload');
const fileInput = document.querySelector('.file-upload input');

fileUpload.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    if (fileInput.files.length > 0) {
        fileUpload.innerHTML = `
            <i class="fas fa-file" style="color: #4cc9f0;"></i>
            <p>${fileInput.files[0].name}</p>
            <span style="color: #4361ee; font-size: 12px;">Haz clic para cambiar</span>
        `;
    }
});

// Sidebar menu functionality
const menuItems = document.querySelectorAll('.sidebar-menu li');
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Task actions functionality
const taskButtons = document.querySelectorAll('.task-btn');
taskButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const icon = this.querySelector('i');
        
        if (icon.classList.contains('fa-upload')) {
            alert('Función de subida de archivo activada');
        } else if (icon.classList.contains('fa-info')) {
            alert('Mostrando detalles de la tarea');
        } else if (icon.classList.contains('fa-eye')) {
            alert('Mostrando retroalimentación de la tarea');
        }
    });
});

// Form submission
const taskForm = document.querySelector('#taskModal form');
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Tarea asignada correctamente');
    taskModal.style.display = 'none';
    taskForm.reset();
    
    // Reset file upload area
    fileUpload.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Haz clic para subir archivos o arrástralos aquí</p>
        <input type="file" style="display: none;">
    `;
    // Reattach event listeners
    const newFileInput = fileUpload.querySelector('input');
    fileUpload.addEventListener('click', function() {
        newFileInput.click();
    });
});