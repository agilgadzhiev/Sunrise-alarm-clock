const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

initAlarms();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use(bodyParser.json())
app.use(express.static(__dirname + '/'));

app.get('/', (_, res) => {
  res.sendFile(__dirname + "/index.html");
})

app.get('/alarm', (req, res) => {
  readAlarms().then((data) => {
    res.send(data || []);
  }).catch(err => {
    res.status(500).json(err)
  })
})

app.post('/alarm', async (req, res) => {
  let alarms = await readAlarms();

  const alarm = req.body;
  const alarmDate = new Date(alarm.time);
  alarmDate.setSeconds(0);
  alarmDate.setMilliseconds(0);
  alarm.time = alarmDate.getTime();

  if (alarms) {
    alarms = JSON.parse(alarms);
    alarms.push({id: alarms.length, ...alarm})
  }
  else alarms = [{id: 0, ...alarm}];

  setAlarms(alarms).then(() => {
    initAlarm(alarm);

    res.send({id: alarms.length - 1, ...alarm});
  }).catch(err => {
    res.status(500).json(err)
  })
})

app.delete('/alarm/:id', async (req, res) => {
  const alarmId = req.params.id;
  console.log(alarmId);

  let alarms = JSON.parse(await readAlarms());
  
  const toDelete = alarms.find(a => a.id == alarmId);
  console.log(toDelete);

  if (toDelete) {
    alarms = alarms.filter(a => a.id !== toDelete.id);

    setAlarms(alarms).then(() => {
      res.sendStatus(200);
    }).catch(err => {
      res.sendStatus(500).json(err)
    })
  }
})

function readAlarms() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, '../alarms.json'), 'utf8', (err, data) => {
      err ? reject(err) : resolve(data)
    });
  })
}

function setAlarms(alarms) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname, '../alarms.json'), JSON.stringify(alarms), err => {
      err ? reject(err) : resolve()
    });
  })
}
 
async function initAlarms() {
  let alarms = await readAlarms();

  if (alarms) {
    alarms = JSON.parse(alarms);

    alarms.forEach(alarm => {
      initAlarm(alarm);
    })
  } else 
    console.log('alarms not finded')
}

function initAlarm(alarm) {
  const inTime = alarm.time - Date.now() - 1000 * 60 * 30;

  if (inTime > 0) {
    console.log(`set alarm in time ${inTime}`);

    setTimeout(() => {

      exec(`python3 /home/pi/ws2801_example.py`,
      (error, stdout, stderr) => {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
              console.log(`exec error: ${error}`);
          }
      });

      console.log('alarm!!!');
      
    }, inTime);
  }
}
