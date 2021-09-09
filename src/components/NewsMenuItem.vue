<template>
    <div>
        <!-- <ul> -->
            <li class="list-group-item" active-class="active" @click="getNewsList(), handleWelcome()">
                <label>
                    <span>
                        {{menu.title}}
                    </span>
                </label>
             </li>
        <!-- </ul> -->
    </div>
</template>

<script>
    export default {
        name: "NewsMenuItem",
        data(){
            return {                
                newsList:[]
            }
        },
        props:['menu'],
        methods:{
            getNewsList() {
                // console.log("点击了" + this.menu.title + "，栏目编号为" + this.menu.menuCode)
                console.log("点击了", this.menu.title, "，栏目编号为" , this.menu.menuCode)
                let url = `http://192.168.17.33:8087/jeecg-boot/cms/eoaCmsArticle/getArticles?_t=1629334431&pageNo=1&pageSize=20&menuCode=${this.menu.menuCode}`
                let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MzExOTE0NDQsInVzZXJuYW1lIjoiNTAyQTM5MzkifQ.AvvGMrYg8PxEAHF5Wpy3Guh_CuS7_gsuzPQ7Jtx1JE0'
                this.axios({                
                    method: 'get',  
                    url: url,              
                    headers: {'X-Access-Token':token}
                }).then(
                    (response)=>{
                        console.log("请求成功:", response)
                        this.newsList=response.data.result.records;            
                        console.log(this.newsList)
                        this.$bus.$emit('showNewsList', this.newsList)  
                        },
                    (errror)=>{
                        console.log("测试环境暂停5分钟", errror.message)
                    })
                // this.$bus.$emit('showNewsList', this.newsList)  // 应该写axios函数里面，写外面没用，数据发不出去
            },
            handleWelcome(){
                this.$bus.$emit('showWelcome', false)
                // this.$bus.$emit('hideWelcome', {showWelcome:false})
            },
        },
    }
</script>

<style>

</style>