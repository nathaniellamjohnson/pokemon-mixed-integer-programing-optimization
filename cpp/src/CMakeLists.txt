# If you create new headers/cpp files, add them to these list!
set(HEADER_FILES
   SrcMain.h
)

set(SOURCE_FILES
   SrcMain.cpp
)

# Don't change this
add_library(src ${SOURCE_FILES} ${HEADER_FILES}
   Pokemon.h
   csv.h
   InputOutput.h)

target_compile_features(src PUBLIC cxx_std_17)
target_include_directories(src PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(src PUBLIC ortools::ortools)


