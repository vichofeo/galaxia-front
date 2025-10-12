<template>
  <div>
    <v-navigation-drawer v-model="drawerRight" app clipped width="100" color="#fff">
      <v-list-item>
        <div id="logoasuss">
          <img src="/img/logo.svg" alt="Epidemiologia SSCP" class="mt-5" />
        </div>
      </v-list-item>
      <v-divider></v-divider>

      <v-list dense nav>
        <v-menu rounded="lg" bottom right offset-x origin="top left" transition="scale-transition"
          v-for="(menu, key, index) in items?.rutas" :key="`item-${index}`">
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip right>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn class="mt-1" width="90" height="50" text v-bind="attrs" v-on="{ ...tooltip, ...on }"
                  @click="() => { localizacion = items.modules[key].name; 
                  if (!Array.isArray(menu)) $router.push(menu.value).catch(() => { }); }">
                  <v-img max-width="40" :src="myImagen2(items.icons[key])"></v-img>

                </v-btn>
              </template>
              <span>{{ items.modules[key].name }}</span>
            </v-tooltip>
          </template>
          <v-list dense class="text-sm-left ma-2" light nav v-if="Array.isArray(menu)" color="#E8EAF6">
            <v-subheader class="font-weight-black" style="color: black">{{ items.modules[key].name }}</v-subheader>
            <v-list-item-group color="red">
              <v-row dense>
                <v-col cols="12" xs="12" :sm="colsWidth('sm', menu)" :md="colsWidth('md', menu)"
                  :lg="colsWidth('lg', menu)" :xl="colsWidth('xl', menu)" 
                  v-for="(item, index) in menu"
                  :key="`Subitem-${index}`">
                  <v-list-item :key="item.text" :to="{ path: item.value, query: { t: new Date().getTime() } }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.text }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-list-item-group>
          </v-list>
        </v-menu>

      </v-list>
     
    </v-navigation-drawer>

    <v-app-bar app clipped-left color="#1D62A1" dark>
      <v-btn width="90" height="60" @click.stop="drawerRight = !drawerRight" color="#1D62A1" class="mr-2">
        <v-icon x-large>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title class="text ml-4" v-if='localizacion != ""'> {{ localizacion.toUpperCase() }}</v-toolbar-title>
      <v-toolbar-title class="text ml-4" v-else> DTFyCSS - {{ $route.name.toUpperCase() }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- menu del usuario lado derecho -->
      <img src="/img/ASUSS_logo_horiz.png" width="10%" />
      <div class="d-flex pa-2">
        
          

        
        <btn-menu-home/>
        <btn-menu-usr/>
      </div>

    </v-app-bar>
    <Loading :swLoading="swLoader" mensaje="Cargando Informacion, espere por favor..." />
  </div>
</template>

<script>

import * as srv from "@/services/admin/adminService";
import * as util from "@/components/utils/utils";

import MensajeriaUtils from "@/components/utils/MensajeriaUtils";
import Loading from "@/components/utils/Loading.vue";
import BtnMenuUsr from './BtnMenuUsr.vue';
import BtnMenuHome from './BtnMenuHome.vue';


export default {
  name: "DashboardCoreAppBarOfx",
  components: { Loading, BtnMenuUsr, BtnMenuHome },
  data() {
    return {
      localizacion: "",

      drawerRight: null,
      sigla: "ASUSS",

      swLoader: false,
      m: new MensajeriaUtils(this.$toast),
      items: null,

      group: null,
    }
  },

  methods: {
    colsWidth(modo, arrayMuestra = []) {
      const tam = arrayMuestra.length

      if (modo == 'sm' && tam >= 2)
        return 6
      if (modo == 'md' && tam >= 3)
        return 3
      if ((modo == 'lg' || modo == 'xl') && tam >= 4)
        return 4

      if (tam == 2)
        return 6
      if (tam == 1)
        return 12
      if (tam <= 0)
        return 12

    },
    

    async getOpciones() {
      this.swLoader = true;

      try {
        const results = await srv.getDataMenu();
        if (results.ok) {
          this.items = results.rutas;
        } else {
          this.m.setMensaje(
            "No se encontro la informacion solicitada. Error de conformacion de datos"
          );
          this.m.advertencia();
        }
      } catch (error) {
        console.log(error);
        this.m.setMensaje("Ocurrio un error en la obtencion de datos");
        this.m.error();
      }
      this.swLoader = false;
    },

    myImagen2(img) {
      if (img?.data) return util._arrayBufferToBase64(img.data);
      else return null;
    },


  },

  mounted() {
    this.getOpciones();
  },

  watch: {
      group () {
        this.drawerRight = false
      },
    },


};
</script>
<style scoped lang="css">
button {
  background: #fff;
  border: none;
  position: relative;
  height: 60px;
  font-size: 1.6em;
  padding: 0 2em;
  cursor: pointer;
  transition: 800ms ease all;
  outline: none;
}

button:hover {
  background: #1D62A1;
  color: rgb(255, 255, 255);
  /* color text */
}

button:before,
button:after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 3px;
  width: 0;
  background: #ffffff;
  /* barra */
  transition: 400ms ease all;
}

button:after {
  right: inherit;
  top: inherit;
  left: 0;
  bottom: 0;
}

button:hover:before,
button:hover:after {
  width: 100%;
  transition: 800ms ease all;
}

#logoasuss {
  width: 100%;
  text-align: center;
}
</style>