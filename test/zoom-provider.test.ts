/* Copyright © 2023 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

// const Fetch = require('node-fetch')


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const { Maintain } = require('@seneca/maintain')

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

  test('maintain', Maintain)

  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
  })

  test('save-meeting', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    let save0 = await seneca.entity("provider/zoom/meeting").save$({
      topic: 'My Zoom Meeting',
      type: 2, 
      start_time: new Date(),
      duration: 60
    })
    
    expect(save0.topic === 'My Zoom Meeting'
      && save0.duration === 60).toBeTruthy()
    
    save0 = await seneca.entity("provider/zoom/meeting").save$({
      id: save0.id,
      topic: 'Updated Zoom Meeting',
      type: 2, 
      start_time: new Date(),
      duration: 30
    })
    
    expect(save0.topic === 'Updated Zoom Meeting'
      && save0.duration === 30).toBeTruthy()
      
    let remove0 = await seneca.entity("provider/zoom/meeting").remove$({
      id: save0.id,
    })
    // console.log('remove0: ', remove0)
    // console.log('MEETING: ', save0)
    
  })
  
  test('load-meeting', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()
    let save0 = await seneca.entity("provider/zoom/meeting").data$({
      topic: 'My Zoom Meeting 2',
      type: 2, 
      start_time: new Date(),
      duration: 30
    }).save$()
    let load0 = await seneca.entity("provider/zoom/meeting").load$(save0.id)
    load0.start_time = new Date()
    load0.duration = 10
    await load0.save$()
    // console.log('load0: ', load0)
  })
  
  test('remove-meeting', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()
    
  })

  test('list-meeting', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/zoom/meeting").list$()
    
    // console.log("LIST: ", list)

    expect(list.length > 0).toBeTruthy()
  })

})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $ZOOM_CLIENT_SECRET: String,
        $ZOOM_ACCOUNT_ID: String,
        $ZOOM_CLIENT_ID: String,
      }
    })
    .use('provider', {
      provider: {
        zoom: {
          keys: {
            client_secret: { value: '$ZOOM_CLIENT_SECRET' },
            account_id: { value: '$ZOOM_ACCOUNT_ID' },
            client_id: { value: '$ZOOM_CLIENT_ID' }
          }
        }
      }
    })
    .use(ZoomProvider, {
      // fetch: Fetch,
    })
    

  return seneca.ready()
}

