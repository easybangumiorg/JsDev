// @key ayala.better_startup
// @label 更好的起始源
// @versionName 1.4
// @versionCode 5
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

    if (dev_config.production_mode)
        preferenceHelper.put("ayala.better_startup.debug", 'false');
    else {
        preferences.add(new SourcePreference.Switch(
            "调试模式（非调试状态请勿打开）",
            "ayala.better_startup.debug",
            dev_config.debug_mode
        ));

        preferences.add(new SourcePreference.Edit(
            "调试服务器地址",
            "ayala.better_startup.devServer",
            dev_config.debug_server
        ))
    }

    var log = {
        raw(object) {
            if (preferenceHelper.get("ayala.better_startup.debug", dev_config.debug_mode) == 'true') {
                try {
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
                } catch (error) {
                    preferenceHelper.put("ayala.better_startup.debug", 'false');
                    this.e("plugin.log", "调试服务器不可用，已自动关闭调试模式");
                    this.e("plugin.log", error);
                }
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
        // 检查子页面配置项
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
    // 生产模式，屏蔽调试配置，但是日志仍会正常输出
    production_mode: false,
    // 默认调试配置，第一次安装插件是会使用这个配置
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

// 调试模式开启时，插件会在初始化过程中通过HTTP POST发送日志，如果调试服务器不可达，将会导致初始化失败

// 配置项注册钩子
plugin.onBeforePreference(preferences => {
    // ! 一般来说，只有当纯纯看番进入插件配置页面才会触发这个钩子
    // 只有在这里的preferences中的配置项才会被纯纯看番展示
    preferences.add(new SourcePreference.Edit(
        "目标地址",
        "ayala.better_startup.url",
        "http://example.com",
    ))
    // 如果你不想在配置页面展示配置项，你可以直接使用preferenceHelper的put与get方法，这是一个简单的KV库
    // 不需要区分不同插件的key，插件之间的key是隔离的
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

// 当纯纯看番要读取插件首页项目的时候执行的钩子，可以执行IO操作
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