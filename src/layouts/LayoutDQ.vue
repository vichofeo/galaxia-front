<template>
    <v-app>
  
      
      <dashboard-core-app-bar v-if="$route.meta.requiereAuth"/>
  
      <dashboard-core-view v-if="$route.meta.requiereAuth"/>
  
      
    </v-app>
  </template>
  
  <script>
  export default {
    name: "DashboardIndex",
  
    components: {
      DashboardCoreAppBar: () => import("@/components/layout/core/AppBarDq.vue"),
      //DashboardCoreDrawer: () => import("@/components/layout/core/Drawer"),
      //DashboardCoreSettings: () => import("@/components/layout/core/Settings"),
      DashboardCoreView: () => import("@/components/layout/core/View"),
    },
  
    data: () => ({
      expandOnHover: false,
    }),
  };
  </script>
  