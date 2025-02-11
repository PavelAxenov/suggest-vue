import {type IResponseData, ResponseErrorMsg} from "../libs/api-client/types.ts";
import { apiClient } from "../libs/api-client/api.ts";
import type {IResponseSuggestion} from "../components/suggest/types.ts";

export async function fetchSuggestions(query: string): Promise<IResponseData> {
	const result: IResponseData = {
		errorMsg: '',
		status: 0,
		suggestions: [],
	}

	try {
		const response = await apiClient.get(query);

		if (!response.ok) {
			switch (response.status) {
				case 400:
					result['errorMsg'] = ResponseErrorMsg.InvalidQuery;
					result['status'] = response.status;
					break;
				case 500:
					result['errorMsg'] = ResponseErrorMsg.ServerError;
					result['status'] = response.status;
					break;
				default:
					result['errorMsg'] = ResponseErrorMsg.FailedRequest;
					result['status'] = response.status;
					break;
			}

			return result;
		}

		const data: IResponseSuggestion = await response.json();

		result['status'] = response.status;
		result['suggestions'] = data.data;

		return result;
	} catch (err: unknown) {
		result['errorMsg'] = ResponseErrorMsg.UnexpectedError;
		return result;
	}
}