import React, { useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { SIGEF_CLIENT_ID, SIGEF_DISCOVERY, SIGEF_REDIRECT_URI, SIGEF_SCOPES } from '@/constants/oidc';

export default function ScreenLogin() {
    const insets = useSafeAreaInsets();
    const { completeLogin } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [request, , promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: SIGEF_CLIENT_ID,
            scopes: SIGEF_SCOPES,
            redirectUri: SIGEF_REDIRECT_URI,
            usePKCE: true,
            responseType: AuthSession.ResponseType.Code,
        },
        SIGEF_DISCOVERY,
    );

    // Handle the prompt's own resolved result directly instead of watching the
    // hook's `response` state via a useEffect: on Android, Expo Router's own
    // deep-link handling also grabs the oauth/callback redirect and navigates
    // to it (see app/oauth/callback.tsx), which can unmount this screen before
    // a `response`-driven effect ever runs. Awaiting promptAsync() here is
    // unaffected by that navigation/unmount.
    const handleLogin = async () => {
        setSubmitting(true);
        try {
            const result = await promptAsync();
            if (result.type === 'success') {
                await completeLogin(result.params.code, request?.codeVerifier ?? '', SIGEF_REDIRECT_URI);
                // NavigationGuard in _layout.tsx handles the redirect to /(tabs)/home
            } else if (result.type === 'error' || result.type === 'dismiss') {
                Alert.alert('Error', 'No se pudo completar el inicio de sesión.');
            }
        } catch {
            Alert.alert('Error', 'No se pudo iniciar sesión con SIGEF. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className='bg-[#08203e] w-full h-full' style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View className='py-10'>
                        <Image
                            source={require('../assets/LOGINLOGO.png')}
                            className='w-48 h-48 mx-auto mb-5 rounded-full bg-white'
                        />
                        <Text className='text-gray-400 text-center uppercase tracking-widest'>Brújula de Vida</Text>
                        <Text className='text-white text-3xl font-bold text-center mt-10'>Welcome to Compass HS</Text>

                        <View className='mt-10 px-10'>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className='bg-sky-500 p-6 rounded-xl shadow-lg'
                                onPress={handleLogin}
                                disabled={submitting || !request}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className='text-white text-center font-bold text-lg'>Iniciar sesión con SIGEF</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text className='text-gray-400 text-center mt-10'>© 2026 Funval Internacional</Text>
                    </View>
                </ScrollView>
        </View>
    );
}
