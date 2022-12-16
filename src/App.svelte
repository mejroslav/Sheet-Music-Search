<script lang="ts">
  import { getListFromAPI, ItemType  } from "./fetchAuthors";
  getListFromAPI(ItemType.Works).then(console.log);

</script>


<main id="bookshelf">
    <h1>Inteligentní procházení knihovnou IMSLP</h1>
</main>

<style>
	* {
		box-sizing: border-box;
	}
	
	/* General Structure */

</style>