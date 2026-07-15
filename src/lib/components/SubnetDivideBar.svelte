<script lang="ts">
  import { t } from '$lib/i18n';
  import { calculateSubnet, getSubnetAtIndex } from '$lib/functions/subnetCalculator';

  let { baseNetwork, basePrefix }: { baseNetwork: string; basePrefix: number } = $props();

  // Drill-down path; empty = viewing the base subnet from props
  let stack = $state<{ network: string; prefix: number }[]>([]);
  // Extra bits to divide by (1 => 2 subnets, 8 => 256 subnets)
  let targetOffset = $state(1);
  let hoveredIndex = $state<number | null>(null);

  // Reset drill-down when the page inputs change the base subnet
  let lastBase = $state('');
  $effect(() => {
    const key = `${baseNetwork}/${basePrefix}`;
    if (lastBase !== key) {
      lastBase = key;
      stack = [];
      targetOffset = 1;
      hoveredIndex = null;
    }
  });

  let current = $derived(stack.at(-1) ?? { network: baseNetwork, prefix: basePrefix });
  let maxOffset = $derived(Math.min(8, 32 - current.prefix));
  let clampedOffset = $derived(Math.min(Math.max(targetOffset, 1), Math.max(maxOffset, 1)));
  let segmentCount = $derived(maxOffset === 0 ? 0 : 2 ** clampedOffset);

  let segments = $derived.by(() => {
    if (segmentCount === 0) return [];
    return Array.from({ length: segmentCount }, (_, i) => {
      const cidr = getSubnetAtIndex(current.network, current.prefix + clampedOffset, i);
      const [net, pfx] = cidr.split('/');
      return { cidr, network: net, prefix: Number(pfx) };
    });
  });

  let breadcrumb = $derived([{ network: baseNetwork, prefix: basePrefix }, ...stack]);

  let panelDetails = $derived.by(() => {
    const hovered = hoveredIndex !== null ? segments[hoveredIndex] : null;
    return hovered
      ? calculateSubnet(hovered.network, hovered.prefix)
      : calculateSubnet(current.network, current.prefix);
  });

  function drill(i: number) {
    const seg = segments[i];
    if (!seg || seg.prefix >= 32) return;
    stack = [...stack, { network: seg.network, prefix: seg.prefix }];
    hoveredIndex = null;
  }

  function goTo(i: number) {
    stack = stack.slice(0, i);
    hoveredIndex = null;
  }
</script>

<div class="divide-section">
  <div class="divide-title">{$t('divide.title')}</div>
  <div class="divide-desc">
    {$t('divide.desc', { network: current.network, prefix: current.prefix })}
  </div>

  <div class="crumbs">
    {#each breadcrumb as crumb, i}
      {#if i > 0}<span class="crumb-sep">&rarr;</span>{/if}
      <button
        class="crumb text-mono"
        class:crumb-active={i === breadcrumb.length - 1}
        disabled={i === breadcrumb.length - 1}
        onclick={() => goTo(i)}
      >
        {crumb.network}/{crumb.prefix}
      </button>
    {/each}
  </div>

  {#if maxOffset === 0}
    <div class="nothing-msg">{$t('divide.nothing_to_divide', { prefix: current.prefix })}</div>
  {:else}
    <div class="controls">
      <label class="control-label" for="divide-target">{$t('divide.target_label')}</label>
      <select id="divide-target" class="target-select text-mono" bind:value={targetOffset}>
        {#each Array(maxOffset) as _, k}
          <option value={k + 1}>
            {$t('divide.option', {
              prefix: current.prefix + k + 1,
              count: (2 ** (k + 1)).toLocaleString()
            })}
          </option>
        {/each}
      </select>
      <span class="count-caption text-mono">
        {segmentCount.toLocaleString()} &times; /{current.prefix + clampedOffset}
      </span>
    </div>

    <div class="bar" role="group" onmouseleave={() => (hoveredIndex = null)}>
      {#each segments as seg, i}
        <button
          class="segment text-mono"
          class:hovered={hoveredIndex === i}
          class:leaf={seg.prefix >= 32}
          onmouseenter={() => (hoveredIndex = i)}
          onfocus={() => (hoveredIndex = i)}
          onclick={() => drill(i)}
          title={seg.cidr}
        >
          {#if segmentCount <= 8}
            {seg.cidr}
          {:else if segmentCount <= 16}
            {seg.network}
          {/if}
        </button>
      {/each}
    </div>

    <div class="hint">
      {$t('divide.hover_prompt')} &middot; {$t('divide.click_hint')} &middot; {$t('divide.cap_hint')}
    </div>

    {#if panelDetails}
      <div class="panel">
        <div class="panel-item">
          <span class="panel-label">{$t('divide.panel.network')}</span>
          <span class="panel-value text-mono">{panelDetails.networkAddress}/{panelDetails.prefix}</span>
        </div>
        <div class="panel-item">
          <span class="panel-label">{$t('divide.panel.broadcast')}</span>
          <span class="panel-value text-mono">{panelDetails.broadcastAddress}</span>
        </div>
        <div class="panel-item">
          <span class="panel-label">{$t('divide.panel.range')}</span>
          <span class="panel-value text-mono">{panelDetails.firstHost} &ndash; {panelDetails.lastHost}</span>
        </div>
        <div class="panel-item">
          <span class="panel-label">{$t('divide.panel.hosts')}</span>
          <span class="panel-value text-mono">{panelDetails.usableHosts.toLocaleString()}</span>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .divide-section {
    background: var(--bg-card);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-top: 2rem;
  }
  .divide-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .divide-desc {
    font-size: 0.85rem;
    color: var(--text-main);
    margin-bottom: 1rem;
  }

  .crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .crumb {
    padding: 0.4rem 0.75rem;
    background: var(--bg-body);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    font-size: 0.85rem;
    color: var(--text-main);
    cursor: pointer;
  }
  .crumb:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  .crumb-active {
    background: var(--network-bit-bg);
    border-color: var(--network-bit-border);
    color: var(--network-bit-border);
    cursor: default;
  }
  .crumb-sep {
    color: var(--text-muted);
  }

  .controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .control-label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .target-select {
    background: var(--bg-body);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
    color: var(--primary-color);
    cursor: pointer;
    outline: none;
  }
  .count-caption {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .bar {
    display: flex;
    width: 100%;
    height: 56px;
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .segment {
    flex: 1 1 0;
    min-width: 0;
    border: none;
    border-right: 1px solid var(--card-border);
    background: var(--bg-body);
    color: var(--text-main);
    font-size: 0.7rem;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .segment:last-child {
    border-right: none;
  }
  .segment:nth-child(even) {
    background: var(--network-bit-bg);
  }
  .segment.hovered {
    background: var(--primary-color);
    color: #fff;
  }
  .segment:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .segment.leaf {
    cursor: default;
  }

  .hint {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
  }

  .panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bg-body);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
  }
  .panel-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .panel-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }
  .panel-value {
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nothing-msg {
    font-size: 0.85rem;
    color: var(--text-muted);
    padding: 1rem;
    background: var(--bg-body);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
  }
</style>
