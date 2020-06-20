<template>
    <div class="myexcel">
        <div class="content">
            <el-row class="tools ali-c" type="flex">
                <el-col :span="1"
                    ><el-tag class="tag_position" type="info" effect="dark">{{
                        td_focusName
                    }}</el-tag></el-col
                >
                <el-col :span="1.5"
                    ><el-radio-group
                        v-model="toolInfo.mode"
                        size="small"
                        fill="#409EFF"
                        @change="changeHandler"
                    >
                        <el-radio-button label="V"></el-radio-button>
                        <el-radio-button
                            label="F"
                        ></el-radio-button> </el-radio-group
                ></el-col>
                <el-col :span="16">
                    <el-input
                        class="value valueInput"
                        size="small"
                        v-model="toolInfo.curVal"
                        v-if="toolInfo.mode === 'V'"
                        @input="vinput"
                        ref="valueInput"
                        @copy.native="copyHandler"
                        @paste.native="pasteHandler($event)"
                    ></el-input>
                    <el-input
                        class="value"
                        size="small"
                        v-model="toolInfo.fun"
                        v-else
                        placeholder="单元格名称:A_1,单元格与运算符之间、运算符与运算符之间 必须用 空格 分隔"
                        @keyup.enter.native="functionCompute"
                        clearable
                        @input.native="check"
                    >
                        <template slot="prepend"
                            >{{ td_focusName }}=</template
                        ></el-input
                    >
                </el-col>
                <el-col :span="1.5" class="mar_l"
                    ><el-button size="small" @click="dialogVisible = true"
                        >编辑表格行列数</el-button
                    ></el-col
                >
                <el-col :span="1.5" class="mar_l"
                    ><el-button size="small" type="primary" @click="saveTofile"
                        >保存为xlsx</el-button
                    ></el-col
                >
            </el-row>
            <div class="table_wapper" ref="wapper">
                <div class="col-width-panel">
                    <div
                        v-for="index in tableInfo.col"
                        :key="300 + index - 1"
                        :style="{ left: index * 60 - 4 + 'px' }"
                        class="width-panel-item"
                        :data-left="index - 1"
                    ></div>
                </div>
                <div class="row-height-panel">
                    <div
                        v-for="index in tableInfo.row"
                        :key="400 + index"
                        :style="{ top: index * 25 - 4 + 'px' }"
                        class="height-panel-item"
                        :data-top="index - 1"
                    ></div>
                </div>
                <table>
                    <tbody>
                        <tr class="th">
                            <td class="cross td_vertical"></td>
                            <td
                                class="td-head td_horizontal"
                                v-for="index in tableInfo.col"
                                :key="index"
                                :data-col="index"
                            >
                                {{ headChar(index - 1) }}
                            </td>
                        </tr>
                        <tr v-for="index1 in tableInfo.row" :key="index1 + 100">
                            <td class="td-head th_vertical" :data-row="index1">
                                {{ index1 }}
                            </td>
                            <td
                                class="td"
                                v-for="index2 in tableInfo.col"
                                :key="200 + index2"
                                :data-col="index2"
                                :data-head="headChar(index2 - 1)"
                                :data-row="index1"
                            ></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <el-dialog :visible.sync="dialogVisible" top="200px" title="编辑表格">
            <el-form
                :mode="formInfo"
                label-width="70px"
                ref="form"
                size="small"
            >
                <el-form-item label="行数" prop="row"
                    ><el-input
                        v-model.number="formInfo.row"
                        clearable
                    ></el-input
                ></el-form-item>
                <el-form-item label="列数" prop="col">
                    <el-input
                        v-model.number="formInfo.col"
                        clearable
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button type="primary" size="small" @click="submitClick"
                    >确定</el-button
                >
            </span>
        </el-dialog>
        <menu-pane
            :visible.sync="menuVisible"
            ref="menuPane"
            :target-val="menuTargetVal"
            :target="menuTarget"
        ></menu-pane>
    </div>
</template>

