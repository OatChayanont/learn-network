<script lang="ts">
  import '../app.css';
  import { locale, t } from '$lib/i18n';
  import { onMount, type Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let theme = $state('light');

  onMount(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
  });

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleLang() {
    $locale = $locale === 'th' ? 'en' : 'th';
  }
</script>

<svelte:head>
  <title>{$t('app.title')}</title>
  <meta name="description" content="{$t('app.subtitle')}" />
</svelte:head>

<div class="app-wrapper">
  <header>
    <div class="logo">
      <span class="icon">🌐</span>
      <div>
        <h1>{$t('app.title')}</h1>
        <p class="subtitle">{$t('app.subtitle')}</p>
      </div>
    </div>
    <div class="actions">
      <button onclick={toggleTheme} class="theme-btn" aria-label="Toggle Theme">
        {#if theme === 'light'} 🌙 {:else} ☀️ {/if}
      </button>
      <button onclick={toggleLang} class="lang-btn">
        {$locale === 'th' ? 'EN' : 'TH'}
      </button>
    </div>
  </header>

  <main>
    {@render children()}
  </main>
</div>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--bg-card);
    border-bottom: 1px solid var(--card-border);
    box-shadow: var(--shadow-sm);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--primary-color);
  }
  
  .subtitle {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
  }

  .icon {
    font-size: 1.5rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  button {
    background: transparent;
    border: 1px solid var(--card-border);
    color: var(--text-main);
    padding: 0.4rem 0.6rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    font-family: inherit;
  }

  button:hover {
    background: var(--bg-body);
    border-color: var(--primary-color);
  }

  main {
    min-height: calc(100vh - 76px);
  }
  
  @media (max-width: 640px) {
    header {
      padding: 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .actions {
      align-self: flex-end;
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
