📦 Overview:

tailwind-dynamic-breakpoints (or simply tdb) is a powerful CLI tool designed to dynamically generate custom media query CSS for Tailwind CSS.

It scans your project files for custom breakpoint utility classes (e.g. media-max-1209:text-black) 
and automatically generates the corresponding CSS using Tailwind’s engine. 
All matched styles are compiled into a single output CSS file.

With tdb, you’re no longer limited to predefined breakpoints. Use any pixel value directly in your utility classes:

```html
    <div class="media-max-768:hidden"> Hidden on screens smaller than 768px </div> 
    <div class="media-min-1024:flex"> Flex on screens wider than 1024px </div> 
    <div className="media-max-1337:text-xl"> Text becomes extra-large on screens below 1337px </div>
``` 

✨ Features:

🔍 File Scanning
Automatically searches for utility classes with dynamic breakpoints in your project files (.html, .jsx, .tsx, etc.).

🎨 CSS Generation
Generates media query CSS rules for custom breakpoints using Tailwind CSS and PostCSS under the hood.

📦 CSS Consolidation
All generated styles are combined into a single, easy-to-include output file.

🔁 Watch Mode (--watch)
Automatically regenerates CSS when your files change — perfect for a smooth development workflow.

🧩 Post Command Hook (--post-command)
Run any shell command after successful CSS generation — ideal for chaining build steps or triggering additional scripts.

---

## 🛠️ Installation

### 🔧 Standard Installation

To install `tailwind-dynamic-breakpoints` in any project, use the following command:

```bash
npm install --save-dev tailwind-dynamic-breakpoints
```

> This is all you need for basic usage and custom breakpoint generation.

---

### ⚙️ For Vite and Next.js Projects

If you're using **Vite** or **Next.js**, you'll likely want a smoother development experience with auto-regeneration and parallel scripts. In that case, install the following additional dependencies:

```bash
npm install --save-dev concurrently wait-on
```

These tools help with running `tdb` alongside your dev server.

---

### 📦 Tailwind CSS Setup

If you haven't installed Tailwind CSS yet, follow their official CLI installation:

```bash
npm install -D tailwindcss
npx tailwindcss init
```

[🔗 Tailwind CSS CLI Installation Guide](https://tailwindcss.com/docs/installation/tailwind-cli)

---

### 📋 What We've Installed

| Package                                    | Purpose                                                           |
| ------------------------------------------ | ----------------------------------------------------------------- |
| **`tailwind-dynamic-breakpoints`**         | The core CLI tool for generating custom media query utilities     |
| **`tailwindcss`**, **`@tailwindcss/vite`** | Required for Tailwind to work with Vite                           |
| **`concurrently`**, **`wait-on`**          | Allow parallel execution of commands — useful in development mode |

## ⚙️ Core Setup: General Projects (HTML/JS/Any Framework)

These steps apply to **any project using Tailwind CSS**. They explain how `tdb` works, how to configure it, and how to integrate the generated CSS into your project.

---

### 1. Configure `tailwind.config.js`

Make sure your `tailwind.config.js` is located in the **root of your project**, uses a **`.js` extension (not `.ts`!)**, and correctly defines the paths to your files in the `content` array.

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // ⚠️ Use `export default` for compatibility with most bundlers and with tdb
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}", // tdb will scan these files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

### 2. Choose Output Location for Generated CSS

By default, `tdb` creates a file called `dynamic-breakpoints.css` in your project root.

> 🔥 **Best practice**: explicitly set the output path using the `--output` flag — especially for projects using bundlers like Vite or Webpack.

For example, save it to: `./src/tdb-generated.css`

💡 **Important**: When you define an `--output` path in your `package.json` scripts, `tdb` will **automatically create this file** if it doesn't exist. There's no need to create it manually.

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && tdb --config tailwind.config.js --output ./src/tdb-generated.css --watch\"",
    "build": "tdb --config tailwind.config.js --output ./src/tdb-generated.css && tsc -b && vite build"
  }
}
```

---

### 3. Import Generated CSS Into Your Main Stylesheet

Make sure to import the generated CSS into your main CSS file, after the core Tailwind directives:

```css
/* src/main.css or your main stylesheet */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "./tdb-generated.css"; /* <-- Important: Import tdb-generated styles */
```

---

### 4. Add NPM Scripts

Add custom `tdb` commands to your `package.json` depending on your dev environment (React/Vite, Next.js, or plain HTML/JS).

---

## 🚀 Usage Examples

### ▶️ Basic Execution

To run `tdb` with default options:

```bash
npx tdb
```

This will:

- Use `tailwind.config.js`
- Output to `./dynamic-breakpoints.css`

---

### ⚙️ CLI Options

| Option                         | Description                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `-o, --output <path>`          | Output CSS file for dynamic breakpoints (`./dynamic-breakpoints.css` by default) |
| `-c, --config <path>`          | Path to your `tailwind.config.js` file                                           |
| `-w, --watch`                  | Watch mode — regenerates CSS on file change                                      |
| `-p, --post-command <command>` | Shell command to run after successful generation (e.g. recompiling Tailwind)     |

Example:

```bash
tdb -c tailwind.config.js -o ./src/tdb-generated.css -w -p "npx tailwindcss -i ./src/main.css -o ./public/build.css"
```

---

## 🔄 Integrating into Dev & Build Workflows

### 🧠 General Idea

- In **development**, `tdb` and your dev server (Vite, Next.js) should run **in parallel**, regenerating CSS on the fly.
- In **production**, `tdb` must run **before** your bundler to ensure all styles are ready.

---

## 💡 React + Vite Projects

### 1. Update `vite.config.ts`

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Enables Tailwind in Vite
  ],
});
```

