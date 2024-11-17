# EasyBangumi JsDev

为开发纯纯看番JS插件源提供类型与工具链支持

让你免受gradle sync之苦（恼

## 安装依赖

```shell
npm init
npm install easybangumi-jsdev
```

可以到`node_modules/easybangumi-jsdev/src`下获取一份better_startup.js作为你项目的开始。如果找不到可以到[easybangumiorg/JsDev](https://github.com/easybangumiorg/JsDev)仓库的`src`目录下寻找。

## 同步插件文件到纯纯看番

这部分开发服务器这个版本暂时不内置，请使用VSCode的插件`Live Share`代替。

## 启动开发服务器

```shell
npx ebjsdev
```

在插件设置中将调试开关打开，并设置到开发服务器的地址即可获取插件运行的日志。

~~这服务器太简陋了~~