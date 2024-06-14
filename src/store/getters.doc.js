/**
 * @typedef BFStoreGetters {object}
 * @property getAbilities {Object<string, number>}
 * @property getAbilityModifiers {Object<string, number>}
 * @property getActions {Object<string, BFStoreStateAction>}
 * @property getArmorClass {{natural: number, ranged: number, equipment: number, melee: number}}
 * @property getAttackBonus {number}
 * @property getAttackRanges {{weapon: number, action: number}}
 * @property getAttackRollCriticalValue {number}
 * @property getAttackRollFumbleValue {number}
 * @property getCapabilities {{act: boolean, fight: boolean, move: boolean, see: boolean, cast: { self: boolean, target: boolean } }}
 * @property getCharmerSet {Set<string>}
 * @property getClassTypeData {{hitDieValue: number, hitPointBonus: number, maxHitDice: number, rogueSkills: Object<string, number[]>, savingThrows: Object<string, number[]>, attackBonus: number[]}}
 * @property getConditionSet {Set<string>}
 * @property getDamageMitigation {Object<string, D20OneDamageMitigation>}}
 * @property getDefensiveEquipmentProperties {BFItemProperty[]}
 * @property getEffectRegistry {Object<string, BFEffect>}
 * @property getEffectSet {Set<string>}
 * @property getEffects {{}[]}
 * @property getEquipment {Object<string, BFItem>}
 * @property getHitPoints {number}
 * @property getImmunitySet {Set<string>}
 * @property getLevel {number}
 * @property getMaxHitPoints {number}
 * @property getMeleeActions {string[]}
 * @property getOffensiveEquipment {{weapon: BFItem|null, ammo: BFItem|null}}
 * @property getOffensiveEquipmentProperties {BFItemProperty[]}
 * @property getOffensiveSlot {string}
 * @property getProperties {BFItemProperty[]}
 * @property getPropertySet {Set<string>}
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
