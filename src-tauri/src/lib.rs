use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SystemConfig {
    pub tenant_id: Option<String>,
    pub pocketbase_url: Option<String>,
    pub config_source: String,
    pub is_tauri: bool,
}

#[tauri::command]
fn get_system_config() -> Result<SystemConfig, String> {
    // Check environment variables first
    let env_tenant = std::env::var("APP_TENANT_ID").ok();
    let env_pb = std::env::var("APP_POCKETBASE_URL").ok();
    
    // Check if there is a local config.json in the current working directory (like a ConfigMap)
    let config_path = std::env::var("APP_CONFIG_PATH").unwrap_or_else(|_| "config.json".to_string());
    
    let mut file_tenant = None;
    let mut file_pb = None;
    
    if let Ok(content) = std::fs::read_to_string(&config_path) {
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&content) {
            file_tenant = parsed.get("tenantId").and_then(|v| v.as_str().map(|s| s.to_string()));
            file_pb = parsed.get("pocketbaseUrl").and_then(|v| v.as_str().map(|s| s.to_string()));
        }
    }
    
    // Resolve configurations: env takes precedence over file
    let resolved_tenant = env_tenant.or(file_tenant);
    let resolved_pb = env_pb.or(file_pb);
    
    let source = if std::env::var("APP_TENANT_ID").is_ok() || std::env::var("APP_POCKETBASE_URL").is_ok() {
        "Environment Variables".to_string()
    } else if std::fs::metadata(&config_path).is_ok() {
        format!("ConfigMap File ({})", config_path)
    } else {
        "Default Client Storage".to_string()
    };
    
    Ok(SystemConfig {
        tenant_id: resolved_tenant,
        pocketbase_url: resolved_pb,
        config_source: source,
        is_tauri: true,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::default().build())
    .invoke_handler(tauri::generate_handler![get_system_config])
    .setup(|_app| {
      if cfg!(debug_assertions) {
        // Custom setup for debug builds if needed
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_config_resolution() {
        // Temporarily set test env vars
        std::env::set_var("APP_TENANT_ID", "test-tenant-env");
        std::env::set_var("APP_POCKETBASE_URL", "https://test-pb.com");
        
        let config = get_system_config().expect("failed to get system config");
        
        assert_eq!(config.tenant_id, Some("test-tenant-env".to_string()));
        assert_eq!(config.pocketbase_url, Some("https://test-pb.com".to_string()));
        assert_eq!(config.config_source, "Environment Variables");
        
        // Clean up env vars
        std::env::remove_var("APP_TENANT_ID");
        std::env::remove_var("APP_POCKETBASE_URL");
    }
}
