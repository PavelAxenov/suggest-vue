<template>
	<div class="suggest-container">
		<label :for="inputId">{{ label }}</label>

		<div class="input-wrapper">
			<div class="selected-tags" v-if="data.selectedEntities.length > 0">
				<div
					v-for="entity in data.selectedEntities"
					:key="entity.alias"
					class="tag"
				>
					<span>@{{ entity.alias }}</span>
					<button @click="removeEntity(entity)">x</button>
				</div>
			</div>

			<input
				ref="inputRef"
				v-model="data.searchTerm"
				type="text"
				:placeholder="placeholder"
				:id="inputId"
				aria-autocomplete="list"
				:aria-expanded="data.showSuggestions"
				:aria-owns="suggestionsId"
				aria-controls="suggestionsId"
				@input="onInputChange"
				@keydown.down="selectNext"
				@keydown.up="selectPrevious"
				@keydown.enter="selectHighlighted"
				@keydown.esc="clearSuggestions"
			/>
		</div>

		<ul
			v-if="data.showSuggestions"
			:id="suggestionsId"
			class="suggestions"
			role="listbox"
		>
			<li
				v-if="data.loading"
				class="suggestion-item loading"
				role="option"
				aria-disabled="true"
			>
				Loading...
			</li>

			<li
				v-if="data.error"
				class="suggestion-item error"
				role="option"
				aria-disabled="true"
			>
				{{ data.error }}
			</li>

			<li
				v-if="!data.loading && !data.error && data.suggestions.length === 0"
				class="suggestion-item no-results"
				role="option"
				aria-disabled="true"
			>
				No results found.
			</li>

			<template v-else>
				<li
					v-for="(suggestion, index) in displayedSuggestions"
					:key="suggestion.alias"
					class="suggestion-item"
					:class="{ highlighted: index === data.highlightedIndex }"
					:aria-selected="index === data.highlightedIndex"
					role="option"
					tabindex="-1"
					@click="selectSuggestion(suggestion)"
				>
					<UserItem
						v-if="suggestion.type === SuggestionType.User"
						:user-suggest="suggestion"
					/>

					<CompanyItem
						v-else-if="suggestion.type === SuggestionType.Company"
						:company-suggest="suggestion"
					/>

					<div v-else>Unknown suggestion type</div>
				</li>
			</template>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, computed, onMounted, nextTick, reactive } from 'vue';
	import UserItem from '../UserItem.vue';
	import CompanyItem from '../CompanyItem.vue';
	import { debounce } from "../../libs/debounce.ts";
	import { type ISuggestion, SuggestionType } from "./types.ts";
	import { fetchSuggestions } from "../../utils/fetch-suggestion.ts";

	interface IProps {
		label: string;
		apiUrl: string;
		minChars?: number;
		maxSuggestions?: number;
		maxSelections?: number;
		placeholder?: string;
	}

	const props = withDefaults(defineProps<IProps>(), {
		minChars: 3,
		maxSuggestions: 4,
		maxSelections: 2,
		placeholder: 'Начните печатать для поиска...',
	})

	const emit = defineEmits(['update:selections']);

	const inputRef = ref<HTMLInputElement | null>(null);

	interface IData {
		searchTerm: string,
		suggestions: ISuggestion[],
		loading: boolean,
		error: string | null,
		showSuggestions: boolean,
		highlightedIndex: number,
		selectedEntities: ISuggestion[],
	}

	const data = reactive<IData>( {
		searchTerm: '',
		suggestions: [],
		loading: false,
		error: null,
		showSuggestions: false,
		highlightedIndex: -1,
		selectedEntities: [],
	})

	const inputId = `suggest-input-${Math.random().toString(36).substring(2, 15)}`;
	const suggestionsId = `suggest-suggestions-${Math.random().toString(36).substring(2, 15)}`;

	const displayedSuggestions = computed(() =>
		data.suggestions
		// Если нужно отображать именно определенное кол-во из проп(maxSuggestions), то юзаем код ниже
		// data.suggestions.slice(0, props.maxSuggestions)
	);

	const canAddMore = computed(() => data.selectedEntities.length < props.maxSelections);

	const fetchInfo = async (query: string) => {
		if (query.length < props.minChars) {
			data.suggestions = [];
			data.showSuggestions = false;
			return;
		}

		data.loading = true;
		data.error = null;

		const { suggestions, errorMsg } = await fetchSuggestions(query);

		if (Array.isArray(suggestions) && suggestions.length) data.suggestions = suggestions;
		if (errorMsg) data.error = errorMsg;

		data.loading = false;
		data.showSuggestions = true;
		data.highlightedIndex = -1;
	};

	const debouncedFetch = debounce(fetchInfo, 300);

	const onInputChange = () => {
		if (!canAddMore.value) {
			data.searchTerm = '';
			data.showSuggestions = false;
			return;
		}
		debouncedFetch(data.searchTerm);
	};

	const selectSuggestion = (suggestion: ISuggestion) => {
		if (!canAddMore.value) return;
		data.selectedEntities.push(suggestion);
		data.searchTerm = '';
		data.suggestions = [];
		data.showSuggestions = false;
		data.highlightedIndex = -1;
		emit('update:selections', data.selectedEntities);
		focusInput();
	};

	const removeEntity = (entity: ISuggestion) => {
		data.selectedEntities = data.selectedEntities.filter(
			(item) => item.alias !== entity.alias
		);
		emit('update:selections', data.selectedEntities);
		focusInput();
	};

	const selectNext = () => {
		if (!data.showSuggestions || data.suggestions.length === 0) return;

		data.highlightedIndex =
			data.highlightedIndex < displayedSuggestions.value.length - 1
				? data.highlightedIndex + 1
				: 0;
	};

	const selectPrevious = () => {
		if (!data.showSuggestions || data.suggestions.length === 0) return;

		data.highlightedIndex =
			data.highlightedIndex > 0
				? data.highlightedIndex - 1
				: displayedSuggestions.value.length - 1;
	};

	const selectHighlighted = () => {
		if (data.highlightedIndex !== -1 && data.showSuggestions) {
			selectSuggestion(displayedSuggestions.value[data.highlightedIndex]);
		}
	};

	const clearSuggestions = () => {
		data.showSuggestions = false;
		data.highlightedIndex = -1;
	};

	const focusInput = () => {
		nextTick(() => {
			inputRef.value?.focus();
		});
	};

	onMounted(() => {
		focusInput();
	});

	watch(data.selectedEntities, () => {
		if (!canAddMore.value) {
			data.searchTerm = '';
			data.showSuggestions = false;
		}
	}, { deep: true });
</script>

<style scoped>
	.suggest-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: bold;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 4px;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-right: 0.5rem;
	}

	.tag {
		display: flex;
		align-items: center;
		background-color: #f0f0f0;
		border-radius: 4px;
		padding: 4px 8px;
	}

	.tag button {
		background: none;
		border: none;
		cursor: pointer;
		margin-left: 4px;
		font-size: 16px;
		padding: 0;
	}

	input[type="text"] {
		flex-grow: 1;
		border: none;
		padding: 8px;
		font-size: 16px;
		outline: none;
	}

	.suggestions {
		position: absolute;
		display: flex;
		flex-direction: column;
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid #ccc;
		border-radius: 4px;
		max-height: 230px;
		overflow-y: auto;
		z-index: 10;
		background-color: #fff;
		width: 100%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.suggestion-item {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 10px;
	}


	.suggestion-item.highlighted {
		background-color: #f0f0f0;
	}

	.suggestion-item.loading,
	.suggestion-item.error,
	.suggestion-item.no-results {
		cursor: not-allowed;
		color: #888;
	}

	@media (max-width: 600px) {
		.selected-tags {
			width: 100%;
		}
	}
</style>