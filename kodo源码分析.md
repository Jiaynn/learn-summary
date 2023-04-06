装饰器：当我们将装饰器应用于类或类成员的时候，我们实际是调用一个函数，该函数将接受被装饰内容的详细信息，然后装饰器实现将能够动态转换代码，添加额外的功能，并且减少样板代码

得到全部区域的数据数组：

```js
 configStore = this.props.inject(ConfigStore);
 this.configStore.getRegion({ allRegion: true })
//getRegion
 getRegion(
    options: IGetAllRegionOptions | IGetRegionOptions
  ): types.IRegion[] | types.IRegion {
    const { product = this.product } = options; //product: kodo 产品名字
  
    const globalConfig = this.getFull(product); //全局配置，如下图
    if (isGetAllRegionOptions(options)) {
      const regions = globalConfig.regions;
      // 海外用户只能看到海外的空间
      if (this.overseasUser) return regions.filter((region) => region.overseas);
      return regions;
    }
    // isGetRegionOptions(options)
    return globalConfig.regions.find((item) => item.symbol === options.region)!;
  }

//全局配置通过getFull()得到，函数返回
 return this.appConfigMap.get(app)!;
//存放在appConfigMap里面

```

![image-20230112120440181](/Users/lijiayan/Library/Application Support/typora-user-images/image-20230112120440181.png)

通过getregion()得到所有的区域

### 新建存储空间

通过路由控制新建空间的抽屉是否出现，query参数拼接`http://localhost:8080/kodo/bucket?region=all-region&shouldCreateBucket=true`

抽屉的组件位于BucketList中的createBucketDrawerView()方法，





```
/**
 * @desc 筛选图片并展示
 * @param content
 * @param folder
 * @param contentDom
 */
export function renderImageUrl(
	content: string,
	folder: string,
	contentDom: HTMLDivElement | null
) {
	for (let i = 0; i < parseInt(content); i++) {
		const image = document.createElement('img');
		const judgeUrl =
			i < 9
				? `https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/${folder}/${folder}_0${
						i + 1
				  }.png`
				: `https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/${folder}/${folder}_${
						i + 1
				  }.png`;
		const url = new URL(judgeUrl, import.meta.url).href;
		image.setAttribute('src', url);
		image.setAttribute('style', 'width:100%');
		image.setAttribute('loading', 'lazy');
		contentDom?.appendChild(image);
	}
}

```



