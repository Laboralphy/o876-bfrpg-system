# Effect methods

List of supported methods.

## Methods

### init

ItemProperty initialisation code. __ItemProperty.data__ is often initialized here.

### damage

Called when a creature is damaged.

#### Additional parameters

| parameter    | type           | description                                      |
|--------------|----------------|--------------------------------------------------|
| itemProperty | BFItemProperty |                                                  | 
| type         | string         | DAMAGE_TYPE_*                                    |
| source       | Creature       | Creature who is dealing the damage effect        |
| amount       | number         | Amount of damage dealt                           |
| resisted     | number         | Amount of damage resisted                        |
| subtype      | string         | Effect subtype                                   |

### attacked

Called when a creature is attacked.

#### Additional parameters

| parameter     | type            | description               |
|---------------|-----------------|---------------------------|
| itemProperty  | BFItemProperty  |                           | 
| manager       | Manager         | Instance of manager       |
| attackOutcome | BFAttackOutcome | Attack outcome            |
