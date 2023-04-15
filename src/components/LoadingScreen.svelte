<script lang="ts">
 import { Spinner } from 'sveltestrap';
 export let width = '100vw';
 export let height = '100vh';
</script>

<div class="loading-screen" style={`width: ${width}; height: ${height}`}>
 <div class="spinners-group">
  <Spinner type="grow" color="secondary" />
  <Spinner type="grow" color="secondary" class="mx-2" />
  <Spinner type="grow" color="secondary" />
 </div>
</div>

<style>
 .spinners-group {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
 }
</style>
