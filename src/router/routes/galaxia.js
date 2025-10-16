// router/index.js - Modulo Galaxia

export default [
    {
        path: "/galaxia",
        //name: "pGalaxiaManager",
        component: () =>
            import(/* webpackChunkName: "about" */ "@/layouts/LayoutSsepi.vue"),
        //beforeEnter: authGuard,
        meta: { requiereAuth: true },
        children: [
            {
                // Ruta PRINCIPAL de Galaxia - cambiamos path a ""
                path: "",
                name: "GalaxiaManager",
                component: () =>
                    import( /* webpackChunkName: "galaxia" */ "@/views/galaxia/GalaxiaManager.vue"),
                //beforeEnter: authGuard,
                meta: {
                    requiereAuth: true,
                    title: "Galaxia Workflow Manager"
                },
                props: false,
            },
            
           
        ],

    },
   

]