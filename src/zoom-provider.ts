/* Copyright © 2022-2023 Seneca Project Contributors, MIT License. */


const Pkg = require('../package.json')


type ZoomProviderOptions = {
  url: string
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
    entityBuilder
  } = makeUtils({
    name: 'tangocard',
    url: options.url,
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


  entityBuilder(this, {
    provider: {
      name: 'tangocard'
    },
    entity: {
      customer: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let json: any =
                await getJSON(makeUrl('customers', msg.q), makeConfig())
              let customers = json
              let list = customers.map((data: any) => entize(data))
              return list
            },
          }
        }
      },
      brand: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let json: any =
                await getJSON(makeUrl('catalogs', msg.q), makeConfig())
              let brands = json.brands
              let list = brands.map((data: any) => entize(data))
              return list
            },
          }
        }
      },
      order: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let json: any =
                await getJSON(makeUrl('orders', msg.q), makeConfig())
              let orders = json.orders
              let list = orders.map((data: any) => entize(data))

              // TODO: ensure seneca-transport preserves array props
              list.page = json.page

              return list
            },
          },
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let body = this.util.deep(
                this.shared.primary,
                options.entity.order.save,
                msg.ent.data$(false)
              )

              let json: any =
                await postJSON(makeUrl('orders', msg.q), makeConfig({
                  body
                }))

              let order = json
              order.id = order.referenceOrderID
              return entize(order)
            },
          }
        }
      }
    }
  })


  seneca.prepare(async function(this: any) {
    let res =
      await this.post('sys:provider,get:keymap,provider:zoom')

    if (!res.ok) {
      throw this.fail('keymap')
    }

    const src = res.keymap.client_id.value + ':' + res.keymap.client_secret.value
    const auth = Buffer.from(src).toString('base64')
    this.shared.headers = {
      Authorization: 'Basic ' + auth
    }

    const accId = res.keymap.acc_id.value
    const oauthUrl =
      `oauth/token?grant_type=account_credentials&account_id=${accId}`
    const accCredentials = await postJSON(makeUrl(`${oauthUrl}`), makeConfig())

    this.shared.headers.Authorization = `Bearer ${accCredentials.access_token}`
  })


  return {
    exports: {}
  }
}


// Default options.
const defaults: ZoomProviderOptions = {

  // NOTE: include trailing /
  url: 'https://api.zoom.us/',

  // Use global fetch by default - if exists
  fetch: ('undefined' === typeof fetch ? undefined : fetch),

  entity: {
    order: {
      save: {
        // Default fields
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
