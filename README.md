# MarketX | Secure P2P Marketplace 🚀

MarketX is a state-of-the-art decentralized marketplace built on the **Stellar Network**. It leverages **Soroban Smart Contracts** to ensure trustless transactions through a secure escrow system, providing total peace of mind for both buyers and sellers.

![MarketX Preview](https://via.placeholder.com/1200x600/050505/3b82f6?text=MarketX+Premium+UI+Preview)

## ✨ Key Features

- **🛡️ Escrow Protection**: Funds are locked in smart contracts and only released upon successful delivery.
- **🌐 Stellar Native**: Built for the Stellar ecosystem, featuring low fees and lightning-fast settlements.
- **🔑 Hybrid Auth**: Seamlessly switch between Web2 (JWT-based) and Web3 (Freighter Wallet) authentication.
- **✨ Premium UI/UX**: High-end dark mode aesthetic with glassmorphism, Framer Motion animations, and a responsive design.
- **🛠️ Role-Based Access**: Dedicated workflows for Buyers and Sellers.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Web3**: [@stellar/freighter-api](https://www.freighter.app/)
- **Data Fetching**: [@tanstack/react-query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- **pnpm** — this project uses pnpm, not npm or yarn (see `pnpm-lock.yaml` and the `packageManager` field in `package.json`). Enable it via Corepack, which ships with Node 20+:
  ```bash
  corepack enable
  ```
- [Stellar Freighter Wallet](https://www.freighter.app/) extension installed in your browser.

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:MarketXpress/MarketX-frontend.git
   cd MarketX-frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

4. **Build for production**:
   ```bash
   pnpm build
   ```

> ⚠️ Don't use `npm install` or `yarn install` here — it will generate a second lockfile that drifts out of sync with `pnpm-lock.yaml` and breaks deployment. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contributor workflow.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI and layout components.
  - `src/components/animations`: Framer Motion animation primitives.
  - `src/components/auth`: Wallet connection and auth-related components.
- `src/context`: React Context providers (Auth, etc.).
- `src/providers`: External library providers (React Query).
- `src/lib`: Utility functions and configuration.

## 🤝 Contributing

This is an open-source project and we welcome contributions! See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the full setup, workflow, and PR process — start there before opening a Pull Request.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the **MarketX Laboratory** team.
