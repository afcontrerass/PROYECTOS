// dashboard-docente.js - Gestión del dashboard para docentes
class TeacherDashboard {
    constructor() {
        this.stats = {
            tareasPorCalificar: 0,
            alumnosInscritos: 0,
            proyectosEnCurso: 0
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
                console.log('👤 Docente cargado:', this.currentUser);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    }

    async loadDashboardStats() {
        try {
            console.log('📊 Cargando estadísticas del dashboard docente...');
            
            // Cargar estadísticas de tareas por calificar
            const tareasResponse = await fetch('/api/entregas/pendientes');
            const tareasData = tareasResponse.ok ? await tareasResponse.json() : [];
            
            // Cargar proyectos en curso
            const proyectosResponse = await fetch('/api/proyectos');
            const proyectosData = proyectosResponse.ok ? await proyectosResponse.json() : [];
            
            // Cargar usuarios (para contar alumnos)
            const usuariosResponse = await fetch('/api/usuarios');
            const usuariosData = usuariosResponse.ok ? await usuariosResponse.json() : [];
            
            // Calcular estadísticas
            this.stats = {
                tareasPorCalificar: tareasData.length || 0,
                alumnosInscritos: usuariosData.filter(u => u.roles === 'estudiante').length || 0,
                proyectosEnCurso: proyectosData.filter(p => p.estado === 'activo').length || 0
            };
            
            console.log('✅ Estadísticas del dashboard docente cargadas:', this.stats);
            
        } catch (error) {
            console.error('❌ Error cargando estadísticas del dashboard docente:', error);
            // Usar valores por defecto en caso de error
            this.stats = { 
                tareasPorCalificar: 0, 
                alumnosInscritos: 0, 
                proyectosEnCurso: 0 
            };
        }
    }

    updateDashboardCards() {
    // Actualizar tarjeta de tareas por calificar
    const tareasCard = document.getElementById('tareasPorCalificar');
    if (tareasCard) {
        tareasCard.textContent = this.stats.tareasPorCalificar;
    }

    // Actualizar tarjeta de alumnos inscritos
    const alumnosCard = document.getElementById('alumnosInscritos');
    if (alumnosCard) {
        alumnosCard.textContent = this.stats.alumnosInscritos;
    }

    // Actualizar tarjeta de proyectos en curso
    const proyectosCard = document.getElementById('proyectosEnCurso');
    if (proyectosCard) {
        proyectosCard.textContent = this.stats.proyectosEnCurso;
    }
}

    // Método para recargar datos
    async refreshData() {
        try {
            await this.loadDashboardStats();
            this.updateDashboardCards();
            console.log('🔄 Dashboard docente actualizado');
        } catch (error) {
            console.error('❌ Error actualizando dashboard docente:', error);
        }
    }
}

// Inicializar cuando el DOM esté listo
let teacherDashboard;
document.addEventListener('DOMContentLoaded', function() {
    teacherDashboard = new TeacherDashboard();
    
    // Recargar datos cada 30 segundos (opcional)
    setInterval(() => {
        teacherDashboard.refreshData();
    }, 30000);
});