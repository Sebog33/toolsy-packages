# 🛠️ Toolsy

**Toolsy** is a collection of developer-focused utilities packaged as standalone NPM modules — fast, focused and open source.

Each tool is fully independent, lightweight, and designed to solve one dev pain point at a time.

---

## 🚀 Packages

| Tool | Description |
|------|-------------|
| [`@toolsy/json-repair`](./packages/json-repair) | Repairs broken JSON strings, especially useful with LLM or user inputs |

---

## 🧱 Project structure

```
toolsy/
├── apps/                   # UI, documentation, or playground apps
├── packages/               # Reusable NPM packages
│   ├── json-repair/        # JSON repair utility
│   └── ...
├── pnpm-workspace.yaml     # PNPM monorepo config
├── turbo.json              # Build pipeline config (Turborepo)
└── tsconfig.base.json      # Shared TS config
```

---

## 📦 Usage

All packages are published under the `@toolsy` scope and can be installed individually:

```bash
pnpm add @toolsy/json-repair
```

---

## 👨‍💻 Author

Made by [@Sebog33](https://github.com/Sebog33)  
Website: [https://toolsy.cc](https://toolsy.cc)

---

## 📄 License

MIT
