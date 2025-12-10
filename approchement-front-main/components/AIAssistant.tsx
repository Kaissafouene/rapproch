import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface AIAssistantProps {
  onSuggestion: (suggestion: any) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onSuggestion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'similarity' | 'categorize' | 'pcn'>('similarity');
  
  // Similarity check
  const [label1, setLabel1] = useState('');
  const [label2, setLabel2] = useState('');
  const [similarityResult, setSimilarityResult] = useState<any>(null);
  
  // Categorization
  const [description, setDescription] = useState('');
  const [categoryResult, setCategoryResult] = useState<any>(null);
  
  // PCN validation
  const [accountCode, setAccountCode] = useState('');
  const [pcnResult, setPcnResult] = useState<any>(null);

  const checkSimilarity = async () => {
    if (!label1.trim() || !label2.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label1: label1.trim(), label2: label2.trim() })
      });
      const result = await response.json();
      setSimilarityResult(result);
      onSuggestion({ type: 'similarity', data: result });
    } catch (error) {
      console.error('Erreur AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeTransaction = async () => {
    if (!description.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() })
      });
      const result = await response.json();
      setCategoryResult(result);
      onSuggestion({ type: 'category', data: result });
    } catch (error) {
      console.error('Erreur AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePCN = async () => {
    if (!accountCode.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/validate-pcn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_code: accountCode.trim() })
      });
      const result = await response.json();
      setPcnResult(result);
      onSuggestion({ type: 'pcn', data: result });
    } catch (error) {
      console.error('Erreur AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <div className="px-6 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
          Assistant IA Multi-Modèles
        </h3>
        <p className="text-sm text-white/70 mt-1">
          Gemini → Claude → Logique Backend (3-tier fallback)
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/20">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('similarity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'similarity'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Similarité
          </button>
          <button
            onClick={() => setActiveTab('categorize')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categorize'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Catégorisation
          </button>
          <button
            onClick={() => setActiveTab('pcn')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pcn'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Validation PCN
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Similarity Tab */}
        {activeTab === 'similarity' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Libellé 1
              </label>
              <input
                type="text"
                value={label1}
                onChange={(e) => setLabel1(e.target.value)}
                placeholder="ex: VIREMENT SALAIRE NOVEMBRE"
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Libellé 2
              </label>
              <input
                type="text"
                value={label2}
                onChange={(e) => setLabel2(e.target.value)}
                placeholder="ex: SALAIRE MOIS 11"
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              onClick={checkSimilarity}
              disabled={isLoading || !label1.trim() || !label2.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? 'Analyse...' : 'Comparer Similarité'}
            </button>
            
            {similarityResult && (
              <div className="mt-4 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <h4 className="font-medium text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Résultat IA:
                </h4>
                <p className="text-sm text-purple-200 mt-2">
                  Similarité: <span className="font-bold text-lg">{(similarityResult.similarity * 100).toFixed(0)}%</span>
                </p>
                <p className="text-sm text-purple-300">
                  Confiance: {similarityResult.confidence}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categorization Tab */}
        {activeTab === 'categorize' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description de la transaction
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: COMMISSION VIREMENT INTERNATIONAL"
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              onClick={categorizeTransaction}
              disabled={isLoading || !description.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? 'Analyse...' : 'Catégoriser'}
            </button>
            
            {categoryResult && (
              <div className="mt-4 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <h4 className="font-medium text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Catégorie Suggérée:
                </h4>
                <p className="text-lg font-bold text-purple-200 mt-2">
                  {categoryResult.category}
                </p>
                <p className="text-sm text-purple-300">
                  Confiance: {(categoryResult.confidence * 100).toFixed(0)}%
                </p>
                <div className="mt-3 text-xs text-purple-200">
                  <p className="font-medium">Catégories disponibles:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-white/70">
                    {Object.entries(categoryResult.suggestions || {}).map(([key, value]) => (
                      <li key={key}>{key}: {value as string}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PCN Validation Tab */}
        {activeTab === 'pcn' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Code Compte PCN
              </label>
              <input
                type="text"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="ex: 512000"
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              onClick={validatePCN}
              disabled={isLoading || !accountCode.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? 'Validation...' : 'Valider PCN'}
            </button>
            
            {pcnResult && (
              <div className="mt-4 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <h4 className="font-medium text-purple-300 flex items-center gap-2">
                  {pcnResult.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  Validation PCN:
                </h4>
                <p className={`text-lg font-bold mt-2 flex items-center gap-2 ${
                  pcnResult.valid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pcnResult.valid ? (
                    <><CheckCircle className="w-5 h-5" /> Valide</>
                  ) : (
                    <><AlertCircle className="w-5 h-5" /> Invalide</>
                  )}
                </p>
                <p className="text-sm text-purple-300">
                  Confiance: {(pcnResult.confidence * 100).toFixed(0)}%
                </p>
                <div className="mt-3 text-xs text-purple-200">
                  <p className="font-medium">Structure PCN Tunisien:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-white/70">
                    {Object.entries(pcnResult.pcnInfo || {}).map(([key, value]) => (
                      <li key={key}>{value as string}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Status */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Gemini 2.0 → Claude 3.5
            </span>
            <span>Temperature: 0.1</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Actif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;