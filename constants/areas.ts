import { Sparkles, Users, GraduationCap, Briefcase, Dumbbell } from 'lucide-react-native';
import React from 'react';

export interface Area {
    id: number;
    name: string;
    subtitle: string;
    icon: React.ComponentType<{ color?: string; size?: number }>;
    iconColor: string;
    iconBg: string;
    accentColor: string;
    subtitleColor: string;
    goals: { id: number; name: string; placeholder: string }[];
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

        goals: ESPIRITUAL_GOALS,
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

        goals: FAMILIAR_GOALS,
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

        goals: INTELECTUAL_GOALS,
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

        goals: LABORAL_GOALS,
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

        goals: SALUD_GOALS,
    },
];
