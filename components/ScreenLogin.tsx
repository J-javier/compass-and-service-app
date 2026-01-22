import { View, Text, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default function ScreenLogin() {
    return (
        <View className='bg-blue-950 w-full h-full'>
            <ScrollView>
                <View className='pt-20'>
                    <Image
                        source={require('../assets/compass2.jpg')}
                        className='w-60 h-60 mx-auto mb-5 rounded-full'
                    />
                    <Text className='text-gray-400 text-center'> Brújula de Vida</Text>
                    <Text className='text-white text-3xl font-bold text-center mt-16'>Welcome to Compass HS</Text>

                    <View className='mt-10'>
                        <TextInput 
                            placeholder="Email"
                            placeholderTextColor="#a1a1aa"
                            className='bg-white/10 text-white p-4 rounded-2xl mb-4 mr-10 ml-10 border border-white/20'
                        />
                        <TextInput 
                            placeholder="Password"
                            placeholderTextColor="#a1a1aa"
                            secureTextEntry
                            className='bg-white/10 text-white p-4 rounded-2xl mb-6 mr-10 ml-10 border border-white/20'
                        />
                        
                        <TouchableOpacity className='bg-sky-500 p-4 rounded-2xl shadow-lg mr-10 ml-10'>
                            <Text className='text-white text-center font-bold text-lg'>Inicio Sesión  </Text>
                        </TouchableOpacity>

                    </View>
                    <Text className='text-gray-400 text-center mt-10'>@ 2026 Funval internacional</Text>
                </View>
            </ScrollView>
        </View>
    );
}
