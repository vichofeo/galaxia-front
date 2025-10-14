<template>
  <div>
    <v-data-table :headers="headers" :items="instances" :loading="loading" hide-default-footer class="elevation-0">
      <template v-slot:item.process.name="{ item }">
        <div class="font-weight-medium">{{ item.gi_gp_process.name }}</div>
        <div class="caption text--secondary">v{{ item.gi_gp_process.version }}</div>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" small>
          {{ getStatusText(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.currentActivity="{ item }">
        <div v-if="getCurrentActivity(item)">
          <v-icon small :color="getActivityColor(getCurrentActivity(item))" class="mr-1">
            mdi-circle-medium
          </v-icon>
          {{ getCurrentActivity(item).name }}
        </div>
        <div v-else class="text--secondary caption">
          Sin actividad actual
        </div>
      </template>

      <template v-slot:item.updatedAt="{ item }">
        {{ formatDate(item.updatedAt) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon small @click="viewInstance(item)" v-on="on" color="primary">
              <v-icon small>mdi-eye</v-icon>
            </v-btn>
          </template>
          <span>Ver Detalle</span>
        </v-tooltip>

        <v-tooltip bottom v-if="item.status === 'active'">
          <template v-slot:activator="{ on }">
            <v-btn icon small @click="executeInstance(item)" v-on="on" color="success">
              <v-icon small>mdi-play</v-icon>
            </v-btn>
          </template>
          <span>Continuar Ejecución</span>
        </v-tooltip>
      </template>

      <template v-slot:no-data>
        <div class="text-center py-4">
          <v-icon size="48" class="mb-2" color="grey lighten-2">mdi-inbox-outline</v-icon>
          <div class="subtitle-1 grey--text">No hay instancias recientes</div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'InstanceTracker',
  props: {
    instances: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
  },
  data() {
    return {
      headers: [
        { text: 'Proceso', value: 'gi_gp_process.name', sortable: true },
        { text: 'Estado', value: 'status', sortable: true },
        { text: 'Actividad Actual', value: 'name', sortable: false },
        { text: 'Última Actualización', value: 'ended', sortable: true },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center', width: '120' }
      ]
    }
  },
  methods: {
    getCurrentActivity(instance) {
      // Encontrar la actividad actual basada en workitems pendientes
      if (instance.Workitems && instance.gi_gw_workitems.length > 0) {
        const pendingWorkitem = instance.gi_gw_workitems.find(w => w.status === 'pending')
        return pendingWorkitem ? pendingWorkitem.gp_ga_activities : null
      }
      return null
    },
    getStatusColor(status) {
      const colors = {
        active: 'primary',
        completed: 'success',
        aborted: 'error'
      }
      return colors[status] || 'grey'
    },
    getStatusText(status) {
      const texts = {
        active: 'Activo',
        completed: 'Completado',
        aborted: 'Abortado'
      }
      return texts[status] || status
    },
    getActivityColor(activity) {
      if (!activity) return 'grey'

      const colors = {
        start: 'green',
        end: 'red',
        switch: 'orange',
        standalone: 'purple'
      }
      return colors[activity.type] || 'blue'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    viewInstance(instance) {
      this.$emit('instance-click', instance)
    },
    executeInstance(instance) {
      // Encontrar workitem pendiente para este usuario
      // TODO: Reemplazar con usuario real
      const userId = 'admin'
      const userWorkitem = instance.gi_gw_workitems.find(w =>
        w.status === 'pending' && w.assignedTo === userId
      )

      if (userWorkitem) {
        this.$router.push({
          name: 'ActivityExecutor',
          params: {
            instanceId: instance.instanceId,
            workitemId: userWorkitem.itemId
          }
        })
      } else {
        this.$notify('No hay tareas pendientes para esta instancia', 'warning')

      }
    }
  }
}
</script>