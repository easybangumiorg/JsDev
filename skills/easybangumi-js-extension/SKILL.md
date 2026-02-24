---
name: 纯纯看番 JS 源扩展开发
description: 为纯纯看番 (EasyBangumi) 应用创建 JavaScript 源扩展。使用场景：用户提供一个番剧网站 URL，需要分析网站结构并实现插件化集成，包括页面展示、搜索、详情获取和视频播放功能。
---

# 纯纯看番 JS 源扩展开发指南

## 核心工作流

### 1. 网站分析

使用浏览器 DevTools 分析目标网站：
- 首页/分类页的 HTML 结构和 URL 规律
- 搜索接口的请求格式
- 详情页的剧集列表结构
- 播放页的视频地址获取方式

### 2. 创建扩展骨架

```javascript
// @key com.example.anime          // 反向域名唯一标识
// @label 示例动漫源                 // 显示名称
// @versionName 1.0.0
// @versionCode 1
// @libVersion 13                   // 当前库版本
// @cover https://example.com/logo.png

// 注入工具
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;
var webProxyProvider = Inject_WebProxyProvider;
```

### 3. 实现组件

按顺序实现以下组件：

1. **PreferenceComponent** - 偏好设置（如网站地址）
2. **PageComponent** - 页面展示（主标签、子标签、内容列表）
3. **SearchComponent** - 搜索功能
4. **DetailedComponent** - 详情和播放线路
5. **PlayComponent** - 视频地址解析

详细实现模式见 [组件详解](references/components.md)。

### 4. 调试测试

```javascript
// 添加日志
Log.d("MyAnime", "请求 URL: " + url);
Log.d("MyAnime", "解析元素数量：" + elements.size());

// 抛出异常
throw new ParserException("视频地址解析失败");
```

---

## 快速参考

### 元数据

| 字段 | 示例 |
|------|------|
| @key | `@key heyanle.yhw` |
| @label | `@label 樱花动漫` |
| @versionName | `@versionName 1.0.0` |
| @versionCode | `@versionCode 1` |
| @libVersion | `@libVersion 13` |
| @cover | `@cover https://...` |

### 组件签名

```javascript
PreferenceComponent_getPreference() -> ArrayList
PageComponent_getMainTabs() -> ArrayList
PageComponent_getSubTabs(mainTab) -> ArrayList
PageComponent_getContent(mainTab, subTab, key) -> Pair
SearchComponent_search(page, keyword) -> Pair
DetailedComponent_getDetailed(summary) -> Pair
PlayComponent_getPlayInfo(summary, playLine, episode) -> PlayerInfo
```

### 常用 API

```javascript
// 网络请求
var req = okhttpHelper.cloudflareWebViewClient.newCall(OkhttpUtils.get(url));
var html = req.execute().body().string();

// URL 拼接
var fullUrl = SourceUtils.urlParser(rootUrl, path);

// HTML 解析
var doc = Jsoup.parse(html);
var elements = doc.select(".selector");

// WebView 代理
var webProxy = webProxyProvider.getWebProxy();
webProxy.loadUrl(url, networkHelper.defaultLinuxUA);
var videoUrl = webProxy.waitingForResourceLoaded(".*\\.m3u8");

// 实体创建
var cover = makeCartoonCover({ id, url, title, cover });
```

---

## 参考资源

### 详细文档

- [组件详解](references/components.md) - 五大组件完整实现
- [工具 API](references/api-reference.md) - API 完整文档
- [实体类](references/entities.md) - 类型定义
- [最佳实践](references/best-practices.md) - 代码规范
- [常见问题](references/faq.md) - FAQ

### 类型定义

- [easyplugin.d.ts](references/types/easyplugin.d.ts) - TypeScript 类型定义，用于 IDE 代码提示

使用方法：
```javascript
/// <reference path="./easyplugin.d.ts" />
```

### 示例代码

- [简单示例.js](examples/简单示例.js) - 基础模板，适合入门
- [樱花动漫示例.js](examples/樱花动漫示例.js) - 完整示例，包含 WebView 代理

### 工具脚本

- [create-empty-extension.js](scripts/create-empty-extension.js) - 快速创建空插件模板

使用方法：
```bash
# 创建空插件模板
node scripts/create-empty-extension.js <插件名称> [输出目录]

# 示例
node scripts/create-empty-extension.js my-anime
node scripts/create-empty-extension.js sakura ./extensions
```

---

## 架构概览

```
纯纯看番 App
├─ ExtensionControllerV2
│  ├─ JsExtensionProviderV2
│  │  └─ JSExtensionLoader (解析元数据，创建 JSScope)
│  └─ JSComponentBundle (注入工具类，加载组件)
```

**执行流程**: 加载 → 注入 → 注册 → 运行
