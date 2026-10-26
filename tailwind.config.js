/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './app/**/*.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
    /** Status metas (lib/compass.ts, lib/serviceReports.ts) hold class names too. */
    './lib/**/*.{js,ts,tsx}',
    './constants/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      /** Brand tokens — keep in sync with constants/theme.ts (COLORS). */
      colors: {
        navy: '#0B2545',
        /** Funval isotype blue. */
        brand: '#2A7DE1',
        /** Compass needle. */
        celeste: '#6BB8D3',
        paper: '#F5F7FA',
        ink: '#0E1B2C',
        muted: '#6B7A8E',
      },
      /** Semantic type scale — use these instead of text-xs…text-5xl. */
      fontSize: {
        /** Hero numbers. */
        display: ['32px', { lineHeight: '38px' }],
        /** Screen titles. */
        title: ['24px', { lineHeight: '30px' }],
        /** Card titles, header bars. */
        heading: ['18px', { lineHeight: '24px' }],
        /** Default text, inputs, buttons. */
        body: ['15px', { lineHeight: '22px' }],
        /** Field labels, secondary lines. */
        label: ['13px', { lineHeight: '18px' }],
        /** Meta, helpers, counters. */
        caption: ['12px', { lineHeight: '16px' }],
        /** Uppercase section labels, pills. */
        overline: ['11px', { lineHeight: '14px' }],
      },
    },
  },
  plugins: [],
};
