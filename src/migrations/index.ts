import * as migration_20251213_045924 from './20251213_045924'

export const migrations = [
  {
    up: migration_20251213_045924.up,
    down: migration_20251213_045924.down,
    name: '20251213_045924',
  },
]
