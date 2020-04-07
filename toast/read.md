### toast 组件

移动端常见到的toast 组件



<img src="https://github.com/Galileo01/myComponents/blob/master/images/toast.png" style="zoom:67%;" />




##### 安装

引入，通过 Vue.use（安装）

##### 使用

通过Vue 全局方法 this.$toast.show() 调用显示

``` javascript
show(message,opa,duration = 2000, callback) ;
```

参数描述：



1. message :

| 参数名称 |    类型     |                       描述 | 备注                                                         | 默认值       |
| :------- | :---------: | -------------------------: | ------------------------------------------------------------ | ------------ |
| message  |   string    |           用与显示的字符串 | 可选                                                         | 要显示的信息 |
| opa      | string\|num |       弹框的背景颜色透明度 | 可选，不传时 需要**显式的传入空字符串**  “”\|\|‘’  或者 undefined | 0.5          |
| duration |     num     | 出现后多少时间消失，（ms） | 可选，不传入的时候**显式的传入一个负数**  或者 undefined     | 2000         |
| callback |  function   |   弹框消失后执行的回调函数 | 可选                                                         | 无           |
