const express =require('express')
const ReactSSR = require('react-dom/server')
const app = express()
const jsdom = require('rs-jsdom').rsJsdom

global.document = jsdom('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
const serverEntry = require('../dist/server-entry').default
global.window = document.defaultView
global.navigator = window.navigator
global.location = window.location
global.history = window.history
global.sessionStorage = window.sessionStorage
app.get('*', (req, res) => {
  const appStr = ReactSSR.renderToString(serverEntry)
  res.send(appStr)
})

app.listen(2333, () => {
  console.log('server is listening on 2333')
})