const ItemProperties = require("./ItemProperties");
const CONSTS = require("./consts");

class ItemBuilder {
    /**
     * Combine blueprint data and item type data
     * @param oBlueprint
     * @param oData
     * @param slots
     * @param defaultWeight {number}
     * @returns {BFItem}
     */
    mixData(oBlueprint, oData, slots, defaultWeight = 0) {
        const properties = oBlueprint.properties.map(ip => ItemProperties.build(ip.property, ip.amp || 0, ip))
        let nExtraWeight = 0
        properties.forEach(p => {
            if (!('data' in p)) {
                p.data = {}
            }
            if (p.property === CONSTS.ITEM_PROPERTY_EXTRA_WEIGHT) {
                nExtraWeight += p.amp
            }
        })
        const oBlueprintCopy = {
            ...oBlueprint
        }
        delete oBlueprintCopy.properties
        const sDefaultWeightType = typeof defaultWeight
        if (sDefaultWeightType !== 'number') {
            throw new TypeError('defaultWeight must be a number, ' + sDefaultWeightType + ' given')
        }
        if (oBlueprintCopy.entityType === CONSTS.ENTITY_TYPE_ITEM) {
            oBlueprintCopy.weight = nExtraWeight + (oData.weight || oBlueprint.weight || defaultWeight || 0)
        }
        return {
            properties,
            data: {},
            ...oData,
            ...oBlueprintCopy,
            equipmentSlots: slots,
        }
    }

    /**
     * creation d'une armure
     * @param oBlueprint
     * @param data
     * @returns {BFItem}
     */
    createItemArmor (oBlueprint, data) {
        const sItemTypeDataKey = oBlueprint.armorType
        if (!(sItemTypeDataKey in data['armor-types'])) {
            throw new Error('This armor type is undefined : ' + sItemTypeDataKey)
        }
        const oItemTypeData = data['armor-types'][sItemTypeDataKey]
        if (!oItemTypeData) {
            throw new Error('This armor data is undefined : ' + sItemTypeDataKey)
        }
        const { slots, defaultWeight } = data['item-types'].ITEM_TYPE_ARMOR
        return this.mixData(oBlueprint, oItemTypeData, slots, defaultWeight)
    }

    createItemWeapon (oBlueprint, data) {
        const sItemTypeDataKey = oBlueprint.weaponType
        if (!(sItemTypeDataKey in data['weapon-types'])) {
            throw new Error('This weapon type is undefined : ' + sItemTypeDataKey)
        }
        const oWeaponTypeData = data['weapon-types'][sItemTypeDataKey]
        if (!oWeaponTypeData) {
            throw new Error('This weapon data is undefined : ' + sItemTypeDataKey)
        }
        const oItemTypeData = data['item-types'][oBlueprint.itemType]
        const {
            defaultWeight,
            slots
        } = oItemTypeData
        const slot = slots.length === 1
            ? slots[0]
            : oWeaponTypeData.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)
                ? CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED
                : CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE
        return this.mixData(oBlueprint, oWeaponTypeData, [slot], defaultWeight)
    }

    createItemShield (oBlueprint, data) {
        const sItemTypeDataKey = oBlueprint.shieldType
        if (!(sItemTypeDataKey in data['shield-types'])) {
            throw new Error('This shield type is undefined : ' + sItemTypeDataKey)
        }
        const oItemTypeData = data['shield-types'][sItemTypeDataKey]
        if (!oItemTypeData) {
            throw new Error('This shield data is undefined : ' + sItemTypeDataKey)
        }
        const { slots, defaultWeight } = data['item-types'].ITEM_TYPE_SHIELD
        return this.mixData(oBlueprint, oItemTypeData, slots, defaultWeight)
    }

    createItemAmmo (oBlueprint, data) {
        const sItemTypeDataKey = oBlueprint.ammoType
        if (!(sItemTypeDataKey in data['ammo-types'])) {
            throw new Error('This ammo type is undefined : ' + sItemTypeDataKey)
        }
        const oItemTypeData = data['ammo-types'][sItemTypeDataKey]
        if (!oItemTypeData) {
            throw new Error('This ammo data is undefined : ' + sItemTypeDataKey)
        }
        const { slots, defaultWeight } = data['item-types'].ITEM_TYPE_AMMO
        return this.mixData(oBlueprint, oItemTypeData, slots, defaultWeight)
    }

    createItemGear (oBlueprint, data) {
        const oItemData = data['item-types'][oBlueprint.itemType]
        return this.mixData(oBlueprint, oItemData, oItemData.slots, oItemData.defaultWeight)
    }

    createItem (oBlueprint, oData = null) {
        switch (oBlueprint.itemType) {
            case CONSTS.ITEM_TYPE_ARMOR: {
                return this.createItemArmor(oBlueprint, oData)
            }

            case CONSTS.ITEM_TYPE_WEAPON: {
                return this.createItemWeapon(oBlueprint, oData)
            }

            case CONSTS.ITEM_TYPE_SHIELD: {
                return this.createItemShield(oBlueprint, oData)
            }

            case CONSTS.ITEM_TYPE_AMMO: {
                return this.createItemAmmo(oBlueprint, oData)
            }

            case CONSTS.ITEM_TYPE_HELM:
            case CONSTS.ITEM_TYPE_NECKLACE:
            case CONSTS.ITEM_TYPE_CLOAK:
            case CONSTS.ITEM_TYPE_GAUNTLETS:
            case CONSTS.ITEM_TYPE_GLOVES:
            case CONSTS.ITEM_TYPE_RING:
            case CONSTS.ITEM_TYPE_BELT:
            case CONSTS.ITEM_TYPE_BOOTS:
            case CONSTS.ITEM_TYPE_TORCH:
            case CONSTS.ITEM_TYPE_MAGICWAND:
            case CONSTS.ITEM_TYPE_MAGICROD: {
                return this.createItemGear(oBlueprint, oData)
            }

            default: {
                throw new Error('ERR_ITEM_TYPE_NOT_SUPPORTED: ' + oBlueprint.itemType)
            }
        }
    }
}

module.exports = ItemBuilder