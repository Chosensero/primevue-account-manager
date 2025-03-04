import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'

import Message from 'primevue/message'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const app = createApp(App)

app.use(createPinia())

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})
/* eslint-disable vue/multi-word-component-names */
/* eslint-disable vue/no-reserved-component-names */
app.component('Message', Message)
app.component('Button', Button)
app.component('Dropdown', Dropdown)
app.component('InputText', InputText)
app.component('Password', Password)

app.mount('#app')
