export const calls = [];
export function revalidatePath(path, type) { calls.push([path, type]); }
