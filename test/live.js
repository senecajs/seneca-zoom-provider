
// IMPORTANT: assumes node-fetch@2
const Fetch = fetch || require('node-fetch')

const Seneca = require('seneca')

// global.fetch = Fetch


Seneca({ legacy: false })
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
  .use('../',{
    fetch: Fetch,
  })
  .ready(async function() {
    const seneca = this

    console.log(await seneca.post('sys:provider,provider:zoom,get:info'))
    
    let meeting = seneca.entity('provider/zoom/meeting').data$({
      topic: 'My Zoom Meeting',
      type: 2, 
      start_time: new Date(),
      duration: 60
    })

    try {
      meeting = await meeting.save$()
      console.log('meeting', meeting)
    }
    catch(e) {
      console.log(e.message)
      console.log(e.status)
      console.log(e.body)
    }
    
    const meetings = await seneca.entity("provider/zoom/meeting").list$()
    console.log('meetings', meetings.length)

  })

