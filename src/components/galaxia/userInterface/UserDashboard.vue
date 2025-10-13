<template>
  <v-container fluid class="pa-4">
    <!-- Header Principal -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card color="primary" dark>
          <v-card-title class="headline">
            <v-icon large left>mdi-account-circle</v-icon>
            Panel de Usuario - Galaxia Workflow
          </v-card-title>
          <v-card-subtitle>
            Bienvenido al sistema de gestión de procesos y tareas
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estadísticas Rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" color="blue lighten-5">
          <v-card-text>
            <v-icon large color="blue" class="mb-2">mdi-play-circle</v-icon>
            <div class="headline font-weight-bold">{{ stats.activeInstances }}</div>
            <div class="subtitle-1">Instancias Activas</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" color="orange lighten-5">
          <v-card-text>
            <v-icon large color="orange" class="mb-2">mdi-format-list-checks</v-icon>
            <div class="headline font-weight-bold">{{ stats.pendingWorkitems }}</div>
            <div class="subtitle-1">Tareas Pendientes</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" color="green lighten-5">
          <v-card-text>
            <v-icon large color="green" class="mb-2">mdi-check-circle</v-icon>
            <div class="headline font-weight-bold">{{ stats.completedInstances }}</div>
            <div class="subtitle-1">Procesos Completados</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" color="purple lighten-5">
          <v-card-text>
            <v-icon large color="purple" class="mb-2">mdi-clock-outline</v-icon>
            <div class="headline font-weight-bold">{{ stats.availableProcesses }}</div>
            <div class="subtitle-1">Procesos Disponibles</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sección Principal: Tareas y Procesos -->
    <v-row>
      <!-- Columna Tareas Pendientes -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="primary white--text">
            <v-icon left>mdi-format-list-checks</v-icon>
            Mis Tareas Pendientes
            <v-spacer></v-spacer>
            <v-badge :content="stats.pendingWorkitems" color="red" overlap>
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-card-title>
          <v-card-text class="pa-0">
            <workitem-list :workitems="pendingWorkitems" @workitem-execute="executeWorkitem"></workitem-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Columna Procesos Disponibles -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="success white--text">
            <v-icon left>mdi-play-circle-outline</v-icon>
            Procesos Disponibles
            <v-spacer></v-spacer>
            <v-btn icon dark @click="loadAvailableProcesses">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list dense>
              <v-list-item 
                v-for="process in availableProcesses" 
                :key="process.id"
                @click="startNewInstance(process)"
                class="mb-2"
              >
                <v-list-item-icon>
                  <v-icon color="primary">mdi-rocket-launch</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ process.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    v{{ process.version }} • {{ process.activityCount }} actividades
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon color="primary">
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              
              <v-list-item v-if="availableProcesses.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-center grey--text">
                    No hay procesos disponibles
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Instancias Recientes -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="info white--text">
            <v-icon left>mdi-history</v-icon>
            Mis Instancias Recientes
            <v-spacer></v-spacer>
            <v-btn text dark @click="$router.push('/galaxia/instances')">
              Ver Todas
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <instance-tracker :instances="recentInstances" @instance-click="viewInstanceDetail"></instance-tracker>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as srv from "@/services/galaxia/uiWorkItemService"
import * as isrv from "@/services/galaxia/instancesService"
import WorkitemList from './WorkitemList.vue'
import InstanceTracker from './InstanceTracker.vue'

export default {
  name: 'UserDashboard',
  components: {
    WorkitemList,
    InstanceTracker
  },
  data() {
    return {
      loading: false,
      stats: {
        activeInstances: 0,
        pendingWorkitems: 0,
        completedInstances: 0,
        availableProcesses: 0
      },
      pendingWorkitems: [],
      availableProcesses: [],
      recentInstances: []
    }
  },
  async mounted() {
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadUserWorkitems(),
          this.loadAvailableProcesses(),
          this.loadRecentInstances(),
          this.loadStats()
        ])
      } catch (error) {
        console.error('Error loading dashboard:', error)
        this.$notify('Error al cargar el dashboard', 'error')
        
      } finally {
        this.loading = false
      }
    },
    async loadUserWorkitems() {
      try {
        // TODO: Reemplazar con usuario real
        const userId = 'admin'
        const params= { userId, status: 'pending' }
        const response = await srv.getListWorkItems(params)
        /*await this.$axios.get('/api/workitems/user', {
          params: { userId, status: 'pending' }
        })*/
        this.pendingWorkitems = response.data
        this.stats.pendingWorkitems = this.pendingWorkitems.length
      } catch (error) {
        console.error('Error loading workitems:', error)
      }
    },
    async loadAvailableProcesses() {
      try {
        const params= { status: 'active' }
        const response = await isrv.getGProcesses(params)
        /*await this.$axios.get('/api/processes', {
          params: { status: 'active' }
        })*/
        this.availableProcesses = response.data
        this.stats.availableProcesses = this.availableProcesses.length
      } catch (error) {
        console.error('Error loading processes:', error)
      }
    },
    async loadRecentInstances() {
      try {
        // TODO: Reemplazar con usuario real
        const userId = 'admin'
        const params= { 
            userId,
            limit: 5,
            sort: 'updatedAt',
            order: 'DESC'
          }
        const response = await isrv.getListGInstances(params)
        /*await this.$axios.get('/api/instances', {
          params: { 
            userId,
            limit: 5,
            sort: 'updatedAt',
            order: 'DESC'
          }
        })*/
        this.recentInstances = response.data
        this.stats.activeInstances = this.recentInstances.filter(i => i.status === 'active').length
        this.stats.completedInstances = this.recentInstances.filter(i => i.status === 'completed').length
      } catch (error) {
        console.error('Error loading instances:', error)
      }
    },
    async loadStats() {
      // Las stats se cargan en los métodos anteriores
    },
    executeWorkitem(workitem) {
      this.$router.push({
        name: 'ActivityExecutor',
        params: { 
          instanceId: workitem.instanceId,
          workitemId: workitem.id 
        }
      })
    },
    startNewInstance(process) {
      this.$router.push({
        name: 'InstanceCreator',
        params: { processId: process.id }
      })
    },
    viewInstanceDetail(instance) {
      this.$router.push({
        name: 'InstanceDetail',
        params: { id: instance.id }
      })
    }
  }
}
</script>