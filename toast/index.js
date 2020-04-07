import Toast from './Toast'
const obj={};
obj.install=function(Vue){
    //创建组件构造器
    const ToastConstructor =Vue.extend(Toast);
    //创建组件实例
    const toastIns=new ToastConstructor();
    //手动将组件实例 挂载到dom元素上
    toastIns.$mount(document.createElement('div'));
    document.body.appendChild(toastIns.$el);
    
    //将插件/组件实例对象  挂载到Vue原型上
    Vue.prototype.$toast=toastIns;
}


export default obj;