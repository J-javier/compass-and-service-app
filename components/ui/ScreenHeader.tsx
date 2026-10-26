import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, X } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  /** 'back' (chevron) for drill-down screens, 'close' (X) for forms. */
  leading?: 'back' | 'close';
  onBack?: () => void;
  right?: ReactNode;
  /** Solid background; white by default. Text turns white on any other color. */
  background?: string;
}

/** Top bar shared by every stack screen: safe-area aware, 44pt touch targets. */
export default function ScreenHeader({ title, subtitle, leading = 'back', onBack, right, background = COLORS.white }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onColor = background !== COLORS.white;
  const tint = onColor ? COLORS.white : COLORS.navy;
  const Icon = leading === 'close' ? X : ChevronLeft;

  return (
    <View
      style={{ paddingTop: insets.top, backgroundColor: background }}
      className={onColor ? '' : 'border-b border-gray-100'}
    >
      <StatusBar style={onColor ? 'light' : 'dark'} />
      <View className="h-14 flex-row items-center px-1.5">
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
          onPress={onBack ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel={leading === 'close' ? 'Cerrar' : 'Volver'}
        >
          <Icon color={tint} size={24} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-heading font-bold" style={{ color: tint }} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-caption" style={{ color: onColor ? 'rgba(255,255,255,0.8)' : COLORS.muted }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View className="h-11 w-11 items-center justify-center">{right}</View>
      </View>
    </View>
  );
}
