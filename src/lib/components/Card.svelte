<script lang="ts">
  let { title, value, subtext = '' } = $props<{
    title: string;
    value: string;
    subtext?: string;
  }>();
</script>

<div class="card">
  <div class="card-title">{title}</div>
  <div class="card-value text-mono">{value}</div>
  {#if subtext}
    <div class="card-subtext text-mono">{subtext}</div>
  {/if}
</div>

<style>
  .card-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }
  .card-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-main);
  }
  .card-subtext {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }
</style>
