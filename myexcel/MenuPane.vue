<template>
    <div class="menuPane" v-show="visible">
        <!--menu 的结构如下-->
        <!--menuPane > menu-item > submenu > submenu-item > submenu-s > submenu-s-item-->
        <div class="menu-item" @click="copyHandler">
            <span>复制</span>
        </div>
        <div class="menu-item" v-show="copyValue !== '' || copyValues !== []">
            <span>粘贴</span>
            <div class="m-2-1 submenu mi2-s">
                <div @click="insteadHandler">代替</div>
                <div
                    v-show="canComputed && targetType === 'td'"
                    @click="addHandler"
                >
                    相加
                </div>
                <div
                    v-show="canComputed && targetType === 'td'"
                    @click="subHandler"
                >
                    相减
                </div>
            </div>
        </div>

        <div class="menu-item">
            <span>行操作</span>
            <div class="mi4-s submenu">
                <div @click="row_colSummary('row')">求和</div>
                <div @click="row_colAve('row')">求平均</div>
                <div @click="row_colFind('row', 1)">求最大</div>
                <div @click="row_colFind('row', 2)">求最小</div>
                <div class="submenu-item sort mi4-s-i">
                    <span>排序</span>
                    <div class="submenu-s">
                        <div @click="row_colSort('row', 1)">升序</div>
                        <div @click="row_colSort('row', 2)">降序</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="menu-item">
            <span>列操作</span>
            <div class="mi5-s submenu">
                <div @click="row_colSummary('col')">求和</div>
                <div @click="row_colAve('col')">求平均</div>
                <div @click="row_colFind('col', 1)">求最大</div>
                <div @click="row_colFind('col', 2)">求最小</div>
                <div class="submenu-item sort mi4-s-i">
                    <span>排序</span>
                    <div class="submenu-s">
                        <div @click="row_colSort('col', 1)">升序</div>
                        <div @click="row_colSort('col', 2)">降序</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MenuPane',
    props: {
        targetVal: String, //触发 鼠标右键的元素 inneHtml
        visible: Boolean,
        target: {}, //触发 鼠标右键的元素
    },
    computed: {
        //判断 是否能 对当前td 的innerHtml 进行 算数运算
        canComputed() {
            if (!this.targetVal) return false;
            const numReg = /[0-9]+/;
            //如果是数字
            if (numReg.test(this.targetVal)) return true;
            else return false;
        },
        //target td 所属于的类型
        targetType() {
            if (Object.keys(this.target).length === 0) return '';
            // console.log(this.target.classList);
            const classList = this.target.classList;
            if (classList.contains('td_horizontal')) return 'horizontal';
            else if (classList.contains('th_vertical')) return 'vertical';
            else if (classList.contains('td')) return 'td';
        },
    },
    data() {
        return {
            copyValue: '', //赋值的 单个值,
            copyValues: [], //一行/一列的  赋值的值
            copyMode: 'one', //复制的模式 默认一个  one/row/col
        };
    },
    methods: {
        //
        copyHandler() {
            this.closeMenu();
            if (this.targetType === 'td') {
                this.copyValue = this.targetVal;
                this.copyMode = 'one';
                this.$message.success('复制成功');
            } else if (this.targetType === 'horizontal') {
                this.copyMode = 'col';
                const { values } = this.getRow_ColInfo('col');
                this.copyValues = values;
                this.$message.success('成功复制一列');
            } else if (this.targetType === 'vertical') {
                this.copyMode = 'row';
                const { values } = this.getRow_ColInfo('row');
                this.copyValues = values;
                this.$message.success('成功复制一行');
            }
            console.log('copySrc:', this.targetType, this.copyMode);
        },
        //粘贴-替换
        insteadHandler() {
            this.closeMenu();
            //替换 单个表格
            if (this.targetType === 'td' && this.copyMode === 'one') {
                this.target.innerHTML = this.copyValue;
                this.$message.success('粘贴成功');
            }
            //替换 一列
            else {
                const srcs = this.copyValues;
                let elements = [];
                if (
                    this.targetType === 'horizontal' &&
                    this.copyMode === 'col'
                ) {
                    elements = this.getRow_ColInfo('col').elements;
                    this.$message.success('成功粘贴一行');
                } //替换 一行
                else if (
                    this.targetType === 'vertical' &&
                    this.copyMode === 'row'
                ) {
                    elements = this.getRow_ColInfo('row').elements;
                    this.$message.success('成功粘贴列');
                } else {
                    this.$message.warning('行与列不能相互粘贴复制');
                }
                // console.log(elements);
                elements.forEach((ele, i) => {
                    ele.innerHTML = srcs[i];
                });
            }

            console.log('pasteTarget:', this.targetType, this.copyMode);
        },
        //粘贴- 相加
        addHandler() {
            this.closeMenu();
            const old = this.targetVal;
            this.target.innerHTML =
                parseInt(old) + parseInt(this.copyValue) + '';
            this.$message.success('粘贴成功');
        }, //粘贴相减
        subHandler() {
            this.closeMenu();
            const old = this.targetVal;
            this.target.innerHTML =
                parseInt(old) - parseInt(this.copyValue) + '';
            this.$message.success('粘贴成功');
        },
        //获取target 所在行 td 的innerHtml 并转换为num
        getRow_ColInfo(mode = 'row') {
            const numReg = /[0-9]+/;
            const values = []; //所有 td的 值
            const valids = []; //所有 有效值
            const nums = []; //所有数字
            const validElements = []; //存储 数据有效的 td 元素
            let numCount = 0; //记录 值可以 转化为 num  的个数
            let validCount = 0; //记录非空个数
            let sum = 0;
            let msg = '';
            let tds = [];
            if (mode === 'row')
                //获取target 所在行的 所有td
                tds = this.target.parentNode.querySelectorAll('.td');
            else if (mode === 'col') {
                //通过 属性选择器 获取 target 所在列 的所有 td
                const col = this.target.dataset.col;
                tds = document.querySelectorAll(`.td[data-col="${col}"]`);
            }
            for (const ele of tds) {
                const html = ele.innerHTML;
                if (html) {
                    validCount++;
                    valids.push(html); //存储所有 有效 的数据值
                    //如果 值可以 转化为 num
                    if (numReg.test(html)) {
                        sum += parseInt(html);
                        numCount++;
                        nums.push(parseInt(html));
                    }
                    validElements.push(ele);
                }
                values.push(html);
            }
            let res = {
                values,
                valids,
                nums,
                numCount,
                sum,
                msg,
                validElements,
                elements: tds,
                isAllNum: numCount === validCount,
                flag: true, //是否有 有效的值
            };
            if (validCount === 0) {
                res.flag = false;
            } //存在部分有效值 不可转为 number
            else if (nums.length !== validCount) {
                res.msg = '存在非数字的值';
            }
            return res;
        },
        //行操作 -求和
        row_colSummary(mode) {
            this.closeMenu();
            const res = this.getRow_ColInfo(mode);
            if (!res.flag) {
                this.$message.warning(
                    `该${mode === 'row' ? '行' : '列'}不存在有效值`
                );
            } else if (res.isAllNum) {
                const sum = res.sum;
                this.$alert(`合为  ${sum}`, '提示', {
                    confirmButtonText: '确定',
                    type: 'success',
                    closeOnClickModal: true,
                }).catch((err) => {});
            } else {
                this.$message.warning('操作失败:' + res.msg);
            }
        }, //行操作-求平均
        row_colAve(mode) {
            this.closeMenu();
            const res = this.getRow_ColInfo(mode);
            if (!res.flag) {
                this.$message.warning(
                    `该${mode === 'row' ? '行' : '列'}不存在有效值`
                );
            } else if (res.isAllNum) {
                const { sum, numCount } = res;
                this.$alert(`平均值为  ${sum / numCount}`, '提示', {
                    confirmButtonText: '确定',
                    type: 'success',
                    closeOnClickModal: true,
                }).catch((err) => {});
            } else {
                this.$message.warning('操作失败:' + res.msg);
            }
        },
        //行操作-查找 最大/最小
        row_colFind(mode, type) {
            this.closeMenu();
            const res = this.getRow_ColInfo(mode);
            if (!res.flag) {
                this.$message.warning(
                    `该${mode === 'row' ? '行' : '列'}不存在有效值`
                );
            } else if (res.isAllNum) {
                const nums = res.nums;
                let result = nums[0];
                for (const num of nums) {
                    if (type === 1) {
                        result = num > result ? num : result;
                    } else {
                        result = num < result ? num : result;
                    }
                }
                this.$alert(
                    `${type === 1 ? '最大' : '最小'}值为  ${result}`,
                    '提示',
                    {
                        confirmButtonText: '确定',
                        type: 'success',
                        closeOnClickModal: true,
                    }
                ).catch((err) => {});
            } else {
                this.$message.warning(res.msg);
            }
        },
        //行操作 -排序   type :1:升序 2：降序
        async row_colSort(mode, type) {
            this.closeMenu();
            const res = this.getRow_ColInfo(mode);
            if (!res.flag) {
                this.$message.warning(
                    `该${mode === 'row' ? '行' : '列'}不存在有效值`
                );
            } else if (res.isAllNum) {
                const { nums, validElements } = res;
                nums.sort((a, b) => {
                    return type === 1 ? a - b : b - a;
                });
                //赋值innerHtml
                validElements.forEach((ele, i) => {
                    ele.innerHTML = nums[i];
                });
                this.$message.success('排序成功');
            } //存在 字符串，按照字符串的方式排序
            else {
                const { valids, validElements } = res;
                const result = await this.$confirm(
                    '该行包含非数字的字符串，排序是否采用大小写敏感',
                    '提示',
                    {
                        distinguishCancelAndClose: true,
                        confirmButtonText: '采用',
                        cancelButtonText: '不采用',
                        type: 'warning',
                    }
                ).catch((error) => error);
                if (result === 'close') {
                    this.$message.info('操作取消');
                } else {
                    valids.sort((a, b) => {
                        //如果选择 不采用 大小写敏感，全部转换为大写 再进行比较
                        if (result === 'cancel') {
                            a = a.toUpperCase();
                            b = b.toUpperCase();
                        }
                        if (type === 1) {
                            //升序
                            return a < b ? -1 : 1;
                        } //降序
                        else return a < b ? 1 : -1;
                    });
                    // console.log(values,result);
                    validElements.forEach((ele, i) => {
                        ele.innerHTML = valids[i];
                    });
                    this.$message.success('排序成功');
                }
            }
        },
        //关闭菜单
        closeMenu() {
            this.$emit('update:visible', false); //更新 prop visible
        },
        bindHandler() {},
    },
    created() {},
};
</script>

<style scoped>
.menuPane {
    width: 100px;

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
