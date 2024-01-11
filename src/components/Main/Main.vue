<script>

import App from '../../App.vue';
import { getToken } from '../totp.js';
import CircleProgress from 'vue3-circle-progress';
import Eye from '@/assets/images/eye.png';
import EyeClosed from '@/assets/images/eyeclosed.png';
import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import iziToast from 'izitoast';
import useClipboard from 'vue-clipboard3';

export default {
	data() {
		return {
			loading:    false,
			eye:        Eye,
			eye_closed: EyeClosed,

			encrypted_keys: '',
			password:       '',
			decrypted_keys: '',
			keypairs:       [],

			decrypted_keys_covered: true,
			percent: 0,
			fill: ''
		}
	},

	components: {
		CircleProgress,
		Eye,
		EyeClosed
	},

	setup() {
		const { toClipboard } = useClipboard();

		const copy = async (msg = '') => {
			try {
				await toClipboard(msg);
			} catch (e) {
				console.log(e);
			}
		}

		return { copy }
	},

	created() {
		this.encrypted_keys = '';
		this.password       = '';
		this.decrypted_keys = '';
		this.keypairs       = [];
		this.fetchEncryptedKeys();
	},

	mounted() {
		let that = this;

		this.refreshData();

		setInterval(function() {
			that.refreshData();
		},1000);
	},

	watch: {
	},

	methods: {
		exportEncryptedKeys() {
			let blob = new Blob([this.encrypted_keys], {type: "application/octet-stream"});
			let link = document.createElement('a');
			let url = window.URL.createObjectURL(blob);

			link.href = url;
			link.download = "totp-keys.json.enc";
			link.click();

			window.URL.revokeObjectURL(url);
		},

		fetchEncryptedKeys() {
			this.encrypted_keys = localStorage.getItem('keys');
		},

		saveDecryptedKeys() {
			// check
			try {
				this.keypairs = JSON.parse(this.decrypted_keys);
			} catch (err) {
				console.log('Invalid JSON formatted keys')
				return;
			}

			if (!this.password) {
				console.log('No password provided. Cannot save to local storage without encryption');
				return;
			}

			localStorage.setItem(
				'keys',
				CryptoJS.AES.encrypt(
					this.decrypted_keys, 
					this.password
				).toString()
			);

			this.fetchEncryptedKeys();
		},

		saveEncryptedKeys() {
			localStorage.setItem(
				'keys',
				this.encrypted_keys
			);
		},

		decryptKeys() {
			let keys = [];

			if (
				!this.encrypted_keys || 
				this.encrypted_keys == 'undefined'
			) {
				localStorage.setItem(
					'keys',
					CryptoJS.AES.encrypt(
						'[]', 
						this.password
					).toString()
				);
			}

			else {
				try {
					let decoded = this.hex2a(
						CryptoJS.AES.decrypt(
							this.encrypted_keys,
							this.password
						).toString()
					);

					if (decoded) {
						this.keypairs = JSON.parse(decoded);
						keys = JSON.stringify(
							this.keypairs,
							null,
							2
						);
					}
				} catch (err) {
					// console.log(err);
					keys = [];
				}
			}

			this.decrypted_keys = keys;
		},

		hex2a(hex) {
			var str = '';

			for (var i = 0; i < hex.length; i += 2) {
				let v = parseInt(hex.substr(i, 2), 16);

				if (v) {
					str += String.fromCharCode(v);
				}
			}

			return str;
		},

		createKey() {
			// const key = createKey();
			// console.log(key);
		},

		getCode(key) {
			const token = getToken(
				key,
				{
					digits: 6,
					algorithm: "SHA-1",
					period: 30
				}
			);

			return token;
		},

		getTimestamp() {
			let epoch = Math.floor(Date.now() / 1000.0);
			let timeleft = 30 - (epoch % 30);
			/* 0-30 */
			return timeleft;
		},

		getData(key) {
			let code = this.getCode(key);
			let time = this.getTimestamp();
			let fill = '#2f3dfd';

			if (parseInt(time) <= 8) {
				fill = '#ffab40';
			}

			if (parseInt(time) < 5) {
				fill = '#ff2d2e';
			}

			code = this.dashed(code);

			return {
				percent: (time * 3.33) - 1,
				second:  time,
				code:    code,
				fill:    fill
			}
		},

		refreshData() {
			let that = this;

			Object.values(this.keypairs)
			.forEach((keypair, index) => {
				let key  = keypair.key || '';
				let data = that.getData(key);

				this.percent = data?.percent ?? 0;
				this.fill    = data?.fill ?? '#2f3dfd';

				this.keypairs[index].percent = data?.percent ?? 0;
				this.keypairs[index].second  = data?.second ?? 0;
				this.keypairs[index].code    = data?.code ?? 0;
				this.keypairs[index].fill    = data?.fill ?? '#2f3dfd';
				this.keypairs[index].show    = this.keypairs[index].show || false;
			});
		},

		dashed(code) {
			let s  = String(code);
			// console.log(s);

			for (let i = 0; i < 6 - s.length; i++) {
				s = `0${s}`;
			}

			let s1 = s.slice(0, 3);
			let s2 = s.slice(3);

			return `${s1}-${s2}`;
		},

		highlightRow(event) {
			let keycards = this.$refs['keycards'] ?? Array();

			Object.values(keycards).forEach((element, i) => {
				element.classList.remove('highlighted-border')
			});

			event.target.classList.toggle('highlighted-border')

			this.copyThis(event.target?.innerText)
		},

		copyThis(code) {
			let stripped_code = code.replace('-', '');
			this.copy(stripped_code);
			this.toast(
				'',
				`Copied 2FA code (${stripped_code})`,
				'success'
			);
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
	<div 
		class="container" 
		style="max-width: 900px;"
	>
		<div class="row mb100">
			<div class="col-12">
				<p class="fs24 bold mt40 mb20">
					Local TOTP
				</p>

				<p class="fs14 op7">
					Encrypted Keys
				</p>

				<textarea 
					class="form-control mt10"
					style="height: 200px;"
					v-model="encrypted_keys"
				></textarea>

				<button 
					class="btn btn-success btn-sm mt10 min-width-100 float-right ml5"
					@click="saveEncryptedKeys"
				>
					Save
				</button>

				<button 
					class="btn btn-success btn-sm mt10 min-width-100 float-right"
					@click="exportEncryptedKeys"
				>
					Export
				</button>

				<p class="fs14 op7 mt60">
					Enter your password to display 2fa codes
				</p>

				<input 
					type="password"
					class="form-control mt10" 
					placeholder="Enter Decryption Password"
					v-model="password" 
					@keyup.enter="decryptKeys"
					autocomplete="off"
				>

				<button
					class="btn btn-success btn-sm mt10 min-width-100 float-right"
					@click="decryptKeys"
				>
					Load
				</button>

				<p class="fs14 op7 mt60">
					Decrypted keys:
					<i 
						@click="decrypted_keys_covered = !decrypted_keys_covered"
						class="fa fs22 pointer ml5"
						:class="
							decrypted_keys_covered ?
							'fa-eye-slash' :
							'fa-eye'
						"
					></i>
				</p>

				<div style="position: relative;">
					<textarea 
						id="decrypted-keys-textarea"
						class="form-control mt10" 
						style="height: 200px;"
						v-model="decrypted_keys"
						autocomplete="off"
					></textarea>

					<div 
						v-if="decrypted_keys_covered"
						class="decrypted-keys-cover"
					>
						<i class="fa fa-eye-slash fs26"></i>
					</div>
				</div>

				<button 
					class="btn btn-success btn-sm mt10 min-width-100 float-right"
					@click="saveDecryptedKeys"
				>
					Save
				</button>

				<div class="mt100"></div>

				<div 
					v-if="
						1==2 &&
						keypairs != '' &&
						decrypted_keys.length > 0
					"
					class="keycard-right"
				>
					<circle-progress 
						:percent="percent" 
						:fill-color="fill"
						:transition="400"
						:size="200" 
					></circle-progress>

					<div class="circle-center">
						<span>
							{{ getTimestamp() }}
						</span>
					</div>
				</div>

				<div 
					v-for="keypair in keypairs"
					class="keycard"
				>
					<div class="keycard-header">
						<div class="keycard-left">
							<p class="fs18 bold mt10">
								{{ keypair.name }}
							</p>
							<p class="fs14 op7">
								{{ keypair.title }}
							</p>
						</div>

						<div class="keycard-right">
							<div style="position: absolute; right: 5px; top: -14px;">
								<span
									class="fa fa-clipboard fs13 text-blue pointer"
									@click="copyThis(keypair.code)"
								></span>
							</div>

							<p
								class="mt10 fs30 letter-spacing highlight pointer"
								ref="keycards"
								@click="highlightRow"
							>
								<div 
									class="line-timer"
									:style="
										'width: '+keypair.percent+'%;'+
										'background-color: '+keypair.fill+';'
									"
								>
								</div>
								{{ keypair.code }}
							</p>
						</div>
					</div>

					<div style="position: relative;">
						<input 
							:type="
								keypair.show ?
								'text' :
								'password'
							" 
							class="form-control eye-input mt20"
							:value="keypair.key" 
						>

						<div 
							class="eye pl5"
							@click="keypair.show = !keypair.show"
						>
							<img 
								:src="
									keypair.show ?
									eye :
									eye_closed
								"
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

.keycard {
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 440px;
	height: auto;
	border: 1px solid #e3e6e9;
	padding: 15px;
	margin-top: 15px;
}

.keycard-left {
	width: calc(100% - 200px);
	padding-right: 15px;
}

.keycard-right {
	position: relative;
}

.keycard-header {
	display: flex;
	flex-direction: row;
}

.circle-center {
	position: absolute;
	left: 0;
	top: 0;
	width: 200px;
	height: 200px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 50px;
}

.letter-spacing {
	letter-spacing: 10px;
}

.highlight {
	background-color: #f3f6f9;
	border-radius: 6px;
	color: #444;
	padding: 0 8px;
	position: relative;
}

.line-timer {
	width: 100%; 
	height: 3px; 
	background-color: #2f3dfd; 
	position: absolute; 
	left: 0; 
	top: 0;
	transition: 0.5s ease;
}

.eye-input {
	width: calc(100% - 45px);
	display: inline-block;
}

.eye {
	display: inline-block;
	width: 39px;
	margin-left: 5px;
	cursor: pointer;
}

.eye img {
	width: 25px;
	height: auto;
}

.decrypted-keys-cover {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%; 
	height: 200px; 
	background-color: #f0f3f6; 
	border-radius: 6px; 
	display: flex; 
	align-items: center; 
	justify-content: center; 
	border: 2px dashed #e0e0e0;
	z-index: 2;
	/*pointer-events: none;*/
}

.decrypted-keys-cover:hover,
.decrypted-keys-cover:active {
	opacity: 0;
}

.pointer {
	cursor: pointer;
}

.highlighted-border {
	border: 3px dashed #2f3dfd;
}

</style>