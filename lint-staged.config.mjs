export default {
  'frontend/**/*.{js,jsx}': (files) => {
    const paths = files.map((file) => file.replace(/^frontend\//, ''));
    if (paths.length === 0) return [];
    return [
      `cd frontend && pnpm exec eslint --fix ${paths.join(' ')}`,
      `cd frontend && pnpm exec eslint --max-warnings=0 ${paths.join(' ')}`,
    ];
  },
  'backend/**/*.js': (files) => files.map((file) => `node --check ${file}`),
};
