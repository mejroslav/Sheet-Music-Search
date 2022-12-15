#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


const IMSLP_URL: &str = "https://imslp.org/wiki/Category:People";

const INIT_SCRIPT: &str = r#"

let results = [];

function loadBatch() {
    let r = [
        ...document.querySelectorAll(".fcatcol li > a")
    ].map(el => [el.textContent, el.href]);

    results.push(...r);

    const nextButton = document.querySelector(".catpglnkss1 :last-child");
    if (nextButton.textContent.includes("next")) {
        const observer = new MutationObserver(() => {
            loadBatch()
            observer.disconnect();
        });
        observer.observe(
            document.querySelector(".fcatcol"),
            { childList: true }
        );
        nextButton.click();
    } else {
        console.log(results);
    }
}

window.addEventListener("load", loadBatch);
"#;

fn main() {
    let imslp_window_url = tauri::WindowUrl::External(url::Url::parse(IMSLP_URL).unwrap());

    tauri::Builder::default()
        .setup(|app| {
            let window = tauri::WindowBuilder::new(app, "label", imslp_window_url)
                .initialization_script(INIT_SCRIPT)
                .build()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
