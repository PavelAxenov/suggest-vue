export function debounce<F extends (...args: any[]) => any>(
	func: F,
	delay: number
): (...args: Parameters<F>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function (this: ThisType<F>, ...args: Parameters<F>) {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func.apply(this, args);
			timeoutId = null;
		}, delay);
	};
}
