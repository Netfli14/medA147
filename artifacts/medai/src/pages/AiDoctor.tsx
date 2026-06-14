import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SplineScene } from "@/components/ui/spline-scene";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { EvidenceModal } from "@/components/ui/evidence-modal";
import { UsageBanner } from "@/components/UsageBanner";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { Bot, User, Send, Stethoscope, AlertCircle, Sparkles, Brain, BookOpen, Info } from "lucide-react";
import { TranslateButton } from "@/components/ui/translate-button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = "/api/ai/ai-doctor";

export default function AiDoctor() {
  const { profile, getProfileContext } = useMedicalProfile();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { canUse, recordUsage } = useUsageLimits();
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  
  const getWelcomeMessage = () => {
    if (language === 'ru') {
      return `Здравствуйте! Я ваш продвинутый ИИ медицинский ассистент на базе новейших технологий. Я могу предоставить информацию о:

- Симптомы и заболевания - Подробные объяснения медицинских симптомов
- Варианты лечения - Общая информация о лечении и домашние средства
- Информация о лекарствах - Как работают лекарства и их эффекты
- Рекомендации специалистов - К какому врачу обратиться
- Профилактика - Советы по поддержанию здоровья

Важно: Я предоставляю только образовательную информацию. При экстренных ситуациях звоните 103. Всегда консультируйтесь с врачом для диагностики и лечения.

Чем могу помочь?`;
    } else if (language === 'kk') {
      return `Сәлеметсіз бе! Мен сіздің озық AI медициналық көмекшіңізбін. Мен келесі ақпаратты бере аламын:

- Белгілер мен аурулар - Медициналық белгілердің толық түсіндірмелері
- Емдеу нұсқалары - Жалпы емдеу ақпараты және үй емдері
- Дәрі-дәрмек ақпараты - Дәрілердің қалай жұмыс істейтіні
- Маман кеңестері - Қай дәрігерге бару керек
- Алдын алу - Денсаулықты сақтау кеңестері

Маңызды: Мен тек білім беру ақпаратын ұсынамын. Шұғыл жағдайларда 103 нөміріне қоңырау шалыңыз.

Сізге қалай көмектесе аламын?`;
    } else if (language === 'zh') {
      return `您好！我是您的高级AI医疗助手，基于最新AI技术。我可以提供以下方面的信息：

- 症状与疾病 - 医学症状的详细解释
- 治疗方案 - 一般治疗信息和家庭疗法
- 药物信息 - 药物的作用机制和效果
- 专科指导 - 应该去看哪位医生
- 预防保健 - 保持健康的建议

重要提示：我仅提供教育信息。如遇医疗紧急情况，请立即拨打103。请始终咨询医疗专业人员进行诊断和治疗。

我能为您做什么？`;
    }
    return `Hello! I'm your advanced AI medical assistant powered by the latest AI technology. I can provide comprehensive information about:

- Symptoms & Conditions - Detailed explanations of medical symptoms
- Treatment Options - General treatment information and home remedies
- Medication Info - How medicines work and their effects
- Specialist Guidance - Which doctor to consult for specific issues
- Preventive Care - Tips for maintaining good health

Important: I provide educational information only. For medical emergencies, call 103 immediately. Always consult a healthcare professional for diagnosis and treatment.

How can I help you today?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: getWelcomeMessage() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<number, string | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: getWelcomeMessage() }]);
    sessionIdRef.current = crypto.randomUUID();
  }, [language]);

  // Hydrate last session for logged-in users
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch("/api/ai/chat-history", { credentials: "include" });
        if (!res.ok) return;
        const { data } = await res.json();
        if (!data || !Array.isArray(data) || data.length === 0) return;
        const sessionMsgs = (data as any[])
          .filter((m: any) => m.role === "user" || m.role === "assistant")
          .reverse()
          .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }));
        if (sessionMsgs.length > 0) {
          setMessages([{ role: "assistant", content: getWelcomeMessage() }, ...sessionMsgs]);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestedQuestions = [t('suggestQ1'), t('suggestQ2'), t('suggestQ3'), t('suggestQ4')];

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;
    if (!canUse("aiDoctor")) {
      setError(t('usageLimitReached'));
      return;
    }

    const profileContext = getProfileContext();
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], profileContext, language }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error(t('rateLimitError'));
        if (response.status === 402) throw new Error(t('serviceUnavailable'));
        throw new Error("Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = (parsed.text ?? parsed.choices?.[0]?.delta?.content) as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
      await recordUsage("aiDoctor", { query: text });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="AI Doctor" description="Chat with our advanced AI medical assistant." path="/ai-doctor" />
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto mb-4"><UsageBanner feature="aiDoctor" /></div>
        {/* Header with 3D Robot */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="liquid-glass-heavy rounded-3xl overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[300px]">
              <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass-subtle text-sm font-semibold mb-4 w-fit">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-gradient">{t('poweredByAI')}</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {t('aiDoctorAssistant').split(' ').map((word, i) =>
                    i === 0 ? <span key={i} className="text-gradient">{word} </span> : word + ' '
                  )}
                </h1>
                <p className="text-muted-foreground">{t('getComprehensiveHealth')}</p>
              </div>
              <div className="flex-1 relative min-h-[250px] lg:min-h-[300px]">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Context Notice */}
        {(profile.age || profile.chronicConditions.length > 0) && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {t('responsesPersonalized')}
                  {profile.age && ` • ${t('age')}: ${profile.age}`}
                  {profile.chronicConditions.length > 0 && ` • ${profile.chronicConditions.length} ${t('chronicConditions').toLowerCase()}`}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-4 p-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-lg">
                    <Stethoscope className="h-7 w-7" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-medical-green border-2 border-background pulse-dot" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    {t('aiDoctor')}
                    <Sparkles className="h-4 w-4 text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{t('onlineReady')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link to="/journals">
                  <Button variant="ghost" size="sm" title={t('verifyWithJournals') || 'Verify with medical journals'}>
                    <BookOpen className="h-4 w-4 mr-1" />
                    {t('journals') || 'Journals'}
                  </Button>
                </Link>
                <EvidenceModal>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4 mr-1" />
                    {t('sources')}
                  </Button>
                </EvidenceModal>
              </div>
            </div>

            <ScrollArea className="h-[450px] p-5" ref={scrollRef}>
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-3 animate-fade-up", message.role === "user" ? "justify-end" : "justify-start")}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-br-md shadow-lg"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{translations[index] || message.content}</div>
                      {message.role === "assistant" && index > 0 && !(isLoading && index === messages.length - 1) && (
                        <div className="mt-2 -ml-2">
                          <TranslateButton
                            text={message.content}
                            isTranslated={!!translations[index]}
                            onTranslated={(t) => setTranslations((prev) => ({ ...prev, [index]: t }))}
                            cacheKey={`aidoc:${index}:${message.content.slice(0, 60)}`}
                          />
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-muted text-foreground">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 justify-start animate-fade-up">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-4">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length === 1 && (
              <div className="px-5 pb-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">{t('quickQuestions')}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button key={index} onClick={() => sendMessage(question)} className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mx-5 mb-4 flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="p-5 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                <Textarea
                  placeholder={t('askPlaceholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="min-h-[60px] max-h-[120px] resize-none rounded-2xl text-base"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px] shrink-0 gradient-primary text-primary-foreground border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
