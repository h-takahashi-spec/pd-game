// ===== 設定（ここだけ書き換えればOK） =====
window.PD_CONFIG = {
  // Google Apps Script の「ウェブアプリ URL」（https://script.google.com/macros/s/..../exec）
  // 空のままだと送信せず、学生の手元にCSV保存ボタンだけが出ます。
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwKsyMMVbqJbmvKxOPzX41D-u73F3SV1dgSmSgtSKjBNdKPYiX_0CMDD_UnBQsz5Cyfow/exec',

  // 相手の選択を見せるタイミング
  //   'end'  … 全員との対戦が終わったあとに、まとめて判決として見せる（推奨）
  //   'none' … 最後まで見せない
  // URL に ?reveal=none を付けると一時的に上書きできます。
  REVEAL: 'end',

  // 相手（コンピュータ側）が黙秘する確率。全キャラ共通。
  PARTNER_COOPERATE_P: 0.5,

  // 刑期（年）
  PAYOFF: { CC: 1, DC: 0, CD: 10, DD: 5 }, // CC=両方黙秘, DC=自分だけ自白, CD=自分だけ黙秘, DD=両方自白

  APP_VERSION: '1.0',
};
