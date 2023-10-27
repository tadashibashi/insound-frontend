<script lang="ts">
  export const startingCount: number = 0;
  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment} class="bg-gray-200 shadow-md rounded px-2 py-1">
  count is {count}
</button>
