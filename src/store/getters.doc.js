/**
 * @typedef BFStoreGetters {object}
 * @property getAbilities {Object<string, number>}
 * @property getAbilityModifiers {Object<string, number>}
 * @property getActions {Object<string, BFStoreStateAction>}
 * @property getArmorClass {{natural: number, ranged: number, equipment: number, melee: number}}
 * @property getAttackBonus {number}
 * @property getAttackRollCriticalValue {number}
 * @property getAttackRollFumbleValue {number}
 * @property getCapabilities {{attack: boolean, move: boolean, see: boolean, cast: { self: boolean, target: boolean } }}
 * @property getClassTypeData {{hitDieValue: number, hitPointBonus: number, maxHitDice: number, rogueSkills: Object<string, number[]>, savingThrows: Object<string, number[]>, attackBonus: number[]}}
 * @property getConditionSet {Set<string>}
 * @property getDamageMitigation {Object<string, D20OneDamageMitigation>}}
 * @property getDefensiveEquipmentProperties {BFItemProperty[]}
 * @property getEffectRegistry {Object<string, BFEffect>}
 * @property getEffectSet {Set<string>}
 * @property getEffects {{}[]}
 * @property getEquipment {Object<string, BFItem>}
 * @property getHitPoints {number}
 * @property getLevel {number}
 * @property getMaxHitPoints {number}
 * @property getMeleeActions {string[]}
 * @property getMonsterData {{modifiers: { hp: number, attack: number }, saveAs: {level: number, classType: string}, actions: {}[]}}
 * @property getOffensiveEquipment {{weapon: BFItem|null, ammo: BFItem|null}}
 * @property getOffensiveEquipmentProperties {BFItemProperty[]}
 * @property getOffensiveSlot {string}
 * @property getProperties {BFItemProperty[]}
 * @property getRangedActions {string[]}
 * @property getRecentDamages {{ amount: number, types: Object<string, { amount: number, resisted: number }> }}
 * @property getSavingThrowFailureValue {number}
 * @property getSavingThrowSucessValue {number}
 * @property getSelectedAction {BFStoreStateAction}
 * @property getSelectedWeapon {BFItem|null}
 * @property getSpecie {{ ref: string, living: boolean, mind: boolean }}
 * @property getSpeed {number}
 * @property isDead {boolean}
 * @property isRangedWeaponLoaded {boolean}
 * @property isSelectedWeaponUsable {boolean}
 * @property isWieldingTwoHandedWeapon {boolean}
 */
