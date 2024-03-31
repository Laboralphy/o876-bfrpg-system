const EXAMPLE = {
    "name": "c-barkling",
    "ac": 11,
    "modifiers": {
        "hp": 0,
        "damage": 0,
        "attack": 0
    },
    "actions": [
        {
            "name": "bite",
            "count": 1,
            "script": "damage",
            "data": {},
            "amp": "1d4"
        },
        {
            "name": "weapon",
            "count": 1,
            "script": "damage",
            "data": {}
        }
    ],
    "saveAs": {
        "level": 1,
        "classType": "tourist"
    },
    "properties": [],
    "equipment": [
        "arm-chain-mail"
    ],
    "specie": "humanoid",
    "level": 1,
    "speed": 20
}

class CreatureBuilder {
    /**
     *
     * @param oCreature {Creature}
     * @param blueprint {object}
     */
    build (oCreature, blueprint) {
        const m = oCreature.store.mutations

    }
}

module.exports = CreatureBuilder