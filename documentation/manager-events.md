# Manager events

## combat.distance

Gives information about distance between an attacker and its target.

### Parameters

| Parameter          | Type          | Description                                  |
|--------------------|---------------|----------------------------------------------|
| combat             | Combat        | Instance of combat                           |
| combatManager      | CombatManager | Instance of combat manager                   |
| turn               | number        | Elapsed turns since beginning of combat      |
| tick               | number        | Number of ticks since beginning of turn      |
| attacker           | Creature      | Attacking creature                           |
| target             | Creature      | Attacker's target                            |
| distance           | number        | Current distance between attacker and target |
| previousDistance   | number        | Distance previous value                      |

## combat.move

## combat.turn

## combat.tick.end

## creature.effect-applied

## creature.effect-disposed

## combat.action

An attacker is doing a combat action.

### Parameters

| Parameter          | Type           | Description                                                                              |
|--------------------|----------------|------------------------------------------------------------------------------------------|
| combat             | Combat         | Instance of combat                                                                       |
| combatManager      | CombatManager  | Instance of combat manager                                                               |
| turn               | number         | Elapsed turns since beginning of combat                                                  |
| tick               | number         | Number of ticks since beginning of turn                                                  |
| attacker           | Creature       | Attacking creature                                                                       |
| target             | Creature       | Attacker's target                                                                        |
| action             | Action         | Attacker's action. `action.name` or `action.attackType` are the main properties to know. |
| count              | number         | Number of times the action will be applied (usually 1)                                   |

## combat.attack

## creature.saving-throw

## creature.friend-check

## creature.damage

## creature.heal 

## combat.end

The combat is over : one of the opponent has gone or is dead.

### Parameters

| Parameter          | Type           | Description                             |
|--------------------|----------------|-----------------------------------------|
| combat             | Combat         | Instance of combat                      |
| combatManager      | CombatManager  | Instance of combat manager              |
| turn               | number         | Elapsed turns since beginning of combat |
| tick               | number         | Number of ticks since beginning of turn |
| attacker           | Creature       | Attacking creature                      |
| target             | Creature       | Attacker's target                       |