<script>
import MenuPane from './MenuPane';
export default {
    name: 'MyExcel',
    props: {
        row: {
            type: Number,
            default: 25,
        },
        col: {
            type: Number,
            default: 30,
        },
    },
    data() {
        return {
            dialogVisible: false,
            tableInfo: {
                row: this.row,
                col: this.col,
            },
            formInfo: {
                row: this.row,
                col: this.col,
            },
            toolInfo: {
                mode: 'V', //当前 工具栏input的 操作模式
                curVal: '', //当前 focus 的表格 内的值
                fun: '', //    A_1 + B_1 + C_1 + D_1
            },
            td_focus: {},
            valueInput: {}, //input 元素
            menuVisible: false,
            menuTarget: {}, //触发 鼠标右键的 元素
            menuTargetVal: '',
            offsetTop: 0,
            offsetLeft: 0,
        };
    },
    computed: {
        value() {
            return this.valueInput.value;
        },
        //当前 focus 表格 的位置
        td_focusName() {
            if (Object.keys(this.td_focus).length === 0) return '未选中';
            const { head, row } = this.td_focus.dataset;
            return head + '_' + row;
        },
    },
    methods: {
        submitClick() {
            const { row, col } = this.formInfo;
            this.tableInfo.row = row;
            this.tableInfo.col = col;
            this.dialogVisible = false;
        },
        //表格 head 栏的标题，A-ZZ
        headChar(num) {
            //num>=0

            let str = ''; //标题文本
            const count = parseInt(num / 26); //count +就是 标题包含的字母个数
            const out = num % 26; //得到 最后一个字母的 code
            if (count > 0) {
                const char1 = String.fromCharCode(65 + count - 1); //得到第一个字母
                str += char1;
            }
            const char2 = String.fromCharCode(65 + out); //得到第二个字母
            str += char2;
            // console.log(num, count, out, str);
            return str;
        },
        //valueInput 输入时，value 绑定到 当前td
        vinput() {
            this.menuTargetVal = this.td_focus.innerHTML = this.valueInput.value;
        },
        //input 的 copy 事件
        copyHandler() {
            this.$refs.menuPane.copyHandler();
        },
        //input 的 paste 事件
        pasteHandler(e) {
            e.preventDefault(); //组织默认的事件
            this.$refs.menuPane.insteadHandler();
        },
        //模式切换
        changeHandler() {
            if (this.toolInfo.mode === 'V') {
                this.$message.info('切换到输入模式');
            } else this.$message.info('切换到函数模式');
        },
        check() {
            if (Object.keys(this.td_focus).length === 0) {
                this.$message.error('请先选中单元格');
            }
        },
        //使用 公式进行计算
        functionCompute() {
            const numReg = /[0-9]+/;
            const infixPre = this.toolInfo.fun.trim().split(' '); //分隔 每个操作数 和操作符
            const infixAfter = infixPre;
            console.log(infixPre);
            //将名称替换为 td 对应 的html
            for (const [i, item] of infixPre.entries()) {
                if (item.length !== 1) {
                    //不是 运算符
                    const arr = item.split('_'); //分隔 行列名称
                    const ele = document.querySelector(
                        `.td[data-head="${arr[0]}"][data-row="${arr[1]}"]`
                    );
                    if (!ele)
                        return this.$message.error(
                            '表达式格式输入错误,请检查错误'
                        );
                    // else console.log(ele);
                    if (!numReg.test(ele.innerHTML)) {
                        return this.$message.error(
                            '单元格包含了非数字的值，无法进行算数运算'
                        );
                    } else {
                        infixAfter[i] = ele.innerHTML;
                    }
                }
            }
            console.log('infix', infixAfter);
            const postfix = InfixToPostfix(infixAfter);
            console.log('postfix', postfix);
            const res = compute(postfix);
            this.$message.success('表达式计算成功');

            this.td_focus.innerHTML = res;
        },
        //保存 表格到 xlsx
        saveTofile() {
            const table = document.querySelector('table');
            // const blob = new Blob([table.innerText], {
            //     type: 'application/octet-stream',
            // });
            var wb = XLSX.utils.table_to_book(table);
            let vbout = XLSX.write(wb, {
                bookType: 'xlsx',
                bookSST: true,
                type: 'array',
            });
            saveAs(new Blob([vbout]), 'sheet.xlsx');
        },
        //绑定一系列 dom 事件
        bindHandler() {
            //dom 更新完之后，才拿得到 元素
            this.$nextTick(() => {
                const wapper = this.$refs.wapper;
                const horizontals = document.querySelectorAll('.td_horizontal');
                const verticals = document.querySelectorAll('.th_vertical'); //选中多个
                const tds = document.querySelectorAll('.td');
                const menuPane = this.$refs.menuPane.$el;
                this.offsetTop = this.$el.offsetTop;
                this.offsetLeft = this.$el.offsetLeft;
                this.valueInput = document.querySelector('.valueInput input');
                //获取 行列标 的 边界元素， ，实现 拖拽 改变宽高的功能
                const height_panel_items = document.querySelectorAll(
                    '.height-panel-item'
                );
                const width_panel_items = document.querySelectorAll(
                    '.width-panel-item'
                );
                // console.log(horizontals, verticals);

                //绑定 wapper滚动条 的scroll 事件，跟随滚动，固定head栏和index 栏
                wapper.addEventListener('scroll', (event) => {
                    const { scrollTop: top, scrollLeft: left } = wapper;
                    // console.log(top);
                    horizontals.forEach((ele) => {
                        ele.style.transform = `translateY(${top}px)`;
                    });
                    width_panel_items.forEach((ele) => {
                        ele.style.transform = `translateY(${top}px)`;
                    });

                    verticals.forEach((ele) => {
                        ele.style.transform = `translateX(${wapper.scrollLeft}px)`;
                    });
                    height_panel_items.forEach((ele) => {
                        ele.style.transform = `translateX(${wapper.scrollLeft}px)`;
                    });
                });

                //绑定 wapper 的鼠标 右键 事件处理函数
                wapper.addEventListener('contextmenu', (event) => {
                    event.preventDefault(); //阻止默认事件
                    const { pageX, pageY, target } = event;
                    console.log(pageX, pageY);

                    //排除 head 和index 栏
                    this.menuTarget = target;
                    this.menuTargetVal = target.innerHTML;
                    menuPane.style.left = pageX - this.offsetLeft + 'px';//减去 本组件相对文本的距离
                    menuPane.style.top = pageY - this.offsetTop + 'px';
                    this.menuVisible = true;
                });
                //绑定 td 的点击事件，选中状态
                tds.forEach((ele) => {
                    ele.addEventListener('click', () => {
                        const { col, row } = ele.dataset;
                        this.menuVisible = false;
                        // console.log(ele.dataset);
                        tds.forEach((ele) => {
                            if (ele.classList.contains('focus-border'))
                                //如果有focus 类名，则移除
                                ele.classList.remove('focus-border');
                        });
                        ele.classList.add('focus-border');
                        this.td_focus = ele; //保存 选中的td
                        this.menuTargetVal = ele.innerHTML;
                        this.menuTarget = ele;
                        this.valueInput.focus(); //点击 td input 获得焦点，准备输入
                        this.toolInfo.curVal = ele.innerHTML; //当前 td 的值赋给 valueInput
                        //为 对应的vertical 和 horizontal 添加选中 背景，取消其他
                        verticals.forEach((ele) => {
                            if (ele.dataset.row === row) {
                                ele.classList.add('cur-td-head');
                            } else if (ele.classList.contains('cur-td-head'))
                                ele.classList.remove('cur-td-head');
                        });
                        horizontals.forEach((ele) => {
                            if (ele.dataset.col === col) {
                                ele.classList.add('cur-td-head');
                            } else if (ele.classList.contains('cur-td-head'))
                                ele.classList.remove('cur-td-head');
                        });
                    });
                });
                //为 verticals 点击事件，绑定处理函数， 为所在 行tr 添加 选中的背景颜色
                verticals.forEach((ele) => {
                    ele.addEventListener('click', () => {
                        ele.parentElement.classList.toggle('focus-bg');
                    });
                });
                //为 horizontals 点击事件，绑定处理函数， 为所在 列 添加 选中的背景颜色
                horizontals.forEach((ele) => {
                    ele.addEventListener('click', () => {
                        const col = ele.dataset.col;
                        let coltds = document.querySelectorAll(
                            `.td[data-col="${col}"]`
                        );
                        coltds.forEach((ele) => {
                            ele.classList.toggle('focus-bg');
                        });
                    });
                });
                //鼠标移动处理函数

                let MouseMoveHandleWidth = () => {};

                //拖拽 行列标 边界，实现宽的改变  //FIXME: 宽度 变化还是有问题
                width_panel_items.forEach((ele, i) => {
                    let dis = 0; //mousemove 鼠标移动的距离
                    let isFinish = true;
                    //鼠标按下
                    ele.addEventListener('mousedown', (event) => {
                        const left = ele.dataset.left;
                        const leftElement = document.querySelector(
                            `.td_horizontal[data-col="${left}`
                        ); //边界左侧的 列标
                        const preWidth = parseInt(
                            getComputedStyle(leftElement, null).width
                        );
                        const preLeft = parseInt(
                            getComputedStyle(ele, null).left
                        ); //当前 边界item 的之前的 left

                        const preClientX = event.clientX;
                        isFinish = false;
                        console.log('down', dis);
                        ele.style.width = '30px'; //加宽宽度 ，防止  拖拽太快
                        // ele.style.left = preLeft - 4 + 'px'; //向左移动 4px 使向左的拖拽 不容易 失去焦点
                        //鼠标移动处理函数:改变 单元格 宽度
                        MouseMoveHandleWidth = (event) => {
                            event.preventDefault(); //!!!!:鼠标移动 后组织默认事件：排除 drag 拖拽事件
                            const nowClientX = event.clientX;
                            dis = nowClientX - preClientX;
                            // console.log(
                            //     `dis=${dis}=${nowClientX}-${preClientX}`
                            // );
                            isFinish = false;
                            leftElement.style.width = preWidth + dis + 'px'; //左侧单元格 一列改变宽度
                            console.log('move');
                            ele.style.left = preLeft + dis - 4 + 'px';
                        };
                        ele.addEventListener('mousemove', MouseMoveHandleWidth);
                    });
                    const upHandler = () => {
                        // console.log(isFinish);
                        if (isFinish) return;
                        // 当前元素 移除 move 处理函数，
                        ele.removeEventListener(
                            'mousemove',
                            MouseMoveHandleWidth
                        );
                        console.log(ele.style.left);

                        //改变当前item 以及之后的item 的left
                        for (let j = i + 1; j < width_panel_items.length; j++) {
                            const ele1 = width_panel_items[j];
                            const preLeft = parseInt(
                                getComputedStyle(ele1, null).left
                            );
                            ele1.style.left = preLeft + dis + 'px';
                        }
                        isFinish = true; //标记  是否完成一次移动
                        const nowLeft = parseInt(
                            getComputedStyle(ele, null).left
                        );
                        ele.style.left = nowLeft + 2 + 'px'; //抵消之前 少移动的4 px，还剩2px 使 边界居中
                        ele.style.width = '8px'; //回复为原来的 宽度
                    };

                    ele.addEventListener('mouseup', upHandler);
                    wapper.addEventListener('mouseup', upHandler);
                    ele.addEventListener('mouseleave', upHandler());
                });

                height_panel_items.forEach((ele, i) => {
                    let dis = 0; //mousemove 鼠标移动的距离
                    let isFinish = true;
                    //鼠标按下
                    ele.addEventListener('mousedown', (event) => {
                        const top = ele.dataset.top;
                        const topElement = document.querySelector(
                            `.th_vertical[data-row="${top}`
                        ); //边界上方的 行标
                        console.log(topElement);

                        const preHeight = parseInt(
                            getComputedStyle(topElement, null).height
                        );
                        const preTop = parseInt(
                            getComputedStyle(ele, null).top
                        ); //当前 边界item 的之前的 left

                        const preClientY = event.clientY;
                        isFinish = false;
                        console.log('down', dis);
                        ele.style.height = '20px'; //加宽高度，防止  拖拽太快

                        //鼠标移动处理函数:改变 单元格 宽度，
                        MouseMoveHandleWidth = (event) => {
                            event.preventDefault(); //!!!!:鼠标移动 后组织默认事件：排除 drag 拖拽事件
                            const nowClientY = event.clientY;
                            dis = nowClientY - preClientY;
                            isFinish = false;
                            topElement.style.height = preHeight + dis + 'px'; //左侧单元格 一列改变宽度
                            console.log('move');
                            ele.style.top = preTop + dis - 4 + 'px';
                        };
                        ele.addEventListener('mousemove', MouseMoveHandleWidth);
                    });
                    const upHandler = () => {
                        console.log(isFinish);
                        if (isFinish) return;
                        // 当前元素 移除 move 处理函数，
                        ele.removeEventListener(
                            'mousemove',
                            MouseMoveHandleWidth
                        );
                        console.log(ele.style.top);

                        //改变当前item 以及之后的item 的left
                        for (
                            let j = i + 1;
                            j < height_panel_items.length;
                            j++
                        ) {
                            const ele1 = height_panel_items[j];
                            const preTop = parseInt(
                                getComputedStyle(ele1, null).top
                            );
                            ele1.style.top = preTop + dis + 'px';
                        }
                        isFinish = true; //标记  是否完成一次移动
                        const nowTop = parseInt(
                            getComputedStyle(ele, null).top
                        );
                        ele.style.top = nowTop + 2 + 'px';
                        ele.style.height = '6px'; //回复为原来的 宽度
                    };

                    ele.addEventListener('mouseup', upHandler);
                    wapper.addEventListener('mouseup', upHandler);
                    ele.addEventListener('mouseleave', upHandler);
                });
            });
        },
    },
    created() {
        this.bindHandler();
    },
    components: {
        'menu-pane': MenuPane,
    },
};
</script>
<style lang="less">
.myexcel {
    position: relative;
    .el-card div {
        font-size: 14px;
    }
}
.el-card {
    /* height: 100%;*/
    width: 100%;
}
.el-card__body {
    padding-top: 5px;
}
.el-row {
    margin-bottom: 10px;
    margin-left: 0 !important;
    margin-right: 0 !important;
}
.ali-c {
    align-items: center;
}
.mar_l {
    margin-left: 5px;
}
.title {
    text-align: center;
}

