<script lang="ts">
  let { totalItems = 0, itemsPerPage = 100, children } = $props<{
    totalItems?: number;
    itemsPerPage?: number;
    children?: import('svelte').Snippet<[{ startIndex: number, endIndex: number }]>;
  }>();

  let currentPage = $state(1);

  // If totalItems changes, make sure currentPage isn't out of bounds
  $effect(() => {
    const maxPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage > maxPage) {
      currentPage = maxPage;
    }
  });

  let totalPages = $derived(Math.ceil(totalItems / itemsPerPage) || 1);
  let startIndex = $derived((currentPage - 1) * itemsPerPage);
  let endIndex = $derived(Math.min(startIndex + itemsPerPage, totalItems));

  function next() { if (currentPage < totalPages) currentPage++; }
  function prev() { if (currentPage > 1) currentPage--; }
  function first() { currentPage = 1; }
  function last() { currentPage = totalPages; }
</script>

<div class="paginated-list">
  {#if children}
    {@render children({ startIndex, endIndex })}
  {/if}

  {#if totalPages > 1}
    <div class="pagination">
      <button onclick={first} disabled={currentPage === 1} class="page-btn text-mono text-xl" title="First Page">&laquo;</button>
      <button onclick={prev} disabled={currentPage === 1} class="page-btn text-mono text-xl" title="Previous Page">&lsaquo;</button>
      <div class="page-info text-mono text-sm">
        {currentPage.toLocaleString()} / {totalPages.toLocaleString()}
      </div>
      <button onclick={next} disabled={currentPage === totalPages} class="page-btn text-mono text-xl" title="Next Page">&rsaquo;</button>
      <button onclick={last} disabled={currentPage === totalPages} class="page-btn text-mono text-xl" title="Last Page">&raquo;</button>
    </div>
  {/if}
</div>

<style>
  .paginated-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius);
  }

  .page-btn {
    background: transparent;
    color: var(--network-bit-border);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .page-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.1);
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-info {
    margin: 0 1rem;
    color: var(--text-color);
  }
</style>
