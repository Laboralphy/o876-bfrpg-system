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

Indicates that a creature has moved. Provides a methode to modify distance.

### Parameters

| Parameter          | Type          | Description                                                                               |
|--------------------|---------------|-------------------------------------------------------------------------------------------|
| combat             | Combat        | Instance of combat                                                                        |
| combatManager      | CombatManager | Instance of combat manager                                                                |
| turn               | number        | Elapsed turns since beginning of combat                                                   |
| tick               | number        | Number of ticks since beginning of turn                                                   |
| attacker           | Creature      | Attacking creature                                                                        |
| target             | Creature      | Attacker's target                                                                         |
| speed              | number        | Creature's current speed                                                                  |
| factor             | number        | speed multiplier. 1 indicates no modification                                             |
| previousDistance   | number        | Distance between target and attacker before move                                          |
| distance           | function (n)  | Used to modify speed. Calling this function will override any previous speed modification |

## combat.turn

This event indicates end of a combat turn. Provides a method to choose what action to take.

### Parameters

| Parameter     | Type          | Description                                   |
|---------------|---------------|-----------------------------------------------|
| combat        | Combat        | Instance of combat                            |
| combatManager | CombatManager | Instance of combat manager                    |
| turn          | number        | Elapsed turns since beginning of combat       |
| tick          | number        | Number of ticks since beginning of turn       |
| attacker      | Creature      | Attacking creature                            |
| target        | Creature      | Attacker's target                             |
| speed         | number        | Creature's current speed                      |
| factor        | number        | speed multiplier. 1 indicates no modification |
| action        | function (n)  | Will set next action.                         |

## combat.tick.end

Will occur each combat tick.

### Parameters

| Parameter     | Type          | Description                                   |
|---------------|---------------|-----------------------------------------------|
| combat        | Combat        | Instance of combat                            |
| combatManager | CombatManager | Instance of combat manager                    |
| turn          | number        | Elapsed turns since beginning of combat       |
| tick          | number        | Number of ticks since beginning of turn       |
| attacker      | Creature      | Attacking creature                            |
| target        | Creature      | Attacker's target                             |

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

## combat.offensive-slot

Will occur each time a creature changes its offensive slot (going from melee to ranged, or ranged to melee).

### Parameters

| Parameter     | Type          | Description                             |
|---------------|---------------|-----------------------------------------|
| combat        | Combat        | Instance of combat                      |
| combatManager | CombatManager | Instance of combat manager              |
| turn          | number        | Elapsed turns since beginning of combat |
| tick          | number        | Number of ticks since beginning of turn |
| attacker      | Creature      | Attacking creature                      |
| target        | Creature      | Attacker's target                       |
| slot          | string        | New offensive equipment slot            |
| previousSlot  | string        | Previous offensive equipment slot       |
| weapon        | BFItem        | New weapon used                         |

## combat.attack

Indicated that a creature used an offensive action, but damage has not been resolved yet.

### parameters

| Parameter   | Type            | Description                                                                                                            |
|-------------|-----------------|------------------------------------------------------------------------------------------------------------------------|
| turn        | number          | Elapsed turns since beginning of combat                                                                                |
| tick        | number          | Number of ticks since beginning of turn                                                                                |
| attackIndex | number          | If the creature has several attakcs a turn, this is the nth attack                                                     |
| outcome     | BFAttackOutcome | This complex object details all what happenned during this attack, in this case the "damage" property will be 0 amount |

### Types

#### BFAttackOutcome

```js
/**
 * @typedef BFAttackOutcome {object}
 * @property ac {number}
 * @property bonus {number}
 * @property critical {boolean}
 * @property distance {number}
 * @property hit {boolean}
 * @property range {number}
 * @property roll {number}
 * @property attacker {Creature}
 * @property target {Creature}
 * @property weapon {BFItem}
 * @property ammo {BFItem}
 * @property action {BFStoreStateAction}
 * @property kill {boolean}
 * @property failed {boolean}
 * @property failure {string}
 * @property sneakable {boolean}
 * @property damages {BFAttackOutcomeDamages}
 */
```


#### BFAttackOutcomeDamages

```js
/**
 * @typedef BFAttackOutcomeDamages {object}
 * @property amount {number}
 * @property resisted {object<string, number>}
 * @property types {object<string, number>}
 */
```

## combat.attack.damaged

Indicated that a creature used an offensive action, and hit and Damage has been resolved.
This event does not occurs if attack misses.

### parameters

| Parameter   | Type            | Description                                                                                                               |
|-------------|-----------------|---------------------------------------------------------------------------------------------------------------------------|
| turn        | number          | Elapsed turns since beginning of combat                                                                                   |
| tick        | number          | Number of ticks since beginning of turn                                                                                   |
| attackIndex | number          | If the creature has several attakcs a turn, this is the nth attack                                                        |
| outcome     | BFAttackOutcome | This complex object details all what happenned during this attack, in this case the "damage" property reflect damage done |

### Types

#### BFAttackOutcomeDamages

```js
/**
 * @typedef BFAttackOutcomeDamages {object}
 * @property amount {number}
 * @property resisted {object<string, number>}
 * @property types {object<string, number>}
 */
```

