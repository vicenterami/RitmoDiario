/** @type {import('tailwindcss').Config} */
module.exports = {
  // ESTA es la linea que faltaba y causaba el error:
  presets: [require("nativewind/preset")],
  
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}