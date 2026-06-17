from ortools.linear_solver import pywraplp
import logging
import pandas as pd
from csv import DictReader
from pathlib import Path

# Objective - Maximixe some values, in this case BST (could be attack, speed, sp atk, etc.)
# Constraints -
#   1. 1-6 pokemon chosen
#   2. Pokemon chosen at least once
#   3. Mega and Base pokemon not chosen at same time
#   4. For all types, we have a pokemon with a type resistant to it
#   5. For all types, we have a pokemon with a type effective against it
#   6. (Optional) - no legendary, mythical, restricted pokemon

# ===================================================================
if __name__ == "__main__":
    # A. Load info

    # Type effectiveness and resistance mapping
    type_effectiveness = {
        "Normal": {"resists": [], "weak_to": ["Fighting"], "supereffective_against": []},
        "Fire": {"resists": ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"], "weak_to": ["Water", "Ground", "Rock"], "supereffective_against": ["Grass", "Ice", "Bug", "Steel"]},
        "Water": {"resists": ["Steel", "Fire", "Water"], "weak_to": ["Electric", "Grass"], "supereffective_against": ["Fire", "Ground", "Rock"]},
        "Electric": {"resists": ["Flying", "Steel", "Electric"], "weak_to": ["Ground"], "supereffective_against": ["Water", "Flying"]},
        "Grass": {"resists": ["Ground", "Water", "Grass", "Electric"], "weak_to": ["Fire", "Ice", "Poison", "Flying", "Bug"], "supereffective_against": ["Water", "Ground", "Rock"]},
        "Ice": {"resists": ["Ice"], "weak_to": ["Fire", "Fighting", "Rock", "Steel"], "supereffective_against": ["Grass", "Flying", "Ground", "Dragon"]},
        "Fighting": {"resists": ["Rock", "Bug", "Dark"], "weak_to": ["Flying", "Psychic", "Fairy"], "supereffective_against": ["Normal", "Ice", "Rock", "Dark", "Steel"]},
        "Poison": {"resists": ["Fighting", "Poison", "Bug", "Grass"], "weak_to": ["Ground", "Psychic"], "supereffective_against": ["Grass", "Fairy"]},
        "Ground": {"resists": ["Poison", "Rock"], "weak_to": ["Water", "Grass", "Ice"], "supereffective_against": ["Fire", "Electric", "Poison", "Rock", "Steel"]},
        "Flying": {"resists": ["Fighting", "Bug", "Grass"], "weak_to": ["Electric", "Ice", "Rock"], "supereffective_against": ["Fighting", "Bug", "Grass"]},
        "Psychic": {"resists": ["Fighting", "Psychic"], "weak_to": ["Bug", "Ghost", "Dark"], "supereffective_against": ["Fighting", "Poison"]},
        "Bug": {"resists": ["Fighting", "Ground", "Grass"], "weak_to": ["Fire", "Flying", "Rock"], "supereffective_against": ["Grass", "Psychic", "Dark"]},
        "Rock": {"resists": ["Normal", "Flying", "Poison", "Fire"], "weak_to": ["Water", "Grass", "Fighting", "Ground", "Steel"], "supereffective_against": ["Flying", "Bug", "Fire", "Ice"]},
        "Ghost": {"resists": ["Poison", "Bug"], "weak_to": ["Ghost", "Dark"], "supereffective_against": ["Ghost", "Psychic"]},
        "Dragon": {"resists": ["Fire", "Water", "Electric", "Grass"], "weak_to": ["Ice", "Dragon", "Fairy"], "supereffective_against": ["Dragon"]},
        "Dark": {"resists": ["Ghost", "Dark"], "weak_to": ["Fighting", "Bug", "Fairy"], "supereffective_against": ["Ghost", "Psychic"]},
        "Steel": {"resists": ["Normal", "Flying", "Rock", "Bug", "Steel", "Grass", "Psychic", "Ice", "Dragon", "Fairy"], "weak_to": ["Fire", "Water", "Ground"], "supereffective_against": ["Normal", "Flying", "Rock", "Ice", "Dragon", "Fairy"]},
        "Fairy": {"resists": ["Fighting", "Bug", "Dark"], "weak_to": ["Poison", "Steel"], "supereffective_against": ["Fighting", "Dragon", "Dark"]},
    }

    pokemon_df = pd.read_csv("./data/Pokemon.csv")

    # CSV Sets
    def load_names_from_csv(csv_path):
        names = set()
        with open(Path(csv_path), newline="", encoding="utf-8") as f:
            reader = DictReader(f)
            for row in reader:
                if "name" in row and row["name"]:
                    names.add(row["name"])
                elif row:
                    names.add(next(iter(row.values())))
        return names

    legendary_pokemon_names = load_names_from_csv("./data/lists/Legendaries.csv")
    mythical_pokemon_names = load_names_from_csv("./data/lists/Mythical.csv")
    restricted_pokemon_names = load_names_from_csv("./data/lists/SubLegendary.csv")

    # B. Create solver & define variables
    solver = pywraplp.Solver.CreateSolver("SAT")
    if not solver:
        logging.exception("Solver unable to be created.")
        exit()

    # Binary variables for each pokemon
    num_pokemon_options = pokemon_df.shape[0]
    pokemon_vars = [
        solver.BoolVar(f"pokemon_{i}") for i in range(num_pokemon_options)
    ]  # Will only ever be 0.0 or 1.0

    # Maximize the BST of selected pokemon
    solver.Maximize(
        sum(
            pokemon_vars[i] * pokemon_df.iloc[i]["Base Stat Total"]
            for i in range(num_pokemon_options)
        )
    )

    # Bunch of Constraints

    # 1-6 pokemon chosen
    solver.Add(sum(pokemon_vars) <= 6)
    solver.Add(sum(pokemon_vars) >= 1)

    # no legendaries
    for row_num, pokemon_option in enumerate(pokemon_df.iloc):
        if pokemon_option["Mega"] == 1:
            solver.Add(pokemon_vars[row_num] == 0)
        if pokemon_option["Mythical"] == 1:
            solver.Add(pokemon_vars[row_num] == 0)
        if pokemon_option["Sub Legendary"] == 1:
            solver.Add(pokemon_vars[row_num] == 0)
        if pokemon_option["Legendary"] == 1:
            solver.Add(pokemon_vars[row_num] == 0)
        if pokemon_option["Paradox"] == 1:
            solver.Add(pokemon_vars[row_num] == 0)
        if pokemon_option["Ultra Beast"] == 1:
            solver.Add(pokemon_vars[row_num] == 0)

        # Psuedo Legendaries
        # if pokemon_option["Base Stat Total"] == 600:
        #     solver.Add(pokemon_vars[row_num] == 0)

    # All Types Resisted
    # For every attack type, require at least one selected Pokémon that resists it.
    for attack_type, matchup in type_effectiveness.items():
        resisting_pokemon = []
        for row_num, pokemon_option in enumerate(pokemon_df.iloc):
            pokemon_types = {
                str(pokemon_option[col]).strip()
                for col in ["Type 1", "Type 2", "type1", "type2"]
                if col in pokemon_df.columns and pd.notna(pokemon_option[col])
            }
            if pokemon_types.intersection(matchup["resists"]):
                resisting_pokemon.append(pokemon_vars[row_num])

        if resisting_pokemon:
            solver.Add(sum(resisting_pokemon) >= 1)

    # Team has a supereffective type against all types
    # For every defense type, require at least one selected Pokémon that is super effective against it.
    for defense_type, matchup in type_effectiveness.items():
        effective_pokemon = []
        for row_num, pokemon_option in enumerate(pokemon_df.iloc):
            pokemon_types = {
                str(pokemon_option[col]).strip()
                for col in ["Type 1", "Type 2", "type1", "type2"]
                if col in pokemon_df.columns and pd.notna(pokemon_option[col])
            }
            if pokemon_types.intersection(matchup["supereffective_against"]):
                effective_pokemon.append(pokemon_vars[row_num])

        if effective_pokemon:
            solver.Add(sum(effective_pokemon) >= 1)

    # Solve!
    print(f"Solving with {solver.SolverVersion()}")
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        print("Solution:")

        # Gather selected pokemon
        selected = []
        for i, var in enumerate(pokemon_vars):
            if var.solution_value() == 1.0:
                # determine name column
                if "Name" in pokemon_df.columns:
                    name = pokemon_df.iloc[i]["Name"]
                elif "name" in pokemon_df.columns:
                    name = pokemon_df.iloc[i]["name"]
                else:
                    name = pokemon_df.iloc[i][pokemon_df.columns[0]]
                bst = pokemon_df.iloc[i]["Base Stat Total"]
                selected.append((i, name, int(bst)))

        total_bst = sum(x[2] for x in selected)
        print(f"Selected {len(selected)} pokemon, Total BST = {total_bst}")
        for idx, name, bst in selected:
            print(f"- [{idx}] {name}: BST={bst}")
    else:
        print("The problem does not have an optimal solution.")
