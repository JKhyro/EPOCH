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

add_library(epoch_app_bridge SHARED
    native/epoch_app_bridge.c
)

target_link_libraries(epoch_app_bridge PRIVATE epoch_core)
target_include_directories(epoch_app_bridge PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/native
)

add_executable(epoch_core_smoke
    native/epoch_core_smoke.c
)

target_link_libraries(epoch_core_smoke PRIVATE epoch_core)

add_executable(epoch_app_bridge_smoke
    native/epoch_app_bridge_smoke.c
)

target_link_libraries(epoch_app_bridge_smoke PRIVATE epoch_app_bridge)

enable_testing()
add_test(NAME epoch_core_smoke COMMAND epoch_core_smoke)
add_test(NAME epoch_app_bridge_smoke COMMAND epoch_app_bridge_smoke)
