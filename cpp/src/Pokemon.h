#pragma once
#include <string>
#include <vector>

class Pokemon
{
    // Default constructor used here

    public:
        size_t PokedexNumber;
        std::string Name;
        std::string Type1;
        std::string Type2;
        size_t BaseStatTotal;
        size_t HP;
        size_t Attack;
        size_t Defense;
        size_t SpecialAtk;
        size_t SpecialDef;
        size_t Speed;
        std::string Generation;
        bool Legendary;
        bool SubLegendary;
        bool Mythical;
        bool Mega;
        bool Paradox;
        bool UltraBeast;
        std::string Sprite;
};

struct Type
{
    std::string Name;
    std::vector<std::string> resists;
    std::vector<std::string> weak_to;
    std::vector<std::string> supereffective_against;
};