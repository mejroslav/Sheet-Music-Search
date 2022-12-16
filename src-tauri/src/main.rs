#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_sqlite_path() -> String {
    let dirs = directories::ProjectDirs::from("cz", "mejroslav", "Sheet Music Finder").unwrap();
    let path = dirs.data_local_dir().join("database.sqlite");
    return path.into_os_string().into_string().unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_sqlite_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
