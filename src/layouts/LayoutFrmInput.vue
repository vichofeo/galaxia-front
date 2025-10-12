<template>
    <v-app>
        
        <left-menu-frms/>        
        <v-main>
            <v-breadcrumbs :items="[$store.state.usr.institucion.dpto, $store.state.usr.institucion.muni, 'Ficha Epidemiologica']"></v-breadcrumbs>
            <router-view></router-view></v-main>
        <footer-vue />
    </v-app>
</template>

<script>
import HeaderVue from '@/components/layout/Header.vue'
import FooterVue from '@/components/layout/Footer.vue'

import LeftMenuFrms from '@/components/layout/LeftMenuFrms.vue'

export default {
    name: "LayoutFrmInput",
    components: {
        HeaderVue,
        FooterVue,
        LeftMenuFrms
    },
    data() {
        return {

        }
    },
}
</script>

<style></style>