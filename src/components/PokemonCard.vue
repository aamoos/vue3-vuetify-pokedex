<script setup lang="ts">
import { computed } from 'vue'
import TypeChips from '@/components/TypeChips.vue'


const props = defineProps<{
id: number
name: string
sprite?: string | null
types: string[]
favorite: boolean
}>()


const displayId = computed(() => `#${props.id.toString().padStart(4, '0')}`)
</script>


<template>
<v-card rounded="xl" class="h-100" elevation="2">
<v-img :src="sprite || ''" class="sprite" aspect-ratio="1" cover></v-img>
<v-card-subtitle class="text-medium-emphasis mt-2">{{ displayId }}</v-card-subtitle>
<v-card-title class="text-capitalize pb-1">{{ name }}</v-card-title>
<v-card-text class="pt-0">
<TypeChips :types="types" />
</v-card-text>
<v-card-actions>
<slot name="actions" />
</v-card-actions>
</v-card>
</template>