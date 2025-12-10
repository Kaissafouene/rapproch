
import { GoogleGenAI, Type } from "@google/genai";
import type { ReconciliationResult, Transaction } from "../types";

const convertToCSV = (transactions: Transaction[]): string => {
  const header = "Date,Libelle,Montant\n";
  return header + transactions.map(t => `${t.date},"${t.libelle}",${t.montant}`).join("\n");
};

export const reconcileTransactions = async (
  bankTransactions: Transaction[],
  journalTransactions: Transaction[],
  bankBalance: number,
  journalBalance: number
): Promise<ReconciliationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("La clé API Gemini n'est pas configurée.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const bankCSV = convertToCSV(bankTransactions);
  const journalCSV = convertToCSV(journalTransactions);

  const prompt = `
    Vous êtes un expert-comptable spécialisé dans la comptabilité tunisienne. Votre mission est d'effectuer un état de rapprochement bancaire.

    Voici les données :
    - Solde final du relevé bancaire : ${bankBalance} TND
    - Solde final du journal comptable (compte banque) : ${journalBalance} TND

    - Extrait du relevé bancaire (en format CSV) :
    \`\`\`csv
    ${bankCSV}
    \`\`\`

    - Extrait du journal comptable (en format CSV) :
    \`\`\`csv
    ${journalCSV}
    \`\`\`

    Instructions :
    1.  Identifiez les opérations qui correspondent exactement (montant identique, date proche, libellé similaire) entre le relevé bancaire et le journal comptable.
    2.  Listez les opérations présentes UNIQUEMENT sur le relevé bancaire.
    3.  Listez les opérations présentes UNIQUEMENT sur le journal comptable.
    4.  À partir des écarts, créez les ajustements nécessaires pour rapprocher le solde comptable du solde bancaire. Catégorisez ces ajustements (ex: "Chèques émis non débités", "Frais bancaires non comptabilisés").
        - Les opérations du journal non présentes en banque sont généralement des "additions" au solde comptable (comme des chèques émis).
        - Les opérations de la banque non présentes en compta sont généralement des "soustractions" (comme des frais). Adaptez le type en fonction de la nature de l'opération.
    5.  Retournez le résultat complet au format JSON en respectant le schéma fourni. Soyez rigoureux et précis.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            soldeComptableInitial: { type: Type.NUMBER },
            soldeBancaireInitial: { type: Type.NUMBER },
            ajustements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  libelle: { type: Type.STRING },
                  montant: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["addition", "soustraction"] },
                  explication: { type: Type.STRING },
                },
              },
            },
            transactionsCorrespondantes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  transactionBancaire: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      libelle: { type: Type.STRING },
                      montant: { type: Type.NUMBER },
                    },
                  },
                  transactionComptable: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      libelle: { type: Type.STRING },
                      montant: { type: Type.NUMBER },
                    },
                  },
                },
              },
            },
            transactionsBancairesUniques: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  libelle: { type: Type.STRING },
                  montant: { type: Type.NUMBER },
                },
              },
            },
            transactionsComptablesUniques: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  libelle: { type: Type.STRING },
                  montant: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ReconciliationResult;

  } catch (error) {
    console.error("Erreur de l'API Gemini:", error);
    throw new Error("L'analyse par l'IA a échoué. Veuillez vérifier la console pour plus de détails.");
  }
};
