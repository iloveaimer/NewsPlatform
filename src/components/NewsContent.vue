<template>
    <div >
        <h2 style="color: #0081cc">{{newsList[0].columnId_dictText}}</h2>
        <el-button type="text" @click="open">输入邮箱</el-button>
        <!-- Form -->
        <el-button type="text" @click="dialogFormVisible = true">点击新增</el-button>

        <el-table
            :data="newsList"
            style="width: 100%"
            :default-sort = "{prop: 'date', order: 'descending'}">
            <el-table-column
                prop="title"
                label="新闻标题"
                sortable
                width="300">
                <!-- 悬浮可显示新闻相关信息 -->
                <!-- 得按需引入Element插件Popover -->
                <template slot-scope="scope">
                    <el-popover trigger="hover" placement="top" width="400">
                        <p>作者: {{ scope.row.author }}</p>
                        <p>内容: {{ scope.row.content }}</p>
                        <div slot="reference" class="name-wrapper">
                            <!-- <el-tag size="medium">{{ scope.row.title }}</el-tag> -->
                            {{ scope.row.title }}
                        </div>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column
                prop="author"
                label="作者"
                sortable
                width="100">
            </el-table-column>
            <el-table-column
                prop="updateTime"
                label="发布日期"
                sortable
                width="160">
            </el-table-column>

            <!-- 对列表新闻进行操作 -->
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button
                        size="mini"
                        @click="handleEdit(scope.$index, scope.row)">
                        编辑
                    </el-button>
                    <el-button
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.$index, scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 点击新增弹出的dialog对话框 -->
        <el-dialog title="新增新闻" :visible.sync="dialogFormVisible" center>
        <el-form :model="form">
            <el-form-item label="新闻标题" :label-width="formLabelWidth">
                <el-input 
                    v-model="form.title" 
                    autocomplete="off" 
                    maxlength="10"
                    show-word-limit
                    clearable></el-input>
            </el-form-item>
            <el-form-item label="新闻内容" :label-width="formLabelWidth">
                <el-input  
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 6}"
                    v-model="form.content" 
                    autocomplete="off" 
                    clearable>
                </el-input>
            </el-form-item>
            <el-form-item label="创建时间" :label-width="formLabelWidth">
                <el-date-picker
                    v-model="form.updateTime"
                    value-format="yyyy-MM-dd hh:mm:ss"
                    type="datetime"
                    placeholder="选择日期时间"
                    align="right"
                    :picker-options="pickerOptions">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="编辑作者" :label-width="formLabelWidth">
                <el-input v-model="form.author" autocomplete="off" clearable></el-input>
            </el-form-item>
            <el-form-item label="所处栏目" :label-width="formLabelWidth">
                <el-select v-model="form.columnId_dictText" placeholder="请选择栏目分类">
                    <el-option label="公司新闻" value="company_news"></el-option>
                    <el-option label="通知公告" value="notice"></el-option>
                    <el-option label="文件中心" value="files_center"></el-option>
                    <el-option label="要事通报" value="important_notice"></el-option>
                    <el-option label="管理创新" value="management_innovation"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogFormVisible = false; add()">确 定</el-button>
        </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name:"NewsContent",
        data(){
            return{
                newsList:[],
                // columnId_dictText:"",
                addForm:[],
                dialogTableVisible: false,
                dialogFormVisible: false,
                input:'',
                form: {
                    title: '',
                    content: '',
                    createTime: '',
                    updateTime: '',
                    author: '',
                    columnId_dictText:"",
                    // delivery: false,
                    // type: [],
                    // resource: '',
                    // desc: ''
                },
                formLabelWidth: '100px',
                pickerOptions: {
                    shortcuts: [{
                        text: '今天',
                        onClick(picker) {
                        picker.$emit('pick', new Date());
                        console.log(new Date())
                        }
                        
                    }, {
                        text: '昨天',
                        onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                        }
                    }, {
                        text: '一周前',
                        onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                        }
                    }]
                },
            }
        },
        methods: {
            updateNewsList(newsList){
                this.newsList = newsList
                console.log("更新" + this.newsList.length + "条新闻")
            },
            open() {
                this.$prompt('请输入邮箱', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
                inputErrorMessage: '邮箱格式不正确'
                }).then(({ value }) => {
                    this.$message({
                        type: 'success',
                        message: '你的邮箱是: ' + value
                    });
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '取消输入'
                        });       
                    });
            },
            add(){
                console.log("新增一条新闻")
                const addForm = this.form
                this.form = {}
                this.newsList.push(addForm)
            },
            handleEdit(index, row) {
                console.log(index, row);
            },
            handleDelete(index, row) {
                console.log(index, row);
            }
        },
        mounted(){
            // 再新建一个方法函数的写法
            // this.$bus.$on('showNewsList', this.updateNewsList)
            this.$bus.$on('showNewsList', (newsList) => {
                console.log("嗖嗖嗖！接收到NewsMenuItem传来的数据了")
                this.newsList = newsList
            })
        },
        beforeDestroy() {
            this.$bus.$off('showNewsList')
        },
    }
</script>

<style>

</style>