import { createApp } from 'vue';
import {
	createRouter,
	createWebHistory
} from 'vue-router';
import App from './App.vue';
import cookie from 'vue-cookies';
import VueMobileDetection from "vue-mobile-detection";

/* Routes */
import NotFound from '@/components/NotFound/NotFound.vue';
import Main from '@/components/Main/Main.vue';


import './assets/css/main.css'

const app_name = 'Local TOTP';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/:pathMatch(.*)*',
			name: 'NotFound',
			component: NotFound,
			meta: {
				title: `${app_name} - Not Found`,
				display_name: 'Not Found'
			}
		},
		{
			path: '/',
			name: 'Main',
			component: Main,
			meta: {
				title: `${app_name}`,
				display_name: ''
			}
		},
	]
});

const app = createApp(App)
app.use(router)
app.use(VueMobileDetection);

let cookie_config = {
	path: '/'
}

if (window.location.protocol == 'https:') {
	cookie_config = {
		path: '/',
		secure: true,
		sameSite: 'Strict'
	}
}

app.use(cookie, cookie_config)
app.mount('#app')
