<template>
    <v-form ref="interactiveForm">
        <v-row v-for="field in formFields" :key="field.name">
            <v-col cols="12">
                <v-text-field v-if="field.type === 'string'" v-model="formData[field.name]" :label="field.label"
                    :required="field.required"
                    :rules="field.required ? [v => !!v || `${field.label} es requerido`] : []"></v-text-field>
                <v-text-field v-else-if="field.type === 'number'" v-model.number="formData[field.name]"
                    :label="field.label" type="number" :required="field.required"
                    :rules="field.required ? [v => !isNaN(v) || `${field.label} debe ser un número`] : []"></v-text-field>
                <v-checkbox v-else-if="field.type === 'boolean'" v-model="formData[field.name]" :label="field.label"
                    :required="field.required"
                    :rules="field.required ? [v => v !== undefined || `${field.label} es requerido`] : []"></v-checkbox>
            </v-col>
        </v-row>
        <v-btn color="primary" @click="submitForm" :disabled="loading">Enviar</v-btn>
    </v-form>
</template>

<script>
import galaxiaService from '@/services/galaxia/galaxiaService';

export default {
    name: 'InteractiveForm',
    props: {
        instanceId: [String, Number],
        activityId: [String, Number],
        formFields: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            loading: false,
            formData: {}
        };
    },
    methods: {
        async submitForm() {
            if (!this.$refs.interactiveForm.validate()) return;
            this.loading = true;
            try {
                await galaxiaService.submitForm(this.instanceId, this.activityId, this.formData);
                this.$emit('success', 'Formulario enviado');
                this.formData = {};
            } catch (error) {
                this.$emit('error', 'Error al enviar formulario');
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.v-form {
    padding: 16px;
}
</style>