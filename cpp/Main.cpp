// Main.cpp : Defines the entry point for the console application.
#include "SrcMain.h"

int main(int argc, const char* argv[])
{
	InputOptions input_options{
		BST,
		false, // allowMegas
		false, // allowLegendaries
		false, // allowSubLegendaries
		false, // allowMythicals
		false, // allowParadox
		false, // allowUltraBeast
		false, // allowPseudoLegendaries
		true,  // allowGen1
		true,  // allowGen2
		true,  // allowGen3
		true,  // allowGen4
		true,  // allowGen5
		true,  // allowGen6
		true,  // allowGen7
		true,  // allowGen8
		true   // allowGen9
	};

	OutputValues output_values = ProcessCommandArgs(input_options);
	LOG(INFO) << "Objective value = " << output_values.objective_value;
	for (const auto &pokemon : output_values.chosen_pokemon)
	{
		LOG(INFO) << pokemon.Name;
	}
	return 0;
}

