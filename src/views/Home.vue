<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFavorites } from '@/stores/favorites'

import { listPokemon, getPokemon, getAllTypes } from '@/api/poke'

import PokemonCard from '@/components/PokemonCard.vue'
import PokemonDetail from '@/components/PokemonDetail.vue'
import TypeChips from '@/components/TypeChips.vue'

const store = useFavorites()

const items = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')

const allTypes = ref<string[]>([])              // ✅ 문자열 배열로 원복
const type = ref<string | null>(null)           // ✅ 값 자체가 영문 타입명

const drawerOpen = ref(false)
const selected = ref<string | number | null>(null)

let offset = 0
const limit = 24

async function loadMore(reset = false) {
  try {
    loading.value = true
    error.value = null
    if (reset) { items.value = []; offset = 0 }

    // 🔎 검색(영문 이름 or 숫자 ID만)
    if (search.value.trim()) {
      try {
        const p = await getPokemon(search.value.trim().toLowerCase())
        items.value = [p]
        return
      } catch {
        error.value = 'No Pokémon found.'
        items.value = []
        return
      }
    }

    // 🏷️ 타입 필터 모드 (영문 타입명 그대로 사용)
    if (type.value) {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type.value}`)
      const tjson: any = await res.json()
      const names: string[] = tjson.pokemon.map((p: any) => p.pokemon.name)
      const slice = names.slice(offset, offset + limit)
      const detailed = await Promise.all(slice.map(n => getPokemon(n)))
      items.value.push(...detailed)
      offset += limit
      return
    }

    // 📄 기본 리스트
    const list = await listPokemon(offset, limit)
    const detailed = await Promise.all(list.results.map(r => getPokemon(r.name)))
    items.value.push(...detailed)
    offset += limit
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load Pokémon.'
  } finally {
    loading.value = false
  }
}

function openDetail(p: any) {
  selected.value = p.name   // ✅ 영문 이름으로 열어도 OK (id 사용 원하면 p.id)
  drawerOpen.value = true
}

const hasMore = computed(() => !search.value)

onMounted(async () => {
  store.load()
  allTypes.value = await getAllTypes()   // ✅ Ko 버전 대신 원래 함수
  loadMore(true)
})
</script>

<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <v-card elevation="2" rounded="xl" class="pa-3">
      <div class="d-flex flex-wrap align-center ga-3">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search by name or ID"
          density="comfortable"
          hide-details
          clearable
          @keyup.enter="loadMore(true)"
          style="max-width:360px"
        />

        <v-select
          v-model="type"
          :items="allTypes" 
          label="Filter by type"
          density="comfortable"
          hide-details
          clearable
          style="max-width:220px"
          @update:model-value="() => loadMore(true)"
        />

        <TypeChips v-if="type" :types="[type]" />

        <v-spacer />
        <v-btn prepend-icon="mdi-refresh" @click="() => loadMore(true)">Refresh</v-btn>
      </div>
    </v-card>

    <div v-if="error" class="text-error">{{ error }}</div>

    <v-container fluid>
      <v-row>
        <v-col v-for="p in items" :key="p.id" cols="12" sm="6" md="4" lg="3">
          <PokemonCard
            :id="p.id"
            :name="p.name"
            :sprite="p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default"
            :types="p.types.map((t:any)=>t.type.name)"
            :favorite="store.has(p.id)"
          >
            <template #actions>
              <v-btn
                variant="text"
                :icon="store.has(p.id) ? 'mdi-heart' : 'mdi-heart-outline'"
                @click="store.toggle(p.id)"
              />
              <v-spacer />
              <v-btn
                variant="tonal"
                color="primary"
                append-icon="mdi-chevron-right"
                @click="openDetail(p)"
              >
                Details
              </v-btn>
            </template>
          </PokemonCard>
        </v-col>
      </v-row>

      <div class="d-flex justify-center my-6" v-if="hasMore">
        <v-btn :loading="loading" @click="loadMore()" size="large" prepend-icon="mdi-chevron-down">
          Load more
        </v-btn>
      </div>

      <div v-if="loading && items.length === 0" class="pa-6">
        <v-skeleton-loader type="image, image, image, article" />
      </div>
    </v-container>

    <PokemonDetail :open="drawerOpen" :id-or-name="selected" @close="drawerOpen=false" />
  </div>
</template>
