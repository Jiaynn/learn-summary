全频带编解码：

HLS、RTMP、HTTP 等多种直播分发形式

视频压缩技术从 H261 到 H264，再到现在的 H265 及未来不久将出现的 AV1，视频压缩率越来越高；

音频压缩技术也从电话使用的 G.711、G.722 等窄带音频压缩技术，发展到现代的 AAC、OPUS 等宽带音频压缩技术。

有了 WebRTC，你就不必自己去实现**回音消除算法**了；有了 WebRTC ，你也**不必自己去实现各种音视频的编解码器了**；有了 WebRTC，你更**不必去考虑跨平台的问题**了。可以在浏览器上快速开发出各种音视频应用

### webRtc通信流程

<img src="https://static001.geekbang.org/resource/image/c5/a0/c536a1dd0ed50008d2ada594e052d6a0.png?wh=1142*686" alt="img" style="zoom:100%;" />

这幅图从大的方面可以分为 4 部分，即两个 WebRTC 终端（上图中的两个大方框）、一个 Signal（信令）服务器和一个 STUN/TURN 服务器。WebRTC 终端，负责音视频采集、编解码、NAT 穿越、音视频数据传输。Signal 服务器，负责信令处理，如加入房间、离开房间、媒体协商消息的传递等。STUN/TURN 服务器，负责获取 WebRTC 终端在公网的 IP 地址，以及 NAT 穿越失败后的数据中转。

### 基本概念：

**帧率：**现在的摄像头功能已非常强大，一般情况下，一秒钟可以采集 30 张以上的图像，一些好的摄像头甚至可以采集 100 张以上。我们把**摄像头一秒钟采集图像的次数称为帧率**。帧率越高，视频就越平滑流畅。然而，在直播系统中一般不会设置太高的帧率，因为帧率越高，占的网络带宽就越多。

**分辨率**：摄像头除了可以设置帧率之外，还可以调整分辨率。我们常见的分辨率有 2K、1080P、720P、420P 等。**分辨率越高图像就越清晰，但同时也带来一个问题，即占用的带宽也就越多**。所以，在直播系统中，分辨率的高低与网络带宽有紧密的联系。也就是说，分辨率会跟据你的网络带宽进行动态调整。

**宽高比**：分辨率一般分为两种宽高比，即 16:9 或 4:3。4:3 的宽高比是从黑白电视而来，而 16:9 的宽高比是从显示器而来。现在一般情况下都采用 16:9 的比例

**麦克风**：用于采集音频数据。它与视频一样，可以指定**一秒内采样的次数，称为采样率**。每个采样用几个 bit 表示，称为**采样位深或采样大小。**

**轨（Track）**：WebRTC 中的“轨”借鉴了多媒体的概念。火车轨道的特性你应该非常清楚，两条轨永远不会相交。“轨”在多媒体中表达的就是**每条轨数据都是独立的，不会与其他轨相交**，如 MP4 中的音频轨、视频轨，它们在 MP4 文件中是被分别存储的。

**流（Stream）**：可以理解为容器。在 WebRTC 中，“流”可以分为媒体流（MediaStream）和数据流（DataStream）。其中，**媒体流可以存放 0 个或多个音频轨或视频轨**；**数据流可以存 0 个或多个数据轨**。

### 在浏览器下采集音视频的 API 格式以及如何控制音视频的采集

#### getUserMedia 方法

在浏览器中访问音视频设备非常简单，只要调用 getUserMedia 这个 API 即可。该 API 的基本格式如下：

```js
var promise = navigator.mediaDevices.getUserMedia(constraints);
```

```js
const mediaStreamContrains = {
    video: {
        frameRate: {min: 20},
        width: {min: 640, ideal: 1280},
        height: {min: 360, ideal: 720},
        aspectRatio: 16/9
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }
};
```

上面这个例子表示：视频的帧率最小 20 帧每秒；宽度最小是 640，理想的宽度是 1280；同样的，高度最小是 360，最理想高度是 720；此外宽高比是 16:9；对于音频则是开启回音消除、降噪以及自动增益功能。

```js
<video autoplay playsinline></video>
```

它是 HTML5 的视频标签，不仅可以播放多媒体文件，还可以用于播放采集到的数据。

其参数含义如下：

autoplay，表示当页面加载时可以自动播放视频；

playsinline，表示在 HTML5 页面内播放视频，而不是使用系统播放器播放视频。

**getUserMedia API 控制设备的参数及其含义如下：**

