/**
 * 取調室のジレンマ — ログ受け取り用 Google Apps Script
 *
 * 使い方（くわしくは README.md）
 *  1. 新しい Google スプレッドシートを作る
 *  2. 拡張機能 → Apps Script を開き、このファイルの中身を丸ごと貼り付ける
 *  3. 下の ADMIN_KEY を好きな合言葉に変える（先生用画面でデータを読むときに使う）
 *  4. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *       次のユーザーとして実行：自分
 *       アクセスできるユーザー：全員
 *  5. 表示された「ウェブアプリ URL」を config.js の GAS_URL に貼る
 */

const ADMIN_KEY = 'ここを好きな合言葉に変えてください';
const SHEET_NAME = 'log';

const HEADERS = [
  'received_at', 'session_id', 'student_id', 'attempt', 'trial',
  'character_id', 'character_name', 'choice', 'cooperate',
  'rt_ms', 'rt_first_ms', 'changed_mind', 'viewed_table',
  'partner_choice', 'partner_cooperate', 'my_years', 'partner_years',
  'comp_answer', 'comp_correct', 'button_order', 'reveal_mode', 'partner_coop_p',
  'device', 'screen', 'user_agent', 'started_at', 'trial_at', 'app_version',
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 学生のブラウザから記録を受け取る
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    const data = JSON.parse(e.postData.contents);
    const rows = (data.rows || []).slice(0, 50);
    if (!rows.length) return json_({ ok: false, error: 'no rows' });
    const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
    const values = rows.map(function (r) {
      return HEADERS.map(function (h) {
        if (h === 'received_at') return now;
        let v = r[h];
        if (v === undefined || v === null) return '';
        v = String(v).slice(0, 500);
        // 学籍番号が数式や数値として解釈されないように
        if (h === 'student_id' || h === 'session_id') v = "'" + v;
        return v;
      });
    });
    const sh = getSheet_();
    sh.getRange(sh.getLastRow() + 1, 1, values.length, HEADERS.length).setValues(values);
    return json_({ ok: true, n: values.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// 先生用画面からデータを読む（合言葉が必要）
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'ping') return json_({ ok: true });
  if (!p.key || p.key !== ADMIN_KEY) return json_({ ok: false, error: 'unauthorized' });
  const sh = getSheet_();
  const values = sh.getDataRange().getDisplayValues();
  const head = values.shift() || [];
  const rows = values.map(function (row) {
    const o = {};
    head.forEach(function (h, i) { o[h] = row[i]; });
    return o;
  });
  return json_({ ok: true, rows: rows, fetched_at: Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss') });
}

// エディタで一度実行すると、シートの準備と権限の承認ができます（任意）
function setup() {
  getSheet_();
}
