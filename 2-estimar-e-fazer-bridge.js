// PASSO 2
// Faz a ponte de USDC de teste entre duas redes usando o Bridge Kit (CCTP V2).
// Primeiro mostra uma ESTIMATIVA de custo, depois pede confirmação e executa.
//
// Antes de rodar:
//   1. Rode "npm run listar-redes" e confirme os nomes exatos das redes abaixo.
//   2. Copie .env.example para .env e preencha sua PRIVATE_KEY (carteira de teste!).
//   3. Pegue USDC de teste em faucet.circle.com pra carteira dessa PRIVATE_KEY,
//      na rede de ORIGEM escolhida abaixo.
//
// Como rodar:
//   npm run bridge

import "dotenv/config";
import readline from "node:readline/promises";
import chalk from "chalk";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, http } from "viem";

// ---- CONFIGURAÇÃO: ajuste depois de rodar "npm run listar-redes" ----
// Formato correto confirmado na doc atual: nomes com underscore, ex:
// "Arc_Testnet", "Base_Sepolia", "Ethereum_Sepolia", "Solana_Devnet".
const REDE_ORIGEM = "Arc_Testnet";
const REDE_DESTINO = "Base_Sepolia";
const VALOR_USDC = process.env.AMOUNT || "1";

// O RPC padrão do Bridge Kit pra Arc Testnet falhou no teste ("Network
// connection failed"), então apontamos explicitamente pra um RPC público
// de cada rede. Se algum desses cair no futuro, troque pela URL de um
// provedor tipo Alchemy/Infura/QuickNode (tem opção free).
// Incluímos todas as variações de nome (identificador, nome de exibição,
// título) porque o SDK usa uma ou outra dependendo da chamada.
const RPC_ARC = "https://rpc.testnet.arc.network";
const RPC_BASE_SEPOLIA = "https://sepolia.base.org";
const RPC_POR_REDE = {
  Arc_Testnet: RPC_ARC,
  "Arc Testnet": RPC_ARC,
  ArcTestnet: RPC_ARC,
  Base_Sepolia: RPC_BASE_SEPOLIA,
  "Base Sepolia": RPC_BASE_SEPOLIA,
  "Base Sepolia Testnet": RPC_BASE_SEPOLIA,
};
// -----------------------------------------------------------------------

if (!process.env.PRIVATE_KEY) {
  console.error(
    chalk.red(
      "\nERRO: variável PRIVATE_KEY não encontrada.\n" +
      "Copie .env.example para .env e preencha sua chave privada de teste.\n"
    )
  );
  process.exit(1);
}

const kit = new AppKit();

const adapter = createViemAdapterFromPrivateKey({
  privateKey: process.env.PRIVATE_KEY,
  getPublicClient: ({ chain }) => {
    // O objeto de rede tem um identificador ("Arc_Testnet") e um nome de
    // exibição ("Arc Testnet") — checamos os dois pra não depender de qual
    // deles o SDK decide usar em cada chamada.
    const rpcUrl =
      RPC_POR_REDE[chain.chain] ?? RPC_POR_REDE[chain.name] ?? RPC_POR_REDE[chain.title];
    if (!rpcUrl) {
      throw new Error(`Nenhum RPC configurado para a rede: ${chain.name}`);
    }
    return createPublicClient({
      chain,
      transport: http(rpcUrl, { retryCount: 3, timeout: 10000 }),
    });
  },
});

// Log colorido de cada etapa da ponte (aprovação, burn, espera de atestação, mint)
kit.on("*", (evento) => {
  const nome = evento?.action ?? evento?.type ?? "evento";
  console.log(chalk.cyan(`  [${nome}]`), evento);
});

async function main() {
  const params = {
    from: { adapter, chain: REDE_ORIGEM },
    to: { adapter, chain: REDE_DESTINO },
    amount: VALOR_USDC,
    config: { transferSpeed: "FAST" },
  };

  console.log(
    chalk.bold(`\n=== Ponte de USDC: ${REDE_ORIGEM} → ${REDE_DESTINO} ===\n`)
  );

  console.log(chalk.yellow("Calculando estimativa de custo..."));
  const estimativa = await kit.estimateBridge(params);
  console.log(chalk.yellow("\nEstimativa:"), estimativa);

  const etapaComErro = estimativa?.steps?.find((s) => s.state === "error");
  if (etapaComErro) {
    console.error(
      chalk.red(
        `\nA estimativa veio com erro na etapa "${etapaComErro.name}": ${etapaComErro.errorMessage}\n`
      )
    );
    console.error(
      chalk.gray(
        "Isso geralmente é falha de conexão com o RPC da rede, não com sua\n" +
        "carteira ou saldo. Confira sua internet e tente de novo. Se persistir,\n" +
        "troque a URL do RPC dessa rede em RPC_POR_REDE por outra (ex: um\n" +
        "endpoint gratuito da Alchemy ou Infura)."
      )
    );
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const resposta = await rl.question(
    chalk.bold(`\nConfirmar bridge de ${VALOR_USDC} USDC? (s/n) `)
  );
  rl.close();

  if (resposta.trim().toLowerCase() !== "s") {
    console.log(chalk.gray("Cancelado."));
    return;
  }

  console.log(chalk.yellow("\nExecutando bridge...\n"));
  const resultado = await kit.bridge(params);

  console.log(chalk.green.bold("\n✔ Bridge concluída!\n"));
  console.log(resultado);
}

main().catch((erro) => {
  console.error(chalk.red("\nErro ao executar a bridge:\n"), erro);
  console.error(
    chalk.gray(
      "\nDica: se o erro mencionar 'is not a function' ou 'not a constructor',\n" +
      "a Circle pode ter mudado o nome de algum método/pacote. Confira a página\n" +
      "atual em https://docs.arc.network/app-kit/references/sdk-reference e me avise\n" +
      "o texto do erro que eu ajusto o script."
    )
  );
  process.exit(1);
});
