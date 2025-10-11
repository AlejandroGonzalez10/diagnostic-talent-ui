<template>
  <!-- Filtros de búsqueda -->
  <div class="filtros-container">
      <div class="filtros-grid">
        <div class="filtro-item">
          <label for="buscar-empresa">Nombre de la empresa:</label>
          <input
            id="buscar-empresa"
            type="text"
            v-model="filtros.empresa"
            placeholder="Buscar por empresa..."
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-item">
          <label for="buscar-sector">Sector:</label>
          <input
            id="buscar-sector"
            type="text"
            v-model="filtros.sector"
            placeholder="Buscar por sector..."
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-item">
          <label for="buscar-empleados">Número de empleados:</label>
          <input
            id="buscar-empleados"
            type="text"
            v-model="filtros.empleados"
            placeholder="Buscar por número de empleados..."
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-acciones">
          <button @click="limpiarFiltros" class="btn-limpiar">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Información de resultados -->
    <div class="resultados-info">
      <p>
        Mostrando {{ datosFiltrados.length }} de {{ datosRegistros.length }} registros
      </p>
    </div>

    <!-- Tabla de datos -->
    <div class="tabla-container">
      <div v-if="cargando" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p class="error-mensaje">{{ error }}</p>
        <button @click="cargarDatos" class="btn-reintentar">Reintentar</button>
      </div>
      
      <div v-else-if="datosFiltrados.length === 0" class="empty-state">
        <p>No se encontraron registros con los filtros aplicados.</p>
      </div>
      
      <table v-else class="datos-tabla">
        <thead>
          <tr>
            <th @click="ordenarPor('empresa')" class="sortable">
              Nombre de la empresa
              <span class="sort-icon" v-if="ordenActual === 'empresa'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('nit')" class="sortable">
              NIT
              <span class="sort-icon" v-if="ordenActual === 'nit'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('sector')" class="sortable">
              Sector
              <span class="sort-icon" v-if="ordenActual === 'sector'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('empleados')" class="sortable">
              Número de empleados
              <span class="sort-icon" v-if="ordenActual === 'empleados'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('contacto')" class="sortable">
              Nombre completo de quien diligencia
              <span class="sort-icon" v-if="ordenActual === 'contacto'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('cargo')" class="sortable">
              Cargo
              <span class="sort-icon" v-if="ordenActual === 'cargo'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('email')" class="sortable">
              Correo electrónico
              <span class="sort-icon" v-if="ordenActual === 'email'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('fecha')" class="sortable">
              Fecha Registro
              <span class="sort-icon" v-if="ordenActual === 'fecha'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="registro in datosFiltrados" :key="registro.id" class="fila-datos">
            <td class="empresa-cell">{{ registro.empresa }}</td>
            <td>{{ registro.nit }}</td>
            <td>{{ registro.sector }}</td>
            <td>{{ registro.empleados }}</td>
            <td class="contacto-cell">{{ registro.contacto }}</td>
            <td>{{ registro.cargo }}</td>
            <td>{{ registro.email }}</td>
            <td>{{ formatearFecha(registro.fecha) }}</td>
            <td class="acciones-cell">
              <button 
                @click="descargarPDF(registro)" 
                class="btn-pdf"
                :disabled="descargando === registro.id"
                :title="'Descargar PDF de ' + registro.empresa"
              >
                <span v-if="descargando === registro.id" class="loading-mini"></span>
                <span v-else>📄</span>
                PDF
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'DatosGrid',
  setup() {
    // Estados reactivos
    const cargando = ref(false)
    const error = ref('')
    const descargando = ref(null)
    const datosRegistros = ref([])
    
    // Filtros
    const filtros = ref({
      empresa: '',
      sector: '',
      empleados: ''
    })
    
    // Ordenamiento
    const ordenActual = ref('fecha')
    const direccionOrden = ref('desc')

    // Datos de ejemplo (más adelante se conectará con la API real)
    const cargarDatos = async () => {
      cargando.value = true
      error.value = ''
      
      try {
        // Simular carga de datos - aquí se haría la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        datosRegistros.value = [
          {
            id: 1,
            empresa: 'Tecnología Avanzada S.A.S',
            nit: '900.123.456-7',
            sector: 'Tecnología',
            empleados: '50-100',
            contacto: 'María García',
            cargo: 'Gerente de Recursos Humanos',
            email: 'maria.garcia@tecnoavanzada.com',
            fecha: new Date('2024-01-15')
          },
          {
            id: 2,
            empresa: 'Industrias Colombia LTDA',
            nit: '800.987.654-3',
            sector: 'Manufactura',
            empleados: '200-500',
            contacto: 'Carlos Rodríguez',
            cargo: 'Director de Talento Humano',
            email: 'carlos.rodriguez@industrias.com',
            fecha: new Date('2024-01-20')
          },
          {
            id: 3,
            empresa: 'Servicios Empresariales',
            nit: '700.456.789-1',
            sector: 'Servicios',
            empleados: '10-50',
            contacto: 'Ana López',
            cargo: 'Coordinadora de Personal',
            email: 'ana.lopez@servicios.com',
            fecha: new Date('2024-01-25')
          }
        ]
      } catch (err) {
        error.value = 'Error al cargar los datos. Intenta nuevamente.'
        console.error('Error cargando datos:', err)
      } finally {
        cargando.value = false
      }
    }

    // Datos filtrados
    const datosFiltrados = computed(() => {
      let datos = [...datosRegistros.value]
      
      // Aplicar filtros
      if (filtros.value.empresa) {
        datos = datos.filter(registro => 
          registro.empresa.toLowerCase().includes(filtros.value.empresa.toLowerCase())
        )
      }
      
      if (filtros.value.sector) {
        datos = datos.filter(registro => 
          registro.sector.toLowerCase().includes(filtros.value.sector.toLowerCase())
        )
      }
      
      if (filtros.value.empleados) {
        datos = datos.filter(registro => 
          registro.empleados.toLowerCase().includes(filtros.value.empleados.toLowerCase())
        )
      }
      
      // Aplicar ordenamiento
      datos.sort((a, b) => {
        let valorA = a[ordenActual.value]
        let valorB = b[ordenActual.value]
        
        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase()
          valorB = valorB.toLowerCase()
        }
        
        if (direccionOrden.value === 'asc') {
          return valorA > valorB ? 1 : valorA < valorB ? -1 : 0
        } else {
          return valorA < valorB ? 1 : valorA > valorB ? -1 : 0
        }
      })
      
      return datos
    })

    // Funciones
    const limpiarFiltros = () => {
      filtros.value = {
        empresa: '',
        sector: '',
        empleados: ''
      }
    }

    const ordenarPor = (campo) => {
      if (ordenActual.value === campo) {
        direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc'
      } else {
        ordenActual.value = campo
        direccionOrden.value = 'asc'
      }
    }

    const formatearFecha = (fecha) => {
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    const descargarPDF = async (registro) => {
      descargando.value = registro.id
      
      try {
        // Simular descarga de PDF - aquí se haría la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Aquí se implementaría la descarga real del PDF
        
        // Simulación de descarga
        const blob = new Blob(['PDF content for ' + registro.empresa], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_${registro.empresa.replace(/\s+/g, '_')}_${registro.id}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
      } catch (err) {
        console.error('Error descargando PDF:', err)
        alert('Error al descargar el PDF. Intenta nuevamente.')
      } finally {
        descargando.value = null
      }
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      cargarDatos()
    })

    return {
      cargando,
      error,
      descargando,
      datosRegistros,
      filtros,
      ordenActual,
      direccionOrden,
      datosFiltrados,
      limpiarFiltros,
      ordenarPor,
      formatearFecha,
      descargarPDF,
      cargarDatos
    }
  }
}
</script>

