### myMessage 组件

v1.0.0

页面顶端出现消息框，和用户进行交互

会在2.0 版本支持 多个消息框的纵向排序，类似 element-ui 的message 组件

##### 安装

引入

通过Vue.use()安装

##### 使用

通过全局方法 this.$mymessage.success/info/danger...调用

##### api 方法

1. $mymessage.success('666')  提示成功操作

![](https://i.bmp.ovh/imgs/2020/04/d9eafcf0eaed2334.png)

2. $mymessage.danger('666') 显示危险信息   
3. $mymessage.warning('666')  显示警告信息
4. $mymessage.info('666') 显示 通知类的信息

#####  参数描述

```javascript
 succuss(message,duration,callback){

```



| 参数名称 |                       描述 | 备注                                                     | 默认值       |
| :------- | -------------------------: | -------------------------------------------------------- | ------------ |
| message  |           用与显示的字符串 | 可选                                                     | 要显示的信息 |
| duration | 出现后多少时间消失，（ms） | 可选，不传入的时候**显式的传入一个负数 ** 或者 undefined | 2000         |
| callback |   弹框消失后执行的回调函数 | 可选                                                     | 无           |