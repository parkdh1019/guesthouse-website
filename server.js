const express = require('express');
const app = express();
const PORT = 4000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./reservations.db');

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS reservations");
    db.run("CREATE TABLE reservations (id INTEGER PRIMARY KEY AUTOINCREMENT, checkin TEXT, checkout TEXT)", (err) => {
        if (err) {
            console.error('데이터베이스 테이블 생성 오류:', err.message);
        } else {
            console.log('데이터베이스 테이블이 성공적으로 생성되었습니다.');
        }
    });
});



app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/reserve', (req, res) => {
    const { checkin, checkout } = req.body;
    db.run("INSERT INTO reservations (checkin, checkout) VALUES (?, ?)", [checkin, checkout], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`예약 요청이 저장되었습니다. ID: ${this.lastID}`);
        res.send('예약 요청이 저장되었습니다.');
    });
});


app.get('/reservations', (req, res) => {
    db.all("SELECT * FROM reservations", [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});



app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});


app.post('/modify', (req, res) => {
    const { reservationId, newCheckin, newCheckout } = req.body;
    db.run("UPDATE reservations SET checkin = ?, checkout = ? WHERE id = ?", [newCheckin, newCheckout, reservationId], function(err) {
        if (err) {
            return console.error(err.message);
        }
        if (this.changes === 0) {
            res.send('해당 예약 번호를 찾을 수 없습니다.');
        } else {
            console.log(`예약 번호 ${reservationId}가 수정되었습니다.`);
            res.send(`예약 번호 ${reservationId}가 성공적으로 수정되었습니다.`);
        }
    });
});


app.post('/delete', (req, res) => {
    const { deleteReservationId } = req.body;
    db.run("DELETE FROM reservations WHERE id = ?", [deleteReservationId], function(err) {
        if (err) {
            return console.error(err.message);
        }
        if (this.changes === 0) {
            res.send('해당 예약 번호를 찾을 수 없습니다.');
        } else {
            console.log(`예약 번호 ${deleteReservationId}가 삭제되었습니다.`);
            res.send(`예약 번호 ${deleteReservationId}가 성공적으로 삭제되었습니다.`);
        }
    });
});

