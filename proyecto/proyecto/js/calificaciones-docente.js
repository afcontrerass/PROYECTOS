// calificaciones-docente.js - Gestión de calificaciones para docentes
class TeacherGradesManager {
    constructor() {
        this.entregasPendientes = [];
        this.historialCalificaciones = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadEntregasPendientes();
        await this.loadHistorialCalificaciones();
        this.setupEventListeners();
        this.setupTabs();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/me');
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('👤 Docente cargado:', this.currentUser);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    }

    async loadEntregasPendientes() {
        try {
            console.log('📥 Cargando entregas pendientes...');
            const response = await fetch('/api/entregas/pendientes');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.entregasPendientes = await response.json();
            console.log(`✅ ${this.entregasPendientes.length} entregas pendientes cargadas`);
            this.renderEntregasPendientes();
            
        } catch (error) {
            console.error('❌ Error cargando entregas pendientes:', error);
            this.showError('No se pudieron cargar las entregas pendientes');
        }
    }

    async loadHistorialCalificaciones() {
        try {
            console.log('📊 Cargando historial de calificaciones...');
            const response = await fetch('/api/calificaciones/historial');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.historialCalificaciones = await response.json();
            console.log(`✅ ${this.historialCalificaciones.length} calificaciones en historial`);
            this.renderHistorialCalificaciones();
            
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
            this.showError('No se pudo cargar el historial de calificaciones');
        }
    }

    renderEntregasPendientes() {
        const container = document.getElementById('entregasPendientes');
        if (!container) return;

        if (this.entregasPendientes.length === 0) {
            container.innerHTML = this.getNoDataMessage('No hay entregas pendientes de calificación');
            return;
        }

        container.innerHTML = '';

        this.entregasPendientes.forEach(entrega => {
            const entregaCard = this.createEntregaCard(entrega);
            container.appendChild(entregaCard);
        });
    }

    createEntregaCard(entrega) {
        const card = document.createElement('div');
        card.className = 'entrega-card';
        card.innerHTML = `
            <div class="entrega-header">
                <div class="entrega-info">
                    <h4>${entrega.titulo_tarea} - ${entrega.materia}</h4>
                    <div class="estudiante-info">
                        <strong>Estudiante:</strong> ${entrega.nombre_estudiante} (${entrega.correo_estudiante})
                    </div>
                </div>
                <div class="entrega-fecha">
                    Entregado: ${new Date(entrega.fecha_entrega).toLocaleDateString('es-ES')}
                </div>
            </div>
            
            <div class="entrega-content">
                <div class="entrega-descripcion">
                    <strong>Descripción:</strong> ${entrega.descripcion_tarea || 'Sin descripción'}
                </div>
                
                <div class="entrega-comentarios">
                    <strong>Comentarios del estudiante:</strong> 
                    ${entrega.comentarios || 'Ninguno'}
                </div>
                
                ${entrega.archivo_url ? `
                <div class="entrega-archivo">
                    <strong>Archivo entregado:</strong>
                    <a href="${entrega.archivo_url}" target="_blank" class="archivo-link">
                        <i class="fas fa-download"></i> Descargar archivo
                    </a>
                </div>
                ` : ''}
            </div>
            
            <div class="entrega-actions">
                <button class="btn btn-primary calificar-btn" data-id="${entrega.id_entrega}">
                    <i class="fas fa-edit"></i> Calificar
                </button>
            </div>
        `;

        return card;
    }

    renderHistorialCalificaciones() {
        const container = document.getElementById('historialCalificaciones');
        if (!container) return;

        if (this.historialCalificaciones.length === 0) {
            container.innerHTML = this.getNoDataMessage('No hay calificaciones en el historial');
            return;
        }

        container.innerHTML = '';

        this.historialCalificaciones.forEach(calificacion => {
            const calificacionCard = this.createHistorialCard(calificacion);
            container.appendChild(calificacionCard);
        });
    }

    createHistorialCard(calificacion) {
        const card = document.createElement('div');
        card.className = 'historial-card';
        const categoria = this.getCategoriaNota(calificacion.nota);
        
        card.innerHTML = `
            <div class="historial-header">
                <div class="historial-info">
                    <h4>${calificacion.titulo_tarea} - ${calificacion.materia}</h4>
                    <div class="estudiante-info">
                        <strong>Estudiante:</strong> ${calificacion.nombre_estudiante}
                    </div>
                </div>
                <div class="nota-display ${categoria}">
                    ${calificacion.nota.toFixed(1)}
                </div>
            </div>
            
            <div class="historial-content">
                <div class="evaluacion-info">
                    <strong>Evaluación:</strong> ${calificacion.evaluacion}
                </div>
                <div class="porcentaje-info">
                    <strong>Porcentaje:</strong> ${calificacion.porcentaje}%
                </div>
                <div class="fecha-info">
                    <strong>Fecha:</strong> ${new Date(calificacion.fecha).toLocaleDateString('es-ES')}
                </div>
                
                ${calificacion.observaciones ? `
                <div class="observaciones-info">
                    <strong>Observaciones:</strong> ${calificacion.observaciones}
                </div>
                ` : ''}
            </div>
            
            <div class="historial-actions">
                <button class="btn btn-outline editar-calificacion-btn" data-id="${calificacion.id_entrega}">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `;

        return card;
    }

