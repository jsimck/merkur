<script>
  import { setContext } from 'svelte';
  import {writable} from 'svelte/store';

  import Welcome from './Welcome.svelte';
  import WidgetDescription from './WidgetDescription.svelte';
  import Counter from './Counter.svelte';
  import ErrorView from './ErrorView.svelte';
  
  export let widget;
  export let state;
  export let props;

  let reactiveState = writable(state);
  let reactiveProps = writable(props);

  setContext('widget', widget);
  setContext('props', reactiveProps);
  setContext('state', reactiveState);

  $: {
    $reactiveState = state;
    $reactiveProps = props;
  }
</script>

{#if widget.error }
  <ErrorView /> 
{/if}


{#if !widget.error }
  <div class="merkur__page">
    <div class="merkur__headline">
      <div class="merkur__view">
        <Welcome />
        <WidgetDescription name={widget.name} version={widget.version}/>
      </div>
    </div>
    <div class="merkur__view">
      <Counter />
    </div>
  </div>
{/if}