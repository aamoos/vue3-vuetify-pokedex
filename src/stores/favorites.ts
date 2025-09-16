import { defineStore } from 'pinia'


export const useFavorites = defineStore('favorites', {
    state: () => ({ ids: [] as number[] }),
    getters: {
        has: (s) => (id: number) => s.ids.includes(id)
    },
    actions: {
        toggle(id: number) {
            this.ids = this.has(id) ? this.ids.filter(x => x !== id) : [...this.ids, id]
            localStorage.setItem('favorites', JSON.stringify(this.ids))
        },
        load() {
            const raw = localStorage.getItem('favorites')
            if (raw) this.ids = JSON.parse(raw)
        }
    }
})