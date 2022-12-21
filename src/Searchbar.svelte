<script lang="ts">
  import { ItemType } from "./fetchFromAPI";
  import { searchInDatabase } from "./SQLdatabase";

  let inputValue: string | undefined;
  $: loadingResults = inputValue
    ? searchInDatabase(inputValue, ItemType.Authors)
    : undefined;
</script>

<div class="search">
  <input
    type="text"
    placeholder="Zadej název autora/díla..."
    bind:value={inputValue}
  />
</div>
{#await loadingResults}
  <p>Loading</p>
{:then results}
  <ul class="vertical-menu">
    {#each results ?? [] as result}
      <li>{result.id}</li>
    {/each}
  </ul>
{/await}

<style>
  .search input[type="text"] {
    float: center;
    padding: 6px;
    border: none;
    margin-top: 8px;
    margin-left: 10px;
    font-size: 17px;
  }

  .vertical-menu {
    width: 200px; /* Set a width if you like */
  }

</style>
