<script setup lang="ts">
import { typeColor } from '@/utils/typeColors'
const props = defineProps<{ types: string[] }>()
</script>


<template>
<div class="d-flex flex-wrap ga-2">
<v-chip v-for="t in props.types" :key="t" class="poke-type-chip" :style="{ background: typeColor(t), color: 'white' }" size="small" variant="flat">{{ t }}</v-chip>
</div>
</template>