![img](https://static001.geekbang.org/resource/image/f3/8a/f3d578d13b4c21c83b161dae348b8c8a.png?wh=3067*3139)

### 音视频设备的基本原理

#### 音频设备

音频有采样率和采样大小的概念，音频输入设备主要工作是采集音频数据，采集音频数据本质是模数转换（A/D），即将模拟信号转化为数字信号，模数转换使用的是奈奎斯特定理，其内容如下：

在进行模拟 / 数字信号的转换过程中，当采样率大于信号中最高频率的 2 倍时，采样之后的数字信号就完整地保留了原始信号中的信息。

意思就是人类的听觉范围20Hz~20kHz，如果为了追求高品质、高保真，将音频输入设备的采样率设置在40kHz以上，这样才能完整的将原始信号保留下来

采集到的数据再经过量化、编码，最终形成数字信号，这就是音频设备所要完成的工作。在量化和编码的过程中，采样大小（保存每个采样的二进制位个数）决定了每个采样最大可以表示的范围。如果采样大小是 8 位，则它表示的最大值是就是 2^8-1，即 255；如果是 16 位，则其表示的最大数值是 65535。

采样大小的改变会带来什么样的影响？ 个人理解：采样大小越大，范围越广，音频输入设备采集音频数据后，保存的次数少，会减少重复计算保存范围的这部分时间。

#### 视频设备

当实物光通过镜头进行到摄像机后，它会通过视频设备的模数转换（A/D）模块，即光学传感器， 将光转换成数字信号，即 RGB（Red、Green、Blue）数据。获得 RGB 数据后，还要通过 DSP（Digital Signal Processer）进行优化处理，如自动增强、白平衡、色彩饱和等都属于这一阶段要做的事情。

通过 DSP 优化处理后，你就得到了 24 位的真彩色图片。因为每一种颜色由 8 位组成，而一个像素由 RGB 三种颜色构成，所以一个像素就需要用 24 位表示，故称之为 24 位真彩色。另外，此时获得的 RGB 图像只是临时数据。因最终的图像数据还要进行压缩、传输，而编码器一般使用的输入格式为 YUV I420，所以在摄像头内部还有一个专门的模块用于将 RGB 图像转为 YUV 格式的图像。

YUV 也是一种色彩编码方法，主要用于电视系统以及模拟视频领域。它将亮度信息（Y）与色彩信息（UV）分离，即使没有 UV 信息一样可以显示完整的图像，只不过是黑白的，这样的设计很好地解决了彩色电视机与黑白电视的兼容问题。YUV存储数据比RGB存储数据小



#### 获取音视频设备列表

```js
MediaDevices.enumerateDevices()
```

通过调用 MediaDevices 的 enumerateDevices() 方法就可以获取到媒体输入和输出设备列表，例如： 麦克风、相机、耳机等。

MediaDeviceInfo，它表示的是每个输入 / 输出设备的信息。包含以下三个重要的属性：

deviceID，设备的唯一标识；

label，设备名称；

kind，设备种类，可用于识别出是音频设备还是视频设备，是输入设备还是输出设备。

在获取到电脑 / 手机上的所有设备信息后，我们就可以对设备的可用性做真正的检测了。在我们的设备列表中，可以通过MediaDeviceInfo结构中的 kind 字段，将设备分类为音频设备或视频设备。

### 编解码祯

**非编码祯（解码祯）**：播放器播的是非编码帧（解码后的帧），这些非编码帧就是一幅幅独立的图像。

从摄像头里采集的帧或通过解码器解码后的帧都是非编码帧。非编码帧的格式一般是 YUV 格式或是 RGB 格式。

**编码帧**：通过编码器（如 H264/H265、VP8/VP9）压缩后的帧称为编码帧。

这里我们以 H264 为例，经过 H264 编码的帧包括以下三种类型。

I 帧：关键帧。压缩率低，可以单独解码成一幅完整的图像。

P 帧：参考帧。压缩率较高，解码时依赖于前面已解码的数据。

B 帧：前后参考帧。压缩率最高，解码时不光依赖前面已经解码的帧，而且还依赖它后面的 P 帧。换句话说就是，B 帧后面的 P 帧要优先于它进行解码，然后才能将 B 帧解码。

从播放器里获取的视频帧一定是非编码帧。也就是说，拍照的过程其实是从连续播放的一幅幅画面中抽取正在显示的那张画面。

**canvas进行拍照**

这里最关键的点就是 drawImage 方法，其方法格式如下：

```js
void ctx.drawImage(image, dx, dy, dWidth, dHeight);
```

image：可以是一幅图片，或 HTMLVideoElement。

dx, dy：图片起点的 x、y 坐标。

dWidth：图片的宽度。dHeight：图片的高度。

### 音视频录制

服务端录制、客户端录制

**基本原理**

录制后音视频的存储格式

录制下来的音视频流如何播放

启动录制后多久回放

- 边录边看
- 录制完立即回放
- 录完后过一段时间可观看

录制原始数据的优点是不用做过多的业务逻辑，来什么数据就录制什么数据，这样录制效率高，不容易出错；并且录制方法也很简单，可以将音频数据与视频数据分别存放到不同的二进制文件中。

当录制结束后，再将录制好的音视频二进制文件整合成某种多媒体文件，如 FLV、MP4 等。但它的弊端是，录制完成后用户要等待一段时间才能看到录制的视频。因为在录制完成后，它还要做音视频合流、输出多媒体文件等工作。

那直接录制成某种多媒体格式会怎么样呢？

 FLV 格式特别适合处理这种流式数据。因为 FLV 媒体文件本身就是流式的，可以在 FLV 文件的任何位置进行读写操作，它都可以正常被处理。因此，如果使用 FLV 的话，就不用像前面录制原始数据那样先将二制数据存储下来，之后再进行合流、转码那么麻烦了。

如果场景比较复杂（如多人互动的场景），即同时存在多路视频，FLV 格式就无法满足需求了，因为 FLV 只能同时存在一路视频和一路音频，而不能同时存在多路视频这种情况。此时，最好的方法还是录制原始数据，然后通过实现私有播放器来达到用户的需求。

即使是单视频的情况下，FLV 的方案看上去很完美，但实际情况也不一定像你想象的那样美好。因为将音视频流存成 FLV 文件的前提条件是音视频流是按顺序来的，而实际上，音视频数据经过 UDP 这种不可靠传输网络时，是无法保证音视频数据到达的先后顺序的。因此，在处理音视频录制时，你不仅要考虑录制的事情，还要自己做音视频数据排序的工作。不过，好在 WebRTC 已经处理好了一切。

**存储二进制数据的类型**

- ArrayBuffer

  可以用来存储图片、视频等，但不能直接对ArrayBuffer进行访问，必须使用封装类进行实例化后才能进行访问

  ArrayBuffer 只是描述有这样一块空间可以用来存放二进制数据，但在计算机的内存中并没有真正地为其分配空间。只有当具体类型化后，它才真正地存在于内存中

  ```js
  let buffer = new Uint8Array([255, 255, 255, 255]).buffer;
  let dataView = new DataView(buffer);
  ```

  在上面的例子中，一开始生成的 buffer 是不能被直接访问的。只有将 buffer 做为参数生成一个具体的类型的新对象时（如 Uint32Array 或 DataView），这个新生成的对象才能被访问。

- ArrayBufferView

  ArrayBufferView 并不是一个具体的类型，而是**代表不同类型的 Array 的描述**。这些类型包括：Int8Array、Uint8Array、DataView 等。也就是说 Int8Array、Uint8Array 等才是 JavaScript 在内存中真正可以分配的对象。

  ArrayBufferView 指的是 Int8Array、Uint8Array、DataView 等类型的总称，而这些类型都是使用 ArrayBuffer 类实现的，因此才统称他们为 ArrayBufferView

- Blob

  Blob（Binary Large Object）是 JavaScript 的大型二进制对象类型，WebRTC 最终就是使用它将录制好的音视频流保存成多媒体文件的。

```js
var aBlob = new Blob( array, options );
```

其中，array 可以是 ArrayBuffer、ArrayBufferView、Blob、DOMString 等类型 ；option，用于指定存储成的媒体类型。

webRtc录制本地音视频

```js
var mediaRecorder = new MediaRecorder(stream[, options]);
```

其参数含义如下：

- stream，通过 getUserMedia 获取的本地视频流或通过 RTCPeerConnection 获取的远程视频流。

- options，可选项，指定视频格式、编解码器、码率等相关信息，如 mimeType: 'video/webm;codecs=vp8'。

MediaRecorder 对象还有一个特别重要的事件，即 ondataavailable 事件。当 MediaRecoder 捕获到数据时就会触发该事件。通过它，我们才能将音视频数据录制下来。

### webRTC共享桌面

共享桌面的原理：

共享者：每秒钟抓取多次屏幕（可以是 3 次、5 次等），每次抓取的屏幕都与上一次抓取的屏幕做比较，取它们的差值，然后对差值进行压缩；如果是第一次抓屏或切幕的情况，即本次抓取的屏幕与上一次抓取屏幕的变化率超过 80% 时，就做全屏的帧内压缩，其过程与 JPEG 图像压缩类似。最后再将压缩后的数据通过传输模块传送到观看端；数据到达观看端后，再进行解码，这样即可还原出整幅图片并显示出来

远程控制端：当用户通过鼠标点击共享桌面的某个位置时，会首先计算出鼠标实际点击的位置，然后将其作为参数，通过信令发送给共享端。共享端收到信令后，会模拟本地鼠标，即调用相关的 API，完成最终的操作。一般情况下，当操作完成后，共享端桌面也发生了一些变化，此时就又回到上面共享者的流程了。

WebRTC共享桌面

抓取桌面api

```js
var promise = navigator.mediaDevices.getDisplayMedia(constraints);
```

一个实现录制屏幕加入声音的demo

```js
new Vue({
  el: "#app",
  mounted() {
    this._initApp();
  },
  data: {
    currentWebmData: null,
    recording: false,
    paused: false,
  },
  methods: {
    async _initApp() {
      this._stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this._remoteStream=await this._stream.addTrack()
      this._recoder = new MediaRecorder(this._stream, {
        mimeType: "video/webm;codecs=h264",
      });
      this._recoder.ondataavailable =
        this.recorder_dataAvailableHandler.bind(this);
    },
    recorder_dataAvailableHandler(e) {
      this.currentWebmData = e.data;
    },
    btnRecordClicked() {
      this.recording = true;
      this.paused = false;
      this._recoder.start();
    },
    btnPauseClicked() {
      this.paused = true;
      this._recoder.pause();
    },
    btnResumeClicked() {
      this.paused = false;
      this._recoder.resume();
    },
    btnstopClicked() {
      this.recording = false;
      this._recoder.stop();
    },
    btnPlayClicked() {
      this.$refs.player.src = URL.createObjectURL(this.currentWebmData);
    },
  },
});

```

#### RTP RTCP协议

实时互动直播系统采用的是UDP协议进行传输，但一般在传递数据流的时候，我们并不直接将音视频数据流交给UDP传输，而是先给音视频数据加个RTP头，在交给UDP进行传输

RTP协议

![img](https://static001.geekbang.org/resource/image/ae/89/aec03cf4e1b76296c3e21ebbc54a2289.png?wh=1142*377)

<img src="https://static001.geekbang.org/resource/image/e2/8f/e21ea8be9c0d13638a6af38423640d8f.png?wh=1142*875" alt="img" style="zoom: 50%;" />

假设从网上接受到的一组音视频数据

```js
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:13,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:14,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:14,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:15,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:15,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:16,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:16,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:17,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:17,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:18,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:18,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:19,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=0,PT:98,seq:19,ts:1122334455,ssrc=2345},
{V=2,P=0,X=0,CC=0,M=0,PT:111,seq:20,ts:1122334455,ssrc=888},
{V=2,P=0,X=0,CC=0,M=1,PT:98,seq:20,ts:1122334455,ssrc=2345},
```

假设 PT=98 是视频数据，PT=111 是音频数据，那么按照上面的规则可以很容易就能将视频帧组装起来

timestamp表明哪些属于一个帧里的，而此时如果出现了丢包问题，可以通过  RTCP 的 NACK 来解决 

**丢包导致的视频花屏马赛克问题解决办法**

1. 在接收端根据rtp包的seqnumber来判断是否丢包，如果丢包就标记一下。

2. 在mark为1或时间戳改变的时候，说明一帧结束了，此时如果标记为丢包了，就扔掉数据，没有丢包就给解码器。

3. 如果丢包的帧为I帧，则不仅丢掉当前I帧，此I帧之后的P帧也要丢掉，也就是说整个序列都丢掉。

视频编码中，常用的数据压缩算法是帧内预测、帧间预测。帧内预测是对单张图像本身进行数据压缩，比如 JPEG。帧间预测是利用视频图像帧间的相关性，来达到图像压缩的目的；因为同一个视频中的前后两帧图像差异很小，因此不必完整地保存这两帧图像的原始数据，只需要保存前一帧的图像数据，然后再保存后一帧画面与前一帧的差别即可

IDR帧：

**IDR（Instantaneous Decoding Refresh）--即时解码刷新。**

**I 和 IDR 帧都是使用帧内预测的。它们都是同一个东西而已，在编码和解码中为了方便，要首个 I 帧和其他 I 帧区别开，所以才把第一个首个 I 帧叫 IDR，这样就方便控制编码和解码流程。**

IDR 帧的作用是立刻刷新，使错误不致传播,从IDR帧开始，重新算一个新的序列开始编码。而 I 帧不具有随机访问的能力，这个功能是由 IDR 承担。IDR 会导致DPB（参考帧列表——这是关键所在）清空，而 I 不会

**对于 IDR 帧来说，在 IDR 帧之后的所有帧都不能引用任何 IDR 帧之前的帧的内容**

RTCP协议

让各端知道他们自己的网络质量是怎样的

两个重要的报文：RR（Reciever Report）和 SR(Sender Report)。通过这两个报文的交换，各端就知道自己的网络质量到底如何了

SR报文

<img src="https://static001.geekbang.org/resource/image/ae/f3/ae1b83a0255d05dd70285f0a26fb23f3.png?wh=1142*975" alt="img" style="zoom:50%;" />

SR 报文分成三部分：Header、Sender info 和 Report block。在 NTP 时间戳之上的部分为 SR 报文的 Header 部分，SSRC_1 字段之上到 Header 之间的部分为 Sender info 部分，剩下的就是一个一个的 Report Block 了。

- Header 部分用于标识该报文的类型，比如是 SR 还是 RR。
- Sender info 部分用于指明作为发送方，到底发了多少包。
- Report block 部分指明发送方作为接收方时，它从各个 SSRC 接收包的情况。

Full Intra Request (FIR) Command，即完整帧请求命令

场景：在一个房间里有 3 个人进行音视频聊天，然后又有一个人加入到房间里，这时如果不做任何处理的话，那么第四个人进入到房间后，在一段时间内很难直接看到其他三个人的视频画面了

原因就在于解码器在解码时有一个上下文。在该上下文中，必须先拿到一个 IDR 帧之后才能将其后面的 P 帧、B 帧进行解码。也就是说，在没有 IDR 帧的情况下，对于收到的 P 帧、B 帧解码器只能干瞪眼了

通过FIR报文，当第四个人加入到房间后，它首先发送 FIR 报文，当其他端收到该报文后，便立即产生各自的 IDR 帧发送给新加入的人，这样当新加入的人拿到房间中其他的 IDR 帧后，它的解码器就会解码成功，于是其他人的画面也就一下子全部展示出来了

#### SDP

SDP（Session Description Protocal）是用文本描述的各端（PC 端、Mac 端、Android 端、iOS 端等）的能力。这里的能力指的是各端所支持的音频编解码器是什么，这些编解码器设定的参数是什么，使用的传输协议是什么，以及包括的音视频媒体是什么等等

```js
v=0
o=- 3409821183230872764 2 IN IP4 127.0.0.1
...
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126
...
a=rtpmap:111 opus/48000/2
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
...
```

如上面的 SDP 片段所示，该 SDP 中描述了一路音频流，即 m=audio，该音频支持的 Payload ( 即数据负载 ) 类型包括 111、103、104 等等。

在该 SDP 片段中又进一步对 111、103、104 等 Payload 类型做了更详细的描述，如 a=rtpmap:111 opus/48000/2 表示 Payload 类型为 111 的数据是 OPUS 编码的音频数据，并且它的采样率是 48000，使用双声道。以此类推，你也就可以知道 a=rtpmap:104 ISAC/32000 的含义是音频数据使用 ISAC 编码，采样频率是 32000，使用单声道。

两个客户端 / 浏览器进行 1 对 1 通话时，首先要进行**信令交互，而交互的一个重要信息就是 SDP 的交换**

<img src="https://static001.geekbang.org/resource/image/f7/57/f750b35eb95e84238d640cb76dcaf457.png?wh=1142*542" alt="img" style="zoom:50%;" />

举个例子，A 与 B 进行通讯，它们先各自在 SDP 中记录自己支持的音频参数、视频参数、传输协议等信息，然后再将自己的 SDP 信息通过信令服务器发送给对方。当一方收到对端传来的 SDP 信息后，它会将接收到的 SDP 与自己的 SDP 进行比较，并取出它们之间的交集，这个交集就是它们协商的结果，也就是它们最终使用的音视频参数及传输协议了。

**标准的SDP规范**

主要包括 **SDP 描述格式**和 **SDP 结构**，而 SDP 结构由**会话描述**和**媒体信息**描述两个部分组成。

其中，媒体信息描述是整个 SDP 规范中最重要的知识，它又包括了：

- 媒体类型

- 媒体格式
- 传输协议
- 传输的 IP 和端口

1. SDP 的格式

分为两个部分：会话级和媒体级

- 会话级（session level）的作用域是整个会话，其位置是从 v= 行开始到第一个媒体描述为止。

- 媒体级（media level）是对单个的媒体流进行描述，其位置是从 m= 行开始到下一个媒体描述（即下一个 m=）为止。

另外，除非媒体部分重新对会话级的值做定义，否则会话级的值就是各个媒体的缺省默认值。

（1）会话描述

**第一个，v=（protocol version，必选）**。例子：v=0 ，表示 SDP 的版本号，但不包括次版本号。

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230118170108988.png" alt="image-20230118170108988" style="zoom:50%;" />

```js

v=0
o=- 4007659306182774937 2 IN IP4 127.0.0.1
s=-
t=0 0 
//以上表示会话描述
...
//下面的媒体描述，在媒体描述部分包括音频和视频两路媒体
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126
...
a=rtpmap:111 opus/48000/2 //对RTP数据的描述
a=fmtp:111 minptime=10;useinbandfec=1 //对格式参数的描述
...
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
...
//上面是音频媒体描述，下面是视频媒体描述
m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102 122 127 121 125 107 108 109 124 120 123 119 114 115 116
...
a=rtpmap:96 VP8/90000
...
```



（2）媒体描述

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230118170010936.png" alt="image-20230118170010936" style="zoom:50%;" />

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230118170029280.png" alt="image-20230118170029280" style="zoom:50%;" />

**WebRTC 中的 SDP**

它将 SDP 按功能分成几大块：

- Session Metadata，会话元数据
- Network Description，网络描述
- Stream Description，流描述
- Security Descriptions，安全描述
- Qos Grouping Descriptions， 服务质量描述

<img src="https://static001.geekbang.org/resource/image/21/fa/216e0bc9ccfcb5dd3593f11e8b857dfa.png?wh=1142*1011" alt="img" style="zoom:50%;" />

<img src="https://static001.geekbang.org/resource/image/60/ce/60ac066baf39e92f4d9a3627cfe007ce.png?wh=1142*1025" alt="img" style="zoom:50%;" />

WebRTC SDP 中的会话元数据（Session Metadata）其实就是 SDP 标准规范中的会话层描述；流描述、网络描述与 SDP 标准规范中的媒体层描述是一致的；而安全描述与服务质量描述都是新增的一些属性描述。下图我们来看一个具体的例子：

```js

...
//=======安全描述============
a=ice-ufrag:1uEe //进入连通性检测的用户名
a=ice-pwd:RQe+y7SOLQJET+duNJ+Qbk7z//密码，这两个是用于连通性检测的凭证
a=fingerprint:sha-256 35:6F:40:3D:F6:9B:BA:5B:F6:2A:7F:65:59:60:6D:6B:F9:C7:AE:46:44:B4:E4:73:F8:60:67:4D:58:E2:EB:9C //DTLS 指纹认证，以识别是否是合法用户
...
//========服务质量描述=========
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb //使用 google 的带宽评估算法
a=rtcp-fb:96 transport-cc //启动防拥塞
a=rtcp-fb:96 ccm fir //解码出错，请求关键帧
a=rtcp-fb:96 nack    //启用丢包重传功能
a=rtcp-fb:96 nack pli //与fir 类似
...
```

其中，安全描述起到两方面的作用，一方面是进行网络连通性检测时，对用户身份进行认证；另一方面是收发数据时，对用户身份的认证，以免受到对方的攻击。从中可以看出 WebRTC 对安全有多重视了

服务质量描述指明启动哪些功能以保证音视频的质量，如启动带宽评估，当用户发送数据量太大超过评估的带宽时，要及时减少数据包的发送；启动防拥塞功能，当预测到要发生拥塞时，通过降低流量的方式防止拥塞的发生等等，这些都属于服务质量描述的范畴。

一个详细的SDP

```js

//=============会话描述====================
v=0 
o=- 7017624586836067756 2 IN IP4 127.0.0.1
s=-
t=0 0
...

//================媒体描述=================
//================音频媒体=================
/*
 * 音频使用端口1024收发数据
 * UDP/TLS/RTP/SAVPF 表示使用 dtls/srtp 协议对数据加密传输
 * 111、103 ... 表示本会话音频数据的 Payload Type
 */
 m=audio 1024 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126 

//==============网络描述==================
//指明接收或者发送音频使用的IP地址，由于WebRTC使用ICE传输，这个被忽略。
c=IN IP4 0.0.0.0
//用来设置rtcp地址和端口，WebRTC不使用
a=rtcp:9 IN IP4 0.0.0.0
...

//==============音频安全描述================
//ICE协商过程中的安全验证信息
a=ice-ufrag:khLS
a=ice-pwd:cxLzteJaJBou3DspNaPsJhlQ
a=fingerprint:sha-256 FA:14:42:3B:C7:97:1B:E8:AE:0C2:71:03:05:05:16:8F:B9:C7:98:E9:60:43:4B:5B:2C:28:EE:5C:8F3:17
...

//==============音频流媒体描述================
a=rtpmap:111 opus/48000/2
//minptime代表最小打包时长是10ms，useinbandfec=1代表使用opus编码内置fec特性
a=fmtp:111 minptime=10;useinbandfec=1
...
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
a=rtpmap:9 G722/8000
...

//=================视频媒体=================
m=video 9 UDP/TLS/RTP/SAVPF 100 101 107 116 117 96 97 99 98
...
//=================网络描述=================
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
...
//=================视频安全描述=================
a=ice-ufrag:khLS
a=ice-pwd:cxLzteJaJBou3DspNaPsJhlQ
a=fingerprint:sha-256 FA:14:42:3B:C7:97:1B:E8:AE:0C2:71:03:05:05:16:8F:B9:C7:98:E9:60:43:4B:5B:2C:28:EE:5C:8F3:17
...

//================视频流描述===============
a=mid:video
...
a=rtpmap:100 VP8/90000
//================服务质量描述===============
a=rtcp-fb:100 ccm fir
a=rtcp-fb:100 nack //支持丢包重传，参考rfc4585
a=rtcp-fb:100 nack pli
a=rtcp-fb:100 goog-remb //支持使用rtcp包来控制发送方的码流
a=rtcp-fb:100 transport-cc
...
```

#### WebRTC 通过SDP进行媒体协商

<img src="https://static001.geekbang.org/resource/image/f5/de/f5a65fd87dc667af6761ba7e25abe1de.png?wh=1142*599" alt="img" style="zoom:48%;" />

- 创建连接，指的是创建 RTCPeerConnection，它负责端与端之间彼此建立 P2P 连接。
- 信令，指的是客户端通过信令服务器交换 SDP 信息。

在 WebRTC 1.0 规范中，在双方通信时，双方必须清楚彼此使用的编解码器是什么，也必须知道传输过来的音视频流的 SSRC

举个例子，如果 WebRTC 不清楚对方使用的是哪种编码器编码的数据，比如到底是 H264，还是 VP8？那 WebRTC 就无法将这些数据包正常解码，还原成原来的音视频帧，这将导致音视频无法正常显示或播放。

同样的道理，如果 WebRTC 不知道对方发过来的音视频流的 SSRC 是多少，那么 WebRTC 就无法对该音视频流的合法性做验证，这也将导致你无法观看正常的音视频。因为对于无法验证的音视频流，WebRTC 在接收音视频包后会直接将其抛弃。

**RTCPeerConnection**

```js
//创建 RTCPeerConnection 对象
const pcConfig=null
const pc=new RTCPeerConection(pcConfig)
```

在通讯双方都创建好 RTCPeerConnection 对象后，它们就可以开始进行媒体协商了。其中有两个概念 Offer 和 Answer

- Offer，在双方通讯时，呼叫方发送的 SDP 消息称为 Offer。
- Answer，在双方通讯时，被呼叫方发送的 SDP 消息称为 Answer。

在 WebRTC 中，双方协商的整个过程如下图所示：

<img src="https://static001.geekbang.org/resource/image/55/29/55971e410ce15be231b3f5fab0881e29.png?wh=1142*628" alt="img" style="zoom:48%;" />

首先，呼叫方创建 Offer 类型的 SDP 消息。创建完成后，调用 setLocalDescriptoin 方法将该 Offer 保存到本地 Local 域，然后通过信令将 Offer 发送给被呼叫方。

被呼叫方收到 Offer 类型的 SDP 消息后，调用 setRemoteDescription 方法将 Offer 保存到它的 Remote 域。作为应答，被呼叫方要创建 Answer 类型的 SDP 消息，Answer 消息创建成功后，再调用 setLocalDescription 方法将 Answer 类型的 SDP 消息保存到本地的 Local 域。最后，被呼叫方将 Answer 消息通过信令发送给呼叫方。至此，被呼叫方的工作就完部完成了。

接下来是呼叫方的收尾工作，呼叫方收到 Answer 类型的消息后，调用 RTCPeerConnecton 对象的 setRemoteDescription 方法，将 Answer 保存到它的 Remote 域。

**媒体协商的具体实现**

```js
//呼叫方创建Offer
function doCall() {
       console.log('Sending offer to peer');
  //如果 createOffer 函数调用成功的话，浏览器会回调我们设置的 setLocalAndSendMessage 方法，如果出错则会回调 handleCreateOfferError 方法。
       pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
  }  

  function setLocalAndSendMessage(sessionDescription) {
    //将本地 SDP 描述信息设置到 WebRTC 的 Local 域
      pc.setLocalDescription(sessionDescription);
    //通过信令通道将此会话描述发送给被呼叫方
      sendMessage(sessionDescription);
  }

```

```js
//被呼叫方收到offer
  socket.on('message', function(message) {
      ...
      } else if (message.type === 'offer') {
    		//设置呼叫方发送给它的 Offer 作为远端描述
          pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
      } else if (...) {
          ...
      }
      ....
  });

//被呼叫方调用 RTCPeerConnection 对象的 createAnswer 方法，它会生成一个与远程会话兼容的本地会话，并最终将该会话描述发送给呼叫方
 function doAnswer() {
     pc.createAnswer().then(
         setLocalAndSendMessage,
         onCreateSessionDescriptionError
     );
 }
 function setLocalAndSendMessage(sessionDescription) {
    //将本地 SDP 描述信息设置到 WebRTC 的 Local 域
      pc.setLocalDescription(sessionDescription);
    //通过信令通道将此会话描述发送给被呼叫方
      sendMessage(sessionDescription);
  }
```

#### WebRTC建立连接

在媒体协商过程中，如果双方能达成一致，也就是商量好了使用什么编解码器，确认了使用什么传输协议，那么接下来，WebRTC 就要建立连接，开始传输音视频数据了。

WebRTC建立连接需要考虑传输的高效性、保证端与端之间的连通性

基本概念

ICE Candidate （ICE 候选者）:它表示 WebRTC 与远端通信时使用的协议、IP 地址和端口

```js
//其中，候选者类型中的 host 表示本机候选者，srflx 表示内网主机映射的外网的地址和端口，relay 表示中继候选者。
{
  IP: xxx.xxx.xxx.xxx,
  port: number,
  type: host/srflx/relay,
  priority: number,
  protocol: UDP/TCP,
  usernameFragment: string
  ...
}
```

ICE其实就是获取各种类型Candidate的过程

收集Candidate

端对端的建立更主要的工作是 Candidate 的收集。

WebRTC 将 Candidate 分为三种类型：

- host 类型，即本机内网的 IP 和端口；
- srflx 类型, 即本机 NAT 映射后的外网的 IP 和端口；
- relay 类型，即中继服务器的 IP 和端口。

其中，host 类型优先级最高，srflx 次之，relay 最低

**收集srflx类型的Candidate**

NAT 的作用就是进行内外网的地址转换。这样当你要访问公网上的资源时，NAT 首先会将该主机的内网地址转换成外网地址，然后才会将请求发送给要访问的服务器；服务器处理好后将结果返回给主机的公网地址和端口，再通过 NAT 最终中转给内网的主机。

通过STUN协议就可以拿到我们的公网IP了

这里我们举个例子，看看通过 STUN 协议，主机是如何获取到自己的外网 IP 地址和端口的。

- 首先在外网搭建一个 STUN 服务器，现在比较流行的 STUN 服务器是 CoTURN，你可以到 GitHub 上自己下载源码编译安装。
- 当 STUN 服务器安装好后，从内网主机发送一个 binding request 的 STUN 消息到 STUN 服务器。
- STUN 服务器收到该请求后，会将请求的 IP 地址和端口填充到 binding response 消息中，然后顺原路将该消息返回给内网主机。此时，收到 binding response 消息的内网主机就可以解析 binding response 消息了，并可以从中得到自己的外网 IP 和端口。

**TURN协议**

> relay 服务是通过 TURN 协议实现的。所以我们经常说的 relay 服务器或 TURN 服务器它们是同一个意思，都是指中继服务器。

TURN 协议描述了如何获取 relay 服务器（即 TURN 服务器）的 Candidate 过程。其中最主要的是 Allocation 指令。通过向 TURN 服务器发送 Allocation 指令，relay 服务就会在服务器端分配一个新的 relay 端口，用于中转 UDP 数据报。

**NAT打洞/P2P穿越**

当收集到 Candidate 后，WebRTC 就开始按优先级顺序进行连通性检测了。它首先会判断两台主机是否处于同一个局域网内，如果双方确实是在同一局域网内，那么就直接在它们之间建立一条连接。

但如果两台主机不在同一个内网，WebRTC 将尝试 NAT 打洞，即 P2P 穿越，在 WebRTC 中，NAT 打洞是极其复杂的过程，它首先需要对 NAT 类型做判断，检测出其类型后，才能判断出是否可以打洞成功，只有存在打洞成功的可能性时才会真正尝试打洞。

#### Nat穿越

NAT的四种类型

完全锥型、IP 限制锥型、端口限制锥型和对称型。

<img src="https://static001.geekbang.org/resource/image/88/af/8836f91edfcc9a2420e3fd11098f95af.png?wh=1142*629" alt="img" style="zoom:48%;" />

当 host 主机通过 NAT 访问外网的 B 主机时，就会在 NAT 上打个“洞”，所有知道这个“洞”的主机都可以通过它与内网主机上的侦听程序通信

实际上，这里所谓的“打洞”就是在 NAT 上建立一个内外网的映射表。你可以将该映射表简单地认为是一个 4 元组

```js
{
  内网IP，
  内网端口，
  映射的外网IP，
  映射的外网端口
}
```

如果 host 主机与 B 主机“打洞”成功，且 A 与 C 从 B 主机那里获得了 host 主机的外网 IP 及端口，那么 A 与 C 就可以向该 IP 和端口发数据，而 host 主机上侦听对应端口的应用程序就能收到它们发送的数据。

<img src="https://static001.geekbang.org/resource/image/63/8a/6358816cf33831f22338cb26016d028a.png?wh=1142*617" alt="img" style="zoom:48%;" />

host 主机在 NAT 上“打洞”后，NAT 会对穿越洞口的 IP 地址做限制。只有登记的 IP 地址才可以通过，也就是说，只**有 host 主机访问过的外网主机才能穿越 NAT。**而其他主机即使知道“洞”的位置，也不能与 host 主机通信，因为在通过 NAT 时，NAT 会检查 IP 地址，如果发现发来数据的 IP 地址没有登记，则直接将该数据包丢弃。

所以，IP 限制锥型 NAT 的映射表是一个 5 元组，即：

```js
{
  内网IP，
  内网端口，
  映射的外网IP，
  映射的外网端口，
  被访问主机的IP
}
```

还是以上图为例，host 主机访问 B 主机，那么只有 B 主机发送的数据才能穿越 NAT，其他主机 A 和 C 即使从 B 主机那里获得了 host 主机的外网 IP 和端口，也无法穿越 NAT。因为 NAT 会对通过的每个包做检测，当检查发现发送者的 IP 地址与映射表中的“被访问主机的 IP”不一致，则直接将该数据包丢弃。

不光在 NAT 上对打洞的 IP 地址做了限制，而且还对具体的端口做了限制。因此，端口限制型 NAT 的映射表是一个 6 元组，其格式如下：

```js
{
  内网IP，
  内网端口，
  映射的外网IP，
  映射的外网端口，
  被访问主机的IP,
  被访问主机的端口
}
```

如上图所示，host 主机访问 B 主机的 p1 端口时，只有 B 主机的 p1 端口发送的消息才能穿越 NAT 与 host 主机通信。而其他主机，甚至 B 主机的 p2 端口都无法穿越 NAT。

<img src="https://static001.geekbang.org/resource/image/a8/7c/a80a2b1c98b8becce0c99e979fa3ba7c.png?wh=1142*617" alt="img" style="zoom:48%;" />

host 主机访问 B 时它在 NAT 上打了一个“洞”，而这个“洞”只有 B 主机上提供服务的端口发送的数据才能穿越，这一点与端口限制型 NAT 是一致的。但它与端口限制型 NAT 最大的不同在于，如果 host 主机访问 A 时，它会在 NAT 上重新开一个“洞”，而不会使用之前访问 B 时打开的“洞”。

也就是说对称型 NAT 对每个连接都使用不同的端口，甚至更换 IP 地址，而端口限制型 NAT 的多个连接则使用同一个端口，这对称型 NAT 与端口限制型 NAT 最大的不同

<img src="https://static001.geekbang.org/resource/image/b1/c3/b112ac2cd7e557d86dd5669e2858f6c3.png?wh=1142*857" alt="img" style="zoom:48%;" />

第一步，判断是否有 NAT 防护

1. 主机向服务器 #1 的某个 IP 和端口发送一个请求，服务器 #1 收到请求后，会通过同样的 IP 和端口返回一个响应消息。
2. 如果主机收不到服务器 #1 返回的消息，则说明用户的网络限制了 UDP 协议，直接退出。
3. 如果能收到包，则判断返回的主机的外网 IP 地址是否与主机自身的 IP 地址一样。如果一样，说明主机就是一台拥有公网地址的主机；如果不一样，就跳到下面的步骤 6。
4. 如果主机拥有公网 IP，则还需要进一步判断其防火墙类型。所以它会再向服务器 #1 发一次请求，此时，服务器 #1 从另外一个网卡的 IP 和不同端口返回响应消息。
5. 如果主机能收到，说明它是一台没有防护的公网主机；如果收不到，则说明有对称型的防火墙保护着它。
6. 继续分析第 3 步，如果返回的外网 IP 地址与主机自身 IP 不一致，说明主机是处于 NAT 的防护之下，此时就需要对主机的 NAT 防护类型做进一步探测。

第二步，探测 NAT 环境

1. 在 NAT 环境下，主机向服务器 #1 发请求，服务器 #1 通过另一个网卡的 IP 和不同端口给主机返回响应消息。
2. 如果此时主机可以收到响应消息，说明它是在一个完全锥型 NAT 之下。如果收不到消息还需要再做进一步判断。
3. 如果主机收不到消息，它向服务器 #2（也就是第二台服务器）发请求，服务器 #2 使用收到请求的 IP 地址和端口向主机返回消息。
4. 主机收到消息后，判断从服务器 #2 获取的外网 IP 和端口与之前从服务器 #1 获取的外网 IP 和端口是否一致，如果不一致说明该主机是在对称型 NAT 之下。
5. 如果 IP 地址一样，则需要再次发送请求。此时主机向服务器 #1 再次发送请求，服务器 #1 使用同样的 IP 和不同的端口返回响应消息。
6. 此时，如果主机可以收到响应消息说明是 IP 限制型 NAT，否则就为端口限制型 NAT。

至此，主机所在的 NAT 类型就被准确地判断出来了。有了主机的 NAT 类型你就很容易判断两个主机之间到底能不能成功地进行 NAT 穿越了。

WebRTC 中媒体协商完成之后，就会对 Candidate pair 进行连通性检测，其中非常重要的一项工作就是进行 NAT 穿越。它首先通过上面描述的方法进行 NAT 类型检测，当检测到双方理论上是可以通过 NAT 穿越时，就开始真正的 NAT 穿越工作，如果最终真的穿越成功了，通信双方就通过该连接将音视频数据源源不断地发送给对方。最终，你就可以看到音视频了。

对称型 NAT 与对称型 NAT 之间以及对称型 NAT 与端口限制型 NAT 之间无法打洞成功

#### 使用 RTCPeerConnection 来控制音视频数据的传输速率

之所以要进行传输速率的控制，是因为它会对音视频服务质量产生比较大的影响

举个简单的例子，假设你的带宽是 1Mbps，你想与你的朋友进行音视频通话，使用的视频分辨率为 720P，帧率是 15 帧 / 秒，你觉得你们通话时的音视频质量会好吗？

咱们来简单计算一下，根据经验值，帧率为 15 帧 / 秒、分辨率为 720P 的视频，每秒钟大约要产生 1.2～1.5Mbps 的流量。由此可知，你和你朋友在 1M 带宽的网络上进行通话，那通话质量一定会很差。因为你的“马路”就那么宽，却要跑超出它宽度的数据，这样超出带宽的数据会被直接丢弃掉，从而造成大量视频帧无法解码，所以最终效果一定会很差。

下面我从网络质量和数据两个方面列举了一些对音视频服务质量产生影响的因素：

- 网络质量，包括物理链路的质量、带宽的大小、传输速率的控制等；
- 数据，包括音视频压缩码率、分辨率大小、帧率等。

怎么判断服务质量是不是由于传输速率问题引起的呢？要想判断出是哪些因素引起的音视频服务质量变差，你就必须要知道这些因素的基本原理，下面我们就简要地对这些因素做些介绍。

1. 物理链路质量

2. 带宽大小

   带宽大小指的是每秒钟可以传输多少数据。比如 1M 带宽，它表达的是每秒钟可以传输 1M 个 bit 位，换算成字节就是 1Mbps/8 = 128KBps，也就是说 1M 带宽实际每秒钟只能传输 128K 个 Byte。

3. 传输速率

在实时通信中，与传输速率相关的有两个码率：音视频压缩码率和传输控制码率。

**音视频压缩码率**指的是单位时间内音视频被压缩后的数据大小，或者你可以简单地理解为压缩后每秒的采样率。它与视频的清晰度是成反比的，也就是压缩码率越高，清晰度越低。我们可以做个简单的对比，你应该清楚音视频编码被称为有损压缩，所谓的有损压缩就是数据被压缩后，就无法再还原回原来的样子；而与有损压缩对应的是无损压缩，它是指数据解压后还能还原回来，像我们日常中用到的 Zip、RAR、GZ 等这些压缩文件都是无损压缩。对于有损压缩，你设备的压缩码率越高，它的损失也就越大，解码后的视频与原视频的差别就越大。

**传输码率**是指对网络传输速度的控制。举个例子，假设你发送的每个网络包都是 1500 字节，如果每秒钟发 100 个包，它的传输码率是多少呢？即 100*1.5K = 150K 字节，再换算成带宽的话就是 150KB * 8 = 1.2M。但如果你的带宽是 1M，那每秒钟发 100 个包肯定是多了，这个时候就要控制发包的速度，把它控制在 1M 以内，并尽量地接近 1M，这样数据传输的速度才是最快的。

4. 分辨率与帧率

   通过减少帧率来控制码率的效果可能并不明显，因为在传输数据之前是要将原始音视频数据进行压缩的，在同一个 GOP（Group Of Picture）中，除了 I/IDR 帧外，B 帧和 P 帧的数据量是非常小的。因此，减少帧率的方式就没有降低分辨率方式效果明显了。

   > GOP 是一组帧，按25帧/秒，你在摄像头前停留一秒可以能没有做任务动作，那么摄像头就采集了 25帧一模一样的图片，这 25帧图片的相关系是不是很大呢？是不是只要保存一长完整的图片然后再保存每一帧图片之间的差异就会大在减少数据量呢？人们人为的将图片相关系比较大的一堆图像划分为一组，这样就可以进行压缩了

**传输速率的控制**

第一种是通过压缩码率这种“曲线救国”的方式进行控制；

第二种则是更直接的方式，通过控制传输速度来控制速率。（WebRTC底层控制）

```js

....

var vsender = null; //定义 video sender 变量
var senders = pc.getSenders(); //从RTCPeerConnection中获得所有的sender

//遍历每个sender
senders.forEach( sender => {
  if(sender && sender.track.kind === 'video'){ //找到视频的 sender
      vsender = sender; 
  }
});

var parameters = vsender.getParameters(); //取出视频 sender 的参数
if(!parameters.encodings){ //判断参数里是否有encoding域
    return;
}

//通过 在encoding中的 maxBitrate 可以限掉传输码率
parameters.encodings[0].maxBitrate = bw * 1000;

//将调整好的码率重新设置回sender中去，这样设置的码率就起效果了。
vsender.setParameters(parameters) 
       .then(()=>{
          console.log('Successed to set parameters!');
       }).catch(err => {
          console.error(err);
       })

...
```

上面的代码中，首先从 RTCPeerConnection 中获取视频的发送者，即 kind 为 video 的 sender；然后取出 sender 中的 parameters 对象，其中的 maxBitrate 属性就是用于控制传输码率的；将你期望的最大码率设置好后，再将 parameters 对象设置回去，这样 WebRTC 就可以控制某路流的码率大小了。

通过上面的代码你还可以看出，在 WebRTC 中速率的控制是使用压缩码率的方法来控制的，而不是直接通过传输包的多少来控制的。从另外一个角度你也可以得到这样的结论，因为 maxBitrate 属性来自于 sender 的 encoding 对象，而 encoding 对象就是进行编码时使用的参数。

总结：

①码率分为音视频压缩码率和传输控制码率；

 ②由于网络质量条件是不可控的（物理链路的质量、带宽的大小、传输速率的控制），所以webRTC只能通过对数据进行控制，让单位时间内发送的数据量降下来，那么可以增加音视频压缩码率或降低传输控制码率 

增加音视频压缩码率，可以直接对SDP中的sample rate/采样率（就是帧率吗）进行控制以减少数据大小，还可以降低分辨度（这些都是有损压缩，即压缩过程不可逆），这些我们可以主动控制的。

 降低传输控制码率，指的是不对源数据进行任何处理，而是强行降低发包速度，这可能会造成严重延迟，因此这个是webRTC自己控制的。

#### 关闭打开音视频

1. 将远端的声音静音

   （1）播放端控制,只需要添加muted静音属性即可

   ```html
   <video id=remote autoplay muted playsinline/>
   ```

   （2）播放端控制：丢掉音频流

   在收到远端的音视频流后，将远端的 AudioTrack 不添加到要展示的 MediaStream 中，也就是让媒体流中不包含音频流，这样也可以起到静音远端的作用。

   ```js
   
   ...
   var remoteVideo = document.querySelector('video#remote');
   ...
   {
       //创建与远端连接的对象
       pc = new RTCPeerConnection(pcConfig);
     ...
       //当有远端流过来时，触发该事件
       pc.ontrack = getRemoteStream;
       ...
   }
   ...
   
   function getRemoteStream(e){
       //得到远端的音视频流
     remoteStream = e.streams[0];
       //找到所有的音频流
       remoteStream.getAudioTracks().forEach((track)=>{
         if (track.kind === 'audio') { //判断 track 是类型
           //从媒体流中移除音频流    
           remoteStream.removeTrack(track);
         }
       }); 
       //显示视频 
     remoteVideo.srcObject = e.streams[0];
   }
   ...
   ```

   （3）发送端控制：不采集音频
   对于 1 对 1 实时直播系统来说，这两种方法的效果是一样的。但对于多对多来说，它们的效果就大相径庭了。因为停止采集音频后，所有接收该音频的用户都不能收到音频了，这显然与需求不符；

   本地想让远端静音时，首先向信令服务器发送一条静音指令，然后信令服务器向远端转发该指令，远端收到指令后就执行下面的代码：

   ```js
   
   ...
   
   //获取本地音视频流
   function gotStream(stream) {
       localStream = stream;
       localVideo.srcObject = stream;
   }
   
   //获得采集音视频数据时限制条件
   function getUserMediaConstraints() {
     
     var constraints =  { 
       "audio": false,
       "video": {
           "width": {
               "min": "640",
               "max": "1280"
           },
           "height": {
               "min": "360",
               "max": "720"
           }
       }
     };
     
     return constraints;
   }
   
   ...
   //采集音视频数据
   function captureMedia() {
       ...
       if (localStream) {
         localStream.getTracks().forEach(track => track.stop());
       }
         ...
         //采集音视频数据的 API
       navigator.mediaDevices.getUserMedia(getUserMediaConstraints())
         .then(gotStream)
         .catch(e => {
          ...
         });
   }
   ...
   ```

   （4）发送端控制：关闭通道

   本地想让远端静音时，向信令服务器发送一条静音指令，信令服务器进行转发，远端收到指令后执行下面的代码：

   ```js
   
     ...
     var localStream = null;
     
     //创建peerconnection对象
     var pc = new RTCPeerConnection(server);
     ...
     
     //获得流
     function gotStream(stream){
       localStream = stream;
     }
     ...
     
     //peerconnection 与 track 进行绑定 
     function bindTrack() {
       //add all track into peer connection
       localStream.getTracks().forEach((track)=>{
         if(track.kink !== 'audio') {
           pc.addTrack(track, localStream);
         }
       });
     }
     
     ...
   ```

   

2. 将自己的声音静音

   将自己的声音静音只需要在采集时停止对音频数据进行采集就可以了

3. 关闭远端的视频

   在前面讲解基本逻辑时，我们分析过关闭远端的视频有两种方法，一种是在显示端不将视频数据给 video 标签来达到不显示视频的效果，另一种是控制远端不发送数据。实际上这两种方式与将远端声音静音中的方法 2 和方法 4 是一样的，只不过在做类型判断时，需要将 ‘audio’ 修改为 ‘video’ 就好了。

4. 关闭自己的视频

在关闭本地视频时不是直接在采集的时候就不采集视频数据，而是不将视频数据与 RTCPeerConnection 对象进行绑定。具体的代码参考“将远端声音静音”中的方法 4。

#### WebRTC的数据统计

要查看 WebRTC 的统计数据，你不需要另外再开发一行代码，只要在 Chrome 浏览器下输入“chrome://webrtc-internals”这个 URL 就可以看到所有的统计信息了。但它有一个前提条件，就是你必须有页面创建了 RTCPeerConnection 对象之后，才可以通过这个 URL 地址查看相关内容。因为在 Chrome 内部会记录每个存活的 RTCPeerConnection 对象，通过上面的访问地址，就可以从 Chrome 中取出其中的具体内容。

<img src="https://static001.geekbang.org/resource/image/e4/32/e4f935f496ba580e10f272f7f8b16932.png?wh=1142*600" alt="img" style="zoom:50%;" />

从这张图中，你可以看到它统计到了以下信息：

接收到的音频轨信息，“…Track_receiver_5…”接收到的视频轨信息，“…Track_receiver_6…”发送的音频轨信息，“…Track_sender_5…”发送的视频轨信息，“…Track_sender_6…”……

从上面的描述中，可以看到，这些统计信息基本上包括了与音视频相关的方方面面。通过这些信息，就可以做各种各样的服务质量分析了。比如说通过接收到的音视频轨信息，你就能分析出你的网络丢包情况、传输速率等信息，从而判断出你的网络质量如何。

同时，我们可以通过WebRTC 提供的一个 API，getStats() 。通过该 API 你就可以获得上面讲述的所有信息了

```js
promise = rtcPeerConnection.getStats(selector)
```

#### WebRTC进行文本聊天

WebRTC 的数据通道（RTCDataChannel）是专门用来传输除了音视频数据之外的任何数据，所以它的应用非常广泛，如实时文字聊天、文件传输、远程桌面、游戏控制、P2P 加速等都是它的应用场景。

像文本聊天、文件传输这类应用，大多数人能想到的通常是通过服务器中转数据的方案，但 WebRTC 则优先使用的是 P2P 方案，即两端之间直接传输数据，这样就大大减轻了服务器的压力。

WebRTC 的 RTCDataChannel 使用的传输协议为 SCTP，即 Stream Control Transport Protocol。下面图表表示的就是在 TCP、UDP 及 SCTP 等不同传输模式下，数据传输的可靠性、传递方式、流控等信息的对比：

<img src="https://static001.geekbang.org/resource/image/33/83/33b5d2000a04b0a49b85f8b676727b83.png?wh=1142*534" alt="img" style="zoom:50%;" />

**配置 RTCDataChannel**

```js
...
var pc = new RTCPeerConnection(); //创建 RTCPeerConnection 对象
var dc = pc.createDataChannel("dc", options); //创建 RTCDataChannel对象
...
```

从上面的代码中可以看到 RTCDataChannel 对象是由 RTCPeerConnection 对象创建的，在创建 RTCDataChannel 对象时有两个参数。第一个参数是一个标签（字符串），相当于给 RTCDataChannel 起了一个名字；第二个参数是 options，其形式如下：

```js
var options = {
  ordered: false,
  maxPacketLifeTime: 3000
};
```

其实 options 可以指定很多选项，比如像上面所设置的，指定了创建的 RTCDataChannel 是否是有序的，以及最大的存活时间。

下面我就向你详细介绍一下 options 所支持的选项。

ordered：消息的传递是否有序。

maxPacketLifeTime：重传消息失败的最长时间。也就是说超过这个时间后，即使消息重传失败了也不再进行重传了。

maxRetransmits：重传消息失败的最大次数。

protocol：用户自定义的子协议，也就是说可以根据用户自己的业务需求而定义的私有协议，默认为空。

negotiated：如果为 true，则会删除另一方数据通道的自动设置。这也意味着你可以通过自己的方式在另一侧创建具有相同 ID 的数据通道。

id：当 negotiated 为 true 时，允许你提供自己的 ID 与 channel 进行绑定。

在上面的选项中，前三项是经常使用的，也是你要重点搞清楚的。不过需要特别说明的是， maxRetransmits 与 maxPacketLifeTime 是互斥的，也就是说这两者不能同时存在，只能二选一。

**实时文字聊天**

对于 RTCDataChannel 对象的创建主要有` In-band` 协商和` Out-of-band `协商两种方式。

In-band 协商方式

假设通信双方中的一方调用 createDataChannel 创建 RTCDataChannel 对象时，将 options 参数中的 negotiated 字段设置为 false，则通信的另一方就可以通过它的 RTCPeerConnection 对象的 ondatachannel 事件来得到与对方通信的 RTCDataChannel 对象了，这种方式就是 In-band 协商方式。

那 In-band 协商方式到底是如何工作的呢？下面我们就来详细描述一下。

- A 端调用 createDataChannel 创建 RTCDataChannel 对象。
- A 端与 B 端交换 SDP，即进行媒体协商（offer/answer）。
- 媒体协商完成之后，双方连接就建立成功了。
- 此时，A 端就可以向 B 端发送消息了。
- 当 B 端收到 A 端发的消息后，B 端的 ondatachannel 事件被触发，B 端的处理程序就可以从该事件的参数中获得与 A 端通信的 RTCDataChannel 对象。
- 需要注意的是，该对象与 A 端创建的 RTCDataChannel 具有相同的属性。此时双方的 RTCDataChannel 对象就可以进行双向通信了。

该方法的优势是 RTCDataChannel 对象可以在需要时自动创建，不需要应用程序做额外的逻辑处理。

Out-of-band 协商方式

RTCDataChannel 对象还能使用 Out-of-band 协商方式创建，这种方式不再是一端调用 createDataChannel，另一端监听 ondatachannel 事件，从而实现双方的数据通信；而是两端都调用 createDataChannel 方法创建 RTCDataChannel 对象，再通过 ID 绑定来实现双方的数据通信。具体步骤如下：

- A 端调用 createDataChannel({negotiated: true, id: 0}) 方法；
- B 也调用 createDataChannel({negotiated: true, id: 0}) 方法；
- 双方交换 SDP， 即进行媒体协商（ offer/answer）；
- 一旦双方连接建立起来，数据通道可以被立即使用，它们是通过 ID 进行匹配的（这里的 ID 就是上面 options 中指定的 ID，ID 号必须一致）。

这种方法的优势是，B 端不需等待有消息发送来再创建 RTCDataChannel 对象，所以双方发送数据时不用考虑顺序问题，即谁都可以先发数据，这是与 In-band 方式的最大不同，这也使得应用代码变得简单，因为你不需要处理 ondatachannel 事件了。

另外，需要注意的是，你选的 ID 不能是任意值。ID 值是从 0 开始计数的，也就是说你第一次创建的 RTCDataChannel 对象的 ID 是 0，第二个是 1，依次类推。所以这些 ID 只能与 WebRTC 实现协商的 SCTP 流数量一样，如果你使用的 ID 太大了，而又没有那么多的 SCTP 流的话，那么你的数据通道就不能正常工作了。

#### WebRTC中保证数据传输的安全

一般我们为了保证通信安全，可以对传输的数据进行加密，通常我们会选择非对称加密，他是使用两个密钥对其进行加解密，分为公钥和私钥，公钥加密，私钥解密，比对称加密要安全一些，对称加密是只有一个密钥

通过 DTLS 协议就可以有效地解决 A 与 B 之间交换公钥时可能被窃取的问题

解决双方通信交换公钥问题后，并不能保证通信安全，比如说A与B进行通信，但此时B是冒充的

场景：在会议系统或在线教育的小班课中，此时会议中有多人进行互动，如果黑客进入了会议中，他只需听别人说话，自己不发言，这样就将关键的信息窃取走了。所以现在的问题又来了，我们该如何辨别对方的身份是否合法呢？

webRTC就是通过SDP中的安全描述来辨别对方身份的合法性

```js

...
a=ice-ufrag:khLS
a=ice-pwd:cxLzteJaJBou3DspNaPsJhlQ
a=fingerprint:sha-256 FA:14:42:3B:C7:97:1B:E8:AE:0C2:71:03:05:05:16:8F:B9:C7:98:E9:60:43:4B:5B:2C:28:EE:5C:8F3
...
```

ice-ufrag 和 ice-pwd 是用户名和密码。当 A 与 B 建立连接时，A 要带着它的用户名和密码过来，此时 B 端就可以通过验证 A 带来的用户名和密码与 SDP 中的用户名和密码是否一致的，来判断 A 是否是一个合法用户了。

除此之外，fingerprint 也是验证合法性的关键一步，它是存放公钥证书的指纹（或叫信息摘要），在通过 ice-ufrag 和 ice-pwd 验证用户的合法性之余，还要对它发送的证书做验证，看看证书在传输的过程中是否被窜改了。

我们可以来看看整个的流程

<img src="https://static001.geekbang.org/resource/image/f4/8b/f4c9a00f7b6af630d9a23e913dec9f8b.png?wh=1142*975" alt="img" style="zoom:50%;" />

Webrtc 我们先进行媒体协商交换SDP，在sdp中记录了用户的用户名、密码、指纹

然后我们通过STUN协议进行身份认证，确认用户是否为合法用户

确认用户为合法用户后，进行DTLS协商，交换公钥证书以及协商密码相关的信息，同时还要通过 fingerprint 对证书进行验证，确认其没有在传输中被窜改。

最后我们需要将RTP协议升级为SRTP协议进行加密传输

- 首先通过信令服务器交换 SDP 信息，也就是进行媒体协商。在 SDP 中记录了用户的用户名、密码和指纹，有了这些信息就可以对用户的身份进行确认了。
- 紧接着，A 通过 STUN 协议（底层使用 UDP 协议）进行身份认证。如果 STUN 消息中的用户名和密码与交换的 SDP 中的用户名和密码一致，则说明是合法用户。
- 确认用户为合法用户后，则需要进行 DTLS 协商，交换公钥证书并协商密码相关的信息。同时还要通过 fingerprint 对证书进行验证，确认其没有在传输中被窜改。
- 最后，再使用协商后的密码信息和公钥对数据进行加密，开始传输音视频数据。

然后我们现在来详细的看一下这些过程

**使用STUN协议进行身份认证**

STUN协议我们一般用来获取公网IP和端口，或者是在TURN协议中发送 Allocation 指令，但他也可以用来进行身份认证

它主要是通过HMAC来实现，HMAC是哈希运算消息认证码，我们可以通过他进行消息完整性认证和信源身份认证，而我们对双方进行身份认证判断他是不是合法用户其实就是信源身份认证的过程

信源身份认证主要是因为通信双方共享了认证的密钥，接受方验证发送过来的消息，判断是否一致，从而确定发送方的身份合法性

HMAC运算利用hash算法，以一个消息M和一个密钥K作为输入，生成一个定长的消息摘要作为输出。

我们可以来看下整个过程

假设通信双方为A和B 

A发送 binging request，内容如下

计算出的 HMAC 结果存储在 STUN 的 `MESSAGE-INTEGRITY` 属性中。由于使用 SHA-1 哈希函数，所以计算出来的 HMAC 值固定为 20 字节,后面我将他简称为M-I值

发送方的M-I值是将M-I属性之前的内容作为消息M，然后将对方的密码作为密钥，将这俩利用hash算法生成定长的消息输出（这里得到对方的密码是通过之前的SDP消息交换中得到的offer中的 ice-ufrag 和 ice-pwd里面拿到的对方的密码）

然后接收方B收到这个请求，计算的伪代码如下，主要思路就是序列化消息后去掉 MI 属性作为消息，将其通过自己的密码作为密钥进行HAMC，得到M-I值，比较这个计算出来的MI值与binding-request的MI值是否一致，如果一致的话就认为A是合法用户

为啥呢，这里B的密码其实就充当了双方的密钥，B要确认他是真的在和A通信，如果对方真的是A的话，那么她就会有B的密码，那他通过hash加密的HMAC值就会和B这边验证计算出来的HMAC值一致

```js
// 去掉 8 字节大小的 Fingerprint 属性，
// 然后将消息序列化为字节，得到 stun_binary，
// 注意，不要去掉 MessageIntegrity 属性。
stun_msg = (header, 
  attributes[Username, MessageIntegrity, 
    Fingerprint])
// 将序列化后的消息去掉最后 24 字节的 M-I 属性，
// 得到更新后的 stun_binary。
stun_binary = 
  stun_msg.remove(Fingerprint).marshal_binary()
stun_binary = 
  stun_binary[0 : len(stun_binary) - 24]
// 生成 HMAC key。
key = password
// 计算 HMAC，得到 20 字节的 M-I 值。
h = hmac.new(hash.sha1, key);
h.update(stun_binary);
mi = h.Sum(null);
// 比较 mi 是否和消息携带的 M-I 值一致。
memcmp(
  stun_msg.attributes.MessageIntegrity.value, 
  mi, 20)
```



<img src="https://ucc.alicdn.com/pic/developer-ecology/9f608f26fff94055b12ba6ff0af8ff1a.png" alt="img" style="zoom:67%;" />

同理，B发送响应的binding-request，A验证他是不是真的在和B通信

<img src="https://ucc.alicdn.com/pic/developer-ecology/a5a86ce8b82446b6b184f690a4d3e049.png" alt="img" style="zoom:67%;" />

**DTLS协商**

我们主要是为了解决公钥是否被窃取的问题嘛，其实这里呢，DTLS进行交换的就是数字证书，他保证了这个公钥是真的

他的过程就是交换公钥证书以及协商密码相关的信息，比如用什么算法进行加密

然后我们再进行非对称加密的时候，交换的公钥就能够保证他是真的了，与此同时我们还得通过sdp信息中的fingerprint来验证公钥证书是否在传递的过程中被篡改了（这个其实就是数字签名，我们通过自己的私钥签名，在传输的过程中即使被黑客修改了证书信息，但黑客没有私钥他无法加密，就不能在接受方通过公钥解密的时候通过）

你可能会想到https中的TLS进行安全加密，为什么在WebRTC中是使用DTLS进行协商的嘞，因为https基于TCP协议，而WebRTC基于UDP协议，因此 WebRTC 对数据的保护无法直接使用 TLS 协议。但 TLS 协议在数据安全方面做得确实非常完善，所以人们就想到是否可以将 TLS 协议移植到 UDP 协议上呢？ 因此 DTLS 就应运而生了。

DTLS 就是运行在 UDP 协议之上的简化版本的 TLS，下图为详细的过程



<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230129170541693.png" alt="image-20230129170541693" style="zoom: 50%;" />

主要就是客户端向服务端发送 ClientHello 消息，服务端收到请求后，回 ServerHello 消息，并将自己的证书发送给客户端，同时请求客户端证书。客户端收到证书后，将自己的证书发给服务端，并让服务端确认加密算法。

然后下面的非对称加密过程主要是为了交换SRTP密钥，

我们知道webRTC通过RTP进行数据传输，但他对其中传输的数据并没有加密，如果通过抓包工具，如 Wireshark，将音视频数据抓取到后，通过该工具就可以直接将音视频流播放出来，这是非常恐怖的事情

所以我们需要使用SRTP协议

通过上面的非对称加密传输STRP密钥，将其作为音视频数据通信的对称密钥，这样安全传输对称密钥，通信双方使用对称密钥对音视频数据进行加解密，这样效率高，同时也确保音视频数据完整安全。

### 多人音视频实时通讯架构

- **Mesh 方案**，即多个终端之间两两进行连接，形成一个网状结构。比如 A、B、C 三个终端进行多对多通信，当 A 想要共享媒体（比如音频、视频）时，它需要分别向 B 和 C 发送数据。同样的道理，B 想要共享媒体，就需要分别向 A、C 发送数据，依次类推。这种方案对各终端的带宽要求比较高。
- **MCU（Multipoint Conferencing Unit）方案**，该方案由一个服务器和多个终端组成一个星形结构。各终端将自己要共享的音视频流发送给服务器，服务器端会将在同一个房间中的所有终端的音视频流进行混合，最终生成一个混合后的音视频流再发给各个终端，这样各终端就可以看到 / 听到其他终端的音视频了。实际上服务器端就是一个音视频混合器，这种方案服务器的压力会非常大。
- **SFU（Selective Forwarding Unit）方案**，该方案也是由一个服务器和多个终端组成，但与 MCU 不同的是，SFU 不对音视频进行混流，收到某个终端共享的音视频流后，就直接将该音视频流转发给房间内的其他终端。它实际上就是一个音视频路由转发器。

其中SFU 实现都支持 SVC 模式和 Simulcast 模式

1. Simulcast 模式

   所谓 Simulcast 模式就是指视频的共享者可以同时向 SFU 发送多路不同分辨率的视频流（一般为三路，如 1080P、720P、360P）。而 SFU 可以将接收到的三路流根据各终端的情况而选择其中某一路发送出去。例如，由于 PC 端网络特别好，给 PC 端发送 1080P 分辨率的视频；而移动网络较差，就给 Phone 发送 360P 分辨率的视频。

   Simulcast 模式对移动端的终端类型非常有用，它可以灵活而又智能地适应不同的网络环境。下图就是 Simulcast 模式的示意图：

![img](https://static001.geekbang.org/resource/image/07/30/079b88b254bb11887c093464b5737630.png?wh=619*183)

2. SVC 模式

   SVC 是可伸缩的视频编码模式。与 Simulcast 模式的同时传多路流不同，SVC 模式是在视频编码时做“手脚”。

   它在视频编码时将视频分成多层——核心层、中间层和扩展层。上层依赖于底层，而且越上层越清晰，越底层越模糊。在带宽不好的情况下，可以只传输底层，即核心层，在带宽充足的情况下，可以将三层全部传输过去。

   如下图所示，PC1 共享的是一路视频流，编码使用 SVC 分为三层发送给 SFU。SFU 根据接收端的情况，发现 PC2 网络状况不错，于是将 0、1、2 三层都发给 PC2；发现 Phone 网络不好，则只将 0 层发给 Phone。这样就可以适应不同的网络环境和终端类型了。

![img](https://static001.geekbang.org/resource/image/ef/02/ef4e0aa7d5053e822ada4b6e8987a502.png?wh=582*182)

#### 流媒体服务器

**Licode**

Licode 既可以用作 SFU 类型的流媒体服务器，也可以用作 MCU 类型的流媒体服务器。一般情况下，它都被用于 SFU 类型的流媒体服务器。

Licode 不仅仅是一个流媒体通信服务器，而且还是一个包括了媒体通信层、业务层、用户管理等功能的完整系统，并且该系统还支持分布式部署。Licode 是由 C++ 和 Node.js 语言实现。其中，媒体通信部分由 C++ 语言实现，而信令控制、用户管理、房间管理用 Node.js 实现。它的源码地址为：https://github.com/lynckia/licode 。下面这张图是 Licode 的整体架构图：

<img src="https://static001.geekbang.org/resource/image/80/45/80c24c5862342103b1b2dcb134b59d45.png?wh=1142*749" alt="img" style="zoom:50%;" />

通过这张图你可以看出，Licode 从功能层面来讲分成三部分，即 Nuve 、ErizoController 和 ErizoAgent 三部分，它们之间通过消息队列进行通信。

- Nuve 是一个 Web 服务，用于管理用户、房间、产生 token 以及房间的均衡负载等相关工作。它使用 MongoDB 存储房间和 token 信息，但不存储用户信息。
- ErizoController，用于管理控制，信令和非音视频数据都通过它接收。它通过消息队列与 Nuve 进行通信，也就是说 Nuve 可以通过消息队列对 ErizoController 进行控制。
- ErizoAgent，用于音视频流媒体数据的传输，可以分布式布署。ErizoAgent 与 ErizoController 的通信也是通过消息队列，信令消息通过 ErizoController 接收到后，再通过消息队列发给 ErizoAgent，从而实现对 ErizoAgent 进行控制。

但 Licode 也有以下一些缺点：

- 在 Linux 下目前只支持 Ubuntu 14.04 版本，在其他版本上很难编译通过。
- Licode 不仅包括了 SFU，而且包括了 MCU，所以它的代码结构比较重，学习和掌握它要花不少的时间。
- Licode 的性能一般， 如果你把流媒体服务器的性能排在第一位的话，那么 Licode 就不是特别理想的 SFU 流媒体服务器了。

**Janus-gateway**

Janus 是一个非常有名的 WebRTC 流媒体服务器，它是以 Linux 风格编写的服务程序，采用 C 语言实现，支持 Linux/MacOS 下编译、部署，但不支持 Windows 环境。

它是一个开源项目，其源码的编译、安装非常简单，只要按 GitHub 上的说明操作即可。源码及编译手册的地址为：https://github.com/meetecho/janus-gateway 。Janus 的部署也十分简单，具体步骤详见文档，地址为：https://janus.conf.meetecho.com/docs/deploy.html 

下面我们来看一下 Janus 的整体架构，其架构如下图所示：

<img src="https://static001.geekbang.org/resource/image/d9/f5/d9009bfef6537f9b2a803dc6ca80a3f5.png?wh=1142*762" alt="img" style="zoom:48%;" />

从上面的架构图中，你可以看出 Janus 分为两层，即应用层和传输层。

插件层又称为应用层，每个应用都是一个插件，可以根据用户的需要动态地加载或卸载掉某个应用。插件式架构方案是非常棒的一种设计方案，灵活、易扩展、容错性强，尤其适用于业务比较复杂的业务，但缺点是实现复杂，成本比较高。

在 Janus 中默认支持的插件包括以下几个。

- SIP：这个插件使得 Janus 成了 SIP 用户的代理，从而允许 WebRTC 终端在 SIP 服务器（如 Asterisk）上注册，并向 SIP 服务器发送或接收音视频流。
- ‘TextRoom：该插件使用 DataChannel 实现了一个文本聊天室应用。
- Streaming：它允许 WebRTC 终端观看 / 收听由其他工具生成的预先录制的文件或媒体。
- VideoRoom：它实现了视频会议的 SFU 服务，实际就是一个音 / 视频路由器。
- VideoCall：这是一个简单的视频呼叫的应用，允许两个 WebRTC 终端相互通信，它与 WebRTC 官网的例子相似（https://apprtc.appspot.com），不同点是这个插件要经过服务端进行音视频流中转，而 WebRTC 官网的例子走的是 P2P 直连。
- RecordPlay：该插件有两个功能，一是将发送给 WebRTC 的数据录制下来，二是可以通过 WebRTC 进行回放。

传输层包括媒体数据传输和信令传输。媒体数据传输层主要实现了 WebRTC 中需要有流媒体协议及其相关协议，如 DTLS 协议、ICE 协议、SDP 协议、RTP 协议、SRTP 协议、SCTP 协议等。

信令传输层用于处理 Janus 的各种信令，它支持的传输协议包括 HTTP/HTTPS、WebSocket/WebSockets、NanoMsg、MQTT、PfUnix、RabbitMQ。不过需要注意的是，有些协议是可以通过编译选项来控制是否安装的，也就是说这些协议并不是默认全部安装的。另外，Janus 所有信令的格式都是采用 Json 格式。

**Mediasoup**

Mediasoup 是推出时间不长的 WebRTC 流媒体服务器开源库，其地址为：https://github.com/versatica/mediasoup/ 。

Mediasoup 由应用层和数据处理层组成。应用层是通过 Node.js 实现的；数据处理层由 C++ 语言实现，包括 DTLS 协议实现、ICE 协议实现、SRTP/SRTCP 协议实现、路由转发等。

下面我们来看一下 Mediasoup 的架构图，如下所示：

<img src="https://static001.geekbang.org/resource/image/4c/a0/4cb7be0e4c7c40d9d72b635fb54ce4a0.png?wh=1142*915" alt="img" style="zoom:48%;" />

Mediasoup 把每个实例称为一个 Worker，在 Worker 内部有多个 Router，每个 Router 相当于一个房间。在每个房间里可以有多个用户或称为参与人，每个参与人在 Mediasoup 中由一个 Transport 代理。换句话说，对于房间（Router）来说，Transport 就相当于一个用户。

Transport 有三种类型，即 WebRtcTransport、PlainRtpTransport 和 PipeTransport。

- WebRtcTransport 用于与 WebRTC 类型的客户端进行连接，如浏览器。
- PlainRtpTransport 用于与传统的 RTP 类型的客户端连接，通过该 Transport 可以播放多媒体文件、FFmpeg 的推流等。
- PipeTransport 用于 Router 之间的连接，也就是一个房间中的音视频流通过 PipeTransport 传到另一个房间。

在每个 Transport 中可以包括多个 Producer 和 Consumer。Producer 表示媒体流的共享者，它又分为两种类型，即音频的共享者和视频的共享者。Consumer 表示媒体流的消费者，它也分为两种类型，即音频的消费者和视频的消费者。

Mediasoup 的实现逻辑非常清晰，它不关心上层应用该如何做，只关心底层数据的传输，并将它做到极致。

Mediasoup 底层使用 C++ 开发，使用 libuv 作为其异步 IO 事件处理库，所以保证了其性能的高效性。同时它支持了几乎所有 WebRTC 为了实时传输做的各种优化，所以说它是一个特别优秀的 WebRTC SFU 流媒体服务器。它与 Janus 相比，它更聚焦于数据传输的实时性、高效性、简洁性，而 Janus 相比 Mediasoup 做的事儿更多，架构和逻辑也更加复杂。所以对于想学习 WebRTC 流媒体服务器源码的同学来说，Mediasoup 是一个非常不错的项目。

**Medooze**

Medooze 是一款综合流媒体服务器，它不仅支持 WebRTC 协议栈，还支持很多其他协议，如 RTP、RTMP 等。其源码地址为：https://github.com/medooze/media-server 。下面我们来看一下 Medooze 的架构图：

<img src="https://static001.geekbang.org/resource/image/9b/9f/9baeed8af646af53c716c1e97e600a9f.png?wh=1142*706" alt="img" style="zoom:50%;" />

从大的方面来讲，Medooze 支持 RTP/RTCP、SRTP/SRCP 等相关协议，从而可以实现与 WebRTC 终端进行互联。除此之外，Medooze 还可以接入 RTP 流、RTMP 流等，因此你可以使用 GStreamer/FFmpeg 向 Medooze 推流，这样进入到同一个房间的其他 WebRTC 终端就可以看到 / 听到由 GStream/FFmpeg 推送上来的音视频流了。另外，Medooze 还支持录制功能，即上图中的 Recorder 模块的作用，可以通过它将房间内的音视频流录制下来，以便后期回放。

以上我们介绍的是 Medooze 的核心层，下面我们再来看看 Medooze 的控制逻辑层。Medooze 的控制逻辑层是通过 Node.js 实现的，Medooze 通过 Node.js 对外提供了完整的控制逻辑操作相关的 API，通过这些 API 你可以很容易的控制 Medooze 的行为了。

通过上面的介绍，我们可以知道 Medooze 与 Mediasoup 相比，两者在核心层实现的功能都差不多，但 Medooze 的功能更强大，包括了录制、推 RTMP 流、播放 FLV 文件等相关的操作，而 Mediasoup 则没有这些功能。不过 Medooze 也有一些缺点，尽管 Medooze 也是 C++ 开发的流媒体服务务器，使用了异步 IO 事件处理机制，但它使用的异步 IO 事件处理的 API 是 poll，poll 在处理异步 IO 事件时，与 Linux 下最强劲的异步 IO 事件 API epoll 相比要逊色不少，这导致它在接收 / 发送音视频包时性能比 Mediasoup 要稍差一些。

#### Medooze 是如何编译和构建

编译 Media-server-node

Media-server-node 是一个 Node.js 项目，其目录结构如下图所示：

<img src="https://static001.geekbang.org/resource/image/1b/2e/1b7e5aa7de762d7bd1606c0dbc14382e.png?wh=1142*409" alt="img" style="zoom:48%;" />

**src 目录**中存放的是 C++ 语言实现的 Native 代码，用于生成 JavaScript 脚本可以调用的 C++ 接口，从而使 JavaScript 编写的业务层代码可以调用 Medooze 核心层的 C++ 代码；

**lib 目录**里存放的是在 Node.js 端执行的，控制 Medooze 业务逻辑的 JavaScript 代码

**external 目录**中存放的是 Medooze 使用的第三方库，如 MP4v2 和 SRTP；

**media-server 目录**是一个比较重要的目录，它里面存放的是 Medooze 的核心代码，即 **C++ 实现的流媒体服务器代码**

这里需要注意的是，Media-server-node 中的 media-server 目录是一个独立的项目，它是通过外部链接引用到 Media-server-node 项目中的。它既可以随 Media-server-node 一起编译，也可以自己单独编译。

1. **构建 Media-server-node 项目**

构建 Media-server-node 项目非常简单，只需要执行下面的命令即可构建成功：

```shell
npm install medooze-media-server --save
```

实际上，在构建 Media-server-node 项目时，重点是对上面三个 C/C++ 目录（即 external、media-server、src）中的 Native 代码的构建。项目构建时会调用 node-gyp 命令将三个目录中的 C++ 代码编译成 Node.js 的 Native 插件，以供 JavaScript 脚本使用。

> 另外，Media-server-node 目录中的 binding.gyp 文件就是供 node-gyp 使用来构建 C++ Navtie 代码的规则文件。在执行上面的构建命令时，底层会调用 node-gyp 命令，node-gyp 以 binding.gyp 为输入，然后根据 binding.gyp 中的规则对 C++ Native 代码进行构建的。

下面我们就来看看，node-gyp 是如构建 C++ Native 代码的吧。

2. **node-gyp & GYP**

<img src="https://static001.geekbang.org/resource/image/6a/01/6ab82535c85296cdaba1da662045b701.png?wh=1142*628" alt="img" style="zoom:48%;" />

通过上图我们可以看到 gyp 命令是将 binding.gyp 文件生成 Makefile 文件，然后交给 make，最终将 Native 插件编译出来的。

GYP 规则含义表：

<img src="https://static001.geekbang.org/resource/image/56/7a/56359e4a988c2cfe2acaced69b974b7a.png?wh=1142*927" alt="img" style="zoom:50%;" />

**流媒体服务器 Medooze**

Medooze 的功能十分强大，通过它你既可以实现 SFU 类型的流媒体服务器，也可以实现 MCU 类型的流媒体服务器。而且，它还支持多种媒体流接入，也就是说，你除了可以通过浏览器（WebRTC）向 Medooze 分享音视频流之外，还可以使用 FFmpeg/VLC 等工具将 RTMP 协议的音视频流推送给 Meoodze。更加神奇的是，无论是 WebRTC 分享的音视频流还是 RTMP 格式的音视频流通过 Medooze 转发后，浏览器就可以将 FFmpeg/VLC 推的流显示出来，而 VLC 也可以将 WebRTC 分享的音视频显示出来，这就是 Medooze 的强大之处。

1. **Medooze 的 SFU 模型**

<img src="https://static001.geekbang.org/resource/image/f9/94/f9d36818221629f67f06a49eb4003294.png?wh=1142*578" alt="img" style="zoom:48%;" />

图的最外层标有 Browser 的模块表示浏览器，在本图中就是表示基于浏览器的 WebRTC 终端。

图的中间标有 Medooze 的模块是服务器，实现了 SFU 功能。其中 DTLSICETransport 既是传输层（控制 socket 收发包），也是一个容器，在该容器中可以放 IncomingStream 和 OutgoingStream。

- IncomingStream，代表某客户端共享的音视频流。
- OutgoingStream，代表某个客户端需要观看的音视频流。

有了上面这些概念，那我们来看看在 Medooze 中从一端进来的音视频流是怎么中转给其他人的。

- 首先，Browser 1 推送音视频流给 Medooze，Medooze 通过 DTLSICETransport 接收音视频数据包，然后将它们输送到 IncomingStream 中。
- 然后，Medooze 再将此流分发给 Browser 2、Browser 3、Browser 4 的 OutgoingStream。
- 最后，Medooze 将 OutgoingStream 中的音视频流通过 DTLSICETransport 传输给浏览器客户端，这样 Browser 2、Browser 3、Browser 4 就都能看到 Browser 1 共享的音视频流了。

2. **录制回放模型**

<img src="https://static001.geekbang.org/resource/image/22/c6/22f170520f6cb6f1f786472b946b3fc6.png?wh=1142*747" alt="img" style="zoom:48%;" />

这张图是一个典型的音视频会议中服务器端录制的模型。下面我们就来看看它运转的过程：

- Browser 1 推送音视频流到 Medooze，Medooze 使用 IncomingStream 代表这一路流。
- Medooze 将 IncomingStream 流分发给参会人 Browser 2 的 OutgoingStream，并同时将流分发给 Recorder。
- Recorder 是一个录制模块，将实时 RTP 流转换成 MP4 格式，并保存到磁盘。

通过以上步骤，Medooze 就完成了会议中实时录制的功能。如果，用户想回看录制好的多媒体文件，那么只需要按以下步骤操作即可：

- 首先，告诉 Medooze 的 Player 模块，之前录制好的 MP4 文件存放在哪个路径下。
- 接着，Player 从磁盘读取 MP4 文件，并转换成 RTP 流推送给 IncomingStream。然后，Medooze 从 IncomingStream 获取 RTP 流， 并分发给 Browser 3 的 OutgoingStream。
- 最后，再经过 DTLSICETransport 模块传给浏览器。这样就可以看到之前录制好的音视频了。

3. 推流模型

<img src="https://static001.geekbang.org/resource/image/1d/8e/1d5eb2f6019e8a1685f05a8f70dcf38e.png?wh=1142*559" alt="img" style="zoom:48%;" />

通过前面的讲解，再理解这个模型就非常简单了。下面让我们来看一下推流的场景吧：

- 首先，用 VLC 播放器推送一路 RTP 流到 Medooze。
- 然后，Medooze 将此流分发给 Browser 2、Browser 3、Browser 4。

这里我们对 media-server-node 源码目录结构做一个简要的说明，一方面是给你一个大概的介绍，另一方面也做一个铺垫，便于我们后续的分析。

<img src="https://static001.geekbang.org/resource/image/b8/ef/b871ba25a899ae1692fd67b75909e2ef.png?wh=1142*1653" alt="img" style="zoom:50%;" />

从大的方面讲， Medooze 结构可以分为三大部分，分别是:

- **media server node**，主要是 ICE 协议层的实现，以及对 Media server Native API 的封装。
- **SWIG node addon**，主要是实现了 Node.js JavaScript 和 C++ Native 之间的融合，即可以让 JavaScript 直接调用 C/C++ 实现的接口
- **media server**，是 Medooze 流媒体服务器代码的实现，比如 WebRTC 协议栈、网络传输、编解码的实现等，都是在该模块实现的。

让我们看一下 Medooze 整体结构中三个核心组件的作用，以及它们之间的相互依赖关系。如下图所示：

<img src="https://static001.geekbang.org/resource/image/4e/3e/4e280e6884f1a6e1b3123617c820e73e.png?wh=1142*997" alt="img" style="zoom:67%;" />

从这张图我们可以知道，Medooze 的整体结构也是蛮复杂的，但若仔细观察，其实也不是很难理解。

下面我们就来详细描述一下这张图吧！

- 图中标有 WebRTC 的组件实现了 WebRTC 协议栈，它是用于实现多方音视频会议的。
- Recorder 相关的组件是实现录制的，这里录制格式是 MP4 格式。Player 相关组件是实现录制回放的，可以将 MP4 文件推送到各个浏览器，当然是通过 WebRTC 协议了。
- Streamer 相关组件是接收 RTP 流的，你可以通过 VLC 客户端推送 RTP 流给 Medooze，Medooze 然后再推送给各个浏览器。

SWIG（Simplified Wrapper and Interface Generator ），是一个将 C/C++ 接口转换成其他脚本语言（如 JavaScript、Ruby、Perl、Tcl 和 Python）的接口转换器，可以将你想暴露的 C/C++ API 描述在一个后缀是 *.i 的文件里面，然后通过 SWIG 编译器就可以生成对应脚本语言的 Wrapper 程序了，这样对应的脚本语言（如 JavaScript）就可以直接调用 Wrapper 中的 API 了。生成的代码可以在脚本语言的解释器平台上执行，从而实现了脚本语言调用 C/C++ 程序 API 的目的。SWIG 只是代码生成工具，它不需要依赖任何平台和库。

**一对多直播系统RTMP/HLS**

从技术角度来讲，映客、斗鱼这类娱乐直播与在线教育、音视频会议直播有着非常大的区别。在线教育、音视频会议这类直播属于**实时互动直播**，主要考虑传输的实时性，因此一般使用 **UDP** 作为底层传输协议；而娱乐直播对实时性要求不高，更多关注的是画面的质量、音视频是否卡顿等问题，所以一般采用 **TCP** 作为传输协议。我们称前者为实时互动直播，后者为传统直播。

**传统直播技术使用的传输协议是 RTMP 和 HLS。**其中，RTMP 是由 Adobe 公司开发的，虽然不是国际标准，但也算是工业标准，在 PC 占有很大的市场；而 HLS 是由苹果公司开发的，主要用在它的 iOS 平台，不过 Android 3 以后的平台也是默认支持 HLS 协议的。

我们先来看一下传统直播的基本架构图，如下图所示：

![img](https://static001.geekbang.org/resource/image/65/24/65e38dc6f7d1ca989571ee685da25324.png?wh=1142*765)

从图中可以看出，传统直播架构由**直播客户端、信令服务器和 CDN 网络**这三部分组成。下面我们就来一一分析下这每个模块的功能以及它们彼此之间的联系。

**直播客户端**主要包括音视频数据的采集、编码、推流、拉流、解码与播放这几个功能。

但实际上，这几个功能并不是放在同一个客户端中实现的。为什么呢？因为作为主播来说，他不需要看到观众的视频或听到观众的声音；而作为观众来讲，他们与主播之间是通过文字进行互动的，因此也不需要分享自己的音视频。

所以用过快手、映客等这类产品的同学都知道，客户端按用途可分为两类，一类是主播使用的客户端，包括音视频数据采集、编码和推流功能；另一类是观众使用的客户端，包括拉流、解码与渲染（播放）功能。

对于主播客户端来说，它可以从 PC 或移动端设备的摄像头、麦克风采集数据，然后对采集到的音视频数据进行编码，最后将编码后的音视频数据按 RTMP 协议推送给 CDN 源节点（RTMP 接入服务器）。

对于观众客户端来说，它首先从直播管理系统中获取到房间的流媒体地址，然后通过 RTMP 协议从边缘节点拉取音视频数据，并对获取到的音视频数据进行解码，最后进行视频的渲染与音频的播放。

**信令服务器，**主要用于接收信令，并根据信令处理一些和业务相关的逻辑，如创建房间、加入房间、离开房间、送礼物、文字聊天等。

实际上，这部分功能并不是很复杂，但有一点需要你特别注意，那就是聊天消息的处理。我们来举个例子，在一个有 10000 人同时在线的房间里，如果其中一个用户发送了文字消息，那么服务端收到该消息之后就要给 10000 人转发。如果主播说“请能听到我声音的人回复 1”，那这时 10000 人同时发消息，服务端要转发多少条呢？要转发 10000 * 10000 = 1 亿条消息。这对于任何一台服务器来说，都会产生灾难性的后果。所以，在开发直播系统的信令服务器时，**一定要关注和防止消息的洪泛。**

**CDN 网络**，主要用于媒体数据的分发。它内部的实现非常复杂，我们姑且先把它当作是一个黑盒子，然后只需要知道传给它的媒体数据可以很快传送给全世界每一个角落。换句话说，你在全世界各地，只要接入了 CDN 网络，你都可以快速看到你想看到的“节目”了。

介绍完直播客户端、信令服务器和 CDN 网络之后，我们再来来看看主**播到底是如何将自己的音视频媒体流进行分享的。**

主播客户端在分享自己的音视频媒体流之前，首先要向信令服务器发送“创建房间”的信令（红圈标出的步骤 1）；信令服务器收到该信令后，给主播客户端返回一个推流地址（CDN 网络源站地址）；此时，主播客户端就可以通过音视频设备进行音视频数据的采集和编码，生成 RTMP 消息，最终将媒体流推送给 CDN 网络（红圈标出的步骤 2）。

无论主播端使用的是 PC 机还是移动端，其推流步骤都是一样的，所以从上面的架构图中我们也可以看出步骤 3、步骤 4 与步骤 1、步骤 2 是一致的。

当观众端想看某个房间里的节目时，首先也要向信令服务器发消息，不过发送的可不是 “创建房间” 消息了，而是 “加入房间”，也就是步骤 5；服务端收到该信令后，会根据用户所在地区，分配一个与它最接近的“CDN 边缘节点”；观众客户端收到该地址后，就可以从该地址拉取媒体流了，即步骤 6。

需要注意的是，在传统直播系统中，一般推流都使用的 RTMP 协议，而拉流可以选择使用 RTMP 协议或者 HLS 协议。

**CDN 网络的实现**

CDN 网络的构造十分复杂（如下图所示），一般情况下，它先在各运营商内构建云服务，然后再将不同运营商的云服务通过光纤连接起来，从而实现跨运营商的全网 CDN 云服务。

![img](https://static001.geekbang.org/resource/image/c3/46/c31165d01a6772bbcc44a0981a6be446.png?wh=1142*750)

而每个运营商云服务内部包括了多个节点，按功能分为 3 类。

- 源节点，用于接收用户推送的媒体流。
- 主干结点，起到媒体数据快速传递的作用，比如与其他运营商传送媒体流。
- 边缘节点，用于用户来主动接流。一般边缘节点的数量众多，但机子的性能比较低，它会被布署到各地级市，主要解决网络最后一公里的问题。

接下来，我们简要描述一下 CDN 网络的处理流程。

当一个主播想将自己的音视频共享出去的时候，首先通过直播系统的信令服务器获取到可以推送媒体流的 CDN 源节点。CDN 网络从源节点接收到媒体数据后，会主动向各个主干结点传送流媒体数据，这样主干结点就将媒体数据缓存起来了。当然这个缓冲区的大小是有限的，随着时间流逝，缓冲区中的数据也在不断更替中。

当有观众想看某个主播的节目时，会从直播系统的信令服务器获取离自己最近的 CDN 边缘节点，然后到这个边缘节点去拉流。由于他是第一个在该节点拉流的用户，因此该 CDN 边缘节点还没有用户想到的媒体流，怎么办呢？那就向主干结点发送请求。主干结点收到请求后，从自己的缓冲区中取出数据流源源不断地发给边缘节点，这时边缘节点再将媒体数据发给观众。

当第二个观众再次到该 CDN 边缘节点接流时，该节点发现该流已经在自己的缓存里了，就不再向主干结点请求，直接将媒体流下发下去了。因此，观众在使用 CDN 网络时会发现，第一个观众在接流时需要花很长时间才能将流拉下来，可是后来的用户很快就将流拉下来进行播放了。

以上就是 CDN 网络的基本原理，接下来我们再来看看 RTMP 协议与 HLS 协议的比较。

**RTMP 介绍**

RTMP，全称 Real Time Messaging Protocol ，即实时消息协议。**但它实际上并不能做到真正的实时，一般情况最少都会有几秒到几十秒的延迟，底层是基于 TCP 协议的**。

RTMP 的传输格式为 **RTMP Chunk Format**，媒体流数据的传输和 RTMP 控制消息的传输都是基于此格式的。需要注意的是，在使用 RTMP 协议传输数据之前，RTMP 也像 TCP 协议一样，先进行三次握手才能将连接建立起来。当 RTMP 连接建立起来后，你可以通过 RTMP 协议的控制消息为通信的双方设置传输窗口的大小（缓冲区大小）、传输数据块的大小等。

1. **优势**

- RTMP 协议在苹果公司宣布其产品不支持 RTMP 协议，且推出 HLS 技术来替代 RTMP 协议的“打压”下，已停止更新。但协议停止更新后，这么多年仍然屹立不倒，说明该协议肯定有它独特的优势。那有哪些呢？
- RTMP 协议底层依赖于 TCP 协议，不会出现丢包、乱序等问题，因此音视频业务质量有很好的保障。
- 使用简单，技术成熟。有现成的 RTMP 协议库实现，如 FFmpeg 项目中的 librtmp 库，用户使用起来非常方便。而且 RTMP 协议在直播领域应用多年，技术已经相当成熟。
- 市场占有率高。在日常的工作或生活中，我们或多或少都会用到 RTMP 协议。如常用的 FLV 文件，实际上就是在 RTMP 消息数据的最前面加了 FLV 文件头。
- 相较于 HLS 协议，它的实时性要高很多。

2. **劣势**

RTMP 有优势，也有劣势。在 RTMP 的众多劣势中，我认为最为关键的有两条。

- 苹果公司的 iOS 不支持 RTMP 协议，按苹果官方的说法， RTMP 协议在安全方面有重要缺陷。
- 在苹果的公司的压力下，Adobe 已经停止对 RTMP 协议的更新了。

可以看出 RTMP 协议已经失去了未来，只是由于目前没有更好的协议可以直接代替它，所以它还能“苟延残喘”存活几年。但它最终一定会消亡，这是毋庸置疑的。

**HLS 介绍**

HLS，全称 HTTP Live Streaming，是苹果公司实现的基于 HTTP 的流媒体传输协议。它可以支持流媒体的直播和点播，主要应用在 iOS 系统和 HTML5 网页播放器中。

当播放器获取 HLS 流时，它首先根据时间戳，通过 HTTP 服务，从 m3u8 索引文件获取最新的 ts 视频文件切片地址，然后再通过 HTTP 协议将它们下载并缓存起来。当播放器播放 HLS 流时，播放线程会从缓冲区中读出数据并进行播放。

通过上面的描述我们可以知道，**HLS 协议的本质就是通过 HTTP 下载文件，然后将下载的切片缓存起来。**由于切片文件都非常小，所以可以实现边下载边播的效果。HLS 规范规定，播放器至少下载一个 ts 切片才能播放，所以 HLS 理论上至少会有一个切片的延迟。

1. **优势**

- HLS 是为了解决 RTMP 协议中存在的一些问题而设计的，所以，它自然有自己的优势。主要体现在以下几方面：
- RTMP 协议没有使用标准的 HTTP 接口传输数据，在一些有访问限制的网络环境下，比如企业网防火墙，是没法访问外网的，因为企业内部一般只允许 80/443 端口可以访问外网。而 HLS 使用的是 HTTP 协议传输数据，所以 HLS 协议天然就解决了这个问题。
- HLS 协议本身实现了码率自适应，不同带宽的设备可以自动切换到最适合自己码率的视频进行播放。
- 浏览器天然支持 HLS 协议，而 RTMP 协议需要安装 Flash 插件才能播放 RTMP 流。

2. **不足**

- HLS 最主要的问题就是实时性差。由于 HLS 往往采用 10s 的切片，所以最小也要有 10s 的延迟，一般是 20～30s 的延迟，有时甚至更差。
- HLS 之所以能达到 20～30s 的延迟，主要是由于 HLS 的实现机制造成的。HLS 使用的是 HTTP 短连接，且 HTTP 是基于 TCP 的，所以这就意味着 HLS 需要不断地与服务器建立连接。TCP 每次建立连接时都要进行三次握手，而断开连接时，也要进行四次挥手，基于以上这些复杂的原因，就造成了 HLS 延迟比较久的局面。

**如何选择 RTMP 和 HLS**

分析完 RTMP 和 HLS 各自的优势和劣势后，接下来我们就结合项目实践，对这二者的使用场景做一些建议。

- 流媒体接入，也就是推流，应该使用 RTMP 协议。
- 流媒体系统内部分发使用 RTMP 协议。因为内网系统网络状况好，使用 RTMP 更能发挥它的高效本领。
- 在 PC 上，尽量使用 RTMP 协议，因为 PC 基本都安装了 Flash 播放器，直播效果要好很多。
- 移动端的网页播放器最好使用 HLS 协议。
- iOS 要使用 HLS 协议，因为不支持 RTMP 协议。
- 点播系统最好使用 HLS 协议。因为点播没有实时互动需求，延迟大一些是可以接受的，并且可以在浏览器上直接观看。

**HLS：实现一对多直播系统的必备协议**

从 HLS 直播架构、FFmpeg 生成 HLS 切片、HLS m3u8 格式和 HLS TS 格式这四个方面对 HLS 协议的细节做一下介绍。

**HLS 直播架构**

下面我们来看一下 HLS 直播系统的架构图，如下所示：

![img](https://static001.geekbang.org/resource/image/c8/7a/c824a7d2fc85aa9583e10bc0dbff407a.png?wh=1142*800)

传统直播系统大致分为三部分：直播客户端、信令服务和 CDN 网络，使用 HLS 协议也是如此。只不过在我们这里为了简化流程，去掉了信令服务系统。

如上图所示，客户端采集媒体数据后，通过 RTMP 协议将音视频流推送给 CDN 网络的源节点（接入节点）。源节点收到音视频流后，再通过 Convert 服务器将 RTMP 流切割为 HLS 切片文件，即 .ts 文件。同时生成与之对应的 m3u8 文件，即 HLS 播放列表文件。

切割后的 HLS 分片文件（.ts 文件）和 HLS 列表文件（.m3u8 文件）经 CDN 网络转发后，客户端就可以从离自己最近的 CDN 边缘节点拉取 HLS 媒体流了。

在拉取 HLS 媒体流时，客户端首先通过 HLS 协议将 m3u8 索引文件下载下来，然后按索引文件中的顺序，将 .ts 文件一片一片下载下来，然后一边播放一边缓冲。此时，你就可以在 PC、手机、平板等设备上观看直播节目了。

对于使用 HLS 协议的直播系统来说，最重要的一步就是切片。源节点服务器收到音视频流后，先要数据缓冲起来，保证到达帧的所有分片都已收到之后，才会将它们切片成 TS 流。

为了便于分析，本文是通过 FFmpeg 工具将 MP4 文件切割成 HLS 格式的文件切片。但不管选择使用哪一种切割文件的方法或工具，生成的切片和索引文件的格式都是一致的。

**FFmpeg 生成 HLS 切片**

这里我们是通过 FFmpeg 工具将一个 MP4 文件转换为 HLS 切片和索引文件的。所以，你需要预先准备一个 MP4 文件，并且下载好 FFmpeg 工具。你可以从FFmpeg 官网下载二进制包，也可以通过下载源码自行编译出 FFmpeg 工具。FFmpeg 用于将 MP4 切片成 HLS 的命令如下：

```shell
ffmpeg -i test.mp4 -c copy -start_number 0 -hls_time 10 -hls_list_size 0 -hls_segment_filename test%03d.ts index.m3u8
```

该命令参数说明如下：

- -i ，输入文件选项，可以是磁盘文件，也可以是媒体设备。
- -c copy，表示只是进行封装格式的转换。不需要将多媒体文件中的音视频数据重新进行编码。
- -start_number，表示 .ts 文件的起始编号，这里设置从 0 开始。当然，你也可以设置其他数字。
- -hls_time，表示每个 .ts 文件的最大时长，单位是秒。这里设置的是 10s，表示每个切片文件的时长，为 10 秒。当然，由于没有进行重新编码，所以这个时长并不准确。
- -hls_list_size，表示播放列表文件的长度，0 表示不对播放列表文件的大小进行限制。
- -hls_segment_filename，表示指定 TS 文件的名称。
- index.m3u8，表示索引文件名称。

执行完这条命令后，在当前路径下会生成一系列 .ts 文件和 index.m3u8 文件。下面，我们再分别分析一下 .m3u8 文件格式和 .ts 文件格式。

**m3u8 格式分析**

正如前面讲到，HLS 必须要有一个 .m3u8 的索引文件 。它是一个播放列表文件，文件的编码必须是 UTF-8 格式。这里我们将前面生成的 .m3u8 文件内容展示一下，以便让你有个感观的认识。内容如下：

```js
#EXTM3U
#EXT-X-VERSION:3         // 版本信息
#EXT-X-TARGETDURATION:11 //每个分片的目标时长
#EXT-X-MEDIA-SEQUENCE:0  //分片起始编号
#EXTINF:10.922578,       //分片实际时长
test000.ts               //分片文件
#EXTINF:9.929578,        //第二个分片实际时长
test001.ts               //第二个分片文件
... 
```

这里截取了分片列表文件开头部分的内容，可以看出文件内容要么是以#字母开头，要么就是没有#字母。关于文件格式规范，RFC8216 草案第四节有详细的说明，你可以到那里查看详细的内容。

RFC8216 规定，.m3u8 文件内容以#字母开头的行是注释和 TAG，其中 TAG 必须是#EXT 开头，如上面示例中的内容所示。接下来，我们对这几个 TAG 做一下说明：

- EXTM3U 表示文件是第一个扩展的 M3U8 文件，此 TAG 必须放在索引文件的第一行。
- EXT-X-VERSION: n 表示索引文件支持的版本号，后面的数字 n 是版本号数字。需要注意的是，一个索引文件只能有一行版本号 TAG，否则播放器会解析报错。
- EXT-X-TARGETDURATION: s 表示 .ts 切片的最大时长，单位是秒（s）。
- EXT-X-MEDIA-SEQUENCE: number 表示第一个 .ts 切片文件的编号。若不设置此项，就是默认从 0 开始的。
- EXTINF: duration, title 表示 .ts 文件的时长和文件名称。文件时长不能超过#EXT-X-TARGETDURATION中设置的最大时长，并且时长的单位应该采用浮点数来提高精度。

**TS 格式分析**

TS 流最早应用于数字电视领域，其格式非常复杂，包含的配置信息表多达十几个。TS 流中的视频格式是 MPEG2 TS ，格式标准是在 ISO-IEC 13818-1 中定义的。

苹果推出的 HLS 协议对 MPEG2 规范中的 TS 流做了精减，只保留了两个最基本的配置表 PAT 和 PMT，再加上音视频数据流就形成了现在的 HLS 协议。也就是说， HLS 协议是由 PAT + PMT + TS 数据流组成的。其中，TS 数据中的视频数据采用 H264 编码，而音频数据采用 AAC/MP3 编码。TS 数据流示意图如下所示：

![img](https://static001.geekbang.org/resource/image/21/3b/218e0c1907aa9454fc52f09971f72d3b.png?wh=1142*260)

我们再进一步细化，TS 数据流由 TS Header 和 TS Payload 组成。其中，TS Header 占 4 字节，TS Payload 占 184 字节，即 TS 数据流总长度是 188 字节。

TS Payload 又由 PES Header 和 PES Payload 组成。其中，PES Payload 是真正的音视频流，也称为 ES 流。

- PES（Packet Elementary Stream）是将 ES 流增加 PES Header 后形成的数据包。
- ES（Elementary Stream），中文可以翻译成基流，是编码后的音视频数据。

下面我们就来分析一下 TS 数据流的格式，如下图所示：

![img](https://static001.geekbang.org/resource/image/da/b3/daa454df3de7549315e23c8c6aba90b3.png?wh=1142*566)

这是 TS Header 各个字段的详细说明，图中数字表示长度，如果数字后面带有 bytes ，单位就是 bytes；否则，单位都是 bit。

TS Header 分为 8 个字段，下面我们分别解释一下：

![img](https://static001.geekbang.org/resource/image/69/d5/694380ee55bd65f07bc8add74d7cf6d5.png?wh=1142*909)

另外，PTS（Presentation Tmestamp） 字段总共包含了 40 bit，高 4 个 bit 固定取值是 0010；剩下的 36 个 bit 分三部分，分别是：3 bit+1 bit 标记位；15 bit+1 bit 标记位；15 bit+1 bit 标记位。

通过以上的描述我们就将 HLS 协议中最重要的 TS 数据流向你介绍清楚了。

**FLV：适合录制的多媒体格式**

虽然苹果拒绝使用 RTMP 协议并推出了自己的 HLS 技术，但大多数用户仍然还是使用 RTMP 协议作为传统直播系统的传输协议。在 Adobe 宣布不再对 RTMP 技术进行支持的情况下，仍然还有这么多用户在使用它，说明 RTMP 协议具有其他协议不可比拟的优势。

这里我们做个对比，你就知道 RTMP 协议的优势在哪里了。

- 首先，与 HLS 技术相比，RTMP 协议在传输时延上要比 HLS 小得多。主要原因在于 HLS 是基于切片（几秒钟视频的小文件）、然后缓存的技术，这种技术从原理上就比直接进行数据传输慢很多，事实也证明了这一点。
- 其次，相对于 RTP 协议，RTMP 底层是基于 TCP 协议的，所以它不用考虑数据丢包、乱序、网络抖动等问题，极大地减少了开发人员的工作量；而使用 RTP 协议，网络质量的保障都需要自己来完成。
- 最后，与现在越来越火的 WebRTC 技术相比，RTMP 也有它自己的优势。虽然在实时传输方面 WebRTC 甩 RTMP 技术几条街，但对于实时性要求并没有那么高的传统直播来说，RTMP 协议在音视频的服务质量上普遍要好于 WebRTC 的音视频服务质量。

这下你知道 RTMP 协议为什么会存活这么久了吧。那说了这么多，RTMP 协议与 FLV 又有什么关系呢？实际上，FLV 文件与 RTMP 之间是“近亲”关系，甚至比“近亲”还要近，亲得就好像是“一个人”似的。

**FLV 文件格式**

我们先来看一下 FLV 的文件格式，如下图所示：

![img](https://static001.geekbang.org/resource/image/4a/d9/4aad7046a08b2a4d6ca39963a46506d9.png?wh=1142*315)

从图中我们可以看出，FLV 文件格式由 FLV Header 和 FLV Body 两部分组成。其中，FLV Header 由 9 个字节组成，Body 由 Pre TagSize 和 Tag 组成。

为使你对它们有一个更清楚的认知，下面我们就来详细介绍一下 FLV Header 和 FLV Body。

1. **FLV Header**

它由 9 个字节组成：3 个字节的 “F”“L”“V”字母，用于标记该文件是 FLV 文件；1 个字节的 Version，指明使用的 FLV 文件格式的版本；1 个字节的 Type 标识，用于表明该 FLV 文件中是否包括音频或视频；4 个字节的 FLV Header 长度，由于 FLV 文件格式头是固定 9 个字节，所以这个字段设置得有点多余。

Type 标识（TypeFlag）又可以细分为： 1bit 用于标识 FLV 文件中是否有音频数据；1bit 标识 FLV 文件中是否有视频数据；如果两个 bit 位同时置 1，说明该 FLV 文件中既有音频数据又有视频数据，这也是通常情况下 FLV Header 的设置；除了两个 bit 的音视频数据标识外，其他位都是预留位，必须全部置 0。详细的含义可以参考下面张图表：

![img](https://static001.geekbang.org/resource/image/c7/5e/c71c4156528bf0cc59cc92d5e796a05e.png?wh=1142*536)

这张图表清晰地表达了 FLV Header 中每个域所占的字节以及该域的具体含义。另外，如果你使用的是 Windows 系统，就可以安装 FlvAnalyzer 工具，该工具是一款功能非常强大的 FLV 文件分析工具。使用它打开任何一个 FLV 文件，就可以看到该文件的 FLV 格式。

2. **FLV Body**

从“FLV 文件格式结构图”我们可以看出，FLV Body 是由多个 Previous TagSize 和 Tag 组成的。其含义如下图表所示，其中 PreviousTagSize 占 4 个字节，表示前一个 Tag 的大小。这里需要注意的是，第一个 Previous TagSize 比较特殊，由于它前面没有 Tag 数据，所以它的值必须为 0。

接下来我们再来看一下 FLV 中的 Tag，从 FLV 文件格式结构图中我们可以看到 Tag 由两部分组成，即 Tag Header 和 Tag Data 。

Tag Header 各字段的含义如下图所示：

![img](https://static001.geekbang.org/resource/image/ab/79/ab30c1ae85a041f9262bc7b197c34779.png?wh=1142*1013)

- TagType，占 1 个字节，表示该 Tag 的类型，可以是音频、视频和脚本。如果类型为音频，说明这个 Tag 存放的是音频数据；如果类型是视频，说明存放的是视频数据。
- DataSize，占 3 个字节，表示音频 / 视频数据的长度。
- Timestamp 和扩展 Timestamp，一共占 4 个字节，表示数据生成时的时间戳。
- StreamID，占 3 个字节，总是为 0。

而 Tag Data 中存放的数据，是根据 TagType 中的类型不同而有所区别的。也就是说，假如 TagType 指定的是音频，那么 Tag Data 中存放的就是音频数据；如果 TagType 指定的是视频，则 Tag Data 中存放的就是视频数据。

另外，无论 TagData 中存放的是音频数据还是视频数据，它们都是由 Header 和 Data 组成。也就是说，如果该 Tag 是一个音频 Tag ，那么它的数据就是由“AudioHeader + AudioData”组成；如果是一个视频 Tag，则它的数据是由“VideoHeader + VideoData”组成。

特别有意思的一点是，如果你翻看RTMP 协议，查看它的 6.1.1 小节，你会发现它定义的 RTMP Message Header 与 Tag Header 是一模一样的。下图是我从 RTMP 协议中截取的协议头：

![img](https://static001.geekbang.org/resource/image/19/f7/19860afa57dd97d75902c59720f832f7.png?wh=1142*473)

因此，我们可以说 FLV 文件就是由“FLV Header + RTMP 数据”构成的。这也揭开了 FLV 与 RTMP 之间的关系秘密，即 FLV 是在 RTMP 数据之上加了一层“马甲”。

**为什么 FLV 适合录制**

通过上面的描述你会发现，**FLV 文件是一个流式的文件格式**。该文件中的数据部分是由多个 “PreviousTagSize + Tag”组成的。这样的文件结构有一个天然的好处，就是你可以将音视频数据随时添加到 FLV 文件的末尾，而不会破坏文件的整体结构。

在众多的媒体文件格式中，只有 FLV 具有这样的特点。像 MP4、MOV 等媒体文件格式都是结构化的，也就是说音频数据与视频数据是单独存放的。当服务端接收到音视频数据后，如果不通过 MP4 的文件头，你根本就找不到音频或视频数据存放的位置。

正是由于 FLV 是流式的文件格式，所以它特别适合在音视频录制中使用。这里我们举个例子，在一个在线教育的场景中，老师进入教室后开启了录制功能，服务端收到信令后将接收到的音视数据写入到 FLV 文件。在上课期间，老师是可以随时将录制关掉的，老师关闭录制时，FLV 文件也就结束了。当老师再次开启录制时，一个新的 FLV 文件被创建，然后将收到的音视频数据录制到新的 FLV 文件中。 这样当一节课结束后，可能会产生多个 FLV 文件，然后在收到课结束的消息后，录制程序需要将这几个 FLV 文件进行合并，由于 FLV 文件是基于流的格式，所以合并起来也特别方便，只需要按时间段将后面的 FLV 直接写到前面 FLV 文件的末尾即可。

使用 FLV 进行视频回放也特别方便，将生成好的 FLV 直接推送到 CDN 云服务，在 CDN 云服务会将 FLV 文件转成 HLS 切片，这样用户就可以根据自己的终端选择使用 FLV 或 HLS 协议回放录制好的视频。

而对于回放实时性要求比较高的业务，还可以将 FLV 按 3～5 分钟进行切片，这样就可以在直播几分钟后看到录制好的内容了。

另外，FLV 相较 MP4 等多媒体文件，它的文件头是固定的，音视频数据可以随着时间的推移随时写入到文件的末尾；而 MP4 之类的文件，文件头是随着数据的增长而增长的，并且体积大，处理时间长。因此， FLV 文件相较于其他多媒体文件特别适合于在录制中使用。

**如何使用Nginx搭建最简单的直播服务器？**

今天我们要搭建的这套直播系统相较于《31 | 一对多直播系统 RTMP/HLS，你该选哪个？》一文中介绍的直播系统要简单得多。该系统不包括客户端、没有 CDN 分发，只包括最基本的推流、转发及拉流功能。虽然它简单了一点，但麻雀虽小五脏俱全，通过这样一个实战操作，我们就可以将前面讲解的理论与实际结合到一起了。

当然，作为一个直播系统来说，客户端是必不可少的。但由于时间和篇幅的原因，我们只能借助一些现成的或者开源的客户端对我们的直播系统进行测试了，所以客户端的界面可能会简陋一些。也正因为如此，我才没有将它们算作咱们这个直播实验平台之中。实际上，我们完全可以以这个直播系统实验平台为原型，逐步地将一些功能添加进去，这样很快就可以构建出一套商业可用的传统直播系统了。

**直播系统架构**

在正式开始实战之前，我们先来简要介绍一下这个直播系统的架构，如下图所示：

![img](https://static001.geekbang.org/resource/image/68/e3/68f233981343fca6aac7557baa79b1e3.png?wh=1142*713)

这个直播架构非常简单，由两部分组成，即媒体服务器和客户端。

媒体服务器有两个功能：

- 推流功能，可以让客户端通过 RTMP 协议将音视频流推送到媒体服务器上；
- 拉流功能，可以让客户端从媒体服务器上拉取 RTMP/HLS 流。

实际上，这个架构与我们前面介绍的传统直播架构相比是有变化的，减少了信令服务器，同时将 CDN 网络变成了一台流媒体服务器。但理解了整个直播架构的原理后，我们就可以快速地将这个简单的直播架构恢复成一个正式的、可商用的直播系统。

那对于我们这个简化的直播系统来说，如何实现架构中的媒体服务器呢？这里我们使用了目前最流行的 Nginx 来实现它。之所以选用 Nginx 主要出于以下两方面的原因：

**Nginx 的性能是很优越。**在众多的 Web 服务器中，Nginx 之所以能够脱颖而出，就是因为它性能优越。阅读过 Nginx 代码的同学应该知道，Nginx 在异步 IO 事件处理上的优化几乎做到了出神入化的地步。其架构设计也极其巧妙，不光如此，它将所有使用到的库都重新再造，对 CPU、内存的优化都做到了极致。

**Nginx 有现成的实现 RTMP 推拉流的模块。**只需要在 Nginx 安装一个 RTMP 处理模块，它就立马变成了我们想要的流媒体服务器了，操作非常简单。

接下来我们就具体实操一下，看看如何实现上面所说的流媒体服务器。

搭建流媒体服务端

在搭建直播平台之前，我们首先要有一台 Linux/Mac 系统作为 RTMP 流媒体服务器的宿主机，然后再按下列步骤来搭建实验环境。

从Nginx官方网站上下载最新发布的 Nginx 源码nginx-1.17.4，地址如下：http://nginx.org/download/nginx-1.17.4.tar.gz 。我们可以使用 wget 命令将其下载下来，命令如下：

```shell
wget -c http://nginx.org/download/nginx-1.17.4.tar.gz
```

通过上面的命令就可以将 Nginx 源码下载下来了。当然，我们还需要将它进行解压缩。命令如下：

```shell
tar -zvxf nginx-1.17.4.tar.gz
```

要想搭建 RTMP 流媒体服务器，除了需要 Nginx 之外，还需要另外两个库，即 Nginx RTMP Module 和 OpenSSL。

1. **RTMP Module**

Nginx RTMP Module 是 Nginx 的一个插件。它的功能非常强大：

- 支持 RTMP/HLS/MPEG-DASH 协议的音视频直播；
- 支持 FLV/MP4 文件的视频点播功能；
- 支持以推拉流方式进行数据流的中继；
- 支持将音视频流录制成多个 FLV 文件；

Nginx RTMP Module 模块的源码地址为：https://github.com/arut/nginx-rtmp-module.git 。你可以使用下面的命令进行下载，存放的位置最好与 Nginx 源码目录并行。这样就可以将 Nginx RTMP Module 模块下载下来了。

```shell
git clone https://github.com/arut/nginx-rtmp-module.git
```

2. **OpenSSL**

讲到数据安全就不得不提 OpenSSL 库，通过它的名字你也基本可以知道它是做什么的。OpenSSL 是一个开源的 SSL 实现，正如我们上面说到的，SSL 是 TLS 早期的名字，实际上 OpenSSL 实现了整个 TLS 协议。

不仅如此，OpenSSL 还实现了 DTLS 协议，由于其代码开源，实现得又特别高效，所以现在大部分需要数据安全的应用程序基本上都是使用 OpenSSL 来实现的。

关于 OpenSSL 库，有以下几个基本概念你一定要清楚。

- SSL_CTX：SSL 上下文，主要指明你要使用的 SSL 版本是多少。
- SSL：代表一个 SSL 连接，你可以把它看作是一个句柄，一般还要与一个具体的 socket 进行绑定。
- SSL_Write：用于向 SSL 连接写数据。
- SSL_Read：用于从 SSL 连接读数据。

对于我们的 RTMP 流媒体服务器来说，也需要 OpenSSL 的支持。因此，我们需要将 OpenSSL 的源码一并下载下来，以便在编译 Nginx 和 Nginx RTMP Module 时可以顺利编译通过。

OpenSSL 的源码地址为：https://www.openssl.org/source/openssl-1.1.1.tar.gz （有可能需要 VPN）。我们仍然使用 wget 对其进行下载，命令如下：

```shell
wget -c https://www.openssl.org/source/openssl-1.1.1.tar.gz --no-check-certificate
```

通过上面的命令就可以将 OpenSSL 源码下载下来了。同样，我们也需要将下载后的 OpenSSL 进行解压缩，命令如下：

```shell
tar -zvxf openssl-1.1.1.tar.gz
```

3. **编译 OpenSSL & Nginx**

通过上面的描述，我们就将所有需要的源码都准备好了，下面我们开始编译 Nginx。在编译 Nginx 之前，我们首先要将 OpenSSL 库编译并安装好，其编译安装过程有如下两个步骤。

第一步，生在 Makefile 文件。

```shell
cd openssl-1.1.1
./config
```

第二步，编译并安装 OpenSSL 库。

```
make && sudo make install
```

经过上面的步骤就将 OpenSSL 库安装好了。下面我们开始编译带 RTMP Module 功能的 Nginx，只需要执行下面的命令即可，命令执行完成后，就会生成 Nginx 的 Makefile 文件。

```sh
cd nginx-1.17.4

./configure --prefix=/usr/local/nginx --add-module=../nginx-rtmp-module --with-http_ssl_module --with-debug
```

下面我们对这里的参数做个介绍。

- prefix：指定将编译好的 Nginx 安装到哪个目录下。
- add-module：指明在生成 Nginx Makefile 的同时，也将 nginx-rtmp-module 模块的编译命令添加到 Makefile 中。
- http_ssl_module：指定 Ngnix 服务器支持 SSL 功能。
- with-debug：输出 debug 信息，由于我们要做的是实验环境，所以输出点信息是没问题的。

**需要注意的是，在编译 Nginx 时可能还需要其他基础库，我们只需要根据执行 configure 命令时提示的信息将它们安装到宿主机上就好了。**

Nginx 的 Makefile 生成好后，我们就可以进行编译与安装了。具体命令如下

```
make && sudo make install
```

这里需要强调的是，上面命令中的 && 符号表示前面的 Make 命令执行成功之后，才可以执行后面的命令；sudo 是指以 root 身份执行后面的 make install 命令。之所以要以 root 身份安装编译好文件是因为我们安装的目录只有 root 才有权限访问。

当上面的命令执行完成后，编译好的 Nginx 将被安装到 /usr/local/nginx 目录下。此时，我们距离成功只差最后一步了。

4. 配置 Nginx

上面将 Nginx 安装好后，我们还需要对它进行配置，以实现 RTMP 流媒体服务器。Nginx 的配置文件在/usr/local/nginx/conf/ 目录下，配置文件为 nginx.conf。在 nginx.conf 文件中增加以下配置信息:

```js

...
events {
  ...
}  

#RTMP 服务
rtmp { 
  server{ 
  #指定服务端口
  listen 1935;     //RTMP协议使用的默认端口
  chunk_size 4000; //RTMP分块大小

  #指定RTMP流应用
  application live //推送地址
  { 
     live on;      //打开直播流
     allow play all;
  }

    #指定 HLS 流应用
    application hls {
        live on;     //打开直播流
        hls on;      //打开 HLS
        hls_path /tmp/hls;
    }
  }
}  

http {
  ...
  location /hls {
      # Serve HLS fragments
      types {
          application/vnd.apple.mpegurl m3u8;
          video/mp2t ts;
      }
      root /tmp;
      add_header Cache-Control no-cache;
  }
  ...
}
...
```

我们来对上面的配置信息做一下简单的描述，整体上可以将这个配置文件分成三大块：

- events，用来指明 Nginx 中最大的 worker 线程的数量；
- rtmp，用来指明 RTMP 协议服务；
- http，用来指明 HTTP/HTTPS 协议服务。

其中最关键的是 RTMP 协议的配置。我们可以看到，在 rtmp 域中定义了一个 server，表明该 Nginx 可以提供 RTMP 服务，而在 server 中又包括了两个 application ，一个用于 RTMP 协议直播，另一个用于 HLS 协议的直播。

通过上面的配置，我们就将 RTMP 流媒体服务器配置好了。接下来我们可以通过下面的命令将配置好的流媒体服务器启动起来提供服务了：

```sh
 /usr/local/nginx/sbin/nginx 
```

至此，我们的 RTMP 流媒体服务器就算搭建好了。我们可以在 Linux 系统下执行下面的命令来查看 1935 端口是否已经打开：

```shell
netstat -ntpl | grep 1935 
```

**音视频共享与观看**

RTMP 流媒体服务器配置好后，下面我们来看一下该如何向 RTMP 流媒体服务器推流，又如何从该流媒体服器上拉 RTMP 流或 HLS 流。

1. **音视频共享**

向 RTMP 服务器推流有好几种方式，最简单是可以使用 FFmpeg 工具向 RTMP 流媒体服务器推流，具体的命令如下：

```shell
ffmpeg -re -i xxx.mp4 -c copy -f flv rtmp://IP/live/stream
```

通过这个命令就可以将一个多媒体文件推送给 RTMP 流媒体服务器了。下面我们来解释一下这命令中各参数的含义：

- -re，代表按视频的帧率发送数据，否则 FFmpeg 会按最高的速率发送数据；
- -i ，表示输入文件；
- -c copy，表示不对输入文件进行重新编码；
- -f flv，表示推流时按 RTMP 协议推流；
- rtmp://……，表示推流的地址。

另外，关于推流地址 rtmp://IP/live/stream 有三点需要你注意。

- 第一点，推流时一定要使用 rtmp:// 开头，而不是 http://，有很多刚入门的同学在这块总容易出错。
- 第二点，IP 后面的子路径 live 是在 Nginx.conf 中配置的 application 名字。所以，在 Nginx 配置文件中你写的是什么名字，这里就写什么名字。
- 第三点，live 子路径后面的 test 是可以任意填写的流名。你可以把它当作一个房间号来看待，在拉流时你要指定同样的名字才可以看到该节目。

2. **观看**

RTMP 的推流工具介绍完后，现在我们再来看看如何观看推送的音视频流。你可以使用下面这几个工具来观看“节目”。

- Flash 客户端。你可以在 IE 浏览器上使用下面的 Flash 客户端进行观看，地址为：http://bbs.chinaffmpeg.com/1.swf 。需要注意的是，目前最新的 Chrome 浏览器已经不支持 Flash 客户端了。
- VLC。在 PC 机上可以使用 VLC 播放器观看，操作步骤是点击右侧的openmedia->网络->输入rtmp://IP/live/test 。
- FFplay。它是由 FFmpeg 实现的播放器，可以说是目前世界上最牛的播放器了。使用 FFplay 的具体命令如下：ffplay rtmp://host/live/test。

当然拉流也是一样的，你也可以利用 librtmp 库自己实现一个观看端。

**如何构建云端一对多直播系统？**

在上一篇文章中，我们介绍了如何通过 Nginx 搭建传统直播系统的实验环境，知道了理论是如何与实际结合到一起的。但同时我们也提到，要想通过 Nginx 来实现商用的直播系统还有很长的路要走。

那么今天，我们就来介绍一下快速构建商用直播系统的方案。要想实现真正商用的直播系统，我们必须踩在巨人肩膀上，这个“巨人”就是 CDN 网络。

可以这么说，现在 99% 的传统直播系统都是在 CDN 网络的基础上搭建出来的。因此，我们本文主要介绍的内容就是如何通过 CDN 网络实现商用的直播系统。我们平时所说的“万人直播”就是使用的这种技术。

**万人直播的原理**

我们首先来看一下万人直播架构图，如下所示：

![img](https://static001.geekbang.org/resource/image/15/14/152d2b86619a8a35e28967043f0c5a14.png?wh=1142*713)

通过该图我们可以看到，它与上一篇文章所介绍的直播架构是非常类拟的，包括了共享端、观看端和 CDN 网络。唯一的变化就是把之前架构中的流媒体服务器换成了现在的 CDN 网络。

对于共享端和观看端来说，使用 CDN 网络与使用流媒体服务器没什么区别。它们都是将流推送给指定的流媒体服务器，然后从指定的播放地址拉流，并最终进行展示这样一个过程。

关于 CDN 网络的基本知识，我们在《31 | 一对多直播系统 RTMP/HLS，你该选哪个？》一文中已经向你做过详细介绍了，它是由源节点、主干结点和边缘节点组成。它们的具体作用我这里就不做赘述了，记不清的同学可以回顾一下那篇文章。

当共享端将媒体流分享到 CDN 网络后，媒体流在 CDN 内部的流转过程是十分复杂的。现在我们只要简单理解为，CDN 网络通过主干结点将流推送到各边缘节点，观看端就近接入到 CDN 网的边缘节点就可以获取到它想观看的“节目”了。

观看端就近接入到 CDN 的边缘节点，使得它与 CDN 节点之间能够使用最好的网络线路传输音视频数据，从而达到非常好的音视频服务质量。

**CDN 就近接入**

CDN 网络为了保证用户的音视频服务质量，它会让观众在观看节目时，就近接入到距离最近的 CDN 边缘节点。

咱们来举个例子，一名主播使用上海电信的网络分享它的“节目”，那么使用北京联通网络的观众想看该节目时，如何能得到更好的用户体验呢？换句话说，是观众从上海电信的节点上拉取到的音视频流的服务质量好呢，还是从北京联通的节点上拉取到的音视频流的服务质量好呢？我想答案是不言而喻的！那么，CDN 网络是如何让用户就近接入到北京联通的边缘节点上的呢？这里的关键点就是 DNS 解析。

\1. DNS 解析原理

要想解开 CDN 让用户就近接入的秘密，我们就必须要了解 DNS 的解析原理。下面这张图就是 DNS 解析原理的示意图：

![img](https://static001.geekbang.org/resource/image/50/a9/504b7cbf63f82f616e4bc8e5baa767a9.png?wh=1142*583)

接下来，我们就对这张图做一下解析，看看 DNS 是如何工作的。假设你要访问 learningrtc.cn 这个网址，浏览器收到你的命令后，会向本地 DNS（如 Google 的 DNS 服务器 8.8.8.8） 的 53 端口（TCP/UDP 都使用同样的端口）发送域名解析请求。

本地 DNS 收到该请求后，首先查看自己的缓存中是否已经有该域名的记录了。如果有，则直接返回该域名的 IP 地址。如果没有，它会按下列步骤查询域名所对应的 IP 地址。

步骤 1：本地 DNS 向根域名发送查询请求。

步骤 2：根域名一般都会说“我不知道”，但可以再问问 .net 顶级域名的服务地址。

步骤 3：本地 DNS 获取到 .net 顶级域名服务地址后，就向顶级域名服务发送查询域名 IP 地址的请求。

步骤 4：如果顶级域名也不知道要查询域名的 IP 地址的话，它会给本地 DNS 返回二级域名服务地址。通过这样的步骤，经过本地 DNS 一级一级的查询，最终才能确定浏览器访问域名的 IP 地址是多少。

2. **CDN 就近接入原理**

当用户访问 CDN 网络时，它首先通过智能 DNS 获取与用户距离最近的边缘节点，如下图所示：

![img](https://static001.geekbang.org/resource/image/00/3d/002237a6925afbdab0d05660fae6693d.png?wh=1142*490)

那么智能 DNS 是如何找到距离用户最近的 CDN 边缘节点的呢？

智能 DNS 与传统 DNS 解析略有不同。传统 DNS 不判断访问者来源，当有多个 IP 地址可用时，DNS 会随机选择其中一个 IP 地址返回给访问者。而智能 DNS 会判断访问者的来源，也就是说，它会对访问者的 IP 地址做判断，对不同的访问者它会返回不同的 IP 地址。智能 DNS 可以根据用户的 IP 地址找到它所在的地区、使用的运营商等。通过这些信息，它就可以让访问者在访问服务的时候，获得最优的 CDN 边缘节点，从而提升服务的质量。

**CDN 的使用**

了解了上面的原理后，接下来我们就来具体实操一下，看看如何通过 CDN 网络实现万人直播。

1. **开通 CDN 业务**

在使用 CDN 业务之前，我们需要先在所使用的云服务厂商那里开通 CDN 服务。各云厂商开通 CDN 服务的步骤可能略有不同，但大同小异，我们只需要在云厂商提供的管理界面进行开通即可。

云厂商的 CDN 服务可以用于多种业务，如图片加速、文件加速、点播、直播等等。而我们这里是将它用于直播系统，所以在开通 CDN 的时候，一定要选对业务类型，这样它才能真正为我们提供服务。

另外，一般情况下 CDN 业务开通后还不能直接使用，还需要对账户进行充值。在管理界面生成推 / 拉流地址时，如果账户中没有钱，它就不给你产生推拉流地址。必竟天下没有免费的午餐，这一点是需要你特别注意的。

2. **申请域名**

要想通过 CDN 来实现万人直播，除了开通 CDN 业务之外，还必须要有自己的域名。比如，我们分享了一个直播间地址给观众，观众只要访问该地址就可收听 / 观看我们的节目了，那这个地址一定是我们自己的域名构成的。

申请域名的方法非常简单，你可以到任何一家云服务厂商去购买，如阿里、腾讯、亚马逊或 Google 等等。域名的价格有高有低，因为我们只是做实验使用，所以购买最便宜的即可。

另外，需要注意的是，如果你是购买的国内域名，则还需要进行备案，域名在没有备案成功之前是无法使用的。备案的主要目的是为了确认你要通过该域名做些什么事情。

3. **域名解析**

域名申请好并备案成功后，接下来我们就可以对域名进行配置了。域名的配置主要分为两步：一是对 CDN 直播域名的配置，二是在域名管理中对前面配置好的直播域名进行映射。

首先，我们来看一下如何对 CDN 直播域名进行配置：打开直播控制台的域名管理，点击添加域名，在弹出的添加域名界面中，添加上我们的直播域名即可。比如我的域名为 learningrtc.cn，因此我可以将直播域名写成 pushcdn.learningrtc.cn。

通过上面步骤添加好直播域名后，云厂商的直播管理系统会给我们返回真正的直播域名。比如我添加的 pushcdn.learningrtc.cn 直播域名，其实它真正的 CDN 域名地址为 pushcdn.learningrtc.cn.w.alikunlun.net。也就是说 pushcdn.learningrtc.cn 只不过是一个伪域名。

通过上面的描述我们可以知道，要想让用户访问在 pushcdn.learningrtc.cn 域名时，转到 CDN 真正的直播域名 pushcdn.learningrtc.cn.w.alikunlun.net，那么我们还需要在云厂商的域名管理系统中配置一条 DNS CNAME 的记录。这样，在 DNS 解析时就会进行跳转，从而解析出真正提供服务的 IP 地址。

4. **生成推 / 拉流地址**

域名配置好之后，我们就可以生成推 / 拉流地址了。在云厂商的直播管理界面中，专门有用于生成推 / 拉流地址的操作界面。

其操作非常简单，首先是选择要使用的直播域名，该域名就是我们上面配置好的域名，然后填入你的 Application 名字，最后是填入直播流（房间）名字。这些配置信息填好后，点击生成按钮，就可以生成直播的推流地址和拉流（播放）地址了。

通过上面的描述我们可以知道，在 CDN 网络的内部应该也是使用的 Nginx 或与 Nginx 相类似的流媒体服务器。因为从它的配置上看，与我们在上一篇文章中所介绍的配置是一致的。

下图是生成推流与拉流地址的拼接格式：

![img](https://static001.geekbang.org/resource/image/ef/84/ef17751079eb90181246b786dc724e84.png?wh=972*280)

5. **推流与播放**

配置好 CDN 的推 / 拉流地址后，接下来我们就可以进行测试了。

相关的推流工具有 FFmpeg、OBS、自己通过 librtmp 库实现的推流客户端等；拉流工具包括 VLC、FFplay、Flash、flv.js 、video.js 等。因为这些工具我们在上一篇文章中已经介绍过了，所以这里就不再赘述了。

需要特别强调的是， OBS 这个推流工具是非常专业的推流工具，并且各个操作系统上都有对应的 OBS 客户端。比如在实际的测试中，我们可能会发现使用 FFmpeg 推流时，声音的质量非常差，但如果使用 OBS 工具推流的话，音质就非常好了。

**如何使用 flv.js 播放 FLV 多媒体文件呢？**

flv.js 是由 bilibili 公司开源的项目。它可以解析 FLV 文件，从中取出音视频数据并转成 BMFF 片段（一种 MP4 格式），然后交给 HTML5 的`<video>`标签进行播放。通过这种方式，使得浏览器在不借助 Flash 的情况下也可以播放 FLV 文件了。

目前，各大浏览器厂商默认都是禁止使用 Flash 插件的。之前常见的 Flash 直播方案，到现在已经遇到极大的挑战。因为它需要用户在浏览器上主动开启 Flash 选项之后才可以正常使用，这种用户体验是非常糟糕的，而 flv.js 的出现则彻底解决了这个问题。

flv.js 是由 JavaScript 语言开发的，该播放器的最大优势是，即使不安装 Flash 插件也可以在浏览器上播放 FLV 文件。虽说 Adobe 公司早已不再为 Flash 提供支持了，但 FLV 多媒体文件格式不会就此而消亡。因此，在没有 Flash 的时代里，能实现在浏览器上播放 FLV 文件就是 flv.js 项目的最大意义。

**flv.js 基本工作原理**

flv.js 的工作原理非常简单，它首先将 FLV 文件转成 ISO BMFF（MP4 片段）片段，然后通过浏览器的 Media Source Extensions 将 MP4 片段播放出来。具体的处理过程如下图所示：

![img](https://static001.geekbang.org/resource/image/44/7e/44d56d4a72b5baa6fac37279b0e4e87e.png?wh=567*672)

从上图我们可以看出，flv.js 播放器首先通过 Fetch Stream Loader 模块从云端获取 FLV 数据；之后由 IO Controller 模块控制数据的加载；数据加载好后，调用 FLV Demux 将 FLV 文件进行解封装，得到音视频数据；最后，将音视频数据交由 MP4 Remux 模块，重新对音视频数据封装成 MP4 格式。

将封装好的 MP4 片段交由浏览器的 Media Source Extensions 处理后，最终我们就可以看到视频并听到声音了。所以总体来说，flv.js 最主要的工作是做了媒体格式的转封装工作，具体的播放工作则是由浏览器来完成的。下面我们就对架构图中的每个模块分别做一下说明。

首先我们来看一下 flv.js 播放器，它包括以下四部分：

- Fetch Stream Loader，指通过 URL 从互联网获取 HTTP-FLV 媒体流。其主要工作就是通过 HTTP 协议下载媒体数据，然后将下载后的数据交给 IO Controller。
- IO Controller ，一个控制模块，负责数据的加载、管理等工作。它会将接收到的数据传给 FLV Demux。
- FLV Demux ，主要的工作是去掉 FLV 文件头、TAG 头等，拿到 H264/AAC 的裸流。关于 FLV 文件格式，你可以参考《33 | FLV：适合录制的多媒体格式》 一文。
- MP4 Remux ，它的工作是将 H264/AAC 裸流加上 MP4 头，采用的多媒体格式协议是 BMFF。它会将封装好格式的文件传给浏览器的 Data Source 对象。

经过以上四步，flv.js 就完成了自己的使命。

接下来的工作就是浏览器需要做的了，那我们再看一下浏览器各模块的主要作用。

- Data Source，用来接收媒体数据的对象，收到媒体数据后传给 Demux 模块。
- Demux，解封装模块，作用是去掉 MP4 头，获取 H264/AAC 裸流。
- Video Decoder，视频解码模块，将压缩的视频数据解码，变成可显示的帧格式。
- Audio Decoder，音频解码模块，将压缩的音频数据解码，变成可播放的格式。
- Video Renderer，视频渲染模块，用于显示视频。
- Audio Renderer，音频播放模块，用于播放音频。
- Video Display，视频、图形显示设备的抽象对象。
- Sound Card，声卡设备的抽象对象。

从上面的过程可以看出，flv.js 主要的工作就是进行了 FLV 格式到 MP4 格式的转换。之所以这样，是因为 flv.js 是通过 HTML5 的 `<video>`标签播放视频，而此标签支持的是 MP4 格式。

另外，对于`<video>`标签的测试有两点是需要你注意的：

- 媒体文件建议用 MP4 文件，你系统的本地文件就可以用来测试`<video>`标签。
- 在测试 autoplay 属性时候，如果发现没有效果，建议加上 muted 属性，浏览器保证静音状态是能 autoplay 的。

**使用 flv.js**

首先，我们需要将 flv.js 源码下载下来。主要有两种方式：一种是通过 git clone 命令从 GitHub 上拉取最新的代码；另一种是通过 NPM 命令从资源库中获取 flv.js 源码。这里我们采用的是第二种方式，具体命令如下：

```sh
npm install --save flv.js
```

源码下载下来后，我们还要将 flv.js 的依赖包下载下来，通过 gulp 工具将 flv.js 进行打包、压缩。具体步骤如下：

```sh
npm install          # 安装 flv.js 依赖的包
npm install -g gulp  # 安装 gulp 构建工具
gulp release         # 打包、压缩 工程 js 文件
```

其中，第 1 条命令的作用是下载 flv.js 的依赖包，第 2 条命令是安装 JavaScript 打包工具 gulp，第 3 条命令是使用 gulp 对 flv.js 进行构建。需要注意的是，在执行 gulp release命令 时，有可能会遇到如下的错误：

```sh
gulp release[4228]: src\node_contextify.cc:633: Assertion `args[1]->IsString()' failed.
```

这时可以通过安装 Node.js 的 natives 模块来解决该问题，安装 natives 的命令如下：

```sh
npm install natives
```

通过上面的步骤，我们就可以构建出 flv.min.js 文件了。 该文件就是我们在项目中需要引用的 flv.js 文件。

接下来，我们就展示一下该如何使用 flv.js。你可以在本地创建一个 HTML 文件，如 play_flv.html，其代码如下：

```js

<!-- 引入 flv.js 库 -->
<script src="flv.min.js"></script>

<!-- 设置 video 标签 -->
<video id="flv_file" controls autoplay>
  You Browser doesn't support video tag
</video>

<script>
    //通过 JavaScript 脚本创建 FLV Player
    if (flvjs.isSupported()) {
        var videoElement = document.getElementById('flv_file');
        var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: 'http://localhost:8000/live/test.flv'
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
    }
</script>
```

上面代码的逻辑非常简单，它主要做了三件事：第一是在 HTML 中引入了 flv.js 库；第二是设置了一个 `<video>`标签，用于播放 FLV 文件；第三是一段 JavaScript 代码片段，用于创建 FLV Player 对象，并将这与上面定义的 `<video>`绑定到一起，实现对`<video>`标签的控制。

flv.js 的实现架构以及暴露的 API 接口在 flv.js/docs 目录下面有一个简单的介绍，你可以参考一下。flv.js 暴露的接口不多，但由于没有暴露接口的任何文档，所以你只能直接查看源码去了解每个接口的具体作用与含义。幸运的是，flv.js 架构设计得非常合理，代码实现也非常优秀，所以对于 JavaScript 开发人员来说，查看 flv.js 源码不是太难的事儿。

**如何使用 video.js 播放多媒体文件？**

在上一篇文章中，我们介绍了 flv.js 播放器。那今天我们再来介绍另一款非常有名的 JavaScript 播放器——video.js。

我们首先来比较一下这两款播放器，看看它们之间有什么不同？在我看来，flv.js 更聚焦在多媒体格式方面，其主要是将 FLV 格式转换为 MP4 格式，而对于播放器的音量控制、进度条、菜单等 UI 展示部分没有做特别的处理。而 video.js 对音量控制、进度条、菜单等 UI 相关逻辑做了统一处理，对媒体播放部分设计了一个插件框架，可以集成不同媒体格式的播放器进去。所以相比较而言，video.js 更像是一款完整的播放器。

video.js 对大多数的浏览器做了兼容。它设计了自己的播放器 UI，接管了浏览器默认的`<video>`标签，提供了统一的 HTML5/CSS 皮肤。因此，通过 video.js 实现的播放器，在大多数浏览器上运行时都是统一的风格和操作样式，这极大地提高了我们的开发效率。

除了上面介绍的特点外，video.js 还有以下优势：

- 开源、免费的。不管你是学习、研究，还是产品应用，video.js 都是不错的选择。
- 轻量。浏览器 UI 的展现全部是通过 HTML5/CSS 完成，没有图片的依赖。
- 完善的 API 接口文档，让你容易理解和使用。
- 统一的 UI 设计，不管在哪个浏览器，你都看不出任何差异。
- 皮肤可以任意更换，很灵活。
- 开放灵活的插件式设计，**让你可以集成各种媒体格式的播放器**。
- 支持多种文字语言，如中文、英文等。既然有这么多优势，那接下来我们就来详细讲解一下 video.js 的相关内容吧。

**video.js 的架构**

HTML5 为媒体播放新增了很多新的元素，比如`<video>` `<audio>` `<source>`等，这些内置标签基本上可以满足我们日常的需求。而 video.js 把这些组件统统都实现了一遍，其主要目的是为了适配不同浏览器的差异，为各浏览器提供统一的 UI 展示和个性化定制。接下来，我们来看看 video.js 都包含了哪些主要组件，如下图所示：

![img](https://static001.geekbang.org/resource/image/a1/fc/a1bce32b2e8d47b6a13214cda9d5fdfc.png?wh=822*533)

通过该图可以看到，video.js 主要包括对多种文字语言支持、CSS 样式定制、控件部分、媒体内嵌元素部分和外部插件五大部分。

下面我们来简要介绍下这每一部分的相关信息。

第一部分是 Language。它在 video.js/language 目录下面，支持多种文字语言切换。

第二部分是 CSS 样式。video.js 的 CSS 样式是可以更换的，支持个性化定制。

第三部分是 Component。Component 是 video.js 中 UI 控件的抽象类，在 Component 中封装了 HTML 元素。Control Bar、Menu、Slider、Tech 都是继承自 Component，叫做子组件，子组件也可以有子组件，这样就形成了一棵树。这样设计的目的就是**将播放器相关控件模拟成 DOM 树模型**。下面是子组件的功能：

- Control Bar，播放器的控制模块。调节音量、播放进度拖动等都由该模块完成。
- Menu，播放器右键菜单的实现。
- Slider，滚动条控件。可以是垂直滚动条，也可以是水平滚动条。音量滚动条、进度滚动条都是它的子类。
- Tech，是 Technique 的缩写，表示采用的播放器技术。其实它就是为播放器插件提供抽象接口。video.js 默认使用的是 HTML5 播放器。

第四部分是 EventTarget。HTML5 除了提供了`<video>` `<audio>` `<source>`这些可见元素，还包括了 Media Source 的概念。像 AudioTrack、VideoTrack、TextTrack、Track 都继承自 Media Source，video.js 把它们也都进行了抽象，这些对象都统一实现了 EventTarget 接口。这几个 Track 的作用如下：

- AudioTrack，音频轨，也是音频媒体源。
- VideoTrack，视频轨，也是视频媒体源。
- TextTrack，文字轨，也是文字媒体源。比如给视频添加字幕就可以使用它，对应于`<track>` 标签。
- Track ，媒体源的公共抽象。你一定要将它与 区分开来，这两个不是同一回事。这一点需要你注意一下。

第五部分是插件。video.js 支持播放器插件开发，目前已经有很多插件实现了。在上图中我们只列举了 3 个插件：

- HTTP Streaming，可以播放 HLS 协议、DASH 协议的媒体流。
- Flash，用于播放 RTMP 媒体流。但目前各大浏览器默认都是禁止使用 Flash 的。经测试，Chrome 浏览器和 IE 新版本浏览器都已不能使用 Flash 播放 RTMP 流了。
- YouTube，是企业定制插件

**video.js 安装部署**

使用 video.js 主要有以下三种方式。

第一种方式，通过源码安装部署。首先，从 GitHub 下载源码。命令如下：

```
git clone https://github.com/videojs/video.js.git
```

然后，安装 video.js 依赖的文件。命令如下：

```
cd video.js
npm install
```

最后，构建 video.js。运行命令如下：

```
npm run-script build
```

通过以上三步，在 video.js/dist 目录下面就会生成 video.min.js、video.min.css 、语言、字体等相关文件，你只需要将它们引入到你的 JavaScript 工程中即可。

第二种方式，从 npm 仓库获取。

```
npm install video.js
```

第三种方式，通过 CDN 直接下载官方构建好的文件。

```
<link href="https://unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet">
<script src="https://unpkg.com/video.js/dist/video.min.js"></script>
```

总之，你可以根据自己的喜好，选择其中一种方式使用 video.js。这里需要说明一下，本文后续的例子都是采用的第三种方式。

**video.js 播放 MP4**

接下来我们就来实战一下，使用 video.js 播放一个本地 MP4 文件，具体代码如下：

```js

//引入video.js库
<link href="https://unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet">
<script src="https://unpkg.com/video.js/dist/video.min.js"></script>

//使用 video 标签描述MP4文件
<video
    id="local_mp4"   //对于 video.js 来讲，需要设置 id 属性。
    class="video-js"
    controls
    preload="auto"
    poster="//vjs.zencdn.net/v/oceans.png"
    data-setup='{}'> //data-setup 属性，是 video.js 特有的，此标签用于播放器的自动加载。这里我们的代码中传入的是一个空的 json 对象。
//指定播放 URL 和媒体类型。我们的代码中指定的是本地磁盘 MP4 文件，test.mp4 是预先准备好的文件，类型是 video/mp4。
    <source src="d:/test.mp4" type="video/mp4"></source>
</video>
```

**本地流媒体服务器搭建**

接下来，我们再来介绍一下如何使用 video.js 播放 HLS。对于推流工具我们可以使用 FFmpeg 或 OBS 进行推流，对于这些工具体的使用，我在前面的文章中都有向你做过详细介绍，所以这里就不再赘述了。

对于流媒体服务器，你可以使用 Nginx 在你的本机上搭建流媒体服务器，也可以通过前面文章所介绍的 CDN 网络做为流媒体服务器。

对于实验来说，它们都是可行的方案。对于流媒体服务器的搭建的过程，前面我们已经通过两篇文章做了详细介绍。这里同样也不再进行赘述了。

**video.js 播放 HLS**

在使用 video.js 播放 HLS 媒体流之前，我们需要先创建一个 HTML5 文件，如 play_hls.html，在 HTML5 文件中的内容如下：

```html

//引入 video.js 库 
<link href="https://unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet">
<script src="https://unpkg.com/video.js/dist/video.min.js"></script>

//设置video标签
<video id="my-hls-player" class="video-js">
  <source src="http://localhost:8000/live/test/index.m3u8" type="application/x-mpegURL"></source>
</video>

<script>
//创建 HLS 播放器实例
var player = videojs('my-hls-player', {
  controls:true,
  autoplay:true,
  preload:'auto'
});

player.ready(function(){
  console.log('my-hls-player ready...');
});
</script>
```

在本文中，我们为了简单，只在本地建了一个使用 video.js 的 Demo。但在真实的直播系统中，我们应该实现一个直播客户端，在直播客户端中引入 video.js 来播放直播流。此外，该直播客户端还应该通过 WWW 服务发布。当用户想进入房间观看节目时，首先从 WWW 服务上下载客户端，在浏览器将其加载后，通过信令服务获取到直播地址，并最终拉取直播流进行展示。这样就将 video.js 播放器与我们前面讲的万人直播系统组合到一起，最终实现可商用的直播系统了。













