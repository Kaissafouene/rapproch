
export interface Transaction {
  date: string;
  libelle: string;
  montant: number;
}

export interface MatchedTransaction {
  transactionBancaire: Transaction;
  transactionComptable: Transaction;
}

export interface Adjustment {
  libelle: string;
  montant: number;
  type: 'addition' | 'soustraction';
  explication: string;
}

export interface ReconciliationResult {
  soldeComptableInitial: number;
  soldeBancaireInitial: number;
  ajustements: Adjustment[];
  transactionsCorrespondantes: MatchedTransaction[];
  transactionsBancairesUniques: Transaction[];
  transactionsComptablesUniques: Transaction[];
}
