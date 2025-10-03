// Mock data
const mockPreguntas = [
    {
        id: 1,
        texto: 'En la Entidad, se realizan actividades como eventos de networking y reuniones que fomentan la cooperación con Universidades y Centros Tecnológicos'
    },
    {
        id: 2,
        texto: '¿La organización cuenta con procesos documentados para identificar necesidades de innovación?'
    },
    {
        id: 3,
        texto: '¿Existen mecanismos formales para evaluar y seleccionar proyectos de innovación?'
    },
    {
        id: 4,
        texto: '¿Se dispone de un proceso estructurado para la gestión de la innovación con etapas definidas?'
    },
    {
        id: 5,
        texto: '¿Se promueve activamente la cultura de innovación mediante programas de capacitación?'
    },
    {
        id: 6,
        texto: '¿La entidad asigna recursos específicos para actividades de innovación?'
    },
    {
        id: 7,
        texto: '¿Se realizan análisis periódicos de tendencias tecnológicas en el sector?'
    },
    {
        id: 8,
        texto: '¿Existe un sistema de seguimiento y medición del impacto de los proyectos de innovación?'
    },
    {
        id: 9,
        texto: '¿Se fomenta la colaboración interdepartamental en proyectos de innovación?'
    },
    {
        id: 10,
        texto: '¿La entidad participa en redes o clusters de innovación?'
    },
    {
        id: 11,
        texto: '¿Se han establecido alianzas estratégicas con centros de investigación?'
    },
    {
        id: 12,
        texto: '¿Existe un proceso formal para la gestión de la propiedad intelectual?'
    },
    {
        id: 13,
        texto: '¿Se realiza formación específica en metodologías de innovación?'
    },
    {
        id: 14,
        texto: '¿La entidad cuenta con un presupuesto específico para innovación?'
    },
    {
        id: 15,
        texto: '¿Se utilizan metodologías ágiles en la gestión de proyectos de innovación?'
    },
    {
        id: 16,
        texto: '¿Existe un sistema de incentivos para la participación en innovación?'
    },
    {
        id: 17,
        texto: '¿Se realiza vigilancia tecnológica de forma sistemática?'
    },
    {
        id: 18,
        texto: '¿La entidad participa en proyectos de innovación colaborativa?'
    },
    {
        id: 19,
        texto: '¿Se documentan y comparten las lecciones aprendidas de los proyectos?'
    },
    {
        id: 20,
        texto: '¿Existe un proceso de evaluación del retorno de la inversión en innovación?'
    }
];

// Simula un delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cuestionarioApi = {
    // Simula una llamada a API
    getPreguntas: async () => {
        await delay(1000); // Simula latencia de red
        return mockPreguntas;
    },

    // Simula envío de respuestas
    enviarRespuestas: async (respuestas) => {
        await delay(1000);
        console.log('Respuestas enviadas:', respuestas);
        return { success: true, message: 'Respuestas guardadas correctamente' };
    }
};