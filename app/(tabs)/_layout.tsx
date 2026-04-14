import { Tabs } from 'expo-router';
import { Home, ClipboardList, Compass, User } from 'lucide-react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#002d4e',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB' },
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
