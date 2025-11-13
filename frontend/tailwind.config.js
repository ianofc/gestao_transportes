/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Diz ao Tailwind para ler todos os ficheiros JS/JSX em src/
  ],
  theme: {
    extend: {
      fontFamily: {
        // Adiciona a fonte Inter (opcional, mas fica bonito)
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}