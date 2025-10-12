<!-- components/galaxia/AssignmentManager.vue -->
<template>
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
        <v-card>
            <v-card-title class="headline primary white--text">
                <v-icon left dark>mdi-account-multiple</v-icon>
                Gestionar Asignaciones: {{ role.name }}
            </v-card-title>

            <v-card-text class="pa-4">
                <!-- SELECTOR DE USUARIOS -->
                <v-card outlined class="mb-4">
                    <v-card-title class="subtitle-1">
                        <v-icon left>mdi-account</v-icon>
                        Usuarios Específicos
                    </v-card-title>
                    <v-card-text>
                        <v-select v-model="selectedUsers" :items="availableUsers" label="Seleccionar usuarios" multiple
                            chips deletable-chips :loading="loadingUsers" item-text="name" item-value="id">
                            <template v-slot:item="{ item }">
                                <v-list-item-content>
                                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ item.email }}</v-list-item-subtitle>
                                </v-list-item-content>
                            </template>

                            <template v-slot:selection="{ item }">
                                <v-chip close @click:close="removeUser(item.id)">
                                    <v-icon left small>mdi-account</v-icon>
                                    {{ item.name }}
                                </v-chip>
                            </template>
                        </v-select>
                    </v-card-text>
                </v-card>

                <!-- SELECTOR DE GRUPOS -->
                <v-card outlined class="mb-4">
                    <v-card-title class="subtitle-1">
                        <v-icon left>mdi-account-group</v-icon>
                        Grupos Completos
                    </v-card-title>
                    <v-card-text>
                        <v-select v-model="selectedGroups" :items="availableGroups" label="Seleccionar grupos" multiple
                            chips deletable-chips :loading="loadingGroups" item-text="name" item-value="id">
                            <template v-slot:item="{ item }">
                                <v-list-item-content>
                                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ item.userCount }} usuarios</v-list-item-subtitle>
                                </v-list-item-content>
                            </template>

                            <template v-slot:selection="{ item }">
                                <v-chip close @click:close="removeGroup(item.id)">
                                    <v-icon left small>mdi-account-group</v-icon>
                                    {{ item.name }}
                                </v-chip>
                            </template>
                        </v-select>
                    </v-card-text>
                </v-card>

                <!-- RESUMEN DE ASIGNACIONES -->
                <v-card v-if="totalAssignments > 0" color="blue-grey lighten-5" class="pa-3">
                    <v-row align="center">
                        <v-col cols="auto">
                            <v-icon color="success">mdi-check-circle</v-icon>
                        </v-col>
                        <v-col>
                            <strong>Resumen de asignaciones:</strong><br>
                            {{ selectedUsers.length }} usuarios + {{ selectedGroups.length }} grupos
                            = {{ totalAssignments }} asignaciones totales
                        </v-col>
                    </v-row>
                </v-card>

                <!-- ASIGNACIONES EXISTENTES -->
                <v-card v-if="existingAssignments.length > 0" outlined class="mt-4">
                    <v-card-title class="subtitle-1">
                        <v-icon left>mdi-history</v-icon>
                        Asignaciones Existentes
                    </v-card-title>
                    <v-card-text>
                        <v-list dense>
                            <v-list-item v-for="assignment in existingAssignments" :key="assignment.id">
                                <v-list-item-icon>
                                    <v-icon v-if="assignment.is_group">mdi-account-group</v-icon>
                                    <v-icon v-else>mdi-account</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ assignment.is_group ? assignment.group_name : assignment.user }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ assignment.is_group ? 'Grupo completo' : 'Usuario individual' }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon small @click="removeAssignment(assignment)">
                                        <v-icon color="error" small>mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey" text @click="close" :disabled="saving">
                    Cancelar
                </v-btn>
                <v-btn color="primary" :disabled="saving || !hasChanges" :loading="saving" @click="save">
                    <v-icon left>mdi-content-save</v-icon>
                    {{ saving ? 'Guardando...' : 'Guardar Asignaciones' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'AssignmentManager',
    props: {
        value: Boolean,
        role: {
            type: Object,
            required: true
        },
        processId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            saving: false,
            loadingUsers: false,
            loadingGroups: false,
            selectedUsers: [],
            selectedGroups: [],
            availableUsers: [],
            availableGroups: [],
            existingAssignments: []
        }
    },
    computed: {
        dialog: {
            get() {
                return this.value
            },
            set(value) {
                this.$emit('input', value)
            }
        },
        totalAssignments() {
            return this.selectedUsers.length + this.selectedGroups.length
        },
        hasChanges() {
            return this.totalAssignments > 0
        }
    },
    methods: {
        async loadAvailableUsers() {
            this.loadingUsers = true
            try {
                // TODO: Conectar con tu servicio de usuarios
                // Por ahora datos de ejemplo
                this.availableUsers = [
                    { id: 'user1', name: 'Juan Pérez', email: 'juan@empresa.com' },
                    { id: 'user2', name: 'María García', email: 'maria@empresa.com' },
                    { id: 'user3', name: 'Carlos López', email: 'carlos@empresa.com' }
                ]
            } catch (error) {
                console.error('Error loading users:', error)
                this.$notify('Error cargando usuarios', 'error')
            } finally {
                this.loadingUsers = false
            }
        },
        async loadAvailableGroups() {
            this.loadingGroups = true
            try {
                // TODO: Conectar con tu servicio de grupos
                // Por ahora datos de ejemplo
                this.availableGroups = [
                    { id: 'group1', name: 'Administradores', userCount: 5 },
                    { id: 'group2', name: 'Usuarios Normales', userCount: 25 },
                    { id: 'group3', name: 'Supervisores', userCount: 8 }
                ]
            } catch (error) {
                console.error('Error loading groups:', error)
                this.$notify('Error cargando grupos', 'error')
            } finally {
                this.loadingGroups = false
            }
        },
        async loadExistingAssignments() {
            try {
                const result = await this.$store.dispatch('galaxia/getRoleAssignments', {
                    processId: this.processId,
                    roleId: this.role.roleId
                })
                if (result.ok) {
                    this.existingAssignments = result.data
                }
            } catch (error) {
                console.error('Error loading assignments:', error)
            }
        },
        removeUser(userId) {
            this.selectedUsers = this.selectedUsers.filter(id => id !== userId)
        },
        removeGroup(groupId) {
            this.selectedGroups = this.selectedGroups.filter(id => id !== groupId)
        },
        async removeAssignment(assignment) {
            try {
                const result = await this.$store.dispatch('galaxia/removeRoleAssignment', {
                    processId: this.processId,
                    roleId: this.role.roleId,
                    assignmentId: assignment.is_group ? assignment.group_name : assignment.user
                })
                if (result.ok) {
                    this.$notify('Asignación eliminada', 'success')
                    this.loadExistingAssignments()
                }
            } catch (error) {
                console.error('Error removing assignment:', error)
                this.$notify('Error eliminando asignación', 'error')
            }
        },
        async save() {
            this.saving = true
            try {
                const result = await this.$store.dispatch('galaxia/assignRole', {
                    processId: this.processId,
                    roleId: this.role.roleId,
                    users: this.selectedUsers,
                    groups: this.selectedGroups
                })

                if (result.ok) {
                    this.$emit('assignments-updated')
                    this.close()
                } else {
                    this.$notify('Error al guardar asignaciones', 'error')
                }
            } catch (error) {
                console.error('Error saving assignments:', error)
                this.$notify('Error de conexión al guardar asignaciones', 'error')
            } finally {
                this.saving = false
            }
        },
        close() {
            this.dialog = false
            this.resetForm()
        },
        resetForm() {
            this.selectedUsers = []
            this.selectedGroups = []
            this.existingAssignments = []
        }
    },
    watch: {
        dialog: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.loadAvailableUsers()
                    this.loadAvailableGroups()
                    this.loadExistingAssignments()
                } else {
                    this.resetForm()
                }
            }
        }
    }
}
</script>