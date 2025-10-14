<template>
  <UserDashboard/>
</template>

<script>
import UserDashboard from '@/components/galaxia/userInterface/UserDashboard.vue'

export default {
  name: 'UserDashboardView',
  components: {    UserDashboard  },
  meta: {
    title: 'Dashboard - Galaxia',
    requiresAuth: true
  },
  data(){
    return{}
  }
}
</script>