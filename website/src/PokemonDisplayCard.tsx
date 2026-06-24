import { useState } from 'react';

const TYPE_COLORS: Record<string, string> = {
    Normal: 'bg-gray-400 text-white',
    Fire: 'bg-red-500 text-white',
    Water: 'bg-blue-500 text-white',
    Electric: 'bg-yellow-400 text-black',
    Grass: 'bg-green-500 text-white',
    Ice: 'bg-cyan-300 text-black',
    Fighting: 'bg-red-700 text-white',
    Poison: 'bg-purple-500 text-white',
    Ground: 'bg-yellow-600 text-white',
    Flying: 'bg-indigo-300 text-black',
    Psychic: 'bg-pink-500 text-white',
    Bug: 'bg-lime-500 text-black',
    Rock: 'bg-yellow-700 text-white',
    Ghost: 'bg-purple-700 text-white',
    Dragon: 'bg-indigo-600 text-white',
    Dark: 'bg-[#624d4e] text-white border border-gray-600',
    Steel: 'bg-gray-400 text-white',
    Fairy: 'bg-pink-300 text-black',
};

function PokemonDisplayCard({ pokemon_info, isPlaceholder = false }: { pokemon_info?: any, isPlaceholder?: boolean }) {
    // FIXED: Instead of storing the string in state, store an error flag.
    const [useFallbackImg, setUseFallbackImg] = useState(false);

    const pokeballSrc = "/data/pokeapi_sprites/sprites/sprites/items/poke-ball.png";
    const baseSprite = `/data/pokeapi_sprites/sprites/sprites/pokemon/${pokemon_info?.sprite}`;
    const fallbackSprite = `/data/pokeapi_sprites/sprites/sprites/pokemon/other/official-artwork/${pokemon_info?.sprite}`;
    
    // Dynamically decide which image to show based on state and props
    const currentImgSrc = isPlaceholder 
        ? pokeballSrc 
        : (useFallbackImg ? fallbackSprite : baseSprite);

    const handleImageError = () => {
        setUseFallbackImg(true);
    };

    return (
        <div className={`relative flex flex-col items-center bg-slate-800 text-slate-100 rounded-xl p-3 shadow-lg w-48 border-2 border-slate-700 transition-transform ${isPlaceholder ? 'opacity-60 border-dashed' : 'hover:-translate-y-1 hover:border-blue-500'} overflow-hidden`}>
            
            {/* BST Badge */}
            <div className="absolute top-2 right-2 bg-slate-900 text-slate-300 text-[12px] font-bold px-1.5 py-0.5 rounded">
                BST {isPlaceholder ? "?" : pokemon_info.base_stat_total}
            </div>

            {/* Image Section */}
            <div className="w-full bg-slate-700/50 rounded-lg flex justify-center items-center p-2 mb-3 mt-4 h-24">
                <img 
                    className={`max-w-full max-h-full object-contain drop-shadow-md rendering-pixelated ${isPlaceholder ? 'opacity-50 w-12' : ''}`} 
                    src={currentImgSrc} 
                    onError={handleImageError}
                    alt={isPlaceholder ? "Pokeball placeholder" : `${pokemon_info.name} sprite`} 
                />
            </div>

            {/* Name */}
            <h3 className="font-bold text-base capitalize tracking-wide w-full text-center truncate">
                {isPlaceholder ? "---" : pokemon_info.name}
            </h3>

            {/* Types */}
            <div className="flex gap-1.5 my-2 w-full justify-center min-h-[20px]">
                {!isPlaceholder && (
                    <>
                        <span className={`px-2 py-0.5 text-[14px] font-bold uppercase rounded shadow-sm ${TYPE_COLORS[pokemon_info.type1] || 'bg-gray-500'}`}>
                            {pokemon_info.type1}
                        </span>
                        {pokemon_info.type2 && (
                            <span className={`px-2 py-0.5 text-[14px] font-bold uppercase rounded shadow-sm ${TYPE_COLORS[pokemon_info.type2] || 'bg-gray-500'}`}>
                                {pokemon_info.type2}
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Competitive Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1 text-[14px] font-medium bg-slate-900/80 rounded p-2 mt-1">
                <div className="flex justify-between">
                    <span className="text-slate-400">ATK</span>
                    <span className={isPlaceholder ? "text-slate-600" : "text-white"}>{isPlaceholder ? "?" : pokemon_info.attack}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">SPA</span>
                    <span className={isPlaceholder ? "text-slate-600" : "text-white"}>{isPlaceholder ? "?" : pokemon_info.special_attack}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">DEF</span>
                    <span className={isPlaceholder ? "text-slate-600" : "text-white"}>{isPlaceholder ? "?" : pokemon_info.defense}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">SPD</span>
                    <span className={isPlaceholder ? "text-slate-600" : "text-white"}>{isPlaceholder ? "?" : pokemon_info.special_defense}</span>
                </div>
                <div className="flex justify-between col-span-2 px-6">
                    <span className="text-slate-400">SPE</span>
                    <span className={isPlaceholder ? "text-slate-600" : "text-blue-300"}>{isPlaceholder ? "?" : pokemon_info.speed}</span>
                </div>
            </div>
        </div>
    );
}

export default PokemonDisplayCard;