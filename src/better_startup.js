// @key ayala.better_startup
// @label 更好的起始源
// @versionName 1.3
// @versionCode 4
// @libVersion 11

// 公共代码开始 ========================================
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okHttpHelper = Inject_OkhttpHelper;
var webViewHelperV2 = Inject_WebViewHelperV2;
var stringHelper = Inject_StringHelper;

function BetterPlugin(dev_config) {
    var preferences = new ArrayList();
    var pagemap = new HashMap();
    var onBeforePreference_hooks = [];
    var onBeforePreference_ready = false;
    var onBeforeMainTab_hooks = [];
    var onBeforeMainTab_ready = false;

    preferences.add(new SourcePreference.Switch(
        "调试模式",
        "ayala.better_startup.debug",
        dev_config.debug_mode
    ));

    preferences.add(new SourcePreference.Edit(
        "调试服务器地址",
        "ayala.better_startup.devServer",
        dev_config.debug_server
    ))

    var log = {
        raw(object) {
            if (preferenceHelper.get("ayala.better_startup.debug", dev_config.debug_mode) == 'true') {
                var debug_server = preferenceHelper.get("ayala.better_startup.devServer", dev_config.debug_server);
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
            return this.raw({
                level: "info",
                label: label,
                msg: msg,
            });
        },
        w(label, msg) {
            JSLogUtils.w(label, JSON.stringify(msg));
            return this.raw({
                level: "warn",
                label: label,
                msg: msg,
            });
        },
        e(label, msg) {
            JSLogUtils.e(label, JSON.stringify(msg));
            return this.raw({
                level: "error",
                label: label,
                msg: msg,
            });
        },
        stackTrace(label, error) {
            return this.raw({
                level: "error",
                label: label,
                msg: error.message + '\n' + error.stack,
            });
        }
    }

    function checkSubTab(mainTabLabel) {
        var page = pagemap.get(mainTabLabel);
        if (page.subtab == null) {
            log.i("plugin._checkSubTab", "计算子页面：" + mainTabLabel);
            var tab = {
                type: 'none',
                content: new HashMap(),
                only(callback) {
                    this.type = 'only';
                    this.content = callback;
                },
                subpage(name, index, is_active, callback) {
                    if (this.type == 'only') {
                        log.w("plugin._checkSubTab", "页面已被设置为only，将跳过设置subpage：" + mainTabLabel);
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
                log.e("plugin._checkSubTab", "页面未设置tab，这将导致在后续的过程中报错：" + mainTabLabel);
            if (page.subtab.type == 'pages')
                page.page = new MainTab(mainTabLabel, MainTab.MAIN_TAB_GROUP);
            if (page.subtab.type == 'only')
                page.page = new MainTab(mainTabLabel, MainTab.MAIN_TAB_WITH_COVER);
            pagemap.put(mainTabLabel, page);
        }
        return page
    }

    return {
        log: log,
        onBeforePreference(hook) {
            onBeforePreference_hooks.push(hook);
        },
        onBeforeMainTab(hook) {
            onBeforeMainTab_hooks.push(hook);
        },
        page(name, callback) {
            pagemap.put(name, {
                page: null,
                callback: callback,
                subtab: null,
                index: pagemap.keySet().size()
            });
        },
        _onBeforePreference() {
            if (onBeforePreference_ready) return;
            onBeforePreference_hooks.forEach(hook => hook(preferences));
            onBeforePreference_ready = true;
        },
        _getPreference: () => preferences,
        _onBeforeMainTab() {
            if (onBeforeMainTab_ready) return;
            onBeforeMainTab_hooks.forEach(hook => hook());
            onBeforeMainTab_ready = true;
        },
        _getMainTabs() {
            log.i("plugin._getMainTabs", "获取所有页面");
            var tabs = new ArrayList();
            pagemap.keySet().forEach(tab => {
                tabs.add(checkSubTab(tab));
            })
            tabs.sort((a, b) => a.index - b.index);
            var main_tabs = new ArrayList();
            tabs = tabs.forEach(tab => main_tabs.add(tab.page));
            return main_tabs;
        },
        _getSubTabs(mainTab) {
            var page = checkSubTab(mainTab.label);
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
            var page = checkSubTab(mainTab.label);
            switch (page.subtab.type) {
                case 'only':
                    log.i("plugin._getContent", "获取页面内容：" + mainTab.label);
                    return page.subtab.content(page);
                case 'pages':
                    log.i("plugin._getContent", "获取页面内容：" + mainTab.label + " - " + subTab.label);
                    var subTab = page.subtab.content.get(subTab.label);
                    return subTab.callback(page);
            }
            return new Pair(null, new ArrayList());
        },
    }
}

var plugin = BetterPlugin({
    // 默认调试配置，以纯纯看番内设置为准
    debug_mode: false,
    debug_server: "http://192.168.0.108:3000",
});

function PreferenceComponent_getPreference() {
    plugin._onBeforePreference();
    return plugin._getPreference();
}

function PageComponent_getMainTabs() {
    plugin._onBeforeMainTab();
    return plugin._getMainTabs();
}

function PageComponent_getSubTabs(mainTab) {
    return plugin._getSubTabs(mainTab);
}

function PageComponent_getContent(mainTab, subTab, page) {
    return plugin._getContent(mainTab, subTab, page);
}

// 项目代码开始 ========================================

// 配置项，需要借助钩子实现配置项的增加
plugin.onBeforePreference(preferences => {
    preferences.add(new SourcePreference.Edit(
        "目标地址",
        "ayala.better_startup.url",
        "http://example.com",
    ))
})

// 单标签页面
plugin.page("首页", tab => {
    tab.only(page => {
        stringHelper.toast("首页开始加载")
        return new Pair(null, new ArrayList());
        // return getHome(page);
    })
})

// 多标签页面
plugin.page("排期", tab => {
    var weekLabel = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    weekLabel.forEach((label, index) => {
        tab.subpage(label, index, true, page => {
            return new Pair(null, new ArrayList());
            // return getTimeLine(index, page);
        })
    })
})

plugin.onBeforeMainTab(() => {
    // 需要异步加载的主页放在这里
    plugin.page("我的", tab => {
        // 网络或者IO操作
        tab.only(page => {
            return new Pair(null, new ArrayList());
            // return getProfile(page);
        })
    })
})