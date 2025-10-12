<template>
  <v-app>
    <router-view></router-view>
    <!-- Snackbar global -->
    <GlobalSnackbar />
  </v-app>
  
</template>

<script>
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'
export default {
components: {
    GlobalSnackbar
  }
}
</script>