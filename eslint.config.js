//проверка
// eslint.config.js
export default [
  {
    files: ['src/**/*.js', '*.js'], // обрабатываем JS-файлы в src и корне
    ignores: [
      'webpack.common.js',
      'webpack.dev.js',
      'webpack.prod.js',
      'dist/',
      'node_modules/'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module' // для файлов с import/export
    },
    rules: {}
  },
  {
    files: [
      'webpack.common.js',
      'webpack.dev.js',
      'webpack.prod.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs' // для Webpack-конфигов с require/module
    }
  }
];


