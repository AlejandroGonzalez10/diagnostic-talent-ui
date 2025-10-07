<template>
  <div class="form-header">
    <h2>Diagnóstico digital de entorno laboral</h2>
    <div class="descripcion-diagnostico">
      <p>La gestión estratégica del talento humano es un pilar fundamental para garantizar la
        sostenibilidad, competitividad e innovación de las organizaciones. En este contexto, las
        actividades para la gestión del talento se convierten en un aspecto clave para alinear la
        planeación de personas con las metas del negocio.</p>
      
      <p>Con este Diagnóstico digital de entorno laboral y los 6 pilares de análisis, se busca
        ofrecer una herramienta práctica y estructurada que permita por un lado, identificar brechas
        en políticas, procesos y prácticas de gestión que impacten la atracción, desarrollo y
        retención del capital humano; además de evaluar la efectividad en la estructuración de
        vacantes tácticas y estratégicas.</p>
      
      <p>Este diagnóstico no constituye una evaluación de personas, sino un instrumento de
        autogestión para la empresa. No debe interpretarse como un análisis profundo y detallado
        de la situación actual de la compañía, es un ejercicio orientativo.</p>
    </div>
    <div class="pilares-analisis">
      <h3>Pilares de análisis</h3>
      <ul>
        <li>
          <strong>Perfil competitivo: 20%</strong>
          <p>Barreras y facilitadores en los procesos de convocatoria, atracción, selección y retención del talento</p>
        </li>
        <li>
          <strong>Servicios, sistemas y políticas: 20%</strong>
          <p>Evaluación de la normatividad, políticas que promueven los procesos de selección y retención</p>
        </li>
        <li>
          <strong>Marca Empleadora: 20%</strong>
          <p>Identificación de rasgos y comportamientos de la cultura organizacional y su impacto en la empresa</p>
        </li>
        <li>
          <strong>Tecnologías y Herramientas: 20%</strong>
          <p>Recursos tecnológicos, capacidad de innovación y adaptación a los cambios y demanda del mercado</p>
        </li>
        <li>
          <strong>Actualización de conocimiento y upskilling: 20%</strong>
          <p>Necesidades de formación y actualización en conocimiento del equipo de trabajo</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiagnosticDescription'
}
</script>

<style scoped>
.form-header {
  margin-bottom: 2rem;
}

.descripcion-diagnostico {
  margin: 1.5rem 0;
  text-align: justify;
}

.descripcion-diagnostico p {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.pilares-analisis {
  margin-top: 2rem;
}

.pilares-analisis h3 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.pilares-analisis ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.pilares-analisis li {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pilares-analisis strong {
  display: block;
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.pilares-analisis p {
  margin: 0;
  color: #666;
  line-height: 1.4;
  font-size: 0.95rem;
}
</style>