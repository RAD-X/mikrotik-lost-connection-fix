// ==UserScript==
// @name SwOS connection fix
// @description Fix connection lost error on MikroTik SwOS
// @author Alex Milenin
// @license MIT
// @version 1.0
// @include http*://*
// ==/UserScript==
(function (window, undefined) {
    if (typeof ro !== "function" || typeof ro.s !== "function" || ro.s() !== 1) {
        return;
    }
    var w = (typeof unsafeWindow !== undefined) ? unsafeWindow : window;
    if (w.self !== w.top) {
        return;
    }
    w.fetch = function (url, f) {
        if (activeReq) {
            activeReq.abort();
        }
        activeReq = newRequest();
        activeReq.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        var obj = eval('(' + this.responseText + ')');
                        if (!active) {
                            f(obj);
                        } else if(active.list || active.table) {
                            f(unpackList(obj));
                        } else {
                            f(unpack(obj));
                        }
                    } catch (e) {
                        showError("INTERNAL ERROR:" + e);
                    }
                } else if (this.status === 0) {
                    refreshTimerId = setTimeout(refresh, url.refresh);
                } else if (this.status === 401) {
                    getby("logout").style.display = "none";
                    getby("login").style.display = "inline";
                    showError("ERROR:Wrong password");
                    clear();
                } else {
                    showError("ERROR:Could not retrieve data");
                    clear();
                }
                activeReq = null;
            }
        };
        activeReq.open("GET", url, true);
        activeReq.send(null);
    };
})(window);
