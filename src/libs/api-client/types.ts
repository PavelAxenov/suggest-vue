export const enum RequestMethods {
	Get = 'GET',
	Post = 'POST',
	Put = 'PUT',
	Delete = 'DELETE',
	Patch = 'PATCH',
}

export const enum ResponseErrorMsg {
	InvalidQuery = 'Ошибка: Invalid query',
	ServerError = 'Ошибка: Internal Server Error',
	FailedRequest = 'Ошибка: Request failed',
	UnexpectedError = 'Ошибка: отсутствуют варианты',
}

export interface IResponseData {
	errorMsg?: ResponseErrorMsg | string,
	status?: number;
	suggestions?: unknown
}
