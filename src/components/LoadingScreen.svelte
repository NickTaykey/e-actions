<script lang="ts">
 import { Spinner } from 'sveltestrap';
</script>

<div class="loading-screen">
 <div class="spinners-group">
  <Spinner type="grow" color="secondary" />
  <Spinner type="grow" color="secondary" class="mx-2" />
  <Spinner type="grow" color="secondary" />
 </div>
</div>

<style>
 .loading-screen {
  width: 100vw;
  height: 100vh;
 }
 .spinners-group {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
 }
</style>
