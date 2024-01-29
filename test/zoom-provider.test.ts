/* Copyright © 2023 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

// const Fetch = require('node-fetch')


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import ZoomProvider from '../src/zoom-provider'
import ZoomProviderDoc from '../src/ZoomProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Only run some tests locally (not on Github Actions).
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}


describe('zoom-provider', () => {

  test('happy', async () => {
    expect(ZoomProvider).toBeDefined()
    expect(ZoomProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(await seneca.post('sys:provider,provider:zoom,get:info'))
      .toMatchObject({
        ok: true,
        name: 'zoom',
      })
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
  })


  test('list-brand', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/zoom/brand").list$()
    // console.log('BRANDS', list)

    expect(list.length > 0).toBeTruthy()
  })

})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    /*
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $ZOOM_KEY: String,
        $ZOOM_NAME: String,
        $ZOOM_CUSTID: String,
        $ZOOM_ACCID: String,
      }
    })
    .use('provider', {
      provider: {
        zoom: {
          keys: {
            key: { value: '$ZOOM_KEY' },
            name: { value: '$ZOOM_NAME' },
            cust: { value: '$ZOOM_CUSTID' },
            acc: { value: '$ZOOM_ACCID' },
          }
        }
      }
    })
    .use(ZoomProvider, {
      // fetch: Fetch,
    })
    */

  return seneca.ready()
}

