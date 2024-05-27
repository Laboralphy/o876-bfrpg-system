# Effect methods

List of supported methods.

## Methods

### init

Effect initialisation code. This method does not have common parameters. 
__Effect.data__ is often initialized here.


### Other methods common parameters

| parameter        | type            | description                                     |
|------------------|-----------------|-------------------------------------------------|
| effectProcessor  | EffectProcessor | The effect processor                            |
| effect           | BFEffect        | The current processed effect                    |
| target           | Creature        | instance of creature the effect is applied to   |
| source           | Creature        | instance of creature who has produce the effect |
| ...params        | any             | other parameters                                |

### mutate

This method is called each time the effect is processed.
- For temporary or permanent effects : this method is called each turn.
- For instant effect : this method is called when the effect is applied to its target.

_No additional parameters._

### dispose

Called when temporary or permanent effect is dispelled.

_No additional parameters._

### reject

Called when a special stacking rule is being checked, the method must return a __BOOLEAN__.

#### Additional parameters

| parameter | type     | description                                                             |
|-----------|----------|-------------------------------------------------------------------------|
| newEffect | BFEffect | The effect that is going to be applied unless this method returns true. |

#### return value

| return value         | description                                                |
|----------------------|------------------------------------------------------------|
| true                 | The new effect is rejected and cannot be applied on target |
| false                | The called effect does not reject the new effect           |

### damage

Called when a creature is damaged.

#### Additional parameters

| parameter     | type         | description                                    |
|---------------|--------------|------------------------------------------------|
| oItemProperty |              |                                                |
| type          | string       | DAMAGE_TYPE_*                                  |
| source        | Creature     | Creature who is dealing the damage effect      |
| amount        | number       | Amount of damage dealt                         |
| resisted      | number       | Amount of damage resisted                      |
| subtype       | string       | Effect subtype                                 |

