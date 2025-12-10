
import type { Transaction } from '../types';

export const parseCSV = (file: File): Promise<{ transactions: Transaction[], initialBalance: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        return reject(new Error("Le fichier est vide."));
      }

      const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
      if (rows.length < 2) {
        return reject(new Error("Le fichier CSV doit contenir au moins un en-tête et une ligne de données."));
      }

      const header = rows[0].split(/[,;]/).map(h => h.trim().toLowerCase());
      const dataRows = rows.slice(1);

      const dateIndex = header.findIndex(h => h.includes('date'));
      const libelleIndex = header.findIndex(h => h.includes('libell') || h.includes('description'));
      const debitIndex = header.findIndex(h => h.includes('debit') || h.includes('débit'));
      const creditIndex = header.findIndex(h => h.includes('credit') || h.includes('crédit'));
      const montantIndex = header.findIndex(h => h.includes('montant'));
      const soldeIndex = header.findIndex(h => h.includes('solde'));

      if (dateIndex === -1 || libelleIndex === -1) {
        return reject(new Error("Les colonnes 'date' et 'libellé' sont introuvables."));
      }

      if (debitIndex === -1 && creditIndex === -1 && montantIndex === -1) {
        return reject(new Error("Impossible de trouver les colonnes de montant ('débit'/'crédit' ou 'montant')."));
      }

      const transactions: Transaction[] = [];
      let lastValidBalance = 0;

      for (const row of dataRows) {
        const values = row.split(/[,;]/).map(v => v.trim());
        
        const date = values[dateIndex];
        const libelle = values[libelleIndex].replace(/"/g, '');
        let montant = 0;

        if (montantIndex !== -1) {
            montant = parseFloat(values[montantIndex].replace(',', '.').replace(/\s/g, '')) || 0;
        } else {
            const debit = parseFloat(values[debitIndex]?.replace(',', '.').replace(/\s/g, '')) || 0;
            const credit = parseFloat(values[creditIndex]?.replace(',', '.').replace(/\s/g, '')) || 0;
            montant = credit - debit;
        }

        if (date && libelle) {
          transactions.push({ date, libelle, montant });
        }
        
        if (soldeIndex !== -1) {
            const currentBalance = parseFloat(values[soldeIndex].replace(',', '.').replace(/\s/g, ''))
            if (!isNaN(currentBalance)) {
                lastValidBalance = currentBalance;
            }
        }
      }
      
      const initialBalance = lastValidBalance;
      resolve({ transactions, initialBalance });
    };

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier."));
    };

    reader.readAsText(file, 'UTF-8');
  });
};
