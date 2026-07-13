<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { MOBILE_NAVIGATION_ITEMS, NAVIGATION_ITEMS } from '@/constants/navigation'
</script>

<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar" aria-label="Main navigation">
      <RouterLink class="brand" to="/dashboard">
        <span class="brand__mark">MPJ</span>
        <span>
          <strong>My Performance Journal</strong>
          <small>Powered by Performance Intelligence</small>
        </span>
      </RouterLink>

      <nav class="desktop-nav">
        <div
          v-for="group in ['Overview', 'Input', 'Performance', 'System']"
          :key="group"
          class="nav-group"
        >
          <p>{{ group }}</p>
          <RouterLink
            v-for="item in NAVIGATION_ITEMS.filter((navItem) => navItem.group === group)"
            :key="item.to"
            :to="item.to"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
    </aside>

    <div class="app-shell__content">
      <RouterView />
    </div>

    <nav class="mobile-nav" aria-label="Mobile navigation">
      <RouterLink v-for="item in MOBILE_NAVIGATION_ITEMS" :key="item.to" :to="item.to">
        <span aria-hidden="true">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  display: flex;
  width: var(--nav-width);
  flex-direction: column;
  gap: var(--space-8);
  border-right: 1px solid var(--color-border);
  background: rgba(8, 16, 17, 0.92);
  padding: var(--space-6);
}

.app-shell__content {
  min-width: 0;
  padding-left: var(--nav-width);
}

.brand {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  color: var(--color-text);
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #041210;
  font-weight: 900;
}

.brand strong,
.brand small {
  display: block;
}

.brand small,
.nav-group p {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.desktop-nav {
  display: grid;
  gap: var(--space-5);
}

.nav-group {
  display: grid;
  gap: var(--space-2);
}

.nav-group p {
  margin: 0;
  text-transform: uppercase;
}

.nav-group a,
.mobile-nav a {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 800;
  padding: 0.65rem 0.75rem;
  text-decoration: none;
}

.nav-group a.router-link-active,
.mobile-nav a.router-link-active {
  background: rgba(53, 210, 164, 0.12);
  color: var(--color-text);
}

.mobile-nav {
  position: fixed;
  z-index: 10;
  right: var(--space-3);
  bottom: var(--space-3);
  left: var(--space-3);
  display: none;
  grid-template-columns: repeat(5, 1fr);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(8, 16, 17, 0.94);
  padding: var(--space-2);
}

.mobile-nav a {
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  padding: var(--space-2);
  text-align: center;
}

@media (max-width: 960px) {
  .app-shell__sidebar {
    display: none;
  }

  .app-shell__content {
    padding-left: 0;
  }

  .mobile-nav {
    display: grid;
  }
}
</style>
