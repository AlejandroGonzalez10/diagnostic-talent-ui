<template>
  <div class="form-header">
    <h2 class="title-banner">Diagnóstico digital de entorno laboral</h2>
    <div class="descripcion-diagnostico">
      <p>La gestión estratégica del talento humano es un pilar fundamental para garantizar la
        sostenibilidad, competitividad e innovación de las organizaciones. En este contexto, las
        actividades para la gestión del talento se convierten en un aspecto clave para alinear la
        planeación de personas con las metas del negocio.</p>
      
      <p>Con este <strong>Diagnóstico digital de entorno laboral</strong> y los <strong>5 pilares de análisis</strong>, se busca
        ofrecer una herramienta práctica y estructurada que permita por un lado, identificar brechas
        en políticas, procesos y prácticas de gestión que impacten la atracción, desarrollo y
        retención del capital humano; además de evaluar la efectividad en la estructuración de
        vacantes tácticas y estratégicas.</p>
      
      <p>Este diagnóstico no constituye una evaluación de personas, sino un <strong>instrumento de
        autogestión para la empresa</strong>. No debe interpretarse como un análisis profundo y detallado
        de la situación actual de la compañía, es un ejercicio orientativo.</p>
    </div>
    <div class="pilares-analisis">
      <h3 class="primary-title">Pilares de análisis</h3>
      <ul>
        <li v-for="categoria in categorias" :key="categoria.id">
          <div>
            <strong>{{ categoria.name || categoria.title || categoria.nombre }}</strong>
            <p>{{ categoria.short_description || categoria.descripcion || categoria.desc }}</p>
          </div>
          <div class="peso-categoria">{{ categoria.weight || categoria.peso || 20 }}%</div>
        </li>
        
        <!-- Fallback en caso de que no haya categorías cargadas -->
        <li v-if="!categorias || categorias.length === 0">
          <strong>Perfil competitivo: 20%</strong>
          <p>Barreras y facilitadores en los procesos de convocatoria, atracción, selección y retención del talento</p>
        </li>
        <li v-if="!categorias || categorias.length === 0">
          <strong>Servicios, sistemas y políticas: 20%</strong>
          <p>Evaluación de la normatividad, políticas que promueven los procesos de selección y retención</p>
        </li>
        <li v-if="!categorias || categorias.length === 0">
          <strong>Marca Empleadora: 20%</strong>
          <p>Identificación de rasgos y comportamientos de la cultura organizacional y su impacto en la empresa</p>
        </li>
        <li v-if="!categorias || categorias.length === 0">
          <strong>Tecnologías y Herramientas: 20%</strong>
          <p>Recursos tecnológicos, capacidad de innovación y adaptación a los cambios y demanda del mercado</p>
        </li>
        <li v-if="!categorias || categorias.length === 0">
          <strong>Actualización de conocimiento y upskilling: 20%</strong>
          <p>Necesidades de formación y actualización en conocimiento del equipo de trabajo</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiagnosticDescription',
  props: {
    categorias: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.form-header {
  margin-bottom: 0.25rem;
}

.form-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  margin-top: 0;
  font-weight: bold;
  text-align: center;
}

.descripcion-diagnostico {
  margin: 0.1rem 0 3rem 0;
  text-align: justify;
}

.descripcion-diagnostico p {
  margin-bottom: 0.1rem;
  line-height: 1.3;
}

.pilares-analisis {
  margin-top: 1.5rem;
}

.pilares-analisis h3 {
  margin-bottom: 1rem;
  font-size: 1.6rem;
  text-align: center;
}

.pilares-analisis ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.pilares-analisis li {
  background: #f8f9fa;
  padding: 1.2rem;
  border-radius: 8px;
  border-left: 4px solid #FFC107;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
  display: flex;
}

.pilares-analisis strong {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.pilares-analisis .peso-categoria {
  font-size: 1.5rem;
  color: #0067b1;
}

.pilares-analisis p {
  margin: 0;
  color: #666;
  line-height: 1.4;
  font-size: 0.95rem;
}
</style>