    setupEventListeners() {
        // Delegación de eventos para botones de calificar
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calificar-btn')) {
                const btn = e.target.closest('.calificar-btn');
                const entregaId = btn.dataset.id;
                this.openModalCalificacion(entregaId);
            }
            
            if (e.target.closest('.editar-calificacion-btn')) {
                const btn = e.target.closest('.editar-calificacion-btn');
                const entregaId = btn.dataset.id;
                this.openModalCalificacion(entregaId, true);
            }
        });

        // Modal de calificación
        const closeModal = document.querySelector('#calificacionModal .close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModalCalificacion());
        }

        const calificacionForm = document.getElementById('calificacionForm');
        if (calificacionForm) {
            calificacionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitCalificacion();
            });
        }

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('calificacionModal');
            if (e.target === modal) {
                this.closeModalCalificacion();
            }
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.grades-tab-btn');
        const tabPanes = document.querySelectorAll('.grades-tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                const targetPane = document.getElementById(tabId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }

    openModalCalificacion(entregaId, isEdit = false) {
        const modal = document.getElementById('calificacionModal');
        if (!modal) return;

        const modalTitle = modal.querySelector('.modal-header h2');
        const submitBtn = modal.querySelector('button[type="submit"]');
        
        if (isEdit) {
            modalTitle.textContent = 'Editar Calificación';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Calificación';
        } else {
            modalTitle.textContent = 'Calificar Entrega';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Guardar Calificación';
        }

        // Buscar información de la entrega
        const entrega = this.entregasPendientes.find(e => e.id_entrega == entregaId) || 
                       this.historialCalificaciones.find(e => e.id_entrega == entregaId);
        
        if (entrega) {
            document.getElementById('calificacionEntregaId').value = entregaId;
            document.getElementById('calificacionTareaInfo').textContent = 
                `${entrega.titulo_tarea} - ${entrega.materia}`;
            document.getElementById('calificacionEstudianteInfo').textContent = 
                `${entrega.nombre_estudiante} (${entrega.correo_estudiante})`;
            
            // Si es edición, llenar los campos existentes
            if (isEdit && entrega.evaluacion) {
                document.getElementById('calificacionEvaluacion').value = entrega.evaluacion;
                document.getElementById('calificacionNota').value = entrega.nota;
                document.getElementById('calificacionPorcentaje').value = entrega.porcentaje;
                document.getElementById('calificacionObservaciones').value = entrega.observaciones || '';
            } else {
                // Resetear formulario para nueva calificación
                document.getElementById('calificacionEvaluacion').value = 'Evaluación de tarea';
                document.getElementById('calificacionNota').value = '';
                document.getElementById('calificacionPorcentaje').value = '100';
                document.getElementById('calificacionObservaciones').value = '';
            }
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModalCalificacion() {
        const modal = document.getElementById('calificacionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async submitCalificacion() {
        const formData = {
            id_entrega: document.getElementById('calificacionEntregaId').value,
            evaluacion: document.getElementById('calificacionEvaluacion').value,
            nota: parseFloat(document.getElementById('calificacionNota').value),
            porcentaje: parseInt(document.getElementById('calificacionPorcentaje').value),
            observaciones: document.getElementById('calificacionObservaciones').value
        };

        // Validar datos
        if (!this.validarCalificacion(formData)) {
            return;
        }

        try {
            const response = await fetch('/api/entregas/calificar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar calificación');
            }

            const result = await response.json();
            console.log('✅ Calificación guardada:', result);
            
            this.closeModalCalificacion();
            await this.loadEntregasPendientes();
            await this.loadHistorialCalificaciones();
            this.showSuccess('Calificación guardada exitosamente');
            
        } catch (error) {
            console.error('❌ Error guardando calificación:', error);
            this.showError('Error al guardar calificación: ' + error.message);
        }
    }

    validarCalificacion(data) {
        if (!data.evaluacion.trim()) {
            this.showError('La evaluación es obligatoria');
            return false;
        }

        if (isNaN(data.nota) || data.nota < 0 || data.nota > 5) {
            this.showError('La nota debe ser un número entre 0 y 5');
            return false;
        }

        if (isNaN(data.porcentaje) || data.porcentaje < 0 || data.porcentaje > 100) {
            this.showError('El porcentaje debe ser un número entre 0 y 100');
            return false;
        }

        return true;
    }

    getCategoriaNota(nota) {
        if (nota >= 4.5) return 'excellent';
        if (nota >= 4.0) return 'good';
        if (nota >= 3.5) return 'average';
        return 'poor';
    }

    getNoDataMessage(mensaje) {
        return `
            <div class="no-data-message">
                <i class="fas fa-inbox"></i>
                <p>${mensaje}</p>
            </div>
        `;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
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
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
let teacherGradesManager;
document.addEventListener('DOMContentLoaded', function() {
    teacherGradesManager = new TeacherGradesManager();
});