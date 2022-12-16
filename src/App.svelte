<script lang="ts">
  import { ItemType } from "./fetchFromAPI";
  import { getList } from "./fetchFromCache";
  import { createDatabase } from "./SQLdatabase";
  let loadingAuthors = getList(ItemType.Authors);

  createDatabase().then((db) => ((window as any).db = db));
</script>

<main id="bookshelf">
  <h1>Inteligentní procházení knihovnou IMSLP</h1>

  {#await loadingAuthors}
    Loading: {$loadingAuthors.percent.toFixed(0)} %
  {:then listOfWorks}
    první položka: {JSON.stringify(listOfWorks[0])}
  {/await}
</main>

<style>
  * {
    box-sizing: border-box;
  }

  /* General Structure */
</style>
