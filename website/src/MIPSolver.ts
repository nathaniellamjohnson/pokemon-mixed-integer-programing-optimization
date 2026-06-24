import solver from "javascript-lp-solver";

export interface PokemonData {
    name: string;
    type1: string;
    type2?: string;
    base_stat_total: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    pokedex_number: number;
    isMega: boolean;
    isLegendary: boolean;
    isSubLegendary: boolean;
    isMythical: boolean;
    isUltraBeast: boolean;
    isParadox: boolean;
    generation: string;
    sprite: string;
}

const typeEffectiveness: Record<string, { resists: string[]; weakTo: string[]; seAgainst: string[] }> = {
    Normal: { resists: [], weakTo: ["Fighting"], seAgainst: [] },
    Fire: { resists: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"], weakTo: ["Water", "Ground", "Rock"], seAgainst: ["Grass", "Ice", "Bug", "Steel"] },
    Water: { resists: ["Steel", "Fire", "Water"], weakTo: ["Electric", "Grass"], seAgainst: ["Fire", "Ground", "Rock"] },
    Electric: { resists: ["Flying", "Steel", "Electric"], weakTo: ["Ground"], seAgainst: ["Water", "Flying"] },
    Grass: { resists: ["Ground", "Water", "Grass", "Electric"], weakTo: ["Fire", "Ice", "Poison", "Flying", "Bug"], seAgainst: ["Water", "Ground", "Rock"] },
    Ice: { resists: ["Ice"], weakTo: ["Fire", "Fighting", "Rock", "Steel"], seAgainst: ["Grass", "Flying", "Ground", "Dragon"] },
    Fighting: { resists: ["Rock", "Bug", "Dark"], weakTo: ["Flying", "Psychic", "Fairy"], seAgainst: ["Normal", "Ice", "Rock", "Dark", "Steel"] },
    Poison: { resists: ["Fighting", "Poison", "Bug", "Grass"], weakTo: ["Ground", "Psychic"], seAgainst: ["Grass", "Fairy"] },
    Ground: { resists: ["Poison", "Rock"], weakTo: ["Water", "Grass", "Ice"], seAgainst: ["Fire", "Electric", "Poison", "Rock", "Steel"] },
    Flying: { resists: ["Fighting", "Bug", "Grass"], weakTo: ["Electric", "Ice", "Rock"], seAgainst: ["Fighting", "Bug", "Grass"] },
    Psychic: { resists: ["Fighting", "Psychic"], weakTo: ["Bug", "Ghost", "Dark"], seAgainst: ["Fighting", "Poison"] },
    Bug: { resists: ["Fighting", "Ground", "Grass"], weakTo: ["Fire", "Flying", "Rock"], seAgainst: ["Grass", "Psychic", "Dark"] },
    Rock: { resists: ["Normal", "Flying", "Poison", "Fire"], weakTo: ["Water", "Grass", "Fighting", "Ground", "Steel"], seAgainst: ["Flying", "Bug", "Fire", "Ice"] },
    Ghost: { resists: ["Poison", "Bug"], weakTo: ["Ghost", "Dark"], seAgainst: ["Ghost", "Psychic"] },
    Dragon: { resists: ["Fire", "Water", "Electric", "Grass"], weakTo: ["Ice", "Dragon", "Fairy"], seAgainst: ["Dragon"] },
    Dark: { resists: ["Ghost", "Dark"], weakTo: ["Fighting", "Bug", "Fairy"], seAgainst: ["Ghost", "Psychic"] },
    Steel: { resists: ["Normal", "Flying", "Rock", "Bug", "Steel", "Grass", "Psychic", "Ice", "Dragon", "Fairy"], weakTo: ["Fire", "Water", "Ground"], seAgainst: ["Normal", "Flying", "Rock", "Ice", "Dragon", "Fairy"] },
    Fairy: { resists: ["Fighting", "Bug", "Dark"], weakTo: ["Poison", "Steel"], seAgainst: ["Fighting", "Dragon", "Dark"] },
};

export const solvePokemonTeam = (formData: FormData, allPokemon: PokemonData[]): PokemonData[] | null => {
    console.log("Starting to solve!");
    const optimizeFor = (formData.get("optimize_for") as string) || "base_stat_total";
    const allowedCategories = new Set(formData.getAll("allowed_categories") as string[]);
    const allowedGenerations = new Set(formData.getAll("generations") as string[]);

    const model: any = {
        optimize: optimizeFor,
        opType: "max",
        constraints: { team_size: { min: 1, max: 6 } },
        variables: {},
        ints: {},
    };

    const typesList = Object.keys(typeEffectiveness);

    // Require at least 1 Pokemon that resists, and 1 that is SE against, every type
    typesList.forEach((t) => {
        model.constraints[`resists_${t}`] = { min: 1 };
        model.constraints[`se_against_${t}`] = { min: 1 };
    });

    // Map to easily retrieve the full Pokemon object later
    const lookupMap = new Map<string, PokemonData>();

    allPokemon.forEach((pokemon) => {
        // Exclude disallowed pokemon before they ever reach the solver to save processing time
        if (pokemon.isMega && !allowedCategories.has("Megas")) return;
        if (pokemon.isLegendary && !allowedCategories.has("Legendaries")) return;
        if (pokemon.isSubLegendary && !allowedCategories.has("Sublegendaries")) return;
        if (pokemon.isMythical && !allowedCategories.has("Mythicals")) return;
        if (pokemon.isUltraBeast && !allowedCategories.has("Ultra Beasts")) return;
        if (pokemon.isParadox && !allowedCategories.has("Paradox")) return;
        if (!allowedGenerations.has(pokemon.generation)) return;

        const varName = `pkmn_${pokemon.pokedex_number}`;
        lookupMap.set(varName, pokemon);

        model.variables[varName] = {
            [optimizeFor]: pokemon[optimizeFor as keyof PokemonData] as number,
            team_size: 1,
            [varName]: 1, // Self-reference for binary limit
        };

        model.constraints[varName] = { min: 0, max: 1 };
        model.ints[varName] = 1;

        const pTypes = [pokemon.type1, pokemon.type2].filter(Boolean) as string[];

        typesList.forEach((targetType) => {
            const resistsTarget = pTypes.some((t) => typeEffectiveness[t]?.resists.includes(targetType));
            if (resistsTarget) model.variables[varName][`resists_${targetType}`] = 1;

            const seAgainstTarget = pTypes.some((t) => typeEffectiveness[t]?.seAgainst.includes(targetType));
            if (seAgainstTarget) model.variables[varName][`se_against_${targetType}`] = 1;
        });
    });
    const results = solver.Solve(model);

    if (results.feasible) {
        const selectedKeys = Object.keys(results).filter(
            (key) => key.startsWith("pkmn_") && results[key] === 1
        );

        // Convert the variable keys back into full Pokemon objects
        console.log(selectedKeys)
        return selectedKeys.map(key => lookupMap.get(key)!).filter(Boolean);
    }
    return null; // Return null if no team fits the constraints

}