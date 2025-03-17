module.exports = {
  plugins: {
    tailwindcss: {
      theme: {
        extend: {
          backgroundColor: {
            background: 'hsl(var(--background))'
          },
          borderColor: {
            border: 'hsl(var(--border))'
          }
        }
      }
    },
    autoprefixer: {},
  }
}
