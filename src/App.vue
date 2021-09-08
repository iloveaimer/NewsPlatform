<template>
  <div>
    <div class="row">
      <div class="col-xs-offset-2 col-xs-8">
        <NewsHeader></NewsHeader>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-2 col-xs-offset-2">
        <div class="list-group">
          <NewsMenu 
            :menuList="menuList">
          </NewsMenu>
        </div>
      </div>
      <div class="col-xs-6">
        <div class="panel">
          <div class="panel-body">
            <div  v-show="showWelcome">
              <!-- 展示欢迎界面 -->
              <h2 v-show="showWelcome" style="color: #0081cc">
                  欢迎登陆
              </h2><br>
              <h2 v-show="isLoading" style="color: #0081cc">
                  Loading……
              </h2> 
              <img src="./images/iloveCSCEC.png">
            </div>
            <NewsContent></NewsContent>
          </div>
        </div>
      </div>
    </div>

    <!-- 路由试验田 -->
    <div class="row">
      <div class="col-xs-2 col-xs-offset-2">
        <div class="list-group">
					<!-- Vue中借助router-link标签实现路由的切换 -->
					<router-link class="list-group-item" active-class="active" to="/about">About</router-link>
          <router-link class="list-group-item" active-class="active" to="/home">Home</router-link>
        </div>
      </div>
      <div class="col-xs-6">
        <div class="panel">
          <div class="panel-body">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // 如下路径存放并在App中引入bootstrap.css 不推荐，因为App会严格检查，而bootstrap.css存在未下载字体
  // 推荐存放到public\css\bootstrap.css
  // import "./assets/css/bootstrap.css"

  import NewsHeader from "./components/NewsHeader.vue"
  import NewsMenu from "./components/NewsMenu"
  import NewsContent from "./components/NewsContent"

  export default {
    name: 'App',
    components: {NewsHeader, NewsMenu, NewsContent},
    data(){
      return {
        showWelcome: true,
        isLoading:false,
        menuList: [
          {menuCode:'A01',title:'公司新闻'},
          {menuCode:'A07',title:'通知公告'},
          {menuCode:'A04',title:'文件中心'},
          {menuCode:'A05',title:'要事通报'},
          {menuCode:'A12',title:'管理创新'},
          {menuCode:'A13',title:'业务管理'},
          {menuCode:'A14',title:'精品工程'},
          {menuCode:'A15',title:'重要讲话'},
        ],
      }
    },
    mounted(){
/*       this.$bus.$on('getNews', (showWelcome,isLoading) => {
        this.showWelcome = showWelcome
        this.isLoading = isLoading
      }) */
      this.$bus.$on('showWelcome', (showWelcome)=>{
        this.showWelcome = showWelcome
      })
    },
  }

</script>

<style>

</style>
