const Combat = require('../src/combat/Combat')
const Creature = require('../src/Creature')
const ItemBuilder = require("../src/ItemBuilder");
const CONSTS = require('../src/consts')
const DATA = {
    ...require('../src/data'),
    ...require('../src/modules/classic/data')
}
const BLUEPRINTS = {
    ...require('../src/modules/classic/blueprints')
}


describe ('computePlanning', function () {
    it('should return [1, 0, 0, 0, 0, 0] when planning one attack-types over 6 ticks', function () {
        expect(Combat.computePlanning(1, 6)).toEqual([1, 0, 0, 0, 0, 0])
    })
    it('should return [1, 0, 0, 1, 0, 0] when planning 2 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(2, 6)).toEqual([1, 0, 0, 1, 0, 0])
    })
    it('should return [1, 0, 1, 0, 1, 0] when planning 3 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(3, 6)).toEqual([1, 0, 1, 0, 1, 0])
    })
    it('should return [1, 1, 0, 1, 1, 0] when planning 4 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(4, 6)).toEqual([1, 1, 0, 1, 1, 0])
    })
    it('should return [1, 1, 1, 1, 1, 0] when planning 5 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(5, 6)).toEqual([1, 1, 1, 1, 1, 0])
    })
    it('should return [1, 1, 1, 1, 1, 1] when planning 6 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(6, 6)).toEqual([1, 1, 1, 1, 1, 1])
    })
    it('should return [2, 1, 1, 1, 1, 1] when planning 7 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(7, 6)).toEqual([2, 1, 1, 1, 1, 1])
    })
    it('should return [2, 2, 1, 2, 2, 1] when planning 10 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(10, 6)).toEqual([2, 2, 1, 2, 2, 1])
    })
    it('should return [0, 0, 0, 0, 0, 1] when planning one attack-types over 6 ticks on reverseRound', function () {
        expect(Combat.computePlanning(1, 6, true))
            .toEqual([0, 0, 0, 0, 0, 1])
    })
    it('should return [0, 0, 1, 0, 0, 1] when planning 2 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(2, 6, true))
            .toEqual([0, 0, 1, 0, 0, 1])
    })
    it('should return [0, 1, 0, 1, 0, 1] when planning 3 attacks over 6 ticks', function () {
        expect(Combat.computePlanning(3, 6, true))
            .toEqual([0, 1, 0, 1, 0, 1])
    })
})

