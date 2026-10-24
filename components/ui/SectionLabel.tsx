import { ReactNode } from 'react';
import { Text, View } from 'react-native';

/** Uppercase section label, optionally with a trailing action (e.g. "Ver todo"). */
export default function SectionLabel({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-overline font-semibold uppercase tracking-widest text-muted">{children}</Text>
      {action}
    </View>
  );
}
