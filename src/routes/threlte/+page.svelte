<script lang="ts">
    import { Canvas } from '@threlte/core'
    import Scene from './Scene.svelte'
    import Navbar from '../Navbar.svelte';
  </script>
  
  <div>
    <Navbar/>
    <Canvas>
      <Scene />
    </Canvas>
  </div>
  
  <style>
    div {
      height: 100%;
      width: 100%;
    }
  </style>
  