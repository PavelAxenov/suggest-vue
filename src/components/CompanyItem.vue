<template>
	<div class="company-item">
		<img
			:src="companySuggest.avatar || defaultAvatar"
			alt="Company Avatar"
			class="avatar"
			@error="setDefaultAvatar"
		/>

		<div class="company-info">
			<div class="name">{{ companySuggest.title || companySuggest.alias }}</div>
			<div class="details">
				Компания
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type {ISuggestion} from "./suggest/types.ts";

interface IProps {
	companySuggest: ISuggestion;
}

defineProps<IProps>()

const defaultAvatar = '';

const setDefaultAvatar = (event: Event) => {
	const target = event.target as HTMLImageElement;
	target.src = defaultAvatar;
};
</script>

<style scoped>
	.company-item {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		margin-right: 5px;
	}

	.company-info {
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: bold;
	}

	.details {
		color: #888;
		font-size: 14px;
	}
</style>