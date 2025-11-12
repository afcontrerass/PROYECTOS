// tareas.js - Gestión completa de tareas
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentUser = null;
        this.stats = {
            tareasPendientes: 0,
            archivosEntregados: 0,
            calificacionPromedio: 0
        };
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadStats();
        await this.loadUserTasks();
        this.setupEventListeners();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/me');
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('👤 Usuario cargado:', this.currentUser);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    }

    async loadStats() {
        try {
            console.log('📊 Cargando estadísticas...');
            const response = await fetch('/api/dashboard/estadisticas');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.stats = await response.json();
            console.log('✅ Estadísticas cargadas:', this.stats);
            this.updateDashboardCards();
            
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
            // Usar valores por defecto
            this.stats = { tareasPendientes: 0, archivosEntregados: 0, calificacionPromedio: 0 };
            this.updateDashboardCards();
        }
    }

    async loadUserTasks() {
        try {
            console.log('📥 Cargando tareas del usuario...');
            const response = await fetch('/api/tareas/usuario');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.tasks = await response.json();
            console.log(`✅ ${this.tasks.length} tareas del usuario cargadas`);
            this.renderTasks();
            
        } catch (error) {
            console.error('❌ Error cargando tareas del usuario:', error);
            this.showError('No se pudieron cargar las tareas. Verifica la conexión.');
        }
    }

    updateDashboardCards() {
        // Actualizar tarjeta de tareas pendientes
        const pendientesCard = document.querySelector('.card:nth-child(1) .card-value');
        if (pendientesCard) {
            pendientesCard.textContent = this.stats.tareasPendientes;
        }

        // Actualizar tarjeta de archivos entregados
        const entregadosCard = document.querySelector('.card:nth-child(2) .card-value');
        if (entregadosCard) {
            entregadosCard.textContent = this.stats.archivosEntregados;
        }

        // Actualizar tarjeta de calificación promedio
        const calificacionCard = document.querySelector('.card:nth-child(3) .card-value');
        if (calificacionCard) {
            calificacionCard.textContent = this.stats.calificacionPromedio > 0 
                ? this.stats.calificacionPromedio.toFixed(1) 
                : '0.0';
        }
    }

    renderTasks() {
        const tasksGrid = document.querySelector('.tasks-grid');
        if (!tasksGrid) return;

        // Ordenar tareas: urgentes primero, luego por fecha
        const sortedTasks = this.tasks.sort((a, b) => {
            if (a.estado === 'urgente' && b.estado !== 'urgente') return -1;
            if (b.estado === 'urgente' && a.estado !== 'urgente') return 1;
            return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
        });

        tasksGrid.innerHTML = '';

        sortedTasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            tasksGrid.appendChild(taskCard);
        });
    }

    createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.estado} ${task.id_entrega ? 'completed' : ''}`;
        
        const fechaVencimiento = new Date(task.fecha_vencimiento);
        const fechaFormateada = fechaVencimiento.toLocaleDateString('es-ES');
        
        // Determinar texto y clase del estado
        let estadoText = '';
        let estadoClass = '';
        
        if (task.id_entrega) {
            estadoText = 'Entregado';
            estadoClass = 'status-completed';
        } else if (task.estado === 'urgente') {
            estadoText = 'Urgente';
            estadoClass = 'status-urgent';
        } else {
            estadoText = 'Pendiente';
            estadoClass = 'status-pending';
        }

        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.materia} - ${task.titulo}</div>
                <div class="task-date">${task.id_entrega ? 'Entregado: ' + new Date(task.fecha_entrega_usuario).toLocaleDateString('es-ES') : 'Vence: ' + fechaFormateada}</div>
            </div>
            <div class="task-description">
                ${task.descripcion || 'Sin descripción'}
            </div>
            <div class="task-footer">
                <div class="task-status ${estadoClass}">${estadoText}</div>
                <div class="task-actions">
                    ${!task.id_entrega && (this.currentUser?.role === 'estudiante' || !this.currentUser?.role) ? `
                    <div class="task-btn submit-task" data-id="${task.id}" title="Entregar tarea">
                        <i class="fas fa-upload"></i>
                    </div>
                    ` : ''}
                    
                    ${this.currentUser?.role === 'docente' || this.currentUser?.role === 'administrador' ? `
                    <div class="task-btn edit-task" data-id="${task.id}" title="Editar tarea">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="task-btn delete-task" data-id="${task.id}" title="Eliminar tarea">
                        <i class="fas fa-trash"></i>
                    </div>
                    ` : ''}
                    
                    <div class="task-btn view-task" data-id="${task.id}" title="Ver detalles">
                        <i class="fas fa-info"></i>
                    </div>
                </div>
            </div>
        `;

        return taskCard;
    }

    setupEventListeners() {
        // Modal para nueva tarea
        const newTaskBtn = document.getElementById('newTaskBtn');
        const taskModal = document.getElementById('taskModal');
        const closeModal = document.querySelector('.close-modal');
        const taskForm = taskModal?.querySelector('form');

        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => {
                this.openModal('create');
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Cerrar modal al hacer clic fuera o presionar ESC
        window.addEventListener('click', (event) => {
            if (event.target === taskModal) {
                this.closeModal();
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && taskModal && taskModal.style.display === 'block') {
                this.closeModal();
            }
        });

        // Enviar formulario de tarea
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Delegación de eventos para los botones de tareas
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.task-btn');
            if (!target) return;

            const taskId = target.dataset.id;
            
            if (target.classList.contains('edit-task')) {
                this.editTask(taskId);
            } else if (target.classList.contains('delete-task')) {
                this.deleteTask(taskId);
            } else if (target.classList.contains('view-task')) {
                this.viewTask(taskId);
            } else if (target.classList.contains('submit-task')) {
                this.submitTask(taskId);
            }
        });
    }

    openModal(mode = 'create', taskId = null) {
        const modal = document.getElementById('taskModal');
        if (!modal) return;
        
        const modalTitle = modal.querySelector('.modal-header h2');
        const submitBtn = modal.querySelector('button[type="submit"]');
        
        if (mode === 'create') {
            modalTitle.textContent = 'Asignar Nueva Tarea';
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Asignar Tarea';
            this.resetForm();
            this.currentMode = 'create';
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Editar Tarea';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            this.currentMode = 'edit';
            this.currentTaskId = taskId;
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Enfocar el primer campo
        setTimeout(() => {
            const titleInput = document.getElementById('taskTitle');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            this.resetForm();
        }
    }

    resetForm() {
        const form = document.querySelector('#taskModal form');
        if (form) {
            form.reset();
            // Remover estados de error
            form.querySelectorAll('.form-control.error').forEach(input => {
                input.classList.remove('error');
            });
            form.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });
        }
        this.currentMode = 'create';
        this.currentTaskId = null;
    }

    handleFormSubmit() {
        if (this.currentMode === 'create') {
            this.createTask();
        } else if (this.currentMode === 'edit') {
            this.updateTask(this.currentTaskId);
        }
    }

    async createTask() {
        const taskData = this.getFormData();
        
        if (!this.validateForm(taskData)) {
            return;
        }

        try {
            const response = await fetch('/api/tareas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error creando tarea');
            }

            const newTask = await response.json();
            console.log('✅ Tarea creada:', newTask);
            
            this.closeModal();
            await this.loadUserTasks();
            this.showSuccess('Tarea creada exitosamente');
            
        } catch (error) {
            console.error('❌ Error creando tarea:', error);
            this.showError('Error creando tarea: ' + error.message);
        }
    }

    async updateTask(taskId) {
        const taskData = this.getFormData();
        
        if (!this.validateForm(taskData)) {
            return;
        }

        try {
            const response = await fetch(`/api/tareas/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Error actualizando tarea');
            }

            console.log('✅ Tarea actualizada:', taskId);
            this.closeModal();
            await this.loadUserTasks();
            this.showSuccess('Tarea actualizada exitosamente');
            
        } catch (error) {
            console.error('❌ Error actualizando tarea:', error);
            this.showError('Error actualizando tarea');
        }
    }

    getFormData() {
        return {
            titulo: document.getElementById('taskTitle')?.value.trim() || '',
            materia: document.getElementById('taskSubject')?.value || '',
            descripcion: document.getElementById('taskDescription')?.value.trim() || '',
            fecha_vencimiento: document.getElementById('taskDueDate')?.value || '',
            estado: 'pendiente'
        };
    }

    validateForm(data) {
        let isValid = true;
        
        // Limpiar errores previos
        document.querySelectorAll('.form-control.error').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });

        // Validar título
        if (!data.titulo) {
            this.showFieldError('taskTitle', 'El título es obligatorio');
            isValid = false;
        }

        // Validar materia
        if (!data.materia) {
            this.showFieldError('taskSubject', 'Selecciona una materia');
            isValid = false;
        }

        // Validar fecha
        if (!data.fecha_vencimiento) {
            this.showFieldError('taskDueDate', 'La fecha de entrega es obligatoria');
            isValid = false;
        } else if (new Date(data.fecha_vencimiento) < new Date().setHours(0, 0, 0, 0)) {
            this.showFieldError('taskDueDate', 'La fecha no puede ser en el pasado');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const errorElement = field.nextElementSibling;
        
        field.classList.add('error');
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;

        // Llenar el modal con los datos de la tarea
        document.getElementById('taskTitle').value = task.titulo;
        document.getElementById('taskSubject').value = task.materia;
        document.getElementById('taskDescription').value = task.descripcion || '';
        document.getElementById('taskDueDate').value = task.fecha_vencimiento;

        this.openModal('edit', taskId);
    }

    async deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            return;
        }

        try {
            const response = await fetch(`/api/tareas/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error eliminando tarea');
            }

            console.log('✅ Tarea eliminada:', taskId);
            await this.loadUserTasks();
            this.showSuccess('Tarea eliminada exitosamente');
            
        } catch (error) {
            console.error('❌ Error eliminando tarea:', error);
            this.showError('Error eliminando tarea');
        }
    }

    viewTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;

        let mensaje = `Detalles de la tarea:\n\nTítulo: ${task.titulo}\nMateria: ${task.materia}\nDescripción: ${task.descripcion || 'N/A'}\nFecha de vencimiento: ${new Date(task.fecha_vencimiento).toLocaleDateString('es-ES')}\nEstado: ${task.estado}`;
        
        if (task.id_entrega) {
            mensaje += `\n\n📤 ENTREGADO:\nFecha de entrega: ${new Date(task.fecha_entrega_usuario).toLocaleDateString('es-ES')}\nArchivo: ${task.archivo_url || 'N/A'}\nComentarios: ${task.comentarios_entrega || 'Ninguno'}`;
        }
        
        alert(mensaje);
    }

    // NUEVA FUNCIÓN: Manejar entrega de tareas
    submitTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;

        // Crear modal de entrega
        this.createDeliveryModal(task);
    }

    createDeliveryModal(task) {
        // Crear modal dinámicamente
        const modalHTML = `
            <div class="modal" id="deliveryModal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <span class="close-modal">&times;</span>
                    
                    <div class="modal-header">
                        <h2>Entregar Tarea</h2>
                    </div>
                    
                    <form id="deliveryForm">
                        <div class="form-group">
                            <label><strong>${task.materia} - ${task.titulo}</strong></label>
                            <p style="margin: 5px 0; color: #666;">${task.descripcion || 'Sin descripción'}</p>
                            <p style="margin: 5px 0; color: #dc3545; font-size: 14px;">
                                <i class="fas fa-clock"></i> Vence: ${new Date(task.fecha_vencimiento).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                        
                        <div class="form-group">
                            <label for="deliveryFile">Archivo de entrega *</label>
                            <div class="file-upload" id="fileUploadArea">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Haz clic para subir archivo o arrástralo aquí</p>
                                <input type="file" id="deliveryFile" style="display: none;" required>
                                <div id="fileName" style="margin-top: 10px; font-weight: bold; display: none;"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="deliveryComments">Comentarios (opcional)</label>
                            <textarea class="form-control" id="deliveryComments" placeholder="Agrega algún comentario sobre tu entrega..." rows="3"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-paper-plane"></i>
                            Entregar Tarea
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar eventos del modal
        this.setupDeliveryModal(task);
    }

    setupDeliveryModal(task) {
        const modal = document.getElementById('deliveryModal');
        const closeBtn = modal.querySelector('.close-modal');
        const form = document.getElementById('deliveryForm');
        const fileInput = document.getElementById('deliveryFile');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileName = document.getElementById('fileName');

        // Manejar cierre del modal
        closeBtn.onclick = () => this.closeDeliveryModal();
        modal.onclick = (e) => {
            if (e.target === modal) this.closeDeliveryModal();
        };

        // Manejar área de subida de archivos
        fileUploadArea.onclick = () => fileInput.click();
        fileUploadArea.ondragover = (e) => {
            e.preventDefault();
            fileUploadArea.style.backgroundColor = '#f0f0f0';
            fileUploadArea.style.borderColor = '#007bff';
        };
        fileUploadArea.ondragleave = () => {
            fileUploadArea.style.backgroundColor = '';
            fileUploadArea.style.borderColor = '#ddd';
        };
        fileUploadArea.ondrop = (e) => {
            e.preventDefault();
            fileUploadArea.style.backgroundColor = '';
            fileUploadArea.style.borderColor = '#ddd';
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                this.updateFileName(fileInput.files[0]);
            }
        };

        fileInput.onchange = () => {
            if (fileInput.files.length) {
                this.updateFileName(fileInput.files[0]);
            }
        };

        // Manejar envío del formulario
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.processDelivery(
                task.id, 
                fileInput.files[0], 
                document.getElementById('deliveryComments').value
            );
        };
    }

    updateFileName(file) {
        const fileName = document.getElementById('fileName');
        fileName.textContent = `📎 ${file.name} (${this.formatFileSize(file.size)})`;
        fileName.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processDelivery(taskId, file, comments) {
    if (!file) {
        this.showError('Por favor selecciona un archivo para entregar');
        return;
    }

    // Mostrar loading
    const submitBtn = document.querySelector('#deliveryForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando entrega...';
    submitBtn.disabled = true;

    try {
        // En una implementación real, aquí subirías el archivo a un servidor
        // Por ahora simulamos la subida y guardamos la URL
        const archivoUrl = await this.uploadFile(file);
        
        const response = await fetch('/api/entregas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_tarea: taskId,
                archivo_url: archivoUrl,
                comentarios: comments
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la entrega');
        }

        const result = await response.json();
        console.log('✅ Entrega procesada:', result);
        
        this.closeDeliveryModal();
        
        // Actualizar dashboard si existe - con manejo de errores
        if (typeof studentDashboard !== 'undefined' && studentDashboard.refreshData) {
            try {
                await studentDashboard.refreshData();
            } catch (dashboardError) {
                console.warn('⚠️ Error actualizando dashboard:', dashboardError);
                // No mostrar error al usuario por fallo en dashboard
            }
        }
        
        await this.loadStats();
        await this.loadUserTasks();
        this.showSuccess('¡Tarea entregada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en entrega:', error);
        this.showError('Error al entregar tarea: ' + error.message);
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

    // Simular subida de archivo (en producción usarías AWS S3, etc.)
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            // Validar tipo de archivo (opcional)
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/zip',
                'image/jpeg',
                'image/png'
            ];
            
            if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|zip|jpg|jpeg|png)$/i)) {
                reject(new Error('Tipo de archivo no permitido. Use PDF, Word, texto, ZIP o imágenes.'));
                return;
            }
            
            // Validar tamaño (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                reject(new Error('El archivo es demasiado grande. Máximo 10MB.'));
                return;
            }
            
            // Simular tiempo de subida
            setTimeout(() => {
                const fakeUrl = `https://example.com/uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                console.log('📁 Archivo subido (simulado):', fakeUrl);
                resolve(fakeUrl);
            }, 1500);
        });
    }

    closeDeliveryModal() {
        const modal = document.getElementById('deliveryModal');
        if (modal) {
            modal.remove();
        }
        // También limpiar cualquier estado residual
        const fileInput = document.getElementById('deliveryFile');
        const fileName = document.getElementById('fileName');
        const comments = document.getElementById('deliveryComments');
        
        if (fileInput) fileInput.value = '';
        if (fileName) fileName.style.display = 'none';
        if (comments) comments.value = '';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else {
            notification.style.backgroundColor = '#007bff';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Agregar estilos de animación si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Inicializar cuando el DOM esté listo
let taskManager;
document.addEventListener('DOMContentLoaded', function() {
    taskManager = new TaskManager();
});