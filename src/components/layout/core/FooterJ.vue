<template>
  <v-card >
    <v-footer padless>
      <v-card flat tile width="100%" class="lighten-1 text-center" color="#1D62A1">

        <!--v-card-text>

          <v-btn v-for="icon in icons" :key="icon" class="mt-0 mx-4" icon>
            <v-icon size="24px" color="#E3F2FD">{{ icon }}</v-icon>
          </v-btn>
        </v-card-text-->
        

        <v-card-text class="white--text">
          <span>Observatorio DTFyCSS</span> — {{ new Date().getFullYear() }}
        </v-card-text>
      </v-card>
    </v-footer>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    icons: [
      'mdi-facebook',
      'mdi-twitter',
      'mdi-linkedin',
      'mdi-instagram',
    ],
  }),
}
</script>                                                                                                                                