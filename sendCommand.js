const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || '';
const CREDS_DEFAULT = require('path').join(HOME, '.ps4-wake.credentials.json');
const Waker = require('ps4-waker');
const { Socket, Detector } = Waker;
const waker = new Waker(CREDS_DEFAULT);

const findPS4 = () => {
  return new Promise((resolve, reject) => {
    Detector.findFirst(() => true, { timeout: 10000 }, (err, device, rinfo) => {
      if (err) { return reject(err); }

      return resolve({ device, rinfo });
    })
  });
}

const wakeUp = () => findPS4().then(({ device, rinfo }) => {
  const ps4 = {
    address: rinfo.address,
    port: device['host-request-port'],
  }

  return new Promise((resolve, reject) => {
    waker.wake({ timeout: 10000 }, ps4, (err) => {
      if (err) { console.error(err); reject(err); }
      resolve({ device, rinfo });
    })
  })
});

const readyCommand = () =>
  new Promise((resolve, reject) => waker.readCredentials((err, creds) => {
    if (err) { return reject(err); }

    return resolve(creds);
  }));


const sendCommand = () => {
  return new Promise((resolve, reject) => {
    Promise.all([wakeUp(), readyCommand()]).then(([info, creds]) => {
      Socket({
        accountId: creds['user-credential'],
        host: info.rinfo.address,
        pinCode: ''
      }).on('ready', function () { resolve(this) }).on('error', reject)
    });
  })
}

const openTitle = title => sendCommand().then(sock => sock.startTitle(title));
const goStandby = () => sendCommand().then(sock => sock.requestStandby((err) => err && console.error(err)));

const goHome = () => new Promise((resolve, reject) => {
  sendCommand().then(sock =>
    setTimeout(() => {
      sock.remoteControl(Socket.RCKeys.PS);
      resolve();
    }, 1500)
  );
});

module.exports = {
  openTitle,
  goHome,
  wakeUp,
  goStandby,
}
