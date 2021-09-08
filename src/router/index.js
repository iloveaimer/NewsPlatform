// 该文件用于创建整个应用的路由器
import VueRouter from 'vue-router';
// 引入组件
import About from '../pages/About'
import Home from '../pages/Home'

// 创建并暴露router实例对象，去管理一组一组的路由规则
export default new VueRouter({
    routes: [
        { 
            path: '/about',
            component:About,
        },
        { 
            path:'/home',
            component:Home,
        }
    ]
})