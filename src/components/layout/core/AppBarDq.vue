<template>
  <v-app-bar id="app-bar" absolute app color="#6A76AB" flat height="50" dark>
  
  
    <v-toolbar-title class="hidden-sm-and-down font-weight-light" >
      {{ cnfData.join(" - ") }}
      </v-toolbar-title>
  
   
  
    <div class="mx-3" />
    <v-menu bottom left offset-y origin="top right" transition="scale-transition" v-for="(menu, title) in menus" :key="`item-${title}`">
      <template v-slot:activator="{ attrs, on }">
        <v-btn class="ml-2" min-width="0" text v-bind="attrs" v-on="on" :to="menu.to">
          {{title}}
        </v-btn>
      </template>
      
    </v-menu>
    <v-spacer></v-spacer>
    <v-btn class="ml-2" min-width="0" text to="/">
      <v-icon>mdi-account</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
// Components
import { VHover, VListItem } from "vuetify/lib";
import { cnf } from "@/assets/cnf";

export default {
  name: "DashboardCoreAppBar",

  components: {
    AppBarItem: {
      render(h) {
        return h(VHover, {
          scopedSlots: {
            default: ({ hover }) => {
              return h(
                VListItem,
                {
                  attrs: this.$attrs,
                  class: {
                    "red--text": !hover,
                    "blue--text secondary elevation-8": hover,
                  },
                  props: {
                    activeClass: "",
                    dark: hover,
                    link: true,
                    ...this.$attrs,
                  },
                },
                this.$slots.default
              );
            },
          },
        });
      },
    },
  },



  data: () => ({
    cnfData: cnf.ar1,
    menus:{
      Listado :      { title: "Todos", to: '/' },      
    ["Registrar Denuncia"]:       { title: "Todos", to: '/add' },
      
    
    }
  }),



  methods: {

  },
};
</script>
