<template>
	<div class="user-item">
		<img
			:src="userSuggest.avatar || defaultAvatar"
			alt="User Avatar"
			class="avatar"
			@error="setDefaultAvatar"
		/>
		<div class="user-info">
			<div class="name">{{ userSuggest.name || userSuggest.alias }}</div>
			<div class="alias">@{{ userSuggest.alias }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type {ISuggestion} from "./suggest/types.ts";

interface IProps {
	userSuggest: ISuggestion;
}

defineProps<IProps>()

const defaultAvatar = '';

const setDefaultAvatar = (event: Event) => {
	const target = event.target as HTMLImageElement;
	target.src = defaultAvatar;
};
</script>

<style scoped>
	.user-item {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		margin-right: 8px;
	}

	.user-info {
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: bold;
	}

	.alias {
		color: #888;
	}
</style>