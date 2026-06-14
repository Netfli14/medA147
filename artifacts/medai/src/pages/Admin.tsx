import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Activity,
  MessageSquare,
  Stethoscope,
  Zap,
  TrendingUp,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface Stats {
  totals: {
    aiCalls: number;
    userActions: number;
    chatMessages: number;
    symptomAnalyses: number;
  };
  usageByFunction: { functionName: string; total: number }[];
  actionsByFunction: { functionName: string; total: number }[];
  dailyUsage: { day: string; total: number }[];
}

const LABEL_MAP: Record<string, string> = {
  "ai-doctor": "AI Doctor",
  "analyze-symptoms": "Symptom Check",
  "analyze-image": "Image Analysis",
  "analyze-prescription": "Prescription",
  "find-medicines": "Medicine Finder",
  "suggest-journals": "Journals",
  "translate-text": "Translate",
  aiDoctor: "AI Doctor",
  symptoms: "Symptoms",
  imageAnalysis: "Image Analysis",
};

function label(name: string) {
  return LABEL_MAP[name] ?? name;
}

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" });
        if (res.status === 403) { setForbidden(true); return; }
        if (!res.ok) throw new Error(await res.text());
        setStats(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = stats
    ? [
        { icon: Zap, label: "Total AI Calls", value: stats.totals.aiCalls, color: "text-primary" },
        { icon: Activity, label: "User Actions", value: stats.totals.userActions, color: "text-medical-green" },
        { icon: MessageSquare, label: "Chat Messages", value: stats.totals.chatMessages, color: "text-blue-500" },
        { icon: Stethoscope, label: "Symptom Analyses", value: stats.totals.symptomAnalyses, color: "text-medical-warning" },
      ]
    : [];

  return (
    <Layout>
      <SEOHead title="Admin Analytics" description="Admin analytics dashboard" path="/admin" />
      <div className="container py-10 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Analytics</h1>
            <p className="text-sm text-muted-foreground">Real-time usage metrics from the database</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {forbidden && !loading && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive/60" />
            <h2 className="font-display text-xl font-bold">Access Denied</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              You don't have permission to view this page. Only the admin account can access analytics.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl bg-destructive/10 text-destructive p-4 text-sm">{error}</div>
        )}

        {stats && !loading && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cards.map(({ icon: Icon, label: lbl, value, color }) => (
                <div key={lbl} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{lbl}</span>
                  </div>
                  <p className={`font-display text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Daily usage chart */}
            {stats.dailyUsage.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Daily AI Calls (last 30 days)
                </h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(217,91%,60%)"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        name="AI Calls"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Usage by feature */}
            {stats.usageByFunction.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Calls by Feature
                </h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.usageByFunction.map((r) => ({
                        name: label(r.functionName),
                        total: r.total,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="total" fill="hsl(217,91%,60%)" radius={[6, 6, 0, 0]} name="Calls" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Actions by feature */}
            {stats.actionsByFunction.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-medical-green" />
                  User Actions by Feature
                </h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.actionsByFunction.map((r) => ({
                        name: label(r.functionName),
                        total: r.total,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="total" fill="hsl(152,68%,38%)" radius={[6, 6, 0, 0]} name="Actions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {stats.totals.aiCalls === 0 && stats.totals.userActions === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No usage data yet. Metrics will appear as users interact with the app.
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
