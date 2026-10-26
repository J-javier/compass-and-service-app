import { Tabs } from 'expo-router';
import { Home, ClipboardList, Compass, User } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

/** Bottom tab navigator: Inicio, Servicio, Brújula and Perfil. */
export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.navy,
                tabBarInactiveTintColor: COLORS.faint,
                tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.line },
                /** Same size as the `caption` step of the type scale. */
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color }) => <Home color={color} strokeWidth={2.3} size={24} />,
                }}
            />
            <Tabs.Screen
                name="servicio"
                options={{
                    tabBarLabel: 'Servicio',
                    tabBarIcon: ({ color }) => <ClipboardList color={color} strokeWidth={2.3} size={24} />,
                }}
            />
            <Tabs.Screen
                name="brujula"
                options={{
                    tabBarLabel: 'Brújula',
                    tabBarIcon: ({ color }) => <Compass color={color} strokeWidth={2.3} size={24} />,
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    tabBarLabel: 'Perfil',
                    tabBarIcon: ({ color }) => <User color={color} strokeWidth={2.3} size={24} />,
                }}
            />
        </Tabs>
    );
}
