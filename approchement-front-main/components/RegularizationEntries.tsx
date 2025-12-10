import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, ChevronDown, ChevronRight, Download, AlertCircle, BookOpen } from 'lucide-react';
import { apiService } from '../services/apiService';

interface RegularizationEntriesProps {
  jobId: string;
}

interface RegularizationEntry {
  entry_number: string;
  date: string;
  description: string;
  lines: Array<{
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
    description: string;
  }>;
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
}

const RegularizationEntries: React.FC<RegularizationEntriesProps> = ({ jobId }) => {
  const [entries, setEntries] = useState<RegularizationEntry[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadRegularizationEntries();
  }, [jobId]);

  const loadRegularizationEntries = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getRegularizationEntries(jobId);
      setEntries(response.entries || []);
      setValidation(response.validation || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEntry = (entryNumber: string) => {
    setExpandedEntry(expandedEntry === entryNumber ? null : entryNumber);
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-white">Chargement des écritures...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Erreur: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      {validation && (
        <div className={`p-6 rounded-lg border backdrop-blur-sm ${
          validation.valid 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold flex items-center gap-2 ${
                validation.valid ? 'text-green-300' : 'text-red-300'
              }`}>
                {validation.valid ? (
                  <><CheckCircle className="w-5 h-5" /> Écritures Valides</>
                ) : (
                  <><XCircle className="w-5 h-5" /> Écritures Invalides</>
                )}
              </h3>
              <p className="text-sm text-white/70 mt-1">
                {validation.total_entries} écritures générées • 
                {validation.balanced_entries} équilibrées • 
                {validation.unbalanced_entries} déséquilibrées
              </p>
            </div>
            {!validation.valid && validation.errors && (
              <div className="text-sm text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {validation.errors.length} erreur(s) détectée(s)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Écritures de Régularisation
          </h3>
          <p className="text-sm text-white/70 mt-1">
            Écritures comptables générées automatiquement pour les opérations en suspens selon PCN tunisien
          </p>
        </div>

        {/* Pagination Controls */}
        {entries.length > 0 && (
          <div className="px-6 py-3 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Afficher:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={entries.length}>Tout</option>
              </select>
              <span className="text-sm text-white/70">par page</span>
            </div>
            <div className="text-sm text-white/70">
              {Math.min((currentPage - 1) * itemsPerPage + 1, entries.length)} - {Math.min(currentPage * itemsPerPage, entries.length)} sur {entries.length}
            </div>
          </div>
        )}

        <div className="divide-y divide-white/10">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-white/30 mb-4" />
              <p className="text-white/50">Aucune écriture de régularisation générée</p>
              <p className="text-white/40 text-sm mt-2">Les écritures seront générées automatiquement pour les suspens</p>
            </div>
          ) : (
            entries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((entry) => (
              <div key={entry.entry_number} className="p-4">
                {/* Entry Header */}
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-3 rounded transition-colors"
                  onClick={() => toggleEntry(entry.entry_number)}
                >
                  <div className="flex items-center gap-4">
                    {expandedEntry === entry.entry_number ? (
                      <ChevronDown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    )}
                    <div>
                      <div className="font-medium text-white font-mono">
                        {entry.entry_number}
                      </div>
                      <div className="text-sm text-white/70">
                        {entry.date} • {entry.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-white/50">Total</div>
                      <div className="font-mono font-medium text-white">
                        {entry.total_debit.toFixed(3)} TND
                      </div>
                    </div>
                    <div>
                      {entry.is_balanced ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Équilibré
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Déséquilibré
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entry Details */}
                {expandedEntry === entry.entry_number && (
                  <div className="mt-4 ml-8 bg-white/5 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-white/70">Compte</th>
                          <th className="px-4 py-3 text-left font-medium text-white/70">Libellé</th>
                          <th className="px-4 py-3 text-left font-medium text-white/70">Description</th>
                          <th className="px-4 py-3 text-right font-medium text-white/70">Débit</th>
                          <th className="px-4 py-3 text-right font-medium text-white/70">Crédit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {entry.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-mono text-purple-300">{line.account_code}</td>
                            <td className="px-4 py-3 text-white/90">{line.account_name}</td>
                            <td className="px-4 py-3 text-white/70">{line.description}</td>
                            <td className="px-4 py-3 text-right font-mono text-white/90">
                              {line.debit > 0 ? line.debit.toFixed(3) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-white/90">
                              {line.credit > 0 ? line.credit.toFixed(3) : '-'}
                            </td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-white/10 font-semibold">
                          <td colSpan={3} className="px-4 py-3 text-right text-white">Total:</td>
                          <td className="px-4 py-3 text-right font-mono text-green-400">
                            {entry.total_debit.toFixed(3)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-green-400">
                            {entry.total_credit.toFixed(3)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {entries.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(entries.length / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(entries.length / itemsPerPage);
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="text-white/50">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded ${
                        currentPage === page
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(entries.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(entries.length / itemsPerPage)}
              className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Export Options */}
      {entries.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm">
          <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export des Écritures
          </h4>
          <p className="text-sm text-white/70 mb-4">
            Les écritures peuvent être exportées au format CSV pour import dans votre logiciel comptable (Sage, TSI, etc.)
          </p>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reconcile/${jobId}/regularization/export`, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
                const data = await response.json();
                if (data.success && data.downloadUrl) {
                  const link = document.createElement('a');
                  link.href = `${import.meta.env.VITE_API_BASE_URL}${data.downloadUrl}`;
                  link.download = data.filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              } catch (err) {
                console.error('Export failed:', err);
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg flex items-center gap-2 font-medium"
          >
            <Download className="w-4 h-4" />
            Exporter en CSV
          </button>
        </div>
      )}

      {/* PCN Reference */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Comptes PCN Utilisés (Plan Comptable National Tunisien)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="text-white/90"><span className="font-mono text-purple-300">532</span> - Banques</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">627</span> - Frais bancaires</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">656</span> - Charges financières</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">756</span> - Produits financiers</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">471</span> - Comptes d'attente</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">5112</span> - Chèques à encaisser</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">401</span> - Fournisseurs</div>
          <div className="text-white/90"><span className="font-mono text-purple-300">411</span> - Clients</div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Conformité PCN: Toutes les écritures respectent les normes comptables tunisiennes
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegularizationEntries;
