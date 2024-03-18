const ItemProperties = require("./ItemProperties");
const CONSTS = require("./consts");

class ItemBuilder {

    /**
     * Combine blueprint data and item type data
     * @param oBlueprint
     * @param oData
     * @param slots
     * @param defaultWeight
     * @returns {BFItem}
     */
    mixData(oBlueprint, oData, slots, defaultWeight) {
        const properties = oBlueprint.properties.map(ip => ItemProperties.build(ip.property, ip))
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
        const oItemTypeData = data['weapon-types'][sItemTypeDataKey]
        if (!oItemTypeData) {
            throw new Error('This weapon data is undefined : ' + sItemTypeDataKey)
        }
        const { defaultWeight } = data['item-types'].ITEM_TYPE_WEAPON
        const slot = oItemTypeData.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)
            ? CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED
            : CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE
        return this.mixData(oBlueprint, oItemTypeData, [slot], defaultWeight)
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
        const { slots } = data['item-types'][oBlueprint.itemType]
        return this.mixData(oBlueprint, {}, slots, data)
    }

    createItem (oBlueprint, data) {
        if (!data) {
            throw new Error('data is not defined !')
        }
        switch (oBlueprint.itemType) {
            case CONSTS.ITEM_TYPE_ARMOR: {
                return this.createItemArmor(oBlueprint, data)
            }

            case CONSTS.ITEM_TYPE_WEAPON: {
                return this.createItemWeapon(oBlueprint, data)
            }

            case CONSTS.ITEM_TYPE_SHIELD: {
                return this.createItemShield(oBlueprint, data)
            }

            case CONSTS.ITEM_TYPE_AMMO: {
                return this.createItemAmmo(oBlueprint, data)
            }

            case CONSTS.ITEM_TYPE_HELM:
            case CONSTS.ITEM_TYPE_NECKLACE:
            case CONSTS.ITEM_TYPE_CLOAK:
            case CONSTS.ITEM_TYPE_GAUNTLETS:
            case CONSTS.ITEM_TYPE_GLOVES:
            case CONSTS.ITEM_TYPE_RING:
            case CONSTS.ITEM_TYPE_BELT:
            case CONSTS.ITEM_TYPE_BOOTS:
            case CONSTS.ITEM_TYPE_TORCH: {
                return this.createItemGear(oBlueprint, data)
            }

            default: {
                throw new Error('ERR_ITEM_TYPE_NOT_SUPPORTED: ' + oBlueprint.itemType)
            }
        }
    }
}

module.exports = ItemBuilder