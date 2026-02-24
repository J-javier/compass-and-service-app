import { Tabs } from 'expo-router';
import { Home, Bell, User } from 'lucide-react-native';
export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false, // Esto pondrá el título arriba en el home
            tabBarActiveTintColor: '#002d4e', // Color sky-500
        }}>
            <Tabs.Screen name="home" options={{ tabBarIcon: ({ color }) => <Home color={color} strokeWidth={2.3} size={24} />,}} />

            <Tabs.Screen name="alerts" options={{ tabBarIcon: ({ color }) => <Bell color={color} strokeWidth={2.3} size={24} />,}} />
            
            <Tabs.Screen name="profile" options={{ tabBarIcon: ({ color }) => <User color={color} strokeWidth={2.3} size={24} />,}} />
        </Tabs>
    );
}