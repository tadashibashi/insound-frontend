import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.svelte", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        'code': ["Pixel Code Pro", "monospace"]
      }
    },
  },
  plugins: [],
} satisfies Config;
