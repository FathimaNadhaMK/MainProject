export async function fetchGithubRepoData(url) {
    try {
        // Step 1: Parse the GitHub URL
        // Expected format: https://github.com/owner/repo
        const regex = /github\.com\/([^/]+)\/([^/]+)/;
        const match = url.match(regex);

        if (!match) {
            throw new Error("Invalid GitHub URL. Please provide a URL in the format: https://github.com/owner/repo");
        }

        const owner = match[1];
        const repo = match[2].replace(/\.git$/, ""); // Remove .git suffix if present

        const headers = {
            "Accept": "application/vnd.github.v3+json",
        };

        if (process.env.GITHUB_TOKEN) {
            headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // Step 2: Fetch Repo Data via GitHub API

        // 1. Get basic repo info
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoResponse.ok) {
            throw new Error(`Failed to fetch repo info: ${repoResponse.statusText}`);
        }
        const repoInfo = await repoResponse.json();

        // 2. Get the full file tree recursively
        // We'll use the default branch
        const defaultBranch = repoInfo.default_branch || "main";
        const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
        if (!treeResponse.ok) {
            throw new Error(`Failed to fetch file tree: ${treeResponse.statusText}`);
        }
        const treeData = await treeResponse.json();

        // 3. Selectively fetch content of important files
        // Filter for important files (README, main source files, config files)
        // Skip images, binaries, node_modules, .git, etc.
        const importantExtensions = [
            // Web & Frontend
            ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss", ".sass", ".less", ".vue", ".svelte", ".astro",
            // Backend, Systems, Mobile, & Data Science
            ".py", ".java", ".c", ".cpp", ".h", ".hpp", ".cs", ".go", ".rs", ".rb", ".php", ".kt", ".swift", ".m", ".dart", ".scala", ".jl", ".r", ".ipynb",
            // Scripts and Queries
            ".sh", ".bat", ".ps1", ".sql", ".graphql",
            // Config & Docs
            ".json", ".md", ".yaml", ".yml", ".toml", ".xml", ".ini", ".cfg", ".conf"
        ];
        const skipPaths = ["node_modules/", ".git/", "dist/", "build/", ".next/", "package-lock.json", "yarn.lock", "package.json"];

        const importantFiles = treeData.tree.filter(file => {
            if (file.type !== "blob") return false;
            const path = file.path.toLowerCase();
            const isImportantExtension = importantExtensions.some(ext => path.endsWith(ext));
            const shouldSkip = skipPaths.some(skip => path.includes(skip));

            // Specifically include README
            if (path === "readme.md") return true;

            return isImportantExtension && !shouldSkip;
        }).slice(0, 20); // Limit to 20 files to avoid hitting limits or overwhelming the AI

        const fileContents = await Promise.all(importantFiles.map(async (file) => {
            try {
                const contentResponse = await fetch(file.url, { headers });
                if (!contentResponse.ok) return null;
                const contentData = await contentResponse.json();

                // GitHub API returns base64 encoded content
                const content = Buffer.from(contentData.content, "base64").toString("utf-8");

                return {
                    path: file.path,
                    content: content.substring(0, 10000) // Limit each file's content to 10k chars
                };
            } catch (error) {
                console.warn(`Failed to fetch content for ${file.path}:`, error.message);
                return null;
            }
        }));

        return {
            owner,
            repo,
            info: {
                name: repoInfo.name,
                description: repoInfo.description,
                language: repoInfo.language,
                stars: repoInfo.stargazers_count,
            },
            files: fileContents.filter(f => f !== null)
        };
    } catch (error) {
        console.error("GitHub API Error:", error);
        throw error;
    }
}
