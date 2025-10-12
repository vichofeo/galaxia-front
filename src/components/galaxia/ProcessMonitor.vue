<!-- components/galaxia/ProcessMonitor.vue -->
<template>
    <v-card-text>
        <v-alert type="info">
            <strong>Monitor de Procesos</strong><br>
            Esta funcionalidad estará disponible en la siguiente versión.
            Aquí podrás monitorear instancias en ejecución, actividades pendientes y métricas.
        </v-alert>

        <v-row>
            <v-col cols="12" md="4">
                <v-card color="blue" dark>
                    <v-card-text class="text-center">
                        <div class="text-h4">{{ processes.length }}</div>
                        <div>Procesos Totales</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="4">
                <v-card color="green" dark>
                    <v-card-text class="text-center">
                        <div class="text-h4">{{ activeProcesses.length }}</div>
                        <div>Procesos Activos</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="4">
                <v-card color="orange" dark>
                    <v-card-text class="text-center">
                        <div class="text-h4">{{ validProcesses.length }}</div>
                        <div>Procesos Válidos</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script>
export default {
    name: 'ProcessMonitor',
    computed: {
        processes() {
            return this.$store.state.galaxia.processes
        },
        activeProcesses() {
            return this.processes.filter(p => p.isActive === 'y')
        },
        validProcesses() {
            return this.processes.filter(p => p.isValid === 'y')
        }
    }
}
</script>