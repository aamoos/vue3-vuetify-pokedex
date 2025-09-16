// src/api/poke.ts
import axios from 'axios'
import type { PokemonListRes, Pokemon, TypeRes } from '@/types/pokemon'

const api = axios.create({ baseURL: 'https://pokeapi.co/api/v2' })

/** 기존: 그대로 둡니다 **/
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
    return data.results.map(r => r.name).filter(n => !['unknown', 'shadow'].includes(n))
}

export async function getType(name: string) {
    const { data } = await api.get<TypeRes>(`/type/${name}`)
    return data
}

/* ------------------------------ */
/* 👇 여기부터 “한글화” 보조 함수 추가 */
/* ------------------------------ */

// 공통: names 배열에서 ko(한국어) 우선 반환, 없으면 en, 그래도 없으면 원문
function pickLocalizedName(
    names: { language: { name: string }; name: string }[],
    fallback?: string
) {
    const ko = names.find(n => n.language?.name === 'ko')?.name
    if (ko) return ko
    const en = names.find(n => n.language?.name === 'en')?.name
    if (en) return en
    return fallback ?? names[0]?.name
}

// 1) 포켓몬 종(species)에서 한글 이름/설명 가져오기
export async function getPokemonSpecies(nameOrId: string | number) {
    const { data } = await api.get<any>(`/pokemon-species/${nameOrId}`)
    return data
}

export async function getPokemonKoName(nameOrId: string | number) {
    const sp = await getPokemonSpecies(nameOrId)
    return pickLocalizedName(sp.names, sp.name) // ko → en → fallback
}

export async function getPokemonKoFlavor(nameOrId: string | number) {
    const sp = await getPokemonSpecies(nameOrId)
    const ko = sp.flavor_text_entries?.find((e: any) => e.language?.name === 'ko')?.flavor_text
    // 개행/특수 공백 정리
    return ko ? String(ko).replace(/\s+/g, ' ').trim() : ''
}

// 2) 타입/특성 한글 이름
export async function getTypeKoName(typeNameOrId: string | number) {
    const { data } = await api.get<any>(`/type/${typeNameOrId}`)
    return pickLocalizedName(data.names, data.name)
}

export async function getAbilityKoName(abilityNameOrId: string | number) {
    const { data } = await api.get<any>(`/ability/${abilityNameOrId}`)
    return pickLocalizedName(data.names, data.name)
}

// 3) 통합: 포켓몬 + 한국어 표시 필드까지 합쳐서 반환
export async function getPokemonWithKo(nameOrId: string | number) {
    const p = await getPokemon(nameOrId)
    const [koName, flavor] = await Promise.all([
        getPokemonKoName(p.id),
        getPokemonKoFlavor(p.id),
    ])

    // 타입/특성 한글 이름 배열
    const koTypes = await Promise.all(
        p.types.map(t => getTypeKoName(t.type.name))
    )
    const koAbilities = await Promise.all(
        p.abilities.map(a => getAbilityKoName(a.ability.name))
    )

    return {
        ...p,
        displayName: koName,          // ✅ 한글 이름(없으면 영문)
        displayTypes: koTypes,        // ✅ 한글 타입명 배열
        displayAbilities: koAbilities,// ✅ 한글 특성명 배열
        flavorKo: flavor,             // ✅ 한글 설명(있으면)
    }
}

// 4) 타입 목록도 한글 버전이 필요하면 별도 제공
export async function getAllTypesKo() {
    const { data } = await api.get<any>(`/type`)
    const list = data.results.filter((r: any) => !['unknown', 'shadow'].includes(r.name))
    // 병렬로 ko 이름 가져오기
    const enriched = await Promise.all(
        list.map(async (r: any) => {
            const { data: t } = await api.get<any>(r.url)
            return {
                en: r.name,
                ko: pickLocalizedName(t.names, r.name),
            }
        })
    )
    return enriched // e.g., [{en: 'fire', ko: '불꽃'}, ...]
}
