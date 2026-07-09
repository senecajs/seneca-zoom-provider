/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

module.exports = {
  print: false,
  pattern: 'sys:provider,provider:zoom',
  allow: { missing: true },

  calls: [
    {
      pattern: 'get:info',
      out: {
        ok: true,
        name: 'zoom',
        version: Pkg.version,
      },
    },
    {
      name: 'save_meeting',
      pattern: 'base:zoom,cmd:save,name:meeting,role:entity',
      params: {
        ent: {
          properties: {}
        }
      },
      out: {
        'entity$': '-/zoom/meeting',
      },
    },
    {
      name: 'save_scheduled_meeting',
      pattern: 'base:zoom,cmd:save,name:meeting,role:entity',
      params: {
        ent: {
          properties: {
            start_time: '2023-12-31T12:02:00',
            timezone: 'UTC'
          }
        }
      },
      out: {
        'entity$': '-/zoom/meeting',
        properties: {
          start_time: '2023-12-31T12:02:00',
          timezone: 'UTC'
        }
      },
    },
    {
      name: 'save_recurring_meeting',
      pattern: 'base:zoom,cmd:save,name:meeting,role:entity',
      params: {
        ent: {
          properties: {
            start_time: '2023-12-15T12:02:00',
            timezone: 'UTC',
            recurrence: {
              monthly_day: 30,
              repeat_interval: 1,
              type: 3
            },
            type: 8
          }
        }
      },
      out: {
        'entity$': '-/zoom/meeting',
        properties: {
          start_time: '2023-12-15T12:02:00',
          timezone: 'UTC',
          recurrence: {
            monthly_day: 30,
            repeat_interval: 1,
            type: 3
          },
          type: 8
        }
      },
    },
  ]
}
