import { Sparkles, Users, GraduationCap, Briefcase, Dumbbell } from 'lucide-react-native';
import React from 'react';

type GoalsByYear = Record<number, { id: number; name: string; placeholder: string }[]>;
type InitialValues = Record<number, Record<number, string>>;

export interface Area {
    id: number;
    name: string;
    subtitle: string;
    icon: React.ComponentType<{ color?: string; size?: number }>;
    iconColor: string;
    iconBg: string;
    accentColor: string;
    subtitleColor: string;
    status: 'COMPLETO' | 'PENDIENTE';
    goalsByYear: GoalsByYear;
    initialValues: InitialValues;
}

const ESPIRITUAL_GOALS = [
    { id: 1, name: 'Proceso de Conversión', placeholder: 'Escribe tu meta para este enfoque...' },
    { id: 2, name: 'Ser un Discípulo', placeholder: 'Escribe tu meta para este enfoque...' },
];

const FAMILIAR_GOALS = [
    { id: 1, name: 'Esposo / Novio', placeholder: 'Escribe tu meta para este enfoque...' },
    { id: 2, name: 'Padre', placeholder: 'Escribe tu meta para este enfoque...' },
    { id: 3, name: 'Hijo', placeholder: 'Escribe tu meta para este enfoque...' },
];

const INTELECTUAL_GOALS = [
    { id: 1, name: 'Educación Formal', placeholder: 'Escribe tu meta para este enfoque...' },
    { id: 2, name: 'Autoeducación', placeholder: 'Escribe tu meta para este enfoque...' },
];

const LABORAL_GOALS = [
    { id: 1, name: 'Empleado', placeholder: 'Escribe tu meta para este enfoque...' },
    { id: 2, name: 'Emprendimiento', placeholder: 'Escribe tu meta para este enfoque...' },
];

const SALUD_GOALS = [
    { id: 1, name: 'Ejercicios', placeholder: 'Escribe tu meta para este enfoque...' },
    { id: 2, name: 'Hobbies', placeholder: 'Escribe tu meta para este enfoque...' },
];

const allYears = (goals: { id: number; name: string; placeholder: string }[]): GoalsByYear => ({
    2025: goals,
    2026: goals,
    2027: goals,
    2028: goals,
    2029: goals,
});

export const AREAS: Area[] = [
    {
        id: 1,
        name: 'Espiritual',
        subtitle: 'Proceso de Conversión',
        icon: Sparkles,
        iconColor: '#7C3AED',
        iconBg: '#EDE9FE',
        accentColor: '#7C3AED',
        subtitleColor: '#E9D5FF',
        status: 'COMPLETO',
        goalsByYear: allYears(ESPIRITUAL_GOALS),
        initialValues: {
            2025: {
                1: 'Yo estudio las escrituras 15 minutos al día para fortalecer mi fe.',
                2: 'Yo cumplo con mis llamamientos al bendecir la vida de otros a través del servicio constante.',
            },
        },
    },
    {
        id: 2,
        name: 'Familiar',
        subtitle: 'Esposo/Novio, Padre e Hijo',
        icon: Users,
        iconColor: '#ffc000',
        iconBg: '#FFF6DC',
        accentColor: '#D97706',
        subtitleColor: '#FDE68A',
        status: 'COMPLETO',
        goalsByYear: allYears(FAMILIAR_GOALS),
        initialValues: {
            2025: {
                1: 'Yo dedico tiempo de calidad con mi esposa cada semana para fortalecer nuestra relación.',
                2: 'Yo leo con mis hijos 10 minutos cada noche para fomentar el amor por el aprendizaje.',
            },
        },
    },
    {
        id: 3,
        name: 'Intelectual',
        subtitle: 'Educación y Cursos',
        icon: GraduationCap,
        iconColor: '#00b050',
        iconBg: '#DCEED8',
        accentColor: '#059669',
        subtitleColor: '#A7F3D0',
        status: 'COMPLETO',
        goalsByYear: allYears(INTELECTUAL_GOALS),
        initialValues: {
            2025: {
                1: 'Yo completo al menos un curso de desarrollo profesional en línea cada trimestre.',
                2: 'Yo leo un libro relacionado con mi área de trabajo cada mes.',
            },
        },
    },
    {
        id: 4,
        name: 'Laboral',
        subtitle: 'Define tus metas',
        icon: Briefcase,
        iconColor: '#2563EB',
        iconBg: '#DBEAFE',
        accentColor: '#2563EB',
        subtitleColor: '#BFDBFE',
        status: 'PENDIENTE',
        goalsByYear: allYears(LABORAL_GOALS),
        initialValues: {},
    },
    {
        id: 5,
        name: 'Salud / Físico',
        subtitle: 'Define tus metas',
        icon: Dumbbell,
        iconColor: '#DC2626',
        iconBg: '#FEE2E2',
        accentColor: '#DC2626',
        subtitleColor: '#FECACA',
        status: 'PENDIENTE',
        goalsByYear: allYears(SALUD_GOALS),
        initialValues: {},
    },
];
