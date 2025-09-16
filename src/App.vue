<script setup lang="ts"></script>


<template>
<v-app>
<v-app-bar flat color="surface">
<v-container class="d-flex align-center">
<div class="text-h6">Pokédex</div>
<v-spacer />
<v-btn to="/" variant="text" prepend-icon="mdi-pokeball">Home</v-btn>
<v-btn to="/favorites" variant="text" prepend-icon="mdi-heart">Favorites</v-btn>
<a href="https://pokeapi.co" target="_blank" rel="noreferrer">
<v-btn variant="text" prepend-icon="mdi-open-in-new">PokéAPI</v-btn>
</a>
</v-container>
</v-app-bar>


<v-main>
<router-view />
</v-main>
</v-app>
</template>