.col-width-panel,
.row-height-panel {
    position: absolute;
}
.col-width-panel .width-panel-item {
    width: 8px;
    height: 25px;
    position: absolute;
    cursor: col-resize;
    z-index: 4;
}
.row-height-panel .height-panel-item {
    width: 60px;
    height: 6px;
    position: absolute;
    cursor: row-resize;
    z-index: 4;
}
.table_wapper {
    overflow: auto;
    height: 600px;
    position: relative;
}
table {
    /* border-collapse: collapse; */
    border-spacing: 0.5px;
    table-layout: fixed;
    height: 0;
    width: 0;
    /* position: relative; */
}
td {
    height: 25px;
    border: #ccc 1px solid;
    font-size: 12px;
    width: 60px;
    text-align: center;
    overflow-wrap: break-word;
    word-break: break-all;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-sizing: border-box;
    overflow: hidden;
    cursor: default;
}

.td-head {
    background-color: #f0f0f0;
    user-select: none;
}
.cross {
    background-color: #fff;
}
.focus-border {
    border: 1.5px solid #5292f7;
}
/*光标 聚集*/
.focus-bg {
    background-color: rgba(1, 136, 251, 0.1);
}
/*td 选中，块操作*/
.choose-bg {
    background-color: rgba(1, 136, 251, 0.1);
    border: 1px solid #5292f7 !important;
}
.cur-td-head {
    background-color: #e1e1e1;
}
.tag_position {
    width: 60px;
    text-align: center;
}
.menuPane {
    width: 100px;
    /* height: 150px; */
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid #bbd8e5;
    border-radius: 4px;
    background-color: #fff;
    font-size: 14px;
}
.menuPane > .menu-item {
    line-height: 24px;
    height: 24px;
    letter-spacing: 1px;
    font-size: 13px;
    padding-left: 10px;
    cursor: pointer;
    position: relative;
}
.submenu,
.submenu-s {
    display: none;
    width: 60px;
    left: 101px;
    top: 24px;
    position: absolute;
    background-color: #fff;
    border: 1px solid #bbd8e5;
}
.submenu > div {
    padding-left: 5px;
}
.mi2-s,
.mi4-s,
.mi5-s {
    top: 0;
}
.submenu > div:hover,
.menuPane > div:hover,
.submenu-s > div:hover {
    background-color: #f0f8ff;
}
.submenu:hover {
    display: block;
}
.menu-item:hover .submenu {
    display: block;
}
.submenu-s > div {
    padding-left: 5px;
}
.submenu-item:hover .submenu-s {
    display: block;
    position: absolute;
    top: 96px;
    left: 61px;
}
</style>
