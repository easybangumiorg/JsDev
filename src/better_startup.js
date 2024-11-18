// @key ayala.sbr
// @label 更好的起始源
// @versionName 1.1
// @versionCode 1
// @libVersion 11

// 公共代码开始 ========================================
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okHttpHelper = Inject_OkhttpHelper;
var webViewHelperV2 = Inject_WebViewHelperV2;
var stringHelper = Inject_StringHelper;

var plugin = {
    debug_mode: preferenceHelper.get("ayala.sbr.debug", false),
    debug_server: "http://192.168.0.108:3000",
    preferences: new ArrayList(),
    is_init: false,
    pagemap: new HashMap(),
    page(name, callback) {
        this.pagemap.put(name, {
            page: null,
            callback: callback,
            subtab: null,
            index: this.pagemap.keySet().size()
        });
    },
    _getMainTabs() {
        this.log.i("plugin._getMainTabs", "获取所有页面");
        var tabs = new ArrayList();
        this.pagemap.keySet().forEach(tab => {
            tabs.add(this._checkSubTab(tab));
        })
        tabs.sort((a, b) => a.index - b.index);
        var main_tabs = new ArrayList();
        tabs = tabs.forEach(tab => main_tabs.add(tab.page));
        return main_tabs;
    },
    _checkSubTab(mainTabLabel) {
        var page = this.pagemap.get(mainTabLabel);
        if (page.subtab == null) {
            this.log.i("plugin._checkSubTab", "计算子页面：" + mainTabLabel);
            var tab = {
                type: 'none',
                content: new HashMap(),
                only(callback) {
                    this.type = 'only';
                    this.content = callback;
                },
                subpage(name, index, is_active, callback) {
                    if (this.type == 'only') {
                        this.log.w("plugin._checkSubTab", "页面已被设置为only，将跳过设置subpage：" + mainTabLabel);
                        return
                    };
                    this.type = 'pages';
                    this.content.put(name, {
                        name: name,
                        callback: callback,
                        index: index,
                        is_active: is_active
                    });
                }
            }
            page.callback(tab);
            page.subtab = tab;
            if (page.subtab.type == 'none')
                this.log.e("plugin._checkSubTab", "页面未设置tab，这将导致在后续的过程中报错：" + mainTabLabel);
            if (page.subtab.type == 'pages')
                page.page = new MainTab(mainTabLabel, MainTab.MAIN_TAB_GROUP);
            if (page.subtab.type == 'only')
                page.page = new MainTab(mainTabLabel, MainTab.MAIN_TAB_WITH_COVER);
            this.pagemap.put(mainTabLabel, page);
        }
        return page
    },
    _getSubTabs(mainTab) {
        var page = this._checkSubTab(mainTab.label);
        switch (page.subtab.type) {
            case 'pages':
                var tabs = new ArrayList();
                page.subtab.content.keySet().forEach(key => {
                    var value = page.subtab.content.get(key);
                    tabs.add(new SubTab(value.name, value.is_active, value.index));
                })
                tabs.sort((a, b) => a.ext - b.ext);
                return tabs;
            default:
                return new ArrayList();
        }
    },
    _getContent(mainTab, subTab, page) {
        var page = this._checkSubTab(mainTab.label);
        switch (page.subtab.type) {
            case 'only':
                this.log.i("plugin._getContent", "获取页面内容：" + mainTab.label);
                return page.subtab.content(page);
            case 'pages':
                this.log.i("plugin._getContent", "获取页面内容：" + mainTab.label + " - " + subTab.label);
                var subTab = page.subtab.content.get(subTab.label);
                return subTab.callback(page);
        }
        return new Pair(null, new ArrayList());
    },
    log: {
        lograw(object) {
            if (plugin.debug_mode) {
                var debug_server = preferenceHelper.get("ayala.sbr.devServer", plugin.debug_server);
                var client = okHttpHelper.client
                var requestBody = RequestBody.create(
                    MediaType.get('application/json; charset=utf-8'),
                    JSON.stringify(object));
                var request = new Request.Builder()
                    .url(debug_server + "/log")
                    .post(requestBody)
                    .build();
                var response = client.newCall(request).execute();
                var responseBody = response.body().string();
                return responseBody;
            }
        },
        i(label, msg) {
            JSLogUtils.i(label, JSON.stringify(msg));
            return this.lograw({
                level: "info",
                label: label,
                msg: msg,
            });
        },
        w(label, msg) {
            JSLogUtils.w(label, JSON.stringify(msg));
            return this.lograw({
                level: "warn",
                label: label,
                msg: msg,
            });
        },
        e(label, msg) {
            JSLogUtils.e(label, JSON.stringify(msg));
            return this.lograw({
                level: "error",
                label: label,
                msg: msg,
            });
        },
    }
}

// 何言说了，插件生命周期之后提供，那么我们就在这里初始化
plugin.is_init = (function () {
    context.preferences.add(new SourcePreference.Switch(
        "调试模式",
        "ayala.sbr.debug",
        false
    ))
    context.preferences.add(new SourcePreference.Edit(
        "调试服务器地址",
        "ayala.sbr.devServer",
        plugin.debug_server
    ))
    return true;
})();

function PreferenceComponent_getPreference() {
    return plugin.preferences;
}

function PageComponent_getMainTabs() {
    return plugin._getMainTabs();
}

function PageComponent_getSubTabs(mainTab) {
    return plugin._getSubTabs(mainTab);
}

function PageComponent_getContent(mainTab, subTab, page) {
    return plugin._getContent(mainTab, subTab, page);
}

// 项目代码开始 ========================================
plugin.preferences.add(new SourcePreference.Edit(
    "目标地址",
    "ayala.sbr.url",
    "https://sbr.ayala.workers.dev"
))

plugin.page("首页", tab => {
    tab.only(page => {
        stringHelper.toast("首页开始加载")
        return new Pair(null, new ArrayList());
        // return getHome(page);
    })
})

plugin.page("排期", tab => {
    var weekLabel = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    weekLabel.forEach((label, index) => {
        tab.subpage(label, index, true, page => {
            return new Pair(null, new ArrayList());
            // return getTimeLine(index, page);
        })
    })
})
