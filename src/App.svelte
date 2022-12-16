<script lang="ts">
  import { ItemType } from "./fetchFromAPI";
  import { getList } from "./fetchFromCache";
  let loadingAuthors = getList(ItemType.Authors);

  import initSqlJs from "sql.js";

  initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  }).then((SQL) => ((window as any).SQL = SQL));
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
