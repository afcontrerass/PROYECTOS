// header.js - Manejo de autenticación y funcionalidades del header

async function getMe(){
    const res = await fetch('/me', { credentials: 'include' });
    if(!res.ok) return null;
    return await res.json();
}

document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión y cargar datos del usuario
    getMe().then(user => {
        if(!user) { 
            window.location.href = '/login.html'; 
            return; 
        }
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.role;
        
        // Generar avatar con iniciales
        const avatar = document.getElementById('avatar');
        if(avatar && user.username) {
            const initials = user.username.split(' ').map(n => n[0]).join('').toUpperCase();
            avatar.textContent = initials;
        }
    });

    // Manejar logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '/login.html';
    });

    // Toggle del panel de notificaciones
    const notificationBell = document.getElementById('notificationBell');
    const notificationPanel = document.getElementById('notificationPanel');
    
    if(notificationBell && notificationPanel) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.style.display = 
                notificationPanel.style.display === 'block' ? 'none' : 'block';
        });

        // Cerrar panel al hacer click fuera
        document.addEventListener('click', () => {
            notificationPanel.style.display = 'none';
        });
    }

    // Marcar todas como leídas
    const markAllRead = document.querySelector('.mark-all-read');
    if(markAllRead) {
        markAllRead.addEventListener('click', () => {
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            document.querySelector('.notification-count').textContent = '0';
        });
    }
});
// header.js - Funcionalidades comunes del header
class HeaderManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        this.setupEventListeners();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/me');
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUserInfo();
            } else {
                // Redirigir al login si no está autenticado
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            window.location.href = '/login.html';
        }
    }

    updateUserInfo() {
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const avatar = document.getElementById('avatar');

        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.nombre || 'Usuario';
        }

        if (userRole && this.currentUser) {
            userRole.textContent = this.currentUser.role || 'Estudiante';
        }

        if (avatar && this.currentUser) {
            const firstLetter = (this.currentUser.nombre || 'U').charAt(0).toUpperCase();
            avatar.textContent = firstLetter;
        }
    }

    setupEventListeners() {
        // Cerrar sesión
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await fetch('/logout', { 
                        method: 'POST', 
                        credentials: 'include' 
                    });
                    window.location.href = '/login.html';
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
            });
        }

        // Notificaciones
        const notificationBell = document.getElementById('notificationBell');
        const notificationPanel = document.getElementById('notificationPanel');
        
        if (notificationBell && notificationPanel) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = notificationPanel.style.display === 'block';
                notificationPanel.style.display = isVisible ? 'none' : 'block';
            });
            
            // Cerrar panel al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!notificationBell.contains(e.target) && !notificationPanel.contains(e.target)) {
                    notificationPanel.style.display = 'none';
                }
            });
        }
    }
}

// Inicializar header cuando el DOM esté listo
let headerManager;
document.addEventListener('DOMContentLoaded', function() {
    headerManager = new HeaderManager();
});