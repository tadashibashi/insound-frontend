import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.svelte", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        'code': ["Monogram", "monospace"]
      }
    },
  },
  plugins: [],
} satisfies Config;
