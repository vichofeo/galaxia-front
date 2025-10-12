<template>
  <section>
    <v-app-bar clipped-left color="#1D62A1" density="compact" class="text-white">
      <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight"></v-app-bar-nav-icon>

      <v-toolbar-title
        >{{ $store.state.usr.institucion.gestor }}/{{
          $store.state.usr.institucion.esalud
        }}
        - Hojas Epidemiologicas</v-toolbar-title
      >
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer v-model="drawerRight" app clipped left>
      <v-list-item :title="$store.state.usr.usr"></v-list-item>
      <v-list-item :title="$store.state.usr.institucion.dpto" />
      <v-list-item :title="$store.state.usr.institucion.muni" />

      <v-divider></v-divider>

      <v-list density="compact" nav v-for="(obj, i) in menu" :key="obj.name_module">
        <v-list-subheader>{{ obj.name_module }}</v-list-subheader>
        <v-list-item
          v-for="(o, j) in obj.children"
          :title="o.name_module"
          :value="o.name_module"
          :to="`/input/frm/${o.path_browser}`"
          :key="o.path_browser"
        ></v-list-item>
      </v-list>

      <v-list density="compact" nav v-for="(menu, i) in $store.state.pages" :key="`ntmw${i}`">
        <v-list-subheader>{{ menu.name_module }}</v-list-subheader>

        <v-list-item
          v-for="(o, j) in menu.children"
          :title="o.name_module"
          :value="o.name_module"
          :to="`${menu.path_browser}/${o.path_browser}`"
          :key="o.path_browser"          
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn color="#1D62A1" @click="out()" block class="text-white">Salir</v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </section>
  
</template>

<script>
import { clearDataStore } from "@/config/localStore";
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
    menu: [{ title: "opcion 001", url: "/#", icon: "mdi-home" }],
  }),
  methods: {
    out() {
      clearDataStore();
      this.$router.push({ name: "Login" });
    },
    getMenuFrms() {
      this.menu = this.$store.state.frms;
    },
  },
  mounted() {
    this.getMenuFrms();
  },
  computed: {
    dataMenu() {
      return this.$store.state.frms;
    },
  },
};
</script>

<style></style>
