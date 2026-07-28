// PASSO 1
// Este script só faz uma coisa: perguntar pro Bridge Kit da Circle
// quais são os nomes exatos das redes que ele suporta hoje.
//
// Por quê isso é necessário? A Circle mudou a forma de nomear as redes
// algumas vezes ao longo de 2026 (ex: "Base" vs "base-sepolia" vs "BaseTestnet").
// Em vez de eu chutar o nome certo, a gente descobre o nome real rodando isso
// antes de tentar fazer a ponte de verdade.
//
// Como rodar:
//   npm run listar-redes

import { AppKit } from "@circle-fin/app-kit";

const kit = new AppKit();

const redes = kit.getSupportedChains();

console.log("\n=== Redes suportadas pelo Bridge Kit ===\n");
console.table(
  redes.map((r) => ({
    nome: r.name ?? r.chainName ?? JSON.stringify(r),
    chainId: r.chainId ?? r.id ?? "-",
    usdc: r.usdcAddress ?? r.tokenAddress ?? "-",
  }))
);

console.log(
  "\nProcure na lista acima pelo nome exato de 'Arc Testnet' e da rede destino\n" +
  "que você quiser usar (ex: Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia).\n" +
  "Copie os nomes EXATOS (campo 'nome') e cole no arquivo 2-estimar-e-fazer-bridge.js\n" +
  "nas variáveis REDE_ORIGEM e REDE_DESTINO.\n"
);
