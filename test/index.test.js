const { inspect } = require('util')
const should = require('should')
const { Config, Prim, Ref } = require('../dist')

Object.assign(inspect.defaultOptions, {
  depth: 5,
  breakLength: 100,
})

describe('Config', () => {
  const input = require('./fixtures/mixed.input')
  const output = {
    custom: require('./fixtures/mixed.output.custom')
  }

  const config = new Config(input)

  it('should initialize', () => {
    config.should.be.instanceOf(Config)
  })

  const { value } = config

  it('should have properties', () => {
    value.should.have.properties(Object.keys(input))
  })

  describe('ranges', () => {
    it('should mount array properly', () => {
      value.hues.should.be.type('object')
      value.hues.should.be.instanceOf(Array)
    })

    it('should initialize ranges', () => {
      ['hues', 'grays', 'range'].map(key => {
        value[key].map(x => {
          x.should.be.instanceOf(Prim)
          x.store.should.be.type('number')
        })
      })
    })

    it('should populate ranges with the correct primitives', () => {
      value.hues.map(x => {
        x.unit.should.eql('integer')
        x.sigil.should.eql('')
      })

      value.grays.map(x => {
        x.unit.should.eql('percent')
        x.sigil.should.eql('%')
      })

      value.range.map(x => {
        x.unit.should.eql('float')
        x.sigil.should.eql('')
      })
    })
  })

  describe('reference', () => {
    it('absolute reference', () => {
      const x = value.color.hue
      x.should.be.instanceOf(Ref)
      x.label.should.eql('hues.4')
      x.value.should.be.instanceOf(Prim)
      x.value.store.should.eql(100)
    })

    it('relative this reference', () => {
      const x = value.color.lig
      x.should.be.instanceOf(Ref)
      x.label.should.eql('.chr')
      x.value.should.be.instanceOf(Prim)
      x.value.store.should.eql(50)
    })

    it('relative dot reference', () => {
      const x = value.color.sat
      x.should.be.instanceOf(Ref)
      x.label.should.eql('.lig')
      x.value.should.be.instanceOf(Ref)
      x.value.value.store.should.eql(50)
    })
  })

  describe('toJs', () => {
    it('plain', () => {
      const js = config.toJs()
      console.log('JS', js)
    })

    it('returnReferences', () => {
      const js = config.toJs({ returnReferences: true })
      console.log('RETURN_REFERENCES', js)
    })

    it('customProps', () => {
      const js = config.toJs({ customProps: true })
      console.log('CUSTOM_PROPS', js)
      js.should.eql(output.custom)
    })
  })
})
