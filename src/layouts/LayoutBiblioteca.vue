<template>
    <v-app>
        <v-system-bar color="#1D62A1" dark> &nbsp;
               
            <router-link to="/"  class="mr-0 white--text text--darken-4" :style="{ 'text-decoration':  'none'  }">
                Biblioteca Virtual - ASUSS
                <v-icon>mdi-book-open-page-variant
                </v-icon>
            </router-link> 
            &nbsp;|&nbsp;
            <router-link :to="{name:'dashboardHome'}"  class="mr-0 white--text text--darken-4" :style="{ 'text-decoration':  'none'  }">
                Observatorio - ASUSS
                <v-icon>mdi-chart-bar-stacked
                </v-icon>
            </router-link>
            <v-spacer></v-spacer>
            <router-link :to="{name:'Login'}"  >
                <v-icon>mdi-login        
                </v-icon>
            </router-link>
      
        </v-system-bar>
        
        <router-view />
    </v-app>
</template>

<script>


export default {
    name: "LayoutBiblioteca",
    data() {
        return {

        }
    },

}
</script>
<style scoped>
* {
    margin: 0;
    padding: 0;
}

*,
::before,
::after {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-weight: 400;
    line-height: 1.8;
    color: #52505e;
}
</style>