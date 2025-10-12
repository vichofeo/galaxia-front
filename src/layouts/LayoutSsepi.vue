<template>
  <v-app>

    


    <dashboard-core-view></dashboard-core-view>
    <dashboard-core-footer />
    
  </v-app>
</template>

<script>
export default {
  name: "DashboardIndex",

  components: {
//    DashboardCoreAppBar: () => import("@/components/layout/core/AppBar.vue"),
    //DashboardCoreDrawer: () => import("@/components/layout/core/Drawer"),
    //DashboardCoreSettings: () => import("@/components/layout/core/Settings"),
    DashboardCoreView: () => import("@/components/layout/core/View.vue"),

    DashboardCoreFooter: () => import("@/components/layout/core/FooterJ.vue"),
  },

  data: () => ({
    expandOnHover: false,
  }),
};
</script>
<style scoped>
#app {
  
  background-size: cover;
}
</style>
