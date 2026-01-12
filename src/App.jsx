/* eslint-disable no-unused-vars */
import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { Bot, FileText, Briefcase, ChevronRight, CheckCircle, XCircle, Loader2, Zap, LogIn, User, Mail, Lock, UserX, History, Save, Trash2, Lightbulb, Upload, Layout, CornerUpLeft } from 'lucide-react';
import Toast from './components/Toast';

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// =========================================================================
// 1. AUTHENTICATION CONTEXT & PROVIDER
// =========================================================================

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username, token, isGuest: boolean }
    const [showAuthModal, setShowAuthModal] = useState(true);

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        setShowAuthModal(true);
        window.location.reload();
    };

    // Check local storage on initial load
    useEffect(() => {
        document.title = 'HireReady - AI Resume Toolkit';
        const storedToken = localStorage.getItem('userToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setShowAuthModal(false);
            } catch (e) {
                console.error("Failed to parse user from storage:", e);
                localStorage.removeItem('userToken');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const value = { user, setUser, signOut, showAuthModal, setShowAuthModal };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =========================================================================
// 2. AUTHENTICATION MODAL COMPONENT
// =========================================================================

const AuthModal = () => {
    const { setUser, setShowAuthModal } = useAuth();
    const [isSignIn, setIsSignIn] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const endpoint = isSignIn ? '/signin' : '/signup';
        const payload = isSignIn ? { email, password } : { username, email, password };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || `Authentication failed. Status: ${response.status}`);
            } else {
                const userObject = {
                    id: data.user_id,
                    username: data.username,
                    token: data.token,
                    isGuest: false,
                };

                localStorage.setItem('userToken', data.token);
                localStorage.setItem('user', JSON.stringify(userObject));

                setUser(userObject);
                setShowAuthModal(false);
            }
        } catch (err) {
            console.error('Auth request failed:', err);
            setError(`Could not connect to Flask server. Ensure it is running.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuest = () => {
        const guestUser = { id: 'GUEST_' + Date.now(), username: 'Guest User', isGuest: true };
        setUser(guestUser);
        setShowAuthModal(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center">
                    <LogIn className="w-7 h-7 mr-2" />
                    {isSignIn ? 'Welcome Back!' : 'Create Your Account'}
                </h2>
                <p className="text-gray-500 mb-6">{isSignIn ? 'Sign in to save your drafts and progress.' : 'Sign up to start saving and comparing your resumes.'}</p>

                {error && (
                    <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isSignIn && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required={!isSignIn} disabled={isLoading}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="your-username"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="name@college.edu"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition duration-150"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (isSignIn ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button type="button" onClick={() => setIsSignIn(!isSignIn)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
                        {isSignIn ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>

                <div className="mt-6 border-t pt-4">
                    <button onClick={handleGuest}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-150"
                    >
                        <UserX className="w-5 h-5 mr-2" />
                        Try it as Guest (Data not stored)
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 3. UTILITY & DISPLAY COMPONENTS
// =========================================================================

// Custom component for a structured feedback block
const FeedbackBlock = ({ title, score, icon: Icon, children }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-3 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon className="w-5 h-5 mr-2 text-indigo-600" />
                {title}
            </h2>
            {score !== undefined && (
                <span className={`text-2xl font-extrabold px-3 py-1 rounded-full ${score >= 85 ? 'bg-green-100 text-green-700' :
                    score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {score}%
                </span>
            )}
        </div>
        <div className="text-gray-600 space-y-3">
            {children}
        </div>
    </div>
);

// Helper function to render bullet points with status icons
const renderAdviceList = (list) => (
    <ul className="space-y-2">
        {list.map((item, index) => (
            <li key={index} className="flex items-start text-sm">
                {item.type === 'improvement' ? (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1 mr-2" />
                ) : item.type === 'strength' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1 mr-2" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-1 mr-2" />
                )}
                <span>{item.detail}</span>
            </li>
        ))}
    </ul>
);


// =========================================================================
// 4. FEATURE COMPONENTS
// =========================================================================

