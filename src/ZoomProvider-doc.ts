/* Copyright © 2023 Seneca Project Contributors, MIT License. */

const Joi = require('@hapi/joi')

const messages = {
  get_info: {
    desc: 'Get information about the Zoom SDK.',
  },
  load_meeting: {
    desc: 'Load Meeting data into an entity.',
    examples: {},
    reply_desc: {}
  },

  save_meeting: {
    desc: 'Update/Save Meeting data into an entity.',
    examples: {},
    reply_desc: {}
  },

  list_meeting: {
    desc: 'List Meeting data into an entity.',
    examples: {},
    reply_desc: {}
  }

}

const sections = {
  /*
  intro: {
    path: '../seneca-provider/doc/intro.md'
  },

  support: {
    path: '../seneca-provider/doc/support.md'
  }
  */

}

export default {
  messages,
  sections,
}

if ('undefined' !== typeof(module)) {
  module.exports = {
    messages,
    sections,
  }
}
