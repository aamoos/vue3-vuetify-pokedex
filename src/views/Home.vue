<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFavorites } from '@/stores/favorites'

// ⬇️ Ko 버전 API 사용: getAllTypesKo, getPokemonWithKo
import { listPokemon, getPokemonWithKo, getAllTypesKo } from '@/api/poke'

import PokemonCard from '@/components/PokemonCard.vue'
import PokemonDetail from '@/components/PokemonDetail.vue'
import TypeChips from '@/components/TypeChips.vue'

const store = useFavorites()

const items = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')

// ⬇️ 타입 셀렉트는 [{title: ko, value: en}] 구조로 사용
const allTypes = ref<{ title: string; value: string }[]>([])
const type = ref<string | null>(null) // value는 영문(en) 유지 (API /type/{en} 호출용)

const drawerOpen = ref(false)
const selected = ref<number | null>(null) // 상세는 id로 열기

let offset = 0
const limit = 24

async function loadMore(reset = false) {
  try {
    loading.value = true
    error.value = null
    if (reset) { items.value = []; offset = 0 }

    // 🔎 검색 우선 (Ko 버전)
    if (search.value.trim()) {
      try {
        const p = await getPokemonWithKo(search.value.trim().toLowerCase())
        items.value = [p]
        return
      } catch {
        error.value = '포켓몬을 찾을 수 없습니다.'
        items.value = []
        return
      }
    }

    // 🏷️ 타입 필터 모드 (값은 영문)
    if (type.value) {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type.value}`)
      const tjson: any = await res.json()
      const names: string[] = tjson.pokemon.map((p: any) => p.pokemon.name)
      const slice = names.slice(offset, offset + limit)
      const detailed = await Promise.all(slice.map(n => getPokemonWithKo(n)))
      items.value.push(...detailed)
      offset += limit
      return
    }

    // 📄 기본 리스트 모드
    const list = await listPokemon(offset, limit)
    const detailed = await Promise.all(list.results.map(r => getPokemonWithKo(r.name)))
    items.value.push(...detailed)
    offset += limit
  } catch (e: any) {
    error.value = e?.message ?? '로딩에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

function openDetail(p: any) {
  selected.value = p.id   // ⬅️ id로 넘겨주세요 (한글/영문 혼선 방지)
  drawerOpen.value = true
}

// 검색 중에는 더보기 숨김
const hasMore = computed(() => !search.value)

onMounted(async () => {
  store.load()
  const typesKo = await getAllTypesKo()
  // Vuetify v-select는 객체를 넣으면 title/value를 자동으로 사용함
  allTypes.value = typesKo.map(t => ({ title: t.ko, value: t.en }))
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
          label="포켓몬 이름 또는 번호로 검색"
          density="comfortable"
          hide-details
          clearable
          @keyup.enter="loadMore(true)"
          style="max-width:360px"
        />

        <v-select
          v-model="type"
          :items="allTypes"
          label="타입으로 필터"
          density="comfortable"
          hide-details
          clearable
          style="max-width:220px"
          @update:model-value="() => loadMore(true)"
        />

        <!-- 현재 선택된 타입 한글 라벨 표시 -->
        <TypeChips v-if="type" :types="[allTypes.find(t => t.value === type)?.title || type]" />

        <v-spacer />
        <v-btn prepend-icon="mdi-refresh" @click="() => loadMore(true)">새로고침</v-btn>
      </div>
    </v-card>

    <div v-if="error" class="text-error">{{ error }}</div>

    <v-container fluid>
      <v-row>
        <v-col v-for="p in items" :key="p.id" cols="12" sm="6" md="4" lg="3">
          <PokemonCard
            :id="p.id"
            :name="p.displayName || p.name"
            :sprite="p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default"
            :types="p.displayTypes?.length ? p.displayTypes : p.types.map((t:any)=>t.type.name)"
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
                상세보기
              </v-btn>
            </template>
          </PokemonCard>
        </v-col>
      </v-row>

      <div class="d-flex justify-center my-6" v-if="hasMore">
        <v-btn :loading="loading" @click="loadMore()" size="large" prepend-icon="mdi-chevron-down">
          더 불러오기
        </v-btn>
      </div>

      <div v-if="loading && items.length === 0" class="pa-6">
        <v-skeleton-loader type="image, image, image, article" />
      </div>
    </v-container>

    <PokemonDetail :open="drawerOpen" :id-or-name="selected" @close="drawerOpen=false" />
  </div>
</template>
