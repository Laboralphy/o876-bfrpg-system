# Immunities

## Neverwinter nights immunities

IMMUNITY_TYPE_ABILITY_DECREASE
IMMUNITY_TYPE_AC_DECREASE
IMMUNITY_TYPE_ATTACK_DECREASE
IMMUNITY_TYPE_BLINDNESS
IMMUNITY_TYPE_CHARM
IMMUNITY_TYPE_CONFUSED
IMMUNITY_TYPE_CRITICAL_HIT
IMMUNITY_TYPE_CURSED
IMMUNITY_TYPE_DAMAGE_DECREASE
IMMUNITY_TYPE_DAMAGE_IMMUNITY_DECREASE
IMMUNITY_TYPE_DAZED
IMMUNITY_TYPE_DEAFNESS
IMMUNITY_TYPE_DEATH
IMMUNITY_TYPE_DISEASE
IMMUNITY_TYPE_DOMINATE
IMMUNITY_TYPE_ENTANGLE
IMMUNITY_TYPE_FEAR
IMMUNITY_TYPE_KNOCKDOWN
IMMUNITY_TYPE_MIND_SPELLS
IMMUNITY_TYPE_MOVEMENT_SPEED_DECREASE
IMMUNITY_TYPE_NEGATIVE_LEVEL
IMMUNITY_TYPE_ALL
IMMUNITY_TYPE_PARALYSIS
IMMUNITY_TYPE_POISON
IMMUNITY_TYPE_SAVING_THROW_DECREASE
IMMUNITY_TYPE_SILENCE
IMMUNITY_TYPE_SKILL_DECREASE
IMMUNITY_TYPE_SLEEP
IMMUNITY_TYPE_SLOW
IMMUNITY_TYPE_SNEAK_ATTACK
IMMUNITY_TYPE_SPELL_RESISTANCE_DECREASE
IMMUNITY_TYPE_STUN
IMMUNITY_TYPE_TRAP

## Immunities I don't keep

| Immunity | Reason                                                                    |
|----------|---------------------------------------------------------------------------|
| IMMUNITY_TYPE_CONFUSED | Incapacitating effects are not fun                                        |
| IMMUNITY_TYPE_DAMAGE_IMMUNITY_DECREASE | Too complex                                                               |
| IMMUNITY_TYPE_DEAFNESS | No mute/deafness system                                                   |
| IMMUNITY_TYPE_DOMINATE | Incapacitating effects are not fun                                        |
| IMMUNITY_TYPE_FEAR | Incapacitating effects are not fun                                        |
| IMMUNITY_TYPE_KNOCKDOWN | No combat action that knock enemy down                                    |
| IMMUNITY_TYPE_MOVEMENT_SPEED_DECREASE | Use slow instead                                                          |
| IMMUNITY_TYPE_ALL | No use                                                                    |
| IMMUNITY_TYPE_SILENCE | Not for now                                                               |                                                |
| IMMUNITY_TYPE_SKILL_DECREASE | Not for now, too few skills, no combat skills                             |
| IMMUNITY_TYPE_SLEEP | Incapacitating effects are not fun                                        |
| IMMUNITY_TYPE_SPELL_RESISTANCE_DECREASE | Makes tactics too complex                                                 |
| IMMUNITY_TYPE_TRAP | Not so many traps, use thief                                              |
| IMMUNITY_TYPE_MIND_SPELLS | Minds spell are messing with AI, and confuses player as well as character |


## Immunities that I will keep

IMMUNITY_TYPE_ABILITY_DECREASE
IMMUNITY_TYPE_AC_DECREASE
IMMUNITY_TYPE_ATTACK_DECREASE
IMMUNITY_TYPE_BLINDNESS
IMMUNITY_TYPE_CHARM
IMMUNITY_TYPE_CRITICAL_HIT
IMMUNITY_TYPE_DAMAGE_DECREASE
IMMUNITY_TYPE_DAZED
IMMUNITY_TYPE_DEATH
IMMUNITY_TYPE_DISEASE
IMMUNITY_TYPE_ENTANGLE
IMMUNITY_TYPE_MIND_SPELLS
IMMUNITY_TYPE_NEGATIVE_LEVEL
IMMUNITY_TYPE_ALL
IMMUNITY_TYPE_PARALYSIS
IMMUNITY_TYPE_POISON
IMMUNITY_TYPE_SAVING_THROW_DECREASE
IMMUNITY_TYPE_SLOW
IMMUNITY_TYPE_SNEAK_ATTACK
IMMUNITY_TYPE_STUN

## Effect blocked

These immunities block effects whatever parameter are used.

| Immunity                       | Effect                |
|--------------------------------|-----------------------|
 | IMMUNITY_TYPE_STUN             | EFFECT_STUN           |
 | IMMUNITY_TYPE_PARALYSIS        | EFFECT_PARALYSIS      |
 | IMMUNITY_TYPE_DAZED            | EFFECT_DAZE           |
 | IMMUNITY_TYPE_BLINDNESS        | EFFECT_BLINDNESS      |
 | IMMUNITY_TYPE_CHARM            | EFFECT_CHARM          |
 | IMMUNITY_TYPE_NEGATIVE_LEVEL   | EFFECT_NEGATIVE_LEVEL |
 | IMMUNITY_TYPE_DISEASE          | EFFECT_DISEASE |

## Effects blocked when having specific data immunities

These immunities block effects with some conditions.

| Immunity                       | Effect                       | Immune if                   |
|--------------------------------|------------------------------|-----------------------------|
| IMMUNITY_TYPE_ABILITY_DECREASE | EFFECT_ABILITY_MODIFIER      | amp < 0                     |
| IMMUNITY_TYPE_AC_DECREASE      | EFFECT_ARMOR_CLASS_MODIFIER  | amp < 0                     |
| IMMUNITY_TYPE_ATTACK_DECREASE  | EFFECT_ATTACK_MODIFIER       | amp < 0                     |
| IMMUNITY_TYPE_DAMAGE_DECREASE  | EFFECT_DAMAGE_MODIFIER       | amp < 0                     |
| IMMUNITY_TYPE_DEATH            | EFFECT_DEATH                 | subtype = magical           |
| IMMUNITY_TYPE_POISON           | EFFECT_DAMAGE                | damageType = poison         |
| IMMUNITY_TYPE_SLOW | EFFECT_SPEED_FACTOR        | amp < 0 && amp > -Infinity  |
| IMMUNITY_TYPE_SAVING_THROW_DECREASE | EFFECT_SAVING_THROW_MODIFIER | amp < 0                     |
| IMMUNITY_TYPE_ENTANGLE | EFFECT_SPEED_FACTOR                 | amp = -Infinity |

## Immunities I want to implement - don't depends on effects

| Immunity | Reason                                  |
|-----|-----------------------------------------|
| IMMUNITY_TYPE_CRITICAL_HIT | No crit for BF, But in DND : undead |
| IMMUNITY_TYPE_SNEAK_ATTACK | For creature that can see 360°          |
