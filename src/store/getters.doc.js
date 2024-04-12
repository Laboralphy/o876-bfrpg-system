/**
 * @typedef BFStoreGetters {object}
 * @property getAbilities {Object<string, number>}
 * @property getAbilityModifiers {Object<string, number>}
 * @property getActions {Object<string, CombatAction>}
 * @property getArmorClass {{natural: number, ranged: number, equipment: number, melee: number}}
 * @property getAttackBonus {number}
 * @property getAttackRollCriticalValue {number}
 * @property getAttackRollFumbleValue {number}
 * @property getClassTypeData {{hitDieValue: number, hitPointBonus: number, maxHitDice: number, rogueSkills: Object<string, number[]>, savingThrows: Object<string, number[]>, attackBonus: number[]}}
 * @property getDefensiveEquipmentProperties {BFItemProperty[]}
 * @property getEffects {{}[]}
 * @property getEquipment {Object<string, BFItem>}
 * @property getHitPoints {number}
 * @property getLevel {number}
 * @property getMaxHitPoints {number}
 * @property getMeleeActions {string[]}
 * @property getMonsterData {{modifiers: { hp: number, attack: number }, saveAs: {levelAdjust: number, classType: string}, actions: {}[]}}
 * @property getOffensiveEquipmentProperties {BFItemProperty[]}
 * @property getOffensiveSlot {string}
 * @property getProperties {BFItemProperty[]}
 * @property getRangedActions {string[]}
 * @property getSelectedAction {BFStoreStateAction}
 * @property getSelectedWeapon {BFItem|null}
 * @property getSpecie {string}
 * @property getSpeed {number}
 * @property isRangedWeaponLoaded {boolean}
 * @property isSelectedWeaponUsable {boolean}
 * @property isWieldingTwoHandedWeapon {boolean}
 */
