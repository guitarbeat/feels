module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true
      }
    },
    'css-mqpacker': {} // Combines media queries for better mobile performance
  }
}
