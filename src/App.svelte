<script lang="ts">
  import AuthorPage from "./AuthorPage.svelte";
import type { Author } from "./fetchFromAPI";
  import Searchbar from "./Searchbar.svelte";
  import { loadOrCreateDatabase, populateDatabase, searchInDatabase } from "./SQLdatabase";
  let author: Author | undefined;

  let loading = populateDatabase();

  // for funsies and debugging
  loadOrCreateDatabase().then((db) => ((window as any).db = db));
</script>

<main>
  <div class="w3-container primary-color">
    <h1>Inteligentní procházení knihovnou IMSLP</h1>
  </div> 

  {#if author === undefined}
  
  <div class="progress-info">
    {#await loading}
      <div class="loading">
        <p><strong>Loading: {$loading.percent.toFixed(0)} %</strong></p>
      </div>
    {:then listOfWorks}
      <div class="success">
        <p><strong>Success!</strong></p>
      </div>
    {:catch error}
      <div class="error">
        <p><strong>Error!</strong></p>
      </div>
    {/await}
  </div>

  <Searchbar on:authorClicked={(e) => author = e.detail} />

  {:else}
    <AuthorPage {author}/>
  {/if}
</main>

<style>
  .loading {
    background-color: hsl(207, 90%, 54%);
    border-left: 6px solid hsl(229, 77%, 49%);
    padding-left: 6pt;
  }
  .success {
    background-color: hsl(120, 100%, 40%);
    border-left: 6px solid hsl(120, 100%, 30%);
    padding-left: 6pt;
  }
  .error {
    background-color: hsl(0, 100%, 93%);
    border-left: 6px solid hsl(4, 90%, 58%);
    padding-left: 6pt;
  }
  /* General Structure */
</style>
