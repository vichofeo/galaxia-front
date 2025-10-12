<!-- views/galaxia/UserDashboard.vue -->
<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <v-toolbar-title>
                            <v-icon left>mdi-account-check</v-icon>
                            Mi Panel de Trabajo
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="loadDashboardData">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <v-card-text>
                        <!-- ESTADÍSTICAS RÁPIDAS -->
                        <v-row class="mb-6">
                            <v-col cols="12" md="3">
                                <v-card color="blue" dark>
                                    <v-card-text class="text-center">
                                        <div class="text-h4">{{ stats.pendingWorkitems }}</div>
                                        <div>Tareas Pendientes</div>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-card color="green" dark>
                                    <v-card-text class="text-center">
                                        <div class="text-h4">{{ stats.activeInstances }}</div>
                                        <div>Instancias Activas</div>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-card color="orange" dark>
                                    <v-card-text class="text-center">
                                        <div class="text-h4">{{ stats.completedToday }}</div>
                                        <div>Completadas Hoy</div>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-card color="purple" dark>
                                    <v-card-text class="text-center">
                                        <div class="text-h4">{{ stats.assignedProcesses }}</div>
                                        <div>Procesos Asignados</div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>

                        <!-- CONTENIDO PRINCIPAL -->
                        <v-row>
                            <!-- COLUMNA IZQUIERDA - TAREAS PENDIENTES -->
                            <v-col cols="12" md="8">>>>>{{ workitems.length }}
                                <WorkitemList :workitems="workitems" :loading="loading"
                                    @execute-workitem="executeWorkitem" @refresh="loadDashboardData" />
                            </v-col>

                            <!-- COLUMNA DERECHA - INFORMACIÓN -->
                            <v-col cols="12" md="4">
                                <!-- INSTANCIAS ACTIVAS -->
                                <v-card class="mb-4">
                                    <v-card-title class="subtitle-1">
                                        <v-icon left>mdi-play-circle</v-icon>
                                        Mis Instancias Activas
                                    </v-card-title>
                                    <v-card-text>
                                        <v-list dense v-if="activeInstances.length > 0">
                                            <v-list-item v-for="instance in activeInstances" :key="instance.instanceId">
                                                <v-list-item-content>
                                                    <v-list-item-title>{{ instance.name }}</v-list-item-title>
                                                    <v-list-item-subtitle>
                                                        {{ instance.gi_gp_process.name }} -
                                                        <v-chip x-small :color="getStatusColor(instance.status)" dark>
                                                            {{ instance.status }}
                                                        </v-chip>
                                                    </v-list-item-subtitle>
                                                </v-list-item-content>
                                                <v-list-item-action>
                                                    <v-btn icon small @click="viewInstance(instance)">
                                                        <v-icon small>mdi-eye</v-icon>
                                                    </v-btn>
                                                </v-list-item-action>
                                            </v-list-item>
                                        </v-list>
                                        <div v-else class="text-center grey--text py-4">
                                            <v-icon large color="grey lighten-2">mdi-play-circle-outline</v-icon>
                                            <div>No hay instancias activas</div>
                                        </div>
                                    </v-card-text>
                                </v-card>

                                <!-- ACCESO RÁPIDO -->
                                <v-card>
                                    <v-card-title class="subtitle-1">
                                        <v-icon left>mdi-rocket-launch</v-icon>
                                        Acciones Rápidas
                                    </v-card-title>
                                    <v-card-text>
                                        <v-btn block color="primary" class="mb-2"
                                            @click="$router.push('/galaxia/instances')">
                                            <v-icon left>mdi-view-dashboard</v-icon>
                                            Ver Todas las Instancias
                                        </v-btn>

                                        <v-btn block color="success" class="mb-2" @click="$router.push('/galaxia')">
                                            <v-icon left>mdi-workflow</v-icon>
                                            Explorar Procesos
                                        </v-btn>

                                        <v-alert type="info" dense class="mt-4">
                                            <small>
                                                Tienes <strong>{{ workitems.length }}</strong> tareas pendientes de
                                                <strong>{{ uniqueProcesses }}</strong> procesos diferentes.
                                            </small>
                                        </v-alert>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import WorkitemList from '@/components/galaxia/WorkitemList.vue'

export default {
    name: 'UserDashboard',
    components: {
        WorkitemList
    },
    data() {
        return {
            loading: false,
            workitems: [],
            activeInstances: [],
            stats: {
                pendingWorkitems: 0,
                activeInstances: 0,
                completedToday: 0,
                assignedProcesses: 0
            }
        }
    },
    computed: {
        uniqueProcesses() {
            const processIds = new Set(this.workitems.map(w => w.instance?.pId))
            return processIds.size
        }
    },
    methods: {
        async loadDashboardData() {
            this.loading = true
            try {
                // Cargar workitems del usuario actual
                const workitemsResult = await this.$store.dispatch('galaxia/loadUserWorkitems')

                if (workitemsResult.ok) {
                    this.workitems = workitemsResult.data

                    this.stats.pendingWorkitems = this.workitems.length
                }

                // Cargar instancias activas del usuario
                const instancesResult = await this.$store.dispatch('galaxia/loadUserInstances')
                if (instancesResult.ok) {
                    this.activeInstances = instancesResult.data
                    this.stats.activeInstances = this.activeInstances.length
                }

                // Cargar estadísticas
                const statsResult = await this.$store.dispatch('galaxia/loadUserStats')
                if (statsResult.ok) {
                    this.stats = { ...this.stats, ...statsResult.data }
                }

            } catch (error) {
                console.error('Error loading dashboard data:', error)
                this.$notify('Error cargando datos del dashboard', 'error')
            } finally {
                this.loading = false
            }
        },

        executeWorkitem(workitem) {
            this.$router.push(`/galaxia/workitem/${workitem.itemId}/execute`)
        },

        viewInstance(instance) {
            this.$router.push(`/galaxia/instance/${instance.instanceId}`)
        },

        getStatusColor(status) {
            const colors = {
                active: 'green',
                completed: 'blue',
                aborted: 'red'
            }
            return colors[status] || 'grey'
        }
    },
    created() {
        this.loadDashboardData()
    }
}
</script>