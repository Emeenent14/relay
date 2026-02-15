use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextUsageStats {
    pub server_id: String,
    pub bytes_in: u64,
    pub bytes_out: u64,
    pub total_bytes: u64,
    pub tokens_in: u64,
    pub tokens_out: u64,
    pub total_tokens: u64,
    pub messages_in: u64,
    pub messages_out: u64,
    pub updated_at: String,
}

impl ContextUsageStats {
    fn new(server_id: &str) -> Self {
        Self {
            server_id: server_id.to_string(),
            bytes_in: 0,
            bytes_out: 0,
            total_bytes: 0,
            tokens_in: 0,
            tokens_out: 0,
            total_tokens: 0,
            messages_in: 0,
            messages_out: 0,
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum TrafficDirection {
    Inbound,
    Outbound,
}

fn estimate_tokens(bytes: usize) -> u64 {
    if bytes == 0 {
        return 0;
    }

    // Conservative heuristic for mixed MCP JSON payloads.
    ((bytes as f64) / 4.0).ceil() as u64
}

pub async fn record_traffic(
    state: &AppState,
    app: &AppHandle,
    server_id: &str,
    direction: TrafficDirection,
    payload: &str,
) -> ContextUsageStats {
    let bytes = payload.as_bytes().len();
    let estimated_tokens = estimate_tokens(bytes);

    let snapshot = {
        let mut usage_map = state.context_usage.lock().await;
        let usage = usage_map
            .entry(server_id.to_string())
            .or_insert_with(|| ContextUsageStats::new(server_id));

        match direction {
            TrafficDirection::Inbound => {
                usage.bytes_in += bytes as u64;
                usage.tokens_in += estimated_tokens;
                usage.messages_in += 1;
            }
            TrafficDirection::Outbound => {
                usage.bytes_out += bytes as u64;
                usage.tokens_out += estimated_tokens;
                usage.messages_out += 1;
            }
        }

        usage.total_bytes = usage.bytes_in + usage.bytes_out;
        usage.total_tokens = usage.tokens_in + usage.tokens_out;
        usage.updated_at = chrono::Utc::now().to_rfc3339();

        usage.clone()
    };

    let _ = app.emit("context-usage", &snapshot);
    snapshot
}
