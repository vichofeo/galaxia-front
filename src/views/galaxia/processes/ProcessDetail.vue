<!-- views/galaxia/processes/ProcessDetail.vue -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-btn icon @click="$router.push('/galaxia')">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>
              <v-icon left>mdi-workflow</v-icon>
              Proceso: {{ processName }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip color="info" dark class="mr-2">
              ID: {{ $route.params.id }}
            </v-chip>
            <v-chip :color="currentProcess.isValid === 'y' ? 'green' : 'orange'" dark>
              {{ currentProcess.isValid === 'y' ? 'Válido' : 'Inválido' }}
            </v-chip>
          </v-toolbar>

          <!-- PESTAÑAS PRINCIPALES -->
          <v-tabs v-model="tab" grow>
            <v-tab>
              <v-icon left>mdi-information</v-icon>
              Información
            </v-tab>
            <v-tab>
              <v-icon left>mdi-playlist-play</v-icon>
              Actividades
            </v-tab>
            <v-tab>
              <v-icon left>mdi-account-group</v-icon>
              Roles
            </v-tab>
            <v-tab>
              <v-icon left>mdi-vector-line</v-icon>
              Flujo
            </v-tab>
            <v-tab>
              <v-icon left>mdi-graph</v-icon>
              Diagrama
            </v-tab>
            <v-tab>
              <v-icon left>mdi-play-circle-outline</v-icon>
              Instancias
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab">
            <!-- PESTAÑA 1: INFORMACIÓN (NUEVO COMPONENTE) -->
            <v-tab-item>
              <ProcessInfo :processId="$route.params.id" @navigate-to-activities="tab = 1" />
            </v-tab-item>

            <!-- PESTAÑA 2: ACTIVIDADES -->
            <v-tab-item>
              <ActivityManager :processId="$route.params.id" />
            </v-tab-item>

            <!-- PESTAÑA 3: ROLES -->
            <v-tab-item>
              <RoleManager :processId="$route.params.id" />
            </v-tab-item>

            <!-- PESTAÑA 4: TRANSICIONES/Flujos -->
            <v-tab-item>
              <TransitionManager :processId="$route.params.id" />
            </v-tab-item>

            <!-- PESTAÑA 5: DIAGRAMA -->
            <v-tab-item>
              <WorkflowGraph :processId="$route.params.id" />
            </v-tab-item>
            <!--  manejador de instancias-->
            <v-tab-item>
              <InstanceManager :processId="$route.params.id" />
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ActivityManager from '@/components/galaxia/ActivityManager.vue'
import RoleManager from '@/components/galaxia/RoleManager.vue'
import TransitionManager from '@/components/galaxia/TransitionManager.vue'
import WorkflowGraph from '@/components/galaxia/WorkflowGraph.vue'
import ProcessInfo from '@/components/galaxia/ProcessInfo.vue'
import InstanceManager from '@/components/galaxia/InstanceManager.vue'


export default {
  name: 'ProcessDetail',
  components: {
    ActivityManager,
    RoleManager,
    TransitionManager,
    WorkflowGraph,
    ProcessInfo,
    InstanceManager
  },
  data() {
    return {
      tab: 0,
      processName: 'Cargando...'
    }
  },
  computed: {
    currentProcess() {
      const processId = this.$route.params.id
      return this.$store.getters['galaxia/getProcessById'](processId)
    }
  },
  watch: {
    currentProcess: {
      immediate: true,
      handler(process) {
        if (process) {
          this.processName = process.name
        } else {
          this.processName = 'Proceso no encontrado'
        }
      }
    }
  },
  created() {
    if (!this.currentProcess) {
      this.$store.dispatch('galaxia/loadProcesses')
    }
  }
}
</script>