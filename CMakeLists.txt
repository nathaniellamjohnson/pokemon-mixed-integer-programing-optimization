cmake_minimum_required(VERSION 3.24)

project(pokemon_mixed_integer_programming VERSION 0.1.0 LANGUAGES CXX)

include(FetchContent)

# Build for C++20 if we can
set(CMAKE_CXX_STANDARD 20)

# Turn on any compiler-specific flags
if (WIN32)
	# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /WX")
else()
   set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Werror=return-type")
   if ("$ENV{RELEASE}" STREQUAL "ON")
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O2")
	endif()
	if ("$ENV{SANITIZE}" STREQUAL "ON")
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fsanitize=address")
	endif()
	
	if(APPLE)
		set(CMAKE_XCODE_ATTRIBUTE_GCC_GENERATE_DEBUGGING_SYMBOLS[variant=Debug] "YES")
		set(CMAKE_XCODE_ATTRIBUTE_GCC_GENERATE_DEBUGGING_SYMBOLS[variant=MinSizeRel] "NO")
		set(CMAKE_XCODE_ATTRIBUTE_GCC_GENERATE_DEBUGGING_SYMBOLS[variant=RelWithDebInfo] "YES")
		set(CMAKE_XCODE_ATTRIBUTE_GCC_GENERATE_DEBUGGING_SYMBOLS[variant=Release] "NO")
	endif()
endif()

# TODO: ensure that below works with all 
list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")

option(POKEMON_FETCH_OR_TOOLS "Fetch OR-Tools with FetchContent" ON)

if(POKEMON_FETCH_OR_TOOLS)
	set(BUILD_DEPS ON CACHE BOOL "Build OR-Tools bundled dependencies" FORCE)
	set(BUILD_TESTING OFF CACHE BOOL "Disable OR-Tools tests" FORCE)
	set(BUILD_EXAMPLES OFF CACHE BOOL "Disable OR-Tools examples" FORCE)
	set(BUILD_SAMPLES OFF CACHE BOOL "Disable OR-Tools samples" FORCE)
	set(BUILD_JAVA OFF CACHE BOOL "Disable OR-Tools Java wrapper" FORCE)
	set(BUILD_PYTHON OFF CACHE BOOL "Disable OR-Tools Python wrapper" FORCE)
	set(BUILD_DOTNET OFF CACHE BOOL "Disable OR-Tools .NET wrapper" FORCE)

	FetchContent_Declare(
		ortools
		GIT_REPOSITORY https://github.com/google/or-tools.git
		GIT_TAG stable
		GIT_SHALLOW TRUE
	)
	FetchContent_MakeAvailable(ortools)
else()
	find_package(ortools CONFIG REQUIRED)
endif()

# Subdirectories to build
add_subdirectory(src)

# Any source files in this directory
set(SOURCE_FILES main.cpp)

# Where any include files are
include_directories(src)

# Name of executable
add_executable(main ${SOURCE_FILES})

# Link main vs the source library
target_link_libraries(main src)