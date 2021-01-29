五子棋online
===================

起服务后，可以两人对战的哦，多加入的人可以观战。

![效果图](https://img-ys011.didistatic.com/static/dc2img/pic1.png)
![效果图](https://img-ys011.didistatic.com/static/dc2img/impression.gif)

页面是react.js写的，实时通讯是借助socket.io，后台是简单的几句node.js。自己写的jsx文件在js文件夹下，通过grunt编译后的js在dist文件夹下。

下载下来后，首先执行，以启动服务

    npm install  //下载所依赖的插件
    node index   //执行index.js以启动服务

然后通过ip地址+端口号+ /gobang.html，即可加入对战（eg: 192.168.9.180:3000/goBang.html）

*如果自己修改app.jsx文件后，需执行`grunt`命令以将jsx编译成js文件。*
