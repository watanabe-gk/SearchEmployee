const readline = require("readline");
const sqlite3 = require("sqlite3");
const fs = require("fs");
require("dotenv").config();

// 環境変数からデータベースファイルを取得
const DATABASE = process.env.DATABASE;
const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
const POSITIONS_TABLE = process.env.POSITIONS_TABLE;
const CACHE_FILE = process.env.CACHE_FILE;
const EMPLOYEE_POSITIONS_TABLE = process.env.EMPLOYEE_POSITIONS_TABLE;

// キャッシュ管理
const cache = {
  name: new Map(),
  years: new Map(),
};

// SQLite データベース初期化
const db = new sqlite3.Database(DATABASE, (err) => {
  if (err) {
    console.error("接続失敗：", err);
    process.exit(1);
  }
});

// CLI セットアップ
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// キャッシュロード
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      cache.name = new Map(data.name);
      cache.years = new Map(data.years);
    }
  } catch (error) {
    console.error("キャッシュロード失敗：", error);
  }
}

// キャッシュ保存
function saveCache() {
  try {
    const data = {
      name: Array.from(cache.name.entries()),
      years: Array.from(cache.years.entries()),
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (error) {
    console.error("キャッシュ保存失敗：", error);
  }
}

// 結果を出力
function printResults(rows) {
  if (rows.length === 0) {
    console.log("該当するデータは見つかりませんでした。");
    mainMenu();
    return;
  }
  rows.forEach((row) => {
    console.log(`ID: ${row.id}, 名前: ${row.name}, 入社日: ${row.hire_date}, 役職: ${row.positions}`);
  });
  mainMenu();
}

// 名前検索
function searchByName(name) {
  // 特殊文字をエスケープ
  const sanitizedInput = name.replace(/[%_]/g, (match) => `\\${match}`);

  // キャッシュ検索
  if (cache.name.has(sanitizedInput)) {
    // 結果出力
    console.log("キャッシュ結果:");
    printResults(cache.name.get(sanitizedInput));
    return;
  }
  // db検索
  const query = `
    SELECT e.id, e.name, e.hire_date, GROUP_CONCAT(p.name, ', ') AS positions
    FROM ${EMPLOYEES_TABLE} e
    LEFT JOIN ${EMPLOYEE_POSITIONS_TABLE} ep ON e.id = ep.employee_id
    LEFT JOIN ${POSITIONS_TABLE} p ON ep.position_id = p.id
    WHERE e.name LIKE ? ESCAPE '\\'
    GROUP BY e.id, e.name, e.hire_date
  `;
  db.all(query, [`%${sanitizedInput}%`], (err, rows) => {
    if (err) {
      console.error("検索失敗:", err);
      return;
    }
    // キャッシュ保存
    cache.name.set(sanitizedInput, rows);
    saveCache();
    // 結果出力
    console.log("結果:");
    printResults(rows);
    return;
  });
}

// 入社年月日検索
function searchByYears(years) {
  // 前提
  years = parseInt(years, 10);
  if (isNaN(years)) {
    console.error("数字を入力してください。");
    mainMenu();
    return;
  }

  // 日付計算
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
  const formattedDate = cutoffDate.toISOString().split("T")[0];
  // キャッシュ検索
  if (cache.years.has(years)) {
    // 結果出力
    console.log("キャッシュ結果:");
    printResults(cache.years.get(years));
    return;
  }
  // db検索
  const query = `
    SELECT e.id, e.name, e.hire_date, GROUP_CONCAT(p.name, ', ') AS positions
    FROM ${EMPLOYEES_TABLE} e
    LEFT JOIN ${EMPLOYEE_POSITIONS_TABLE} ep ON e.id = ep.employee_id
    LEFT JOIN ${POSITIONS_TABLE} p ON ep.position_id = p.id
    WHERE e.hire_date <= ?
    GROUP BY e.id, e.name, e.hire_date
  `;
  db.all(query, [formattedDate], (err, rows) => {
    if (err) {
      console.error("検索失敗:", err);
      return;
    }
    // キャッシュ保存
    cache.years.set(years, rows);
    saveCache();
    // 結果出力
    console.log("結果:");
    printResults(rows);
    return;
  });
}

// 検索メニュー
function mainMenu() {
  console.log("\n--- 操作を選択して下さい: [N]名前検索 [Y]入社年数 [Q]システム終了 ---");
  rl.question("選択: ", (choice) => {
    switch (choice.toUpperCase()) {
      // 名前検索
      case "N":
        rl.question("検索したい名前を入力して下さい", (name) => {
          searchByName(name);
        });
        break;
      // 入社年数検索
      case "Y":
        rl.question("検索したい入社年数を入力して下さい", (years) => {
          searchByYears(years);
        });
        break;
      // 終了
      case "Q":
        console.log("終了");
        rl.close();
        db.close();
        break;
      // それ以外
      default:
        console.error("選択肢にない操作です。もう一度選択して下さい。");
        mainMenu();
    }
  });
}

loadCache();
mainMenu();