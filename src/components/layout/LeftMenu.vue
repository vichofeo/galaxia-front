<template>
  <section>
    <v-navigation-drawer v-model="drawerRight" app clipped >
      
      
          <v-list-item class="text-h6" title="Aplicacion"/>
          <v-list-item title="Subtitulo"/>

      

      <v-divider></v-divider>
      <!--v-list density="compact" nav v-for="(menu, i) in $store.state.pages" :key="`mnpr_${i}`"-->
      
      <v-list dense nav v-for="(menu, i) in menuOpcion" :key="`mnpr_${i}`">
      <v-subheader>{{ menu.name_module }}</v-subheader>
      <v-list-item-group
        v-model="selectedItem"
        color="primary"
      >
        <v-list-item v-for="(m, index) in menu.children"  :key="`sbmnpr_${index}`" link :to="`${menu.path_browser}/${m.path_browser}`">
          <v-list-item-icon>
            <v-icon v-text="'mdi-star'"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="m.name_module"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn color="#1D62A1" @click="out()" block class="text-white">Salir</v-btn>
        </div>
      </template>
    </v-navigation-drawer>


    <v-app-bar app clipped-left color="#1D62A1" density="compact" class="text-white">
      
      <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight" dark></v-app-bar-nav-icon>

      <v-toolbar-title>ADMINISTRATOR EPI</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    
  </section>
</template>

<script>
//import { clearDataStore } from "@/config/localStore";
export default {
  name: "LeftMenu",
  props: {
    source: String,
  },
  data: () => ({
    drawer: null,
    drawerRight: null,
    right: false,
    left: false,
    selectedItem: 0,
    menuOpcion: [
    {
        name_module: "Administracion",
        path_browser: "/admin",        
        children: [
            {
                path_browser: "modulos",
                name_module: "Super Admin",                
                
            },
            {
                path_browser: "pages",
                name_module: "Creacion de usuarios y credenciales de sistema",
                
                
            }
        ]
    }
  ],
  }),
  methods: {
    out() {
      //clearDataStore();
      this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style></style>
