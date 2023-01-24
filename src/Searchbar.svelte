<script lang="ts">
  import { ItemType } from "./fetchFromAPI";
  import { searchInDatabase } from "./SQLdatabase";

  let inputValue: string | undefined;
  $: loadingResults = inputValue
    ? searchInDatabase(inputValue, ItemType.Authors)
    : undefined;
</script>

<div class="search-wrapper">
  <div class="search">
    <input
      type="text"
      placeholder="Zadej název autora/díla..."
      id="search"
      bind:value={inputValue}
    />
  </div>
  {#await loadingResults}
    <p>Loading</p>
  {:then results}
    <div class="result-cards">
      <div class="card">
        {#each results ?? [] as result}
          <div class="card-header">
            {result.id}
          </div>
          <div class="card-body">
            {result.permlink}
          </div>
        {/each}
      </div>
    </div>
  {/await}
</div>

<style>
  .search-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .search input[type="text"] {
    float: center;
    padding: 6px;
    border: none;
    margin-top: 8px;
    margin-left: 10px;
    font-size: 17px;
  }

  .result-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.25rem;
    margin-top: 1rem;
  }
  .card {
    border: 1px solid black;
    background-color: white;
    padding: 0.5rem;
  }

  .card > .card-header {
    margin-bottom: 0.25rem;
  }

  .card > .card-body {
    font-size: 0.8rem;
    color: #777;
  }
</style>
