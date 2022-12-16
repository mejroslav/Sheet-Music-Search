<script lang="ts">
  import { getListFromAPI, ItemType  } from "./fetchAuthors";
  import { Progress, PromiseWithProgress } from "./promiseWithProgress";
  let p = getListFromAPI(ItemType.Authors);
</script>


<main id="bookshelf">
    <h1>Inteligentní procházení knihovnou IMSLP</h1>
	
	{#await p}
		Loading: {$p.percent.toFixed(0)} %
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