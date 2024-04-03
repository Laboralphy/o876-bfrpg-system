/**
 * @typedef BFStoreMutations {Object}
 * @property addCreatureProperty {function(property: BFItemProperty): BFItemProperty}
 * @property addEffect {function(effect: BFEffect): BFEffect}
 * @property defineAction {function(count: number, name: string, script: string, amp: string|number, parameters: object)}
 * @property equipItem {function(item: BFItem, slot: string): BFEffect}
 * @property removeDeadEffects {function()}
 * @property removeItem {function(slot: string): BFEffect}
 * @property setAbilityValue {function(ability: string, value: number)}
 * @property setClassType {function(value: string)}
 * @property setEffectDuration {function(effect: BFEffect, duration: number)}
 * @property setHitPoints {function(value: number)}
 * @property setLevel {function(value: number)}
 * @property setOffensiveSlot {function(slot: string)}
 */
