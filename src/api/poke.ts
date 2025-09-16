import axios from 'axios'
import type { PokemonListRes, Pokemon, TypeRes } from '@/types/pokemon'


const api = axios.create({ baseURL: 'https://pokeapi.co/api/v2' })


export async function listPokemon(offset = 0, limit = 24) {
const { data } = await api.get<PokemonListRes>(`/pokemon`, { params: { offset, limit } })
return data
}


export async function getPokemon(nameOrId: string | number) {
const { data } = await api.get<Pokemon>(`/pokemon/${nameOrId}`)
return data
}


export async function getAllTypes() {
const { data } = await api.get<{ results: { name: string; url: string }[] }>(`/type`)
// filter out non-normal types like 'unknown', 'shadow' if present
return data.results.map(r => r.name).filter(n => !['unknown', 'shadow'].includes(n))
}


export async function getType(name: string) {
const { data } = await api.get<TypeRes>(`/type/${name}`)
return data
}