<script>

</script>

<template>
	<div class="container-fluid main-cont">
		<h1>
			404 - Not Found 
			<img src="@/assets/images/sad-emoji.png" style="width: 33px; margin-bottom: 5px;">
		</h1>

		<div class="picture mt20">
		</div>

		<p class="op7 mt10">
			Sorry we threw off your groove.
		</p>
	</div>
</template>

<style scoped>

body {
	box-sizing: content-box;
}

h1 {
	text-align: center;
}

.main-cont {
	height: calc(100vh - 150px);
	display: flex; justify-content: center;
	align-items: center;
	flex-direction: column;
}

.picture {
	width: 800px;
	height: 450px;
	background-image: url('@/assets/images/sorry-we-threw-off-your-groove.jpg');
	background-position: center center;
	background-size: cover;
}

</style>