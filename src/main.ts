import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'


// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'


import './styles/main.scss'


const vuetify = createVuetify({
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#E3350D', // pokedex red
                    secondary: '#3B4CCA', // sapphire
                    surface: '#FFFFFF'
                }
            }
        }
    }
})


createApp(App)
    .use(createPinia())
    .use(router)
    .use(vuetify)
    .mount('#app')