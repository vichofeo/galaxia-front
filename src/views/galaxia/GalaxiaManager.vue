<!-- views/GalaxiaManager.vue -->
<template>
    <v-container fluid class="fill-height">
        <v-row class="fill-height">
            <v-col cols="12">
                <v-card class="fill-height">
                    <v-toolbar color="primary" dark flat>
                        <v-toolbar-title><v-icon left>mdi-workflow</v-icon>Galaxia Workflow Manager</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn color="success" icon @click="showProcessCreator = true" class="mr-2">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <!-- Botón recargar -->
                        <v-btn icon @click="loadProcesses">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <!-- Tabs principales -->
                    <v-tabs v-model="tab" grow>
                        <v-tab><v-icon left>mdi-list-box</v-icon>Procesos</v-tab>
                        <v-tab>Actividades</v-tab>
                        <v-tab><v-icon left>mdi-monitor</v-icon>Monitor</v-tab>
                    </v-tabs>

                    <v-tabs-items v-model="tab" class="fill-height">
                        <v-tab-item class="fill-height">
                            <ProcessList />
                        </v-tab-item>
                        <v-tab-item>
                            <ActivityManager />
                        </v-tab-item>
                        <v-tab-item>
                            <ProcessMonitor />
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>
            </v-col>
        </v-row>

        <!-- Dialog para crear proceso -->
        <ProcessCreator v-model="showProcessCreator" @process-created="onProcessCreated" />
    </v-container>
</template>

<script>
import ProcessList from '@/components/galaxia/ProcessList.vue'
import ActivityManager from '@/components/galaxia/ActivityManager.vue'
import ProcessMonitor from '@/components/galaxia/ProcessMonitor.vue'
import ProcessCreator from '@/components/galaxia/ProcessCreator.vue'

export default {
    name: 'GalaxiaManager',
    components: {
        ProcessList,
        ActivityManager,
        ProcessMonitor,
        ProcessCreator
    },
    data() {
        return {
            tab: 0,
            showProcessCreator: false
        }
    },
    methods: {
        onProcessCreated() {
            this.showProcessCreator = false
            this.loadProcesses()
            //this.$store.dispatch('galaxia/loadProcesses')
            this.$notify('Proceso creado exitosamente', 'success')
        },
        loadProcesses() {
            this.$store.dispatch('galaxia/loadProcesses')
        }
    },
    created() {
        this.loadProcesses()
    }
}
</script>
<style scoped>
.fill-height {
    height: 100%;
}
</style>