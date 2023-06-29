// pg-poolパッケージの内容を定数Poolに入れる。
// 定数がオブジェクトまたは配列であった場合、そのプロパティやアイテムは更新したり削除したりすることができます。
const Pool = require('pg').Pool

// puppeteer-extraパッケージの内容を定数puppeteerに入れる。
const puppeteer = require("puppeteer-extra");

// puppeteer-extra-plugin-stealthパッケージの内容を定数StealthPluginに入れる。
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// user-agent-overrideパッケージの内容を定数UserAgentOverrideに入れる。
const UserAgentOverride = require("puppeteer-extra-plugin-stealth/evasions/user-agent-override");

// StealthPlugin関数呼び出し、実行結果を定数stealthに入れる。
const stealth = StealthPlugin();

// 自分設定したUser-Agentを使用しますので、puppeteer-extra-plugin-stealthパッケージのuser-agent-override機能を無効化します。
stealth.enabledEvasions.delete("user-agent-override");

// puppeteer-extra-plugin-stealthプラグインを使用
puppeteer.use(stealth);

// PosgreSQLのコネクションPoolを初期化して、定数poolに入れる
//コネクションプーリングを用いると、一度確立されたコネクションは使用後に切断せずコネクションプールと呼ばれる待機場所に移され、次にアクセスする際に呼び出されて再び使われる。コネクションはあらかじめ設定された上限数まで生成されると、それ以上は作られずにプールにある空いたコネクションのみを使用する。
const pool = new Pool({
  host: "b3s4kilhdpywgzouusoe-postgresql.services.clever-cloud.com",
  port: 5432,
  database: "b3s4kilhdpywgzouusoe",
  user: "uitf9bi84jffr8zfrfjx",
  password: "v4MccqYFLIMlWrTQxMqixYa5Mxfs8B",
  max: 1, 
});

// 非同期関数(async function)appを定義する
// 非同期処理はコードを順番に処理していきますが、ひとつの非同期処理が終わるのを待たずに次の処理を評価します。 つまり、非同期処理では同時に実行している処理が複数あります。
async function app() {
  const ua = UserAgentOverride({
    // User-Agentとlocaleを設定する
    // ユーザーエージェント（User Agent：UA）は、「ネット利用者が使用しているOS・ブラウザ」のことを指す。一般的なインターネットブラウザを使い、HTTPに基づきサイトなどにアクセスした際には、ユーザーエージェントに関する各種情報が、相手側に通知される仕組みとなっている。
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      // 言語コードを日本語に設定
      locale: "ja-JP,ja",
  });
  // 設定したUser-Agentとlocaleを使用する
  puppeteer.use(ua);

  // Browser(Chrome)を起動する
  // awaitは非同期関数内の結果が返されるまで待機する。
  const browser = await puppeteer.launch({
    // 画面を表示しない
    headless: true,
    defaultViewport: null,
  });
  // 新しいのTabを起動
  const page = await browser.newPage();
  // https://www.udemy.com/courses/development/?price=price-free&sort=newestへ移動
  await page.goto(
    "https://www.udemy.com/courses/development/?price=price-free&sort=newest",
    { waitUntil: "networkidle0" }
  );

  // コース名を取得
  // const result = await page.evaluate(() => {
  //   return Promise.resolve(8 * 7);
  // });
  // console.log(result); //  "56"
  // 指定のページにおいて関数を評価し、その結果を返します
  const names = await page.evaluate(() => {
    return Array.from(
      //引数にCSSのセレクタを指定しNodeList(複数の要素)を取得します。一致するものがない場合は、空のNodeListを返します。
      document.querySelectorAll(".course-card--course-title--vVEjC")
    ).map((x) => x.textContent);
    // const array1 = [1, 4, 9, 16];
    // const map1 = array1.map(x => x * 2);
    // console.log(map1); // Array [2, 8, 18, 32]
    // console.log(Array.from([1, 4, 9, 16]).map(x => x * 2));
    // <h3 data-purpose="course-title-url" class="ud-heading-md course-card--course-title--vVEjC"><a href="/course/learning-ai/">みんなのAI講座 ゼロからPythonで学ぶ人工知能と機械学習 【2023年最新版】<div class="ud-sr-only" aria-hidden="true"><span data-purpose="seo-headline">【Google Colaboratory対応】初心者向けの人工知能と機械学習のコースです。プログラミング言語Pythonを使って、機械学習とプログラミングの基礎、必要な数学を勉強しましょう！文字認識や株価分析なども行います。</span><span data-purpose="seo-rating">評価: 4.3（5段階中）</span><span data-purpose="seo-num-reviews">11723件のレビュー</span><span data-purpose="seo-content-info">合計9時間</span><span data-purpose="seo-num-lectures">レクチャーの数: 63</span><span data-purpose="seo-instructional-level">初級</span><span data-purpose="seo-current-price">現在の価格: ￥3,000</span><span data-purpose="seo-original-price">元の価格: ￥15,800</span></div></a></h3>
  });
  // 画像を取得
  const images = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".course-card--course-image--3QvbQ")
    ).map((image) => image.getAttribute(`src`));
  });
  // コース名と対応する画面を取得
  for (let i = 0; i < names.length; i++) {
    // i番目のコースを対応するのはi番目の画像
    pool.query('INSERT INTO udemy (name, image) VALUES ($1, $2)', [names[i], images[i]], (error, results) => {
      if (error) {
        throw error
      }
    })
  }
  await browser.close();
}
app();
