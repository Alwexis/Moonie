interface NamedAPIResource {
  name: string;
  url: string;
}

interface EvolutionDetail {
  min_level: number | null;
  min_happiness: number | null;
  item: NamedAPIResource | null;
  trigger: NamedAPIResource;
}

export interface EvolutionChainNode {
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainNode[];
}

export interface ParsedEvolution {
  id: number;
  method?: string; // Opcional, ausente en la última evolución
  level?: number; // Opcional
}

const extractIdFromUrl = (url: string): number => {
  const parts = url.split("/").filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

export const parseEvolutionChain = (
  chainNode: EvolutionChainNode,
): ParsedEvolution[] => {
  const results: ParsedEvolution[] = [];

  const traverse = (node: EvolutionChainNode) => {
    const id = extractIdFromUrl(node.species.url);
    const parsedObj: ParsedEvolution = { id };

    if (node.evolves_to.length > 0) {
      const nextEvolution = node.evolves_to[0];
      const details = nextEvolution.evolution_details[0];

      if (details) {
        let method = details.trigger.name;

        if (method === "use-item" && details.item) {
          method = details.item.name; // ej: 'thunder-stone'
        } else if (method === "level-up" && details.min_happiness) {
          method = "Amistad";
        } else if (method === "level-up") {
          method = "Nivel";
        }

        parsedObj.method = method;

        if (details.min_level !== null) {
          parsedObj.level = details.min_level;
        }
      }
    }

    results.push(parsedObj);

    node.evolves_to.forEach((child) => traverse(child));
  };

  traverse(chainNode);

  return results;
};
