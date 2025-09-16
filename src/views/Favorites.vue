<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFavorites } from '@/stores/favorites'
import { getPokemon } from '@/api/poke'
import PokemonCard from '@/components/PokemonCard.vue'

const store = useFavorites()
const items = ref<any[]>([])
const loading = ref(false)

async function loadFavorites() {
  loading.value = true
  try {
    store.load()
    items.value = await Promise.all(store.ids.map(id => getPokemon(id)))  // ✅ 영문
  } finally {
    loading.value = false
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <div class="d-flex align-center">
      <div class="text-h5">My Favorites</div>
      <v-spacer />
      <v-btn prepend-icon="mdi-refresh" :loading="loading" @click="loadFavorites">Refresh</v-btn>
    </div>

    <v-alert v-if="!loading && items.length === 0" type="info" variant="tonal" border="start" class="mt-2">
      No favorites yet. Tap the heart icon to add some!
    </v-alert>

    <v-row v-else>
      <v-col v-for="p in items" :key="p.id" cols="12" sm="6" md="4" lg="3">
        <PokemonCard
          :id="p.id"
          :name="p.name"
          :sprite="p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default"
          :types="p.types.map((t:any)=>t.type.name)"
          :favorite="true"
        >
          <template #actions>
            <v-btn
              variant="text"
              icon="mdi-heart"
              @click="() => { store.toggle(p.id); loadFavorites(); }"
            />
          </template>
        </PokemonCard>
      </v-col>
    </v-row>
  </div>
</template>
