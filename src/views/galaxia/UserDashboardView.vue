<template>
  <user-dashboard></user-dashboard>
</template>

<script>
import UserDashboard from '@/components/galaxia/UserDashboard.vue'

export default {
  name: 'UserDashboardView',
  components: {
    UserDashboard
  },
  meta: {
    title: 'Dashboard - Galaxia',
    requiresAuth: true
  }
}
</script>