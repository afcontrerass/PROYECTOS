// dashboard-estudiante.js - Gestión del dashboard para estudiantes
class StudentDashboard {
    constructor() {
        this.stats = {
            tareasPendientes: 0,
            archivosEntregados: 0,
            calificacionPromedio: 0
        };
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadDashboardStats();
        this.updateDashboardCards();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/me');
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('👤 Estudiante cargado:', this.currentUser);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    }

    async loadDashboardStats() {
        try {
            console.log('📊 Cargando estadísticas del dashboard...');
            const response = await fetch('/api/dashboard/estadisticas');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Estadísticas del dashboard cargadas:', data);
            
            // Asegurarnos de que todos los valores sean números válidos
            this.stats = {
                tareasPendientes: Number(data.tareasPendientes) || 0,
                archivosEntregados: Number(data.archivosEntregados) || 0,
                calificacionPromedio: this.parseNumber(data.calificacionPromedio) || 0
            };
            
        } catch (error) {
            console.error('❌ Error cargando estadísticas del dashboard:', error);
            // Usar valores por defecto en caso de error
            this.stats = { 
                tareasPendientes: 0, 
                archivosEntregados: 0, 
                calificacionPromedio: 0 
            };
        }
    }

    // Método seguro para parsear números, incluyendo null/undefined
    parseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }

    updateDashboardCards() {
        // Actualizar tarjeta de tareas pendientes
        const pendientesCard = document.getElementById('tareasPendientesCount');
        if (pendientesCard) {
            pendientesCard.textContent = this.stats.tareasPendientes || 0;
        }

        // Actualizar tarjeta de archivos entregados
        const entregadosCard = document.getElementById('archivosEntregadosCount');
        if (entregadosCard) {
            entregadosCard.textContent = this.stats.archivosEntregados || 0;
        }

        // Actualizar tarjeta de calificación promedio
        const calificacionCard = document.getElementById('calificacionPromedio');
        if (calificacionCard) {
            const promedio = this.stats.calificacionPromedio || 0;
            
            // Asegurarnos de que promedio sea un número antes de usar toFixed
            const promedioNum = this.parseNumber(promedio);
            calificacionCard.textContent = promedioNum > 0 ? promedioNum.toFixed(1) : '0.0';
            
            // Cambiar color según la calificación
            this.actualizarColorCalificacion(promedioNum, calificacionCard);
        }
    }

    actualizarColorCalificacion(promedio, elemento) {
        // Remover clases anteriores
        elemento.classList.remove('excelente', 'bueno', 'regular', 'bajo');
        
        // Asegurarnos de que promedio sea un número
        const promedioNum = this.parseNumber(promedio);
        
        if (promedioNum >= 4.5) {
            elemento.classList.add('excelente');
        } else if (promedioNum >= 4.0) {
            elemento.classList.add('bueno');
        } else if (promedioNum >= 3.5) {
            elemento.classList.add('regular');
        } else if (promedioNum > 0) {
            elemento.classList.add('bajo');
        }
    }

    // Método para recargar datos (puede ser llamado desde otros scripts)
    async refreshData() {
        try {
            await this.loadDashboardStats();
            this.updateDashboardCards();
            console.log('🔄 Dashboard actualizado');
        } catch (error) {
            console.error('❌ Error actualizando dashboard:', error);
        }
    }
}

// Inicializar cuando el DOM esté listo
let studentDashboard;
document.addEventListener('DOMContentLoaded', function() {
    studentDashboard = new StudentDashboard();
    
    // Recargar datos cada 30 segundos (opcional)
    setInterval(() => {
        studentDashboard.refreshData();
    }, 30000);
});