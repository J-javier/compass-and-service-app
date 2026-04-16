import { Text, View, ScrollView } from 'react-native';
import Avatar from '@/components/Avatar';
import FrameArea from '@/components/FrameArea';
import { Compass, Clock, Lightbulb } from 'lucide-react-native';
import CardOption from '@/components/CardOption';

export default function Home() {
    const img = require('../../assets/Avatar-profile.png');
    const name = 'Alfredo';

    const options = [
        {
            title: 'Brújula de Vida',
            description: 'Mis Metas y Planes',
            icon: <Compass size={24} color="#d8e2ff" />,
            backgroundIcon: '#021f4d'
            , bgColor: '#002d4e',
            titleColor: '#fff',
            textColor: '#557b9d',
            enlace: '/(tabs)/brujula'
        },
        {
            title: 'Horas de Servicio',
            description: 'Reportar y Consultar HS',
            icon: <Clock size={24} color="#0048bc" />,
            backgroundIcon: '#d7eaff',
            bgColor: '#fff',
            titleColor: '#002d4e',
            textColor: '#002d4e',
            enlace: '/(tabs)/servicio'
        }
    ];

    return (
        <FrameArea>
            {/* Header */}
            <View className="flex-row items-center mb-5 gap-4 border-b border-gray-200 pb-4">
                <Avatar name={name} imageUrl={img} />
                <Text className="text-2xl font-bold text-[#002d4e]">Bienvenido de nuevo</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>

                <Text className="text-3xl font-bold text-[#002d4e] mb-1">¡Hola, {name}!</Text>
                <Text className="text-gray-500 text-lg mb-6">Tu camino académico se ve brillante hoy.</Text>

                {/* Brújula de Vida y Horas de Servicio */}
                {options.map((option, index) => (
                    <CardOption
                        key={index}
                        title={option.title}
                        description={option.description}
                        icon={option.icon}
                        backgroundIcon={option.backgroundIcon}
                        bgColor={option.bgColor}
                        textColor={option.textColor}
                        titleColor={option.titleColor}
                        enlace={option.enlace}
                    />
                ))}

                {/* Progreso Actual */}
                <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
                    Progreso Actual
                </Text>
                <View className="flex-row gap-3 h-32 w-full justify-center mb-8">
                    {/* Meta Semanal */}
                    <View
                        className="flex-1 bg-blue-50 rounded-2xl p-4 h-full w-6/12"
                        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                    >
                        <View className="flex-row items-center gap-1 mb-2">
                            <Compass size={12} color="#3B82F6" />
                            <Text className="text-xs text-blue-500 font-semibold uppercase tracking-wide">
                                Meta Semanal
                            </Text>
                        </View>
                        <Text className="text-2xl font-bold text-[#002d4e]">
                            12{' '}
                            <Text className="text-sm font-normal text-gray-400">/ 20</Text>
                        </Text>
                        <Text className="text-xs text-gray-400 mb-2">Horas Completadas</Text>
                        <View className="h-1.5 bg-gray-200 rounded-full">
                            <View className="h-1.5 bg-blue-500 rounded-full" style={{ width: '60%' }} />
                        </View>
                    </View>

                    {/* Consejo del Mentor */}

                    <View
                        className="bg-blue-50 rounded-2xl p-3 flex-col items-start gap-1 w-6/12 h-full"
                        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                    >
                        <View className="w-full h-10 rounded-full items-center flex-row gap-2">
                            <Lightbulb size={20} color="#3B82F6" />
                            <Text className="text-xs font-bold text-[#002d4e] mb-1 w-full">Consejo del Mentor</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 leading-4">
                                &ldquo;Define tus metas por escrito para que tu Brújula de Vida sea siempre tu norte.&rdquo;
                            </Text>
                        </View>
                    </View>
                </View>
                
            </ScrollView>
        </FrameArea>
    );
}
