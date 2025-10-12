<template>
    <v-app>
        
        <left-menu-vue />
        <v-main>
            <router-view></router-view>
        </v-main>
        <footer-vue />
    </v-app>
</template>

<script>
import HeaderVue from '@/components/layout/Header.vue'
import FooterVue from '@/components/layout/Footer.vue'
import LeftMenuVue from '@/components/layout/LeftMenu.vue'

export default {
    name: "LayoutFrm",
    components: {
        HeaderVue,
        FooterVue,
        LeftMenuVue
    },
    data() {
        return {

        }
    },
}
</script>

<style></style>