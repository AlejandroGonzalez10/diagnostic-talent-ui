// Mock data
const mockCategorias = [
    {
        id: 1,
        nombre: "Estrategia y Gestión de la Innovación",
        descripcion: "Evalúa cómo la organización planifica y gestiona sus actividades de innovación",
        peso: 25
    },
    {
        id: 2,
        nombre: "Cultura y Recursos",
        descripcion: "Analiza el ambiente organizacional y los recursos destinados a la innovación",
        peso: 20
    },
    {
        id: 3,
        nombre: "Procesos y Herramientas",
        descripcion: "Examina los procedimientos y herramientas utilizados para gestionar la innovación",
        peso: 30
    },
    {
        id: 4,
        nombre: "Colaboración y Networking",
        descripcion: "Evalúa las relaciones y colaboraciones externas para fomentar la innovación",
        peso: 25
    }
];

const mockPreguntas = [
    {
        id: 1,
        categoriaId: 1,
        texto: '¿La organización cuenta con procesos documentados para identificar necesidades de innovación?'
    },
    {
        id: 2,
        categoriaId: 1,
        texto: '¿Existen mecanismos formales para evaluar y seleccionar proyectos de innovación?'
    },
    {
        id: 3,
        categoriaId: 1,
        texto: '¿Se dispone de un proceso estructurado para la gestión de la innovación con etapas definidas?'
    },
    {
        id: 4,
        categoriaId: 2,
        texto: '¿Se promueve activamente la cultura de innovación mediante programas de capacitación?'
    },
    {
        id: 5,
        categoriaId: 2,
        texto: '¿La entidad asigna recursos específicos para actividades de innovación?'
    },
    {
        id: 6,
        categoriaId: 2,
        texto: '¿Se fomenta la colaboración interdepartamental en proyectos de innovación?'
    },
    {
        id: 7,
        categoriaId: 3,
        texto: '¿Se realizan análisis periódicos de tendencias tecnológicas en el sector?'
    },
    {
        id: 8,
        categoriaId: 3,
        texto: '¿Existe un sistema de seguimiento y medición del impacto de los proyectos de innovación?'
    },
    {
        id: 9,
        categoriaId: 3,
        texto: '¿Existe un proceso formal para la gestión de la propiedad intelectual?'
    },
    {
        id: 10,
        categoriaId: 4,
        texto: 'En la Entidad, se realizan actividades como eventos de networking y reuniones que fomentan la cooperación con Universidades y Centros Tecnológicos'
    },
    {
        id: 11,
        categoriaId: 4,
        texto: '¿La entidad participa en redes o clusters de innovación?'
    },
    {
        id: 12,
        categoriaId: 4,
        texto: '¿Se han establecido alianzas estratégicas con centros de investigación?'
    }
];

const PESOS_RESPUESTAS = {
    'Si': 5,
    'En Parte': 2.5,
    'No': 1
};

class CuestionarioApi {
    async getCategorias() {
        // Se elimina el segundo bloque 'return' que era inalcanzable.
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockCategorias); // Asumo que 'mockCategorias' está definido en otro lugar
            }, 500);
        });
    }

    async getPreguntas() {
        // Simular llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockPreguntas);
            }, 500);
        });
    }

    async enviarRespuestas(datosUsuario, respuestas) {
        // Simular llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Calcular resultados por categoría
                const resultados = mockCategorias.map(categoria => {
                    const preguntasCategoria = mockPreguntas.filter(p => p.categoriaId === categoria.id);
                    const respuestasCategoria = preguntasCategoria.map(p => respuestas[p.id]);
                    
                    const puntajeTotal = respuestasCategoria.reduce((sum, resp) => sum + PESOS_RESPUESTAS[resp], 0);
                    const puntajeMaximo = preguntasCategoria.length * 5; // 5 es el peso máximo (Si)
                    const porcentaje = (puntajeTotal / puntajeMaximo) * 100;
                    
                    return {
                        categoriaId: categoria.id,
                        nombre: categoria.nombre,
                        puntaje: puntajeTotal,
                        porcentaje: porcentaje,
                        pesoCategoria: categoria.peso,
                        valoracionCualitativa: this.obtenerValoracionCualitativa(porcentaje)
                    };
                });

                // Calcular puntaje global
                const puntajeGlobal = resultados.reduce((sum, res) => {
                    return sum + (res.porcentaje * (res.pesoCategoria / 100));
                }, 0);

                resolve({
                    message: 'Respuestas enviadas exitosamente',
                    datosUsuario,
                    resultadosPorCategoria: resultados,
                    resultadoGlobal: {
                        puntaje: puntajeGlobal,
                        valoracionCualitativa: this.obtenerValoracionCualitativa(puntajeGlobal)
                    }
                });
            }, 1000);
        });
    }

    obtenerValoracionCualitativa(porcentaje) {
        if (porcentaje >= 90) return 'Excelente';
        if (porcentaje >= 75) return 'Muy Bueno';
        if (porcentaje >= 60) return 'Bueno';
        if (porcentaje >= 40) return 'Regular';
        return 'Necesita Mejorar';
    }
}

export const cuestionarioApi = new CuestionarioApi();