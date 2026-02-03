use serde::{Deserialize, Serialize};
use tauri::command;

const DOCKER_HUB_API: &str = "https://hub.docker.com/v2/repositories/mcp/";
const REGISTRY_API: &str = "https://registry.modelcontextprotocol.io/v0.1/servers";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MarketplaceServer {
    pub id: String,
    pub name: String,
    pub description: String,
    pub command: String,
    pub args: Vec<String>,
    #[serde(rename = "envVariables")]
    pub env_variables: Vec<String>,
    pub author: String,
    #[serde(rename = "sourceUrl")]
    pub source_url: String,
    pub category: String,
    #[serde(rename = "iconUrl")]
    pub icon_url: Option<String>,
    pub source: String,
    pub verified: bool,
    #[serde(rename = "packageName")]
    pub package_name: String,
    #[serde(rename = "requiresConfig")]
    pub requires_config: bool,
    #[serde(rename = "pullCount")]
    pub pull_count: Option<u64>,
    #[serde(rename = "starCount")]
    pub star_count: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct DockerHubResponse {
    results: Vec<DockerHubRepo>,
    next: Option<String>,
}

#[derive(Debug, Deserialize)]
struct DockerHubRepo {
    name: String,
    description: Option<String>,
    pull_count: Option<u64>,
    star_count: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct RegistryResponse {
    servers: Option<Vec<RegistryServerWrapper>>,
}

#[derive(Debug, Deserialize)]
struct RegistryServerWrapper {
    server: Option<RegistryServer>,
}

#[derive(Debug, Deserialize)]
struct RegistryServer {
    name: Option<String>,
    title: Option<String>,
    description: Option<String>,
    #[serde(rename = "websiteUrl")]
    website_url: Option<String>,
}

/// Fetch MCP servers from Docker Hub and Registry
#[command]
pub async fn fetch_marketplace_servers(query: String) -> Result<Vec<MarketplaceServer>, String> {
    let client = reqwest::Client::new();
    
    // Clone for parallel execution
    let query1 = query.clone();
    let query2 = query;
    let client1 = client.clone();
    let client2 = client;
    
    // Fetch from both sources in parallel
    let docker_future = fetch_from_docker_hub(client1, query1);
    let registry_future = fetch_from_registry(client2, query2);
    
    let (docker_result, registry_result) = tokio::join!(docker_future, registry_future);
    
    let mut docker_servers = docker_result.unwrap_or_else(|e| {
        eprintln!("Docker Hub fetch error: {}", e);
        vec![]
    });
    
    let registry_servers = registry_result.unwrap_or_else(|e| {
        eprintln!("Registry fetch error: {}", e);
        vec![]
    });
    
    // Merge: Docker first, then registry (avoiding duplicates)
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    for server in &docker_servers {
        seen.insert(server.name.to_lowercase().replace(' ', "-"));
    }
    
    for server in registry_servers {
        let key = server.name.to_lowercase().replace(' ', "-");
        if !seen.contains(&key) {
            seen.insert(key);
            docker_servers.push(server);
        }
    }
    
    // Sort by popularity (pull count)
    docker_servers.sort_by(|a, b| {
        let pull_a = a.pull_count.unwrap_or(0);
        let pull_b = b.pull_count.unwrap_or(0);
        pull_b.cmp(&pull_a)
    });
    
    Ok(docker_servers)
}

async fn fetch_from_docker_hub(client: reqwest::Client, query: String) -> Result<Vec<MarketplaceServer>, String> {
    let mut all_servers: Vec<MarketplaceServer> = Vec::new();
    let mut next_url: Option<String> = Some(format!("{}?page_size=100", DOCKER_HUB_API));
    let mut page_count = 0;
    
    while let Some(url) = next_url {
        if page_count >= 3 {
            break;
        }
        
        let response = client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await
            .map_err(|e| format!("Docker Hub request failed: {}", e))?;
        
        if !response.status().is_success() {
            break;
        }
        
        let data: DockerHubResponse = response
            .json()
            .await
            .map_err(|e| format!("Docker Hub parse failed: {}", e))?;
        
        for repo in data.results {
            // Skip non-server entries
            if repo.name == "docker" || repo.name == "signatures" || repo.name == "inspector" {
                continue;
            }
            
            // Extract description before moving
            let desc = repo.description.unwrap_or_else(|| format!("MCP server for {}", repo.name));
            let category = infer_category(&repo.name, &desc);
            
            let server = MarketplaceServer {
                id: format!("docker-{}", repo.name),
                name: format_name(&repo.name),
                description: desc,
                command: "docker".to_string(),
                args: vec!["run".to_string(), "-i".to_string(), "--rm".to_string(), format!("mcp/{}", repo.name)],
                env_variables: vec![],
                author: "mcp".to_string(),
                source_url: format!("https://hub.docker.com/r/mcp/{}", repo.name),
                category,
                icon_url: None,
                source: "docker".to_string(),
                verified: true,
                package_name: format!("mcp/{}", repo.name),
                requires_config: false,
                pull_count: repo.pull_count,
                star_count: repo.star_count,
            };
            
            all_servers.push(server);
        }
        
        next_url = data.next;
        page_count += 1;
    }
    
    // Filter by query if provided
    if !query.is_empty() {
        let lower_query = query.to_lowercase();
        all_servers.retain(|s| {
            s.name.to_lowercase().contains(&lower_query) ||
            s.description.to_lowercase().contains(&lower_query) ||
            s.package_name.to_lowercase().contains(&lower_query)
        });
    }
    
    Ok(all_servers)
}

async fn fetch_from_registry(client: reqwest::Client, query: String) -> Result<Vec<MarketplaceServer>, String> {
    let url = if query.is_empty() {
        format!("{}?limit=100", REGISTRY_API)
    } else {
        format!("{}?limit=100&search={}", REGISTRY_API, urlencoding::encode(&query))
    };
    
    let response = client
        .get(&url)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| format!("Registry request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Ok(vec![]);
    }
    
    let data: RegistryResponse = response
        .json()
        .await
        .map_err(|e| format!("Registry parse failed: {}", e))?;
    
    let servers = data.servers.unwrap_or_default();
    
    Ok(servers.into_iter().filter_map(|wrapper| {
        let server = wrapper.server?;
        let name = server.name.clone().unwrap_or_default();
        let package_name = name.split('/').last().unwrap_or(&name).to_string();
        let desc = server.description.unwrap_or_default();
        let category = infer_category(&name, &desc);
        
        Some(MarketplaceServer {
            id: format!("registry-{}", name),
            name: server.title.unwrap_or_else(|| format_name(&package_name)),
            description: desc,
            command: "npx".to_string(),
            args: vec!["-y".to_string(), package_name.clone()],
            env_variables: vec![],
            author: "Unknown".to_string(),
            source_url: server.website_url.unwrap_or_default(),
            category,
            icon_url: None,
            source: "registry".to_string(),
            verified: true,
            package_name,
            requires_config: false,
            pull_count: None,
            star_count: None,
        })
    }).collect())
}

fn format_name(name: &str) -> String {
    name.split('-')
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(c) => c.to_uppercase().collect::<String>() + chars.as_str(),
            }
        })
        .collect::<Vec<String>>()
        .join(" ")
}

fn infer_category(name: &str, description: &str) -> String {
    let text = format!("{} {}", name, description).to_lowercase();
    
    if text.contains("database") || text.contains("sql") || text.contains("postgres") ||
       text.contains("mysql") || text.contains("redis") || text.contains("mongo") {
        return "database".to_string();
    }
    if text.contains("file") || text.contains("filesystem") || text.contains("drive") {
        return "filesystem".to_string();
    }
    if text.contains("github") || text.contains("gitlab") || text.contains("git") {
        return "development".to_string();
    }
    if text.contains("slack") || text.contains("discord") || text.contains("notion") {
        return "communication".to_string();
    }
    if text.contains("search") || text.contains("brave") || text.contains("duckduckgo") {
        return "search".to_string();
    }
    if text.contains("cloud") || text.contains("aws") || text.contains("azure") || text.contains("kubernetes") {
        return "cloud".to_string();
    }
    if text.contains("browser") || text.contains("playwright") || text.contains("puppeteer") {
        return "automation".to_string();
    }
    
    "other".to_string()
}
