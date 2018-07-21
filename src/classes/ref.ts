import { inspect } from 'util'
import Prim from './prim'

export default class Ref {
  label: string
  value: Prim

  constructor(label, value) {
    Object.defineProperties(this, {
      label: { value: label },
      value: { value: value },
    })
  }

  [inspect.custom](depth, options) {
    return options.stylize(`@${this.label}`, 'special')
  }

  toJs(opts: any = {}) {
    let label = this.label
    let value: any = this.value
    if (value instanceof Prim) {
      if (opts.customProps) {
        const key = opts.customPropKey = getKey(label, opts)
        const val = value.toJs({ ...opts, customProps: false })
        value.toJs(opts)
        opts.customPropsBuffer.push([key, val])
      }
    } else if (value instanceof Ref) {
      if (opts.returnReferences) {
        return Ref.prototype.toJs.call(value, opts)
      }
    }
    return value
  }
}

function getKey(label, opts) {
  let depth
  let parts = label.split('.')
  while (!parts[0]) {
    if (!depth) {
      depth = opts.depth.concat()
    }
    depth.pop()
    parts.shift()
  }
  if (depth) {
    parts = [...depth, ...parts]
  }
  return `--${parts.join('-')}`
}
