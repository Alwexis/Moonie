export async function fetchPokemonList(offset: number = 0, limit: number = 30) {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  try {
    const res = await fetch(url);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch pokemon list:", error);
    return null;
  }
}

export async function fetchPokemon(url: string) {
  try {
    const res = await fetch(url);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch pokemon:`, error);
    return null;
  }
}

export async function fetchPokemonById(id: number) {
  return fetchPokemon(`https://pokeapi.co/api/v2/pokemon/${id}/`);
}

export async function fetchSpecies(url: string) {
  try {
    const res = await fetch(url);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch pokemon species:`, error);
    return null;
  }
}

export async function fetchSpecieById(id: number) {
  return fetchSpecies(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
}

export async function fetchPokemonListComplete(
  offset: number = 0,
  limit: number = 30,
) {
  const listData = await fetchPokemonList(offset, limit);
  if (!listData) return null;
  const pokemon = await Promise.all(
    listData.results.map((p: { name: string; url: string }) => {
      return fetchPokemon(p.url);
    }),
  );
  return pokemon.filter((p) => p !== null);
}
