<!-- views/galaxia/InstanceDetail.vue -->
<template>
    <v-container v-if="instance" class="instance-detail">
        <v-row>
            <v-col cols="12">
                <!-- HEADER DE INSTANCIA -->
                <v-card>
                    <v-toolbar color="indigo" dark>
                        <v-btn icon @click="$router.back()">
                            <v-icon>mdi-arrow-left</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            Instancia: {{ instance.name }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-chip :color="getStatusColor(instance.status)" dark>
                            {{ getStatusText(instance.status) }}
                        </v-chip>
                        <v-btn v-if="instance.status === 'active'" icon @click="abortInstance" :loading="aborting">
                            <v-icon>mdi-stop</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <strong>Proceso:</strong> {{ instance.gi_gp_process.name }}<br>
                                <strong>Versión:</strong> {{ instance.gi_gp_process.version }}<br>
                                <strong>ID Instancia:</strong> {{ instance.instanceId }}
                            </v-col>
                            <v-col cols="12" md="6">
                                <strong>Iniciada:</strong> {{ formatDate(instance.started) }}<br>
                                <strong>Propietario:</strong> {{ instance.owner }}<br>
                                <strong v-if="instance.ended">Finalizada:</strong> {{ instance.ended ?
                                    formatDate(instance.ended) : 'En progreso' }}
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- WORKITEMS ACTUALES -->
        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <v-card>
                    <v-toolbar color="blue-grey" dark flat>
                        <v-toolbar-title>
                            <v-icon left>mdi-format-list-checks</v-icon>
                            Tareas Actuales
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-list v-if="currentWorkitems.length > 0">
                            <v-list-item v-for="workitem in currentWorkitems" :key="workitem.itemId"
                                @click="executeWorkitem(workitem)">
                                <v-list-item-icon>
                                    <v-icon :color="getActivityTypeColor(workitem.gw_ga_activity.type)">
                                        {{ getActivityTypeIcon(workitem.gw_ga_activity.type) }}
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{ workitem.gw_ga_activity.name }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        Asignado a: {{ workitem.user }}
                                        <v-chip x-small :color="getPriorityColor(workitem.priority)" class="ml-2">
                                            {{ workitem.priority }}
                                        </v-chip>
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon @click.stop="executeWorkitem(workitem)">
                                        <v-icon color="primary">mdi-play</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                        <div v-else class="text-center grey--text py-4">
                            <v-icon large color="grey lighten-2">mdi-check-circle-outline</v-icon>
                            <div>No hay tareas pendientes</div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- TIMELINE DE ACTIVIDADES -->
            <v-col cols="12" md="6">
                <v-card>
                    <v-toolbar color="teal" dark flat>
                        <v-toolbar-title>
                            <v-icon left>mdi-timeline</v-icon>
                            Historial de Actividades
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-timeline dense v-if="activityHistory.length > 0">
                            <v-timeline-item v-for="(activity, index) in activityHistory" :key="index"
                                :color="getActivityStatusColor(activity.status)" small>
                                <div class="py-2">
                                    <strong>{{ activity.activityName }}</strong>
                                    <div class="caption">
                                        {{ formatDate(activity.started) }}
                                        <span v-if="activity.ended"> - {{ formatDate(activity.ended) }}</span>
                                    </div>
                                    <div class="caption" v-if="activity.user">
                                        Ejecutado por: {{ activity.user }}
                                    </div>
                                </div>
                            </v-timeline-item>
                        </v-timeline>
                        <div v-else class="text-center grey--text py-4">
                            <v-icon large color="grey lighten-2">mdi-timeline-clock</v-icon>
                            <div>No hay historial de actividades</div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- ACTIVITY EXECUTOR MODAL -->
        <v-dialog v-model="showActivityExecutor" max-width="800" persistent>
            <ActivityExecutor v-if="selectedWorkitem" :workitem="selectedWorkitem" @completed="handleActivityCompleted"
                @close="closeActivityExecutor" />
        </v-dialog>
    </v-container>
</template>

<script>
import ActivityExecutor from '@/components/galaxia/ActivityExecutor.vue'

export default {
    name: 'InstanceDetail',
    components: {
        ActivityExecutor
    },
    data() {
        return {
            instance: null,
            currentWorkitems: [],
            activityHistory: [],
            selectedWorkitem: null,
            showActivityExecutor: false,
            loading: false,
            aborting: false
        }
    },
    computed: {
        instanceId() {
            return this.$route.params.id
        }
    },
    methods: {
        async loadInstanceData() {
            this.loading = true
            try {
                // Cargar datos de la instancia
                const instanceResult = await this.$store.dispatch('galaxia/loadInstances')
                if (instanceResult.ok) {
                    this.instance = instanceResult.data.find(inst => inst.instanceId == this.instanceId)
                }

                // Cargar workitems de esta instancia
                const workitemsResult = await this.$store.dispatch('galaxia/loadUserWorkitems')
                if (workitemsResult.ok) {
                    this.currentWorkitems = workitemsResult.data.filter(w =>
                        w.gw_gi_instance.instanceId == this.instanceId && w.status === 'pending'
                    )
                }

                // Cargar historial de actividades (workitems completados)
                if (workitemsResult.ok) {
                    this.activityHistory = workitemsResult.data
                        .filter(w => w.gw_gi_instance.instanceId == this.instanceId && w.status === 'completed')
                        .map(w => ({
                            activityName: w.gw_ga_activity.name,
                            started: w.started,
                            ended: w.ended,
                            user: w.user,
                            status: w.status
                        }))
                        .reverse()
                }

            } catch (error) {
                console.error('Error loading instance data:', error)
                this.$notify('Error cargando datos de la instancia', 'error')
            } finally {
                this.loading = false
            }
        },

        executeWorkitem(workitem) {
            this.selectedWorkitem = workitem
            this.showActivityExecutor = true
        },

        handleActivityCompleted(result) {
            this.$notify('Actividad completada exitosamente', 'success')
            this.closeActivityExecutor()
            this.loadInstanceData() // Recargar datos
        },

        closeActivityExecutor() {
            this.showActivityExecutor = false
            this.selectedWorkitem = null
        },

        async abortInstance() {
            if (!confirm('¿Estás seguro de que quieres abortar esta instancia?')) return

            this.aborting = true
            try {
                const result = await this.$store.dispatch('galaxia/abortInstance', this.instanceId)
                if (result.ok) {
                    this.$notify('Instancia abortada exitosamente', 'success')
                    this.loadInstanceData()
                }
            } catch (error) {
                console.error('Error aborting instance:', error)
                this.$notify('Error abortando instancia', 'error')
            } finally {
                this.aborting = false
            }
        },

        getStatusColor(status) {
            const colors = {
                active: 'green',
                completed: 'blue',
                aborted: 'red'
            }
            return colors[status] || 'grey'
        },

        getStatusText(status) {
            const texts = {
                active: 'Activa',
                completed: 'Completada',
                aborted: 'Abortada'
            }
            return texts[status] || status
        },

        getActivityTypeColor(type) {
            const colors = {
                start: 'green',
                end: 'red',
                activity: 'blue',
                switch: 'orange',
                standalone: 'purple'
            }
            return colors[type] || 'grey'
        },

        getActivityTypeIcon(type) {
            const icons = {
                start: 'mdi-play',
                end: 'mdi-stop',
                activity: 'mdi-cog',
                switch: 'mdi-swap-horizontal',
                standalone: 'mdi-circle-outline'
            }
            return icons[type] || 'mdi-help'
        },

        getActivityStatusColor(status) {
            return status === 'completed' ? 'green' : 'blue'
        },

        getPriorityColor(priority) {
            const colors = {
                high: 'red',
                medium: 'orange',
                low: 'blue'
            }
            return colors[priority] || 'grey'
        },

        formatDate(timestamp) {
            if (!timestamp) return 'N/A'
            return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    },

    created() {
        this.loadInstanceData()
    }
}
</script>

<style scoped>
.instance-detail {
    max-width: 1200px;
}
</style>