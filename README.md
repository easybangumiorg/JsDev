# EasyBangumi JsDev

为开发纯纯看番JS插件源提供类型与工具链支持

让你免受gradle sync之苦（恼

## 安装依赖

你需要先创建一个开发文件夹并按一下要求配置环境。

```shell
npm init
npm install easybangumi-jsdev
```

可以到`node_modules/easybangumi-jsdev/src`下获取一份better_startup.js作为你项目的开始。如果找不到可以到[easybangumiorg/JsDev](https://github.com/easybangumiorg/JsDev)仓库的`src`目录下寻找。

如果无法正确的获得类型提示，检查是否安装了`IntelliCode`这类插件。

## 启动调试服务器

```shell
npx ebjsdev
```

在插件设置中将调试开关打开，并设置到调试服务器的地址即可获取插件运行的日志。

~~这服务器太简陋了~~

## 同步插件文件到纯纯看番

```shell
npx ebjsdev path/to/file
```

你可以在开启调试服务器时设定一个文件路径，用于即时的传递你新修改的插件文件，这个文件会在插件服务器的根目录下获取到。

你也可以在浏览器中直接打开命令行给出的地址查看文件是否被正确的传递。

在`纯纯看番->更多->番源管理->扩展->上方加号->JS文件URL`中设定开发服务器地址即可快速同步插件文件到纯纯看番。
