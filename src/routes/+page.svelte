<script lang="ts">
  import { t } from '$lib/i18n';
  import { calculateSubnet } from '$lib/functions/subnetCalculator';
  import Card from '$lib/components/Card.svelte';
  import BinaryBlock from '$lib/components/BinaryBlock.svelte';

  let ipInput = $state('10.0.0.1');
  let prefixInput = $state('8');
  
  // Keep track of the last valid result
  let validSubnetResult = $state(calculateSubnet('10.0.0.1', 8));
  let isValid = $state(true);

  // Update only when input yields a valid subnet
  $effect(() => {
    const res = calculateSubnet(ipInput, parseInt(prefixInput, 10));
    if (res !== null) {
      isValid = true;
      validSubnetResult = res;
    } else {
      isValid = false;
    }
  });

  let lastValidSubnetStr = $state('');
  let updateAnimClass = $state('');

  $effect(() => {
    if (isValid && validSubnetResult) {
      const currentSubnetStr = `${validSubnetResult.networkAddress}/${validSubnetResult.prefix}`;
      if (lastValidSubnetStr !== currentSubnetStr) {
        lastValidSubnetStr = currentSubnetStr;
        // Trigger reflow and replay animation
        updateAnimClass = '';
        setTimeout(() => {
          updateAnimClass = 'slide-bg';
        }, 10);
      }
    }
  });

  let membersList = $derived.by(() => {
    if (!validSubnetResult) return [];
    if (validSubnetResult.totalAddresses > 1024) return []; 
    
    const list = [];
    const ipToNum = (ipStr: string) => {
      const p = ipStr.split('.').map(Number);
      return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
    };
    
    const startNum = ipToNum(validSubnetResult.networkAddress);
    const endNum = ipToNum(validSubnetResult.broadcastAddress);
    
    const numToIp = (num: number) => {
        return [
            (num >>> 24) & 255,
            (num >>> 16) & 255,
            (num >>> 8) & 255,
            num & 255
        ].join('.');
    };
    
    if (endNum - startNum <= 8) {
      for(let i = startNum; i <= endNum; i++) {
        list.push(numToIp(i));
      }
    } else {
      list.push(numToIp(startNum));
      list.push(numToIp(startNum + 1));
      list.push(numToIp(startNum + 2));
      list.push('...');
      list.push(numToIp(endNum - 2));
      list.push(numToIp(endNum - 1));
      list.push(numToIp(endNum));
    }
    
    return list;
  });
</script>

