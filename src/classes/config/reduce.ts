import d3 from 'd3'

export default function reduce(input, lines = [], depth = []) {
  let output

  switch (typeof input) {
    case 'object':
      normalizeObject(input, lines, depth)
      break
    case 'number':
      // XXX fix this stupidity
      const unit = input % 1 ? '__FLOAT__' : '__INTEGER__'
      output = normalizeString(input + unit, depth)
      break
    case 'string':
      const range = getRange(input)
      if (range) {
        return reduce(range, lines, depth)
      } else {
        output = normalizeString(input, depth)
      }
      break
    default:
      break
  }

  if (depth.length && output !== undefined) {
    lines.push(`${root(depth)} = ${output}`)
  }

  return [
    `const $root = {}`,
    `${lines.join('\n')}`,
    `return $root`,
  ].join('\n')
}

function getRange(input) {
  let m
  if ((m = /^(\d*?\.?\d*?)\.\.(\d*?\.?\d*?)$/.exec(input))) {
    let [m1, m2] = m.slice(1)
    if (m1 && m2) {
      m1 = parseFloat(m1)
      m2 = parseFloat(m2)
      return d3.scaleLinear()
        .domain([m1, m2])
        .ticks(12)
    }
  }
}

function normalizeObject(input, lines, depth) {
  let isArray = false

  if (Array.isArray(input)) {
    isArray = true
    input = input.reduce((acc, val, i) => {
      acc[i] = val
      return acc
    }, {})
  }

  if (depth.length) {
    const empty = isArray ? '[]' : '{}'
    lines.push(`${root(depth)} = ${empty}`)
  }

  let before
  if (input.hasOwnProperty('$before')) {
    before = input['$before']
    delete input['$before']
  }

  for (const key in input) {
    let val = input[key]

    if (before) {
      if (typeof before === 'function') {
        val = before(val)
      }
      Object.assign(val, before, val)
    }

    switch (key) {
      case '$extend':
      case '$extends':
        const ref = `${unwrapRef(val)}`
        lines.push(`for (const key in $root.${ref}) {`)
        lines.push(`  const ctx = ${root(depth)}`)
        lines.push(`  if (!ctx.hasOwnProperty(key)) {`)
        lines.push(`    ctx[key] = new Ref(\`${ref}.\${key}\`, $root.${ref}[key])`)
        lines.push(`  }`)
        lines.push(`}`)
        break
      default:
        reduce(val, lines, [...depth, key])
        break
    }
  }
}

function normalizeString(input, depth) {
  return input
    .replace(/\$\{(this\.|\.*)?(.*)\}/g, (_p, m1, m2) => normalizeStringPointer(m1, m2, depth))
    .replace(/(\d*?\.?\d*)(px|rem|\%|__INTEGER__|__FLOAT__)/g, (_p, m1, m2) => `new Prim('${m2}', ${m1})`)
}

function normalizeStringPointer(m1, m2, depth) {
  if (m1) {
    if (m1 === 'this.') {
      m1 = '.'
    }
    depth = depth.concat()
    let len = m1.length
    while (len--) {
      depth.pop()
    }
    const keysString = [...depth, ...getKeysArr(m2)].join('')
    return `new Ref('${m1}${m2}', $root.${keysString})`
  } else {
    return `new Ref('${m2}', ${root(m2)})`
  }
}

function root(depth) {
  return `$root${getKeysString(depth)}`
}

function getKeysString(depth) {
  return getKeysArr(depth).join('')
}

function getKeysArr(depth) {
  if (typeof depth === 'string') {
    return getKeysArr(depth.split('.'))
  } else {
    return depth.map(d => /^\d*$/.test(d) ? `[${d}]` : `.${d}`)
  }
}

function unwrapRef(input) {
  return input.replace(/\$\{(.*)\}/g, (_p, m1) => m1)
}
