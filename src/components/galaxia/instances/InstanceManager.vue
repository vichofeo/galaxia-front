<template>
    <v-container fluid>
        <!-- Header -->
        <v-row class="mb-6">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="primary white--text">
                        <v-icon left>mdi-play-circle-outline</v-icon>
                        Gestor de Instancias
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-row align="center">
                            <v-col cols="12" md="6">
                                <v-btn color="primary" @click="showCreateDialog = true"
                                    :disabled="!availableProcesses.length">
                                    <v-icon left>mdi-plus</v-icon>
                                    Nueva Instancia
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar instancias..."
                                    single-line hide-details clearable></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Filtros -->
        <v-row class="mb-4">
            <v-col cols="12" md="4">
                <v-select v-model="filters.processId" :items="availableProcesses" item-text="name" item-value="pId"
                    label="Filtrar por proceso" clearable hide-details></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="filters.status" :items="statusOptions" label="Filtrar por estado" clearable
                    hide-details></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-btn @click="loadInstances" color="secondary" class="mr-2">
                    <v-icon left>mdi-refresh</v-icon>
                    Actualizar
                </v-btn>
                <v-btn @click="clearFilters" text>
                    Limpiar Filtros
                </v-btn>
            </v-col>
        </v-row>

        <!-- Lista de Instancias -->
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>
                        Mis Instancias ({{ filteredInstances.length }})
                    </v-card-title>
                    <v-card-text>
                        <v-data-table :headers="headers" :items="filteredInstances" :search="search" :loading="loading"
                            :items-per-page="10" class="elevation-1">
                            <template v-slot:item.process.name="{ item }">
                                <strong>{{ item.process.name }}</strong>
                                <div class="caption text--secondary">v{{ item.process.version }}</div>
                            </template>

                            <template v-slot:item.status="{ item }">
                                <v-chip :color="getStatusColor(item.status)" small>
                                    {{ getStatusText(item.status) }}
                                </v-chip>
                            </template>

                            <template v-slot:item.started="{ item }">
                                {{ formatDate(item.createdAt) }}
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

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon small @click="executeInstance(item)" v-on="on" color="success"
                                            :disabled="item.status !== 'active'">
                                            <v-icon small>mdi-play</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Ejecutar</span>
                                </v-tooltip>
                            </template>

                            <template v-slot:no-data>
                                <div class="text-center py-4">
                                    <v-icon size="64" class="mb-4">mdi-inbox-outline</v-icon>
                                    <div>No hay instancias creadas</div>
                                    <v-btn class="mt-2" color="primary" @click="showCreateDialog = true">
                                        Crear Primera Instancia
                                    </v-btn>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Dialog Crear Instancia -->
        <v-dialog v-model="showCreateDialog" max-width="600px">
            <v-card>
                <v-card-title class="primary white--text">
                    <v-icon left>mdi-plus-circle</v-icon>
                    Crear Nueva Instancia
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-form ref="createForm" v-model="valid">
                        {{ availableProcesses }}
                        <v-select v-model="newInstance.processId" :items="availableProcesses" item-text="name"
                            item-value="pId" label="Seleccionar Proceso" :rules="[v => !!v || 'Proceso requerido']"
                            required></v-select>

                        <v-textarea v-model="newInstance.notes" label="Notas (opcional)" rows="2"
                            placeholder="Agregar descripción o comentarios sobre esta instancia..."></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showCreateDialog = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="createInstance" :disabled="!valid" :loading="creating">
                        Crear Instancia
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import * as srv from '@/services/galaxia/instancesService';
import { galaxiaService } from '@/services/galaxia/galaxiaService'

