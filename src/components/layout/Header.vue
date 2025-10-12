<template>
    <v-app-bar color="#1d62a1" dark>
        <v-toolbar-title>SYS v001</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon to="/">
            <v-icon>mdi-home</v-icon>
        </v-btn>

        <v-btn icon to="/formularios">
            <v-icon>mdi-post</v-icon>
        </v-btn>

        <v-btn icon to="/login">
            <v-icon>mdi-account</v-icon>
        </v-btn>

    </v-app-bar>
</template>

<script>
export default {
    name:'Header'

}
</script>

<style></style>