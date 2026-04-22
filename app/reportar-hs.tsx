import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Clock, FileText, Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportarHS() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [date, setDate] = useState('05/20/2024');
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ paddingTop: insets.top }}
        >
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
                <Pressable
                    className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100"
                    onPress={() => router.back()}
                >
                    <ChevronLeft color="#002d4e" size={24} />
                </Pressable>
                <Text className="flex-1 text-center text-lg font-bold text-[#002d4e] uppercase tracking-wider">
                    Reportar HS
                </Text>
                <View className="w-9" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
                {/* Logo */}
                <View className="items-center mb-6">
                    <Image
                        source={require('../assets/logoTres.png')}
                        style={{ width: 250, height: 80 }}
                        resizeMode="contain"
                    />
                </View>

                {/* Info card */}
                <View className="bg-blue-50 rounded-2xl p-4 mb-8">
                    <Text className="text-blue-700 text-sm leading-6">
                        Registra tus horas de servicio aquí. Asegúrate de que la descripción sea detallada
                        para facilitar la validación.
                    </Text>
                </View>

                {/* Date field */}
                <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
                    Fecha del Servicio
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-5 h-14">
                    <Calendar color="#9CA3AF" size={20} />
                    <TextInput
                        className="flex-1 ml-3 text-gray-700 text-base"
                        value={date}
                        onChangeText={setDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#9CA3AF"
                    />
                    <Calendar color="#9CA3AF" size={18} />
                </View>

                {/* Hours field */}
                <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
                    Cantidad de Horas
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-5 h-14">
                    <Clock color="#9CA3AF" size={20} />
                    <TextInput
                        className="flex-1 ml-3 text-gray-700 text-base"
                        value={hours}
                        onChangeText={setHours}
                        placeholder="0.0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Description field */}
                <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
                    Descripción de la Actividad
                </Text>
                <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-5 flex-row gap-3">
                    <FileText color="#9CA3AF" size={20} style={{ marginTop: 2 }} />
                    <TextInput
                        className="flex-1 text-gray-700 text-base"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="¿Qué servicio realizaste?"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 100 }}
                    />
                </View>

                {/* Evidence upload */}
                <Pressable className="border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center justify-center mb-8 active:opacity-70">
                    <Camera color="#9CA3AF" size={32} />
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-3">
                        Subir Evidencia (Opcional)
                    </Text>
                </Pressable>

                {/* Submit button */}
                <Pressable className="bg-[#002d4e] rounded-2xl py-5 flex-row items-center justify-center gap-3 active:opacity-80 mb-4">
                    <Text className="text-white font-bold text-base uppercase tracking-wider">
                         Enviar Reporte
                    </Text>
                </Pressable>

                {/* Footer */}
                <Text className="text-center text-xs text-gray-400 tracking-widest uppercase">
                    Brújula de Vida • Funval Internacional
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
