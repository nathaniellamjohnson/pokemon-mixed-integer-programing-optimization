#pragma once
#include <cstdlib>
#include <iostream>
#include <memory>
#include <unordered_map>

#include "Pokemon.h"
#include "csv.h"

#include "absl/base/log_severity.h"
#include "absl/log/globals.h"
#include "absl/log/log.h"
#include "ortools/base/init_google.h"
#include "ortools/base/logging.h"
#include "ortools/init/init.h"
#include "ortools/linear_solver/linear_solver.h"
#include "ortools/sat/cp_model.h"
#include "ortools/sat/cp_model.pb.h"
#include "ortools/sat/cp_model_solver.h"

void ProcessCommandArgs(int argc, const char *argv[]);

static const std::unordered_map<std::string, Type> type_effectiveness = {
    {"Normal", {"Normal", {}, {"Fighting"}, {}}},
    {"Fire",
     {"Fire",
      {"Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"},
      {"Water", "Ground", "Rock"},
      {"Grass", "Ice", "Bug", "Steel"}}},
    {"Water",
     {"Water", {"Steel", "Fire", "Water"}, {"Electric", "Grass"}, {"Fire", "Ground", "Rock"}}},
    {"Electric", {"Electric", {"Flying", "Steel", "Electric"}, {"Ground"}, {"Water", "Flying"}}},
    {"Grass",
     {"Grass",
      {"Ground", "Water", "Grass", "Electric"},
      {"Fire", "Ice", "Poison", "Flying", "Bug"},
      {"Water", "Ground", "Rock"}}},
    {"Ice",
     {"Ice",
      {"Ice"},
      {"Fire", "Fighting", "Rock", "Steel"},
      {"Grass", "Flying", "Ground", "Dragon"}}},
    {"Fighting",
     {"Fighting",
      {"Rock", "Bug", "Dark"},
      {"Flying", "Psychic", "Fairy"},
      {"Normal", "Ice", "Rock", "Dark", "Steel"}}},
    {"Poison",
     {"Poison", {"Fighting", "Poison", "Bug", "Grass"}, {"Ground", "Psychic"}, {"Grass", "Fairy"}}},
    {"Ground",
     {"Ground",
      {"Poison", "Rock"},
      {"Water", "Grass", "Ice"},
      {"Fire", "Electric", "Poison", "Rock", "Steel"}}},
    {"Flying",
     {"Flying",
      {"Fighting", "Bug", "Grass"},
      {"Electric", "Ice", "Rock"},
      {"Fighting", "Bug", "Grass"}}},
    {"Psychic",
     {"Psychic", {"Fighting", "Psychic"}, {"Bug", "Ghost", "Dark"}, {"Fighting", "Poison"}}},
    {"Bug",
     {"Bug",
      {"Fighting", "Ground", "Grass"},
      {"Fire", "Flying", "Rock"},
      {"Grass", "Psychic", "Dark"}}},
    {"Rock",
     {"Rock",
      {"Normal", "Flying", "Poison", "Fire"},
      {"Water", "Grass", "Fighting", "Ground", "Steel"},
      {"Flying", "Bug", "Fire", "Ice"}}},
    {"Ghost", {"Ghost", {"Poison", "Bug"}, {"Ghost", "Dark"}, {"Ghost", "Psychic"}}},
    {"Dragon",
     {"Dragon", {"Fire", "Water", "Electric", "Grass"}, {"Ice", "Dragon", "Fairy"}, {"Dragon"}}},
    {"Dark", {"Dark", {"Ghost", "Dark"}, {"Fighting", "Bug", "Fairy"}, {"Ghost", "Psychic"}}},
    {"Steel",
     {"Steel",
      {"Normal", "Flying", "Rock", "Bug", "Steel", "Grass", "Psychic", "Ice", "Dragon", "Fairy"},
      {"Fire", "Water", "Ground"},
      {"Normal", "Flying", "Rock", "Ice", "Dragon", "Fairy"}}},
    {"Fairy",
     {"Fairy", {"Fighting", "Bug", "Dark"}, {"Poison", "Steel"}, {"Fighting", "Dragon", "Dark"}}},
};
