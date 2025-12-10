
import React, { useMemo } from 'react';
import type { MatchesResponse } from '../services/apiService';

interface ReconciliationReportProps {
    result: MatchesResponse;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
};

const TransactionTable: React.FC<{ title: string, transactions: Transaction[], headers: string[] }> = ({ title, transactions, headers }) => (
    <div className="mb-6">
        <h4 className="text-md font-semibold text-slate-700 mb-2">{title} ({transactions.length})</h4>
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                        {headers.map(h => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? transactions.map((tx, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-2">{tx.date}</td>
                            <td className="px-4 py-2">{tx.libelle}</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(tx.montant)}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="text-center py-4 text-slate-500">Aucune opération</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const MatchedTransactionTable: React.FC<{ title: string, transactions: MatchedTransaction[] }> = ({ title, transactions }) => (
    <div className="mb-6">
         <h4 className="text-md font-semibold text-slate-700 mb-2">{title} ({transactions.length})</h4>
         <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                        <th scope="col" className="px-4 py-3">Date (Banque)</th>
                        <th scope="col" className="px-4 py-3">Libellé (Banque)</th>
                        <th scope="col" className="px-4 py-3">Date (Compta)</th>
                        <th scope="col" className="px-4 py-3">Libellé (Compta)</th>
                        <th scope="col" className="px-4 py-3 text-right">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? transactions.map((match, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-2">{match.transactionBancaire.date}</td>
                            <td className="px-4 py-2">{match.transactionBancaire.libelle}</td>
                            <td className="px-4 py-2">{match.transactionComptable.date}</td>
                            <td className="px-4 py-2">{match.transactionComptable.libelle}</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(match.transactionBancaire.montant)}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-slate-500">Aucune correspondance trouvée</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


const ReconciliationReport: React.FC<ReconciliationReportProps> = ({ result }) => {
    const { summary, matches } = result;
    
    const ecartFinal = summary.residualGap;
    const coveragePercentage = (summary.coverageRatio * 100).toFixed(1);

    return (
        <div className="w-full mx-auto bg-white p-8 my-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">État de Rapprochement Bancaire</h2>
            <p className="text-center text-slate-500 mb-8">Généré par IA</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800">Total Bancaire</h4>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.bankTotal)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800">Total Comptable</h4>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.accountingTotal)}</p>
                </div>
                <div className={`p-4 rounded-lg border ${Math.abs(ecartFinal) < 0.01 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <h4 className={`font-semibold ${Math.abs(ecartFinal) < 0.01 ? 'text-green-800' : 'text-red-800'}`}>Écart Résiduel</h4>
                    <p className={`text-2xl font-bold ${Math.abs(ecartFinal) < 0.01 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(ecartFinal)}</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="max-w-3xl mx-auto border border-slate-300 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-slate-700">
                    <tbody>
                        <tr className="bg-slate-100">
                            <td className="font-semibold p-3">Transactions rapprochées</td>
                            <td className="text-right p-3 font-mono">{summary.matchedCount}</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                            <td className="font-semibold p-3">Transactions en suspens</td>
                            <td className="text-right p-3 font-mono">{summary.suspenseCount}</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                            <td className="font-semibold p-3">Taux de couverture</td>
                            <td className="text-right p-3 font-mono">{coveragePercentage}%</td>
                        </tr>
                        <tr className="bg-slate-100 border-t-2 border-slate-300">
                            <td className="font-bold p-3">Écart initial</td>
                            <td className="text-right p-3 font-bold font-mono">{formatCurrency(summary.initialGap)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 text-center mb-6">Détail des Rapprochements</h3>
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-4 py-3">N° R</th>
                                <th scope="col" className="px-4 py-3">Date Banque</th>
                                <th scope="col" className="px-4 py-3">Libellé Banque</th>
                                <th scope="col" className="px-4 py-3">Date Compta</th>
                                <th scope="col" className="px-4 py-3">Libellé Compta</th>
                                <th scope="col" className="px-4 py-3">Montant</th>
                                <th scope="col" className="px-4 py-3">Règle</th>
                                <th scope="col" className="px-4 py-3">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length > 0 ? matches.map((match, index) => (
                                <tr key={index} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-2 font-mono text-xs">{match.reconId || '-'}</td>
                                    <td className="px-4 py-2">{match.bankTx.date}</td>
                                    <td className="px-4 py-2">{match.bankTx.description}</td>
                                    <td className="px-4 py-2">{match.accountingTx?.date || '-'}</td>
                                    <td className="px-4 py-2">{match.accountingTx?.description || '-'}</td>
                                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(match.bankTx.amount)}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            match.rule === 'exact' ? 'bg-green-100 text-green-800' :
                                            match.rule === 'fuzzy_strong' ? 'bg-blue-100 text-blue-800' :
                                            match.rule === 'fuzzy_weak' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {match.rule}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">{(match.score * 100).toFixed(0)}%</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-slate-500">Aucun rapprochement trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReconciliationReport;
