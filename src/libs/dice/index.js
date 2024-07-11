const REGEX_XDY = /^([-+]?) *(\d+) *d *(\d+) *(([-+]) *(\d+))?$/

/**
 * @class
 */
class Dice {
  constructor () {
    this._cachexdy = {}
    this._DEBUG = false
    this._FORCE_RANDOM_VALUE = 0
    this._FORCE_AVG = false
  }

  /**
   * Force a value, usefull for testing
   * @param value {number|boolean|undefined|string} this number will be use instead of random value
   */
  cheat (value = 0) {
    const t = typeof value
    this._FORCE_AVG = false
    switch (t) {
      case 'undefined': {
        this._DEBUG = false
        break
      }
      case 'boolean': {
        this._DEBUG = value
        break
      }
      case 'string': {
        if (value.toLowerCase() === 'avg') {
          this._FORCE_AVG = true
        } else {
          throw new Error('unsupported string value (supported values are : "avg"')
        }
        break
      }
      case 'number': {
        this._DEBUG = true
        this._FORCE_RANDOM_VALUE = Math.max(0, Math.min(1, value))
        break
      }
      default: {
        throw new Error('Dice cheat value is invalid (floating number 0..1 or boolean required')
      }
    }
  }

  /**
   * random function
   * @returns {number} floating value between 0 and 1
   */
  random () {
    return this._DEBUG ? this._FORCE_RANDOM_VALUE : Math.random()
  }

  /**
   * roll one or more dices
   * @param nSides {number} dice face count
   * @param nCount {number} roll count
   * @param nModifier {number} modifier added to result
   * @returns {number} final result
   */
  roll (nSides, nCount = 1, nModifier = 0) {
    if (nSides === 0 || nCount === 0) {
      return nModifier
    }
    let nAcc = 0
    if (nSides === 0) {
      return nModifier
    }
    if (nCount < 0) {
      return -this.roll(nSides, -nCount, nModifier)
    }
    if (this._FORCE_AVG) {
      nAcc = nCount * (nSides + 1) / 2
    } else {
      for (let i = 0; i < nCount; ++i) {
        nAcc += Math.floor(this.random() * nSides) + 1
      }
    }
    return nAcc + nModifier
  }

  /**
   * Analyze an expression of type xDy+z
   * @param value {string}
   * @returns {{count: number, sides: number}}
   */
  xdy (value) {
    const bString = typeof value === 'string'
    if (bString && (value in this._cachexdy)) {
      return this._cachexdy[value]
    }
    if (bString && isNaN(value)) {
      const r = value.trim().match(REGEX_XDY)
      if (!r) {
        throw new Error('This dice formula is invalid : "' + value + '"')
      }
      const [, sCountSign, sCount, sSides, , sModifierSign, sModifier] = r
      const count = parseInt(sCount) * (sCountSign === '-' ? -1 : 1)
      const sides = parseInt(sSides)
      const modifier = sModifier === undefined
        ? 0
        : parseInt(sModifier) * (sModifierSign === '-' ? -1 : 1)
      if (r) {
        return this._cachexdy[value] = {
          sides,
          count,
          modifier
        }
      } else {
        throw new Error('This formula does not compute : "' + value + '". Expected format is xDy+z where x, y and z are numbers (x and z may be negative)')
      }
    }
    const nModifier = parseInt(value)
    if (isNaN(nModifier)) {
      throw new Error('an error occured while evaluating "' + value + '"')
    }
    return this._cachexdy[value] = {
      sides: 0,
      count: 0,
      modifier: parseInt(value)
    }
  }

  _add (result, { sides, count, modifier }) {
    const sSides = sides.toString()
    if (sSides in result) {
      result.sides[sSides] = count
    } else {
      result.sides[sSides] += count
    }
    result.modifier += modifier
  }

  add (values) {
    return values.reduce((prev, curr) => {
      this._add(prev, this.xdy(curr))
      return prev
    }, {
      sides: {},
      modifier: 0
    })
  }

  /**
   * Evaluate an expression of type xDy+z
   * effectively roll the dice
   * @param value {number|string|object}
   * @return {number}
   */
  evaluate (value) {
    const t = typeof value
    if (t === 'number') {
      return value
    } else if (t === 'object') {
      const { sides, count, modifier } = value
      return this.roll(sides, count, modifier)
    } else {
      return this.evaluate(this.xdy(value))
    }
  }
}

module.exports = Dice
