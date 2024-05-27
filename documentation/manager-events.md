# Manager events

## damage

### parameters

| key      | type     | description                               | example                |
|----------|----------|-------------------------------------------|------------------------|
| manager  | Manager  | instance of manager                       |                        |
| type     | string   | the dealt damage type                     | DAMAGE_TYPE_FIRE       |
| creature | Creature | the creature receiving the damage         |                        |
| source   | Creature | the creature dealing the damage           |                        |
| amount   | number   | The amount of damage taken                | 3                      |
| resisted | number   | the amount of resisted danage (not taken) | 4                      |
| subtype  | string   | the effect subtype                        | EFFECT_SUBTYPE_WEAPON  |