```
//content为数字说明加载的资源是图片，内容是图片张数
//url为是否有demo演示的链接，如果没有则显示为空
export const list = [
	{
		id: 0,
		title: '企业直播/私域营销',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 0,
		url: 'niucube://liveKit/index',
		isHot: true,
		content: 'https://www.qiniu.com/solutions/ent-live',
		folder: 'Enterprise live broadcasting'
	},
	{
		id: 1,
		title: '互动营销',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 0,
		url: '',
		isHot: false,
		content: '28',
		folder: 'interactiveMarketing'
	},
	{
		id: 2,
		title: '低代码电商直播',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 0,
		url: '',
		isHot: true,
		content: '30',
		folder: 'LowCodeCommerce'
	},
	{
		id: 3,
		title: '短视频点播营销',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 0,
		url: 'niucube://liveKit/index',
		isHot: false,
		content: '',
		folder: 'VR live streaming'
	},
	{
		id: 4,
		title: '营销推送',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 0,
		url: 'niucube://liveKit/index',
		isHot: false,
		content: '28',
		folder: 'CustomerMarketing'
	},
	{
		id: 5,
		title: '图片处理分发加速',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 1,
		url: 'niucube://liveKit/index',
		isHot: false,
		content: '',
		folder: 'Scenic VR'
	},
	{
		id: 6,
		title: '视频点播',
		icon: 'https://demo-qnrtc-files.qnsdk.com/livekit.png',
		type: 1,
		url: 'niucube://liveKit/index',
		isHot: false,
		content: '',
		folder: 'PGC'
	},
	{
		id: 7,
		title: '互动直播',
		icon: 'https://demo-qnrtc-files.qnsdk.com/shopping.png',
		type: 1,
		url: 'niucube://shopping/index',
		isHot: false,
		content: '22',
		folder: 'InteractiveLiveStreaming'
	},
	{
		id: 8,
		title: '幼儿园监控',
		icon: 'https://demo-qnrtc-files.qnsdk.com/%E9%9D%A2%E8%AF%95%E5%9C%BA%E6%99%AF.png',
		type: 2,
		url: 'niucube://interview/index',
		isHot: true,
		content: '24',
		folder: 'preschoolEducation'
	},
	{
		id: 9,
		title: '智能家居&猫眼',
		icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E6%95%99%E8%82%B2.png',
		type: 2,
		url: 'https://niucube-class.qiniu.com',
		isHot: false,
		content: '22',
		folder: 'catEye'
	},
	{
		id: 10,
		title: 'ISV',
		icon: 'https://demo-qnrtc-files.qnsdk.com/KTV.png',
		type: 2,
		url: 'niucube://ktv/index',
		isHot: false,
		content: '33',
		folder: 'ISV'
	},
	{
		id: 11,
		title: '智能媒资管理',
		icon: 'https://demo-qnrtc-files.qnsdk.com/%E4%BA%92%E5%8A%A8%E5%A8%B1%E4%B9%90.png',
		type: 3,
		url: 'niucube://show/index',
		isHot: false,
		content: '24',
		folder: 'MediaAsset'
	},
	{
		id: 12,
		title: '新媒体拍摄剪辑加速',
		icon: 'https://demo-qnrtc-files.qnsdk.com/%E4%B8%80%E8%B5%B7%E7%9C%8B%E7%94%B5%E5%BD%B1.png',
		type: 3,
		url: 'niucube://movie/index',
		isHot: false,
		content: '12',
		folder: 'ShootingEditing'
	},
	{
		id: 13,
		title: '数字人直播',
		icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
		type: 4,
		url: 'https://niucube-exam.qiniu.com',
		isHot: false,
		content: 'https://www.qiniu.com/solutions/avatar#scene',
		folder: 'CarCamera'
	},
	{
		id: 14,
		title: 'VR直播/点播',
		icon: 'https://demo-qnrtc-files.qnsdk.com/%E8%AF%AD%E8%81%8A%E6%88%BF.png',
		type: 4,
		url: 'niucube://voiceChatRoom/index',
		isHot: false,
		content: '33',
		folder: 'vr'
	}
	// {
	// 	id: 15,
	// 	title: '广电级拍摄&监看',
	// 	icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
	// 	type: 3,
	// 	url: 'https://niucube-exam.qiniu.com',
	// 	isHot: false,
	// 	content: 'broadcasting',
	// 	folder: 'broadcasting'
	// },
	// {
	// 	id: 16,
	// 	title: '影视制作后期',
	// 	icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
	// 	type: 3,
	// 	url: 'https://niucube-exam.qiniu.com',
	// 	isHot: false,
	// 	content: '',
	// 	folder: 'films and television'
	// },
	// {
	// 	id: 17,
	// 	title: '数字人',
	// 	icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
	// 	type: 4,
	// 	url: 'https://niucube-exam.qiniu.com',
	// 	isHot: false,
	// 	content: 'https://www.qiniu.com/solutions/avatar#scene',
	// 	folder: 'digital human'
	// },
	// {
	// 	id: 18,
	// 	title: '数字展厅',
	// 	icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
	// 	type: 4,
	// 	url: 'https://niucube-exam.qiniu.com',
	// 	isHot: false,
	// 	content: '',
	// 	folder: 'Digital exhibition hall'
	// },
	// {
	// 	id: 19,
	// 	title: '音视频低代码平台',
	// 	icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
	// 	type: 5,
	// 	url: 'https://niucube-exam.qiniu.com',
	// 	isHot: false,
	// 	content: '',
	// 	folder: 'Audio and video'
	// },
	// {
	// 	id: 20,
	// 	title: '视联网低代码平台',
	// 	icon: 'https://demo-qnrtc-files.qnsdk.com/%E5%9C%A8%E7%BA%BF%E8%80%83%E8%AF%95.png',
	// 	type: 5,
	// 	url: 'https://niucube-exam.qiniu.com',
	// 	isHot: false,
	// 	content: '',
	// 	folder: 'Visual network'
	// }
];

export const tabs = [
	{
		id: 0,
		title: '视频营销'
	},
	{
		id: 1,
		title: '社交互娱'
	},
	{
		id: 2,
		title: '视联网'
	},
	{
		id: 3,
		title: '智慧新媒体'
	},
	{
		id: 4,
		title: '元宇宙'
	}
	// {
	// 	id: 5,
	// 	title: '低代码音视频工厂'
	// }
];

```











