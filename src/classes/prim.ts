import { inspect } from 'util'

export default class Prim {
  unit: 'pixel' | 'rem' | 'percent' | 'integer' | 'float'
  sigil: 'px' | 'rem' | '%' | ''
  color: 'number' | 'string'
  store: number

  constructor(unit, n) {
    switch (unit) {
      case '%': unit = 'percent'; break
      case '__FLOAT__': unit = 'float'; break
      case '__INTEGER__': unit = 'integer'; break
      default: break
    }

    const sigil = ({
      'px': 'px',
      'rem': 'rem',
      'percent': '%',
      'integer': '',
      'float': '',
    })[unit]

    const color = ({
      'integer': 'number',
      'float': 'number',
    })[unit] || 'string'

    Object.defineProperties(this, {
      unit: { value: unit },
      sigil: { value: sigil },
      color: { value: color },
      store: { value: n },
    })
  }

  [inspect.custom](depth, options) {
    return options.stylize(this.store + this.sigil, this.color)
  }

  toJs(opts: toJsOpts | any = {}) {
    const { unit, store, sigil } = this
    let value = ['integer', 'float'].includes(unit) ? store : `${store}${sigil}`

    if (opts.customProps) {
      let customPropKey = opts.customPropKey
      if (opts.customPropKey) {
        const depth = opts.depth
        const name = `--${depth.join('-')}`
        value = `var(${customPropKey}, ${value})`
        opts.customPropsBuffer.push([name, value])
      }
    }

    return value
  }
}

interface toJsOpts {
  customProps?: boolean
  depth?: [string | number]
}
