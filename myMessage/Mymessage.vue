<template>
    <div class="my_message" :class="{ show: isShow,info:type==='info',succuss:type==='succuss',warning:type==='warning',danger:type==='danger'}">
       <div > {{ message }}</div>
    </div>
</template>

<script>
export default {
    name: 'Mymessage',
    data() {
        return {
            isShow: false,
            message: '',
            type:'info'
        };
    },
    props: {
    },
    methods: {
        //显示 的入口方法
        show(message = '要显示的信息',type='info', duration = 2000, callback) {
            this.message = message;
            this.isShow = true;
            this.type=type;
            setTimeout(() => {
                this.isShow = false;
                if (callback) {
                    //如果传入 回调函数   则 在 文本 消失后 立即执行
                    callback();
                }
            }, duration);
        },
        info(message,duration,callback){
            this.show(message,'info',duration,callback);
        },
        succuss(message,duration,callback){
            this.show(message,'succuss',duration,callback);
        },
        warning(message,duration,callback){
            this.show(message,'warning',duration,callback);
        },
        danger(message,duration,callback){
            this.show(message,'danger',duration,callback);
        },
    }
};
</script>

<style>
.my_message {
    min-width: 200px;
    box-sizing: border-box;
    border-radius: 4px;
    position: fixed;
    z-index: 2;
    left: 50%;
    top: -50px;
    transform: translateX(-50%);
    transition: opacity 0.3s, transform 0.4s, top 0.4s;
    overflow: hidden;
    padding: 15px 15px 15px 15px;
    /* align-items: center; */
    font-size: 14px;
    border: 1px solid;
    text-align: center;
    display: block;
    user-select: none;
}
.show {
    top: 20px;
}
.danger {
    background-color: #fef0f0;
    color: #f57272;
    border: #fde2e2;
}
.info {
    background-color: #edf2fc;
    border-color: #ebeef5;
    color: #909399;
}
.succuss {
    background-color: #f0f9eb;
    color: #67c23a;
    border-color: #f0f9eb;
}
.warning {
    background-color: #fdf6ec;
    color: #e6aaa8;
    border-color: #fcf5eb;
}
</style>
