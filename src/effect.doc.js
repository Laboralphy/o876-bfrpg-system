/**
 * @typedef BFEffect {Object}
 * @property id {string}
 * @property type {string} type of effect
 * @property subtype {string} subtype of effect (magical, extraordinary, etc...)
 * @property amp {number | string} numeric value, effect amplitude, if string, roll dice to evaluate value
 * @property duration {number} duration of effect, decrease each turn, when reach 0 the effect is deleted
 * @property source {string} identifier of the creatures which cast the effect
 * @property data {{}} custom data for the effect
 */