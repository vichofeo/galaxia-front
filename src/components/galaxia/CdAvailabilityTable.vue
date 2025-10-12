<!-- components/galaxia/CdAvailabilityTable.vue -->
<template>
    <div>
        <v-alert type="info" class="mb-4">
            Tabla de disponibilidad de CDs - Componente específico
        </v-alert>

        <v-card outlined class="mb-4">
            <v-card-title>Disponibilidad de CDs</v-card-title>
            <v-card-text>
                <p>Aquí iría la tabla específica para browse_cds</p>
                <v-text-field v-model="formData.selected_cd" label="CD seleccionado"></v-text-field>
            </v-card-text>
        </v-card>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="$emit('cancel')" :disabled="loading">Cancelar</v-btn>
            <v-btn color="primary" @click="$emit('execute', formData)" :loading="loading">
                Confirmar CD
            </v-btn>
        </v-card-actions>
    </div>
</template>

<script>
export default {
    name: 'CdAvailabilityTable',
    props: {
        workitem: Object,
        loading: Boolean
    },
    data() {
        return {
            formData: {
                selected_cd: ''
            }
        }
    }
}
</script>