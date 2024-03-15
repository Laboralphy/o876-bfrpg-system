/**
 * @typedef BFEffect {Object}
 * @property id {string}
 * @property type {string} type of effect
 * @property subtype {string} subtype of effect (magical, extraordinary, etc...)
 * @property amp {number} numeric value, effect amplitude
 * @property duration {number} duration of effect, decrease each turn, when reach 0 the effect is deleted
 * @property source {string} identifier of the creature which cast the effect
 * @property data {{}} custom data for the effect
 */