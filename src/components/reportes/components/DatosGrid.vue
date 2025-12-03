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
        
        <div class="filtro-acciones">
          <button @click="limpiarFiltros" class="btn-limpiar">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Información de resultados -->
    <div class="resultados-info">
      <p class="resultados-text">
        Mostrando <strong>{{ datosFiltrados.length }}</strong> registros de <strong>{{ totalItems }}</strong> totales
      </p>

      <button @click="descargarCSV" :disabled="descargandoCSV" class="btn-descargar-csv" aria-label="Descargar CSV raw">
        <span class="csv-icon" aria-hidden="true">⬇️</span>
        <span v-if="descargandoCSV">Generando CSV...</span>
        <span v-else>Exportar CSV</span>
      </button>
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
              Nombre empresa
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
            <!-- Número de empleados column removed (field no longer collected in the form) -->
            <th @click="ordenarPor('contacto')" class="sortable">
              Nombre quien diligenció
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
            <th @click="ordenarPor('fill_categories')" class="sortable">
              Datos completos
              <span class="sort-icon" v-if="ordenActual === 'fill_categories'">
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
            <!-- registro.empleados removed -->
            <td class="contacto-cell">{{ registro.contacto }}</td>
            <td>{{ registro.cargo }}</td>
            <td>{{ registro.email }}</td>
            <td>{{ formatearFecha(registro.fecha) }}</td>
            <td>{{ registro.fill_categories === 5 ? 'SI' : 'NO' }}</td>
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

    <!-- Paginación -->
    <div v-if="!cargando && !error && totalItems > 0" class="paginacion-container">
      <div class="paginacion">
        <button 
          @click="cambiarPagina(1)" 
          :disabled="currentPage === 1"
          class="btn-pagina"
          title="Primera página"
        >
          ««
        </button>
        
        <button 
          @click="cambiarPagina(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn-pagina"
          title="Página anterior"
        >
          «
        </button>
        
        <div class="paginas-numeros">
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            @click="cambiarPagina(pagina)"
            :class="['btn-pagina', { 'activa': pagina === currentPage }]"
          >
            {{ pagina }}
          </button>
        </div>
        
        <button 
          @click="cambiarPagina(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn-pagina"
          title="Página siguiente"
        >
          »
        </button>
        
        <button 
          @click="cambiarPagina(totalPages)" 
          :disabled="currentPage === totalPages"
          class="btn-pagina"
          title="Última página"
        >
          »»
        </button>
      </div>
      
      <div class="info-paginacion">
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <select v-model="pageSize" @change="cambiarTamanoPagina" class="select-tamano">
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { reportesApi } from '@/services/api'

