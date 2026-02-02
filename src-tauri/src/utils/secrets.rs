use keyring::Entry;

pub struct SecretManager;

impl SecretManager {
    const SERVICE_PREFIX: &'static str = "relay.mcp.server";

    pub fn set_secret(server_id: &str, key: &str, value: &str) -> Result<(), String> {
        let service = format!("{}.{}", Self::SERVICE_PREFIX, server_id);
        let entry = Entry::new(&service, key)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
        
        entry.set_password(value)
            .map_err(|e| format!("Failed to set secret in keyring: {}", e))?;
            
        Ok(())
    }

    pub fn get_secret(server_id: &str, key: &str) -> Result<String, String> {
        let service = format!("{}.{}", Self::SERVICE_PREFIX, server_id);
        let entry = Entry::new(&service, key)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
            
        entry.get_password()
            .map_err(|e| format!("Failed to get secret from keyring: {}", e))
    }

    pub fn delete_secret(server_id: &str, key: &str) -> Result<(), String> {
        let service = format!("{}.{}", Self::SERVICE_PREFIX, server_id);
        let entry = Entry::new(&service, key)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
            
        entry.delete_password()
            .map_err(|e| format!("Failed to delete secret from keyring: {}", e))?;
            
        Ok(())
    }

    pub fn delete_all_server_secrets(server_id: &str, secret_keys: Vec<String>) -> Result<(), String> {
        for key in secret_keys {
            let _ = Self::delete_secret(server_id, &key);
        }
        Ok(())
    }
}
