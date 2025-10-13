<template>
  <div>
    <v-list dense v-if="workitems.length > 0">
      <v-list-item 
        v-for="workitem in workitems" 
        :key="workitem.id"
        @click="$emit('workitem-execute', workitem)"
        class="mb-1"
      >
        <v-list-item-icon>
          <v-icon :color="getWorkitemColor(workitem)">mdi-circle-medium</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="font-weight-medium">
            {{ workitem.activity.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ workitem.instance.process.name }} • 
            {{ formatDate(workitem.started) }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon small color="primary">
            <v-icon small>mdi-play</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else class="text-center py-8">
      <v-icon size="64" color="grey lighten-2" class="mb-4">mdi-check-circle-outline</v-icon>
      <div class="subtitle-1 grey--text">No hay tareas pendientes</div>
      <div class="caption grey--text">¡Todo al día!</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkitemList',
  props: {
    workitems: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getWorkitemColor(workitem) {
      const colors = {
        pending: 'orange',
        'in-progress': 'blue',
        completed: 'green'
      }
      return colors[workitem.status] || 'grey'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>