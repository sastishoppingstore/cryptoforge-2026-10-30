/**
 * The original app is dark-first (slate-950 canvas, slate-900 panels, cyan/emerald accents).
 *
 * To let the topbar theme toggle work without duplicating every utility class, the slate
 * scale and the accent shades are defined as CSS variables. `:root` holds the dark values
 * (pixel-equivalent to the live app); `html.light` re-points the same variables. Because the
 * variables are declared with the `<alpha-value>` placeholder, opacity modifiers such as
 * `bg-slate-800/50` and `border-cyan-500/30` keep working in both themes.
 */

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        white: v('white'),
        black: v('black'),
        slate: {
          50: v('slate-50'),
          100: v('slate-100'),
          200: v('slate-200'),
          300: v('slate-300'),
          400: v('slate-400'),
          500: v('slate-500'),
          600: v('slate-600'),
          700: v('slate-700'),
          800: v('slate-800'),
          900: v('slate-900'),
          950: v('slate-950'),
        },
        cyan: { 300: v('cyan-300'), 400: v('cyan-400'), 500: v('cyan-500'), 600: v('cyan-600') },
        emerald: { 300: v('emerald-300'), 400: v('emerald-400'), 500: v('emerald-500'), 600: v('emerald-600') },
        teal: { 400: v('teal-400'), 500: v('teal-500') },
        blue: { 400: v('blue-400'), 500: v('blue-500') },
        amber: { 300: v('amber-300'), 400: v('amber-400'), 500: v('amber-500') },
        rose: { 400: v('rose-400'), 500: v('rose-500') },
        red: { 400: v('red-400'), 500: v('red-500') },
        purple: { 400: v('purple-400'), 500: v('purple-500') },
        pink: { 400: v('pink-400'), 500: v('pink-500') },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'pulse-glow': { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in .35s ease-out both',
        marquee: 'marquee 38s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
