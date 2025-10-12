<!-- components/galaxia/InstanceManager.vue -->
<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <v-toolbar-title>
                            <v-icon left>mdi-play-circle-outline</v-icon>
                            Gestor de Instancias
                        </v-toolbar-title>
                        <v-spacer></v-spacer>

                        <!-- FILTROS -->
                        <v-select v-model="filters.status" :items="statusOptions" label="Filtrar por estado" dense
                            outlined hide-details class="mr-2" style="max-width: 200px;"></v-select>

                        <v-btn icon @click="loadInstances">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <v-card-text>
                        <!-- BOTÓN INICIAR INSTANCIA -->
                        <v-row class="mb-4">
                            <v-col cols="12" class="d-flex justify-space-between align-center">
                                <v-btn color="success" @click="showInstanceStarter = true">
                                    <v-icon left>mdi-plus</v-icon>
                                    Iniciar Nueva Instancia
                                </v-btn>

                                <v-chip :color="instancesCount > 0 ? 'info' : 'grey'" dark>
                                    {{ filteredInstances.length }} / {{ instancesCount }} Instancias
                                </v-chip>
                            </v-col>
                        </v-row>

                        <!-- LISTA DE INSTANCIAS -->
                        <v-data-table :headers="headers" :items="filteredInstances" :loading="loading"
                            :items-per-page="10" class="elevation-1" loading-text="Cargando instancias..."
                            no-data-text="No hay instancias para mostrar">
                            <!-- COLUMNA: ESTADO -->
                            <template v-slot:item.status="{ item }">
                                <v-chip small :color="getStatusColor(item.status)" dark>
                                    <v-icon small left>{{ getStatusIcon(item.status) }}</v-icon>
                                    {{ getStatusText(item.status) }}
                                </v-chip>
                            </template>

                            <!-- COLUMNA: PROGRESO -->
                            <template v-slot:item.progress="{ item }">
                                <v-progress-linear :value="calculateProgress(item)" height="20"
                                    :color="getProgressColor(item)" class="my-2">
                                    <strong>{{ calculateProgress(item) }}%</strong>
                                </v-progress-linear>
                            </template>

                            <!-- COLUMNA: ACTIVIDAD ACTUAL -->
                            <template v-slot:item.currentActivity="{ item }">
                                <div v-if="item.currentActivity">
                                    <strong>{{ item.currentActivity.name }}</strong>
                                    <div class="caption">{{ getActivityTypeText(item.currentActivity.type) }}</div>
                                </div>
                                <span v-else class="grey--text">N/A</span>
                            </template>

                            <!-- COLUMNA: FECHAS -->
                            <template v-slot:item.started="{ item }">
                                {{ formatDate(item.started) }}
                            </template>

                            <template v-slot:item.ended="{ item }">
                                {{ item.ended ? formatDate(item.ended) : 'En progreso' }}
                            </template>

                            <!-- COLUMNA: ACCIONES -->
                            <template v-slot:item.actions="{ item }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn small icon @click="viewInstanceDetail(item)" color="primary" v-on="on">
                                            <v-icon small>mdi-eye</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Ver detalle</span>
                                </v-tooltip>

                                <v-tooltip bottom v-if="item.status === 'active'">
                                    <template v-slot:activator="{ on }">
                                        <v-btn small icon @click="executeInstance(item)" color="success" v-on="on">
                                            <v-icon small>mdi-play</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Ejecutar actividad actual</span>
                                </v-tooltip>

                                <v-tooltip bottom v-if="item.status === 'active'">
                                    <template v-slot:activator="{ on }">
                                        <v-btn small icon @click="abortInstance(item)" color="error" v-on="on">
                                            <v-icon small>mdi-stop</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Abortar instancia</span>
                                </v-tooltip>
                            </template>

                            <!-- LOADING -->
                            <template v-slot:loading>
                                <v-row justify="center" align="center" class="py-4">
                                    <v-col cols="auto">
                                        <v-progress-circular indeterminate color="primary" />
                                    </v-col>
                                    <v-col cols="auto">
                                        <span class="ml-2">Cargando instancias...</span>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- DIALOG INICIAR INSTANCIA -->
        <v-dialog v-model="showInstanceStarter" max-width="600px" persistent>
            <v-card>
                <v-card-title class="headline primary white--text">
                    <v-icon left dark>mdi-play</v-icon>
                    Iniciar Nueva Instancia
                </v-card-title>

                <v-card-text class="pa-4">
                    <v-form ref="instanceStarterForm">
                        <v-select v-model="newInstance.processId" :items="availableProcesses"
                            label="Seleccionar Proceso *" item-text="name" item-value="pId"
                            :rules="[v => !!v || 'Proceso es requerido']" outlined class="mb-4">
                            <template v-slot:item="{ item }">
                                <v-list-item-content>
                                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        v{{ item.version }} -
                                        <v-chip x-small :color="item.isActive === 'y' ? 'green' : 'red'" dark>
                                            {{ item.isActive === 'y' ? 'Activo' : 'Inactivo' }}
                                        </v-chip>
                                        <v-chip x-small :color="item.isValid === 'y' ? 'green' : 'orange'" dark
                                            class="ml-1">
                                            {{ item.isValid === 'y' ? 'Válido' : 'Inválido' }}
                                        </v-chip>
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </template>
                        </v-select>

                        <v-text-field v-model="newInstance.name" label="Nombre de la Instancia"
                            placeholder="Ej: Préstamo CD - Juan Pérez" outlined
                            :rules="[v => !!v || 'Nombre es requerido']"></v-text-field>

                        <v-alert v-if="selectedProcess" type="info" dense>
                            <strong>Proceso seleccionado:</strong> {{ selectedProcess.name }}
                            <div v-if="selectedProcess.description" class="mt-1">
                                {{ selectedProcess.description }}
                            </div>
                        </v-alert>
                    </v-form>
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn color="grey" text @click="cancelInstanceStart">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" @click="confirmInstanceStart"
                        :disabled="!newInstance.processId || !newInstance.name" :loading="startingInstance">
                        <v-icon left>mdi-play</v-icon>
                        {{ startingInstance ? 'Iniciando...' : 'Iniciar Instancia' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    name: 'InstanceManager',
    props: {
        processId: {
            type: [String, Number],
            default: null
        }
    },
    data() {
        return {
            loading: false,
            startingInstance: false,
            showInstanceStarter: false,
            instances: [],
            filters: {
                status: 'all'
            },
            newInstance: {
                processId: null,
                name: ''
            },
            headers: [
                { text: 'ID', value: 'instanceId', width: '80px' },
                { text: 'Nombre', value: 'name' },
                { text: 'Proceso', value: 'process.name' },
                { text: 'Estado', value: 'status', width: '120px' },
                { text: 'Progreso', value: 'progress', width: '150px' },
                { text: 'Actividad Actual', value: 'currentActivity' },
                { text: 'Propietario', value: 'owner', width: '120px' },
                { text: 'Iniciada', value: 'started', width: '140px' },
                { text: 'Finalizada', value: 'ended', width: '140px' },
                { text: 'Acciones', value: 'actions', sortable: false, width: '150px' }
            ],
            statusOptions: [
                { text: 'Todos', value: 'all' },
                { text: 'Activas', value: 'active' },
                { text: 'Completadas', value: 'completed' },
                { text: 'Abortadas', value: 'aborted' },
                { text: 'Excepción', value: 'exception' }
            ]
        }
    },
    computed: {
        instancesCount() {
            return this.instances.length
        },

        filteredInstances() {
            if (this.filters.status === 'all') {
                return this.instances
            }
            return this.instances.filter(instance => instance.status === this.filters.status)
        },

        availableProcesses() {
            return this.$store.state.galaxia.processes.filter(
                process => process.isActive === 'y' && process.isValid === 'y'
            )
        },

        selectedProcess() {
            if (!this.newInstance.processId) return null
            return this.availableProcesses.find(p => p.pId == this.newInstance.processId)
        }
    },
    methods: {
        getStatusColor(status) {
            const colors = {
                active: 'green',
                completed: 'blue',
                aborted: 'red',
                exception: 'orange'
            }
            return colors[status] || 'grey'
        },

        getStatusIcon(status) {
            const icons = {
                active: 'mdi-play',
                completed: 'mdi-check',
                aborted: 'mdi-stop',
                exception: 'mdi-alert'
            }
            return icons[status] || 'mdi-help'
        },

        getStatusText(status) {
            const texts = {
                active: 'Activa',
                completed: 'Completada',
                aborted: 'Abortada',
                exception: 'Excepción'
            }
            return texts[status] || status
        },

        getProgressColor(instance) {
            if (instance.status === 'completed') return 'green'
            if (instance.status === 'aborted') return 'red'
            if (instance.status === 'exception') return 'orange'
            return 'light-blue'
        },

        calculateProgress(instance) {
            // Lógica simplificada - en producción calcularías basado en actividades completadas
            if (instance.status === 'completed') return 100
            if (instance.status === 'aborted') return 0
            return 50 // Por defecto para instancias activas
        },

        getActivityTypeText(type) {
            const texts = {
                start: 'Inicio',
                end: 'Fin',
                activity: 'Actividad',
                switch: 'Switch',
                standalone: 'Standalone'
            }
            return texts[type] || type
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
        },

        async loadInstances() {
            this.loading = true
            try {
                await this.$store.dispatch('galaxia/loadInstances')
                this.instances = this.$store.state.galaxia.instances || []

                // Filtrar por proceso si se especificó
                if (this.processId) {
                    this.instances = this.instances.filter(instance => instance.pId == this.processId)
                }
            } catch (error) {
                console.error('Error loading instances:', error)
                this.$notify('Error cargando instancias', 'error')
            } finally {
                this.loading = false
            }
        },

        async confirmInstanceStart() {
            if (!this.$refs.instanceStarterForm.validate()) return

            this.startingInstance = true
            try {
                const result = await this.$store.dispatch('galaxia/startInstance', {
                    processId: this.newInstance.processId,
                    name: this.newInstance.name
                })

                if (result.ok) {
                    this.$notify('✅ Instancia iniciada exitosamente', 'success')
                    this.showInstanceStarter = false
                    this.resetInstanceStarter()
                    this.loadInstances() // Recargar lista
                }
            } catch (error) {
                this.$notify('❌ Error iniciando instancia', 'error')
            } finally {
                this.startingInstance = false
            }
        },

        cancelInstanceStart() {
            this.showInstanceStarter = false
            this.resetInstanceStarter()
        },

        resetInstanceStarter() {
            this.newInstance = {
                processId: null,
                name: ''
            }
            if (this.$refs.instanceStarterForm) {
                this.$refs.instanceStarterForm.resetValidation()
            }
        },

        viewInstanceDetail(instance) {
            this.$router.push(`/galaxia/instance/${instance.instanceId}`)
        },

        executeInstance(instance) {
            this.$notify(`Ejecutando instancia: ${instance.name}`, 'info')
            // Navegar al ejecutor de actividades
            this.$router.push(`/galaxia/instance/${instance.instanceId}/execute`)
        },

        async abortInstance(instance) {
            if (!confirm(`¿Estás seguro de abortar la instancia "${instance.name}"?`)) {
                return
            }

            try {
                const result = await this.$store.dispatch('galaxia/abortInstance', instance.instanceId)
                if (result.ok) {
                    this.$notify('Instancia abortada', 'success')
                    this.loadInstances()
                }
            } catch (error) {
                this.$notify('Error abortando instancia', 'error')
            }
        }
    },

    created() {
        this.loadInstances()
    }
}
</script>

<style scoped>
.v-data-table>>>tbody tr:hover {
    background-color: #f5f5f5;
}
</style>