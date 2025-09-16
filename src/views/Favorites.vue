<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFavorites } from '@/stores/favorites'
import { getPokemonWithKo } from '@/api/poke'
import PokemonCard from '@/components/PokemonCard.vue'

const store = useFavorites()
const items = ref<any[]>([])
const loading = ref(false)

async function loadFavorites() {
  loading.value = true
  try {
    store.load()
    items.value = await Promise.all(store.ids.map(id => getPokemonWithKo(id)))
  } finally {
    loading.value = false
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <div class="d-flex align-center">
      <div class="text-h5">나의 즐겨찾기</div>
      <v-spacer />
      <v-btn prepend-icon="mdi-refresh" :loading="loading" @click="loadFavorites">새로고침</v-btn>
    </div>

    <v-alert v-if="!loading && items.length === 0" type="info" variant="tonal" border="start" class="mt-2">
      아직 즐겨찾기한 포켓몬이 없어요. 하트 아이콘을 눌러 추가해보세요!
    </v-alert>

    <v-row v-else>
      <v-col v-for="p in items" :key="p.id" cols="12" sm="6" md="4" lg="3">
        <PokemonCard
          :id="p.id"
          :name="p.displayName || p.name" 
          :sprite="p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default"
          :types="p.displayTypes?.length ? p.displayTypes : p.types.map((t:any)=>t.type.name)"
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