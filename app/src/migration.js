const sqlite3 = require("sqlite3");
require("dotenv").config();

// 環境変数からデータベースファイルを取得
const DATABASE = process.env.DATABASE;
const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
const POSITIONS_TABLE = process.env.POSITIONS_TABLE;
const EMPLOYEE_POSITIONS_TABLE = process.env.EMPLOYEE_POSITIONS_TABLE;

// SQLite データベース初期化
const db = new sqlite3.Database(DATABASE, (err) => {
  if (err) {
    console.error("接続失敗：", err);
    process.exit(1);
  }
  console.log("接続成功");
});

db.serialize(() => {
  // positions テーブル作成（役職）
  db.run(`CREATE TABLE IF NOT EXISTS ${POSITIONS_TABLE} (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  // employees テーブル作成（従業員）
  db.run(`CREATE TABLE IF NOT EXISTS ${EMPLOYEES_TABLE} (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    hire_date TEXT NOT NULL
  )`);

  // employee_positions 中間テーブル作成（従業員と役職の関係）
  db.run(`CREATE TABLE IF NOT EXISTS ${EMPLOYEE_POSITIONS_TABLE} (
    employee_id INTEGER NOT NULL,
    position_id INTEGER NOT NULL,
    PRIMARY KEY (employee_id, position_id),
    FOREIGN KEY (employee_id) REFERENCES ${EMPLOYEES_TABLE}(id),
    FOREIGN KEY (position_id) REFERENCES ${POSITIONS_TABLE}(id)
  )`);

  // サンプルデータ（役職）
  db.get(`SELECT COUNT(*) as count FROM ${POSITIONS_TABLE}`, (err, row) => {
    if (err) {
      console.error("役職データ取得失敗:", err);
      return;
    }

    if (row.count === 0) {
      db.run(`INSERT INTO ${POSITIONS_TABLE} (name) VALUES
        ('PM'),
        ('SE'),
        ('PG'),
        ('Tester')
      `, (err) => {
        if (err) {
          console.error("役職データinsert失敗：", err);
        } else {
          console.log("役職データinsert成功");
        }
      });
    } else {
      console.log("役職データはすでにinsert済みです");
    }
  });

  // サンプルデータ（従業員）
  db.get(`SELECT COUNT(*) as count FROM ${EMPLOYEES_TABLE}`, (err, row) => {
    if (err) {
      console.error("従業員データ取得失敗:", err);
      return;
    }

    if (row.count === 0) {
      db.run(`INSERT INTO ${EMPLOYEES_TABLE} (name, hire_date) VALUES
        ('山田 太郎', '2015-06-01'),
        ('田中 花子', '2018-09-15'),
        ('佐藤 一郎', '2012-01-20'),
        ('高橋 優子', '2011-11-30'),
        ('鈴木 修', '2010-12-24'),
        ('伊藤 美咲', '2008-03-19'),
        ('渡辺 翔', '2015-05-14'),
        ('中村 理恵', '2011-03-07'),
        ('小林 大輔', '2017-02-06'),
        ('松本 由美', '2016-04-22'),
        ('長%川 元気', '2013-02-22')
      `, (err) => {
        if (err) {
          console.error("従業員データinsert失敗：", err);
        } else {
          console.log("従業員データinsert成功");
        }
      });
    } else {
      console.log("従業員データはすでにinsert済みです");
    }
  });

  // サンプルデータ（中間テーブル）
  db.get(`SELECT COUNT(*) as count FROM ${EMPLOYEE_POSITIONS_TABLE}`, (err, row) => {
    if (err) {
      console.error("中間テーブルデータ取得失敗:", err);
      return;
    }

    if (row.count === 0) {
      db.run(`INSERT INTO ${EMPLOYEE_POSITIONS_TABLE} (employee_id, position_id) VALUES
        (1, 1),
        (1, 2),
        (2, 2),
        (3, 2),
        (4, 1),
        (5, 3),
        (6, 3),
        (7, 4),
        (8, 2),
        (9, 4),
        (10, 2),
        (11, 2)
      `, (err) => {
        if (err) {
          console.error("中間テーブルデータinsert失敗：", err);
        } else {
          console.log("中間テーブルデータinsert成功");
        }
      });
    } else {
      console.log("中間テーブルデータはすでにinsert済みです");
    }
  });
});