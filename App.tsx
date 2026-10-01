/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Rocket,
  LayoutDashboard,
  Layers,
  Target,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  Plus,
  LogOut,
  ChevronDown,
  User as UserIcon,
  FileText,
  FolderPlus,
} from 'lucide-react';
import { User, StartupIdea, ActiveTab } from './types';
import {
  INITIAL_STARTUP_IDEAS,
  generateBasicSummaryFromIdea,
  generateFallbackAIEvaluation,
} from './seedData';
import { AuthView } from './components/AuthView';
import { CreateStartupModal } from './components/CreateStartupModal';
import { CreateStartupTab } from './components/CreateStartupTab';
import { DashboardTab } from './components/DashboardTab';
import { IdeaCanvasTab } from './components/IdeaCanvasTab';
import { CompetitorsTab } from './components/CompetitorsTab';
import { SwotTab } from './components/SwotTab';
import { TasksTab } from './components/TasksTab';
import { SummaryAndAITab } from './components/SummaryAndAITab';

const SESSION_USER_KEY = 'afa_copilot_session_v2';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_USER_KEY);
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });

  const [ideas, setIdeas] = useState<StartupIdea[]>(INITIAL_STARTUP_IDEAS);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(INITIAL_STARTUP_IDEAS[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  const fetchStartups = useCallback(async (currentUserId: string) => {
    setLoadingIdeas(true);
    try {
      const res = await fetch(`/api/startups?userId=${encodeURIComponent(currentUserId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.startups)) {
          setIdeas(data.startups);
          setSelectedIdeaId((prev) =>
            data.startups.some((s: StartupIdea) => s.id === prev)
              ? prev
              : data.startups[0]?.id || ''
          );
        }
      }
    } catch {
      // Fallback to in-memory seed ideas if offline
    } finally {
      setLoadingIdeas(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      try {
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      } catch {
        // ignore storage quota errors
      }
      fetchStartups(user.id);
    }
  }, [user, fetchStartups]);

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_USER_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const activeIdea: StartupIdea | null =
    ideas.find((s) => s.id === selectedIdeaId) || ideas[0] || null;

  const handleUpdateIdea = async (updatedFields: Partial<StartupIdea>) => {
    if (!activeIdea) return;

    const optimistic: StartupIdea = {
      ...activeIdea,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    optimistic.summary = generateBasicSummaryFromIdea(optimistic);

    setIdeas((prev) => prev.map((s) => (s.id === activeIdea.id ? optimistic : s)));

    try {
      const res = await fetch(`/api/startups/${activeIdea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.startup) {
          setIdeas((prev) => prev.map((s) => (s.id === activeIdea.id ? data.startup : s)));
        }
      }
    } catch {
      // Optimistic update already applied
    }
  };

  const handleQuickToggleTask = async (taskId: string) => {
    if (!activeIdea) return;
    const updatedTasks = activeIdea.tasks.map((t) => {
      if (t.id !== taskId) return t;
      const nextStatus = t.status === 'Completed' ? 'Todo' : 'Completed';
      return { ...t, status: nextStatus as 'Todo' | 'Completed' };
    });
    await handleUpdateIdea({ tasks: updatedTasks });
  };

  const handleDeleteIdea = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch(
        `/api/startups/${encodeURIComponent(id)}?userId=${encodeURIComponent(user.id)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        }
      );
      if (!res.ok) {
        return false;
      }
    } catch {
      // Allow local state cleanup if offline
    }

    setIdeas((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (selectedIdeaId === id) {
        setSelectedIdeaId(remaining[0]?.id || '');
      }
      return remaining;
    });
    return true;
  };

  const handleRefreshSummary = async () => {
    if (!activeIdea) return;
    try {
      const res = await fetch(`/api/startups/${activeIdea.id}/summary`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.startup) {
          setIdeas((prev) => prev.map((s) => (s.id === activeIdea.id ? data.startup : s)));
          return;
        }
      }
    } catch {
      // fallback local summary
    }
    const localSummary = generateBasicSummaryFromIdea(activeIdea);
    setIdeas((prev) =>
      prev.map((s) => (s.id === activeIdea.id ? { ...s, summary: localSummary } : s))
    );
  };

  const handleRunAIEvaluation = async () => {
    if (!activeIdea) return;
    try {
      const res = await fetch(`/api/startups/${activeIdea.id}/ai-evaluate`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.startup) {
          setIdeas((prev) => prev.map((s) => (s.id === activeIdea.id ? data.startup : s)));
          return;
        }
      }
    } catch {
      // fallback local evaluation
    }
    const fallbackEval = generateFallbackAIEvaluation(activeIdea);
    setIdeas((prev) =>
      prev.map((s) => (s.id === activeIdea.id ? { ...s, aiEvaluation: fallbackEval } : s))
    );
  };

  if (!user) {
    return <AuthView onAuthenticated={handleAuthenticated} />;
  }

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'create-startup',
      label: 'Create Startup',
      icon: FolderPlus,
    },
    {
      id: 'my-startups',
      label: 'My Startups',
      icon: Layers,
      badge: ideas.length,
    },
    {
      id: 'competitors',
      label: 'Competitors',
      icon: Target,
      badge: activeIdea ? activeIdea.competitors.length : 0,
    },
    {
      id: 'swot',
      label: 'SWOT Analysis',
      icon: ShieldCheck,
      badge: activeIdea
        ? activeIdea.strengths.length +
          activeIdea.weaknesses.length +
          (activeIdea.opportunities?.length || 0) +
          (activeIdea.threats?.length || 0)
        : 0,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: activeIdea
        ? `${activeIdea.tasks.filter((t) => t.status === 'Completed').length}/${
            activeIdea.tasks.length
          }`
        : '0/0',
    },
    {
      id: 'startup-summary',
      label: 'Startup Summary',
      icon: FileText,
    },
    {
      id: 'ai-suggestions',
      label: 'AI Suggestions',
      icon: Sparkles,
      badge: activeIdea?.aiEvaluation ? `${activeIdea.aiEvaluation.viabilityScore}` : 'AI',
    },
  ];

  const renderEmptyStartupPrompt = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
        <Rocket className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-slate-900">
          No Active Startup Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Create a startup idea to unlock your Dashboard, Competitors, SWOT Analysis, Tasks,
          Startup Summary, and AI Suggestions.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setActiveTab('create-startup')}
        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create Startup</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:flex-row">
      {/* Left Navigation Sidebar */}
      <aside className="w-full lg:w-64 bg-[#0F172A] text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-white block leading-none">
                  AI Founder Assistant
                </span>
                <span className="text-[10px] text-indigo-300 font-medium">
                  Your Startup Co-Pilot
                </span>
              </div>
            </div>
          </div>

          {/* Active Startup Idea Switcher */}
          <div className="p-4 border-b border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Startup ({ideas.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('create-startup')}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="relative">
              <select
                value={activeIdea?.id || ''}
                disabled={ideas.length === 0}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="w-full appearance-none bg-slate-900 hover:bg-slate-800/90 disabled:opacity-60 text-white text-xs font-semibold pl-3 pr-8 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {ideas.length === 0 ? (
                  <option value="">No startups yet</option>
                ) : (
                  ideas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.stage})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Navigation Items + Explicit Logout Menu Item */}
          <nav className="p-3 space-y-1 flex lg:flex-col overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2 transition-colors shrink-0 lg:shrink cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono-num rounded ${
                        isActive
                          ? 'bg-indigo-800/80 text-white font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Explicit Logout Menu Item in Sidebar Navigation */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-colors shrink-0 lg:shrink cursor-pointer mt-2 border-t border-slate-800/80 pt-3"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Logout</span>
            </button>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 hidden lg:block">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user.username || user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              AI Founder Assistant
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900">
              {activeIdea ? activeIdea.name : 'My Startups'}
            </span>
            {loadingIdeas && (
              <span className="text-xs text-slate-400 font-mono-num">Syncing...</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('create-startup')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Startup</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-suggestions')}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Suggestions</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Active View Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Top Back & Next Page Navigation */}
          {(() => {
            const currentNavIndex = navItems.findIndex((item) => item.id === activeTab);
            const isFirstPage = currentNavIndex <= 0;
            const isLastPage = currentNavIndex >= navItems.length - 1;

            return (
              <div className="mb-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={isFirstPage}
                  onClick={() => {
                    if (!isFirstPage) {
                      setActiveTab(navItems[currentNavIndex - 1].id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  disabled={isLastPage}
                  onClick={() => {
                    if (!isLastPage) {
                      setActiveTab(navItems[currentNavIndex + 1].id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Next →
                </button>
              </div>
            );
          })()}

          {activeTab === 'dashboard' &&
            (activeIdea ? (
              <DashboardTab
                idea={activeIdea}
                allIdeas={ideas}
                onSelectIdea={(id) => setSelectedIdeaId(id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onDeleteIdea={handleDeleteIdea}
                onQuickToggleTask={handleQuickToggleTask}
              />
            ) : (
              renderEmptyStartupPrompt()
            ))}

          {activeTab === 'create-startup' && (
            <CreateStartupTab
              userId={user.id}
              onCreated={(newStartup) => {
                setIdeas((prev) => [newStartup, ...prev]);
                setSelectedIdeaId(newStartup.id);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'my-startups' && (
            <IdeaCanvasTab
              idea={activeIdea}
              allIdeas={ideas}
              currentUserId={user.id}
              onSelectIdea={(id) => setSelectedIdeaId(id)}
              onDeleteIdea={handleDeleteIdea}
              onUpdateIdea={handleUpdateIdea}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'competitors' &&
            (activeIdea ? (
              <CompetitorsTab idea={activeIdea} onUpdateIdea={handleUpdateIdea} />
            ) : (
              renderEmptyStartupPrompt()
            ))}

          {activeTab === 'swot' &&
            (activeIdea ? (
              <SwotTab idea={activeIdea} onUpdateIdea={handleUpdateIdea} />
            ) : (
              renderEmptyStartupPrompt()
            ))}

          {activeTab === 'tasks' &&
            (activeIdea ? (
              <TasksTab idea={activeIdea} onUpdateIdea={handleUpdateIdea} />
            ) : (
              renderEmptyStartupPrompt()
            ))}

          {activeTab === 'startup-summary' &&
            (activeIdea ? (
              <SummaryAndAITab
                idea={activeIdea}
                viewMode="summary"
                onRefreshSummary={handleRefreshSummary}
                onRunAIEvaluation={handleRunAIEvaluation}
                onUpdateIdea={handleUpdateIdea}
              />
            ) : (
              renderEmptyStartupPrompt()
            ))}

          {activeTab === 'ai-suggestions' &&
            (activeIdea ? (
              <SummaryAndAITab
                idea={activeIdea}
                viewMode="ai"
                onRefreshSummary={handleRefreshSummary}
                onRunAIEvaluation={handleRunAIEvaluation}
                onUpdateIdea={handleUpdateIdea}
              />
            ) : (
              renderEmptyStartupPrompt()
            ))}
        </main>
      </div>

      {/* Create Startup Idea Modal */}
      <CreateStartupModal
        isOpen={isCreateModalOpen}
        userId={user.id}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newStartup) => {
          setIdeas((prev) => [newStartup, ...prev]);
          setSelectedIdeaId(newStartup.id);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
