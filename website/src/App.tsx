import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

import Header from './Header';
import PokemonDisplay from './PokemonDisplay';
import { solvePokemonTeam, type PokemonData } from './MIPSolver';

function App() {
  const [allPokemon, setAllPokemon] = useState<PokemonData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [team, setTeam] = useState<PokemonData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Controlled state to lock in and preserve selections across renders
  const [formValues, setFormValues] = useState({
    optimize_for: "base_stat_total",
    allowed_categories: [] as string[],
    generations: ["gen_1", "gen_2", "gen_3", "gen_4", "gen_5", "gen_6", "gen_7", "gen_8", "gen_9"]
  });

  // Load the CSV on Initial Mount
  useEffect(() => {
    fetch('/data/Pokemon.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData: PokemonData[] = results.data.map((row: any) => ({
              name: row["Name"] || row["name"],
              type1: row["Type 1"] || row["type1"],
              type2: row["Type 2"] || row["type2"],
              base_stat_total: Number(row["Base Stat Total"]),
              attack: Number(row["Attack"]),
              defense: Number(row["Defense"]),
              special_attack: Number(row["Sp. Atk"]),
              special_defense: Number(row["Sp. Def"]),
              speed: Number(row["Speed"]),
              pokedex_number: Number(row["Pokedex Number"]),
              isMega: Number(row["Mega"]) === 1,
              isLegendary: Number(row["Legendary"]) === 1,
              isSubLegendary: Number(row["Sub Legendary"]) === 1,
              isMythical: Number(row["Mythical"]) === 1,
              isUltraBeast: Number(row["Ultra Beast"]) === 1,
              isParadox: Number(row["Paradox"]) === 1,
              generation: `gen_${row["Generation"]}`,
              sprite: row["Sprite"] || row["sprite"],
            }));

            setAllPokemon(parsedData);
            setIsLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error("Failed to load Pokemon data:", err);
        setErrorMsg("Failed to load Pokédex data. Ensure CSV is in the public folder.");
        setIsLoading(false);
      });
  }, []);

  // 2. Event handler to parse checkbox arrays vs radio string structures
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const currentArray = formValues[name as keyof typeof formValues] as string[];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      setFormValues({ ...formValues, [name]: newArray });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  // 3. Process submissions using current state constraints
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Transform local state seamlessly back into a standard FormData instance
    const submissionFormData = new FormData();
    submissionFormData.append("optimize_for", formValues.optimize_for);
    formValues.allowed_categories.forEach(cat => submissionFormData.append("allowed_categories", cat));
    formValues.generations.forEach(gen => submissionFormData.append("generations", gen));

    const solvedTeam = solvePokemonTeam(submissionFormData, allPokemon);

    if (solvedTeam) {
      setTeam(solvedTeam);
    } else {
      setTeam([]);
      setErrorMsg("No team could be found matching those strict constraints. Try allowing more categories or generations.");
    }
  };

  // Define a clean label map for your active metrics
  const metricLabels: Record<string, string> = {
    base_stat_total: "Total BST",
    attack: "Combined ATK",
    defense: "Combined DEF",
    special_attack: "Combined SPA",
    special_defense: "Combined SPD",
    speed: "Combined SPE",
    pokedex_number: "Total Dex #",
  };

  // Calculate aggregated totals based on what stat is actively selected
  const activeMetricKey = formValues.optimize_for;
  const teamTotals = team.reduce((acc, pokemon) => {
    return {
      bst: acc.bst + (pokemon.base_stat_total || 0),
      activeMetric: acc.activeMetric + (Number(pokemon[activeMetricKey as keyof PokemonData]) || 0),
    };
  }, { bst: 0, activeMetric: 0 });

  return (
    <div className="min-h-screen lg:h-screen bg-linear-to-b from-[#161616] to-[#101010] text-[#e7e7e7] p-4 font-sans flex flex-col lg:overflow-hidden">
      <Header />

      {isLoading ? (
        <div className="grow flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[#3b3b3b] border-t-[#7cc7ff] animate-[spin_0.8s_linear_infinite]"></div>
          <p className="text-sm font-medium text-[#a8a8a8]">Loading Pokédex Data...</p>
        </div>
      ) : (
        <main id="main_section" className="flex flex-col lg:flex-row items-stretch gap-4 mt-2 flex-1 lg:min-h-0 w-full">

          {/* Form Editor Panel (38% width) */}

          <section id="pokemon_form" className="w-full lg:w-[38%] flex flex-col p-4 bg-[#1b1b1b]/90 border border-[#303030] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] h-auto lg:h-full lg:overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full justify-between">
              <div className='space-y-6'>
                {/* Radios Area */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.12em] text-[#a8a8a8] mb-2 font-bold">Optimize Team For</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "bst", label: "Base Stats", val: "base_stat_total" },
                      { id: "atk", label: "Attack", val: "attack" },
                      { id: "def", label: "Defense", val: "defense" },
                      { id: "spa", label: "Sp. Atk", val: "special_attack" },
                      { id: "spd", label: "Sp. Def", val: "special_defense" },
                      { id: "spe", label: "Speed", val: "speed" },
                      { id: "dex", label: "Pokédex #", val: "pokedex_number" },
                    ].map((input) => (
                      <div key={input.id} className="relative">
                        <input
                          type="radio"
                          id={input.id}
                          name="optimize_for"
                          value={input.val}
                          checked={formValues.optimize_for === input.val}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={input.id}
                          className="flex items-center justify-center w-full px-3 py-2 bg-[#0d0d0d] border border-[#303030] rounded-[10px] text-[13px] text-[#a8a8a8] cursor-pointer transition-colors hover:border-emerald-400 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-400"
                        >
                          {input.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Categories Checkboxes */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.12em] text-[#a8a8a8] mb-2 font-bold">Allow Restricted Pokémon</label>
                  <div className="flex flex-wrap gap-2">
                    {["Megas", "Legendaries", "Sublegendaries", "Mythicals", "Ultra Beasts", "Paradox"].map((category) => (
                      <div key={category} className="relative">
                        <input
                          type="checkbox"
                          id={category}
                          name="allowed_categories"
                          value={category}
                          checked={formValues.allowed_categories.includes(category)}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={category}
                          className="flex items-center justify-center px-3 py-1.5 bg-[#0d0d0d] border border-[#303030] rounded-full text-[12px] text-[#a8a8a8] cursor-pointer transition-colors hover:border-emerald-400 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-400"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generations Checkboxes */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.12em] text-[#a8a8a8] mb-2 font-bold">Permitted Games</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((genNum) => {
                      const genKey = `gen_${genNum}`;
                      return (
                        <div key={genNum} className="relative">
                          <input
                            type="checkbox"
                            id={genKey}
                            name="generations"
                            value={genKey}
                            checked={formValues.generations.includes(genKey)}
                            onChange={handleInputChange}
                            className="peer sr-only"
                          />
                          <label
                            htmlFor={genKey}
                            className="flex items-center justify-center px-3 py-2 bg-[#0d0d0d] border border-[#303030] rounded-[10px] text-[13px] text-[#a8a8a8] cursor-pointer transition-colors hover:border-emerald-400 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-400"
                          >
                            Gen {genNum}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Submission Execution */}
              <div className="pt-2 mt-auto">
                <button
                  type="submit"
                  className="w-full bg-purple-500 border border-transparent text-[#e7e7e7] py-2.5 px-4 rounded-[10px] text-[14px] font-medium tracking-wide cursor-pointer hover:border-white active:scale-[0.99] transition-all"
                >
                  Optimize!
                </button>
              </div>
            </form>
          </section>

          {/* Results Display Panel (62% width) */}

          {/* Results Display Panel (62% width) */}
          {/* MODIFIED: Separated container boundaries into an inner scroll track and sticky metrics banner */}
          <section id="pokemon_display" className="w-full lg:flex-1 flex flex-col p-4 bg-[#1b1b1b]/90 border border-[#303030] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] h-auto lg:h-full lg:overflow-hidden">
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-900 text-red-200 text-xs p-3 rounded-lg mb-4 flex-none">
                {errorMsg}
              </div>
            )}

            {/* Scrollable container specifically for the Pokemon Card grid row layout */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <PokemonDisplay team={team} />
            </div>

            {/* Sticky Summary Bar Widget */}
            {team.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#303030] bg-[#141414]/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 flex-none">
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.15em] text-[#a8a8a8] font-bold">Optimization Summary</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Aggregated metrics for your optimized roster</p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Always show overall BST value */}
                  <div className="text-center">
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-[#a8a8a8]">Team BST</span>
                    <span className="text-base font-black text-slate-200 font-mono">{teamTotals.bst}</span>
                  </div>

                  {/* Render a divider line only if the chosen metric is not already BST */}
                  {activeMetricKey !== "base_stat_total" && (
                    <>
                      <div className="w-[1px] h-6 bg-[#303030]"></div>
                      <div className="text-center">
                        <span className="block text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                          {metricLabels[activeMetricKey] || "Target Stat"}
                        </span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {teamTotals.activeMetric}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

        </main>
      )}
    </div>
  );
}

export default App;