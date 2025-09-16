export type PokeType =
    | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
    | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic'
    | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'


export interface NamedAPIResource { name: string; url: string }


export interface PokemonListRes { count: number; next: string | null; previous: string | null; results: NamedAPIResource[] }


export interface Pokemon {
    id: number
    name: string
    sprites: {
        front_default: string | null
        other?: { ['official-artwork']?: { front_default: string | null } }
    }
    types: { slot: number; type: NamedAPIResource }[]
    height: number
    weight: number
    abilities: { ability: NamedAPIResource; is_hidden: boolean }[]
    stats: { base_stat: number; effort: number; stat: NamedAPIResource }[]
}


export interface TypeRes {
    damage_relations: {
        double_damage_from: NamedAPIResource[]
        double_damage_to: NamedAPIResource[]
        half_damage_from: NamedAPIResource[]
        half_damage_to: NamedAPIResource[]
        no_damage_from: NamedAPIResource[]
        no_damage_to: NamedAPIResource[]
    }
}