<template>
  <v-menu rounded="LG" bottom left offset-y origin="top right" transition="scale-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip left>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn width="90" height="60" v-bind="attrs" v-on="{ ...tooltip, ...on }" color="#1D62A1">
                  <v-icon x-large>mdi-account</v-icon>
                </v-btn>
              </template>
              <span>INFORMACION</span>
            </v-tooltip>
          </template>

          <v-list color="#E8EAF6" class="ma-2 pa-3 text-center">
            <v-toolbar-title class="text mt-3 mr-3" v-text="$route.name"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn to="/ssepi/lgnUser" class="mt-2 ml-4" color="#1D62A1" dark
              @click="() => { localizacion = 'INFORMACION DEL USUARIO' }">Cambiar Contraseña</v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="salir" class="mt-2" color="#1D62A1" dark>Salir</v-btn>
          </v-list>
        </v-menu>
</template>

<script>
export default {
    name: "BotonMenuUsuario",
data() {
    return {
        
    }
},
methods: {
      salir() {
        localStorage.clear();
        this.$router.push({ name: "Login" });
      }
    }
}
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