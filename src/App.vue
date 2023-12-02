<script>

import $ from 'jquery';
import iziToast from 'izitoast';

export default {
	data: () => ({
		inner_width: window.innerWidth,
		isMobile: false
	}),

	components: {
	},

	computed: {
	},

	created() {
		if (
			this.$isMobile() ||
			window.innerWidth < 768
		) {
			this.isMobile = true;
		}
	},

	mounted() {
	},

	watch: {
	},

	methods: {
		routeTo(path) {
			this.$router.push(path)
		},

		in_array(needle, haystack) {
			let length = haystack.length;

			for (let i = 0; i < length; i++) {
				if (haystack[i] == needle) return true;
			}

			return false;
		},

		gettype(obj) {
			return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
		},

		randomHash(l = 10) {
			let chars    = '0123456789abcdefABCDEF';
			let char_len = chars.length;
			let ret      = '';

			for (let i = 0; i < l; i++) {
				let rand = Math.floor(Math.random() * char_len);
				ret = ret + chars[rand];
			}

			return ret;
		},

		toast(
			title, 
			message, 
			style = 'show'
			/*
			info, success, warning, error, question
			*/
		) {
			iziToast[style]({
				title:        title,
				message:      message,
				timeout:      10000,
				resetOnHover: true
			});
		},
	}
};

</script>

<template>
	<router-view></router-view>
</template>
