import express from "express";
import { createServer as createViteServer } from "vite";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to count lines
function getProjectStats(dir: string, excludeDirs: string[] = ['node_modules', 'dist', '.git', 'public', 'build', 'coverage', '.next', '.github']) {
    let totalLines = 0;
    let fileCount = 0;

    function traverse(currentDir: string) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                if (!excludeDirs.includes(file)) {
                    traverse(filePath);
                }
            } else {
                const ext = path.extname(file).toLowerCase();
                if (['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html', '.json', '.md', '.yml', '.yaml'].includes(ext)) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        const lines = content.split('\n').length;
                        totalLines += lines;
                        fileCount++;
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }
    }

    if (fs.existsSync(dir)) {
        traverse(dir);
    }
    return { totalLines, fileCount };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API: Get Project Stats
  app.get("/api/stats", (req, res) => {
      try {
        const rootDir = process.cwd();
        const stats = getProjectStats(rootDir);
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: "Failed to calculate stats" });
      }
  });

  // API: Download Source Code
  app.get("/api/download-source", (req, res) => {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    res.attachment("lifeos-source.zip");

    archive.on("error", (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    const rootDir = process.cwd();
    
    // Add src directory
    archive.directory(path.join(rootDir, "src"), "src");
    
    // Add public directory
    if (fs.existsSync(path.join(rootDir, "public"))) {
        archive.directory(path.join(rootDir, "public"), "public");
    }

    // Add root files
    const rootFiles = [
        "package.json", 
        "tsconfig.json", 
        "vite.config.ts", 
        "index.html", 
        "tailwind.config.js", 
        "postcss.config.js", 
        "metadata.json", 
        ".env.example", 
        "server.ts",
        ".gitignore",
        "README.md"
    ];
    
    rootFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: file });
        }
    });

    // Add STATS.md
    const stats = getProjectStats(rootDir);
    const statsContent = `
# Project Statistics

- **Total Files**: ${stats.fileCount}
- **Total Lines of Code**: ${stats.totalLines}
- **Generated**: ${new Date().toISOString()}

## Note
This count includes all source files (.ts, .tsx, .js, .css, .html, .json, .md) in the project root and subdirectories, excluding node_modules, dist, and build artifacts.
    `;
    archive.append(statsContent, { name: 'STATS.md' });

    archive.finalize();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
