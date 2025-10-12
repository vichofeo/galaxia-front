<template>
  <v-app-bar id="app-bar" absolute app color="#6A76AB" flat height="50" dark>
    <v-toolbar-title
      class="hidden-sm-and-down font-weight-light"
      v-text="$route.name"
    />

    <div class="mx-3" />
    {{ sigla }}
    <!-- 
      <v-menu bottom left offset-y origin="top right" transition="scale-transition" v-for="(menu, title) in menuOps" :key="`item-${title}`">
      <template v-slot:activator="{ attrs, on }">
        <v-btn class="ml-2" min-width="0" text v-bind="attrs" v-on="on"
        @click="()=>{if(!Array.isArray(menu)) $router.push(menu.value).catch(()=>{}); }"
        >
          {{title}} 
        </v-btn>
      </template>
      <v-list  nav v-if="Array.isArray(menu)" tile>
        <v-row dense>
          <v-col cols="12" xs="12" sm="6" md="3" lg="4" xl="4" v-for="(opts, i) in menu" 
          :key="`Subitem-${i}`">
            <app-bar-item :to="opts.value" >
              {{ opts.text }}
            </app-bar-item>    
                    
          </v-col>
        </v-row>
      </v-list>
    </v-menu> -->
   
    <v-menu  rounded="LG" bottom left offset-y origin="top right" transition="scale-transition" 
    v-for="(menu, title) in menuOps" :key="`item-${title}`">
        <template v-slot:activator="{ on, attrs }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }" dark>
              <v-btn
              class="ml-2" min-width="0" text
                v-bind="attrs"
                v-on="{ ...tooltip, ...on }"                
                @click="()=>{if(!Array.isArray(menu)) $router.push(menu.value).catch(()=>{}); }"
              >
                {{ title }}
              </v-btn>
            </template>
            <span>{{ title }}</span>
          </v-tooltip>
        </template>

        <v-list dense class="text-sm-left" light nav v-if="Array.isArray(menu)">
          <v-subheader class="font-weight-black" style="color: #1d62a1"
            >{{ title }}</v-subheader
          >

          <v-list-item-group color="#1D62A1">
            <v-row dense>
          <v-col cols="12" xs="12" sm="6" md="3" lg="4" xl="4" v-for="(item, index) in menu"
          :key="`Subitem-${index}`">
          <v-list-item  :key="item.text" :to="{path:item.value, query:{t:new Date().getTime()} }">            
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item> 
                    
          </v-col>
        </v-row>
                       
          </v-list-item-group>
        </v-list>
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

import * as srv from "@/services/ssepi/mOpsService";
//import { isNavigationFailure, NavigationFailureType } from 'vue-router/src/util/errors';
//{ isNavigationFailure, NavigationFailureType }
import VueRouter from "vue-router";
const { isNavigationFailure, NavigationFailureType } = VueRouter;

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
    selectedItem: [],
    sigla: "ASUSS",
    menuOps: [],
    menus: {
      georeferencia: [
        { title: "Todos", to: "/ssepi/sssscp/all" },
        { title: "op1", to: "/ssepi/sssscp/la paz" },
        { title: "op2", to: "/ssepi/sssscp/santa cruz" },
        { title: "op3", to: "/ssepi/sssscp/oruro" },
        { title: "op4", to: "/ssepi/sssscp/potosi" },
        { title: "op4", to: "/ssepi/sssscp/cochabamba" },
        { title: "op6", to: "/ssepi/sssscp/beni" },
        { title: "op7", to: "/ssepi/sssscp/pando" },
        { title: "op8", to: "/ssepi/sssscp/chuquisaca" },
        { title: "op9", to: "/ssepi/sssscp/tarija" },
      ],
      Reportes: [
        { title: "Todos", to: "/" },
        { title: "op1", to: "/" },
        { title: "op2", to: "/" },
        { title: "op3", to: "/" },
        { title: "op4", to: "/" },
        { title: "op4", to: "/" },
        { title: "op6", to: "/" },
        { title: "op7", to: "/" },
        { title: "op8", to: "/" },
        { title: "op9", to: "/" },
      ],
      ["sala situacional"]: [
        { title: "Todos", to: "/" },
        { title: "op1", to: "/" },
        { title: "op2", to: "/" },
        { title: "op3", to: "/" },
        { title: "op4", to: "/" },
        { title: "op4", to: "/" },
        { title: "op6", to: "/" },
        { title: "op7", to: "/" },
        { title: "op8", to: "/" },
        { title: "op9", to: "/" },
      ],
      infraestructura: [
        { title: "Todos", to: "/" },
        { title: "op1", to: "/" },
        { title: "op2", to: "/" },
        { title: "op3", to: "/" },
        { title: "op4", to: "/" },
        { title: "op4", to: "/" },
        { title: "op6", to: "/" },
        { title: "op7", to: "/" },
        { title: "op8", to: "/" },
        { title: "op9", to: "/" },
      ],
      ["vigilancia epidemiologica"]: [
        { title: "Todos", to: "/" },
        { title: "op1", to: "/" },
        { title: "op2", to: "/" },
        { title: "op3", to: "/" },
        { title: "op4", to: "/" },
        { title: "op4", to: "/" },
        { title: "op6", to: "/" },
        { title: "op7", to: "/" },
        { title: "op8", to: "/" },
        { title: "op9", to: "/" },
      ],
    },
    transitionName: 'slide-left'
  }),

  methods: {
    async href(obj) {
      await this.$router.push(obj.value).catch(failure => {
  
  if (isNavigationFailure(failure)) {
    // ...
  }
  // Only duplicated navigations
  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    // ...
    console.log("mallllllllllll", failure)
  }
  // Aborted or canceled navigations
  if (isNavigationFailure(failure, NavigationFailureType.aborted | NavigationFailureType.canceled)) {
    // ...
  }
})

      //return undefined;
    },
    async getMops() {
      const result = await srv.getMenuGeoRef();
      this.menuOps = result.data;
      this.sigla = result.moredata.institucion;
    },
  },

  mounted() {
    this.getMops();
  },
  
  beforeRouteUpdate (to, from, next) {
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    //this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    console.log("##########Before", toDepth)
    next()
  },
  watch: {
  
  '$route' (to, from) {
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  
  }
}

};
</script>
