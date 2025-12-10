import React, { useState } from 'react';

interface ReconciliationRules {
  amount_tolerance: number;
  date_tolerance_days: number;
  fuzzy_date_tolerance_days: number;
  weak_date_tolerance_days: number;
  label_similarity_threshold: number;
  fuzzy_label_threshold: number;
  weak_label_threshold: number;
  enable_group_matching: boolean;
  max_group_size: number;
  enable_ai_assistance: boolean;
}

interface ControlPanelProps {
  rules: ReconciliationRules;
  onRulesChange: (rules: ReconciliationRules) => void;
  onReconcile: () => void;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  rules, 
  onRulesChange, 
  onReconcile, 
  isProcessing 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateRule = (key: keyof ReconciliationRules, value: any) => {
    onRulesChange({ ...rules, [key]: value });
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <div className="px-6 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold text-white">Paramètres de Rapprochement</h3>
        <p className="text-sm text-white/70 mt-1">
          Configuration des règles de matching selon les normes tunisiennes
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Matching Rules */}
        <div>
          <h4 className="font-medium text-white mb-4">Règles de Correspondance</h4>
          
          {/* Tier 1 - Exact Match */}
          <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg mb-4">
            <h5 className="font-medium text-green-300 mb-3">Niveau 1 - Correspondance Exacte</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">
                  Tolérance Montant (TND)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rules.amount_tolerance}
                  onChange={(e) => updateRule('amount_tolerance', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">
                  Tolérance Date (jours)
                </label>
                <input
                  type="number"
                  value={rules.date_tolerance_days}
                  onChange={(e) => updateRule('date_tolerance_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-200 mb-1">
                  Similarité Libellé (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.label_similarity_threshold * 100}
                  onChange={(e) => updateRule('label_similarity_threshold', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          {/* Tier 2 - Strong Fuzzy */}
          <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg mb-4">
            <h5 className="font-medium text-blue-300 mb-3">Niveau 2 - Correspondance Forte</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Tolérance Date (jours)
                </label>
                <input
                  type="number"
                  value={rules.fuzzy_date_tolerance_days}
                  onChange={(e) => updateRule('fuzzy_date_tolerance_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Similarité Libellé (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.fuzzy_label_threshold * 100}
                  onChange={(e) => updateRule('fuzzy_label_threshold', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Tier 3 - Weak Fuzzy */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-lg mb-4">
            <h5 className="font-medium text-yellow-300 mb-3">Niveau 3 - Correspondance Faible</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Tolérance Date (jours)
                </label>
                <input
                  type="number"
                  value={rules.weak_date_tolerance_days}
                  onChange={(e) => updateRule('weak_date_tolerance_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-1">
                  Similarité Libellé (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rules.weak_label_threshold * 100}
                  onChange={(e) => updateRule('weak_label_threshold', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            Options Avancées
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-white/20">
              {/* Group Matching */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-white">Matching Groupé (1-to-N)</label>
                  <p className="text-sm text-white/70">Permet de rapprocher une écriture bancaire avec plusieurs écritures comptables</p>
                </div>
                <input
                  type="checkbox"
                  checked={rules.enable_group_matching}
                  onChange={(e) => updateRule('enable_group_matching', e.target.checked)}
                  className="h-5 w-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {rules.enable_group_matching && (
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Taille Max du Groupe
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={rules.max_group_size}
                    onChange={(e) => updateRule('max_group_size', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              )}

              {/* AI Assistance */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-white">Assistance IA (Gemini)</label>
                  <p className="text-sm text-white/70">Active l'assistance IA pour la similarité et catégorisation</p>
                </div>
                <input
                  type="checkbox"
                  checked={rules.enable_ai_assistance}
                  onChange={(e) => updateRule('enable_ai_assistance', e.target.checked)}
                  className="h-5 w-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Performance Indicators */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
          <h4 className="font-medium text-white mb-3">Indicateurs de Performance Attendus</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">70-85%</div>
              <div className="text-white/70">Taux de Matching Auto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">&lt; 5s</div>
              <div className="text-white/70">Temps de Traitement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">95%+</div>
              <div className="text-white/70">Précision des Matches</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/20">
          <button
            onClick={onReconcile}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Rapprochement en cours...
              </span>
            ) : (
              'Lancer le Rapprochement'
            )}
          </button>
        </div>

        {/* Compliance Note */}
        <div className="text-xs text-white/70 bg-white/5 border border-white/10 p-3 rounded">
          <p className="font-medium text-white mb-1">🛡️ Conformité Tunisienne:</p>
          <ul className="space-y-1">
            <li>• Respect des normes PCN (Plan Comptable National)</li>
            <li>• Génération automatique des N° R (Numéros de Rapprochement)</li>
            <li>• Traçabilité complète pour audit</li>
            <li>• Validation manuelle obligatoire pour les écritures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;