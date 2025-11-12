// calificaciones.js - Gestión de calificaciones para estudiantes (CORREGIDO)
class GradesManager {
    constructor() {
        this.calificaciones = [];
        this.estadisticas = {
            promedioGeneral: 0,
            mejorCalificacion: 0,
            peorCalificacion: 0,
            materiasActivas: 0,
            distribucion: { total: 0, excelentes: 0, buenos: 0, regulares: 0, bajos: 0 }
        };
        this.currentUser = null;
        this.currentPeriod = '2024-1';
        this.init();
    }

    async init() {
        try {
            await this.loadCurrentUser();
            await this.loadEstadisticas();
            await this.loadCalificaciones();
            this.setupEventListeners();
            this.setupTabs();
        } catch (error) {
            console.error('Error en inicialización:', error);
            this.showError('Error al inicializar el sistema de calificaciones');
        }
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/me');
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('👤 Usuario cargado:', this.currentUser);
            } else {
                throw new Error('Usuario no autenticado');
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            throw error;
        }
    }

    async loadEstadisticas() {
        try {
            console.log('📈 Cargando estadísticas...');
            const response = await fetch('/api/calificaciones/estadisticas');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }
            
            this.estadisticas = await response.json();
            console.log('✅ Estadísticas cargadas:', this.estadisticas);
            this.updateSummaryCards();
            
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
            // Usar valores por defecto en caso de error
            this.estadisticas = {
                promedioGeneral: 0,
                mejorCalificacion: 0,
                peorCalificacion: 0,
                materiasActivas: 0,
                distribucion: { total: 0, excelentes: 0, buenos: 0, regulares: 0, bajos: 0 }
            };
            this.updateSummaryCards();
            this.showError('No se pudieron cargar las estadísticas. Mostrando datos de ejemplo.');
        }
    }

    async loadCalificaciones(periodo = null) {
        try {
            const url = periodo 
                ? `/api/calificaciones/periodo/${periodo}`
                : '/api/calificaciones/estudiante';
                
            console.log('📊 Cargando calificaciones desde:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }
            
            this.calificaciones = await response.json();
            console.log(`✅ ${this.calificaciones.length} calificaciones cargadas`);
            this.renderCalificaciones();
            
        } catch (error) {
            console.error('❌ Error cargando calificaciones:', error);
            // Usar datos de ejemplo en caso de error
            this.calificaciones = this.getDatosEjemplo();
            this.renderCalificaciones();
            this.showError('No se pudieron cargar las calificaciones. Mostrando datos de ejemplo.');
        }
    }

    // Datos de ejemplo para cuando la BD falle
    getDatosEjemplo() {
        return [
            {
                id_nota: 1,
                evaluacion: "Examen Parcial",
                nota: 4.2,
                porcentaje: 30,
                fecha: "2024-01-15",
                observaciones: "Buen desempeño",
                proyecto_titulo: "Sistema de Gestión",
                materia: "Matemáticas",
                categoria: "bueno"
            },
            {
                id_nota: 2,
                evaluacion: "Proyecto Final",
                nota: 4.8,
                porcentaje: 40,
                fecha: "2024-01-20",
                observaciones: "Excelente trabajo",
                proyecto_titulo: "App Móvil",
                materia: "Programación",
                categoria: "excelente"
            },
            {
                id_nota: 3,
                evaluacion: "Laboratorio",
                nota: 3.8,
                porcentaje: 20,
                fecha: "2024-01-10",
                observaciones: "Necesita mejorar",
                proyecto_titulo: "Experimentos Físicos",
                materia: "Física",
                categoria: "regular"
            }
        ];
    }

    updateSummaryCards() {
        // Actualizar tarjeta de promedio general
        const promedioCard = document.querySelector('.summary-card:nth-child(1) .summary-value');
        if (promedioCard) {
            promedioCard.textContent = this.estadisticas.promedioGeneral?.toFixed(1) || '0.0';
        }

        // Actualizar tarjeta de mejor calificación
        const mejorCard = document.querySelector('.summary-card:nth-child(2) .summary-value');
        if (mejorCard) {
            mejorCard.textContent = this.estadisticas.mejorCalificacion?.toFixed(1) || '0.0';
        }

        // Actualizar tarjeta de peor calificación
        const peorCard = document.querySelector('.summary-card:nth-child(3) .summary-value');
        if (peorCard) {
            peorCard.textContent = this.estadisticas.peorCalificacion?.toFixed(1) || '0.0';
        }

        // Actualizar tarjeta de materias activas
        const materiasCard = document.querySelector('.summary-card:nth-child(4) .summary-value');
        if (materiasCard) {
            materiasCard.textContent = this.estadisticas.materiasActivas || '0';
        }
    }

    renderCalificaciones() {
        this.renderPrimerCorte();
        this.renderSegundoCorte();
        this.renderTercerCorte();
        this.renderNotaFinal();
    }

    renderPrimerCorte() {
        const corte1Container = document.querySelector('#corte1 .subjects-grid');
        if (!corte1Container) return;

        const calificacionesCorte1 = this.calificaciones.slice(0, 6);

        if (calificacionesCorte1.length === 0) {
            corte1Container.innerHTML = this.getNoDataMessage('No hay calificaciones disponibles para el primer corte');
            return;
        }

        corte1Container.innerHTML = '';

        calificacionesCorte1.forEach(calificacion => {
            const subjectCard = this.createSubjectCard(calificacion, 'corte1');
            corte1Container.appendChild(subjectCard);
        });

        this.updateCorteAverage('corte1', calificacionesCorte1);
    }

    renderSegundoCorte() {
        const corte2Container = document.querySelector('#corte2 .subjects-grid');
        if (!corte2Container) return;

        const calificacionesCorte2 = this.calificaciones.slice(0, 3);

        if (calificacionesCorte2.length === 0) {
            corte2Container.innerHTML = this.getNoDataMessage('El segundo corte está en progreso');
            return;
        }

        corte2Container.innerHTML = '';

        calificacionesCorte2.forEach(calificacion => {
            const subjectCard = this.createSubjectCard(calificacion, 'corte2');
            corte2Container.appendChild(subjectCard);
        });

        this.updateCorteAverage('corte2', calificacionesCorte2);
    }

    renderTercerCorte() {
        const corte3Container = document.querySelector('#corte3 .subjects-grid');
        if (!corte3Container) return;

        corte3Container.innerHTML = `
            <div class="subject-card pending">
                <div class="subject-header">
                    <h4>Matemáticas</h4>
                    <div class="subject-grade pending">-</div>
                </div>
                <div class="subject-details">
                    <div class="grade-breakdown">
                        <div class="grade-item pending">
                            <span class="grade-name">Examen Final</span>
                            <span class="grade-value">Pendiente</span>
                        </div>
                        <div class="grade-item pending">
                            <span class="grade-name">Proyecto Final</span>
                            <span class="grade-value">Pendiente</span>
                        </div>
                    </div>
                    <div class="grade-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">0%</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotaFinal() {
        const finalContainer = document.querySelector('#final .final-subjects');
        if (!finalContainer) return;

        const notasFinales = this.calculateNotasFinales();

        if (notasFinales.length === 0) {
            finalContainer.innerHTML = this.getNoDataMessage('No hay notas finales calculadas aún');
            return;
        }

        finalContainer.innerHTML = '';

        notasFinales.forEach(notaFinal => {
            const finalCard = this.createFinalSubjectCard(notaFinal);
            finalContainer.appendChild(finalCard);
        });

        this.updateFinalStatistics();
    }

    createSubjectCard(calificacion, corte) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        
        const nota = calificacion.nota || 0;
        const categoria = calificacion.categoria || this.getCategoriaNota(nota);
        
        card.innerHTML = `
            <div class="subject-header">
                <h4>${calificacion.materia || calificacion.proyecto_titulo || 'Sin materia'}</h4>
                <div class="subject-grade ${categoria}">${nota.toFixed(1)}</div>
            </div>
            <div class="subject-details">
                <div class="grade-breakdown">
                    <div class="grade-item">
                        <span class="grade-name">${calificacion.evaluacion || 'Evaluación'}</span>
                        <span class="grade-value">${nota.toFixed(1)}</span>
                    </div>
                    <div class="grade-item">
                        <span class="grade-name">Porcentaje</span>
                        <span class="grade-value">${calificacion.porcentaje || 0}%</span>
                    </div>
                    <div class="grade-item">
                        <span class="grade-name">Proyecto</span>
                        <span class="grade-value">${calificacion.proyecto_titulo || 'N/A'}</span>
                    </div>
                </div>
                <div class="grade-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${categoria}" style="width: ${(nota / 5) * 100}%"></div>
                    </div>
                    <span class="progress-text">${((nota / 5) * 100).toFixed(0)}%</span>
                </div>
                ${calificacion.observaciones ? `
                <div class="observaciones">
                    <strong>Observaciones:</strong> ${calificacion.observaciones}
                </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    createFinalSubjectCard(notaFinal) {
        const card = document.createElement('div');
        card.className = 'final-subject-card';
        const categoria = this.getCategoriaNota(notaFinal.notaFinal);
        
        card.innerHTML = `
            <div class="subject-info">
                <h4>${notaFinal.materia}</h4>
                <div class="subject-credits">${notaFinal.creditos || 3} créditos</div>
            </div>
            <div class="subject-final-grade ${categoria}">${notaFinal.notaFinal.toFixed(1)}</div>
            <div class="subject-breakdown">
                <div class="breakdown-item">
                    <span>Corte 1: ${notaFinal.corte1.toFixed(1)} (35%)</span>
                    <span>${(notaFinal.corte1 * 0.35).toFixed(2)}</span>
                </div>
                <div class="breakdown-item">
                    <span>Corte 2: ${notaFinal.corte2.toFixed(1)} (35%)</span>
                    <span>${(notaFinal.corte2 * 0.35).toFixed(2)}</span>
                </div>
                <div class="breakdown-item">
                    <span>Corte 3: ${notaFinal.corte3.toFixed(1)} (30%)</span>
                    <span>${(notaFinal.corte3 * 0.30).toFixed(2)}</span>
                </div>
                <div class="breakdown-item total">
                    <span>Nota Final</span>
                    <span>${notaFinal.notaFinal.toFixed(2)}</span>
                </div>
            </div>
        `;

        return card;
    }

    calculateNotasFinales() {
        // Simular cálculo de notas finales basado en las calificaciones reales
        return this.calificaciones.slice(0, 3).map((cal, index) => {
            const materias = ['Matemáticas', 'Física', 'Programación'];
            const creditos = [4, 3, 3];
            
            const baseNota = cal.nota || 3.5;
            
            return {
                materia: materias[index] || cal.materia || cal.proyecto_titulo || 'Materia',
                creditos: creditos[index],
                corte1: parseFloat((baseNota * 0.9 + Math.random() * 0.5).toFixed(1)),
                corte2: parseFloat((baseNota * 0.95 + Math.random() * 0.3).toFixed(1)),
                corte3: parseFloat((baseNota * 0.85 + Math.random() * 0.4).toFixed(1)),
                notaFinal: baseNota
            };
        });
    }

    updateCorteAverage(corteId, calificaciones) {
        const averageElement = document.querySelector(`#${corteId} .corte-average .average-value`);
        if (averageElement && calificaciones.length > 0) {
            const promedio = calificaciones.reduce((sum, cal) => sum + cal.nota, 0) / calificaciones.length;
            averageElement.textContent = promedio.toFixed(1);
        }
    }

    updateFinalStatistics() {
        const statsGrid = document.querySelector('.final-statistics .stats-grid');
        if (!statsGrid) return;

        const distribucion = this.estadisticas.distribucion || {};
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${this.estadisticas.materiasActivas || 0}</div>
                <div class="stat-label">Materias Cursadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(this.estadisticas.materiasActivas * 3) || 0}</div>
                <div class="stat-label">Créditos Totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${distribucion.excelentes || 0}</div>
                <div class="stat-label">Materias Excelentes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${distribucion.buenos || 0}</div>
                <div class="stat-label">Materias Buenas</div>
            </div>
        `;

        // Actualizar promedio final
        const finalAverage = document.querySelector('.final-average-value');
        if (finalAverage) {
            finalAverage.textContent = this.estadisticas.promedioGeneral?.toFixed(1) || '0.0';
        }

        // Actualizar estado final
        const finalStatus = document.querySelector('.final-status');
        if (finalStatus) {
            const promedio = this.estadisticas.promedioGeneral || 0;
            let estado = 'regular';
            let texto = 'Regular';
            
            if (promedio >= 4.5) {
                estado = 'excelente';
                texto = 'Excelente';
            } else if (promedio >= 4.0) {
                estado = 'good';
                texto = 'Bueno';
            } else if (promedio >= 3.5) {
                estado = 'average';
                texto = 'Regular';
            } else {
                estado = 'poor';
                texto = 'Necesita mejorar';
            }
            
            finalStatus.className = `final-status ${estado}`;
            finalStatus.textContent = texto;
        }
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

    setupEventListeners() {
        // Cambio de periodo académico
        const academicPeriod = document.getElementById('academicPeriod');
        if (academicPeriod) {
            academicPeriod.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                console.log('🔄 Cambiando a periodo:', this.currentPeriod);
                this.loadCalificaciones(this.currentPeriod);
            });
        }
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
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

    showError(message) {
        console.error('❌ Error:', message);
        // Mostrar notificación suave
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
let gradesManager;
document.addEventListener('DOMContentLoaded', function() {
    gradesManager = new GradesManager();
});