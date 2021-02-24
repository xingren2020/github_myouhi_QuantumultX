/*
国际盲盒
活动入口：京东APP首页-京东国际-国际盲盒
活动时间：2021-01-15 - 2021-02-15
因为活动助力方式，找不出比较好的方法解决助力问题，所以默认不助力直接开奖。
如果介意请别添加。
更新地址：https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_gjmh.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#国际盲盒
5 0 10-15 2 * https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_gjmh.js, tag=国际盲盒, enabled=true
================Loon==============
[Script]
cron "5 0 10-15 2 *" script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_gjmh.js, tag=国际盲盒
===============Surge=================
国际盲盒 = type=cron,cronexp="5 0 10-15 2 *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_gjmh.js
============小火箭=========
国际盲盒 = type=cron,script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_gjmh.js, cronexpr="5 0 10-15 2 *", timeout=3600, enable=true
 */
const $ = new Env('国际盲盒');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    let cookiesData = $.getdata('CookiesJD') || "[]";
    cookiesData = JSON.parse(cookiesData);
    cookiesArr = cookiesData.map(item => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
    cookiesArr.reverse();
    cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            message = '';
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            await international_mh();
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })
async function international_mh() {
    $.risk = false;
    $.jingdouNums = 0;
    await getHome();
    if (!$.risk) {
        await getTaskList();
        await doTask();
        await getHome(true, true);
        for (let i = 0; i < 3; i++) {
            await box();
            if ($.max) {
                break;
            }
            await $.wait(1000)
           
            await openBox();
        }
        await getReward();
    } else {
        return;
    }

    $.msg($.name, `本次运行共获得${$.jingdouNums}京豆`)
}
function getReward() {
    for (let vo of $.rewardBagList) {
        if (vo.hasRightOpen === 1 && vo.isOpen === 0) {
            return new Promise(resolve => {
                $.get(taskUrl_2('receiveTaskRewardBag', `{"activityCode":"lucky-box-001","id":${vo.id}}`), (err, resp, data) => {
                    try {
                        if (err) {
                            console.log(`${JSON.stringify(err)}`)
                        } else {
                            if (data) {
                                data = JSON.parse(data);
                                if (data.result.data.jingdouNums !== '') {
                                    $.jingdouNums += parseInt(data.result.data.jingdouNums);
                                }
                            }
                        }
                    } catch (e) {
                        $.logErr(e)
                    } finally {
                        resolve();
                    }
                })
            })
        }
    }
}

function box() {
    return new Promise(resolve => {
        $.get(taskUrl_2('buyBox', `{"buyType":20,"activityCode":"lucky-box-001","boxId":7}`), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.result.message === '今日购买已达上限') {
                            console.log(data.result.message);
                            $.max = true;
                            return;
                        }
                        if (data.result.message === '您当前已有未打开的盲盒!') {
                            await openBox();
                        }
                        if (data.result.code === "0") {
                            await getHome(false, true);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}
function openBox() {
    return new Promise(resolve => {
        $.get(taskUrl_2('openLuckyBox', `{"activityCode":"lucky-box-001","orderNo":"${$.boxInfo.orderNo}","openRecId":${$.boxInfo.openRecId}}`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.result.data.jingdouNums !== '') {
                            $.jingdouNums += parseInt(data.result.data.jingdouNums);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}
async function doTask() {
    let commonTaskList = $.taskList.commonTask;
    for (let vo of commonTaskList) {
        let times = vo.totalTimes - vo.executedTimes;
        for (let i = 0; i < times; i++) {
            let body = `{"taskId":${vo.taskId},"itemId":${vo.itemId},"viewSeconds":${vo.viewSeconds},"activityCode":"lucky-box-001"}`;
            console.log(`${vo.taskTypeName} - ${vo.taskName}`);
            await $.wait(vo.viewSeconds * 500)
            await taskRun(body);
            await $.wait(1000)
        }
    }
}
function taskRun(body,) {
    return new Promise(resolve => {
        $.get(taskUrl_2('taskRun', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        console.log(data.result.message);
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}
function getTaskList() {
    let body = `{"activityCode":"lucky-box-001"}`;
    return new Promise(resolve => {
        $.get(taskUrl_2('myTask', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.result.hasOwnProperty('data')) {
                            $.taskList = data.result.data;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}
function getHome(info = false, boxInfo = false) {
    let body = `{"applicationId":"27260146","activityCode":"lucky-box-001","boxId":"1"}`;
    return new Promise(resolve => {
        $.get(taskUrl_2('luckyBoxMainInfo', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.result.data.isRiskUser === 1) {
                            $.risk = true;
                            console.log('账户风控，无缘啦。');
                            return;
                        }
                        if (info) {
                            $.fragments = data.result.data.myLuckyBox.fragments;
                        }
                        if (boxInfo) {
                            $.boxInfo = data.result.data.luckyBoxList[0];
                            $.rewardBagList = data.result.data.rewardBagList;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}
function help(params) {
    let opt = {
        url: `https://api.m.jd.com/client.action?functionId=inviteHelpIndex&appid=global_mart&body={%22masterPin%22:%22OE5GdjhnenNZM2ZmZVVIcjRyaXFIUT09%22,%22orderNo%22:%2252800376110546944%22,%22orderRecId%22:%222013270%22,%22pageType%22:%22doHelp%22,%22headImg%22:%22%22,%22username%22:%22%22,%22activityCode%22:%22lucky-box-001%22}`,
        headers: {
            'Host': 'api.m.jd.com',
            'Origin': 'https://gmart.jd.com',
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'jdapp;iPhone;9.4.0;14.3;network/wifi;ADID/;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone10,3;addressid/97911903;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'Accept-Language': 'zh-cn',
            'Referer': 'https://gmart.jd.com/?appId=27260146&masterPin=OE5GdjhnenNZM2ZmZVVIcjRyaXFIUT09&orderNo=52800376110546944&orderRecId=2013270&lng=&lat=&sid=&un_area=',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': cookie,
        }
    }
    return new Promise(resolve => {
        $.get(opt, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    console.log(data);
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}
function taskUrl_2(functionId, body) {
    return {
        url: `https://api.m.jd.com/client.action?functionId=${functionId}&appid=global_mart&body=${encodeURIComponent(body)}`,
        headers: {
            'Host': 'api.m.jd.com',
            'Origin': 'https://gmart.jd.com',
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'jdapp;iPhone;9.4.0;14.3;network/wifi;ADID/;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone10,3;addressid/97911903;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'Accept-Language': 'zh-cn',
            'Referer': 'https://gmart.jd.com/?appId=27260146',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': cookie,
        }
    }
}
function taskUrl_1(functionId, body) {
    let opt = {
        url: `https://api.m.jd.com/client.action?functionId=${functionId}&body=${encodeURIComponent(body)}&screen=750*1334&client=wh5&clientVersion=1.0.0&sid=&uuid=&area=&callback=bjsonp0`,
        headers: {
            'Host': 'api.m.jd.com',
            'Origin': 'https://gmart.jd.com',
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'jdapp;iPhone;9.4.0;14.3;network/wifi;ADID/;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone10,3;addressid/97911903;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': cookie,
        }
    }
}
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
