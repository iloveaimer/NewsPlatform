import Vue from 'vue'
import App from './App.vue'
// 引入Axios
import axios from 'axios'
import VueAxios from "vue-axios";
// 引入VueRouter
import VueRouter from 'vue-router';
// 引入路由器
import router from './router';

// 引入ElementUI样式
import 'element-ui/lib/theme-chalk/index.css';
//按需引入element-ui
import {Table, TableColumn, Button, Message, MessageBox, Option, Select, Input, Dialog, Form, FormItem, DatePicker, Popover, Tag} from 'element-ui';

// 关闭生产提醒
Vue.config.productionTip = false

// 使用Axios
Vue.use(VueAxios,axios);

// 使用路由
Vue.use(VueRouter)
Vue.use(router)

// Vue.use(ElementUI)
Vue.use(Button)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Select)
Vue.use(Input)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(DatePicker)
Vue.use(Popover)
Vue.use(Tag)
// Vue.use(Message)
// Vue.use(Form)
// Vue.use(FormItem)

// 在单独按需引入element组件时，message组件需要挂载到Vue全局对象上，而不是用Vue.use(Message)，
// 这是message组件与其他组件不同的地方。
// 其中与之相同、需要挂载到Vue全局对象上的，还有confirm组件。
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt

//创建vm
new Vue({
  render: h => h(App),
  router:router,
  beforeCreate(){
    Vue.prototype.$bus = this    
}
}).$mount('#app')