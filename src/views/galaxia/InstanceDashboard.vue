<template>
  <v-container fluid>
    <instance-manager></instance-manager>
  </v-container>
</template>

<script>
import InstanceManager from '@/components/galaxia/instances/InstanceManager.vue'

export default {
  name: 'InstanceDashboard',
  components: {
    InstanceManager
  },
  meta: {
    title: 'Instancias - Galaxia',
    requiresAuth: true
  }
}
</script>