### 2. Setup NPM Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && tdb --config tailwind.config.js --output ./src/tdb-generated.css --watch\"",
    "build": "tdb --config tailwind.config.js --output ./src/tdb-generated.css && tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### 3. Start Development

```bash
npm run dev
```

Vite starts the dev server. `tdb` watches for changes and generates styles on the fly. Tailwind updates instantly via Fast Refresh.

---

## 💡 Next.js Projects

### 1. Ensure Tailwind + PostCSS are configured

`tdb` works out of the box with Tailwind in Next.js (no `vite` plugin needed).

### 2. Setup NPM Scripts

🛠️ Scripts
Add the following scripts to your package.json:

```json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"wait-on http://localhost:3000 && tdb --config tailwind.config.js --output ./src/app/tdb-generated.css --watch\"",
    "dev:turbo": "concurrently \"next dev --turbopack\" \"wait-on http://localhost:3000 && tdb --config tailwind.config.js --output ./src/app/tdb-generated.css --watch\"",
    "build": "tdb --config tailwind.config.js --output ./src/app/tdb-generated.css && next build",
    "start": "next start"
  }
}
```

dev: For regular development (without Turbopack)

dev:turbo: For development using Turbopack (Next.js experimental bundler)

build: Generates the tdb-generated.css before building the app

```

⚙️ Basic Tailwind Configuration
Create or update your tailwind.config.js with the following content:


// tailwind.config.js
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


```

💅 Import Styles
In your global CSS file (usually src/app/globals.css), import both Tailwind and your generated styles:

css
Copy
Edit
@import "tailwindcss";
@import "./tdb-generated.css";

### 3. Start Development

```bash
npm run dev
```

Next.js runs the server and picks up changes to the `tdb`-generated styles via Fast Refresh.

---

## 💡 Plain HTML/CSS/JS Projects (No Framework)

If you're using Tailwind CLI (not Vite or Next.js), use `--post-command` to trigger a Tailwind build after each CSS generation.

### 1. Setup Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"tdb --config tailwind.config.js --output ./src/tdb-generated.css --watch --post-command \"npx tailwindcss -i ./src/main.css -o ./public/build.css\"\" \"npx serve public\"",
    "build": "tdb --config tailwind.config.js --output ./src/tdb-generated.css && npx tailwindcss -i ./src/main.css -o ./public/build.css"
  }
}
```

> ℹ️ `--post-command` triggers `npx tailwindcss` after each generation.
>
> ⚠️ Use escaped quotes `\"` inside `--post-command` to make it work inside `package.json`.

> 🧪 Optional: install `serve` to run a local server:

```bash
npm install -D serve
```

### 2. Run Dev Mode

```bash
npm run dev
```

`tdb` watches and generates the CSS. Tailwind compiles it, and the browser auto-refreshes.

---

Notes and Potential Improvements
This tool provides a powerful foundation for working with dynamic breakpoints in Tailwind CSS. As with any new utility, there are areas for future enhancements and considerations for optimal use:

Tailwind Configuration (content field): It's crucial that your tailwind.config.js is correctly set up, especially the content field. tdb relies on this configuration to accurately scan your project files for dynamic breakpoint classes. Incorrect or missing paths here will prevent tdb from finding and generating CSS for your dynamic classes.

Performance for Large Projects: For very large projects with a substantial number of files or extremely frequent changes, the current watch mode's re-scanning and re-generation process could potentially be optimized. Future improvements might include incremental scanning, more intelligent caching strategies, or parallel processing to speed up regeneration times.

Custom Utility Validation: The tool's ability to generate CSS for a given utility class (e.g., text-black, text-[var(--primary)], or a custom utility like my-custom-utility) depends entirely on how Tailwind CSS itself processes and generates that utility. Ensure any custom utility classes you use with dynamic breakpoints are properly defined and generated by your tailwind.config.js. If Tailwind cannot generate CSS for a specific utility, tdb won't be able to either, and a warning will be logged.

.ts support for tailwind.config: Currently, tdb expects tailwind.config.js to be a .js file. Direct support for .ts configuration files would require additional transpilation steps within the tool itself, which would complicate its dependencies and increase its size. For now, we recommend using the .js version of your Tailwind config.

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.
