import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Polygon } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

/*
 * Brand emblem ("Halo orbital", silver): the Funval isotype — the original
 * PNG, never recolored — inside a dashed halo, with a compass star at the NE.
 * Geometry is defined on a 200×200 box and scaled to `size`. Same artwork as
 * assets/icon.png (generated from this geometry).
 */

const STAR: [string, 'light' | 'shade'][] = [
  ['100,22 115,85 100,100', 'light'], ['100,22 85,85 100,100', 'shade'],
  ['178,100 115,115 100,100', 'light'], ['178,100 115,85 100,100', 'shade'],
  ['100,178 85,115 100,100', 'light'], ['100,178 115,115 100,100', 'shade'],
  ['22,100 85,85 100,100', 'light'], ['22,100 85,115 100,100', 'shade'],
];

/** Width / height of assets/funval-iso.png. */
const ISO_RATIO = 457 / 512;
const ISO_TOP = 56;
const ISO_HEIGHT = 88;

interface Props {
  size?: number;
  /** Orbits the star around the halo (loading states). */
  animated?: boolean;
}

/** Renders the brand emblem at `size`; `animated` orbits the star (loading states). */
export default function Emblem({ size = 140, animated = false }: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      loop = Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true }),
      );
      loop.start();
    });
    return () => loop?.stop();
  }, [animated, spin]);

  const k = size / 200;
  const isoHeight = ISO_HEIGHT * k;
  const isoWidth = isoHeight * ISO_RATIO;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel="Funval — Brújula de Vida">
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <Circle cx={100} cy={100} r={86} fill="none" stroke={COLORS.silver} strokeOpacity={0.7} strokeWidth={2} strokeDasharray="3 7" />
      </Svg>
      <Image
        source={require('../../assets/funval-iso.png')}
        style={{ position: 'absolute', top: ISO_TOP * k, left: (size - isoWidth) / 2, width: isoWidth, height: isoHeight }}
        resizeMode="contain"
      />
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          {/* 40×40 star centered on the halo at 45° (160.8, 39.2) */}
          <G transform="translate(140.8 19.2) scale(0.2)">
            {STAR.map(([points, tone]) => (
              <Polygon key={points} points={points} fill={tone === 'light' ? COLORS.silverLight : COLORS.silver} />
            ))}
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}
