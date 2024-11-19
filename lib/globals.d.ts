// ===== 全局变量与类声明 =====
declare class ArrayList<T = any> {
    add(element: T): boolean;
    addAll(elements: T[]): boolean;
    size(): number;
}

declare class Pair<K, V> {
    constructor(first: K, second: V);

    first: K;
    second: V;
}

declare namespace Package {
    namespace com {
        namespace heyanle {
            namespace easybangumi4 {
                let _: any;
            }
        }
    }
    namespace kotlin { let _: any; }
    namespace java { let _: any; }
    namespace org {
        namespace jsoup { let _: any; }
    }
    namespace okhttp3 { let _: any; }
}


declare function importPackage(pkg: any): void;


// ===== JS源全局实用工具与帮助函数声明 =====
declare namespace JSLogUtils {
    function i(tag: string, msg: string): void;
    function e(tag: string, msg: string): void;
    function w(tag: string, msg: string): void;
    function d(tag: string, msg: string): void;
    function v(tag: string, msg: string): void;
    function wtf(tag: string, msg: string): void;
}

declare let Log: typeof JSLogUtils;

declare namespace Base64Utils {
    function encodeUrl(data: string): string;
    function decodeUrl(data: string): string;
    function encode(data: string): string;
    function decode(data: string): string;
    function getMD5(data: string): string;
}

declare namespace DeviceUtil {
    let isMiui: boolean;
    let miuiMajorVersion: number;
    function isMiuiOptimizationDisabled(): boolean;
    let isSamsung: boolean;
    let invalidDefaultBrowsers: string[];
    function getSystemProperty(key: string): string;
}

declare namespace SourceUtils {
    function urlParser(rootUrl: string, url: string): string;
}

declare let JSSourceUtils: typeof SourceUtils;

declare namespace CaptchaHelper {
    /**
     * 打开一个对话框请求用户输入验证码
     * @param image 验证码图片，可以是以下类型
     * - [String] (mapped to a [Uri])
     * - [Uri] ("android.resource", "content", "file", "http", and "https" schemes only)
     * - [HttpUrl]
     * - [File]
     * - [DrawableRes]
     * - [Drawable]
     * - [Bitmap]
     * - [ByteArray]
     * - [ByteBuffer]
     * @param text 对话框提示文字
     * @param title 对话框标题
     * @param hint 用户输入框提示
     * @param onFinish 用户输入完毕确认后回调
     */
    function start(
        image: string,
        text: string | null,
        title: string | null,
        hint: string | null,
        onFinish: (result: string) => void
    ): void;
}

declare namespace NetworkHelper {
    let randomUA: string;
    let cookieManager: AndroidCookieJar;
    let defaultLinuxUA: string;
    let defaultAndroidUA: string;
}

declare namespace OkhttpHelper {
    let client: OkHttpClient
    let cloudflareClient: OkHttpClient
    let cloudflareWebViewClient: OkHttpClient
}

declare namespace PreferenceHelper {
    function get(tag: string, default_: string): string
    function put(tag: string, value: string): void
    function map(): Map<string, string>
}

declare namespace StringHelper {
    /**
     * 展示纯纯看番样式对话框通知
     */
    function moeDialog(text: string, title: string | null)

    /**
     * 展示纯纯看番样式站内通知
     */
    function moeSnackBar(text: string)

    /**
     * 弹 toast
     */
    function toast(text: string)
}

declare namespace WebViewHelperV2 {
    class RenderedStrategy {
        url: string;
        reg: string;
        encode: string;
        user_agent: string;
        header: Map<string, string> | null;
        action_js: string | null;
        needBlob: boolean;
        timeout: number;

        constructor(url: string, reg: string, encode: string, user_agent: string, header: Map<string, string> | null, action_js: string | null, needBlob: boolean, timeout: number);
    }

    interface RenderedResult {
        // 策略
        strategy: RenderedStrategy,
        // 网址
        url: string,
        // 是否超时
        isTimeout: boolean,
        // 网页源码
        content: string,
        // 拦截资源
        interceptResource: string,
    }

    function renderHtml(strategy: RenderedStrategy): RenderedResult | null;

    function getGlobalWebView(): WebView;

    function openWebPage(
        onCheck: (webView: WebView) => void,
        onStop: (webView: WebView) => void,
    ): void;

    function openWevPage(
        webView: WebView,
        onCheck: (webView: WebView) => void,
        onStop: (webView: WebView) => void,
    ): void;
}