<div class="container">
  <div class="input-card">
    <div class="input-label">{$t('input.label')}</div>
    <div class="input-group {updateAnimClass}">
      <input 
        type="text" 
        bind:value={ipInput} 
        class="ip-input text-mono" 
        placeholder="192.168.10.55" 
      />
      <div class="separator">/</div>
      <select bind:value={prefixInput} class="prefix-input text-mono">
        {#each Array(33) as _, i}
          <option value={i}>{i}</option>
        {/each}
      </select>
    </div>
    {#if !isValid && ipInput.length > 0}
      <div class="error-msg">{$t('error.invalid_input')}</div>
    {/if}
  </div>

  {#if validSubnetResult}
    <div class="binary-section">
      <div class="section-title">{$t('binary.title')} &mdash; {validSubnetResult.ip}/{validSubnetResult.prefix}</div>
      
      <div class="binary-grid">
        <div class="row-label">{$t('binary.ip_address')}</div>
        <div class="octets">
          {#each validSubnetResult.ipOctets as octet, i}
             <BinaryBlock 
               label={$t('binary.octet')}
               octetIndex={i + 1}
               octetValue={octet}
               binaryString={validSubnetResult.ipBinaryString.substring(i*8, (i+1)*8)}
               prefix={validSubnetResult.prefix}
             />
             {#if i < 3} <div class="dot">&#8226;</div> {/if}
          {/each}
        </div>
        
        <div class="legend">
          <div class="legend-item">
             <div class="color-box network"></div>
             <span>{$t('binary.network_prefix')} ({validSubnetResult.prefix} {$t('binary.bits')})</span>
          </div>
          <div class="legend-item">
             <div class="color-box host"></div>
             <span>{$t('binary.host_portion')} ({32 - validSubnetResult.prefix} {$t('binary.bits')})</span>
          </div>
          <div class="legend-spacer"></div>
          <div class="legend-boundary">
             {$t('binary.boundary')} {validSubnetResult.prefix}
          </div>
        </div>

        <div class="row-label mt-4">{$t('binary.subnet_mask')}</div>
        <div class="octets mask-octets">
          {#each validSubnetResult.maskOctets as octet, i}
             <BinaryBlock 
               label=""
               octetIndex={0}
               octetValue={octet}
               binaryString={validSubnetResult.maskBinaryString.substring(i*8, (i+1)*8)}
               isMask={true}
             />
             {#if i < 3} <div class="dot">&#8226;</div> {/if}
          {/each}
        </div>
      </div>
    </div>

    <div class="grid-cards">
      <Card 
        title={$t('card.network_address')} 
        value={validSubnetResult.networkAddress} 
        subtext="/{validSubnetResult.prefix}" 
      />
      <Card 
        title={$t('card.broadcast')} 
        value={validSubnetResult.broadcastAddress} 
        subtext={$t('card.desc.last_in_subnet')} 
      />
      <Card 
        title={$t('card.subnet_mask')} 
        value={validSubnetResult.subnetMask} 
        subtext={$t('card.desc.cidr', {prefix: validSubnetResult.prefix})} 
      />
      <Card 
        title={$t('card.first_host')} 
        value={validSubnetResult.firstHost} 
        subtext={$t('card.desc.first_usable')} 
      />
      <Card 
        title={$t('card.last_host')} 
        value={validSubnetResult.lastHost} 
        subtext={$t('card.desc.last_usable')} 
      />
      <Card 
        title={$t('card.usable_hosts')} 
        value={validSubnetResult.usableHosts.toLocaleString()} 
        subtext="{32 - validSubnetResult.prefix} {$t('card.desc.host_bits')}" 
      />
      <Card 
        title={$t('card.total_addresses')} 
        value={validSubnetResult.totalAddresses.toLocaleString()} 
        subtext="{32 - validSubnetResult.prefix} {$t('card.desc.host_bits')}" 
      />
      <Card 
        title={$t('card.your_ip')} 
        value={validSubnetResult.ip} 
        subtext={$t('card.desc.in_network', {network: validSubnetResult.networkAddress + '/' + validSubnetResult.prefix})} 
      />
    </div>

    <div class="members-section">
      <div class="members-title">{$t('members.title')}</div>
      <div class="members-desc">
        {$t('members.desc', { 
           count: validSubnetResult.totalAddresses.toLocaleString(), 
           start: validSubnetResult.networkAddress, 
           end: validSubnetResult.broadcastAddress 
        })}
        {#if validSubnetResult.totalAddresses > 1024}
          — <span class="muted">{$t('members.too_many')}</span>
        {/if}
      </div>
      
      <div class="members-list">
        {#each membersList as member}
           <div class="member-chip text-mono" 
             class:dots={member === '...'}
             class:member-network={member === validSubnetResult.networkAddress}
             class:member-broadcast={member === validSubnetResult.broadcastAddress}
           >
             {member}
           </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    transition: opacity 0.2s;
  }

  .input-card {
    background: var(--bg-card);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: var(--shadow-sm);
  }
  .input-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }
  .input-group {
    display: flex;
    align-items: stretch;
    background: var(--bg-body);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
    overflow: hidden;
    width: 100%;
    position: relative;
  }
  
  .input-group::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.15), transparent);
    transform: translateX(-100%);
    pointer-events: none;
  }
  
  .input-group.slide-bg::before {
    animation: slide-overlay 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes slide-overlay {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .ip-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
    color: var(--text-main);
    outline: none;
    width: 50%;
  }
  .separator {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    color: var(--text-muted);
    font-size: 1.25rem;
  }
  .prefix-input {
    border: none;
    background: transparent;
    padding: 0.75rem;
    font-size: 1.1rem;
    color: var(--primary-color);
    font-weight: 500;
    outline: none;
    cursor: pointer;
  }
  
  .error-msg {
    color: var(--error-color);
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .binary-section {
    background: var(--bg-card);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-top: 2rem;
    overflow-x: auto;
  }
  .section-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    margin-bottom: 1.5rem;
  }
  .row-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .octets {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: max-content;
  }
  .mask-octets {
    opacity: 0.8;
  }
  .dot {
    font-size: 1.5rem;
    color: var(--text-muted);
    padding: 0 0.25rem;
  }
  
  .legend {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 1rem;
    font-size: 0.8rem;
    min-width: max-content;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .color-box {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
  }
  .color-box.network { background: var(--network-bit-border); }
  .color-box.host { background: var(--host-bit-border); }
  .legend-spacer { flex: 1; }
  .legend-boundary {
    color: var(--text-muted);
  }

  .members-section {
    background: var(--bg-card);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-top: 2rem;
  }
  .members-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .members-desc {
    font-size: 0.85rem;
    color: var(--text-main);
    margin-bottom: 1rem;
  }
  .muted {
    color: var(--text-muted);
  }
  .members-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .member-chip {
    padding: 0.4rem 0.75rem;
    background: var(--bg-body);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .member-chip.dots {
    background: transparent;
    border: none;
    letter-spacing: 2px;
  }
  .member-network {
    background: var(--network-bit-bg);
    border-color: var(--network-bit-border);
    color: var(--network-bit-border);
  }
  .member-broadcast {
    background: var(--host-bit-bg);
    border-color: var(--host-bit-border);
    color: var(--host-bit-border);
  }

  @media (max-width: 640px) {
    .input-group {
      flex-direction: column;
    }
    .ip-input, .prefix-input {
      width: 100%;
      padding: 1rem;
      border-bottom: 1px solid var(--card-border);
    }
    .separator { display: none; }
    
    .legend {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>
