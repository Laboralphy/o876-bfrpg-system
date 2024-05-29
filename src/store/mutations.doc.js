/**
 * @typedef BFStoreMutations {Object}
 * @property addCreatureProperty {function(property: BFItemProperty): BFItemProperty}
 * @property addEffect {function(): BFEffect}
 * @property damage {function(amount: number)}
 * @property defineActions {function(actions: DefineActionDTO[])}
 * @property equipItem {function(item: BFItem, slot: string): BFEffect}
 * @property removeDeadEffects {function()}
 * @property removeEffect {function(effect: BFEffect)}
 * @property removeItem {function(slot: string): BFEffect}
 * @property selectAction {function(action: string)}
 * @property setAbilityValue {function(ability: string, value: number)}
 * @property setClassType {function(value: string)}
 * @property setEffectDuration {function(effect: BFEffect, duration: number)}
 * @property setHitPoints {function(value: number)}
 * @property setLevel {function(value: number)}
 * @property setNaturalArmorClass {function(value: number)}
 * @property setOffensiveSlot {function(slot: string)}
 * @property setProperties {function(properties: {[]})}
 * @property setSpecie {function(value: string)}
 * @property setSpeed {function(value: number)}
 */
