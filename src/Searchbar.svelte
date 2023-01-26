<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ItemType, type Author } from "./fetchFromAPI";
  import { searchInDatabase } from "./SQLdatabase";

  interface $$Events {
    authorClicked: CustomEvent<Author>
  }
  const dispatch = createEventDispatcher();

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
      {#each results ?? [] as result}
        <div class="card" on:click={() => dispatch("authorClicked", result)} on:keypress>
          <div class="card-header">
            {result.id}
          </div>
          <div class="card-body">
            <a href={result.permlink}>{result.permlink}</a>
          </div>
        </div>
      {/each}
    </div>
  {/await}
</div>

<style>
  :root {
    --card-border-color: hsl(0, 0%, 50%);
    --card-color: hsl(0, 0%, 20%);
  }

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
    font-size: 1rem;
  }

  .result-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  .card {
    border: 1px solid var(--card-border-color);
    background-color: var(--card-color);
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
