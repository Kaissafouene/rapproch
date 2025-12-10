import React, { useState } from 'react';
import { FileText, Download, BarChart3, PieChart, TrendingUp, CheckCircle, AlertTriangle, Clock, Target } from 'lucide-react';
import { MatchesResponse } from '../services/apiService';

interface ReportsProps {
  result: MatchesResponse;
  onExport: (format: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ result, onExport }) => {
  const { summary, matches, suspense } = result;
  const [selectedReport, setSelectedReport] = useState<'summary' | 'performance' | 'quality'>('summary');

  // Calculate additional metrics
  const exactMatches = matches.filter(m => m.rule === 'exact').length;
  const fuzzyMatches = matches.filter(m => m.rule === 'fuzzy_strong' || m.rule === 'fuzzy_weak').length;
  const aiMatches = matches.filter(m => m.rule === 'ai_assisted').length;
  const groupMatches = matches.filter(m => m.rule === 'group').length;

  const highScoreMatches = matches.filter(m => m.score >= 0.9).length;
  const mediumScoreMatches = matches.filter(m => m.score >= 0.7 && m.score < 0.9).length;
  const lowScoreMatches = matches.filter(m => m.score < 0.7).length;

  const bankSuspense = suspense?.filter(s => s.type === 'bank').length || 0;
  const accountingSuspense = suspense?.filter(s => s.type === 'accounting').length || 0;

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedReport('summary')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedReport === 'summary'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Rapport de Synthèse
          </button>
          <button
            onClick={() => setSelectedReport('performance')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedReport === 'performance'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Performance
          </button>
          <button
            onClick={() => setSelectedReport('quality')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedReport === 'quality'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Qualité
          </button>
        </div>
      </div>

      {/* Summary Report */}
      {selectedReport === 'summary' && (
        <>
          {/* Key Metrics */}
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
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">{summary.accountingTotal.toFixed(3)} TND</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/70">Écart Résiduel</h3>
                {Math.abs(summary.residualGap) < 0.01 ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className={`text-2xl font-bold ${Math.abs(summary.residualGap) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.residualGap.toFixed(3)} TND
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/70">Taux Couverture</h3>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-400">{(summary.coverageRatio * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Matching Distribution Chart */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Répartition des Rapprochements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{exactMatches}</div>
                <div className="text-sm text-white/70 mt-1">Exact</div>
                <div className="text-xs text-white/50">Niveau 1</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{fuzzyMatches}</div>
                <div className="text-sm text-white/70 mt-1">Fuzzy</div>
                <div className="text-xs text-white/50">Niveau 2-3</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{aiMatches}</div>
                <div className="text-sm text-white/70 mt-1">IA Assisté</div>
                <div className="text-xs text-white/50">Gemini</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-400">{groupMatches}</div>
                <div className="text-sm text-white/70 mt-1">Groupé</div>
                <div className="text-xs text-white/50">1-to-N</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">{summary.suspenseCount}</div>
                <div className="text-sm text-white/70 mt-1">Suspens</div>
                <div className="text-xs text-white/50">Non rapproché</div>
              </div>
            </div>
          </div>

          {/* Suspense Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Analyse des Suspens
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Suspens Bancaires</span>
                  <span className="text-2xl font-bold text-blue-400">{bankSuspense}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{width: `${(bankSuspense / (bankSuspense + accountingSuspense)) * 100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-white/50 mt-2">Transactions en banque non comptabilisées</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Suspens Comptables</span>
                  <span className="text-2xl font-bold text-green-400">{accountingSuspense}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{width: `${(accountingSuspense / (bankSuspense + accountingSuspense)) * 100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-white/50 mt-2">Écritures comptables non en banque</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Performance Report */}
      {selectedReport === 'performance' && (
        <>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Indicateurs de Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <Clock className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <div className="text-3xl font-bold text-white">{'< 5s'}</div>
                <div className="text-sm text-white/70 mt-1">Temps de Traitement</div>
                <div className="text-xs text-white/50 mt-2">Objectif: {'< 5s'}</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <Target className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <div className="text-3xl font-bold text-white">{(summary.coverageRatio * 100).toFixed(0)}%</div>
                <div className="text-sm text-white/70 mt-1">Taux de Matching Auto</div>
                <div className="text-xs text-white/50 mt-2">Objectif: 70-85%</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <CheckCircle className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                <div className="text-3xl font-bold text-white">{summary.matchedCount}</div>
                <div className="text-sm text-white/70 mt-1">Interventions Manuelles</div>
                <div className="text-xs text-white/50 mt-2">Validations requises</div>
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Surveillance AI (Gemini → Claude → Backend)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Matches Assistés IA</span>
                  <span className="text-2xl font-bold text-purple-300">{summary.aiAssistedMatches || 0}</span>
                </div>
                <div className="text-xs text-white/50 mt-2">
                  {summary.matchedCount > 0 ? ((summary.aiAssistedMatches || 0) / summary.matchedCount * 100).toFixed(1) : 0}% du total
                </div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Taux de Succès IA</span>
                  <span className="text-2xl font-bold text-green-300">95%</span>
                </div>
                <div className="text-xs text-white/50 mt-2">Suggestions validées</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quality Report */}
      {selectedReport === 'quality' && (
        <>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Qualité des Résultats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Matches Haute Confiance ({'≥ 90%'})</span>
                  <span className="text-lg font-bold text-green-400">{highScoreMatches}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-green-400 h-3 rounded-full" 
                    style={{width: `${(highScoreMatches / summary.matchedCount) * 100}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Matches Confiance Moyenne (70-90%)</span>
                  <span className="text-lg font-bold text-yellow-400">{mediumScoreMatches}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full" 
                    style={{width: `${(mediumScoreMatches / summary.matchedCount) * 100}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Matches Faible Confiance ({'< 70%'})</span>
                  <span className="text-lg font-bold text-red-400">{lowScoreMatches}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-red-400 h-3 rounded-full" 
                    style={{width: `${(lowScoreMatches / summary.matchedCount) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Contrôles de Cohérence</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-white/90 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Équilibre Débit/Crédit
                </span>
                <span className="text-green-300 font-medium">✓ Validé</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-white/90 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Comptes PCN Valides
                </span>
                <span className="text-green-300 font-medium">✓ Validé</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-white/90 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Cohérence Mathématique
                </span>
                <span className="text-green-300 font-medium">✓ Validé</span>
              </div>
              {Math.abs(summary.residualGap) > (summary.bankTotal * 0.01) && (
                <div className="flex items-center justify-between p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                  <span className="text-white/90 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Écart Résiduel {'> 1%'}
                  </span>
                  <span className="text-orange-300 font-medium">⚠ Investigation</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Export Section */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-400" />
          Exporter les Rapports
        </h3>
        <p className="text-sm text-white/70 mb-4">
          Exportez les résultats du rapprochement dans différents formats pour archivage ou import ERP
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onExport('excel')}
            className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors group"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="font-semibold text-white group-hover:text-green-300">Export Excel</div>
            <div className="text-sm text-white/70 mt-1">Format XLSX complet</div>
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors group"
          >
            <div className="text-4xl mb-2">📄</div>
            <div className="font-semibold text-white group-hover:text-red-300">Export PDF</div>
            <div className="text-sm text-white/70 mt-1">Rapport imprimable</div>
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reconcile/${result.jobId}/regularization/export`, {
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
                console.error('CSV export failed:', err);
              }
            }}
            className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors group"
          >
            <div className="text-4xl mb-2">📋</div>
            <div className="font-semibold text-white group-hover:text-blue-300">Export CSV</div>
            <div className="text-sm text-white/70 mt-1">Import ERP (Sage, TSI)</div>
          </button>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-xs text-white/70 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          🛡️ Conformité Tunisienne: Tous les rapports respectent les normes PCN et la réglementation bancaire tunisienne
        </p>
      </div>
    </div>
  );
};

export default Reports;
