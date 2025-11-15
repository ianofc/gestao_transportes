/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // ADICIONE ESTE BLOCO DE CORES
      colors: {
        'brand': {
          50: '#f0fdf4',  // Fundo de página (quase branco, tom verde)
          100: '#dcfce7', // Fundo de "cards" ou seções
          200: '#bbf7d0', // Elementos sutis
          300: '#86efac', // Destaques suaves, ícones
          400: '#4ade80', // Verde principal "suave"
          500: '#22c55e', // Verde principal (Botões, ícones ativos)
          600: '#16a34a', // Hover do botão principal
          700: '#15803d', // Cor escura para menus (alternativa ao sidebar)
          800: '#166534', // Tom mais escuro
          900: '#14532d', // Tom mais escuro (Sidebar, texto escuro)
        },
      }
    },
  },
  plugins: [],
}