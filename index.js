const PORT = process.env.PORT || 3010;

const Express = require('express');
const app = Express();
const PS4 = require('ps4-waker');
const { Socket: PS4_SOCKET } = PS4;
const { openTitle, goHome, goStandby, wakeUp } = require('./sendCommand');
const apps = require('./apps');
const path = require('path');

const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
  if (req.query.apiKey !== API_KEY) {
    return res.send(401);
  }

  return next();
})

Object.keys(apps).forEach(ps4app => {
  app.get(`/${ps4app.toLowerCase()}`, (req, res) => {
    openTitle(apps[ps4app]).then(_a => res.send('done')).catch(err => res.send(err));
  })
});

app.get('/standby', (req, res) => {
  goStandby().then(_a => res.send('done')).catch(err => res.send(err));
});

app.get('/wakeUp', (req, res) => {
  wakeUp().then(_a => res.send('done')).catch(err => res.send(err));
});

app.get('/home', (req, res) => {
  goHome().then(res.send('home')).catch(err => res.send(err));
})

app.get('/', (req, res) => res.send('hi'));

app.get('/commander', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.listen(PORT, () => console.log('listening on port %d', PORT));
