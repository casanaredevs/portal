export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category?: string;
}

export const faqItems: FaqItem[] = [
    {
        id: 'costo',
        question: '¿Tiene costo participar?',
        answer: 'No. La comunidad es abierta y sin costo de membresía. Algunos eventos especiales podrían requerir registro anticipado si el cupo es limitado.',
    },
    {
        id: 'requisitos',
        question: '¿Necesito experiencia previa?',
        answer: 'No exigimos seniority. Puedes comenzar asistiendo, observando y haciendo preguntas. Si ya tienes experiencia, puedes facilitar sesiones, mentorías o revisar código.',
    },
    {
        id: 'modalidad',
        question: '¿Modalidad de los encuentros?',
        answer: 'Mixta. Priorizamos encuentros presenciales cuando es viable (networking local) y sesiones virtuales puntuales para ampliar participación.',
    },
    {
        id: 'frecuencia',
        question: '¿Con qué frecuencia hay eventos?',
        answer: 'Buscamos al menos 1 actividad significativa al mes (meetup, taller o kata) más micro espacios espontáneos según disponibilidad de facilitadores.',
    },
    {
        id: 'proponer-charla',
        question: '¿Cómo propongo una charla o kata?',
        answer: 'Pronto habilitaremos un formulario estructurado. Mientras tanto puedes contactarnos en los eventos o por el canal principal para coordinar tema y fecha.',
    },
    {
        id: 'mentoria',
        question: '¿Existe programa de mentoría?',
        answer: 'Estamos diseñando un esquema liviano de mentoría cruzada (pares + facilitadores). Se anunciará cuando haya masa crítica de mentores voluntarios.',
    },
];
