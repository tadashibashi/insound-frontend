import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.svelte", "./index.html", "./src/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        'code': ["Pixel Code Pro", "monospace"]
      }
    },
  },
  plugins: [],
} satisfies Config;
