import React from 'react';
import PokemonDisplayCard from "./PokemonDisplayCard"
import { type PokemonData } from "./MIPSolver.ts";

interface PokemonDisplayProps {
    team: PokemonData[];
}

function PokemonDisplay({ team }: PokemonDisplayProps) {
    const defaultTeam = Array(6).fill({ pokedex_number: -1 });
    
    return (
        <section className='w-full '>
            {team.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 justify-center justify-items-center mx-auto max-w-5xl content-between">
                    {defaultTeam.map((pokemon, index) => (
                        <PokemonDisplayCard
                            key={`placeholder-${index}`} 
                            pokemon_info={pokemon}
                            isPlaceholder={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 justify-center justify-items-center mx-auto max-w-5xl content-between">
                    {team.map((pokemon) => (
                        <PokemonDisplayCard
                            key={`pokemon-${pokemon.pokedex_number}`} 
                            pokemon_info={pokemon}
                            isPlaceholder={false}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default PokemonDisplay;