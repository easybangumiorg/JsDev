// @key ayala.sbr
// @label 更好的起始源
// @versionName 1.0
// @versionCode 1
// @libVersion 11

// 公共代码开始 ========================================
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var webViewHelperV2 = Inject_WebViewHelperV2;
var stringHelper = Inject_StringHelper;

var plugin = {
    debug: preferenceHelper.get("ayala.sbr.debug", false),
    debug_server: "http://192.168.0.108:3000",
    preferences: new ArrayList(),
    init: false,
    pagemap: new HashMap(),
    page(name, type, callback) {
        var page = new MainTab(name, type);
        this.pagemap.put(name, {
            page: page,
            callback: callback,
            subtab: null
        });
    },
    _getMainTabs() {
        var tabs = new ArrayList();
        this.pagemap.keySet().forEach(tab => {
            var value = this.pagemap.get(tab);
            tabs.add(value.page);
        })
        return tabs;
    },
    _getSubTabs(mainTab) {
        stringHelper.toast("getSubTabs:" + mainTab.label);
        var page = this.pagemap.get(mainTab.label);
        if (page.subtab == null) {
            var tab = {
                type: 'none',
                content: new HashMap(),
                only(callback) {
                    this.type = 'only';
                    this.content = callback;
                },
                subpage(name, index, is_active, callback) {
                    if (this.type == 'only') return;
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
            this.pagemap.put(mainTab.label, page);
        }
        switch (page.subtab.type) {
            case 'pages':
                var tabs = new ArrayList();
                page.subtab.content.keySet().forEach(key => {
                    var value = page.subtab.content.get(key);
                    tabs.add(new SubTab(value.name, value.is_active, value.index));
                })
                return tabs;
            default:
                return new ArrayList();
        }
    },
    _getContent(mainTab, subTab, page) {
        stringHelper.toast("getContent:" + mainTab.label + ":" + subTab.label);
        var page = this.pagemap.get(mainTab.label);
        switch (page.subtab.type) {
            case 'only':
                return page.subtab.content(page);
            case 'pages':
                var value = page.second.content.get(subTab.label);
                return value.callback(page);
        }
        return new Pair(null, new ArrayList());
    }

}

plugin.init = (function () {
    plugin.preferences.add(new SourcePreference.Switch(
        "调试模式",
        "ayala.sbr.debug",
        false
    ))
    plugin.preferences.add(new SourcePreference.Edit(
        "调试服务器地址",
        "ayala.sbr.devServer",
        plugin.debug_server
    ))
    return true
})()

function PreferenceComponent_getPreference() {
    return plugin.preferences;
}

function PageComponent_getMainTabs() {
    return plugin._getMainTabs();
}

function PageComponent_getSubTabs(mainTab) {
    stringHelper.toast("getSubTabs:"+mainTab.label);
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


plugin.page("首页", MainTab.MAIN_TAB_WITH_COVER, tab => {
    tab.only(page => {
        return new Pair(null, new ArrayList());
        // return getHome(page);
    })
})

plugin.page("排期", MainTab.MAIN_TAB_GROUP, tab => {
    var weekLabel = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    weekLabel.forEach((value, index) => {
        tab.subpage(value, index, true, page => {
            return new Pair(null, new ArrayList());
            // return getTimeLine(index, page);
        })
    })
})