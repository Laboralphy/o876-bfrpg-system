const REGEX_XDY = /^([-+]?) *(\d+) *d *(\d+) *(([-+]) *(\d+))?$/
const REGEX_NUM = /^([-+]?) *(\d+) *$/

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

  _parseSignedInt (value, sign = undefined) {
    const nSignedValue = sign === '-' ? -1 : 1
    if (value === undefined || value === null || value === '') {
      return 0
    }
    // Si la valeur est équivalente à 0 en nombre, retourner 0
    if (Number(value) === 0) {
      return 0
    }
    // Sinon, retourner la valeur entière analysée
    return nSignedValue * parseInt(value)
  }

  /**
   * Analyze an expression of type xDy+z
   * @param value {string|number}
   * @returns {{count: number, sides: number, modifier: number}}
   */
  xdy (value) {
    const sValueType = typeof value
    if (sValueType === 'number') {
      return {
        sides: 0,
        count: 0,
        modifier: this._parseSignedInt(value)
      }
    }
    if (sValueType !== 'string') {
      throw new TypeError('value of type ' + sValueType + ' is not allowed')
    }
    value = value
        .trim()
        .replace(/ +/g, '')
        .toLowerCase()
    if (value in this._cachexdy) {
      return this._cachexdy[value]
    }
    const bIsNumeric = !!value.match(REGEX_NUM)
    if (bIsNumeric) {
      return {
        sides: 0,
        count: 0,
        modifier: this._parseSignedInt(value)
      }
    }
    const r = value.match(REGEX_XDY)
    if (!r) {
      throw new Error('This dice formula is invalid : "' + value + '"')
    }
    const [, sCountSign, sCount, sSides, , sModifierSign, sModifier] = r
    const count = this._parseSignedInt(sCount, sCountSign)
    const sides = this._parseSignedInt(sSides)
    const modifier = this._parseSignedInt(sModifier, sModifierSign)
    return this._cachexdy[value] = {
      sides,
      count,
      modifier
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
