const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;

// 允許跨域 & 當靜態資料夾
app.use(cors());
app.use(express.static(path.join(__dirname)));

//
// ← 下面這段改成你本機 Downloads 的路徑
//
const dbPath = 'C:\\Users\\fat\\Downloads\\sqlite.db';
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('SQLite 連線失敗：', err.message);
    } else {
        console.log('已連線到', dbPath);
    }
});

// API 路由
app.get('/api/prices', (req, res) => {
    db.all('SELECT date, price, cpi FROM blackteacpi ORDER BY date', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 啟動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
