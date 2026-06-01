cmake_minimum_required(VERSION 3.20)

project(epoch_core C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

add_library(epoch_core STATIC
    native/epoch_core.c
)

target_include_directories(epoch_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/native
)

add_executable(epoch_core_smoke
    native/epoch_core_smoke.c
)

target_link_libraries(epoch_core_smoke PRIVATE epoch_core)

enable_testing()
add_test(NAME epoch_core_smoke COMMAND epoch_core_smoke)
