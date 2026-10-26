import { normalizeName } from '@/constants/areas';

// Static help content copied from the SIGEF web portal
// (resources/js/components/brujula-vida/goal-guides.ts) — not served by the API.
// ROLE_INTROS is keyed by category.name, SUBCATEGORY_GUIDES by subcategory.code.

export const ROLE_INTROS: Record<string, string> = {
  Espiritual:
    'Usted puede ayudar al Padre Celestial a lograr la vida eterna del hombre al compartir el evangelio, redimir a los muertos y perfeccionar a los santos.',
  Familiar:
    'Por ser parte de una familia eterna, usted tiene muchos roles. Sus metas familiares son algo que usted puede crear y cambiar con el tiempo, así como revisarlas en consejo con su familia para que sean parte del proceso. En caso de ser esposo o padre, debe meditar y establecer metas de cómo se está preparando para cumplir en el futuro con esos roles.',
  Intelectual:
    'Usted puede ayudar a desarrollar su mente y sus talentos al estudiar y prepararse de forma personal o por medio de programas de estudios.',
  Laboral:
    'Usted puede establecer cuál será su desarrollo laboral, sea como empleado dentro de una empresa o como emprendedor desarrollando su propio negocio.',
  Físico:
    'Usted podrá cumplir sus metas en la medida que su cuerpo y mente se mantengan sanos. Es por ello importante establecer metas que le permitan mantener una buena condición física y una mente libre de estrés.',
};

export interface SubcategoryGuide {
  description?: string;
  examples: string[]; // 1-2 curated examples
}

export const SUBCATEGORY_GUIDES: Record<string, SubcategoryGuide> = {
  esposo_novio: {
    examples: ['Yo me preparo espiritualmente para casarme.', 'Yo cultivo la relación con mi futuro esposo/a.'],
  },
  padre: {
    examples: ['Yo dedico tiempo de calidad a cada uno de mis hijos.', 'Yo enseño el evangelio a mis hijos.'],
  },
  hijo: {
    examples: ['Yo honro y respeto a mis padres.', 'Yo mantengo una excelente comunicación con mis padres.'],
  },
  proceso_conversion: {
    description:
      'Son metas personales que dependen de usted: dónde ve su conversión y qué cosas va a hacer para estar más convertido al Señor.',
    examples: [
      'Yo estudio y medito las escrituras cada día para conocer mejor la voz del Señor.',
      'Yo derramo mi alma a Dios por medio de la oración diariamente.',
    ],
  },
  ser_discipulo: {
    description: 'Como discípulo que sirve, ¿cómo estoy? ¿Dónde me veo?',
    examples: ['Yo magnifico y sirvo fielmente en mi llamamiento.', 'Yo invito a otros a venir a Cristo.'],
  },
  educacion_formal: {
    description:
      'Es la educación por la cual se certifica (técnico, universitario, posgrados). ¿Hasta dónde quiere llegar en su educación formal?',
    examples: [
      'Yo defino qué carrera ocupacional o profesional seguir para cumplir mis objetivos laborales.',
      'Yo me matriculo para estudiar y asisto puntualmente a clases.',
    ],
  },
  autoeducacion: {
    description:
      'Es cuando usted, por sus propios medios, desarrolla un conocimiento o una destreza —libros, tutoriales, recursos en línea— sin necesidad de asistir a un centro formal.',
    examples: ['Yo leo un libro al mes de una destreza que deseo desarrollar.', 'Yo practico y aprendo otro idioma por tutoriales.'],
  },
  empleado: {
    description:
      'Si no tengo empleo, ¿cómo me veo cuando me contraten? Si ya tengo uno, ¿cómo puedo ser un mejor empleado y seguir ascendiendo?',
    examples: [
      'Yo desarrollo las competencias laborales necesarias para mejorar en mi cargo.',
      'Yo trabajo en equipo y colaboro con mis compañeros de trabajo.',
    ],
  },
  emprendimiento: {
    description:
      '¿Qué empresa le gustaría formar? Defina qué destrezas, conocimientos y recursos requiere para el negocio y en qué plazo puede lograrlo.',
    examples: [
      'Yo tengo un plan de negocios escrito, con las destrezas, recursos y plazos para lograrlo.',
      'Yo formalizo mi emprendimiento conforme a los requisitos legales.',
    ],
  },
  ejercicios: {
    description:
      'Estas metas ayudan a mejorar su cuerpo y a decidir la condición física que desea alcanzar; también pueden enfocarse en actividades deportivas.',
    examples: ['Yo salgo a correr 3 días a la semana para mantenerme saludable.', 'Yo tomo 2 litros de agua diariamente para tener una mejor salud.'],
  },
  hobbies: {
    description: 'Son metas que dan valor y alegría a su vida, le ayudan a desarrollar sus talentos y le dan tiempo para crecer y aprender.',
    examples: ['Yo leo un libro al mes.', 'Yo aprendo o practico pintar, cocinar o tejer.'],
  },
};

/** Exact category.name lookup, falling back to an accent/case-insensitive match. */
export function getRoleIntro(categoryName: string): string | undefined {
  if (ROLE_INTROS[categoryName]) return ROLE_INTROS[categoryName];
  const n = normalizeName(categoryName);
  const key = Object.keys(ROLE_INTROS).find((k) => n.includes(normalizeName(k)));
  return key ? ROLE_INTROS[key] : undefined;
}
