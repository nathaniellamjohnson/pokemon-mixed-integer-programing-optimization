#pragma once
#include "Pokemon.h"

enum OptimizerOptions
{
    BST,
    PokedexNum,
    HP,
    Attack,
    Defense,
    SpAttack,
    SpDefense,
    Speed
};

struct InputOptions
{
    enum OptimizerOptions to_optimize;

    bool allowMegas;
    bool allowLegendaries;
    bool allowSubLegendaries;
    bool allowMythicals;
    bool allowParadox;
    bool allowUltraBeast;
    bool allowPseudoLegendaries;

    bool allowGen1;
    bool allowGen2;
    bool allowGen3;
    bool allowGen4;
    bool allowGen5;
    bool allowGen6;
    bool allowGen7;
    bool allowGen8;
    bool allowGen9;
};

struct OutputValues
{
    size_t objective_value;
    std::vector<Pokemon> chosen_pokemon;
};
