/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

module.exports = {
  print: false,
  pattern: 'sys:provider,provider:zoom',
  allow: { missing: true },
  data: {
    zoom: {
      meeting: {
        m01: { id: '101', topic: "My Meeting" }
      }
    }
  },

  calls: [
    {
      name: 'get_info',
      pattern: 'get:info,provider:zoom,sys:provider',
      out: {
        ok: true,
        name: 'zoom',
        version: Pkg.version,
      },
    },

    {
      name: 'load_meeting',
      pattern: 'base:zoom,cmd:load,name:meeting,role:entity',
      params: {
        id: '101'
      },
      out: { 'entity$': '-/zoom/meeting', id: '101', topic: "My Meeting" }
    },

    {
      name: 'save_meeting',
      pattern: 'base:zoom,cmd:save,name:meeting,role:entity',
      params: {
        ent: {
          id$: '102',
          topic: "My Zoom Meeting 2"
        }

      },

      out: {
        'entity$': '-/zoom/meeting',
        id: '102',
        topic: "My Zoom Meeting 2"
      }

    },

    {
      name: 'list_meeting',
      pattern: 'base:zoom,cmd:list,name:meeting,role:entity',
      params: {},
      out: [ 
        { 'entity$': '-/zoom/meeting', id: '102', topic: "My Zoom Meeting 2" },
        { 'entity$': '-/zoom/meeting', id: '101', topic: "My Meeting" },
      ]
    },

  ]
}
