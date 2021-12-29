let alarmArray = [];


init();

function init() {
    fetchAlarms();
}

function addNewRow(alarm) {
    console.log(alarm);
    
    let table = document.getElementById('alarmList');

    if (!table) {
        createTable();
        table = document.getElementById('alarmList');
    }

    const tr = document.createElement("tr");

    const date = new Date(alarm.time);
    
    const h = date.getHours();
    const m = date.getMinutes();

    tr.innerHTML = `<td>${h}:${m}</td><td><button id="delete_button" onclick=deleteRow(this) data-id=${alarm.id}><img id="delete_img" src="assets/delete.png"></button></td>`;
    table.appendChild(tr);
}

function createNewAlarm() {
    const time = document.getElementById('newTime').value;

    const h = time.split(':')[0];
    const m = time.split(':')[1];

    const newTime = new Date();
    newTime.setHours(h);
    newTime.setMinutes(m);

    const timestamp = newTime.getTime();

    if (time == '') { //если ввели пустое время 
        alert("Ошибка ввода.\nНельзя ввести пустое значение.");
        return;
    }

    if (alarmArray.map(a => a.time).indexOf(timestamp) != -1) { //если в массиве уже существует такой будильник
        alert("Ошибка добавления.\nБудильник уже существует.");

        return;
    }

    for (let i = 0; i < alarmArray.length; i++) {
        if (Math.abs(timestamp - alarmArray[i].time) < 1000 * 60 * 30) {
            alert("Ошибка добавления.\nПромежуток между будильниками должен быть больше 30 минут.");

            return;
        }
    }

    fetch('/alarm', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        body: JSON.stringify({time: timestamp})
    }).then(async (response) => {
        const alarm = await response.json();

        alarmArray.push(alarm);
        addNewRow(alarm);
    })
}

function deleteRow(el) {
    let table = document.getElementById('alarmList');
    let rowInd = el.parentNode.parentNode.rowIndex;
    let alarmId = el.getAttribute('data-id');
    console.log(alarmId);

    fetch(`/alarm/${alarmId}`, {method: 'DELETE'}).then(res => {
        alarmArray.splice(rowInd-1,1);
        table.deleteRow(rowInd);
    })
}


function createTable() {
    const alarmBlock = document.getElementById('alarms');
    
    alarmBlock.innerHTML = `
        <p>
            <table id = "alarmList">
                <tbody>                    
                    <tr>
                        <td id = "time">Время</td>
                        <td id = "delete">Удалить</td>
                    </tr>
                </tbody>
            </table>
        </p>
    `
}

function setNoAlarmsText() {
    const alarmBlock = document.getElementById('alarms');
    
    alarmBlock.innerHTML = `<p>Будильников нет :(</p>`
}

function fetchAlarms() {
    fetch('/alarm', { 
        method: 'GET', 
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(async (response) => {
        const alarms = await response.json();
        console.log(alarms);

        if (alarms.length) {
            alarms.forEach(alarm => {
                addNewRow(alarm);
                alarmArray.push(alarm);
            });
        } else {
            setNoAlarmsText();
        }
    })
}