// ===== JS源 - 注入的特殊模块声明 =====
declare let Inject_CaptchaHelper: typeof CaptchaHelper;
declare let Inject_NetworkHelper: typeof NetworkHelper;
declare let Inject_OkhttpHelper: typeof OkhttpHelper;
declare let Inject_PreferenceHelper: typeof PreferenceHelper;
declare let Inject_StringHelper: typeof StringHelper;

declare namespace Inject_WebViewHelperV2 {
    let renderHtmlFromJs: typeof WebViewHelperV2.renderHtml;
}
declare namespace Inject_Source {
    let key: string;
}

// ===== JS源 - 实体与实体创建函数声明 =====
declare namespace SourcePreference {
    class BasePreference {
        label: string;
        key: string;
    }

    class Edit extends BasePreference {
        default_: string;
        constructor(label: string, key: string, default_: string);
    }

    class Switch extends BasePreference {
        default_: boolean;
        constructor(label: string, key: string, default_: boolean);
    }

    class Selection extends BasePreference {
        default_: string;
        options: string[];
        constructor(label: string, key: string, default_: string, options: string[]);
    }
}

declare class CartoonCoverImpl {
    id: string;
    source_key: string;
    url: string;
    title: string;
    intro: string;
    cover: string;

    constructor(id: string, source_key: string, url: string, title: string, intro: string, cover: string);
}

declare class CartoonImpl {
    id: string;
    source_key: string;
    url: string;
    title: string;
    genre: string;
    coverUrl: string;
    intro: string;
    description: string;
    updateStrategy: number;
    isUpdate: boolean;
    status: number;

    constructor(id: string, source_key: string, url: string, title: string, genreList: string[], cover: string, intro: string, description: string, updateStrategy: number, isUpdate: boolean, status: number);
}

declare function makeCartoonCover(info: {
    id: string,
    url: string,
    title: string,
    intro: string,
    cover: string
}): CartoonCoverImpl;

declare function makeCartoon(info: {
    id: string,
    url: string,
    title: string,
    genreList: string[],
    cover: string,
    intro: string,
    description: string,
    updateStrategy: number,
    isUpdate: boolean,
    status: number
}): CartoonImpl;

declare class MainTab {
    static MAIN_TAB_WITH_COVER: number;
    static MAIN_TAB_GROUP: number;

    constructor(label: string, type: number);

    label: string;
    type: number;
}

declare class SubTab {
    constructor(label: string, active: boolean, index: number);

    label: string;
    active: boolean;
    index: number;

    ext: number = this.index;
}

declare class PlayLine {
    constructor(id: string, label: string, episodes: Episode[]);

    id: string;
    label: string;
    episode: ArrayList<Episode>;
}

declare namespace Cartoon {
    let STATUS_UNKNOWN: number;
    let UPDATE_STRATEGY_ALWAYS: number;
}

declare class Episode {
    constructor(id: string, label: string, order: number);

    id: string;
    label: string;
    order: number;
}

declare interface CartoonSummary {
    id: string;
    source: string;
}

declare class PlayerInfo {
    static DECODE_TYPE_OTHER: number;
    static DECODE_TYPE_HLS: number;

    constructor(type: number, url: string);

    type: number;
    url: string;
}

// ===== JS源 - 源首选项组件 =====
type PreferenceComponent_getPreference = () => ArrayList<SourcePreference.BasePreference>;
// ===== JS源 - 页面呈现组件 =====
type PageComponent_getMainTabs = () => ArrayList<MainTab>;
type PageComponent_getSubTabs = (mainTab: MainTab) => ArrayList<SubTab>;
type PageComponent_getContent = (mainTab: MainTab, subTab: SubTab, key: number) => Pair<number | null, ArrayList<CartoonCoverImpl | CartoonImpl>>;
// ===== JS源 - 节目信息组件 =====
type DetailedComponent_getDetailed = (summary: CartoonSummary) => Pair<CartoonImpl, ArrayList<PlayLine>>;
// ===== JS源 - 搜索组件 =====
type SearchComponent_search = (page: number, keyword: string) => Pair<number | null, ArrayList<CartoonCoverImpl>>;
// ===== JS源 - 播放组件 =====
type PlayComponent_getPlayInfo = (summary: CartoonSummary, playline: PlayLine, episode: Episode) => PlayerInfo;
