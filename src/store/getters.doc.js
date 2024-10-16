/**
 * @typedef BFStoreGetters {object}
 * @property getAbilities {Object<string, number>}
 * @property getAbilityBaseValues {Object<string, number>}
 * @property getAbilityModifiers {Object<string, number>}
 * @property getActions {Object<string, BFStoreStateAction>}
 * @property getArmorClass {{natural: number, ranged: number, equipment: number, melee: number, details: {shield: number, dexterity: number, armor: number}}}
 * @property getAttackBonus {number}
 * @property getAttackRanges {{weapon: number, action: number}}
 * @property getCapabilities {{act: boolean, fight: boolean, move: boolean, see: boolean, cast: { self: boolean, target: boolean } }}
 * @property getCharmerSet {Set<string>}
 * @property getClassTypeData {{hdPerLowerLevel: number, hdPerHigherLevel: number, lowerLevelCount: number, rogueSkills: Object<string, number>, savingThrows: Object<string, number>, attackBonus: number}}
 * @property getConditionSet {Set<string>}
 * @property getDamageMitigation {Object<string, BFOneDamageMitigation>}}
 * @property getDefensiveEquipmentProperties {BFItemProperty[]}
 * @property getEffectRegistry {Object<string, BFEffect>}
 * @property getEffectSet {Set<string>}
 * @property getEffects {{}[]}
 * @property getEncumbrance {{value: number, capacity: number}}
 * @property getEnvironment {{ darkness: boolean, windy: boolean, difficultTerrain: boolean, underwater: boolean }}
 * @property getEquipment {Object<string, BFItem>}
 * @property getFumbleSuccess {{savingThrow: {fumble: number, success: number}, attack: {fumble: number, success: number}}}
 * @property getGender {string}
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
 * @property getRace {BFRaceData}
 * @property getRangedActions {string[]}
 * @property getSavingThrowBonus {{[p: string]: number}}
 * @property getSelectedAction {BFStoreStateAction}
 * @property getSelectedWeapon {BFItem|null}
 * @property getSpecie {string}
 * @property getSpeed {number}
 * @property getSpellSlots {number[]}
 * @property getWeaponSizeRestrictionSet {Set<string>}
 * @property isDead {boolean}
 * @property isRangedWeaponLoaded {boolean}
 * @property isSelectedWeaponUsable {boolean}
 * @property isWieldingTwoHandedWeapon {boolean}
 */
