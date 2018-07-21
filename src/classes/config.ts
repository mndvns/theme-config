import { inspect } from 'util'
import reduce from './config/reduce'
import Prim from './prim'
import Ref from './ref'

export default class Config {
  body: string
  value: object

  constructor(obj) {
    const body = reduce(obj)
    const value = (new Function('Prim', 'Ref', body))(Prim, Ref)

    Object.defineProperty(this, 'body', { value: body })
    Object.defineProperty(this, 'value', { value: value })
  }

  [inspect.custom](depth, options) {
    if (depth < 0) {
      return options.stylize(`[Config]`, 'special')
    }

    const inner = inspect(this.value, options)
    const prefix = options.stylize(`Config`, 'name')
    return `${prefix} ${inner}`
  }

  toJs(opts: any = {}) {
    if (opts.customProps) {
      opts.customPropsBuffer = []
      // opts.returnReferences = true
    }

    let output = (function reduce(value: any, opts: any) {
      if (value && typeof value.toJs === 'function') {
        return value.toJs(opts)
      }
      switch (typeof value) {
        case 'object':
          const depth = opts.depth || []
          if (Array.isArray(value)) {
            return value.map((value, i) => reduce(value, { ...opts, depth: [...depth, i] }))
          } else {
            const buf = {}
            for (const key in value) {
              buf[key] = reduce(value[key], { ...opts, depth: [...depth, key] })
            }
            return buf
          }
        default:
          return value
      }
    })(this.value, opts)

    if (opts.customProps) {
      output = toCustomProperties(opts.customPropsBuffer)
    }

    return output
  }
}

function toCustomProperties(buffer) {
  const acc = []
  const sorted = buffer.sort(([ak, av], [bk, bv]) => {
    // check the value type first, putting non-strings above
    const avs = typeof av
    const bvs = typeof bv
    if (avs !== bvs) {
      if (avs > bvs) return 1
      if (avs < bvs) return -1
    }

    // keep original key order
    const aa = ak.split('-').slice(2, 3)[0]
    const bb = bk.split('-').slice(2, 3)[0]
    if (aa !== bb) {
      let ai = acc.indexOf(aa)
      let bi = acc.indexOf(bb)
      if (ai === -1) ai = acc.push(aa)
      if (bi === -1) bi = acc.push(bb)
      if (ai > bi) return 1
      if (ai < bi) return -1
    }

    // put values with reference below
    const avx = avs === 'string' && av.startsWith('var')
    const bvx = avs === 'string' && bv.startsWith('var')
    if (avx !== bvx) {
      if (avx > bvx) return 1
      if (avx < bvx) return -1
    }

    return 0
  })

  const hash = sorted.reduce((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {})

  Object.defineProperty(hash, 'toString', {
    value: () => [
      `:root {`,
      sorted.map(([key, value]) => `  ${key}: ${value};`).join('\n'),
      `}`,
    ].join('\n')
  })

  return hash
}
