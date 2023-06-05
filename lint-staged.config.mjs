export default {
  '**/*': (f) => `pnpx nx format:write --files=${f.join(',')}`,
  '{apps,libs,packages,tools}/**/*.{ts,tsx,js,jsx}': 'eslint',
};
