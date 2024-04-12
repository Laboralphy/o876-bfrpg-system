const EXAMPLE = {
    "name": "c-centaur",
    "ac": 13, //---------------
    "actions": [ //---------------
        { //---------------
            "name": "hoove", //---------------
            "attackType": "melee", //---------------
            "damage": "1d6", //---------------
            "count": 2, //---------------
            "conveys": [ //---------------
                { //---------------
                    "script": "damage", //---------------
                    "data": {} //---------------
                } //---------------
            ] //---------------
        } //---------------
    ], //-------------------
    "saveAs": { //--------------------
        "level": 4, //----------------
        "classType": "CLASS_TYPE_FIGHTER" //--------------
    }, //-----------------
    "properties": [],
    "equipment": [
        "arm-leather",
        "wpn-spear",
        "wpn-longbow",
        "ammo-arrow"
    ],
    "specie": "SPECIE_MAGICAL_BEAST", //-------------
    "level": 4, //-----------------
    "speed": 50, //-------------------
    "classType": "CLASS_TYPE_MONSTER" //-----------------
}

const CONSTS = require('../src/consts')
const ItemProperties = require("./ItemProperties");

class CreatureBuilder {
    /**
     *
     * @param oCreature {Creature}
     * @param blueprint {object}
     */
    buildMonster (oCreature, blueprint) {
        const m = oCreature.mutations
        m.setClassType({ value: CONSTS.CLASS_TYPE_MONSTER })
        m.setLevel({ value: blueprint.level })
        m.setMonsterData({
            data: {
                modifiers: {
                    attack: blueprint.modifiers.attack,
                    hp: blueprint.modifiers.hp
                },
                saveAs: {
                    classType: blueprint.saveAs.classType,
                    levelAdjust: blueprint.saveAs.levelAdjust
                }
            }
        })
        m.defineActions({
            actions: blueprint.actions
        })
        m.setNaturalArmorClass({ value: blueprint.ac })
        m.setSpecie({ value: blueprint.specie })
        m.setSpeed({ value: blueprint.speed })
        blueprint.properties.map(ip => ItemProperties.build(ip.property, ip.amp || 0, ip.data))
    }
}

module.exports = CreatureBuilder