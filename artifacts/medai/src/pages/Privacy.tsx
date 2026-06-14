import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, Eye, Trash2, Mail } from "lucide-react";

export default function Privacy() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Eye,
      title: "What Data We Collect",
      titleRu: "Какие данные мы собираем",
      titleKk: "Біз қандай деректер жинаймыз",
      titleZh: "我们收集哪些数据",
      content: [
        "Account information: email address and name provided during sign-up via Clerk authentication.",
        "Medical profile data: age, gender, allergies, and chronic conditions you optionally provide.",
        "Usage data: anonymized logs of which features you use (symptom checks, AI consultations, medicine searches).",
        "Technical data: IP address, browser type, and device information for security and rate limiting.",
        "Chat history: AI Doctor conversation history stored to provide continuity of service.",
      ],
      contentRu: [
        "Данные аккаунта: адрес электронной почты и имя, предоставленные при регистрации через Clerk.",
        "Данные медицинского профиля: возраст, пол, аллергии и хронические заболевания (предоставляются добровольно).",
        "Данные об использовании: анонимизированные журналы использования функций (проверка симптомов, консультации ИИ, поиск лекарств).",
        "Технические данные: IP-адрес, тип браузера и информация об устройстве для обеспечения безопасности.",
        "История чата: история разговоров с ИИ-врачом для обеспечения непрерывности обслуживания.",
      ],
    },
    {
      icon: Lock,
      title: "How We Store & Protect Your Data",
      titleRu: "Как мы храним и защищаем данные",
      titleKk: "Деректерді қалай сақтаймыз және қорғаймыз",
      titleZh: "我们如何存储和保护您的数据",
      content: [
        "All data is stored in encrypted PostgreSQL databases hosted on secure cloud infrastructure.",
        "Authentication is handled by Clerk, an enterprise-grade auth provider with SOC 2 compliance.",
        "All traffic is encrypted via HTTPS/TLS. We enforce HSTS to prevent downgrade attacks.",
        "Rate limiting and input validation are applied to all API endpoints to prevent abuse.",
        "We never store raw payment data — all payment processing is handled by Stripe/PayPal.",
        "Medical profile data is encrypted at rest and never shared with third parties for advertising.",
      ],
      contentRu: [
        "Все данные хранятся в зашифрованных базах данных PostgreSQL на защищённой облачной инфраструктуре.",
        "Аутентификация осуществляется через Clerk — провайдер корпоративного уровня с сертификацией SOC 2.",
        "Весь трафик шифруется через HTTPS/TLS. Мы применяем HSTS для защиты от атак понижения.",
        "Ограничение частоты запросов и валидация входных данных применяются ко всем API-эндпоинтам.",
        "Мы никогда не храним необработанные платёжные данные — обработка платежей осуществляется Stripe/PayPal.",
        "Данные медицинского профиля зашифрованы и никогда не передаются третьим сторонам для рекламы.",
      ],
    },
    {
      icon: Shield,
      title: "Third-Party Services",
      titleRu: "Сторонние сервисы",
      titleKk: "Үшінші тараптың қызметтері",
      titleZh: "第三方服务",
      content: [
        "Clerk (clerk.com) — authentication and user management. Clerk's privacy policy applies.",
        "OpenAI (openai.com) — AI responses are generated via OpenAI's API. Queries may be used to improve their models per their data policy.",
        "Stripe/PayPal — payment processing. We share only the minimum required payment data with them.",
        "Replit — hosting infrastructure. Your data resides in Replit's cloud environment.",
        "We do not sell your personal data to any third party.",
      ],
      contentRu: [
        "Clerk (clerk.com) — аутентификация и управление пользователями. Применяется политика конфиденциальности Clerk.",
        "OpenAI (openai.com) — ответы ИИ генерируются через API OpenAI. Запросы могут использоваться для улучшения их моделей.",
        "Stripe/PayPal — обработка платежей. Мы передаём только минимально необходимые платёжные данные.",
        "Replit — хостинговая инфраструктура. Ваши данные хранятся в облачной среде Replit.",
        "Мы не продаём ваши персональные данные третьим лицам.",
      ],
    },
    {
      icon: Trash2,
      title: "Your Rights & Data Deletion",
      titleRu: "Ваши права и удаление данных",
      titleKk: "Сіздің құқықтарыңыз және деректерді жою",
      titleZh: "您的权利和数据删除",
      content: [
        "You can request deletion of all your personal data at any time by contacting us.",
        "You can export your chat history and medical profile from your Profile page.",
        "You can delete your account directly from the Profile page, which removes all stored data.",
        "For data requests related to Clerk authentication data, contact Clerk directly at privacy@clerk.com.",
        "We will respond to all data requests within 30 days.",
      ],
      contentRu: [
        "Вы можете запросить удаление всех своих персональных данных в любое время, связавшись с нами.",
        "Вы можете экспортировать историю чата и медицинский профиль со страницы «Профиль».",
        "Вы можете удалить свой аккаунт прямо со страницы «Профиль», что приведёт к удалению всех данных.",
        "По вопросам данных аутентификации Clerk обращайтесь напрямую: privacy@clerk.com.",
        "Мы отвечаем на все запросы о данных в течение 30 дней.",
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Privacy Policy"
        description="Learn how MedAI+ collects, stores, and protects your personal and medical data."
        path="/privacy"
      />
      <div className="container py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-gradient">{t('privacyPolicy')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('privacyPolicy')}
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            This Privacy Policy explains how MedAI+ collects, uses, and protects your information when you use our service.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="medical-card p-8 rounded-3xl">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground pt-2">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="medical-card p-8 rounded-3xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Contact Us</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or want to exercise your data rights, contact us at:
            </p>
            <a
              href="mailto:yerzhanuly.y@nisa.edu.kz"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Mail className="h-4 w-4" />
              yerzhanuly.y@nisa.edu.kz
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
