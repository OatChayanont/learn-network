<script lang="ts">
  let { octetValue, binaryString, label, prefix = 0, octetIndex = 0, isMask = false } = $props<{
    octetValue: number;
    binaryString: string;
    label: string;
    prefix?: number;
    octetIndex?: number;
    isMask?: boolean;
  }>();
</script>

<div class="octet-block">
  <div class="octet-label text-mono">
    <span class="muted">{label} {octetIndex > 0 ? `· ` : ''}</span> 
    {#if octetIndex > 0}
      <span class="val">{octetValue}</span>
    {/if}
  </div>
  <div class="bits-row">
    {#each Array.from(binaryString) as bit, i}
      {@const globalBitIndex = (octetIndex - 1) * 8 + i}
      {@const isNetwork = !isMask && prefix > 0 && globalBitIndex < prefix}
      {@const isHost = !isMask && prefix > 0 && globalBitIndex >= prefix}
      {@const isMaskNetwork = isMask && bit === '1'}
      
      <div 
        class="bit text-mono" 
        class:network={isNetwork || isMaskNetwork} 
        class:host={isHost}
      >
        <div class="slot-slider" class:is-one={bit === '1'}>
          <span class="bit-zero">0</span>
          <span class="bit-one">1</span>
        </div>
      </div>
    {/each}
  </div>
  {#if !isMask && octetIndex > 0}
    <div class="bits-index-row">
      {#each Array(8) as _, i}
        <div class="bit-index text-mono">
           {(octetIndex - 1) * 8 + i + 1}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .octet-block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .octet-label {
    font-size: 0.85rem;
    text-align: center;
  }
  .muted {
    color: var(--text-muted);
  }
  .val {
    color: var(--text-main);
    font-weight: 600;
  }
  .bits-row {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
  }
  .bits-index-row {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
  }
  .bit {
    width: 1.75rem;
    height: 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-size: 0.9rem;
    border: 1px solid var(--card-border);
    border-radius: 4px;
    background: var(--bg-card);
    transition: all 0.3s ease-in-out;
    overflow: hidden;
  }
  
  .slot-slider {
    display: flex;
    flex-direction: column;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: translateY(0);
  }
  
  .slot-slider.is-one {
    transform: translateY(-50%);
  }
  
  .slot-slider span {
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .bit-zero {
    color: var(--bit-zero-color);
  }
  
  .bit-one {
    color: var(--bit-one-color);
  }
  
  .bit-index {
    width: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    color: var(--text-muted);
  }
  
  .bit.network {
    background: var(--network-bit-bg);
    border-color: var(--network-bit-border);
    color: var(--network-bit-border);
    font-weight: 600;
  }
  
  .bit.host {
    background: var(--host-bit-bg);
    border-color: var(--host-bit-border);
    color: var(--host-bit-border);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .bit {
      width: 1.25rem;
      height: 1.5rem;
      font-size: 0.75rem;
    }
    .slot-slider span {
      height: 1.5rem;
    }
    .bit-index {
      width: 1.25rem;
      font-size: 0.5rem;
    }
  }
</style>