export default {
    name: 'InstanceManager',
    data() {
        return {
            loading: false,
            creating: false,
            showCreateDialog: false,
            valid: false,
            search: '',
            instances: [],
            availableProcesses: [],
            filters: {
                processId: null,
                status: null
            },
            newInstance: {
                processId: null,
                notes: ''
            },
            statusOptions: [
                { text: 'Activo', value: 'active' },
                { text: 'Completado', value: 'completed' },
                { text: 'Abortado', value: 'aborted' }
            ],
            headers: [
                { text: 'Proceso', value: 'gi_gp_process.name', sortable: true },
                { text: 'Creado Por', value: 'owner', sortable: true },
                { text: 'Estado', value: 'status', sortable: true },
                { text: 'Fecha Creación', value: 'started', sortable: true },
                { text: 'Acciones', value: 'actions', sortable: false, align: 'center' }
            ]
        }
    },

    computed: {
        filteredInstances() {
            let filtered = this.instances;

            if (this.filters.processId) {
                filtered = filtered.filter(i => i.pId === this.filters.processId);
            }

            if (this.filters.status) {
                filtered = filtered.filter(i => i.status === this.filters.status);
            }

            return filtered;
        }
    },

    async mounted() {
        await this.loadInstances();
        await this.loadAvailableProcesses();
    },

    methods: {
        async loadInstances() {
            this.loading = true;
            try {
                // TODO: Reemplazar con usuario real del sistema
                const userId = 'admin'; // Temporal - integrar con tu auth system
                const params= { userId }
                const response = await srv.getListGInstances(params)
                this.instances = response.data;
            } catch (error) {
                console.error('Error loading instances:', error);
                this.$notify('Error al cargar instancias: ' + error.response?.data?.error || error.message,
                    'error');
                
            } finally {
                this.loading = false;
            }
        },

        async loadAvailableProcesses() {
            try {
                
                const response = await galaxiaService.getProcesses({ status: 'active' });
                /*await this.$axios.get('/api/processes', {
                    params: { status: 'active' }
                });*/
                this.availableProcesses = response.data || [];
            } catch (error) {
                console.error('Error loading processes:', error);
            }
        },

        async createInstance() {
            this.creating = true;
            try {
                // TODO: Reemplazar con usuario real del sistema
                const userId = 'admin'; // Temporal - integrar con tu auth system

                const instanceData = {
                    processId: this.newInstance.processId,
                    owner: userId,
                    initialData: {
                        name: this.newInstance.notes,
                        createdAt: new Date().toISOString()
                    }
                };

                const response = await srv.createGInstance(instanceData);
                //await this.$axios.post('/api/instances', instanceData);

                this.$notify('Instancia creada exitosamente', 'success');
                

                this.showCreateDialog = false;
                this.resetCreateForm();
                await this.loadInstances();

                // Navegar a la nueva instancia
                this.viewInstance(response.data);

            } catch (error) {
                console.error('Error creating instance:', error);
                this.$notify('Error al crear instancia: ' + error.response?.data?.error || error.message,
                    'error');
                
            } finally {
                this.creating = false;
            }
        },

        viewInstance(instance) {
            this.$router.push({
                name: 'GInstanceDetail',
                params: { id: instance.instanceId }
            });
        },

        executeInstance(instance) {
            this.$router.push({
                name: 'ActivityExecutor',
                params: { instanceId: instance.instanceId }
            });
        },

        getStatusColor(status) {
            const colors = {
                active: 'primary',
                completed: 'success',
                aborted: 'error'
            };
            return colors[status] || 'secondary';
        },

        getStatusText(status) {
            const texts = {
                active: 'Activo',
                completed: 'Completado',
                aborted: 'Abortado'
            };
            return texts[status] || status;
        },

        /*formatDate(date) {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },*/
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

        clearFilters() {
            this.filters.processId = null;
            this.filters.status = null;
            this.search = '';
        },

        resetCreateForm() {
            this.newInstance = {
                processId: null,
                notes: ''
            };
            this.$refs.createForm?.reset();
        }
    }
}
</script>

<style scoped>
.v-data-table>>>tbody tr:hover {
    background-color: #f5f5f5 !important;
    cursor: pointer;
}
</style>