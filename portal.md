2个状态值：是否开通、是否配置

通过是否开通某方案接口得到是否开通的状态进行展示这两个页面

true开通 false未开通，默认是false，当请求过开通服务后这个状态更新为已开通

configurationState值 false未配置 作为辅助判断的，只有通过配置完成后值才会被改变，弹窗是否展示通过这个值来辅助判断

shouldCreateBucket：true展示 （第一次配置时展示，返回上一步后就不展示了）第一步的弹窗是否展示

第二步弹窗是否展示

未开通：

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230207103854637.png" alt="image-20230207103854637" style="zoom:33%;" />

已开通未配置：

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230207112606996.png" alt="image-20230207112606996" style="zoom:33%;" />

当我们点击配置方案的时候，需要有一个状态，是否配置方案

在这里有一个状态，是否配置

先在这默认传一个没有配置的状态，当配置完成后更新这个状态

通过配置完成接口拿到是否配置状态 0：没有配置 1：已配置

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230207103930513.png" alt="image-20230207103930513" style="zoom:33%;" />

已开通已配置（通过配置完成接口得到是否配置完成状态）

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230207104006349.png" alt="image-20230207104006349" style="zoom:33%;" />



八股文/算法

框架原理React

操作系统好好复习

数据结构

设计模式



整个流程

进入开通服务页面—>发送请求（是否开通服务），得到是否开通服务的状态















