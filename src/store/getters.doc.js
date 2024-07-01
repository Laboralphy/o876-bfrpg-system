/**
 * @typedef BFStoreGetters {object}
 * @property getAbilities {Object<string, number>}
 * @property getAbilityBaseValues {Object<string, number>}
 * @property getAbilityModifiers {Object<string, number>}
 * @property getActions {Object<string, BFStoreStateAction>}
 * @property getArmorClass {{natural: number, ranged: number, equipment: number, melee: number}}
 * @property getAttackBonus {number}
 * @property getAttackRanges {{weapon: number, action: number}}
 * @property getCapabilities {{act: boolean, fight: boolean, move: boolean, see: boolean, cast: { self: boolean, target: boolean } }}
 * @property getCharmerSet {Set<string>}
 * @property getClassTypeData {{hdPerLowerLevel: number, hdPerHigherLevel: number, lowerLevelCount: number, rogueSkills: Object<string, number[]>, savingThrows: Object<string, number[]>, attackBonus: number[]}}
 * @property getConditionSet {Set<string>}
 * @property getDamageMitigation {Object<string, D20OneDamageMitigation>}}
 * @property getDefensiveEquipmentProperties {BFItemProperty[]}
 * @property getEffectRegistry {Object<string, BFEffect>}
 * @property getEffectSet {Set<string>}
 * @property getEffects {{}[]}
 * @property getEncumbrance {{value: number, capacity: number}}
 * @property getEquipment {Object<string, BFItem>}
 * @property getFumbleSuccess {{savingThrow: {fumble: number, success: number}, attack: {fumble: number, success: number}}}
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
 * @property getRace {{name:string, specie:{ ref: string, living: boolean, mind: boolean }, abilityRestrictions:Object, maxHdPerLevel:number, savingThrows:Object, properties:Array }}
 * @property getRangedActions {string[]}
 * @property getSavingThrowBonus {{[p: string]: number}}
 * @property getSelectedAction {BFStoreStateAction}
 * @property getSelectedWeapon {BFItem|null}
 * @property getSpecie {{ ref: string, living: boolean, mind: boolean }}
 * @property getSpeed {number}
 * @property getWeaponSizeRestrictionSet {Set<string>}
 * @property isDead {boolean}
 * @property isRangedWeaponLoaded {boolean}
 * @property isSelectedWeaponUsable {boolean}
 * @property isWieldingTwoHandedWeapon {boolean}
 */