describe('fullcombat', function () {
    it('should send combat.action event when it is time for creature to attack-types and actions are defined', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        const c2 = new Combat()
        c2.setFighters(f2, f1)
        c.attacker.nextAction = {
            name: 'claw',
            conveys: [{
                script: 'damage',
                data: {}
            }],
            damage: '1d4',
            damageType: CONSTS.DAMAGE_TYPE_PHYSICAL,
            count: 2,
            data: {}
        }
        c2.attacker.nextAction = {
            name: 'bite',
            conveys: [{
                script: 'damage',
                data: {}
            }],
            damage: '1d6',
            damageType: CONSTS.DAMAGE_TYPE_PHYSICAL,
            count: 1,
            data: {}
        }
        const aLogs = []
        c.events.on('combat.action', ev => {
            aLogs.push({ event: 'combat.action-1', attacker: ev.attacker.id, target: ev.target.id, tick: ev.tick, action: ev.action.name })
        })
        c.events.on('combat.turn', ev => {
            aLogs.push({ event: 'combat.turn-1', attacker: ev.attacker.id, target: ev.target.id, turn: ev.turn })
        })
        c2.events.on('combat.action', ev => {
            aLogs.push({ event: 'combat.action-2', attacker: ev.attacker.id, target: ev.target.id, tick: ev.tick, action: ev.action.name })
        })
        c2.events.on('combat.turn', ev => {
            aLogs.push({ event: 'combat.turn-2', attacker: ev.attacker.id, target: ev.target.id, turn: ev.turn })
        })
        c.advance()
        c2.advance()
        c.advance()
        c2.advance()
        c.advance()
        c2.advance()
        c.advance()
        c2.advance()
        c.advance()
        c2.advance()
        c.advance()
        c2.advance()
        expect(aLogs).toEqual([
            { event: 'combat.turn-1', attacker: 'f1', target: 'f2', turn: 0 },
            { event: 'combat.turn-2', attacker: 'f2', target: 'f1', turn: 0 },
            {
                event: 'combat.action-1',
                attacker: 'f1',
                target: 'f2',
                tick: 2,
                action: 'claw'
            },
            {
                event: 'combat.action-1',
                attacker: 'f1',
                target: 'f2',
                tick: 5,
                action: 'claw'
            },
            {
                event: 'combat.action-2',
                attacker: 'f2',
                target: 'f1',
                tick: 5,
                action: 'bite'
            }
        ])
    })
    it('should switch to action a2 during turn 2 when defining a1 then a2', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        const c2 = new Combat()
        c2.setFighters(f2, f1)
        const a1 = {
            name: 'claw',
            conveys: [{
                script: 'damage',
                data: {}
            }],
            damage: '1d4',
            damageType: CONSTS.DAMAGE_TYPE_PHYSICAL,
            count: 2,
            data: {}
        }
        const a2 = {
            name: 'stomp',
            conveys: [{
                script: 'damage',
                data: {}
            }],
            damage: '1d6',
            damageType: CONSTS.DAMAGE_TYPE_PHYSICAL,
            count: 1,
            data: {}
        }
        c.attacker.nextAction = a1
        c2.attacker.nextAction = {
            name: 'bite',
            conveys: [{
                script: 'damage',
                data: {}
            }],
            damage: '1d6',
            damageType: CONSTS.DAMAGE_TYPE_PHYSICAL,
            count: 1
        }
        const aLogs = []
        c.events.on('combat.action', ev => {
            aLogs.push({ event: 'combat.action-1', attacker: ev.attacker.id, target: ev.target.id, tick: ev.tick, action: ev.action.name })
        })
        c.events.on('combat.turn', ev => {
            aLogs.push({ event: 'combat.turn-1', attacker: ev.attacker.id, target: ev.target.id, turn: ev.turn })
        })
        c2.events.on('combat.action', ev => {
            aLogs.push({ event: 'combat.action-2', attacker: ev.attacker.id, target: ev.target.id, tick: ev.tick, action: ev.action.name })
        })
        c2.events.on('combat.turn', ev => {
            aLogs.push({ event: 'combat.turn-2', attacker: ev.attacker.id, target: ev.target.id, turn: ev.turn })
        })
        // tick 0
        c.advance()
        c2.advance()
        // tick 1
        c.advance()
        c2.advance()
        // tick 2
        c.attacker.nextAction = a2
        c.advance()
        c2.advance()
        // tick 3
        c.advance()
        c2.advance()
        // tick 4
        c.advance()
        c2.advance()
        // tick 5
        c.advance()
        c2.advance()
        // tick 0
        c.advance()
        c2.advance()
        // tick 1
        c.advance()
        c2.advance()
        // tick 2
        c.advance()
        c2.advance()
        // tick 3
        c.advance()
        c2.advance()
        // tick 4
        c.advance()
        c2.advance()
        // tick 5
        c.advance()
        c2.advance()

        expect(aLogs).toEqual([
            { event: 'combat.turn-1', attacker: 'f1', target: 'f2', turn: 0 },
            { event: 'combat.turn-2', attacker: 'f2', target: 'f1', turn: 0 },
            {
                event: 'combat.action-1',
                attacker: 'f1',
                target: 'f2',
                tick: 2,
                action: 'claw'
            },
            {
                event: 'combat.action-1',
                attacker: 'f1',
                target: 'f2',
                tick: 5,
                action: 'claw'
            },
            {
                event: 'combat.action-2',
                attacker: 'f2',
                target: 'f1',
                tick: 5,
                action: 'bite'
            },
            { event: 'combat.turn-1', attacker: 'f1', target: 'f2', turn: 1 },
            { event: 'combat.turn-2', attacker: 'f2', target: 'f1', turn: 1 },
            {
                event: 'combat.action-1',
                attacker: 'f1',
                target: 'f2',
                tick: 5,
                action: 'stomp'
            },
            {
                event: 'combat.action-2',
                attacker: 'f2',
                target: 'f1',
                tick: 5,
                action: 'bite'
            }
        ])
    })
})

describe('selectSuitableAction', function () {
    const oItemBuilder = new ItemBuilder()
    it('select null action when fighter are fresh new creature and target is too far', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        c.distance = 30
        const a = c.getMostSuitableAction()
        expect(a).toBeNull()
    })
    it('select unarmed action action when fighter are fresh new creature and target is too at melee ranged', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        c.distance = 5
        const a = c.getMostSuitableAction()
        expect(a).toEqual({"damage": "1d3", "damageType": "DAMAGE_TYPE_PHYSICAL", "attackType": "ATTACK_TYPE_MELEE", "conveys": [], "count": 1, "name": "DEFAULT_ACTION_UNARMED"})
    })
    it('select ranged weapon when target is far', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        const bow = oItemBuilder.createItem(BLUEPRINTS["wpn-shortbow"], DATA)
        const arrow = oItemBuilder.createItem(BLUEPRINTS["ammo-arrow"], DATA)
        c.distance = 30
        f1.mutations.equipItem({ item: bow })
        f1.mutations.equipItem({ item: arrow })
        f1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(c.targetInRange).toEqual({
            melee: false,
            ranged: true,
            selected: false
        })
        // Should use a ranged weapon
        const a = c.getMostSuitableAction()
        expect(a).toEqual({
            name: 'DEFAULT_ACTION_WEAPON',
            count: 1,
            damage: '',
            damageType: "DAMAGE_TYPE_PHYSICAL",
            conveys: [],
            attackType: 'ATTACK_TYPE_ANY'
        })
    })
    it('should not be able to select weapon when target is far and having only melee weapon', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        const sword = oItemBuilder.createItem(BLUEPRINTS["wpn-shortsword"], DATA)
        c.distance = 30
        f1.mutations.equipItem({ item: sword })
        f1.mutations.setOffensiveSlot({ slot: '' })
        expect(c.targetInRange).toEqual({
            melee: false,
            ranged: false,
            selected: false
        })
        const a = c.getMostSuitableAction()
        expect(a).toBeNull()
        c.distance = 5
        const a2 = c.getMostSuitableAction()
        expect(a2).toEqual({"damage": "", damageType: "DAMAGE_TYPE_PHYSICAL", "attackType": "ATTACK_TYPE_ANY", "conveys": [], "count": 1, "name": "DEFAULT_ACTION_WEAPON"})
    })
})
