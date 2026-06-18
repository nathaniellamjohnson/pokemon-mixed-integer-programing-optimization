#include "SrcMain.h"

// TODO : CONST all the mpsolver stuff as necessary

void ProcessCommandArgs(int argc, const char *argv[])
{
    // A. Load CSV
    // TODO: Fix this such that we aren't hard linking to files
    std::vector<Pokemon> pokemon_data;
    io::CSVReader<19> in(
        "/Users/nlj/Desktop/PersonalLearning/pokemon_mixed_integer_programming/data/Pokemon.csv");
    in.read_header(io::ignore_extra_column,
                   "Pokedex Number",
                   "Name",
                   "Type 1",
                   "Type 2",
                   "Base Stat Total",
                   "HP",
                   "Attack",
                   "Defense",
                   "Sp. Atk",
                   "Sp. Def",
                   "Speed",
                   "Generation",
                   "Legendary",
                   "Sub Legendary",
                   "Mythical",
                   "Mega",
                   "Paradox",
                   "Ultra Beast",
                   "Sprite");
    int PokedexNumber;
    std::string Name;
    std::string Type1;
    std::string Type2;
    int BaseStatTotal;
    int HP;
    int Attack;
    int Defense;
    int SpecialAtk;
    int SpecialDef;
    int Speed;
    std::string Generation;
    int Legendary;
    int SubLegendary;
    int Mythical;
    int Mega;
    int Paradox;
    int UltraBeast;
    std::string Sprite;
    while (in.read_row(PokedexNumber,
                       Name,
                       Type1,
                       Type2,
                       BaseStatTotal,
                       HP,
                       Attack,
                       Defense,
                       SpecialAtk,
                       SpecialDef,
                       Speed,
                       Generation,
                       Legendary,
                       SubLegendary,
                       Mythical,
                       Mega,
                       Paradox,
                       UltraBeast,
                       Sprite))
    {
        pokemon_data.emplace_back(PokedexNumber,
                                  Name,
                                  Type1,
                                  Type2,
                                  BaseStatTotal,
                                  HP,
                                  Attack,
                                  Defense,
                                  SpecialAtk,
                                  SpecialDef,
                                  Speed,
                                  Generation,
                                  Legendary,
                                  SubLegendary,
                                  Mythical,
                                  Mega,
                                  Paradox,
                                  UltraBeast,
                                  Sprite);
    }

    // B. Create Solver & Define Vars
    std::unique_ptr<operations_research::MPSolver> solver(
        operations_research::MPSolver::CreateSolver("SAT"));
    if (!solver)
    {
        LOG(WARNING) << "Could not create solver SAT";
        return;
    }
    const double infinity = solver->infinity();

    // Binary variables for each pokemon
    std::vector<operations_research::MPVariable *> pokemon_vars;
    pokemon_vars.reserve(pokemon_data.size());
    for (auto pokemon : pokemon_data)
    {
        pokemon_vars.emplace_back(solver->MakeIntVar(0.0, 1.0, pokemon.Name + "_boolvar"));
    }

    // C. Define Objective and Constraints
    // Constrain to 1-6 pokemon chosen
    // TODO: rename to make more sense
    operations_research::MPConstraint *const c0 = solver->MakeRowConstraint(1.0, 6.0, "c0");
    for (size_t i = 0; i < pokemon_data.size(); i++)
    {
        c0->SetCoefficient(pokemon_vars[i], 1.0);
    }

    // No Legendaries, Mythicals, etc...
    for (size_t i = 0; i < pokemon_data.size(); i++)
    {
        auto pokemon = pokemon_data[i];
        if (pokemon.Legendary == 1)
        {
            operations_research::MPConstraint *const constraint =
                solver->MakeRowConstraint(0.0, 0.0, "legend" + std::to_string(i));
            constraint->SetCoefficient(pokemon_vars[i], 1.0);
        }
        if (pokemon.Mythical == 1)
        {
            operations_research::MPConstraint *const constraint =
                solver->MakeRowConstraint(0.0, 0.0, "mythical" + std::to_string(i));
            constraint->SetCoefficient(pokemon_vars[i], 1.0);
        }
        if (pokemon.SubLegendary == 1)
        {
            operations_research::MPConstraint *const constraint =
                solver->MakeRowConstraint(0.0, 0.0, "sublegendary" + std::to_string(i));
            constraint->SetCoefficient(pokemon_vars[i], 1.0);
        }
        if (pokemon.Mega == 1)
        {
            operations_research::MPConstraint *const constraint =
                solver->MakeRowConstraint(0.0, 0.0, "mega" + std::to_string(i));
            constraint->SetCoefficient(pokemon_vars[i], 1.0);
        }
        if (pokemon.UltraBeast == 1)
        {
            operations_research::MPConstraint *const constraint =
                solver->MakeRowConstraint(0.0, 0.0, "ultrabeast" + std::to_string(i));
            constraint->SetCoefficient(pokemon_vars[i], 1.0);
        }
        if (pokemon.Paradox == 1)
        {
            operations_research::MPConstraint *const constraint =
                solver->MakeRowConstraint(0.0, 0.0, "paradox" + std::to_string(i));
            constraint->SetCoefficient(pokemon_vars[i], 1.0);
        }
    }

    // All Types Resisted
    // For every attack type, require at least one selected Pokémon that resists it.
    for (const auto &[type_name, matchup] : type_effectiveness)
    {
        operations_research::MPConstraint *const constraint =
            solver->MakeRowConstraint(1.0, infinity, "matchup_resist_" + type_name);
        std::vector<operations_research::MPVariable *> resisting_pokemon;
        for (size_t i = 0; i < pokemon_data.size(); i++)
        {
            auto pokemon = pokemon_data[i];
            bool type_1_resists = false;
            auto it1 = type_effectiveness.find(pokemon.Type1);
            if (it1 != type_effectiveness.end())
            {
                type_1_resists =
                    std::find(it1->second.resists.begin(), it1->second.resists.end(), type_name) !=
                    it1->second.resists.end();
            }

            bool type_2_resists = false;
            if (!pokemon.Type2.empty())
            {
                auto it2 = type_effectiveness.find(pokemon.Type2);
                if (it2 != type_effectiveness.end())
                {
                    type_2_resists = std::find(it2->second.resists.begin(),
                                               it2->second.resists.end(),
                                               type_name) != it2->second.resists.end();
                }
            }
            // std::find(matchup.resists.begin(), matchup.resists.end(), pokemon.Type1) !=
            // matchup.resists.end
            if (type_1_resists || type_2_resists)
            {
                constraint->SetCoefficient(pokemon_vars[i], 1.0);
            }
        }
    }

    // Team has a supereffective type against all types
    for (const auto &[type_name, matchup] : type_effectiveness)
    {
        operations_research::MPConstraint *const constraint =
            solver->MakeRowConstraint(1.0, infinity, "matchup_supereffective_" + type_name);

        std::vector<operations_research::MPVariable *> supereffective_pokemon;

        for (size_t i = 0; i < pokemon_data.size(); i++)
        {
            auto pokemon = pokemon_data[i];
            bool type_1_supereffective = false;
            if (std::find(matchup.weak_to.begin(), matchup.weak_to.end(), pokemon.Type1) !=
                matchup.weak_to.end())
            {
                type_1_supereffective = true;
            }

            bool type_2_supereffective = false;
            if (!pokemon.Type2.empty() &&
                (std::find(matchup.weak_to.begin(), matchup.weak_to.end(), pokemon.Type2) !=
                 matchup.weak_to.end()))
            {
                type_2_supereffective = true;
            }

            if (type_1_supereffective || type_2_supereffective)
            {
                constraint->SetCoefficient(pokemon_vars[i], 1.0);
            }
        }
    }

    // Maximize the Objective of...
    operations_research::MPObjective *const objective(solver->MutableObjective());
    for (size_t i = 0; i < pokemon_data.size(); i++)
    {
        objective->SetCoefficient(pokemon_vars[i], pokemon_data[i].BaseStatTotal);
    }

    objective->SetMaximization();

    // D. Solve & Output Answer
    const operations_research::MPSolver::ResultStatus result_status = solver->Solve();
    // Check that the problem has an optimal solution.
    if (result_status != operations_research::MPSolver::OPTIMAL)
    {
        LOG(FATAL) << "The problem does not have an optimal solution!";
    }

    LOG(INFO) << "Solution:";
    LOG(INFO) << "Objective value = " << objective->Value();

    for (size_t i = 0; i < pokemon_data.size(); i++)
    {
        if (pokemon_vars[i]->solution_value() == 1.0)
        {
            LOG(INFO) << pokemon_data[i].Name;
        }
    }
}