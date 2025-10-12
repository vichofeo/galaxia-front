<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :clipped="false" fixed app>
      <v-list>
        <template v-for="(menu, i) in items">
          <v-list-item :key="i" v-if="!menu.children" :to="menu.url">
            <v-list-item-icon>
              <v-icon>{{ menu.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-title>{{ menu.text }}</v-list-item-title>
          </v-list-item>

          <v-list-group
            :key="i"
            v-if="menu.children"
            :value="true"
            prepend-icon="mdi-account-circle"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-text="menu.text"></v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="(child, j) in menu.children"
              :key="j"
              :to="child.url"
            >
              <v-list-item-content>
                <v-list-item-title v-text="child.text"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon v-text="child.icon"></v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar :clipped="true" color="blue darken-3" dark fixed>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <span class="hidden-sm-and-down">ADMINISTRACIÓN</span>
      </v-toolbar-title>
      <v-text-field
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="mdi-search"
        label="Search"
        class="hidden-sm-and-down"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-apps</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-notifications</v-icon>
      </v-btn>
    </v-toolbar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
<script>
export default {
  name: "LayoutAdmin",
  data() {
    return {
      drawer: null,
      items: [
        {
          icon: "mdi-account",
          text: "Usuarios",
          children: [
            {
              icon: "mdi-account",
              text: "Lista Usuario",
              url: "/admin/usuario",
            },
            {
              icon: "mdi-new",
              text: "Nuevo Usuario",
              url: "/admin/usuario/nuevo",
            },
          ],
        },
        { icon: "mdi-post", text: "Productos", url: "/admin/producto" },
        { icon: "mdi-post", text: "Sucursal", url: "/admin/sucursal" },
      ],
    };
  },
};
</script>
