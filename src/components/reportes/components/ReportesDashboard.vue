<template>
  <div class="dashboard-container">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-icon">📊</div>
        <h3>Reporte General</h3>
        <p>Vista general de todos los cuestionarios completados</p>
        <div class="card-stats">
          <span class="stat-number">-</span>
          <span class="stat-label">Total Evaluaciones</span>
        </div>
        <button class="btn-card" disabled>Próximamente</button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">📈</div>
        <h3>Análisis por Categorías</h3>
        <p>Análisis detallado por cada categoría del diagnóstico</p>
        <div class="card-stats">
          <span class="stat-number">-</span>
          <span class="stat-label">Categorías Activas</span>
        </div>
        <button class="btn-card" disabled>Próximamente</button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">👥</div>
        <h3>Comparativo de Empresas</h3>
        <p>Comparación entre diferentes empresas evaluadas</p>
        <div class="card-stats">
          <span class="stat-number">-</span>
          <span class="stat-label">Empresas Registradas</span>
        </div>
        <button class="btn-card" disabled>Próximamente</button>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">📋</div>
        <h3>Exportar Datos</h3>
        <p>Exportar datos en diferentes formatos (Excel, PDF, CSV)</p>
        <div class="card-stats">
          <span class="stat-number">-</span>
          <span class="stat-label">Formatos Disponibles</span>
        </div>
        <button class="btn-card" disabled>Próximamente</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportesDashboard'
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  display: block;
}

.dashboard-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.dashboard-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-stats {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #0067b1;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.btn-card {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-card:hover:not(:disabled) {
  background: #005a9e;
  transform: translateY(-1px);
}

.btn-card:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem 0;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .dashboard-card {
    padding: 1.5rem;
  }
  
  .card-icon {
    font-size: 2.5rem;
  }
}
</style>