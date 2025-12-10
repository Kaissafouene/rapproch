
import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Settings, Bot } from 'lucide-react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import ControlPanel from './components/ControlPanel';
import AuthContainer from './components/AuthContainer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import RegularizationEntries from './components/RegularizationEntries';
import Reports from './components/Reports';
import { apiService, UploadResponse, MatchesResponse } from './services/apiService';
import type { Transaction, ReconciliationResult } from './types';

const App: React.FC = () => {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    
    // Application state
    const [bankFile, setBankFile] = useState<File | null>(null);
    const [journalFile, setJournalFile] = useState<File | null>(null);
    
    const [bankUpload, setBankUpload] = useState<UploadResponse | null>(null);
    const [accountingUpload, setAccountingUpload] = useState<UploadResponse | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<MatchesResponse | null>(null);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'config' | 'ai' | 'results' | 'regularization' | 'reports' | 'audit'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Reconciliation rules state
    const [reconciliationRules, setReconciliationRules] = useState({
        amount_tolerance: 0.01,
        date_tolerance_days: 1,
        fuzzy_date_tolerance_days: 3,
        weak_date_tolerance_days: 7,
        label_similarity_threshold: 0.95,
        fuzzy_label_threshold: 0.80,
        weak_label_threshold: 0.60,
        enable_group_matching: true,
        max_group_size: 5,
        enable_ai_assistance: true
    });
    
    // Check for existing token on app load
    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user_info');
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);
    
    // Load latest reconciliation when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            setIsLoadingData(true);
            apiService.listReconciliations()
                .then(reconciliations => {
                    if (reconciliations && reconciliations.length > 0) {
                        const latest = reconciliations[0];
                        setCurrentJobId(latest.jobId);
                        return apiService.getMatches(latest.jobId);
                    }
                    return null;
                })
                .then(matchesResponse => {
                    if (matchesResponse) {
                        setResult(matchesResponse);
                    }
                })
                .catch(err => console.error('Failed to load reconciliations:', err))
                .finally(() => setIsLoadingData(false));
        }
    }, [isAuthenticated]);
    
    const handleLogin = (authToken: string, userData: any) => {
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_info', JSON.stringify(userData));
    };
    
    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        // Reset application state
        setBankFile(null);
        setJournalFile(null);
        setBankUpload(null);
        setAccountingUpload(null);
        setResult(null);
        setCurrentJobId(null);
        setActiveTab('dashboard');
    };

    const handleBankFileSelect = useCallback(async (file: File) => {
        setBankFile(file);
        setError(null);
        setResult(null);
        setIsLoading(true);
        setLoadingMessage('Téléchargement du fichier bancaire...');
        
        try {
            // Verify token exists
            const currentToken = localStorage.getItem('auth_token');
            if (!currentToken) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            const uploadResponse = await apiService.uploadBankFile(file);
            setBankUpload(uploadResponse);
        } catch (e: any) {
            setError(`Erreur dans le fichier bancaire: ${e.message}`);
            setBankUpload(null);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleJournalFileSelect = useCallback(async (file: File) => {
        setJournalFile(file);
        setError(null);
        setResult(null);
        setIsLoading(true);
        setLoadingMessage('Téléchargement du fichier comptable...');
        
        try {
            // Verify token exists
            const currentToken = localStorage.getItem('auth_token');
            if (!currentToken) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            const uploadResponse = await apiService.uploadAccountingFile(file);
            setAccountingUpload(uploadResponse);
        } catch (e: any) {
            setError(`Erreur dans le fichier comptable: ${e.message}`);
            setAccountingUpload(null);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleReconciliation = async () => {
        if (!bankUpload || !accountingUpload) {
            setError("Veuillez charger les deux fichiers avant de lancer le rapprochement.");
            return;
        }

        setError(null);
        setResult(null);
        setIsLoading(true);
        setLoadingMessage("Moteur de rapprochement en cours... Application des règles de matching.");

        try {
            // Get current token
            const currentToken = localStorage.getItem('auth_token');
            if (!currentToken) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            
            // Start reconciliation with custom rules
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reconcile`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({
                    bank_file: bankUpload.uploadId,
                    accounting_file: accountingUpload.uploadId,
                    rules: reconciliationRules
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Reconciliation failed');
            }
            
            const reconcileResponse = await response.json();
            setCurrentJobId(reconcileResponse.jobId);
            
            // Get the results
            const matchesResponse = await apiService.getMatches(reconcileResponse.jobId);
            setResult(matchesResponse);
            setActiveTab('results');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleValidateMatch = async (matchId: string, action: string, accountCode?: string) => {
        if (!currentJobId) return;
        
        try {
            await apiService.validateMatch(currentJobId, matchId, action, accountCode);
            // Refresh results
            const updatedResults = await apiService.getMatches(currentJobId);
            setResult(updatedResults);
        } catch (e: any) {
            setError(e.message);
        }
    };
    
    const handleExport = async (format: string) => {
        if (!currentJobId) return;
        
        try {
            const exportData = await apiService.exportResults(currentJobId, format);
            
            if (exportData.success && exportData.downloadUrl) {
                // Create download link
                const link = document.createElement('a');
                link.href = `${import.meta.env.VITE_API_BASE_URL}${exportData.downloadUrl}`;
                link.download = exportData.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error('Export failed: No download URL received');
            }
        } catch (e: any) {
            setError(`Erreur d'export: ${e.message}`);
        }
    };
    
    const handleAISuggestion = (suggestion: any) => {
        console.log('AI Suggestion:', suggestion);
        // Handle AI suggestions
    };

    const isReady = bankFile && journalFile && bankUpload && accountingUpload;

    // Show auth (login/register) if not authenticated
    if (!isAuthenticated) {
        return <AuthContainer onAuth={handleLogin} />;
    }

    return (
        <div className="min-h-screen font-sans flex relative overflow-hidden">
            <div className="relative z-10 flex w-full">
            {isLoading && <Loader message={loadingMessage} />}
            
            {/* Sidebar with transparent background */}
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                user={user} 
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header 
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />
                
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto w-full">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white">
                            {activeTab === 'dashboard' && 'Tableau de Bord'}
                            {activeTab === 'upload' && 'Import Documents'}
                            {activeTab === 'config' && 'Configuration'}
                            {activeTab === 'ai' && 'Assistant IA'}
                            {activeTab === 'results' && 'Résultats'}
                            {activeTab === 'regularization' && 'Écritures de Régularisation'}
                            {activeTab === 'reports' && 'Rapports'}
                            {activeTab === 'audit' && 'Audit Logs'}
                        </h1>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
                                    <h3 className="text-sm font-medium text-white/70 mb-2">Fichiers Chargés</h3>
                                    <p className="text-3xl font-bold text-white">{currentJobId ? 2 : (bankUpload ? 1 : 0) + (accountingUpload ? 1 : 0)}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
                                    <h3 className="text-sm font-medium text-white/70 mb-2">Rapprochements</h3>
                                    <p className="text-3xl font-bold text-green-400">{result?.summary.matchedCount || 0}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
                                    <h3 className="text-sm font-medium text-white/70 mb-2">En Suspens</h3>
                                    <p className="text-3xl font-bold text-orange-400">{result?.summary.suspenseCount || 0}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
                                    <h3 className="text-sm font-medium text-white/70 mb-2">Taux Couverture</h3>
                                    <p className="text-3xl font-bold text-purple-400">{result ? (result.summary.coverageRatio * 100).toFixed(1) + '%' : '0%'}</p>
                                </div>
                            </div>

                            {/* Chart Visualization */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Répartition des Transactions</h3>
                                {result && (result.summary.matchedCount > 0 || result.summary.suspenseCount > 0) ? (
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                        {/* Donut Chart */}
                                        <div className="relative w-64 h-64">
                                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                                {/* Background circle */}
                                                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="40"/>
                                                {/* Matched segment */}
                                                <circle 
                                                    cx="100" 
                                                    cy="100" 
                                                    r="80" 
                                                    fill="none" 
                                                    stroke="#10b981" 
                                                    strokeWidth="40"
                                                    strokeDasharray={`${(result.summary.matchedCount / (result.summary.matchedCount + result.summary.suspenseCount)) * 502.65} 502.65`}
                                                    className="transition-all duration-1000"
                                                />
                                                {/* Suspense segment */}
                                                <circle 
                                                    cx="100" 
                                                    cy="100" 
                                                    r="80" 
                                                    fill="none" 
                                                    stroke="#f97316" 
                                                    strokeWidth="40"
                                                    strokeDasharray={`${(result.summary.suspenseCount / (result.summary.matchedCount + result.summary.suspenseCount)) * 502.65} 502.65`}
                                                    strokeDashoffset={`-${(result.summary.matchedCount / (result.summary.matchedCount + result.summary.suspenseCount)) * 502.65}`}
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <p className="text-4xl font-bold text-white">{result.summary.matchedCount + result.summary.suspenseCount}</p>
                                                <p className="text-sm text-white/70">Total</p>
                                            </div>
                                        </div>
                                        
                                        {/* Legend */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                                <div>
                                                    <p className="text-white font-semibold">{result.summary.matchedCount} Rapprochés</p>
                                                    <p className="text-white/70 text-sm">{((result.summary.matchedCount / (result.summary.matchedCount + result.summary.suspenseCount)) * 100).toFixed(1)}%</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                                                <div>
                                                    <p className="text-white font-semibold">{result.summary.suspenseCount} En Suspens</p>
                                                    <p className="text-white/70 text-sm">{((result.summary.suspenseCount / (result.summary.matchedCount + result.summary.suspenseCount)) * 100).toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="text-center">
                                            <div className="text-white/50 mb-2">
                                                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <p className="text-white/70">{isLoadingData ? 'Chargement des données...' : 'Aucune donnée disponible'}</p>
                                            <p className="text-white/50 text-sm mt-1">{isLoadingData ? 'Veuillez patienter' : 'Lancez un rapprochement pour voir les statistiques'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-left group"
                                    >
                                        <Upload className="w-8 h-8 text-white/70 group-hover:text-white mb-2 transition-colors" />
                                        <div className="text-white font-semibold">Importer Fichiers</div>
                                        <div className="text-white/70 text-sm">Charger relevés bancaires</div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('config')}
                                        className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-left group"
                                    >
                                        <Settings className="w-8 h-8 text-white/70 group-hover:text-white mb-2 transition-colors" />
                                        <div className="text-white font-semibold">Configuration</div>
                                        <div className="text-white/70 text-sm">Règles de rapprochement</div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('ai')}
                                        className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-left group"
                                    >
                                        <Bot className="w-8 h-8 text-white/70 group-hover:text-white mb-2 transition-colors" />
                                        <div className="text-white font-semibold">Assistant IA</div>
                                        <div className="text-white/70 text-sm">Aide intelligente</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                                <h2 className="text-xl font-semibold text-white">Import des Documents</h2>
                                <p className="text-sm text-white/70 mt-1">
                                    Chargez votre relevé bancaire et votre journal comptable au format CSV.
                                    Le système détectera automatiquement les colonnes et normalisera les données.
                                </p>
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FileUpload
                                        id="bank-statement"
                                        title="Relevé Bancaire"
                                        description="Export fourni par votre banque (CSV)."
                                        onFileSelect={handleBankFileSelect}
                                        icon={<BankIcon />}
                                    />
                                    <FileUpload
                                        id="accounting-journal"
                                        title="Journal Comptable"
                                        description="Export du compte banque de votre ERP (CSV)."
                                        onFileSelect={handleJournalFileSelect}
                                        icon={<JournalIcon />}
                                    />
                                </div>
                                
                                {(bankUpload || accountingUpload) && (
                                    <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                        <h3 className="font-medium text-green-300 mb-2">Fichiers Chargés:</h3>
                                        {bankUpload && (
                                            <p className="text-sm text-green-200">✓ Bancaire: {bankUpload.filename} ({bankUpload.rowsCount} transactions)</p>
                                        )}
                                        {accountingUpload && (
                                            <p className="text-sm text-green-200">✓ Comptable: {accountingUpload.filename} ({accountingUpload.rowsCount} écritures)</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <ControlPanel
                            rules={reconciliationRules}
                            onRulesChange={setReconciliationRules}
                            onReconcile={handleReconciliation}
                            isProcessing={isLoading}
                        />
                    )}

                    {activeTab === 'ai' && (
                        <AIAssistant onSuggestion={handleAISuggestion} />
                    )}

                    {activeTab === 'results' && (
                        result ? (
                            <Dashboard
                                result={result}
                                onValidateMatch={handleValidateMatch}
                                onExport={handleExport}
                            />
                        ) : (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
                                <div className="text-white/50 mb-4">
                                    <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Aucun Résultat Disponible</h3>
                                <p className="text-white/70 mb-6">Lancez un rapprochement pour voir les résultats détaillés</p>
                                <button
                                    onClick={() => setActiveTab('config')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                                >
                                    Configurer et Lancer
                                </button>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'regularization' && (
                        currentJobId ? (
                            <RegularizationEntries jobId={currentJobId} />
                        ) : (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
                                <div className="text-white/50 mb-4">
                                    <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Aucune Écriture Disponible</h3>
                                <p className="text-white/70 mb-6">Lancez un rapprochement pour générer les écritures de régularisation</p>
                                <button
                                    onClick={() => setActiveTab('config')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                                >
                                    Configurer et Lancer
                                </button>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'reports' && (
                        result ? (
                            <Reports
                                result={result}
                                onExport={handleExport}
                            />
                        ) : (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
                                <div className="text-white/50 mb-4">
                                    <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Aucun Rapport Disponible</h3>
                                <p className="text-white/70 mb-6">Lancez un rapprochement pour générer les rapports et visualisations</p>
                                <button
                                    onClick={() => setActiveTab('config')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                                >
                                    Configurer et Lancer
                                </button>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'audit' && (
                        user?.role === 'admin' ? (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Logs d'Audit</h3>
                                <p className="text-white/70">Fonctionnalité en développement.</p>
                            </div>
                        ) : (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
                                <h3 className="text-xl font-semibold text-white mb-2">Accès Restreint</h3>
                                <p className="text-white/70">Cette section est réservée aux administrateurs.</p>
                            </div>
                        )
                    )}

                    {error && (
                        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            <strong className="font-bold">Erreur: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    </div>
                </main>
            </div>
            </div>
        </div>
    );
};

const BankIcon = () => (
    <svg className="mx-auto h-12 w-12 text-white/70" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 20.94l-14-7.44v3.39l14 7.43 14-7.43v-3.39l-14 7.44zM10 20.43v10.14l4 2.13v-10.3l-4-2zM16 32.7v-10.3l4 2.13v10.14l-4-2zM34 32.7v-10.14l-4 2.13v10.3l4-2zM28 22.56l4-2.13v10.3l-4-2.13v-10.14zM24 35.13L10 28.14v-2.2l14 7.43 14-7.43v2.2l-14 6.99zM24 6L4 15v22l20 11 20-11V15L24 6z" strokeWidth="0.5" />
    </svg>
);

const JournalIcon = () => (
    <svg className="mx-auto h-12 w-12 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

export default App;
