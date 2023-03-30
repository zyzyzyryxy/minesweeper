export function assert(description, check) {
	if (!check()) console.error('Assertion failed', description);
}