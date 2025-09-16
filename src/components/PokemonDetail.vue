<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getPokemon, getType } from '@/api/poke'
import TypeChips from '@/components/TypeChips.vue'


const props = defineProps<{ open: boolean; idOrName: string | number | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()


const loading = ref(false)
const data = ref<any>(null)
const weaknesses = ref<string[]>([])


watch(() => props.idOrName, async (val) => {
if (!val) return
loading.value = true
try {
const p = await getPokemon(val)
data.value = p
// compute weaknesses (union of double_damage_from of each type)
const typeNames = p.types.map((t: any) => t.type.name)
const sets: Set<string> = new Set()
for (const tn of typeNames) {
const tr = await getType(tn)
tr.damage_relations.double_damage_from.forEach((x) => sets.add(x.name))
}
weaknesses.value = Array.from(sets)
} finally { loading.value = false }
}, { immediate: true })


onMounted(() => {})
</script>


<template>
<v-navigation-drawer v-model="(props as any).open" location="right" width="420" temporary @update:model-value="val => { if(!val) emit('close') }">
<v-toolbar density="comfortable"><v-toolbar-title>Details</v-toolbar-title><v-spacer /><v-btn icon="mdi-close" variant="text" @click="emit('close')" /></v-toolbar>
<v-divider />
<div v-if="loading" class="pa-4"><v-skeleton-loader type="image, article"/></div>
<div v-else-if="data" class="pa-4 d-flex flex-column ga-4">
<div class="d-flex ga-4 align-center">
<v-img :src="data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default" width="160" class="sprite" />
<div>
<div class="text-h5 text-capitalize">{{ data.name }}</div>
<TypeChips :types="data.types.map((t:any)=>t.type.name)" />
<div class="text-medium-emphasis mt-2">Height: {{ (data.height/10).toFixed(1) }} m • Weight: {{ (data.weight/10).toFixed(1) }} kg</div>
</div>
</div>


<div>
<div class="text-subtitle-1 mb-2">Abilities</div>
<div class="d-flex flex-wrap ga-2">
<v-chip v-for="a in data.abilities" :key="a.ability.name" size="small" :variant="a.is_hidden ? 'outlined' : 'flat'">{{ a.ability.name }}</v-chip>
</div>
</div>


<div>
<div class="text-subtitle-1 mb-2">Base Stats</div>
<div class="d-flex flex-column ga-2">
<div v-for="s in data.stats" :key="s.stat.name" class="d-flex align-center ga-3">
<div style="width:100px;text-transform:capitalize">{{ s.stat.name }}</div>
<v-progress-linear :model-value="s.base_stat" max="200" height="12" rounded></v-progress-linear>
<div style="width:32px" class="text-right">{{ s.base_stat }}</div>
</div>
</div>
</div>


<div>
<div class="text-subtitle-1 mb-2">Weak to</div>
<div class="d-flex flex-wrap ga-2">
<v-chip v-for="w in weaknesses" :key="w" class="poke-type-chip" color="error" variant="tonal">{{ w }}</v-chip>
</div>
</div>
</div>
</v-navigation-drawer>
</template>