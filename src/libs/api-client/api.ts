import { RequestMethods } from "./types.ts";

const BASE_REQUEST_URL = import.meta.env.VITE_BASE_REQUEST_URL;

class ApiClient {
	get (query: string) {
		return fetch(`${BASE_REQUEST_URL}${query}`, {
			method: RequestMethods.Get,
		})
	}
}

export const apiClient = new ApiClient();