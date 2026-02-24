import express from "express";
import { createServer as createViteServer } from "vite";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to download source code as ZIP
  app.get("/api/download-source", (req, res) => {
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    res.attachment("lifeos-source.zip");

    archive.on("error", (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Append files from the root directory, excluding node_modules and dist
    const rootDir = process.cwd();
    
    // Add src directory
    archive.directory(path.join(rootDir, "src"), "src");
    
    // Add public directory if it exists
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

    archive.finalize();
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
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
