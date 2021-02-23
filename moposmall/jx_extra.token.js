/**
*
    Name: 多账号京喜Token获取
    Address: https://st.jingxi.com/pingou/dream_factory/index.html?ptag=138631.26.54
    Author：MoPoQAQ
    Created: 2021/1/27 13:30
    Update: 2021/1/27 13:30

    ================
    ||  特别说明： ||
    ================
    1.获取多个京喜Token脚本，不和whyour大佬的获取脚本冲突。
    2.在获取京喜Token时，请与Cookie参数一一对应，顺序如下：野比（ck1，ck2），lxk（ck集合）
    
    ================
    ||  使用方式： ||
    ================
    ★★★ APP方式 ★★★
    1.京喜APP==>>京喜工厂==>>收取发电机电力
    2.收取成功会自动获取Token
    3.如弹窗提醒 “ 获取Token成功 ” 则正常使用，否则继续再此页面继续刷新一下试试

    ★★★ Alook浏览器方式 ★★★
    1.设置==>>通用设置==>>浏览器标识==>>移动版浏览器标识==>>自定义==>>添加自己的UA
    2.复制 https://st.jingxi.com/pingou/dream_factory/index.html?ptag=138631.26.54 到浏览器打开，收取电力一次，自动获取Token
    3.如弹窗提醒 “ 获取Token成功 ” 则正常使用，否则继续再此页面继续刷新一下试试

    ================
    ||  环境配置： ||
    ================
    [MITM]
    hostname = m.jingxi.com                                                                                                                                                                                                                                 
    【 QX 】 :
    [rewrite_local]
    ^https:\/\/m\.jingxi\.com\/dreamfactory\/generator\/CollectCurrentElectricity url script-request-header https://raw.githubusercontent.com/moposmall/Script/main/Me/jx_extra.token.js
    【Surge】:
    [Script]
    多账号获取京喜Token = type=http-request,pattern=^https:\/\/m\.jingxi\.com\/dreamfactory\/generator\/CollectCurrentElectricity,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/moposmall/Script/main/Me/jx_extra.token.js,script-update-interval=0
    【Loon】:
    [Script]
    http-request ^https:\/\/m\.jingxi\.com\/dreamfactory\/generator\/CollectCurrentElectricity tag=多账号获取京喜Token, script-path=https://raw.githubusercontent.com/moposmall/Script/main/Me/jx_extra.token.js
*
**/

const getTokenRegex = /^https:\/\/m\.jingxi\.com\/dreamfactory\/generator\/CollectCurrentElectricity/;
const $ = new Env("京喜农场Token");

const APIKey = "TokensJX";
const CacheKey = `#${APIKey}`;

if ($request) GetToken();

function getCache() {
  var cache = $.read(CacheKey) || "[]";
  $.log(cache);
  return JSON.parse(cache);
}

function GetToken() {
    try {
        if(getTokenRegex.test($request.url)) {
            const query = $request.url.match(/(apptoken.*?)&(pgtimestamp.*?)&(phoneID.*?)&/);
            const apptoken = query.split('&')[0].replace("apptoken=","");
            const pgtimestamp = query.split('&')[1].replace("pgtimestamp=","");
            const phoneID = query.split('&')[2].replace("phoneID=","");
            const userName = $request.headers['Cookie'].match(/pt_pin\=(\S*)\;/)[1];

            if( !apptoken || !pgtimestamp || !phoneID || !userName ) {
                $.msg($.name, "获取京喜Token失败", "请查看脚本说明，重新收取电力获取 ❗❗");
                $.done();
                return;
            }

            const tokenValue = JSON.JSON.stringify({ 'farm_jstoken': apptoken, 'phoneid': phoneID, 'timestamp': pgtimestamp, 'pt_pin': userName });
            const TokensData = getCache();
            const updateTokensJSON = [...TokensData];
            const updateIndex;
            const TokenName = "【账号】";
            const updateToken = TokensData.find((item, index) => {
                const Account = item ? item.pt_pin : null;
                const verify = userName === Account;
                if (verify) {
                    updateIndex = index;
                }
                return verify;
            });
            
            const tipPrefix = "";
            if (updateToken) {
                updateTokensJSON[updateIndex] = tokenValue;
                TokenName = `【账号 ${updateIndex + 1} 】`;
                tipPrefix = "更新京喜";
            } else {
                updateTokensJSON.push(tokenValue);
                TokenName = `【账号 ${updateTokensJSON.length} 】`;
                tipPrefix = "首次写入京喜";
            }
            const cacheValue = JSON.stringify(updateTokensJSON, null, "\t");
            $.write(cacheValue, CacheKey);
            $.msg($.name, `${tipPrefix} ${TokenName} Token成功🎉`);
        } else {
            $.msg($.name, "获取京喜Token失败", "请检查匹配URL或配置内脚本类型 ❗❗·");
        }
    } catch (error) {
        $.write("", CacheKey);
        $.notify("写入京喜Token失败❗❗", "", "已尝试清空历史Token, 请重试 ⚠️");
        console.log(`\n写入京喜Token出现错误 ⛔\n${JSON.stringify(error)}\n\n${error}\n\n${JSON.stringify($request.headers)}\n`);
    }
    $.done();
}

// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }