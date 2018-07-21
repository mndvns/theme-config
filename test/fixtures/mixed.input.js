module.exports = {
  'hues': [ 0, 10, 50, 75, 100, 150, 200, 220, 240, 260, 300, 330, ],

  'grays': [ '5%', '10%', '15%', '20%', '25%', '30%', '40%', '50%', '60%', '75%', '80%', '90%', ],

  'range': '0.1..0.9',

  'color': {
    'hue': '${hues.4}',
    'chr': '50%',
    'lig': '${this.chr}',
    'sat': '${.lig}',
  },

  'unit': {
    'sm': '3px',
    'md': '12px',
    'lg': '32px',
  },

  'size': {
    'sm': '${unit.sm}',
    'md': '${unit.md}',
    'lg': '${unit.lg}',
  },

  'button': {
    'border': {
      'width': '5px',
    },
    'padding': {
      '$extend': '${unit}'
    },
  }

}
