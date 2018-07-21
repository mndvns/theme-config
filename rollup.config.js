const babelPlugin = require('rollup-plugin-babel')
const filesizePlugin = require('rollup-plugin-filesize')
const resolvePlugin = require('rollup-plugin-node-resolve')
const replacePlugin = require('rollup-plugin-replace')
const typescriptPlugin = require('rollup-plugin-typescript2')
const colors = require('colors')
const pkg = require('./package.json')

const input = 'src/index.ts'

const output = (opts = {}) => ({
  sourcemap: true,
  ...opts
})

const external = [
  'd3',
  // 'd3-color',
  // 'd3-interpolate',
  // 'd3-scale-chromatic',
  // 'immutable',
  // 'get-prototype-descriptors',
  // 'symbol-observable',
]

const babel = (opts = {}) => babelPlugin({
  exclude: 'node_modules/**',
  babelrc: false,
  comments: false,
  plugins: [
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
  ],
  presets: [
    ['@babel/preset-env', {
      modules: false,
      ...(opts.env || {})
    }],
  ],
  ...opts
})

const filesize = filesizePlugin({
  render(opt, size, gzip, bundle) {
    const left = `${'Built'.blue}${':'.yellow}`
    const inner = `size: ${size}, gzip: ${gzip}`.underline
    const parens = `( ${inner} )`.green
    return `${left} ${bundle.file} ${parens}`
  }
})

// const replace = (opts = {}) => replacePlugin({
//   ...opts
// })

const typescript = typescriptPlugin({
  tsconfig: 'tsconfig.json',
  tsconfigOverride: {
    compilerOptions: {
      external,
    }
  },
})

// const resolve = resolvePlugin()

const plugins = (opts = {}) => [
  // replace(opts.replaces || {}),
  typescript,
  // resolve,
  babel(opts.babel || {}),
  filesize
]

const configure = (opts = {}) => ({
  input,
  external,
  plugins: plugins(opts.plugins || {}),
  output: output(opts.output || {}),
})

module.exports = [
  configure({
    output: {
      file: pkg.main,
      format: 'cjs',
    },
  }),
  // configure({
  //   output: {
  //     file: pkg.module,
  //     format: 'es',
  //   },
  // }),
]
