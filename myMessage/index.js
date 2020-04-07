import message from './Mymessage'
const Mymessage={};
Mymessage.install=function(Vue){
    //创建组件构造器
    const MessageConstructor =Vue.extend(message);
    //创建组件实例
    const messageIns=new MessageConstructor();
    //手动将组件实例 挂载到dom元素上
    messageIns.$mount(document.createElement('div'));
    document.body.appendChild(messageIns.$el);
    
    //将插件/组件实例对象  挂载到Vue原型上
    Vue.prototype.$mymessage=messageIns;
}


export default Mymessage;