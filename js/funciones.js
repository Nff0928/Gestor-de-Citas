
class MediCitasApp {
    constructor() {
        this.currentRole = null;
        this.appointments = [];
        this.doctors = [
            'Dr. García - Cardiología',
            'Dra. López - Dermatología', 
            'Dr. Martínez - Medicina General',
            'Dra. Rodríguez - Ginecología',
            'Dr. Sánchez - Pediatría'
        ];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
        this.setTodayDate();
    }

    bindEvents() {
        // Patient form
        document.getElementById('patientForm').addEventListener('submit', (e) => this.handlePatientSubmit(e));
        
        // Doctor form
        document.getElementById('doctorAvailabilityForm').addEventListener('submit', (e) => this.handleDoctorSubmit(e));
        
        // Filters
        document.getElementById('patientFilterStatus').addEventListener('change', () => this.renderAppointments());
        document.getElementById('patientFilterDate').addEventListener('change', () => this.renderAppointments());
        document.getElementById('doctorFilterStatus').addEventListener('change', () => this.renderAppointments());
        document.getElementById('doctorFilterDate').addEventListener('change', () => this.renderAppointments());
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('patientDate').value = today;
        document.getElementById('patientFilterDate').value = today;
        document.getElementById('doctorFilterDate').value = today;
    }

    loadSampleData() {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        this.appointments = [
            {
                id: 1,
                doctor: 'Dr. García - Cardiología',
                date: today,
                time: '10:00',
                reason: 'Consulta de rutina - Revisión cardiovascular',
                phone: '+57 300 123 4567',
                status: 'confirmed',
                patientName: 'María González',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                doctor: 'Dra. López - Dermatología',
                date: tomorrow,
                time: '15:00',
                reason: 'Revisión de lunar en brazo derecho',
                phone: '+57 301 234 5678',
                status: 'pending',
                patientName: 'Carlos Rodríguez',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                doctor: 'Dr. Martínez - Medicina General',
                date: today,
                time: '08:00',
                reason: 'Dolor de cabeza persistente',
                phone: '+57 302 345 6789',
                status: 'completed',
                patientName: 'Ana López',
                createdAt: new Date().toISOString()
            }
        ];
    }

    handlePatientSubmit(e) {
        e.preventDefault();
        
        const appointment = {
            id: Date.now(),
            doctor: document.getElementById('patientDoctor').value,
            date: document.getElementById('patientDate').value,
            time: document.getElementById('patientTime').value,
            reason: document.getElementById('patientReason').value,
            phone: document.getElementById('patientPhone').value,
            status: 'pending',
            patientName: 'Usuario Actual',
            createdAt: new Date().toISOString()
        };

        this.appointments.push(appointment);
        this.showNotification('Cita solicitada exitosamente. El doctor la revisará pronto.', 'success');
        this.resetPatientForm();
        this.renderAppointments();
        this.updateStats();
    }

    handleDoctorSubmit(e) {
        e.preventDefault();
        this.showNotification('Disponibilidad actualizada exitosamente', 'success');
    }

    resetPatientForm() {
        document.getElementById('patientForm').reset();
        this.setTodayDate();
    }

    updateAppointmentStatus(id, newStatus) {
        const appointment = this.appointments.find(a => a.id === id);
        if (appointment) {
            appointment.status = newStatus;
            this.renderAppointments();
            this.updateStats();
            
            const statusMessages = {
                confirmed: 'Cita confirmada exitosamente',
                cancelled: 'Cita cancelada',
                completed: 'Cita marcada como completada'
            };
            
            this.showNotification(statusMessages[newStatus], 'success');
        }
    }