<style scoped>
.filtros-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-item label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filtro-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.filtro-input:focus {
  outline: none;
  border-color: #0067b1;
  box-shadow: 0 0 0 3px rgba(0, 103, 177, 0.1);
}

.filtro-acciones {
  display: flex;
  align-items: end;
}

.btn-limpiar {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-limpiar:hover {
  background: #005694;
}

.resultados-info {
  margin-bottom: 1rem;
}

.resultados-info p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.tabla-container {
  overflow-x: auto;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0067b1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-mensaje {
  color: #dc3545;
  margin-bottom: 1rem;
}

.btn-reintentar {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.datos-tabla {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.datos-tabla th {
  background: #0067b1;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.datos-tabla th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.datos-tabla th.sortable:hover {
  background: #005a9e;
}

.sort-icon {
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

.datos-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.fila-datos:hover {
  background: #f8f9fa;
}

.empresa-cell {
  font-weight: 500;
}

.contacto-cell {
  font-weight: 500;
}

.acciones-cell {
  text-align: center;
}

.btn-pdf {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-pdf:hover:not(:disabled) {
  background: #c82333;
}

.btn-pdf:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading-mini {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .datos-grid-container {
    padding: 1rem;
  }
  
  .filtros-grid {
    grid-template-columns: 1fr;
  }
  
  .datos-tabla {
    font-size: 0.85rem;
  }
  
  .datos-tabla th,
  .datos-tabla td {
    padding: 0.75rem 0.5rem;
  }
}
</style>