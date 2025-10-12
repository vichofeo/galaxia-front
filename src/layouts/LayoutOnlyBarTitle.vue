<template>
  <v-app >

    <v-app-bar app clipped-left color="#1D62A1" dark v-if="$route.meta.requiereAuth">


      <v-toolbar-title>AEB {{ $route.name.toUpperCase() }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <img src="/img/ASUSS_logo_horiz.png" width="10%" />

      <btn-menu-home />
      <btn-menu-usr />

    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
<footer-j/>
  </v-app>
</template>

<script>
import BtnMenuHome from '@/components/layout/core/BtnMenuHome.vue';
import BtnMenuUsr from '@/components/layout/core/BtnMenuUsr.vue';
import FooterJ from '@/components/layout/core/FooterJ.vue';
export default {
  components: { BtnMenuHome, BtnMenuUsr, FooterJ },
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
    drawerRight: null,
    right: false,
    left: false,

  }),

};
</script>
<style scoped>
#app {
  background: url("../../public/img/fondoblanco.svg") no-repeat center center fixed;
  background-size: cover;
}
</style>