export default {
  name: 'DatosGrid',
  setup() {
    // Estados reactivos
    const cargando = ref(false)
    const error = ref('')
    const descargando = ref(null)
    const datosRegistros = ref([])
    
    // Paginación
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)
    const totalPages = ref(0)
    
    // Filtros
    const filtros = ref({
      empresa: '',
      sector: ''
    })
    
    // Ordenamiento
    const ordenActual = ref('fecha')
    const direccionOrden = ref('desc')

    // Función para cargar datos desde el API
    const cargarDatos = async () => {
      cargando.value = true
      error.value = ''
      
      try {
        const response = await reportesApi.obtenerReportes(currentPage.value, pageSize.value)
        
        // Mapear los datos del API a la estructura esperada por la grid
        datosRegistros.value = response.data.map(item => ({
          id: item.id,
          empresa: item.company || '',
          nit: item.nit || '',
          sector: item.sector || '',
          // empleados field removed from grid mapping - form no longer collects it
          fill_categories: item.fill_categories != null ? Number(item.fill_categories) : 0,
          contacto: item.chief_name || '',
          cargo: item.company_role || '',
          email: item.chief_email || '',
          fecha: item.created_at ? new Date(item.created_at) : new Date(),
          userId: item.user_id
        }))
        
        // Actualizar información de paginación
        totalItems.value = response.totalItems
        totalPages.value = response.totalPages
        currentPage.value = response.currentPage
        
      } catch (err) {
        error.value = 'Error al cargar los datos. Intenta nuevamente.'
        console.error('Error cargando datos:', err)
      } finally {
        cargando.value = false
      }
    }

    // Descargar CSV desde endpoint RAW
    const descargandoCSV = ref(false)
    const descargarCSV = async () => {
      descargandoCSV.value = true
      try {
        const data = await reportesApi.obtenerRaw()

        // data is expected to be an array of objects with specified fields
        const headers = [
          'id','empresa','nit','sector','diligencia','correo','cargo','creado_en','pilar','pregunta','respuesta'
        ]

        const formatDateCSV = (iso) => {
          try {
            const d = new Date(iso)
            if (Number.isNaN(d.getTime())) return ''
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            const yyyy = d.getFullYear()
            const hh = String(d.getHours()).padStart(2, '0')
            const min = String(d.getMinutes()).padStart(2, '0')
            return `${mm}/${dd}/${yyyy} ${hh}:${min}`
          } catch (e) {
            return ''
          }
        }

        const rows = data.map(item => ({
          id: item.id != null ? item.id : '',
          empresa: item.company != null ? item.company : '',
          nit: item.nit != null ? item.nit : '',
          sector: item.sector != null ? item.sector : '',
          diligencia: item.chief_name != null ? item.chief_name : '',
          correo: item.chief_email != null ? item.chief_email : '',
          cargo: item.company_role != null ? item.company_role : '',
          creado_en: item.created_at != null ? formatDateCSV(item.created_at) : '',
          pilar: item.category != null ? item.category : '',
          pregunta: item.question != null ? item.question : '',
          respuesta: item.value != null ? item.value : ''
        }))

        // Build CSV string, escape values
        const escapeCsv = (val) => {
          if (val === null || val === undefined) return ''
          const s = String(val)
          // escape double quotes
          if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
            return '"' + s.replace(/"/g, '""') + '"'
          }
          return s
        }

        const csvLines = []
        csvLines.push(headers.join(','))

        rows.forEach(r => {
          const line = headers.map(h => escapeCsv(r[h])).join(',')
          csvLines.push(line)
        })

        const csvContent = '\uFEFF' + csvLines.join('\n') // add BOM for Excel
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const fecha = new Date().toISOString().slice(0,19).replace(/:/g,'-')
        a.download = `report_raw_${fecha}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)

      } catch (err) {
        console.error('Error descargando CSV:', err)
        alert('Error al generar el CSV. Intenta nuevamente.')
      } finally {
        descargandoCSV.value = false
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
        const response = await reportesApi.generarPDF(registro.id);
        const url = URL.createObjectURL(response);
        window.open(url, "_blank"); // abrir en nueva pestaña
        
      } catch (err) {
        console.error('Error descargando PDF:', err)
        alert('Error al descargar el PDF. Intenta nuevamente.')
      } finally {
        descargando.value = null
      }
    }

    // CSV download implemented above (descargarCSV with descargandoCSV flag)

    // Páginas visibles para la paginación
    const paginasVisibles = computed(() => {
      const paginas = []
      const rango = 2 // Mostrar 2 páginas antes y después de la actual
      
      let inicio = Math.max(1, currentPage.value - rango)
      let fin = Math.min(totalPages.value, currentPage.value + rango)
      
      // Ajustar para mostrar siempre 5 páginas cuando sea posible
      if (fin - inicio < 4) {
        if (inicio === 1) {
          fin = Math.min(totalPages.value, inicio + 4)
        } else if (fin === totalPages.value) {
          inicio = Math.max(1, fin - 4)
        }
      }
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i)
      }
      
      return paginas
    })

    // Función para cambiar de página
    const cambiarPagina = (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPages.value && nuevaPagina !== currentPage.value) {
        currentPage.value = nuevaPagina
        cargarDatos()
        // Scroll hacia arriba al cambiar de página
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    // Función para cambiar el tamaño de página
    const cambiarTamanoPagina = () => {
      currentPage.value = 1 // Volver a la primera página
      cargarDatos()
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
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      paginasVisibles,
      limpiarFiltros,
      ordenarPor,
      formatearFecha,
      descargarPDF,
      descargarCSV,
      descargandoCSV,
      cargarDatos,
      cambiarPagina,
      cambiarTamanoPagina
    }
  }
}
</script>

<style scoped>
.filtros-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
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
  border-color: #2D2D2D;
  box-shadow: 0 0 0 3px rgba(0, 103, 177, 0.1);
}

.filtro-acciones {
  display: flex;
  align-items: end;
}

.btn-limpiar {
  background: #FFD000;
  color: #2D2D2D;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-limpiar:hover {
  background: #FFE000;
}

.btn-csv {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 1rem;
}

.btn-csv:hover {
  background: #005494;
}

.resultados-info {
  margin-bottom: 1rem;
}

.resultados-info p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* Layout: place the export button to the right of the resultados-text */
.resultados-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.resultados-text {
  margin: 0;
  color: #666;
}

.btn-descargar-csv {
  background: linear-gradient(180deg, #FFD000, #E6B800);
  color: #2D2D2D;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 6px 18px rgba(45, 45, 45, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.btn-descargar-csv:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-descargar-csv:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(45, 45, 45, 0.16);
}

.csv-icon {
  font-size: 1.05rem;
  line-height: 1;
}

.tabla-container {
  overflow-x: auto;
  padding: 0;
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem 0;
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
  background: #FFD000;
  color: #2D2D2D;
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
  background: #2D2D2D;
  color: #FFD000;
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
  background: #2D2D2D;
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
  background: #FFD000;
  color: #2D2D2D;
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
  background: #FFD000;
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

/* Paginación */
.paginacion-container {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.paginacion {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.paginas-numeros {
  display: flex;
  gap: 0.25rem;
}

.btn-pagina {
  min-width: 40px;
  height: 40px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pagina:hover:not(:disabled) {
  background: #2D2D2D;
  color: #FFD000;
  border-color: #2D2D2D;
}

.btn-pagina:disabled {
  background: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.btn-pagina.activa {
  background: #2D2D2D;
  color: #FFD000;
  border-color: #2D2D2D;
  font-weight: 600;
}

.info-paginacion {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.select-tamano {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #495057;
  cursor: pointer;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.select-tamano:focus {
  outline: none;
  border-color: #2D2D2D;
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.1);
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
  
  .paginacion-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .paginacion {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .info-paginacion {
    flex-direction: column;
    text-align: center;
  }

  /* Stack resultados info on small screens so button sits below the text */
  .resultados-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .btn-descargar-csv {
    align-self: flex-end;
  }
}
</style>