## creature.death

This event occurs when a creature's HP drop down to 0.

### parameters

| Parameter       | Type      | Description                       |
|-----------------|-----------|-----------------------------------|
| creature        | Creature  | Creature instance                 |
| manager         | Manager   | instance of manager               |

## creature.saving-throw

### PArameters

| Parameter   | Type      | Description                                |
|-------------|-----------|--------------------------------------------|
| creature    | Creature  | Creature instance                          |
| manager     | Manager   | instance of manager                        |
| savingThrow | string    | Saving throw type SAVING_THROW_*           |
| success     | boolean   | If true then ST is success                 |
| ability     | string    | ABILITY_* involve in ST modification       |
| dc          | number    | numerical difficulty                       |
| roll        | number    | Die rolled                                 |
| bonus       | number    | Bonus or malus applied to roll             |
| total       | number    | roll + bonus                               |
| adjustment  | number    | dc adjustment                              |

## creature.friend-check

This event occurs when the manager needs to know if a creature may attack another.
For example: if a creature is charmed by a sorcerer, the creature shall not attack the sorcerer.
This event is exploited by client App with a reputation/faction system

### parameters

| Parameter     | Type       | Description                                                       |
|---------------|------------|-------------------------------------------------------------------|
| manager       | Manager    | Instance of Manager                                               |
| creature      | Creature   | Attacking Creature instance                                       |
| target        | Creature   | Target Creature instance                                          |
| preventAttack | function   | If called by event handler, the creature attack will be cancelled |

## creature.damage

This event is fired when a creature is damaged.

### Parameters

| Parameter  | Type       | Description                         |
|------------|------------|-------------------------------------|
| manager    | Manager    | Instance of Manager                 |
| creature   | Creature   | Damaged Creature instance           |
| damageType | string     | Damage Element type (fire, cold...) |
| source     | Creature   | creature who dealth the damage      |
| subtype    | string     | effect sub type                     |
| amount     | number     | number of damage points dealt       |
| resisted   | number     | number of damage points resisted    |


## creature.heal 

This event is fired when a creature is healed.

### Parameters

| Parameter  | Type     | Description                 |
|------------|----------|-----------------------------|
| manager    | Manager  | Instance of Manager         |
| creature   | Creature | Damaged Creature instance   |
| amount     | number   | amount of hp restored       |
| factor     | number   | amount multiplier from base |
| baseAmount | string   | base amount of healing      |


## combat.end

The combat is over : one of the opponent has gone or is dead.

### Parameters

| Parameter     | Type          | Description                                       |
|---------------|---------------|---------------------------------------------------|
| combat        | Combat        | Instance of combat                                |
| combatManager | CombatManager | Instance of combat manager                        |
| turn          | number        | Elapsed turns since beginning of combat           |
| tick          | number        | Number of ticks since beginning of turn           |
| attacker      | Creature      | Attacking creature                                |
| target        | Creature      | Attacker's target                                 |
| victory       | boolean       | If true then attacker has killed target           |
| defeat        | boolean       | If true then attacker has been killed by target   |

## creature.effect.applied

Occurs when a effect is applied to a creature.

### parameters

| Parameter | Type     | Description                             |
|-----------|----------|-----------------------------------------|
| manager   | Manager  | Instance of Manager                     |
| effect    | BFEffect | The applied effect                      |
| target    | Creature | Creature on which the effect is applied |
| source    | Creature | Creature which produced the effect      |

### Types

#### BFEffect

| Property    | Type   | Description                                                                     |
|-------------|--------|---------------------------------------------------------------------------------|
| type        | string | Effect type : EFFECT_* constant group                                           |
| amp         | number | Effect amplitude, usually a number, sometimes a die-expression like 1d4, or 2d6 |
| subtype     | string | Effect subtype, EFFECT_SUBTYPE_*                                                |
| data        | object | Object which content varies greatly according to effect type                    |


## creature.effect.disposed

Occurs when a effect removed from a creature. Either this effect has been dispelled or its duration dropped down to 0.

### parameters

| Parameter | Type     | Description                                 |
|-----------|----------|---------------------------------------------|
| manager   | Manager  | Instance of Manager                         |
| effect    | BFEffect | The removed effect                          |
| target    | Creature | Creature on which the effect is running out |
| source    | Creature | Creature which produced the effect          |

## creature.effect.immunity

Triggered when an effect is rejected because creature is immune to that effect

### Parameters

| Parameter | Type     | Description                             |
|-----------|----------|-----------------------------------------|
| manager   | Manager  | Instance of Manager                     |
| effect    | BFEffect | The rejected effect because of immunity |
| target    | Creature | Immune Creature                         |


## creature.roll-skill

Occurs when a creature is rolling a dice to check its skills

### Parameters

| Parameter  | Type     | Description                                |
|------------|----------|--------------------------------------------|
| manager    | Manager  | Instance of Manager                        |
| creature   | Creature | Instance of Creature rolling the skill     |
| skill      | string   | skill involved                             |
| skillValue | number   | skill numeric value                        |
| difficulty | number   | context adjustment (positive means harder) |
| roll       | number   | rolledd value                              |
| success    | boolean  | if true then the roll is a success         |

