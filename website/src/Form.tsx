import React from "react";

function Form({ onSubmit }: { onSubmit: (formData: FormData) => void }) {
    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
            <div className="mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-black text-white tracking-wider uppercase">Team Optimizer</h2>
                <p className="text-slate-400 text-sm mt-1">Configure your competitive parameters</p>
            </div>

            <form action={onSubmit} className="space-y-8">
                {/* Optimize For Section - Radios */}
                <section id="optimize_for_section">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">
                        Optimize team for
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { id: "bst", label: "Base Stat Total", val: "base_stat_total" },
                            { id: "atk", label: "Attack", val: "attack" },
                            { id: "def", label: "Defense", val: "defense" },
                            { id: "spa", label: "Sp. Attack", val: "special_attack" },
                            { id: "spd", label: "Sp. Defense", val: "special_defense" },
                            { id: "spe", label: "Speed", val: "speed" },
                            { id: "dex", label: "Pokédex #", val: "pokedex_number" },
                        ].map((input) => (
                            <div key={input.id} className="relative">
                                <input 
                                    type="radio" 
                                    id={input.id} 
                                    name="optimize_for" 
                                    value={input.val} 
                                    defaultChecked={input.id === "bst"}
                                    className="peer sr-only" 
                                />
                                <label 
                                    htmlFor={input.id}
                                    className="flex items-center justify-center w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-400 cursor-pointer transition-all hover:bg-slate-700 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-400 peer-checked:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                >
                                    {input.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Allowed Categories Section - Checkboxes */}
                <section id="allow_section">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">
                        Allow Restricted Pokémon
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {[
                            "Megas",
                            "Legendaries",
                            "Sublegendaries",
                            "Mythicals",
                            "Ultra Beasts",
                            "Paradox"
                        ].map((input) => (
                            <div key={input} className="relative">
                                <input 
                                    type="checkbox" 
                                    id={input} 
                                    name="allowed_categories" 
                                    value={input}
                                    className="peer sr-only" 
                                />
                                <label 
                                    htmlFor={input}
                                    className="flex items-center justify-center px-4 py-2 bg-slate-900 border border-slate-700 rounded-full text-xs font-bold text-slate-400 cursor-pointer transition-all hover:bg-slate-700 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-400"
                                >
                                    {input}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Generations Section - Checkboxes */}
                <section id="restrict_generation_section">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">
                        Permitted Generations
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((input) => (
                            <div key={input} className="relative">
                                <input 
                                    type="checkbox" 
                                    id={"gen_" + input} 
                                    name="generations" 
                                    value={"gen_" + input} 
                                    defaultChecked
                                    className="peer sr-only" 
                                />
                                <label 
                                    htmlFor={"gen_" + input}
                                    className="flex items-center justify-center px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-500 cursor-pointer transition-all hover:bg-slate-700 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-400"
                                >
                                    Gen {input}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Submit Section */}
                <section id="submit_section" className="pt-4 border-t border-slate-700 mt-8">
                    <button 
                        type="submit"
                        className="w-full font-bold text-lg py-3 px-6 rounded-lg shadow-lg transition-all active:scale-[0.98]"
>
                        Optimize Team
                    </button>
                </section>
            </form>
        </div>
    );
}

export default Form;