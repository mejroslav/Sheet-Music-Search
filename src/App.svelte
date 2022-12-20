<script lang="ts">
  import { ItemType } from "./fetchFromAPI";
  import { getList } from "./fetchFromCache";
  import { loadOrCreateDatabase } from "./SQLdatabase";
  let loadingAuthors = getList(ItemType.Authors);

  loadOrCreateDatabase().then((db) => ((window as any).db = db));
</script>

<main>
  <div class="w3-container primary-color">
    <h1>Inteligentní procházení knihovnou IMSLP</h1>
  </div> 
  
  <div class="progress-info">
    {#await loadingAuthors}
      <div class="loading">
        <p><strong>Loading: {$loadingAuthors.percent.toFixed(0)} %</strong></p>
      </div>
    {:then listOfWorks}
      <div class="success">
        <p><strong>Success!</strong></p>
      </div>
      <ul class="w3-ul w3-hoverable">
        <li>{JSON.stringify(listOfWorks[0])}</li>
        <li>{JSON.stringify(listOfWorks[1])}</li>
        <li>{JSON.stringify(listOfWorks[2])}</li>
      </ul>
    {:catch error}
      <div class="error">
        <p><strong>Error!</strong></p>
      </div>
    {/await}
  </div>
</main>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

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
