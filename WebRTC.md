vcastr3.swf和video，不支持mpeg4编码格式的MP4视频播放

```shell
ffmpeg -i board.mp4 -vcodec h264 boardOutput.mp4
```

navigator.mediaDevices.enumerateDevices() 返回空label

浏览器出于安全考虑，只对信任的域名开放核心功能的调用。要解决这个问题，先要看看浏览器是否信任该域名。

没有在允许访问摄像头的范围之内，因此权限不足，label属性不可见。当然，此处也不能手动添加信任网址。 解决的办法就是让程序来“调用”摄像头，引导浏览器弹出询问框，我们再做允许的操作。

在 navigator.mediaDevices.enumerateDevices() 方法前加上以下代码：

```javascript
navigator.mediaDevices.getUserMedia({audio: true, video: true});
```

## WebRTC

`WebRTC` (Web Real-Time Communications) 是一项`实时通讯技术`，它允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间`点对点（Peer-to-Peer）的连接`，实现视频流和（或）音频流或者其他`任意数据`的传输。WebRTC 包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，创建点对点（Peer-to-Peer）的数据分享和电话会议成为可能。

我们可以通过摄像头，麦克风，屏幕共享等方式获取到媒体流，然后通过 WebRTC 技术将媒体流传输到远端实现实时通讯。

**WebRTC 只能在 HTTPS 协议或者 localhost 下使用，如果是 HTTP 协议，会报错。**

### SDK