    deleteAppointment(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            this.appointments = this.appointments.filter(a => a.id !== id);
            this.renderAppointments();
            this.updateStats();
            this.showNotification('Cita eliminada exitosamente', 'success');
        }
    }

    renderAppointments() {
        if (this.currentRole === 'patient') {
            this.renderPatientAppointments();
        } else if (this.currentRole === 'doctor') {
            this.renderDoctorAppointments();
        }
    }

    renderPatientAppointments() {
        const container = document.getElementById('patientAppointmentsList');
        const statusFilter = document.getElementById('patientFilterStatus').value;
        const dateFilter = document.getElementById('patientFilterDate').value;

        let filtered = this.appointments.filter(a => a.patientName === 'Usuario Actual');
        
        if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
        if (dateFilter) filtered = filtered.filter(a => a.date === dateFilter);

        filtered.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p>No hay citas que mostrar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(appointment => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-title">${appointment.doctor}</div>
                    <div class="appointment-date">${this.formatDate(appointment.date)} - ${appointment.time}</div>
                </div>
                <div class="appointment-details">
                    <div><strong>Motivo:</strong> ${appointment.reason}</div>
                    <div><strong>Teléfono:</strong> ${appointment.phone}</div>
                    <div><strong>Estado:</strong> <span class="status-badge status-${appointment.status}">${this.getStatusText(appointment.status)}</span></div>
                </div>
                <div class="appointment-actions">
                    ${appointment.status === 'pending' ? `
                        <button class="btn btn-small btn-danger" onclick="app.deleteAppointment(${appointment.id})">Cancelar</button>
                    ` : ''}
                    ${appointment.status === 'confirmed' ? `
                        <button class="btn btn-small btn-danger" onclick="app.updateAppointmentStatus(${appointment.id}, 'cancelled')">Cancelar</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderDoctorAppointments() {
        const container = document.getElementById('doctorAppointmentsList');
        const statusFilter = document.getElementById('doctorFilterStatus').value;
        const dateFilter = document.getElementById('doctorFilterDate').value;

        let filtered = this.appointments;
        
        if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
        if (dateFilter) filtered = filtered.filter(a => a.date === dateFilter);

        filtered.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>No hay citas que mostrar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(appointment => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-title">👤 ${appointment.patientName}</div>
                    <div class="appointment-date">${this.formatDate(appointment.date)} - ${appointment.time}</div>
                </div>
                <div class="appointment-details">
                    <div><strong>Doctor:</strong> ${appointment.doctor}</div>
                    <div><strong>Motivo:</strong> ${appointment.reason}</div>
                    <div><strong>Teléfono:</strong> ${appointment.phone}</div>
                    <div><strong>Estado:</strong> <span class="status-badge status-${appointment.status}">${this.getStatusText(appointment.status)}</span></div>
                </div>
                <div class="appointment-actions">
                    ${appointment.status === 'pending' ? `
                        <button class="btn btn-small btn-success" onclick="app.updateAppointmentStatus(${appointment.id}, 'confirmed')">Confirmar</button>
                        <button class="btn btn-small btn-danger" onclick="app.updateAppointmentStatus(${appointment.id}, 'cancelled')">Rechazar</button>
                    ` : ''}
                    ${appointment.status === 'confirmed' ? `
                        <button class="btn btn-small btn-success" onclick="app.updateAppointmentStatus(${appointment.id}, 'completed')">Marcar Completada</button>
                        <button class="btn btn-small btn-danger" onclick="app.updateAppointmentStatus(${appointment.id}, 'cancelled')">Cancelar</button>
                    ` : ''}
                    <button class="btn btn-small btn-danger" onclick="app.deleteAppointment(${appointment.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.currentRole === 'patient') {
            const patientAppointments = this.appointments.filter(a => a.patientName === 'Usuario Actual');
            const todayAppointments = patientAppointments.filter(a => a.date === today);
            const pendingAppointments = patientAppointments.filter(a => a.status === 'pending');
            const completedAppointments = patientAppointments.filter(a => a.status === 'completed');

            document.getElementById('patientTotalCitas').textContent = patientAppointments.length;
            document.getElementById('patientCitasHoy').textContent = todayAppointments.length;
            document.getElementById('patientCitasPendientes').textContent = pendingAppointments.length;
            document.getElementById('patientCitasCompletas').textContent = completedAppointments.length;
        
        } else if (this.currentRole === 'doctor') {
            const todayAppointments = this.appointments.filter(a => a.date === today);
            const pendingAppointments = this.appointments.filter(a => a.status === 'pending');
            const uniquePatients = [...new Set(this.appointments.map(a => a.patientName))];

            document.getElementById('doctorTotalCitas').textContent = this.appointments.length;
            document.getElementById('doctorCitasHoy').textContent = todayAppointments.length;
            document.getElementById('doctorCitasPendientes').textContent = pendingAppointments.length;
            document.getElementById('doctorPacientes').textContent = uniquePatients.length;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Pendiente',
            confirmed: 'Confirmada',
            completed: 'Completada',
            cancelled: 'Cancelada'
        };
        return statusTexts[status] || status;
    }

    clearPatientFilters() {
        document.getElementById('patientFilterStatus').value = '';
        document.getElementById('patientFilterDate').value = '';
        this.renderAppointments();
    }

    clearDoctorFilters() {
        document.getElementById('doctorFilterStatus').value = '';
        document.getElementById('doctorFilterDate').value = '';
        this.renderAppointments();
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Navigation Functions
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function setRole(role) {
    app.currentRole = role;
    
    // Update navigation
    document.getElementById('roleIndicator').textContent = role === 'patient' ? '👤 Paciente' : '👨‍⚕️ Doctor';
    document.getElementById('roleIndicator').style.display = 'block';
    document.getElementById('patientBtn').style.display = 'inline-block';
    document.getElementById('doctorBtn').style.display = 'inline-block';
    
    // Show appropriate page
    showPage(role);
    
    // Update data
    app.renderAppointments();
    app.updateStats();
    
    app.showNotification(`Bienvenido al panel de ${role === 'patient' ? 'paciente' : 'doctor'}`, 'info');
}

// Initialize App
const app = new MediCitasApp();
