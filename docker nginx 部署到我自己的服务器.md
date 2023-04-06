docker nginx 部署到我自己的服务器

通过编写 ci 自动重新生成新镜像，然后运行容器

这个项目我想的是通过我push后,合并到master分支时 ，通过跑 ci  执行打包，然后docker重新生成新镜像，然后运行容器

这个时候我希望通过访问我自己的服务器地址访问到这个项目

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\

创建文件，给文件加权限，可读可写可执行

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230215154821142.png" alt="image-20230215154821142" style="zoom:67%;" />

添加到环境变量 所有的用户都能读到

查看环境变量，选择一个添加软链接 

![image-20230215155120606](/Users/lijiayan/Library/Application Support/typora-user-images/image-20230215155120606.png)

<img src="/Users/lijiayan/Library/Application Support/typora-user-images/image-20230215155216734.png" alt="image-20230215155216734" style="zoom:67%;" />







