const promptModules = import.meta.glob('../../prompts/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const stylePrompts = Object.entries(promptModules).map(([path, prompt]) => {
  const id = path.split('/').pop()!.replace(/\.txt$/i, '');
  const name = id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { id, name, prompt: prompt.trim() };
});
