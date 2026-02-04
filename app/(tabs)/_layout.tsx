import { Tabs } from 'expo-router';
import { Home, Bell, User } from 'lucide-react-native'; // O los iconos que prefieras

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: true, // Esto pondrá el título arriba en el home
            tabBarActiveTintColor: '#0ea5e9', // Color sky-500
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    title: 'Alertas',
                    tabBarIcon: ({ color }) => <Bell color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <User color={color} size={24} />,
                }}
            />
        </Tabs>
    );
}