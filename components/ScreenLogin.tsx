import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, } from 'lucide-react-native';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function ScreenLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const insets = useSafeAreaInsets();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Ingresa tu correo y contraseña');
            return;
        }
        setSubmitting(true);
        try {
            await login(email.trim(), password);
            // NavigationGuard in _layout.tsx handles the redirect to /(tabs)/home
        } catch (e: any) {
            const msg = e?.response?.data?.detail ?? 'Usuario o contraseña incorrectos';
            Alert.alert('Error', typeof msg === 'string' ? msg : 'Usuario o contraseña incorrectos');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <View className='bg-[#08203e] w-full h-full' style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View className='py-10'>
                        <Image
                            // source={require('../assets/compass2.jpg')}
                            source={require('../assets/LOGINLOGO.png')}
                            className='w-48 h-48 mx-auto mb-5 rounded-full bg-white'
                        />
                        <Text className='text-gray-400 text-center uppercase tracking-widest'>Brújula de Vida</Text>
                        <Text className='text-white text-3xl font-bold text-center mt-10'>Welcome to Compass HS</Text>

                        <View className='mt-10 px-10'>
                            {/* UserName container input */}

                            <View className="flex-row items-center bg-white/10 p-4 rounded-t-2xl border-b-2 border-white/30 mb-5">
                                <User color='#94a3b8' size={20} strokeWidth={1.5} />
                                <TextInput
                                    placeholder="Correo electrónico"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className='text-white ml-3 flex-1'
                                />
                            </View>

                            {/* Password Container input */}
                            <View className="flex-row items-center bg-white/10 p-4 rounded-t-2xl border-b-2 border-white/30 mb-5">
                                <Lock color='#94a3b8' size={20} strokeWidth={1.5} />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    className='text-white ml-3 flex-1'
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <Eye color='#94a3b8' size={20} strokeWidth={1.5} />
                                    ) : (
                                        <EyeOff color='#94a3b8' size={20} strokeWidth={1.5} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                className='bg-sky-500 p-6 rounded-xl shadow-lg'
                                onPress={handleLogin}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className='text-white text-center font-bold text-lg'>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>

                        </View>
                        <Text className='text-gray-400 text-center mt-10'>© 2026 Funval Internacional</Text>
                    </View>
                </ScrollView>
        </View>
    );
}