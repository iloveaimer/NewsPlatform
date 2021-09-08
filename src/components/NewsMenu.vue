<template>
    <div class="list-group-item">
<!--         <ul>
            <li class="list-group-item"> -->
                <NewsMenuItem 
                    v-for="menuObj in menuList" 
                    :key="menuObj.menuCode" 
                    :menu="menuObj">                    
                </NewsMenuItem>
<!--             </li>
        </ul> -->

    </div>
</template>

<script>
    import NewsMenuItem from "./NewsMenuItem.vue"

    export default {
        name: "NeswMenu",
        components:{NewsMenuItem},
        props:['menuList'],
        methods:{

        }
    }
</script>

<style>

</style>