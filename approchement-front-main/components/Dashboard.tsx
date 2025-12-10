import React, { useState } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, FileText, Download, Eye, Check, X, AlertTriangle } from 'lucide-react';
import { MatchesResponse } from '../services/apiService';

interface DashboardProps {
  result: MatchesResponse;
  onValidateMatch: (matchId: string, action: string, accountCode?: string) => void;
  onExport: (format: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onValidateMatch, onExport }) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'matched' | 'suspense'>('all');
  const [accountCode, setAccountCode] = useState('');
  const [suspensePage, setSuspensePage] = useState(1);
  const [suspensePageSize, setSuspensePageSize] = useState(20);
  const [isExporting, setIsExporting] = useState(false);

  const { summary, matches, suspense } = result;

  // Pagination for suspense items
  const totalSuspensePages = suspense ? Math.ceil(suspense.length / suspensePageSize) : 0;
  const paginatedSuspense = suspense ? suspense.slice(
    (suspensePage - 1) * suspensePageSize,
    suspensePage * suspensePageSize
  ) : [];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'matched') return match.status === 'matched';
    if (filter === 'suspense') return match.status === 'suspense';
    return true;
  });

  const getRuleColor = (rule: string) => {
    switch (rule) {
      case 'exact': return 'bg-green-100 text-green-800';
      case 'fuzzy_strong': return 'bg-blue-100 text-blue-800';
      case 'fuzzy_weak': return 'bg-yellow-100 text-yellow-800';
      case 'ai_assisted': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleValidation = (matchId: string, action: string) => {
    onValidateMatch(matchId, action, accountCode);
    setSelectedMatch(null);
    setAccountCode('');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Total Bancaire</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{summary.bankTotal.toFixed(3)} TND</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Total Comptable</h3>
            <TrendingDown className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{summary.accountingTotal.toFixed(3)} TND</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Écart Résiduel</h3>
            {Math.abs(summary.residualGap) < 0.01 ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${Math.abs(summary.residualGap) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.residualGap.toFixed(3)} TND
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Taux de Couverture</h3>
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{(summary.coverageRatio * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Métriques de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{summary.matchedCount}</div>
            <div className="text-sm text-white/70">Rapprochées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">{summary.suspenseCount}</div>
            <div className="text-sm text-white/70">En Suspens</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{summary.aiAssistedMatches || 0}</div>
            <div className="text-sm text-white/70">Assistés IA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{(summary.coverageRatio * 100).toFixed(0)}%</div>
            <div className="text-sm text-white/70">Taux Matching</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Tous ({matches.length})
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'matched' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Rapprochés ({matches.filter(m => m.status === 'matched').length})
            </button>
            <button
              onClick={() => setFilter('suspense')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'suspense' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Suspens ({suspense?.length || 0})
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Export...' : 'Excel'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Export...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Détail des Rapprochements
          </h3>
          <p className="text-sm text-white/70 mt-1">Validation manuelle requise selon cahier des charges</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">N° R</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Date Banque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Libellé Banque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Date Compta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Libellé Compta</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase">Montant</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase">Règle</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase">Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMatches.map((match) => (
                <tr key={match.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-purple-300">{match.reconId || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white/90">{match.bankTx.date}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate text-white/90" title={match.bankTx.description}>{match.bankTx.description}</td>
                  <td className="px-4 py-3 text-sm text-white/90">{match.accountingTx?.date || '-'}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate text-white/90" title={match.accountingTx?.description}>{match.accountingTx?.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-white/90">{match.bankTx.amount.toFixed(3)} TND</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRuleColor(match.rule)}`}>
                      {match.rule}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      match.score >= 0.9 ? 'bg-green-500/20 text-green-300' :
                      match.score >= 0.7 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {(match.score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedMatch(match.id)}
                      className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3 h-3" />
                      Valider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspense Items */}
      {suspense && suspense.length > 0 && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Opérations en Suspens</h3>
            <p className="text-sm text-gray-500 mt-1">
              Transactions non rapprochées nécessitant une régularisation comptable
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie IA</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Confiance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSuspense.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'bank' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'bank' ? 'Bancaire' : 'Comptable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.transaction.date}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" title={item.transaction.description}>
                      {item.transaction.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {item.transaction.amount.toFixed(3)} TND
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.suggestedCategory ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {item.suggestedCategory}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {item.aiConfidence ? (
                        <span className={`px-2 py-1 text-xs rounded ${
                          item.aiConfidence > 0.8 
                            ? 'bg-green-100 text-green-800' 
                            : item.aiConfidence > 0.6 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(item.aiConfidence * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                🤖 Les catégories et comptes PCN sont suggérés par l'IA Gemini.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Afficher:</label>
                  <select
                    value={suspensePageSize}
                    onChange={(e) => {
                      setSuspensePageSize(Number(e.target.value));
                      setSuspensePage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={suspense?.length || 100}>Tous</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSuspensePage(Math.max(1, suspensePage - 1))}
                    disabled={suspensePage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Préc
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {suspensePage} / {totalSuspensePages}
                  </span>
                  <button
                    onClick={() => setSuspensePage(Math.min(totalSuspensePages, suspensePage + 1))}
                    disabled={suspensePage === totalSuspensePages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suiv
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Validation du Rapprochement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Compte PCN (optionnel)
                </label>
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="ex: 512000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleValidation(selectedMatch, 'confirm')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => handleValidation(selectedMatch, 'unmatch')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;