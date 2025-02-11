export const enum SuggestionType {
	User = 'user',
	Company = 'company',
}

export interface ISuggestion {
	type: SuggestionType;
	alias: string;
	name?: string;
	title?: string;
	avatar: string;
}

export interface IResponseSuggestion {
	data: ISuggestion[]
}

