/* Copyright © 2023-2024 Seneca Project Contributors, MIT License. */


const Pkg = require('../package.json')


type ZoomProviderOptions = {
  url_meeting: string
  update_url_meeting: string
  auth_token_url: string
  fetch: any
  entity: Record<string, any>
  debug: boolean
}


function ZoomProvider(this: any, options: ZoomProviderOptions) {
  const seneca: any = this

  const makeUtils = this.export('provider/makeUtils')

  const {
    makeUrl,
    getJSON,
    postJSON,
    deleteJSON,
    entityBuilder
  } = makeUtils({
    name: 'zoom',
    // url: options.url,
  })


  seneca
    .message('sys:provider,provider:zoom,get:info', get_info)


  const makeConfig = (config?: any) => seneca.util.deep({
    headers: {
      ...seneca.shared.headers
    }
  }, config)



  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'zoom',
      version: Pkg.version,
    }
  }
  
  function outbound(this: any, data: any) {
  }

  entityBuilder(this, {
    provider: {
      name: 'zoom'
    },
    entity: {
      meeting: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let q = msg.q || {}
              const limit = q.limit$ || 30
              let meeting = await getJSON(options.url_meeting + `?page_size=${limit}`, makeConfig())
              
              let list = meeting.meetings.map((data: any) => entize(data))
              list.page = meeting.page_size
              return list
              
            }
          },
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let ent = msg.ent
              let data = null != ent ? ent.data$(false) : {}
              let create_meeting_url = ''
              let meeting = null
              
              let update = null != ent.id
              data.start_time = 
                data.start_time instanceof Date ? data.start_time.toISOString() : data.start_time
              
              let body = data
              
              if (update) {
                 create_meeting_url = `${options.update_url_meeting}/${ent.id}`
                 
                 meeting = await fetch(create_meeting_url, {
                   method: 'PATCH',
                   headers: {
                     'Content-Type': 'application/json',
                     ...seneca.shared.headers
                   },
                   body: JSON.stringify(body),
                 })
                 
                 let get_meeting = await getJSON(create_meeting_url, makeConfig())
                 
                 meeting = seneca.util.deep(data, get_meeting)
              } else {
                create_meeting_url = options.url_meeting
                meeting = await postJSON(create_meeting_url, makeConfig({
                  body,
                }))
              }
              
              return entize(meeting)
            }
          },
          
          remove: {
            action: async function(this: any, entize: any, msg: any) {
              let ent = msg.ent || {}
              let q = msg.q || {}
              let id = null == q.id ? ( null == ent ? null : ent.id ) : q.id
              let meeting = null
              
              const delete_meeting_url = `${options.update_url_meeting}/${id}`
              const res = await fetch(delete_meeting_url, {
                method: 'DELETE',
                headers: {
                  ...seneca.shared.headers
                },
              })
              if(200 <= res.status && res.status < 300) {
                return entize(null)
              }
              return entize({})
              
              
            }
          },       
          
          
        }
      }
    }
  })
  
  async function get_access_token(this: any) {
    let url = `${options.auth_token_url}&account_id=${this.shared.primary.accountIdentifier}`
    
    const form = `${this.shared.primary.clientIdentifier}:${this.shared.primary.clientSecret}`
    const authHeader = 'Basic ' + Buffer.from(form).toString('base64');
    const { access_token } = await postJSON(url, {
      headers: {
        'Authorization': authHeader
      }
    })
    
    return access_token
  }

  seneca.prepare(async function(this: any) {
    let res =
      await this.post('sys:provider,get:keymap,provider:zoom')
    
    if (!res.ok) {
      throw this.fail('keymap')
    }
    
    this.shared.primary = {
      clientIdentifier: res.keymap.client_id.value,
      accountIdentifier: res.keymap.account_id.value,
      clientSecret: res.keymap.client_secret.value,
    }
    
    const access_token = await get_access_token.call(this)
    
    this.shared.headers = {
      "Authorization": `Bearer ${access_token}`
    }


  })


  return {
    exports: {
      sdk: () => null
    }
  }
}


// Default options.
const defaults: ZoomProviderOptions = {

  url_meeting: 'https://api.zoom.us/v2/users/me/meetings',
  update_url_meeting: 'https://api.zoom.us/v2/meetings',
  auth_token_url: 'https://zoom.us/oauth/token?grant_type=account_credentials',

  // Use global fetch by default - if exists
  fetch: ('undefined' === typeof fetch ? undefined : fetch),

  entity: {
    meeting: {
      save: {
        // 'entity$': String,
        // 'uuid': String,
        // 'id': Number,
        // 'host_id': String,
        // 'topic': String,
        // 'type': Number,
        // 'start_time': String,
        // 'duration': Number,
        // 'time_zone': String,
        // 'created_at': String,
        // 'join_url': String
      }
    }
  },

  // TODO: Enable debug logging
  debug: false
}


Object.assign(ZoomProvider, { defaults })

export default ZoomProvider

if ('undefined' !== typeof (module)) {
  module.exports = ZoomProvider
}
