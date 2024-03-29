const Combat = require('../src/combat/Combat')
const CombatAction = require('../src/combat/CombatAction')
const Creature = require('../src/Creature')

describe ('computePlanning', function () {
    it('should return [1, 0, 0, 0, 0, 0] when planning one attack over 6 ticks', function () {
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
    it('should return [0, 0, 0, 0, 0, 1] when planning one attack over 6 ticks on reverseRound', function () {
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
    it('should send combat.action event when it is time for creature to attack and actions are defined', function () {
        const c = new Combat()
        const f1 = new Creature()
        f1.id = 'f1'
        const f2 = new Creature()
        f2.id = 'f2'
        c.setFighters(f1, f2)
        c.attacker.nextAction = new CombatAction({
            name: 'claw',
            script: 'damage',
            amp: '1d4',
            count: 2,
            data: {}
        })
        c.defender.nextAction = new CombatAction({
            name: 'bite',
            script: 'damage',
            amp: '1d6',
            count: 1,
            data: {}
        })
        const aLogs = []
        c.events.on('combat.action', ev => {
            aLogs.push({ event: 'combat.action', attacker: ev.attacker.id, target: ev.target.id, tick: ev.tick, action: ev.action })
        })
        c.events.on('combat.turn', ev => {
            aLogs.push({ event: 'combat.turn', attacker: ev.attacker.id, target: ev.target.id, turn: ev.turn })
        })
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        c.advance()
        expect(aLogs).toEqual([
            { event: 'combat.turn', attacker: 'f1', target: 'f2', turn: 0 },
            {
                event: 'combat.action',
                attacker: 'f1',
                target: 'f2',
                tick: 2,
                action: 'claw'
            },
            {
                event: 'combat.action',
                attacker: 'f1',
                target: 'f2',
                tick: 5,
                action: 'claw'
            },
            {
                event: 'combat.action',
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
        const a1 = new CombatAction({
            name: 'claw',
            script: 'damage',
            amp: '1d4',
            count: 2,
            data: {}
        })
        const a2 = new CombatAction({
            name: 'stomp',
            script: 'damage',
            amp: '1d6',
            count: 1,
            data: {}
        })
        c.attacker.nextAction = a1
        c.defender.nextAction = new CombatAction({
            name: 'bite',
            script: 'damage',
            amp: '1d6',
            count: 1,
            data: {}
        })
        const aLogs = []
        c.events.on('combat.action', ev => {
            aLogs.push({ event: 'combat.action', attacker: ev.attacker.id, target: ev.target.id, tick: ev.tick, action: ev.action })
        })
        c.events.on('combat.turn', ev => {
            aLogs.push({ event: 'combat.turn', attacker: ev.attacker.id, target: ev.target.id, turn: ev.turn })
        })
        // tick 0
        c.advance()
        c.advance()
        // tick 1
        c.advance()
        c.advance()
        // tick 2
        c.attacker.nextAction = a2
        c.advance()
        c.advance()
        // tick 3
        c.advance()
        c.advance()
        // tick 4
        c.advance()
        c.advance()
        // tick 5
        c.advance()
        c.advance()
        // tick 0
        c.advance()
        c.advance()
        // tick 1
        c.advance()
        c.advance()
        // tick 2
        c.advance()
        c.advance()
        // tick 3
        c.advance()
        c.advance()
        // tick 4
        c.advance()
        c.advance()
        // tick 5
        c.advance()
        c.advance()

        expect(aLogs).toEqual([
            { event: 'combat.turn', attacker: 'f1', target: 'f2', turn: 0 },
            {
                event: 'combat.action',
                attacker: 'f1',
                target: 'f2',
                tick: 2,
                action: 'claw'
            },
            {
                event: 'combat.action',
                attacker: 'f1',
                target: 'f2',
                tick: 5,
                action: 'claw'
            },
            {
                event: 'combat.action',
                attacker: 'f2',
                target: 'f1',
                tick: 5,
                action: 'bite'
            },
            { event: 'combat.turn', attacker: 'f1', target: 'f2', turn: 1 },
            {
                event: 'combat.action',
                attacker: 'f1',
                target: 'f2',
                tick: 5,
                action: 'stomp'
            },
            {
                event: 'combat.action',
                attacker: 'f2',
                target: 'f1',
                tick: 5,
                action: 'bite'
            }
        ])
    })
})