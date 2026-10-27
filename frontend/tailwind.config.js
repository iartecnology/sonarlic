/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        iar: {
          coral: '#D9465A',
          purple: '#9B4B75',
          indigo: '#6C5B8B',
          blue: '#3B6DB5',
          dark: '#121620',
          darker: '#0B0E14',
          gray: '#202636',
          light: '#F8FAFC',
        },
      },
      backgroundImage: {
        'gradient-iar': 'linear-gradient(135deg, #D9465A 0%, #9B4B75 35%, #6C5B8B 70%, #3B6DB5 100%)',
        'gradient-iar-subtle': 'linear-gradient(135deg, rgba(217, 70, 90, 0.08) 0%, rgba(155, 75, 117, 0.08) 35%, rgba(108, 91, 139, 0.08) 70%, rgba(59, 109, 181, 0.08) 100%)',
        'gradient-iar-dark': 'linear-gradient(135deg, #0B0E14 0%, #171526 50%, #101726 100%)',
      },
    },
  },
  plugins: [],
}
