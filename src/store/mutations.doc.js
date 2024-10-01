/**
 * @typedef BFStoreMutations {Object}
 * @property addCreatureProperty {function(property: BFItemProperty): BFItemProperty}
 * @property addEffect {function(): BFEffect}
 * @property defineActions {function(actions: DefineActionDTO[])}
 * @property equipItem {function(item: BFItem, slot: string, bypassCurse: boolean): BFEffect}
 * @property importCreatureState {function(data: *)}
 * @property removeDeadEffects {function()}
 * @property removeEffect {function(effect: BFEffect)}
 * @property removeItem {function(slot: string): BFEffect}
 * @property selectAction {function(action: string)}
 * @property setAbilityValue {function(ability: string, value: number)}
 * @property setClassType {function(value: string)}
 * @property setEffectDuration {function(effect: BFEffect, duration: number)}
 * @property setEncumbrance {function(value: number)}
 * @property setEnvironment {function(environment, value)}
 * @property setGender {function(value: string GENDER_*)}
 * @property setHitPoints {function(value: number)}
 * @property setId {function(value: string)}
 * @property setLevel {function(value: number)}
 * @property setNaturalArmorClass {function(value: number)}
 * @property setOffensiveSlot {function(slot: string)}
 * @property setProperties {function(properties: {[]})}
 * @property setRace {function()}
 * @property setSpecie {function(value: string)}
 * @property setSpeed {function(value: number)}
 */
