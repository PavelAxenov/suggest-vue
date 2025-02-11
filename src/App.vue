<template>
	<div class="app">
		<h1>Suggest</h1>

		<Suggest
			:label="SUGGEST_LABEL"
			:api-url="BASE_REQUEST_URL"
			:max-selections="6"
			@update:selections="handleSelectionsUpdate"
		/>

		<div v-if="selectedEntities.length > 0" class="selected-entities">
			<h2>Selected Entities:</h2>
			<div v-for="entity in selectedEntities" :key="entity.alias">
				{{ entity.name || entity.alias }} ({{ entity.type }}) - Alias: {{ entity.alias }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Suggest from './components/suggest/Suggest.vue';
import type {ISuggestion} from "./components/suggest/types.ts";

const SUGGEST_LABEL = 'Поиск пользователей и компаний';
const BASE_REQUEST_URL = import.meta.env.VITE_BASE_REQUEST_URL;

const selectedEntities = ref<ISuggestion[]>([]);

const handleSelectionsUpdate = (selections: ISuggestion[]) => {
	selectedEntities.value = selections;
};
</script>

<style scoped>
.app {
	font-family: sans-serif;
	padding: 20px;
}

.selected-entities {
	margin-top: 20px;
	border: 1px solid #ccc;
	padding: 10px;
}
</style>