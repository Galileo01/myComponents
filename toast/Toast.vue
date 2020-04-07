<template>
  <div
    class="toast"
    v-show="isShow"
    :style="{opacity:opa}"
  >{{message}}</div>
</template>

<script>
export default {
  name: "Toast",
  data() {
    return {
      message: "要显示的信息",
      isShow: false,
      opa:'0.5',
    };
  },
  methods: {
    //显示弹窗
    show(message,opa,duration = 2000, callback) {
      this.message = message!==''?message:this.message;
      this.opa=opa+'';
      this.isShow = true;
      setTimeout(() => {
        this.isShow = false;
        if (callback) {
          //如果传入 回调函数   则 在 文本 消失后 立即执行
          callback();
        }
      },  duration>0?duration:2000);
    }
  }
};
</script>

<style>
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform: translate(-50%, -50%);
  color: #fff;
  background-color: rgba(0, 0, 0);
  padding: 8px 10px;
  border-radius: 4px;
  user-select: none; /*禁止用户选中文本 */
}
</style>