// --- A. Bullet Point Generator (Builder) ---
const BulletGenerator = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [generatedBullets, setGeneratedBullets] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!jobTitle || !taskDescription) {
            setError('Please provide both the job title and a task description.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedBullets(null);

        try {
            const response = await fetch(`${API_BASE_URL}/generate_bullet_points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: jobTitle,
                    task_description: taskDescription,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody.error || 'Check Flask server console.'}`);
            }

            const data = await response.json();
            setGeneratedBullets(data.generated_bullets || []);

        } catch (err) {
            console.error('Generation failed:', err);
            setError(`Failed to connect to AI server. Error: ${err.message}. Ensure Flask is running.`);
        } finally {
            setIsLoading(false);
        }
    }, [jobTitle, taskDescription]);

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-orange-500" />
                AI Bullet Point Generator
            </h2>
            <p className="text-gray-600 mb-6">Turn simple tasks into powerful, quantifiable resume achievements.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Job Title (e.g., Marketing Intern, Software Engineer)
                    </label>
                    <input
                        id="jobTitle"
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="Marketing Intern"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="taskDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                        Basic Task You Performed (e.g., "managed social media and wrote posts")
                    </label>
                    <input
                        id="taskDescription"
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="managed social media and wrote posts"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                    />
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out transform hover:scale-[1.005]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Generating Bullets...
                    </>
                ) : (
                    <>
                        Generate 3 Killer Bullet Points
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>

            {error && (
                <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200 mt-4 text-center">
                    {error}
                </p>
            )}

            {generatedBullets && generatedBullets.length > 0 && (
                <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner">
                    <h3 className="text-xl font-bold text-indigo-800 mb-4">Generated Achievements:</h3>
                    <ul className="space-y-3">
                        {generatedBullets.map((bullet, index) => (
                            <li key={index} className="flex items-start text-gray-700">
                                <span className="text-indigo-600 font-bold mr-2 text-lg">•</span>
                                <span className="text-sm pt-[2px]">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- B. History Section ---
const HistorySection = ({ onLoadAnalysis, historyVersion, setHistoryVersion }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (user?.isGuest || !user?.token) {
            setError('Sign in or Sign up to view your history.');
            setHistory([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/get_history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(`HTTP error! Message: ${errorBody.error || 'Failed to fetch history.'}`);
            }

            const data = await response.json();
            setHistory(data.history || []);
        } catch (err) {
            console.error('History fetch failed:', err);
            setError(`Could not retrieve history: ${err.message}. Check Flask logs.`);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const handleDelete = useCallback(async (draftId) => {
        if (!window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(draftId);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/delete_analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ draft_id: draftId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete draft.');
            }

            setHistoryVersion(v => v + 1);

        } catch (err) {
            console.error('Deletion failed:', err);
            setError(`Deletion Failed: ${err.message}`);
        } finally {
            setIsDeleting(null);
        }
    }, [user, setHistoryVersion]);


    useEffect(() => {
        if (user?.token) {
            fetchHistory();
        }
    }, [user, historyVersion, fetchHistory]);

    if (isLoading) {
        return <div className="text-center p-12 text-indigo-600"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Loading History...</div>;
    }

    if (error && !error.includes("Authentication required")) {
        return <div className="text-center p-12 text-red-600 bg-red-50 rounded-lg border border-red-200 max-w-xl mx-auto">{error}</div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-100 max-w-xl mx-auto flex flex-col items-center">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <FileText className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Analyses Yet</h3>
                <p className="text-gray-500 mb-6">Run a resume analysis and click "Save Draft" to build your history.</p>
                <button
                    onClick={() => document.querySelector('button[class*="border-indigo-600"]').click()}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition"
                >
                    Start New Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <History className="w-6 h-6 mr-2 text-indigo-600" />
                Analysis History ({history.length} drafts)
            </h2>
            {/* Show deletion error at the top if present */}
            {error && <div className="p-3 text-red-600 bg-red-50 rounded-lg border border-red-200 text-sm mb-4">{error}</div>}

            <div className='space-y-4'>
                {history.map((draft) => (
                    <div key={draft.id} className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-indigo-400 flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-200 hover:shadow-xl hover:bg-indigo-50/50">
                        {/* Info Block */}
                        <div className='flex-1 pr-4 min-w-0'>
                            <p className="text-lg font-semibold text-gray-800 truncate">
                                {draft.target_job_title}
                                <span className="text-sm font-normal text-gray-500 ml-2">({draft.created_at.split(' ')[0]})</span>
                            </p>
                            <p className="text-xs text-gray-600 mt-1 italic">
                                ATS Score: {draft.ats_score}%
                                - JD Preview: {draft.job_description.substring(0, 50)}...
                            </p>
                        </div>

                        {/* Action Block */}
                        <div className="flex items-center space-x-2 mt-3 sm:mt-0 sm:flex-shrink-0">
                            <span className={`text-xl font-extrabold px-3 py-1 rounded-full ${draft.ats_score >= 85 ? 'bg-green-100 text-green-700' :
                                draft.ats_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {draft.ats_score}%
                            </span>
                            <button
                                onClick={() => onLoadAnalysis(draft)}
                                className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-200 rounded-full hover:bg-indigo-300 transition duration-150"
                            >
                                Load & View
                            </button>
                            <button
                                onClick={() => handleDelete(draft.id)}
                                disabled={isDeleting === draft.id}
                                className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition duration-150 disabled:opacity-50"
                                title="Delete Draft"
                            >
                                {isDeleting === draft.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- NEW A. Template Selection Modal ---
const TemplateSelector = ({ resumeText, jobDescription, analysis, onSelectTemplate, onClose }) => {
    const [recommendations, setRecommendations] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [initialDraft, setInitialDraft] = useState('');

    const fetchRecommendations = useCallback(async () => {
        setIsLoading(true);
        setError('');

        // Move generateInitialDraft inside useCallback
        const generateInitialDraft = async (templateName) => {
            try {
                const response = await fetch(`${API_BASE_URL}/generate_initial_draft`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resume: resumeText, job_description: jobDescription, analysis_result: analysis }),
                });

                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({ error: 'Unknown draft error.' }));
                    throw new Error(errorBody.error || `Failed to generate initial draft.`);
                }

                const data = await response.json();
                setInitialDraft(data.modified_draft || resumeText); // Fallback to original text

            } catch (err) {
                console.error('Initial draft failed:', err);
                setError(e => e + ` | Initial Draft Generation Failed: ${err.message}`);
                setInitialDraft(resumeText); // Use raw text if AI fails
            } finally {
                setIsLoading(false);
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/recommend_template`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume: resumeText, job_description: jobDescription }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(errorBody.error || `Failed to fetch template recommendations.`);
            }

            const data = await response.json();
            setRecommendations(data);

            // Trigger initial draft generation after successful recommendation
            await generateInitialDraft(data.best_template_type);

        } catch (err) {
            console.error('Template rec failed:', err);
            setError(`Template Recommendation Failed: ${err.message}`);
            setIsLoading(false);
        }
    }, [resumeText, jobDescription, analysis]);


    useEffect(() => {
        if (!recommendations) {
            fetchRecommendations();
        }
    }, [fetchRecommendations, recommendations]);

    if (!analysis) return <div className='text-center p-4'>Run an analysis first to enable the Builder.</div>;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center">
                    <Layout className="w-7 h-7 mr-2" />
                    AI Template & Draft Selector
                </h2>
                <p className="text-gray-500 mb-6">The AI recommends a template that best suits your background and the target job description.</p>

                {error && <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200 mb-4">{error}</p>}

                {isLoading ? (
                    <div className="text-center p-10">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                        <p className="text-indigo-600 font-medium">Analyzing compatibility and generating initial draft...</p>
                    </div>
                ) : (
                    recommendations && (
                        <div className='space-y-6'>
                            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                                <h3 className='text-xl font-bold text-green-800 flex items-center mb-2'>
                                    Best Recommended Template: **{recommendations.best_template_type}**
                                </h3>
                                <p className='text-green-700 text-sm'>{recommendations.justification}</p>
                            </div>

                            <h3 className='text-lg font-semibold text-gray-700 mt-6'>All Template Options:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.available_templates.map((tpl, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg flex flex-col justify-between">
                                        <p className='font-semibold text-gray-900'>{tpl.template_name} ({tpl.compatibility_score}%)</p>
                                        <p className='text-sm text-gray-500 my-2'>{tpl.reason}</p>
                                        <button
                                            onClick={() => onSelectTemplate(tpl.template_name, initialDraft)}
                                            className="mt-2 px-3 py-1 text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition"
                                            disabled={!initialDraft}
                                        >
                                            Use this Template & Start Editing
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}

                <div className="mt-8 border-t pt-4 flex justify-between">
                    <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center">
                        <CornerUpLeft className="w-4 h-4 mr-1" /> Close Modal
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- B. Targeted Suggestion Section (UNCHANGED) ---
const TargetedSuggestionSection = ({ resumeText, jobDescription, keywordGaps }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSuggest = useCallback(async () => {
        if (!keywordGaps || keywordGaps.length === 0) {
            setError("No critical keyword gaps were identified by the initial analysis.");
            return;
        }

        setIsLoading(true);
        setError('');
        setSuggestions(null);

        try {
            const response = await fetch(`${API_BASE_URL}/suggest_skill_bullets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume: resumeText,
                    job_description: jobDescription,
                    keyword_gaps: keywordGaps,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody.error || 'Check Flask server console.'}`);
            }

            const data = await response.json();
            setSuggestions(data.suggestions || []);

        } catch (err) {
            console.error('Suggestion generation failed:', err);
            setError(`Failed to generate suggestions. Error: ${err.message}.`);
        } finally {
            setIsLoading(false);
        }
    }, [resumeText, jobDescription, keywordGaps]);

    if (!keywordGaps || keywordGaps.length === 0) {
        return null; // Don't show if there are no gaps
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-6 h-6 mr-3 text-orange-500" />
                Targeted Skill Gap Solutions
            </h2>
            <p className="text-gray-600 mb-4">
                Your ATS analysis identified **{keywordGaps.length} critical keyword/skill gaps**. Click below to generate specific bullet points tailored to cover those missing requirements.
            </p>

            <button
                onClick={handleSuggest}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Generating Targeted Bullets...
                    </>
                ) : (
                    <>
                        Generate Solutions for Missing Skills
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>

            {error && (
                <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200 mt-4 text-center">
                    {error}
                </p>
            )}

            {suggestions && suggestions.length > 0 && (
                <div className="mt-6 p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-inner">
                    <h3 className="text-xl font-bold text-orange-800 mb-4">Suggested Bullets to Fill Gaps:</h3>
                    <ul className="space-y-3">
                        {suggestions.map((item, index) => (
                            <li key={index} className="flex items-start text-gray-700 border-l-4 border-orange-400 pl-3">
                                <span className="text-orange-600 font-bold mr-2 text-lg">•</span>
                                <div className='flex flex-col text-sm'>
                                    <strong className='font-semibold'>{item.skill}:</strong>
                                    <span>{item.bullet}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- C. Template Editor Component (UPDATED) ---
// Added onShowTemplateModal prop
const TemplateEditor = ({ jobDescription, modifiedResumeDraft, setModifiedResumeDraft, selectedTemplate, onShowTemplateModal }) => {
    const [activeSection, setActiveSection] = useState('full'); // 'full', 'summary', 'experience', etc.
    const [suggestions, setSuggestions] = useState(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [refinementError, setRefinementError] = useState('');

    // A simple, heuristic way to split the resume into editable sections
    const sections = React.useMemo(() => ({
        'Summary/Profile': modifiedResumeDraft.match(/Summary|Profile|Objective/i)?.[0],
        'Experience': modifiedResumeDraft.match(/Experience|Work History/i)?.[0],
        'Skills': modifiedResumeDraft.match(/Skills|Proficiencies/i)?.[0],
        'Education': modifiedResumeDraft.match(/Education|Degrees/i)?.[0],
        // You would need more robust parsing on a real project
    }), [modifiedResumeDraft]);

    // Function to extract text for a given section title
    const extractSectionText = useCallback((title) => {
        const sectionTitles = Object.values(sections).filter(Boolean);
        const startIndex = modifiedResumeDraft.indexOf(title);
        if (startIndex === -1) return '';

        let endIndex = modifiedResumeDraft.length;
        // Find the index of the next section title
        const currentTitleIndex = sectionTitles.indexOf(title);
        if (currentTitleIndex !== -1 && currentTitleIndex < sectionTitles.length - 1) {
            const nextTitle = sectionTitles[currentTitleIndex + 1];
            endIndex = modifiedResumeDraft.indexOf(nextTitle, startIndex + title.length);
            if (endIndex === -1) endIndex = modifiedResumeDraft.length;
        }

        // Extract the section content (including the title line)
        return modifiedResumeDraft.substring(startIndex, endIndex).trim();
    }, [sections, modifiedResumeDraft]);


    const handleRefineSection = useCallback(async (sectionTitle) => {
        setActiveSection(sectionTitle);
        if (sectionTitle === 'full') {
            setSuggestions(null);
            return;
        }

        const sectionText = extractSectionText(sectionTitle);
        if (!sectionText) {
            setRefinementError(`Could not find a clear '${sectionTitle}' section to refine.`);
            setSuggestions(null);
            return;
        }

        setIsLoadingSuggestions(true);
        setRefinementError('');
        setSuggestions(null);

        try {
            const response = await fetch(`${API_BASE_URL}/refine_section`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_text: sectionText, job_description: jobDescription }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(errorBody.error || `Failed to fetch refinement suggestions.`);
            }

            const data = await response.json();
            setSuggestions(data.suggested_rewrites || []);

        } catch (err) {
            console.error('Refinement failed:', err);
            setRefinementError(`AI Refinement Failed: ${err.message}`);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [jobDescription, extractSectionText]);


    const applySuggestion = (originalSnippet, newBullet) => {
        // Simple replacement logic: find the first occurrence of the snippet and replace the entire line/bullet
        const lines = modifiedResumeDraft.split('\n');
        const updatedLines = lines.map(line => {
            // Find the bullet point/line that contains the snippet
            if (line.includes(originalSnippet) && line.trim().length > 10) {
                // Return the new bullet, prepended with the original indentation/bullet point marker if applicable
                const leadingSpaces = line.match(/^(\s*)/)?.[0] || '';
                return leadingSpaces + newBullet;
            }
            return line;
        });

        setModifiedResumeDraft(updatedLines.join('\n'));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Preview (Column 1 & 2) */}
            <div className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-xl shadow-2xl border border-indigo-100 min-h-[70vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className='flex flex-col'>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Template: {selectedTemplate}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Editing **{sections[activeSection] || 'Full Draft'}** for **{jobDescription.split('\n')[0].trim() || 'Target Job'}**
                        </p>
                    </div>

                    <button
                        onClick={onShowTemplateModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition duration-150 flex items-center shadow-md"
                    >
                        <Layout className='w-4 h-4 mr-2' />
                        Change Template
                    </button>
                </div>

                <div className="flex justify-center mb-4 space-x-2">
                    {Object.keys(sections).map(key => sections[key] && (
                        <button
                            key={key}
                            onClick={() => handleRefineSection(key)}
                            className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${activeSection === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {key}
                        </button>
                    ))}
                    <button
                        onClick={() => setActiveSection('full')}
                        className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${activeSection === 'full' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Full Draft
                    </button>
                </div>

                <textarea
                    rows="25"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                    value={modifiedResumeDraft}
                    onChange={(e) => setModifiedResumeDraft(e.target.value)}
                />
            </div>

            {/* AI Suggestion Panel (Column 3) */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-200 sticky top-4">
                    <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-indigo-600" />
                        AI Refinement Suggestions
                    </h3>

                    {activeSection === 'full' && (
                        <p className='text-gray-600'>Select a section (e.g., 'Experience', 'Summary') from above to get specific, keyword-rich rewrite suggestions for that block of text.</p>
                    )}

                    {isLoadingSuggestions ? (
                        <div className="text-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-3" />
                            <p className="text-indigo-600 text-sm">Generating AI Refinements...</p>
                        </div>
                    ) : refinementError ? (
                        <p className="text-red-600 text-sm p-3 bg-red-100 rounded-lg">{refinementError}</p>
                    ) : suggestions && suggestions.length > 0 ? (
                        <div className='space-y-4 max-h-[50vh] overflow-y-auto'>
                            {suggestions.map((item, index) => (
                                <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <p className='text-xs text-gray-500 mb-1'>**Original Snippet:** {item.original_text_snippet}</p>
                                    <p className='font-medium text-gray-800 text-sm mb-2'>
                                        {item.suggested_bullet}
                                    </p>
                                    <button
                                        onClick={() => applySuggestion(item.original_text_snippet, item.suggested_bullet)}
                                        className="w-full text-xs py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                                    >
                                        Apply This Change
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : activeSection !== 'full' && (
                        <p className='text-gray-600'>No major rewrite suggestions found for this section. It looks great!</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// =========================================================================
// 5. MAIN APPLICATION SHELL
// =========================================================================

const MainApp = () => {
    const { user, signOut, showAuthModal } = useAuth();
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('analyze');
    const [saveMessage, setSaveMessage] = useState('');
    const [historyVersion, setHistoryVersion] = useState(0);

    // --- Toast State ---
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // --- NEW STATE FOR TEMPLATE EDITOR ---
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [modifiedResumeDraft, setModifiedResumeDraft] = useState(''); // The text actively being edited

    const resumeFileInputRef = useRef(null);
    const jdFileInputRef = useRef(null);

    // --- File Upload Handler (UNCHANGED) ---
    const handleFileUpload = async (event, setTextState) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf' &&
            file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
            file.type !== 'application/msword') {
            showToast("Unsupported file type. Please upload a PDF or DOCX file.", 'error');
            return;
        }

        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // UPDATED: Use the new /upload_file endpoint
            const response = await fetch(`${API_BASE_URL}/upload_file`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown file parsing error.' }));
                throw new Error(errorBody.error || `File parsing failed. Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.extracted_text) {
                setTextState(data.extracted_text);
                setError('');
            } else {
                setError("File parsed, but no text was extracted. Please copy/paste manually.");
            }

        } catch (err) {
            console.error('File Upload failed:', err);
            showToast(`File Processing Error: ${err.message}. Ensure Flask server is running.`, 'error');
        } finally {
            setIsLoading(false);
            if (event.target === resumeFileInputRef.current) {
                resumeFileInputRef.current.value = null;
            } else if (event.target === jdFileInputRef.current) {
                jdFileInputRef.current.value = null;
            }
        }
    };

    // --- Load Analysis (UNCHANGED) ---
    const onLoadAnalysis = useCallback((draft) => {
        const parsedAnalysis = typeof draft.analysis_json === 'string'
            ? JSON.parse(draft.analysis_json)
            : draft.analysis_json;

        setResumeText(draft.resume_text);
        setJobDescription(draft.job_description);
        setAnalysis(parsedAnalysis);
        setModifiedResumeDraft(draft.resume_text); // Reset draft on load
        setActiveTab('results');
        setSaveMessage('');
    }, []);

    // --- Save (UPDATED to save 'modifiedResumeDraft' if in editor) ---
    const handleSave = useCallback(async () => {
        if (!user || user.isGuest || !analysis) {
            setSaveMessage('Error: Must be signed in with a real account and have an analysis ready.');
            return;
        }

        setSaveMessage('Saving...');

        // Use the currently edited draft if available, otherwise use original resumeText
        const textToSave = modifiedResumeDraft || resumeText;

        const jobTitleLine = jobDescription.split('\n')[0].trim();
        const targetJobTitle = jobTitleLine.length > 5 && jobTitleLine.length < 100 ?
            jobTitleLine :
            `Analysis - ATS Score ${analysis.ats_score}%`;

        try {
            const response = await fetch(`${API_BASE_URL}/save_analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    resume_text: textToSave, // Save the modified text
                    job_description: jobDescription,
                    analysis_result: analysis,
                    target_job_title: targetJobTitle,
                }),
            });

            console.log('Save response status:', response.status); // DEBUG
            const data = await response.json();
            console.log('Save response data:', data); // DEBUG

            if (response.ok) {
                showToast('Draft saved successfully!', 'success');
                setSaveMessage(''); // Clear loading state
                setHistoryVersion(v => v + 1); // Trigger history refresh
            } else {
                showToast(`Save Failed: ${data.error || 'Server error.'}`, 'error');
                setSaveMessage(''); // Clear loading state
            }
        } catch (err) {
            showToast('Save Failed: Could not connect to the server.', 'error');
            setSaveMessage(''); // Clear loading state
            console.error('Save failed:', err);
        }
    }, [user, analysis, resumeText, jobDescription, modifiedResumeDraft]);

    // --- Analyze (UPDATED to set initial draft state) ---
    const handleAnalyze = useCallback(async () => {
        if (!resumeText || !jobDescription) {
            showToast('Please provide both resume text and the job description.', 'error');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysis(null);
        setSaveMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/analyze_resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume: resumeText,
                    job_description: jobDescription,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody.error || 'Check Flask server console.'}`);
            }

            const data = await response.json();
            setAnalysis(data);
            setModifiedResumeDraft(resumeText); // Initialize the draft with the original resume text
            setActiveTab('results');

        } catch (err) {
            console.error('Analysis failed:', err);
            showToast(`Failed to connect or analyze. Error: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [resumeText, jobDescription]);

    // --- NEW Template Selection Handler ---
    const handleSelectTemplate = (templateName, initialDraft) => {
        setSelectedTemplate(templateName);
        setModifiedResumeDraft(initialDraft); // Load the AI-modified text
        setShowTemplateModal(false);
        setActiveTab('template');
    };

    // --- Template Tab Click Handler ---
    const handleTemplateTabClick = () => {
        setActiveTab('template');
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            {showAuthModal && <AuthModal />}
            {/* Template Selector Modal is conditional on analysis being present */}
            {showTemplateModal && analysis && (
                <TemplateSelector
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                    analysis={analysis}
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplateModal(false)}
                />
            )}
            <style>{`
                /* Custom scrollbar styling for better aesthetics */
                textarea::-webkit-scrollbar {
                    width: 8px;
                }
                textarea::-webkit-scrollbar-thumb {
                    background-color: #A5B4FC; /* Indigo-300 */
                    border-radius: 4px;
                }
                textarea::-webkit-scrollbar-track {
                    background-color: #E0E7FF; /* Indigo-100 */
                }
            `}</style>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center">
                        <Bot className="w-7 h-7 mr-3 text-indigo-600" />
                        HireReady <span className="text-sm font-medium ml-2 text-indigo-400">(AI Resume Toolkit)</span>
                    </h1>
                    {user && (
                        <div className="mt-4 sm:mt-0 flex items-center space-x-3 text-gray-600">
                            <span className={`px-3 py-1 text-sm rounded-full font-medium ${user.isGuest ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {user.isGuest ? 'Guest Mode (No Save)' : `Welcome, ${user.username}`}
                            </span>
                            <button
                                onClick={signOut}
                                className="px-4 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition duration-150 flex items-center"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </header>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8 space-x-2 sm:space-x-4 border-b border-gray-200">
                    {/* Analyzer Tab */}
                    <button
                        onClick={() => { setActiveTab('analyze'); setAnalysis(null); setError(''); }}
                        className={`px-4 sm:px-6 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'analyze' || activeTab === 'results' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-white/70' : 'text-gray-600 hover:text-indigo-600'
                            }`}
                    >
                        1. Resume Analyzer
                    </button>
                    {/* Builder Tab */}
                    <button
                        onClick={() => { setActiveTab('builder'); setAnalysis(null); setError(''); }}
                        className={`px-4 sm:px-6 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'builder' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-white/70' : 'text-gray-600 hover:text-indigo-600'
                            }`}
                    >
                        2. Bullet Point Builder
                    </button>
                    {/* History Tab */}
                    <button
                        onClick={() => { setActiveTab('history'); setAnalysis(null); setError(''); }}
                        className={`px-4 sm:px-6 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'history' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-white/70' : 'text-gray-600 hover:text-indigo-600'
                            }`}
                    >
                        3. History & Drafts
                    </button>
                    {/* Template Tab */}
                    <button
                        onClick={handleTemplateTabClick}
                        className={`px-4 sm:px-6 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'template' ? 'border-b-4 border-indigo-600 text-indigo-700 bg-white/70' : 'text-gray-600 hover:text-indigo-600'
                            }`}
                    >
                        4. AI Template Editor
                    </button>
                </div>

                {/* --- RENDER ACTIVE TAB CONTENT --- */}
                <div className='pb-12'>
                    {/* ANALYSIS Tab Content (Input) */}
                    {activeTab === 'analyze' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <label htmlFor="resume" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Paste Your Resume Text or Upload File
                                    </label>

                                    {/* Resume File Upload Button & Hidden Input */}
                                    <input
                                        type="file" accept=".pdf,.docx" ref={resumeFileInputRef} style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload(e, setResumeText)}
                                    />
                                    <button
                                        onClick={() => resumeFileInputRef.current.click()} disabled={isLoading}
                                        className={`w-full flex items-center justify-center mb-3 px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${isLoading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                    >
                                        {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing File...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload PDF/DOCX</>)}
                                    </button>


                                    <textarea
                                        id="resume" rows="15"
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                        placeholder="Start with your contact info, summary, experience, education, and skills sections. Ensure your resume has minimal formatting for best parsing results."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                    <label htmlFor="job-description" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Paste the Target Job Description or Upload File
                                    </label>

                                    {/* JD File Upload Button & Hidden Input */}
                                    <input
                                        type="file" accept=".pdf,.docx" ref={jdFileInputRef} style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload(e, setJobDescription)}
                                    />
                                    <button
                                        onClick={() => jdFileInputRef.current.click()} disabled={isLoading}
                                        className={`w-full flex items-center justify-center mb-3 px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${isLoading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                    >
                                        {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing File...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload PDF/DOCX</>)}
                                    </button>


                                    <textarea
                                        id="job-description" rows="15"
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                        placeholder="Include the job title, company, and all responsibilities and requirements."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Action and Status */}
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <button
                                    onClick={handleAnalyze} disabled={isLoading}
                                    className="w-full max-w-sm flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out transform hover:scale-[1.01]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Analyzing... Connecting to Gemini
                                        </>
                                    ) : (
                                        <>
                                            Analyze Resume & Get ATS Score
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </button>


                            </div>
                        </>
                    )}

                    {/* BULLET BUILDER Tab Content */}
                    {activeTab === 'builder' && (
                        <BulletGenerator />
                    )}

                    {/* HISTORY Tab Content */}
                    {activeTab === 'history' && (
                        <HistorySection onLoadAnalysis={onLoadAnalysis} historyVersion={historyVersion} setHistoryVersion={setHistoryVersion} />
                    )}

                    {/* TEMPLATE EDITOR Tab Content (NEW) */}
                    {activeTab === 'template' && (
                        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
                            <div className="bg-yellow-50 p-4 rounded-full inline-block mb-4">
                                <Zap className="w-12 h-12 text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Template Editor Coming Soon!</h3>
                            <p className="text-gray-600 mb-6">
                                We are working hard to bring you a state-of-the-art AI Template Editor.
                                <br />
                                Currently, you can generate content in the Analyzer and Builder tabs.
                            </p>
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                Work In Progress
                            </span>
                        </div>
                    )}




                    {/* RESULTS Tab Content (FIXED) */}
                    {activeTab === 'results' && analysis && (
                        <div className="mt-4 space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                                    AI Analysis Report
                                </h2>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={user?.isGuest || saveMessage.startsWith('Saving...')}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 flex items-center ${user?.isGuest || saveMessage.startsWith('Saving...') ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                    >
                                        {saveMessage.startsWith('Saving...') ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        {user?.isGuest ? 'Sign In to Save' : saveMessage.startsWith('Saving...') ? 'Saving...' : saveMessage.startsWith('Draft saved') ? 'Saved!' : 'Save Draft'}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('analyze')}
                                        className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition duration-150"
                                    >
                                        &larr; New Analysis
                                    </button>
                                </div>
                            </div>


                            {/* Overall Score */}
                            <FeedbackBlock title="Overall ATS Match Score" score={analysis.ats_score} icon={Bot}>
                                <p className='text-lg font-medium text-gray-700'>
                                    This score represents how well your current resume aligns with the keywords, required skills, and formatting expected by Applicant Tracking Systems (ATS) and hiring managers for the target job.
                                </p>
                            </FeedbackBlock>

                            {/* Detailed Feedback Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* ATS & Keywords */}
                                <FeedbackBlock title="ATS Keyword Match" icon={Briefcase}>
                                    <h3 className='font-semibold text-gray-800'>Missing Keywords & Skills:</h3>
                                    {renderAdviceList(analysis.feedback.keyword_gaps.map(g => ({ type: 'improvement', detail: g })))}

                                    <h3 className='font-semibold text-gray-800 mt-4'>Relevant Strengths:</h3>
                                    {renderAdviceList(analysis.feedback.keyword_strengths.map(s => ({ type: 'strength', detail: s })))}
                                </FeedbackBlock>

                                {/* Content & Actionability */}
                                <FeedbackBlock title="Content Quality & Impact" icon={FileText}>
                                    <h3 className='font-semibold text-gray-800'>Areas for Improvement (Action Verbs, Quantifiables):</h3>
                                    {renderAdviceList(analysis.feedback.content_improvements)}
                                </FeedbackBlock>
                            </div>

                            {/* Targeted Skill Suggestions */}
                            <TargetedSuggestionSection
                                resumeText={resumeText}
                                jobDescription={jobDescription}
                                keywordGaps={analysis.feedback.keyword_gaps}
                            />

                            {/* Formatting and Structure */}
                            <FeedbackBlock title="Formatting & Readability" icon={FileText}>
                                <h3 className='font-semibold text-gray-800'>Structural Advice:</h3>
                                {renderAdviceList(analysis.feedback.formatting_advice)}
                            </FeedbackBlock>
                        </div>
                    )}
                </div>
            </div>
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

// Wrapper to provide AuthContext
const App = () => (
    <AuthProvider>
        <MainApp />
    </AuthProvider>
);

export default App;