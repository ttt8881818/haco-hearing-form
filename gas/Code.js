// ハコリノベ 水回りヒアリングフォーム（Google Apps Script）
// Webアプリとしてフォームを配信し、回答をNotionデータベースに保存する。
// NOTION_TOKEN は スクリプトプロパティ に設定する（コードには書かない）。

const NOTION_DATABASE_ID = '174bdda0a55e4c18b7590ae4825ff0b8';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('水回りヒアリングシート | ハコリノベ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// フォームから google.script.run で呼ばれる
function saveAnswer(data) {
  const token = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  if (!token) throw new Error('NOTION_TOKEN が設定されていません');

  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const properties = {
    '邸名': { title: [{ text: { content: data.projectName || '' } }] },
    'お名前': { rich_text: [{ text: { content: data.name || '' } }] },
    '回答日': { date: { start: data.date || today } },
    'フェーズ': { select: { name: '回答済み' } },
  };
  const addSelect = (key, v) => { if (v) properties[key] = { select: { name: v } }; };
  const addText = (key, v) => { if (v) properties[key] = { rich_text: [{ text: { content: v } }] }; };

  // キッチン（スタイル・希望幅はtext）
  addText('キッチン_スタイル', data.k1);
  addText('キッチン_希望幅', data.k2);
  addSelect('キッチン_コンロ種類', data.k3);
  addSelect('キッチン_コンロ口数', data.k4);
  addSelect('キッチン_グリル', data.k5);
  addSelect('キッチン_食洗機', data.k6);
  addSelect('キッチン_ホース引き出し', data.k7);
  addSelect('キッチン_自動水栓', data.k8);
  addSelect('キッチン_浄水器', data.k9);
  addSelect('キッチン_パントリー', data.k10);
  addText('キッチン_その他', data.kOther);

  // ユニットバス
  addSelect('UB_サイズ', data.u1);
  addSelect('UB_浴室暖房乾燥機', data.u2);
  addSelect('UB_ランドリーパイプ', data.u3);
  addText('UB_その他', data.uOther);

  // 洗面台（希望幅はtext）
  addSelect('洗面_ボウルタイプ', data.m1);
  addText('洗面_希望幅', data.m2);
  addSelect('洗面_収納タイプ', data.m3);
  addSelect('洗面_水栓タイプ', data.m4);
  addSelect('洗面_ホース引き出し', data.m5);
  addSelect('洗面_自動水栓', data.m6);
  addText('洗面_その他', data.mOther);

  // トイレ
  addSelect('トイレ_メーカー', data.t1);
  addSelect('トイレ_タンク', data.t2);
  addSelect('トイレ_手洗い', data.t3);
  addSelect('トイレ_自動開閉', data.t4);
  addText('トイレ_その他', data.tOther);

  const res = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token, 'Notion-Version': '2022-06-28' },
    payload: JSON.stringify({ parent: { database_id: NOTION_DATABASE_ID }, properties: properties }),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    console.error(res.getContentText());
    let msg = 'Notion APIエラー (' + code + ')';
    try { msg = JSON.parse(res.getContentText()).message || msg; } catch (e) {}
    throw new Error(msg);
  }
  return { ok: true };
}
