import { PublicKey } from '@solana/web3.js';















// Token Configuration







export const TOKEN_CONFIG = {







  // Current token setup (FWOG)







  CURRENT: {







    SYMBOL: 'FWOG',







    MINT: 'A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump',







    DECIMALS: 6,







    COSTS: {







      GENERATION: 5,







      MODEL_CREATION: 5







    },







    SWAP_URL: "https://raydium.io/swap/?inputMint=sol&outputMint=A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump"







  },







  







  // Future GEN token integration







  GEN: {







    SYMBOL: 'GEN',







    MINT: '', // Will add contract address when ready







    DECIMALS: 6,







    COSTS: {







      GENERATION: 1000,







      MODEL_CREATION: 4200000







    },







    SWAP_URL: "" // Will add when ready







  }







};















// Treasury wallet







export const TREASURY_WALLET = 'Cabg7viFVH2Dd8cELWNQqcHRW8NfVngo1L7i2YkLGCDw';















// Active token config - just change this to switch tokens







export const ACTIVE_TOKEN = TOKEN_CONFIG.CURRENT;















// Helper functions







export const getTokenMint = () => new PublicKey(ACTIVE_TOKEN.MINT);







export const getTreasuryWallet = () => new PublicKey(TREASURY_WALLET);







export const getGenerationCost = () => ACTIVE_TOKEN.COSTS.GENERATION;







export const getModelCreationCost = () => ACTIVE_TOKEN.COSTS.MODEL_CREATION;







export const getSwapUrl = () => ACTIVE_TOKEN.SWAP_URL;







export const getTokenSymbol = () => ACTIVE_TOKEN.SYMBOL; 






