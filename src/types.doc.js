/**
 * @typedef BFItem {object}
 * @property id {string}
 * @property ref {string} blueprint reference
 * @property entityType {string}
 * @property itemType {string}
 * @property [armorType] {string}
 * @property [weaponType] {string}
 * @property [shieldType] {string}
 * @property [ammoType] {string}
 * @property properties {[]}
 * @property data {{}}
 * @property equipmentSlots {string[]}
 * @property weight {number}
 * @property attributes {string[]}
 * @property [size] {string}
 * @property [ac] {string}
 * @property [damage] {string}
 * @property material {string}
 */

/**
 * @typedef BFAttackOutcomeDamages {object}
 * @property amount {number}
 * @property resisted {object<string, number>}
 * @property types {object<string, number>}
 */

/**
 * @typedef BFAttackOutcome {object}
 * @property ac {number}
 * @property bonus {number}
 * @property critical {boolean}
 * @property deflector {string}
 * @property distance {number}
 * @property hit {boolean}
 * @property range {number}
 * @property roll {number}
 * @property attacker {Creature}
 * @property target {Creature}
 * @property weapon {BFItem}
 * @property ammo {BFItem}
 * @property action {CombatAction}
 * @property kill {boolean}
 * @property failed {boolean}
 * @property failure {string}
 * @property sneakable {boolean}
 * @property damages {BFAttackOutcomeDamages}
 */

module.exports = {}