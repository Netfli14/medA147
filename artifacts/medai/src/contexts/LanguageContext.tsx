import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ru' | 'kk' | 'zh';

interface Translations {
 [key: string]: {
 en: string;
 ru: string;
 kk: string;
 zh: string;
 };
}

export const translations: Translations = {
 // Navigation
 home: { en: 'Home', ru: 'Главная', kk: 'Басты бет', zh: '首页' },
 symptoms: { en: 'Symptoms', ru: 'Симптомы', kk: 'Белгілер', zh: '症状' },
 aiDoctor: { en: 'AI Doctor', ru: 'ИИ Доктор', kk: 'AI Дәрігер', zh: 'AI医生' },
 aiAnalysis: { en: 'AI Analysis', ru: 'ИИ Анализ', kk: 'AI Талдау', zh: 'AI分析' },
 medicines: { en: 'Medicines', ru: 'Лекарства', kk: 'Дәрілер', zh: '药品' },
 hospitals: { en: 'Hospitals', ru: 'Больницы', kk: 'Ауруханалар', zh: '医院' },
 about: { en: 'About', ru: 'О нас', kk: 'Біз туралы', zh: '关于我们' },
  feedback: { en: 'Feedback', ru: 'Отзывы', kk: 'Пікірлер', zh: '反馈' },
  journals: { en: 'Journals', ru: 'Журналы', kk: 'Журналдар', zh: '期刊' },
  translateVerdict: { en: 'Translate verdict', ru: 'Перевести вердикт', kk: 'Үкімді аудару', zh: '翻译结论' },
  translating: { en: 'Translating...', ru: 'Перевод...', kk: 'Аударылуда...', zh: '翻译中...' },
  showOriginal: { en: 'Show original', ru: 'Показать оригинал', kk: 'Түпнұсқаны көрсету', zh: '显示原文' },
  verifyWithJournals: { en: 'Not sure? Verify with medical journals', ru: 'Сомневаетесь? Проверьте по медицинским журналам', kk: 'Күмәніңіз бар ма? Медициналық журналдар бойынша тексеріңіз', zh: '不确定？通过医学期刊核实' },
  verifyWithJournalsHint: { en: 'Find peer-reviewed articles about this condition', ru: 'Найти статьи о вашей болезни в рецензируемых журналах', kk: 'Осы ауру туралы рецензияланған мақалаларды табу', zh: '查找关于此病症的同行评审文章' },
  openJournals: { en: 'Open', ru: 'Открыть', kk: 'Ашу', zh: '打开' },
  findJournals: { en: 'Find', ru: 'Найти', kk: 'Табу', zh: '查找' },
  relevantJournals: { en: 'Relevant peer-reviewed journals', ru: 'Подходящие рецензируемые журналы', kk: 'Қатысты рецензияланған журналдар', zh: '相关的同行评审期刊' },
  openArticle: { en: 'Open article', ru: 'Открыть статью', kk: 'Мақаланы ашу', zh: '打开文章' },
  searchInJournal: { en: 'Search in journal', ru: 'Искать в журнале', kk: 'Журналдан іздеу', zh: '在期刊中搜索' },
  journalHome: { en: 'Homepage', ru: 'Сайт журнала', kk: 'Журнал сайты', zh: '期刊主页' },
  
 
 // Homepage
 heroTagline: { en: 'Next-Gen Health Assistant', ru: 'Медицинский ИИ-ассистент нового поколения', kk: 'Жаңа буын денсаулық көмекшісі', zh: '新一代健康助手' },
 heroTitle1: { en: 'Your AI-Powered', ru: 'Ваш ИИ-помощник', kk: 'Сіздің AI-қуатты', zh: '您的AI驱动' },
 heroTitle2: { en: 'Medical', ru: 'в сфере', kk: 'Медициналық', zh: '医疗' },
 heroTitle3: { en: 'Companion', ru: 'медицины', kk: 'Серігіңіз', zh: '伙伴' },
 heroDescription: { en: 'Get instant health insights, accurate symptom analysis, medicine recommendations, and find nearby healthcare facilities,all powered by advanced AI.', ru: 'Мгновенные медицинские рекомендации, точный анализ симптомов, подбор лекарств и поиск ближайших клиник, всё на базе передового ИИ.', kk: 'Лезде денсаулық кеңестерін, дәл белгілер талдауын, дәрі ұсыныстарын алыңыз және жақын медициналық мекемелерді табыңыз, барлығы AI негізінде.', zh: '获取即时健康建议、精确症状分析、药物推荐，并查找附近医疗机构,,一切由先进AI驱动。' },
 checkSymptoms: { en: 'Check Symptoms', ru: 'Проверить симптомы', kk: 'Белгілерді тексеру', zh: '检查症状' },
 talkToAI: { en: 'Talk to AI Doctor', ru: 'Спросить ИИ-доктора', kk: 'AI дәрігермен сөйлесу', zh: '咨询AI医生' },
 available247: { en: 'Available', ru: 'Доступно', kk: 'Қолжетімді', zh: '全天候' },
 aiPowered: { en: 'Powered', ru: 'На базе ИИ', kk: 'AI қуатты', zh: 'AI驱动' },
 privateSecure: { en: 'Private', ru: 'Конфиденциально', kk: 'Құпия', zh: '安全私密' },
 fastResults: { en: 'Results', ru: 'Быстро', kk: 'Нәтижелер', zh: '快速结果' },
 exploreFeatures: { en: 'Explore Our Features', ru: 'Наши возможности', kk: 'Мүмкіндіктерімізді зерттеңіз', zh: '探索我们的功能' },
 featuresDescription: { en: 'Comprehensive AI-powered tools designed to help you make informed health decisions', ru: 'Комплексные ИИ-инструменты для принятия обоснованных решений о вашем здоровье', kk: 'Денсаулық шешімдерін қабылдауға көмектесетін жан-жақты AI құралдары', zh: '全面的AI工具，帮助您做出明智的健康决策' },
 needHelp: { en: 'Need Immediate Help?', ru: 'Нужна срочная помощь?', kk: 'Шұғыл көмек керек пе?', zh: '需要紧急帮助？' },
 emergencyDescription: { en: "If you're experiencing a medical emergency, please contact emergency services immediately.", ru: 'Если у вас неотложная медицинская ситуация, немедленно вызовите скорую помощь.', kk: 'Медициналық төтенше жағдай болса, дереу жедел жәрдемге хабарласыңыз.', zh: '如果您遇到医疗紧急情况，请立即联系急救服务。' },
 callEmergency: { en: 'Call Emergency: 103', ru: 'Скорая помощь: 103', kk: 'Жедел жәрдем: 103', zh: '拨打急救电话：103' },
 findHospitals: { en: 'Find Hospitals', ru: 'Найти больницы', kk: 'Ауруханаларды табу', zh: '查找医院' },
 
 // Feature cards
 featureSymptomTitle: { en: 'Symptoms Checker', ru: 'Проверка симптомов', kk: 'Белгілерді тексеру', zh: '症状检查' },
 featureSymptomDesc: { en: 'Advanced AI analysis of your symptoms for accurate condition identification', ru: 'Расширенный ИИ-анализ симптомов для точного выявления заболевания', kk: 'Дәл ауруды анықтау үшін белгілердің AI талдауы', zh: '先进的AI症状分析，准确识别健康状况' },
 featureAIDoctorTitle: { en: 'AI Doctor', ru: 'ИИ-Доктор', kk: 'AI Дәрігер', zh: 'AI医生' },
 featureAIDoctorDesc: { en: 'Powerful AI medical assistant with comprehensive health knowledge', ru: 'Мощный медицинский ИИ-ассистент с обширной базой знаний о здоровье', kk: 'Денсаулық туралы терең білімі бар қуатты AI медициналық көмекшісі', zh: '拥有全面医学知识的强大AI医疗助手' },
 featureImageTitle: { en: 'AI Image Analysis', ru: 'ИИ-анализ изображений', kk: 'AI сурет талдау', zh: 'AI图像分析' },
 featureImageDesc: { en: 'Precise visual analysis of skin conditions with detailed insights', ru: 'Точный визуальный анализ состояния кожи с подробными выводами', kk: 'Тері жағдайларының нақты визуалды талдауы', zh: '精确的皮肤状况视觉分析' },
 featureMedicineTitle: { en: 'Medicine Shop', ru: 'Аптека', kk: 'Дәріхана', zh: '药店' },
 featureMedicineDesc: { en: 'Find medicines for your condition with prices and instructions', ru: 'Поиск лекарств с ценами и инструкцией по применению', kk: 'Бағалар мен нұсқаулармен дәрі табыңыз', zh: '查找药品价格和用药说明' },
 featureHospitalTitle: { en: 'Pharmacies & Hospitals', ru: 'Аптеки и больницы', kk: 'Дәріханалар мен Ауруханалар', zh: '药房与医院' },
 featureHospitalDesc: { en: 'Navigate directly to pharmacies and hospitals in Astana', ru: 'Быстрый переход к аптекам и больницам Астаны', kk: 'Астанадағы дәріханалар мен ауруханаларға тікелей өтіңіз', zh: '直接导航到阿斯塔纳的药房和医院' },
 featureAboutTitle: { en: 'About Us', ru: 'О нас', kk: 'Біз туралы', zh: '关于我们' },
 featureAboutDesc: { en: 'Meet our team and learn about our mission', ru: 'Познакомьтесь с нашей командой и миссией', kk: 'Біздің команда және миссиямызбен танысыңыз', zh: '了解我们的团队和使命' },
 
 // Common
 search: { en: 'Search', ru: 'Поиск', kk: 'Іздеу', zh: '搜索' },
 submit: { en: 'Submit', ru: 'Отправить', kk: 'Жіберу', zh: '提交' },
 loading: { en: 'Loading...', ru: 'Загрузка...', kk: 'Жүктелуде...', zh: '加载中...' },
 analyze: { en: 'Analyze', ru: 'Анализировать', kk: 'Талдау', zh: '分析' },
 send: { en: 'Send', ru: 'Отправить', kk: 'Жіберу', zh: '发送' },
 goHome: { en: 'Go to Home', ru: 'На главную', kk: 'Басты бетке', zh: '返回首页' },
 signInRequired: { en: 'Sign in to view your profile', ru: 'Войдите, чтобы просмотреть профиль', kk: 'Профильді көру үшін кіріңіз', zh: '登录以查看您的个人资料' },
 signInProfileDesc: { en: 'Your medical profile, usage history and saved data will appear here after signing in.', ru: 'Ваш медицинский профиль, история использования и сохранённые данные отобразятся после входа.', kk: 'Медициналық профиліңіз, пайдалану тарихы және сақталған деректер кіргеннен кейін пайда болады.', zh: '登录后，您的医疗档案、使用历史和保存的数据将显示在这里。' },
 
 // Symptoms page
 symptomChecker: { en: 'Symptom Checker', ru: 'Проверка симптомов', kk: 'Белгілерді тексеру', zh: '症状检查器' },
 advancedSymptomAnalysis: { en: 'Advanced Symptom Analysis', ru: 'Расширенный анализ симптомов', kk: 'Кеңейтілген белгілерді талдау', zh: '高级症状分析' },
 analyzeYourSymptoms: { en: 'Analyze Your Symptoms', ru: 'Проанализируйте свои симптомы', kk: 'Белгілеріңізді талдаңыз', zh: '分析您的症状' },
 selectSymptoms: { en: 'Select Your Symptoms', ru: 'Выберите симптомы', kk: 'Белгілеріңізді таңдаңыз', zh: '选择您的症状' },
 symptomDescription: { en: 'Select multiple symptoms for more accurate analysis', ru: 'Выберите несколько симптомов для более точного анализа', kk: 'Дәлірек талдау үшін бірнеше белгіні таңдаңыз', zh: '选择多个症状以获得更准确的分析' },
 analyzeSymptoms: { en: 'Analyze Symptoms', ru: 'Анализировать симптомы', kk: 'Белгілерді талдау', zh: '分析症状' },
 analyzingSymptoms: { en: 'Analyzing Symptoms...', ru: 'Анализ симптомов...', kk: 'Белгілер талдануда...', zh: '正在分析症状...' },
 selectedSymptoms: { en: 'Selected symptoms', ru: 'Выбранные симптомы', kk: 'Таңдалған белгілер', zh: '已选症状' },
 describeInDetail: { en: 'Describe in Detail', ru: 'Опишите подробнее', kk: 'Толық сипаттаңыз', zh: '详细描述' },
 moreDetailsMoreAccurate: { en: 'The more details you provide, the more accurate the analysis will be.', ru: 'Чем подробнее опишете, тем точнее будет анализ.', kk: 'Көбірек мәлімет берсеңіз, талдау дәлірек болады.', zh: '提供的细节越多，分析越准确。' },
 describePlaceholder: { en: 'Describe your symptoms in detail: When did they start? How severe are they? Are there any triggers?', ru: 'Опишите симптомы подробно: когда начались? Насколько выражены? Есть ли провоцирующие факторы?', kk: 'Белгілеріңізді толық сипаттаңыз: Қашан басталды? Қаншалықты қатты? Триггерлер бар ма?', zh: '详细描述您的症状：何时开始的？严重程度如何？有什么诱因吗？' },
 pleaseSelectSymptom: { en: 'Please select at least one symptom or describe your symptoms.', ru: 'Пожалуйста, выберите хотя бы один симптом или опишите их.', kk: 'Кем дегенде бір белгіні таңдаңыз немесе сипаттаңыз.', zh: '请至少选择一个症状或描述您的症状。' },
 possibleConditions: { en: 'Possible Conditions', ru: 'Возможные заболевания', kk: 'Ықтимал аурулар', zh: '可能的疾病' },
 basedOnSymptoms: { en: 'Based on your symptoms, here are the most likely conditions', ru: 'На основе ваших симптомов, вот наиболее вероятные заболевания', kk: 'Белгілеріңізге сүйене отырып, ықтимал жағдайлар', zh: '根据您的症状，以下是最可能的疾病' },
 severity: { en: 'Severity', ru: 'Тяжесть', kk: 'Ауырлығы', zh: '严重程度' },
 possibleCause: { en: 'Possible Cause', ru: 'Возможная причина', kk: 'Ықтимал себеп', zh: '可能原因' },
 
 // Symptom names
 headache: { en: 'Headache', ru: 'Головная боль', kk: 'Бас ауруы', zh: '头痛' },
 fever: { en: 'Fever', ru: 'Лихорадка', kk: 'Қызба', zh: '发烧' },
 cough: { en: 'Cough', ru: 'Кашель', kk: 'Жөтел', zh: '咳嗽' },
 fatigue: { en: 'Fatigue', ru: 'Усталость', kk: 'Шаршау', zh: '疲劳' },
 soreThroat: { en: 'Sore Throat', ru: 'Боль в горле', kk: 'Тамақ ауруы', zh: '喉咙痛' },
 bodyAches: { en: 'Body Aches', ru: 'Ломота в теле', kk: 'Дене ауруы', zh: '全身酸痛' },
 nausea: { en: 'Nausea', ru: 'Тошнота', kk: 'Жүрек айну', zh: '恶心' },
 dizziness: { en: 'Dizziness', ru: 'Головокружение', kk: 'Бас айналу', zh: '头晕' },
 shortnessOfBreath: { en: 'Shortness of Breath', ru: 'Одышка', kk: 'Тыныс қысылу', zh: '呼吸急促' },
 chestPain: { en: 'Chest Pain', ru: 'Боль в груди', kk: 'Кеуде ауруы', zh: '胸痛' },
 runnyNose: { en: 'Runny Nose', ru: 'Насморк', kk: 'Мұрын ағу', zh: '流鼻涕' },
 lossOfAppetite: { en: 'Loss of Appetite', ru: 'Потеря аппетита', kk: 'Тәбеттің жоғалуы', zh: '食欲不振' },
 
 // AI Doctor
 askDoctor: { en: 'Ask AI Doctor', ru: 'Спросить ИИ-доктора', kk: 'AI Дәрігерден сұрау', zh: '咨询AI医生' },
 typeMessage: { en: 'Type your message...', ru: 'Введите сообщение...', kk: 'Хабарламаңызды жазыңыз...', zh: '输入您的消息...' },
 poweredByAI: { en: 'Powered by Advanced AI', ru: 'На базе передового ИИ', kk: 'Озық AI негізінде', zh: '由先进AI驱动' },
 aiDoctorAssistant: { en: 'AI Doctor Assistant', ru: 'ИИ-доктор', kk: 'AI Дәрігер Көмекшісі', zh: 'AI医生助手' },
 getComprehensiveHealth: { en: 'Get comprehensive health information from our powerful AI medical assistant.', ru: 'Получите исчерпывающую информацию о здоровье от нашего мощного ИИ-ассистента.', kk: 'Біздің қуатты AI медициналық көмекшісінен денсаулық туралы толық ақпарат алыңыз.', zh: '从我们强大的AI医疗助手获取全面的健康信息。' },
 onlineReady: { en: 'Online • Ready to help 24/7', ru: 'Онлайн • Готов помочь 24/7', kk: 'Онлайн • 24/7 көмектесуге дайын', zh: '在线 • 全天候为您服务' },
 sources: { en: 'Sources', ru: 'Источники', kk: 'Дереккөздер', zh: '来源' },
 quickQuestions: { en: 'Quick questions:', ru: 'Быстрые вопросы:', kk: 'Жылдам сұрақтар:', zh: '快速提问：' },
 askPlaceholder: { en: 'Ask about symptoms, conditions, treatments, or any health-related questions...', ru: 'Спросите о симптомах, заболеваниях, лечении или любых вопросах о здоровье...', kk: 'Белгілер, аурулар, емдеу немесе денсаулыққа қатысты кез келген сұрақ қойыңыз...', zh: '询问症状、疾病、治疗或任何健康相关问题...' },
 
 // Suggested questions
 suggestQ1: { en: 'What are the symptoms of the flu?', ru: 'Каковы симптомы гриппа?', kk: 'Тұмаудың белгілері қандай?', zh: '流感有哪些症状？' },
 suggestQ2: { en: 'How can I improve my sleep quality?', ru: 'Как улучшить качество сна?', kk: 'Ұйқы сапасын қалай жақсартуға болады?', zh: '如何提高睡眠质量？' },
 suggestQ3: { en: 'What should I do for a headache?', ru: 'Что делать при головной боли?', kk: 'Бас ауырғанда не істеу керек?', zh: '头痛该怎么办？' },
 suggestQ4: { en: 'When should I see a doctor for a cough?', ru: 'Когда обращаться к врачу при кашле?', kk: 'Жөтелмен қашан дәрігерге бару керек?', zh: '咳嗽什么时候应该去看医生？' },
 
 // AI Analysis
 precisionAIAnalysis: { en: 'Precision AI Analysis', ru: 'Точный ИИ-анализ', kk: 'Нақты AI талдау', zh: '精准AI分析' },
 aiImageAnalysis: { en: 'AI Image Analysis', ru: 'ИИ-анализ изображений', kk: 'AI Сурет талдау', zh: 'AI图像分析' },
 uploadPhotoDescription: { en: 'Upload a photo of skin conditions for detailed AI-powered visual analysis with high accuracy.', ru: 'Загрузите фото состояния кожи для детального ИИ-анализа с высокой точностью.', kk: 'Жоғары дәлдікпен AI талдауы үшін тері жағдайының суретін жүктеңіз.', zh: '上传皮肤状况照片，获取高精度AI视觉分析。' },
 uploadImage: { en: 'Upload Image', ru: 'Загрузить изображение', kk: 'Суретті жүктеу', zh: '上传图片' },
 clickToUpload: { en: 'Click to upload or drag and drop', ru: 'Нажмите для загрузки или перетащите файл', kk: 'Жүктеу үшін басыңыз немесе сүйреңіз', zh: '点击上传或拖拽文件' },
 upTo10MB: { en: 'PNG, JPG, WEBP up to 10MB', ru: 'PNG, JPG, WEBP до 10 МБ', kk: 'PNG, JPG, WEBP 10МБ дейін', zh: 'PNG、JPG、WEBP，最大10MB' },
 forBestResults: { en: 'For best results, use clear, well-lit images', ru: 'Для лучших результатов используйте чёткие, хорошо освещённые фото', kk: 'Жақсы нәтиже үшін анық, жарық суреттер қолданыңыз', zh: '为获得最佳效果，请使用清晰、光线充足的图片' },
 analyzeImage: { en: 'Analyze Image', ru: 'Анализировать изображение', kk: 'Суретті талдау', zh: '分析图片' },
 analyzingImage: { en: 'Analyzing Image...', ru: 'Анализ изображения...', kk: 'Сурет талдануда...', zh: '正在分析图片...' },
 aiObservations: { en: 'AI Observations', ru: 'Наблюдения ИИ', kk: 'AI бақылаулары', zh: 'AI观察结果' },
 aiRecommendation: { en: 'AI Recommendation', ru: 'Рекомендация ИИ', kk: 'AI ұсынысы', zh: 'AI建议' },
 likelihood: { en: 'Likelihood', ru: 'Вероятность', kk: 'Ықтималдық', zh: '可能性' },
 
 // Medicines
 healthMarket: { en: 'Health Market', ru: 'Медицинский магазин', kk: 'Денсаулық дүкені', zh: '健康商城' },
 findMedicinesTitle: { en: 'Find Medicines for Your Condition', ru: 'Подберите лекарства для вашего заболевания', kk: 'Ауруыңызға дәрі табыңыз', zh: '为您的疾病查找药品' },
 medicineShop: { en: 'Medicine Information', ru: 'Информация о лекарствах', kk: 'Дәрілер туралы ақпарат', zh: '药品信息' },
 searchCondition: { en: 'Search by condition or symptom', ru: 'Поиск по заболеванию или симптому', kk: 'Ауру немесе белгі бойынша іздеу', zh: '按疾病或症状搜索' },
 findMedicines: { en: 'Find Medicines', ru: 'Найти лекарства', kk: 'Дәрілерді табу', zh: '查找药品' },
 findingMedicines: { en: 'Finding Medicines...', ru: 'Поиск лекарств...', kk: 'Дәрілер ізделуде...', zh: '正在查找药品...' },
 whatsYourCondition: { en: "What's your condition or disease?", ru: 'Какое у вас заболевание?', kk: 'Сіздің ауруыңыз қандай?', zh: '您的疾病或症状是什么？' },
 conditionPlaceholder: { en: 'e.g., Headache, Flu, Allergies, Back Pain...', ru: 'например: головная боль, грипп, аллергия...', kk: 'мысалы, Бас ауруы, Тұмау, Аллергия...', zh: '例如：头痛、流感、过敏、腰痛...' },
 medicinesFor: { en: 'Medicines for', ru: 'Лекарства от', kk: 'Дәрілер', zh: '治疗药物' },
 foundMedicines: { en: 'recommended medicines', ru: 'рекомендуемых лекарств', kk: 'ұсынылған дәрілер', zh: '推荐药品' },
 filters: { en: 'Filters', ru: 'Фильтры', kk: 'Сүзгілер', zh: '筛选' },
 allPrices: { en: 'All Prices', ru: 'Все цены', kk: 'Барлық бағалар', zh: '所有价格' },
 budget: { en: 'Budget', ru: 'Бюджетные', kk: 'Бюджет', zh: '经济型' },
 medium: { en: 'Medium', ru: 'Средние', kk: 'Орташа', zh: '中等价位' },
 premium: { en: 'Premium', ru: 'Премиум', kk: 'Премиум', zh: '高端' },
 genericsOnly: { en: 'Generics Only', ru: 'Только дженерики', kk: 'Тек генериктер', zh: '仅仿制药' },
 dosage: { en: 'Dosage', ru: 'Дозировка', kk: 'Дозалау', zh: '剂量' },
 instructions: { en: 'Instructions', ru: 'Инструкция', kk: 'Нұсқаулар', zh: '用法说明' },
 duration: { en: 'Duration', ru: 'Длительность', kk: 'Ұзақтығы', zh: '疗程' },
 warnings: { en: 'Warnings', ru: 'Предупреждения', kk: 'Ескертулер', zh: '注意事项' },
 inStock: { en: 'In Stock', ru: 'В наличии', kk: 'Қолда бар', zh: '有库存' },
 outOfStock: { en: 'Out of Stock', ru: 'Нет в наличии', kk: 'Қолда жоқ', zh: '缺货' },
 generic: { en: 'Generic', ru: 'Дженерик', kk: 'Генерик', zh: '仿制药' },
 analogues: { en: 'Analogues', ru: 'Аналоги', kk: 'Аналогтар', zh: '类似药品' },
 drugInteractionWarning: { en: 'Drug Interaction Warning', ru: 'Предупреждение о взаимодействии лекарств', kk: 'Дәрі әрекеттесу ескертуі', zh: '药物相互作用警告' },
 mayInteractWith: { en: 'May interact with', ru: 'Может взаимодействовать с', kk: 'Әрекеттесуі мүмкін', zh: '可能与以下药物相互作用' },
 safetyCheckTitle: { en: 'Patient Safety Profile', ru: 'Профиль безопасности пациента', kk: 'Пациент қауіпсіздік профилі', zh: '患者安全档案' },
 safetyCheckHint: { en: 'AI checks each medicine for interactions with your chronic diseases and current medications', ru: 'ИИ проверяет каждое лекарство на взаимодействие с вашими болезнями и текущими препаратами', kk: 'AI әр дәрінің созылмалы аурулармен және препараттарыңызбен үйлесімділігін тексереді', zh: 'AI将检查每种药物与您慢性疾病和当前用药的相互作用' },
 chronicDiseasesLabel: { en: 'Chronic Diseases', ru: 'Хронические заболевания', kk: 'Созылмалы аурулар', zh: '慢性疾病' },
 chronicDiseasesPlaceholder: { en: 'e.g. Diabetes type 2, Hypertension...', ru: 'напр. Диабет 2 типа, Гипертония...', kk: 'мысалы: Диабет, Гипертония...', zh: '例如：2型糖尿病、高血压...' },
 currentMedicationsLabel: { en: 'Current Medications', ru: 'Текущие лекарства', kk: 'Қазіргі дәрілер', zh: '当前用药' },
 currentMedicationsPlaceholder: { en: 'e.g. Metformin 500mg, Enalapril...', ru: 'напр. Метформин 500мг, Эналаприл...', kk: 'мысалы: Метформин 500мг, Эналаприл...', zh: '例如：二甲双胍500mg、依那普利...' },
 importFromProfile: { en: 'Import from profile', ru: 'Импортировать из профиля', kk: 'Профильден импорттау', zh: '从档案导入' },
 typeAndPressEnter: { en: 'Type and press Enter to add', ru: 'Введите и нажмите Enter', kk: 'Жазып Enter басыңыз', zh: '输入后按Enter添加' },
 criticalInteraction: { en: 'Critical Interaction', ru: 'Критическое взаимодействие', kk: 'Маңызды әрекеттесу', zh: '严重相互作用' },
 moderateInteraction: { en: 'Moderate Interaction', ru: 'Умеренное взаимодействие', kk: 'Орташа әрекеттесу', zh: '中度相互作用' },
 minorInteraction: { en: 'Minor Interaction', ru: 'Незначительное взаимодействие', kk: 'Шамалы әрекеттесу', zh: '轻微相互作用' },
 noInteractionsFound: { en: 'No interactions detected with your safety profile', ru: 'Взаимодействий с вашим профилем не выявлено', kk: 'Профиліңізбен әрекеттесу анықталмады', zh: '未检测到与您安全档案的相互作用' },
 safetyAlertBanner: { en: 'Safety Alert — Critical Interactions Detected', ru: 'Предупреждение безопасности — обнаружены критические взаимодействия', kk: 'Қауіпсіздік ескертуі — маңызды әрекеттесулер анықталды', zh: '安全警报 — 检测到严重相互作用' },
 nearbyPharmacies: { en: 'Nearby Pharmacies', ru: 'Ближайшие аптеки', kk: 'Жақын аптекалар', zh: '附近药房' },
 generalAdvice: { en: 'General Advice', ru: 'Общие рекомендации', kk: 'Жалпы кеңестер', zh: '一般建议' },
 
 // Hospitals
 pharmaciesHospitals: { en: 'Pharmacies & Hospitals', ru: 'Аптеки и больницы', kk: 'Дәріханалар мен Ауруханалар', zh: '药房与医院' },
 healthcareLocations: { en: 'Healthcare Locations', ru: 'Медицинские учреждения', kk: 'Медициналық мекемелер', zh: '医疗机构' },
 pharmaciesHospitalsAstana: { en: 'Pharmacies & Hospitals in Astana', ru: 'Аптеки и больницы Астаны', kk: 'Астанадағы Дәріханалар мен Ауруханалар', zh: '阿斯塔纳药房与医院' },
 clickForDirections: { en: 'Click on any location to get directions automatically via Google Maps', ru: 'Нажмите на любую локацию для автоматического построения маршрута', kk: 'Маршрутты автоматты түрде алу үшін кез келген орынды басыңыз', zh: '点击任意位置通过Google地图自动获取路线' },
 getDirections: { en: 'Get Directions', ru: 'Построить маршрут', kk: 'Бағытты көрсету', zh: '获取路线' },
 clickToGetDirections: { en: 'Click to get directions', ru: 'Нажмите для маршрута', kk: 'Маршрут үшін басыңыз', zh: '点击获取路线' },
 callPharmacy: { en: 'Call', ru: 'Позвонить', kk: 'Қоңырау шалу', zh: '拨打电话' },
 emergency: { en: 'Emergency', ru: 'Экстренная помощь', kk: 'Шұғыл көмек', zh: '紧急服务' },
 emergencyAmbulance: { en: 'Emergency (Ambulance)', ru: 'Скорая помощь', kk: 'Жедел жәрдем', zh: '急救（救护车）' },
 generalEmergency: { en: 'General Emergency', ru: 'Общая экстренная служба', kk: 'Жалпы шұғыл қызмет', zh: '综合急救' },
 pharmacies: { en: 'Pharmacies', ru: 'Аптеки', kk: 'Дәріханалар', zh: '药房' },
 hospitalsTitle: { en: 'Hospitals', ru: 'Больницы', kk: 'Ауруханалар', zh: '医院' },
 astanaHealthcareMap: { en: 'Astana Healthcare Map', ru: 'Карта медучреждений Астаны', kk: 'Астана медициналық мекемелер картасы', zh: '阿斯塔纳医疗地图' },
 openFullMap: { en: 'Open Full Map', ru: 'Открыть полную карту', kk: 'Толық картаны ашу', zh: '打开完整地图' },
 walkTime: { en: 'walk', ru: 'пешком', kk: 'жаяу', zh: '步行' },
 driveTime: { en: 'drive', ru: 'на авто', kk: 'көлікпен', zh: '驾车' },
 
 // About
 ourTeam: { en: 'Our Team', ru: 'Наша команда', kk: 'Біздің команда', zh: '我们的团队' },
 developer: { en: 'Developer', ru: 'Разработчик', kk: 'Әзірлеуші', zh: '开发者' },
 researcher: { en: 'Researcher', ru: 'Исследователь', kk: 'Зерттеуші', zh: '研究员' },
 assistantResearcher: { en: 'Assistant Researcher', ru: 'Помощник исследователя', kk: 'Зерттеуші көмекшісі', zh: '助理研究员' },
 
 // Feedback
 feedbackTitle: { en: 'Product Improvement Suggestions', ru: 'Предложения по улучшению продукта', kk: 'Жақсарту ұсыныстары', zh: '产品改进建议' },
 feedbackDescription: { en: 'Help us improve MedAI+ by sharing your ideas and suggestions', ru: 'Помогите улучшить MedAI+, поделившись своими идеями', kk: 'Идеяларыңызбен бөлісіп, MedAI+ жақсартуға көмектесіңіз', zh: '分享您的想法和建议，帮助我们改进MedAI+' },
 yourName: { en: 'Your Name (optional)', ru: 'Ваше имя (необязательно)', kk: 'Атыңыз (міндетті емес)', zh: '您的姓名（可选）' },
 yourEmail: { en: 'Your Email (optional)', ru: 'Ваш email (необязательно)', kk: 'Email (міндетті емес)', zh: '您的邮箱（可选）' },
 category: { en: 'Category', ru: 'Категория', kk: 'Санат', zh: '类别' },
 suggestion: { en: 'Your Suggestion', ru: 'Ваше предложение', kk: 'Сіздің ұсынысыңыз', zh: '您的建议' },
 suggestionPlaceholder: { en: 'Share your ideas for improving our product...', ru: 'Поделитесь идеями по улучшению продукта...', kk: 'Өнімді жақсарту бойынша идеяларыңызбен бөлісіңіз...', zh: '分享您改进产品的想法...' },
 submitSuggestion: { en: 'Submit Suggestion', ru: 'Отправить предложение', kk: 'Ұсынысты жіберу', zh: '提交建议' },
 thankYou: { en: 'Thank you for your feedback!', ru: 'Спасибо за ваш отзыв!', kk: 'Пікіріңіз үшін рахмет!', zh: '感谢您的反馈！' },
 yourFeedbackHelps: { en: 'Your feedback helps us improve MedAI+', ru: 'Ваш отзыв помогает нам улучшить MedAI+', kk: 'Пікіріңіз MedAI+ жақсартуға көмектеседі', zh: '您的反馈帮助我们改进MedAI+' },
 
 // Feedback Stats
 feedbackStats: { en: 'Community Feedback', ru: 'Отзывы сообщества', kk: 'Қауымдастық пікірлері', zh: '社区反馈' },
 feedbackStatsDescription: { en: 'See what others are suggesting', ru: 'Посмотрите предложения других пользователей', kk: 'Басқалардың ұсыныстарын қараңыз', zh: '查看其他人的建议' },
 totalSuggestions: { en: 'Total Suggestions', ru: 'Всего предложений', kk: 'Барлық ұсыныстар', zh: '总建议数' },
 thisWeek: { en: 'This Week', ru: 'За неделю', kk: 'Осы аптада', zh: '本周' },
 mostPopular: { en: 'Most Popular', ru: 'Самое популярное', kk: 'Ең танымал', zh: '最受欢迎' },
 byCategory: { en: 'By Category', ru: 'По категориям', kk: 'Санаттар бойынша', zh: '按类别' },
 
 // Categories
 catGeneral: { en: 'General', ru: 'Общее', kk: 'Жалпы', zh: '常规' },
 catUI: { en: 'User Interface', ru: 'Интерфейс', kk: 'Интерфейс', zh: '用户界面' },
 catFeatures: { en: 'New Features', ru: 'Новые функции', kk: 'Жаңа мүмкіндіктер', zh: '新功能' },
 catAI: { en: 'AI Improvements', ru: 'Улучшения ИИ', kk: 'AI жақсарту', zh: 'AI改进' },
 catOther: { en: 'Other', ru: 'Другое', kk: 'Басқа', zh: '其他' },
 
 // Medical Profile
 medicalProfile: { en: 'Medical Profile', ru: 'Медицинский профиль', kk: 'Медициналық профиль', zh: '医疗档案' },
 age: { en: 'Age', ru: 'Возраст', kk: 'Жас', zh: '年龄' },
 gender: { en: 'Gender', ru: 'Пол', kk: 'Жынысы', zh: '性别' },
 male: { en: 'Male', ru: 'Мужской', kk: 'Ер', zh: '男' },
 female: { en: 'Female', ru: 'Женский', kk: 'Әйел', zh: '女' },
 allergies: { en: 'Allergies', ru: 'Аллергии', kk: 'Аллергиялар', zh: '过敏史' },
 medications: { en: 'Current Medications', ru: 'Текущие лекарства', kk: 'Қазіргі дәрілер', zh: '当前用药' },
 chronicConditions: { en: 'Chronic Conditions', ru: 'Хронические заболевания', kk: 'Созылмалы аурулар', zh: '慢性病' },
 analysisPersonalized: { en: 'Analysis will consider your profile', ru: 'Анализ учтёт ваш профиль', kk: 'Талдау профиліңізді ескереді', zh: '分析将考虑您的档案' },
 responsesPersonalized: { en: 'Responses personalized for your profile', ru: 'Ответы персонализированы под ваш профиль', kk: 'Жауаптар профиліңізге бейімделген', zh: '根据您的档案个性化回复' },
 
 // About page
 aboutDescription: { en: 'We are a dedicated team of students from NIS IB (Nazarbayev Intellectual School, International Baccalaureate program) passionate about using technology to improve healthcare accessibility.', ru: 'Мы, команда студентов NIS IB (Назарбаев Интеллектуальная Школа, программа Международного Бакалавриата), увлечённых использованием технологий для повышения доступности медицины.', kk: 'Біз денсаулық сақтау қолжетімділігін жақсарту үшін технологияны қолдануға құмар NIS IB (Назарбаев Интеллектуалды Мектебі, IB бағдарламасы) студенттерінің командасымыз.', zh: '我们是来自NIS IB（纳扎尔巴耶夫知识学校国际文凭课程）的学生团队，致力于通过技术提高医疗服务的可及性。' },
 nisDescription: { en: 'Nazarbayev Intellectual School - International Baccalaureate', ru: 'Назарбаев Интеллектуальная Школа, Международный Бакалавриат', kk: 'Назарбаев Интеллектуалды Мектебі, Халықаралық Бакалавриат', zh: '纳扎尔巴耶夫知识学校,,国际文凭课程' },
 projectDescription: { en: 'This project was developed as part of our educational initiative at NIS IB, combining our passion for technology with a desire to make healthcare information more accessible to everyone.', ru: 'Этот проект создан в рамках нашей образовательной инициативы в NIS IB. Мы объединили страсть к технологиям с желанием сделать медицинскую информацию доступной каждому.', kk: 'Бұл жоба NIS IB-дегі біздің білім беру бастамамыздың бір бөлігі ретінде әзірленді, технологияға деген құмарлығымызды денсаулық сақтау туралы ақпаратты барлығына қолжетімді ету тілегімен біріктіреді.', zh: '该项目是我们在NIS IB教育计划的一部分，将对技术的热情与让医疗信息更易获取的愿望相结合。' },
 sponsorship: { en: 'Sponsorship', ru: 'Спонсорство', kk: 'Демеушілік', zh: '赞助' },
 sponsorshipDescription: { en: 'This section is reserved for future sponsors and partners who support our mission to improve healthcare accessibility through technology.', ru: 'Этот раздел предназначен для будущих спонсоров и партнёров, поддерживающих нашу миссию по улучшению доступности медицины с помощью технологий.', kk: 'Бұл бөлім технология арқылы денсаулық сақтау қолжетімділігін жақсарту миссиямызды қолдайтын болашақ демеушілер мен серіктестерге арналған.', zh: '本栏目保留给未来的赞助商和合作伙伴，他们支持我们通过技术改善医疗可及性的使命。' },
 comingSoon: { en: 'Coming Soon', ru: 'Скоро', kk: 'Жақында', zh: '即将推出' },
 
 // Disclaimer
 disclaimer: { en: 'Medical Disclaimer', ru: 'Медицинское предупреждение', kk: 'Медициналық жауапкершіліктен бас тарту', zh: '医疗免责声明' },
 disclaimerText: { en: 'This AI tool provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.', ru: 'Этот ИИ-инструмент предоставляет только общую информацию о здоровье и не заменяет профессиональную медицинскую консультацию, диагностику или лечение. Всегда консультируйтесь с врачом.', kk: 'Бұл құрал тек жалпы денсаулық туралы ақпарат береді және кәсіби медициналық кеңестің орнын баспайды. Әрқашан дәрігермен кеңесіңіз.', zh: '此AI工具仅提供一般健康信息，不能替代专业医疗建议、诊断或治疗。请始终咨询合格的医疗服务提供者。' },
 disclaimerFooterText: { en: 'This website provides general health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.', ru: 'Этот сайт предоставляет общую информацию о здоровье исключительно в образовательных целях. Он не заменяет профессиональную медицинскую консультацию. Всегда обращайтесь к квалифицированному медицинскому специалисту.', kk: 'Бұл веб-сайт тек білім беру мақсатында жалпы денсаулық туралы ақпарат береді. Ол кәсіби медициналық кеңестің, диагностиканың немесе емдеудің орнын баспайды. Әрқашан білікті дәрігерге жүгініңіз.', zh: '本网站仅出于教育目的提供一般健康信息，不能替代专业医疗建议、诊断或治疗。如有健康问题，请始终咨询合格的医疗服务提供者。' },
 disclaimerFooterBold: { en: 'If your condition worsens, seek immediate medical attention.', ru: 'Если ваше состояние ухудшится, немедленно обратитесь за медицинской помощью.', kk: 'Жағдайыңыз нашарласа, дереу медициналық көмекке жүгініңіз.', zh: '如果病情恶化，请立即就医。' },
 importantNotice: { en: 'Important Notice', ru: 'Важное уведомление', kk: 'Маңызды ескерту', zh: '重要提示' },
 disclaimerBannerText: { en: 'This information is for reference only and does not replace a doctor\'s consultation. If your condition worsens, seek medical help immediately.', ru: 'Эта информация носит справочный характер и не заменяет консультацию врача. Если ваше состояние ухудшится, немедленно обратитесь за медицинской помощью.', kk: 'Бұл ақпарат тек анықтамалық сипатта және дәрігермен кеңесудің орнын баспайды. Жағдайыңыз нашарласа, дереу медициналық көмекке жүгініңіз.', zh: '此信息仅供参考，不能替代医生的诊疗。如病情恶化，请立即就医。' },
 
 // Evidence
 evidenceBased: { en: 'Evidence-Based Sources', ru: 'Научные источники', kk: 'Ғылыми дереккөздер', zh: '循证来源' },
 whatIsThisBased: { en: 'What is this based on?', ru: 'На чём это основано?', kk: 'Бұл неге негізделген?', zh: '这基于什么？' },
 
 // Conditions
 conditionHeadache: { en: 'Headache', ru: 'Головная боль', kk: 'Бас ауруы', zh: '头痛' },
 conditionColdFlu: { en: 'Cold & Flu', ru: 'Простуда и грипп', kk: 'Суық тию және тұмау', zh: '感冒与流感' },
 conditionFever: { en: 'Fever', ru: 'Жар', kk: 'Қызба', zh: '发烧' },
 conditionAllergies: { en: 'Allergies', ru: 'Аллергия', kk: 'Аллергия', zh: '过敏' },
 conditionStomachPain: { en: 'Stomach Pain', ru: 'Боль в животе', kk: 'Асқазан ауруы', zh: '胃痛' },
 conditionSoreThroat: { en: 'Sore Throat', ru: 'Боль в горле', kk: 'Тамақ ауруы', zh: '喉咙痛' },
 conditionBackPain: { en: 'Back Pain', ru: 'Боль в спине', kk: 'Арқа ауруы', zh: '腰背痛' },
 conditionCough: { en: 'Cough', ru: 'Кашель', kk: 'Жөтел', zh: '咳嗽' },
 conditionInsomnia: { en: 'Insomnia', ru: 'Бессонница', kk: 'Ұйқысыздық', zh: '失眠' },
 conditionMusclePain: { en: 'Muscle Pain', ru: 'Мышечная боль', kk: 'Бұлшықет ауруы', zh: '肌肉疼痛' },

 // Footer
 footerDescription: { en: 'AI-powered health information assistant. Get preliminary insights about symptoms, conditions, and medications. Always consult a doctor for proper medical advice.', ru: 'ИИ-помощник по медицинской информации. Получайте предварительные сведения о симптомах, заболеваниях и лекарствах. Всегда консультируйтесь с врачом.', kk: 'AI негізіндегі денсаулық туралы ақпарат көмекшісі. Белгілер, аурулар және дәрілер туралы алдын ала мәліметтер алыңыз. Әрқашан дәрігермен кеңесіңіз.', zh: 'AI驱动的健康信息助手。获取关于症状、疾病和药物的初步分析。请始终咨询医生以获得专业医疗建议。' },
 quickLinks: { en: 'Quick Links', ru: 'Быстрые ссылки', kk: 'Жылдам сілтемелер', zh: '快速链接' },
 symptomsChecker: { en: 'Symptoms Checker', ru: 'Проверка симптомов', kk: 'Белгілерді тексеру', zh: '症状检查' },
 imageAnalysis: { en: 'Image Analysis', ru: 'Анализ изображений', kk: 'Сурет талдау', zh: '图像分析' },
 aboutUs: { en: 'About Us', ru: 'О нас', kk: 'Біз туралы', zh: '关于我们' },
 forInfoOnly: { en: 'For informational purposes only.', ru: 'Только в информационных целях.', kk: 'Тек ақпараттық мақсатта.', zh: '仅供参考。' },
 madeWithLove: { en: 'Made by NIS IB Team', ru: 'Создано командой NIS IB', kk: 'NIS IB командасы жасады', zh: '由NIS IB团队制作' },
 
 // Medical Profile Sheet
 basicInformation: { en: 'Basic Information', ru: 'Основная информация', kk: 'Негізгі ақпарат', zh: '基本信息' },
 weight: { en: 'Weight (kg)', ru: 'Вес (кг)', kk: 'Салмақ (кг)', zh: '体重（公斤）' },
 other: { en: 'Other', ru: 'Другой', kk: 'Басқа', zh: '其他' },
 recentHistory: { en: 'Recent History', ru: 'Недавняя история', kk: 'Соңғы тарих', zh: '近期病史' },
 clear: { en: 'Clear', ru: 'Очистить', kk: 'Тазалау', zh: '清除' },
 profileStoredLocally: { en: 'Your profile is stored locally and helps AI provide more personalized recommendations. No data is sent to external servers.', ru: 'Ваш профиль хранится локально и помогает ИИ давать более персонализированные рекомендации. Данные не отправляются на внешние серверы.', kk: 'Профиліңіз жергілікті түрде сақталады және AI-ға жеке ұсыныстар беруге көмектеседі. Деректер сыртқы серверлерге жіберілмейді.', zh: '您的档案存储在本地，帮助AI提供更个性化的建议。数据不会发送到外部服务器。' },

 // Hospital types
 mainHospital: { en: 'Main Hospital', ru: 'Главная больница', kk: 'Басты аурухана', zh: '综合医院' },
 emergencyCenter: { en: 'Emergency Center', ru: 'Центр экстренной помощи', kk: 'Шұғыл көмек орталығы', zh: '急救中心' },
 pediatricHospital: { en: 'Pediatric Hospital', ru: 'Детская больница', kk: 'Балалар ауруханасы', zh: '儿童医院' },

 // NotFound
 pageNotFound: { en: 'Oops! Page not found', ru: 'Упс! Страница не найдена', kk: 'Қате! Бет табылмады', zh: '哎呀！页面未找到' },
 returnHome: { en: 'Return to Home', ru: 'Вернуться на главную', kk: 'Басты бетке оралу', zh: '返回首页' },

 // Error messages
 errorSelectImage: { en: 'Please select an image file.', ru: 'Пожалуйста, выберите изображение.', kk: 'Сурет файлын таңдаңыз.', zh: '请选择图片文件。' },
 errorImageSize: { en: 'Image size must be less than 10MB.', ru: 'Размер изображения должен быть менее 10 МБ.', kk: 'Сурет өлшемі 10МБ-тан аз болуы керек.', zh: '图片大小不能超过10MB。' },
 errorUploadFirst: { en: 'Please upload an image first.', ru: 'Сначала загрузите изображение.', kk: 'Алдымен суретті жүктеңіз.', zh: '请先上传图片。' },
 errorAnalysisFailed: { en: 'Failed to analyze. Please try again.', ru: 'Не удалось проанализировать. Попробуйте снова.', kk: 'Талдау сәтсіз. Қайта көріңіз.', zh: '分析失败，请重试。' },
 errorEnterCondition: { en: 'Please enter a condition or disease.', ru: 'Введите заболевание или симптом.', kk: 'Ауруды енгізіңіз.', zh: '请输入疾病或症状。' },
 errorFindMedicines: { en: 'Failed to find medicines. Please try again.', ru: 'Не удалось найти лекарства. Попробуйте снова.', kk: 'Дәрілер табылмады. Қайта көріңіз.', zh: '查找药品失败，请重试。' },
 errorEnterSuggestion: { en: 'Please enter your suggestion', ru: 'Введите ваше предложение', kk: 'Ұсынысыңызды енгізіңіз', zh: '请输入您的建议' },
 errorSubmitFailed: { en: 'Failed to submit feedback. Please try again.', ru: 'Не удалось отправить отзыв. Попробуйте снова.', kk: 'Пікір жіберілмеді. Қайта көріңіз.', zh: '提交反馈失败，请重试。' },
 rateLimitError: { en: 'Rate limit exceeded. Please try again later.', ru: 'Превышен лимит запросов. Попробуйте позже.', kk: 'Сұраныс лимиті асып кетті. Кейінірек қайталаңыз.', zh: '请求频率超限，请稍后重试。' },
 serviceUnavailable: { en: 'Service temporarily unavailable. Please try again later.', ru: 'Сервис временно недоступен. Попробуйте позже.', kk: 'Қызмет уақытша қолжетімсіз. Кейінірек көріңіз.', zh: '服务暂时不可用，请稍后重试。' },

 // Feedback public list
 allSuggestions: { en: 'All Suggestions', ru: 'Все предложения', kk: 'Барлық ұсыныстар', zh: '所有建议' },
 allSuggestionsDesc: { en: 'Browse and like suggestions from the community', ru: 'Просматривайте и голосуйте за предложения сообщества', kk: 'Қауымдастық ұсыныстарын қараңыз және дауыс беріңіз', zh: '浏览社区建议并点赞' },
 anonymous: { en: 'Anonymous', ru: 'Аноним', kk: 'Анонім', zh: '匿名' },
 likes: { en: 'likes', ru: 'голосов', kk: 'дауыс', zh: '赞' },
 noSuggestionsYet: { en: 'No suggestions yet. Be the first!', ru: 'Пока нет предложений. Будьте первым!', kk: 'Әлі ұсыныстар жоқ. Бірінші болыңыз!', zh: '暂无建议，成为第一个！' },
 addSuggestion: { en: 'Add Suggestion', ru: 'Добавить предложение', kk: 'Ұсыныс қосу', zh: '添加建议' },
 viewAllSuggestions: { en: 'View All Suggestions', ru: 'Все предложения', kk: 'Барлық ұсыныстар', zh: '查看所有建议' },
 reply: { en: 'Reply', ru: 'Ответить', kk: 'Жауап беру', zh: '回复' },
 replyPlaceholder: { en: 'Write a reply...', ru: 'Напишите ответ...', kk: 'Жауап жазыңыз...', zh: '写下回复...' },
 creatorBadge: { en: 'Creator', ru: 'Создатель', kk: 'Жасаушы', zh: '创建者' },
 replies: { en: 'replies', ru: 'ответов', kk: 'жауап', zh: '回复' },
 showReplies: { en: 'Show replies', ru: 'Показать ответы', kk: 'Жауаптарды көрсету', zh: '显示回复' },
 hideReplies: { en: 'Hide replies', ru: 'Скрыть ответы', kk: 'Жауаптарды жасыру', zh: '隐藏回复' },

 // Auth
 login: { en: 'Sign In', ru: 'Войти', kk: 'Кіру', zh: '登录' },
 signup: { en: 'Sign Up', ru: 'Регистрация', kk: 'Тіркелу', zh: '注册' },
 password: { en: 'Password', ru: 'Пароль', kk: 'Құпия сөз', zh: '密码' },
 continueWithGoogle: { en: 'Continue with Google', ru: 'Продолжить через Google', kk: 'Google арқылы кіру', zh: '使用Google继续' },
 noAccount: { en: "Don't have an account?", ru: 'Нет аккаунта?', kk: 'Аккаунт жоқ па?', zh: '没有账户？' },
 hasAccount: { en: 'Already have an account?', ru: 'Уже есть аккаунт?', kk: 'Аккаунт бар ма?', zh: '已有账户？' },
 logout: { en: 'Sign Out', ru: 'Выйти', kk: 'Шығу', zh: '退出' },

 // About mission
 ourMission: { en: 'Our Mission', ru: 'Наша миссия', kk: 'Біздің миссия', zh: '我们的使命' },
 missionText: { en: 'We believe that access to reliable health information should be available to everyone. Our AI-powered platform bridges the gap between medical knowledge and everyday users, providing instant, accurate, and personalized health guidance in multiple languages.', ru: 'Мы верим, что доступ к надёжной медицинской информации должен быть у каждого. Наша платформа на базе ИИ сокращает разрыв между медицинскими знаниями и обычными пользователями, предоставляя мгновенные, точные и персонализированные рекомендации на нескольких языках.', kk: 'Біз сенімді денсаулық ақпаратына қол жеткізу барлығына қолжетімді болуы керек деп сенеміз. Біздің AI платформамыз медициналық білім мен күнделікті пайдаланушылар арасындағы алшақтықты жояды, бірнеше тілде лезде, дәл және жеке денсаулық кеңестерін ұсынады.', zh: '我们相信每个人都应该能够获得可靠的健康信息。我们的AI平台弥合了医学知识与普通用户之间的差距，以多种语言提供即时、准确和个性化的健康指导。' },
 problemWeResolve: { en: 'The Problem We Solve', ru: 'Проблема, которую мы решаем', kk: 'Біз шешетін мәселе', zh: '我们解决的问题' },
 problemText: { en: 'In Kazakhstan, many people face barriers to accessing quality healthcare information, language barriers, long waiting times, and limited access to specialists. MedAI+ provides 24/7 AI-powered medical guidance in Kazakh, Russian, and English, making healthcare knowledge accessible to everyone.', ru: 'В Казахстане многие сталкиваются с барьерами при получении качественной медицинской информации, языковые барьеры, долгое ожидание и ограниченный доступ к специалистам. MedAI+ предоставляет круглосуточные медицинские консультации на базе ИИ на казахском, русском и английском языках.', kk: 'Қазақстанда көптеген адамдар сапалы денсаулық сақтау ақпаратына қол жеткізуде кедергілерге тап болады, тіл кедергілері, ұзақ күту және мамандарға шектеулі қол жеткізу. MedAI+ қазақ, орыс және ағылшын тілдерінде тәулік бойы AI негізіндегі медициналық көмек ұсынады.', zh: '在哈萨克斯坦，许多人在获取优质医疗信息时面临障碍,,语言障碍、漫长的等待时间和有限的专家资源。MedAI+以哈萨克语、俄语和英语提供全天候AI医疗指导，让每个人都能获得医疗知识。' },

 // Health Dashboard
 healthScore: { en: 'Health Score', ru: 'Показатель здоровья', kk: 'Денсаулық көрсеткіші', zh: '健康评分' },
 riskScore: { en: 'Risk Score', ru: 'Показатель риска', kk: 'Тәуекел көрсеткіші', zh: '风险评分' },
 generalVerdict: { en: 'General Verdict', ru: 'Общее заключение', kk: 'Жалпы үкім', zh: '总体结论' },
 shortTermMeasures: { en: 'Short-term Measures', ru: 'Краткосрочные меры', kk: 'Қысқа мерзімді шаралар', zh: '短期措施' },
 longTermMeasures: { en: 'Long-term Measures', ru: 'Долгосрочные меры', kk: 'Ұзақ мерзімді шаралар', zh: '长期措施' },
 healthy: { en: 'Healthy', ru: 'Здоров', kk: 'Сау', zh: '健康' },
 critical: { en: 'Critical', ru: 'Критично', kk: 'Сыни', zh: '危急' },
 lowRisk: { en: 'Low Risk', ru: 'Низкий риск', kk: 'Төмен тәуекел', zh: '低风险' },
 highRisk: { en: 'High Risk', ru: 'Высокий риск', kk: 'Жоғары тәуекел', zh: '高风险' },

 // Lifestyle Questions
 lifestyleQuestions: { en: 'Lifestyle & Nutrition', ru: 'Образ жизни и питание', kk: 'Өмір салты және тамақтану', zh: '生活方式与营养' },
 dietQuestion: { en: 'How would you describe your diet?', ru: 'Как бы вы описали своё питание?', kk: 'Тамақтануыңызды қалай сипаттар едіңіз?', zh: '您如何描述自己的饮食？' },
 dietPlaceholder: { en: 'e.g., I eat mostly fast food, skip breakfast, drink little water...', ru: 'например: в основном фастфуд, пропускаю завтрак, пью мало воды...', kk: 'мысалы, Негізінен фастфуд жеймін, таңғы асты жібереді, аз су ішемін...', zh: '例如：主要吃快餐，不吃早餐，喝水少...' },
 exerciseQuestion: { en: 'How active are you physically?', ru: 'Насколько вы физически активны?', kk: 'Физикалық белсенділігіңіз қандай?', zh: '您的身体活动量如何？' },
 exercisePlaceholder: { en: 'e.g., Sedentary work, walk 30 min daily, gym 3x/week...', ru: 'например: сидячая работа, хожу 30 мин в день, спортзал 3 раза/нед...', kk: 'мысалы, Отырып жұмыс, күніне 30 мин жаяу, спорт залы аптасына 3 рет...', zh: '例如：久坐办公，每天步行30分钟，每周健身3次...' },
 sleepQuestion: { en: 'How is your sleep quality?', ru: 'Как у вас качество сна?', kk: 'Ұйқы сапасыңыз қандай?', zh: '您的睡眠质量如何？' },
 sleepPlaceholder: { en: 'e.g., I sleep 5-6 hours, wake up often, feel tired in the morning...', ru: 'например: сплю 5-6 часов, часто просыпаюсь, утром чувствую усталость...', kk: 'мысалы, 5-6 сағат ұйықтаймын, жиі оянамын, таңертең шаршаймын...', zh: '例如：睡5-6小时，经常醒来，早上感觉疲倦...' },

 // 2GIS
 clickForDirections2gis: { en: 'Click on any location to open it in 2GIS', ru: 'Нажмите на любую локацию для открытия в 2ГИС', kk: '2ГИС-те ашу үшін кез келген орынды басыңыз', zh: '点击任意位置在2GIS中打开' },
 openIn2gis: { en: 'Open in 2GIS', ru: 'Открыть в 2ГИС', kk: '2ГИС-те ашу', zh: '在2GIS中打开' },
 day: { en: 'Day', ru: 'День', kk: 'Күн', zh: '天' },
 projectedHealth: { en: 'Projected Health', ru: 'Прогноз здоровья', kk: 'Денсаулық болжамы', zh: '预期健康状况' },
 actualHealth: { en: 'Actual Health', ru: 'Фактическое здоровье', kk: 'Нақты денсаулық', zh: '实际健康状况' },
 healthProgressChart: { en: 'Health Progress Chart', ru: 'График динамики здоровья', kk: 'Денсаулық прогресі графигі', zh: '健康进展图表' },
 healthChartDesc: { en: 'Green dashed line = projected improvement. Blue line = your actual scores.', ru: 'Зелёная пунктирная линия = прогноз. Синяя линия = ваши результаты.', kk: 'Жасыл пунктир = болжам. Көк = нақты нәтижелер.', zh: '绿色虚线 = 预期改善。蓝色实线 = 实际分数。' },
 reanalyzeReminder: { en: 'Repeat this analysis in 1-2 days to track progress.', ru: 'Повторите анализ через 1-2 дня для отслеживания прогресса.', kk: '1-2 күнде талдауды қайталаңыз.', zh: '1-2天后重复分析以跟踪进展。' },
 mild: { en: 'Mild', ru: 'Лёгкая', kk: 'Жеңіл', zh: '轻度' },
 moderate: { en: 'Moderate', ru: 'Умеренная', kk: 'Орташа', zh: '中度' },
 severe: { en: 'Severe', ru: 'Тяжёлая', kk: 'Ауыр', zh: '重度' },
 today: { en: 'Today', ru: 'Сегодня', kk: 'Бүгін', zh: '今天' },
 fewDays: { en: '2-3 days', ru: '2-3 дня', kk: '2-3 күн', zh: '2-3天' },
 oneWeek: { en: '1 week', ru: '1 неделя', kk: '1 апта', zh: '1周' },
 twoWeeksPlus: { en: '2+ weeks', ru: '2+ недели', kk: '2+ апта', zh: '2周以上' },
 monthPlus: { en: '1+ month', ru: '1+ месяц', kk: '1+ ай', zh: '1个月以上' },
 symptomSeverity: { en: 'Symptom Severity', ru: 'Тяжесть симптомов', kk: 'Белгілер ауырлығы', zh: '症状严重程度' },
 symptomDuration: { en: 'Duration', ru: 'Длительность', kk: 'Ұзақтығы', zh: '持续时间' },
 bodyTemperature: { en: 'Body Temperature (°C)', ru: 'Температура тела (°C)', kk: 'Дене температурасы (°C)', zh: '体温（°C）' },
 recentTravel: { en: 'Recent Travel', ru: 'Недавние поездки', kk: 'Жақында жасалған сапарлар', zh: '近期旅行' },
 recentTravelPlaceholder: { en: 'e.g., South Asia, 2 weeks ago', ru: 'например: Юго-Восточная Азия, 2 недели назад', kk: 'мысалы, Оңтүстік Азия, 2 апта бұрын', zh: '例如：东南亚，2周前' },
 waterIntake: { en: 'Daily Water Intake', ru: 'Ежедневное потребление воды', kk: 'Күнделікті су тұтыну', zh: '每日饮水量' },
 waterIntakePlaceholder: { en: 'e.g., 1.5 liters/day', ru: 'например: 1.5 литра в день', kk: 'мысалы, 1.5 литр/күн', zh: '例如：每天1.5升' },
 stressLevel: { en: 'Stress Level', ru: 'Уровень стресса', kk: 'Стресс деңгейі', zh: '压力水平' },
 diagnosticDetails: { en: 'Diagnostic Details', ru: 'Диагностические данные', kk: 'Диагностикалық мәліметтер', zh: '诊断详情' },
 low: { en: 'Low', ru: 'Низкий', kk: 'Төмен', zh: '低' },
 high: { en: 'High', ru: 'Высокий', kk: 'Жоғары', zh: '高' },

 // Rash diagnostic questions
 rashDiagnosticQuestions: { en: 'Rash Diagnostic Questions', ru: 'Диагностические вопросы о сыпи', kk: 'Бөртпе диагностикалық сұрақтары', zh: '皮疹诊断问题' },
 rashDuration: { en: 'How long have you had this rash?', ru: 'Как давно у вас эта сыпь?', kk: 'Бұл бөртпе қашаннан бар?', zh: '皮疹出现多长时间了？' },
 rashItching: { en: 'Is there itching?', ru: 'Есть ли зуд?', kk: 'Қышыну бар ма?', zh: '是否有瘙痒？' },
 noItching: { en: 'No itching', ru: 'Нет зуда', kk: 'Қышыну жоқ', zh: '无瘙痒' },
 mildItching: { en: 'Mild', ru: 'Лёгкий', kk: 'Жеңіл', zh: '轻微' },
 severeItching: { en: 'Severe', ru: 'Сильный', kk: 'Қатты', zh: '严重' },
 rashBodyLocation: { en: 'Where on the body?', ru: 'В какой части тела?', kk: 'Дененің қай жерінде?', zh: '身体哪个部位？' },
 rashLocationPlaceholder: { en: 'e.g., arms, face, back...', ru: 'например: руки, лицо, спина...', kk: 'мысалы, қолдар, бет, арқа...', zh: '例如：手臂、面部、背部...' },
 rashSpreading: { en: 'Is it spreading?', ru: 'Распространяется ли сыпь?', kk: 'Таралуда ма?', zh: '是否在扩散？' },
 notSpreading: { en: 'No', ru: 'Нет', kk: 'Жоқ', zh: '否' },
 slowlySpreading: { en: 'Slowly', ru: 'Медленно', kk: 'Баяу', zh: '缓慢扩散' },
 rapidlySpreading: { en: 'Rapidly', ru: 'Быстро', kk: 'Жылдам', zh: '快速扩散' },
 rashAllergenContact: { en: 'Recent contact with allergens?', ru: 'Недавний контакт с аллергенами?', kk: 'Жақында аллергендермен байланыс болды ма?', zh: '最近是否接触过过敏原？' },
 rashAllergenPlaceholder: { en: 'e.g., new soap, food, plants...', ru: 'например: новое мыло, еда, растения...', kk: 'мысалы, жаңа сабын, тамақ, өсімдіктер...', zh: '例如：新肥皂、食物、植物...' },
 rashPainLevel: { en: 'Pain level?', ru: 'Уровень боли?', kk: 'Ауырсыну деңгейі?', zh: '疼痛程度？' },
 noPain: { en: 'No pain', ru: 'Без боли', kk: 'Ауырсынусыз', zh: '无疼痛' },
 mildPain: { en: 'Mild', ru: 'Лёгкая', kk: 'Жеңіл', zh: '轻微' },
 severePain: { en: 'Severe', ru: 'Сильная', kk: 'Қатты', zh: '剧烈' },

 // Prescription scanner
 prescriptionScanner: { en: 'Prescription Scanner', ru: 'Сканер рецептов', kk: 'Рецепт сканері', zh: '处方扫描' },
 scanPrescription: { en: 'Scan Prescription', ru: 'Сканировать рецепт', kk: 'Рецептті сканерлеу', zh: '扫描处方' },
 scanPrescriptionDesc: { en: 'Upload a photo of your prescription to identify medicines, prices, and alternatives', ru: 'Загрузите фото рецепта для определения лекарств, цен и альтернатив', kk: 'Дәрілерді, бағаларды және баламаларды анықтау үшін рецепт суретін жүктеңіз', zh: '上传处方照片以识别药品、价格和替代品' },
 uploadPrescription: { en: 'Upload Prescription Photo', ru: 'Загрузить фото рецепта', kk: 'Рецепт суретін жүктеу', zh: '上传处方照片' },
 analyzingPrescription: { en: 'Analyzing prescription...', ru: 'Анализ рецепта...', kk: 'Рецепт талдануда...', zh: '正在分析处方...' },
 prescriptionResults: { en: 'Prescription Analysis', ru: 'Анализ рецепта', kk: 'Рецепт талдауы', zh: '处方分析' },
 doctorNotes: { en: 'Doctor Notes', ru: 'Заметки врача', kk: 'Дәрігер жазбалары', zh: '医生备注' },
 alternatives: { en: 'Cheaper Alternatives', ru: 'Более доступные аналоги', kk: 'Арзанырақ баламалар', zh: '更便宜的替代品' },
 whereToBuy: { en: 'Where to Buy', ru: 'Где купить', kk: 'Қайдан сатып алуға болады', zh: '哪里购买' },
 showPrescriptionScanner: { en: 'Scan Prescription', ru: 'Сканер рецептов', kk: 'Рецепт сканері', zh: '扫描处方' },

 // Usage limits
 remainingUses: { en: 'Remaining uses', ru: 'Осталось использований', kk: 'Қалған пайдалану', zh: '剩余使用次数' },
 unlimitedAccess: { en: 'Unlimited access', ru: 'Безлимитный доступ', kk: 'Шексіз қолжетімділік', zh: '无限使用' },
 getPremium: { en: 'Get Premium', ru: 'Получить Premium', kk: 'Premium алу', zh: '获取Premium' },
 usageLimitReached: { en: 'Daily limit reached. Upgrade to Premium for unlimited access.', ru: 'Дневной лимит исчерпан. Перейдите на Premium для безлимитного доступа.', kk: 'Күнделікті лимит бітті. Шексіз қолжетімділік үшін Premium алыңыз.', zh: '已达每日上限。升级Premium享受无限使用。' },
 perMonth: { en: '/month', ru: '/мес', kk: '/ай', zh: '/月' },
 per6Months: { en: '/6 months', ru: '/6 мес', kk: '/6 ай', zh: '/6个月' },
 perYear: { en: '/year', ru: '/год', kk: '/жыл', zh: '/年' },
 dayUnit: { en: 'day', ru: 'день', kk: 'күн', zh: '天' },
 save17: { en: 'Save ~17%', ru: 'Скидка ~17%', kk: '~17% жеңілдік', zh: '节省~17%' },
 plan_monthly: { en: '1 Month', ru: '1 Месяц', kk: '1 Ай', zh: '1个月' },
 plan_semiannual: { en: '6 Months', ru: '6 Месяцев', kk: '6 Ай', zh: '6个月' },
 plan_annual: { en: '1 Year', ru: '1 Год', kk: '1 Жыл', zh: '1年' },
 sharing: { en: 'Sharing', ru: 'Совместный доступ', kk: 'Бөлісу', zh: '共享' },

 // Premium page
 premiumTitle: { en: 'Unlock Full Power', ru: 'Раскройте полный потенциал', kk: 'Толық қуатты ашыңыз', zh: '解锁全部功能' },
 premiumDesc: { en: 'Get unlimited access to all AI features with our most powerful models', ru: 'Получите безлимитный доступ ко всем ИИ-функциям с самыми мощными моделями', kk: 'Ең қуатты модельдермен барлық AI мүмкіндіктеріне шексіз қолжетімділік алыңыз', zh: '使用最强大的模型，无限访问所有AI功能' },
 premiumFeature1: { en: 'Unlimited symptom analysis, AI doctor, & image analysis', ru: 'Безлимитный анализ симптомов, ИИ-доктор и анализ изображений', kk: 'Шексіз белгілер талдауы, AI дәрігер және сурет талдау', zh: '无限症状分析、AI医生和图像分析' },
 premiumFeature2: { en: 'Most powerful AI model for deeper, more accurate analysis', ru: 'Самая мощная модель ИИ для глубокого и точного анализа', kk: 'Терең және дәл талдау үшін ең қуатты AI моделі', zh: '最强大的AI模型，更深入、更准确的分析' },
 premiumFeature3: { en: 'Immunity improvement and preventive health tips', ru: 'Советы по укреплению иммунитета и профилактике заболеваний', kk: 'Иммунитетті жақсарту және алдын алу кеңестері', zh: '免疫力提升和预防健康建议' },
 premiumFeature4: { en: 'Priority processing and faster results', ru: 'Приоритетная обработка и ускоренные результаты', kk: 'Басым өңдеу және жылдам нәтижелер', zh: '优先处理和更快的结果' },
 premiumFeature5: { en: 'Full usage history with detailed reports', ru: 'Полная история использования с детальными отчётами', kk: 'Толық пайдалану тарихы мен есептер', zh: '完整使用历史和详细报告' },
 premiumFeature6: { en: 'Share subscription with 1 person', ru: 'Делитесь подпиской с 1 человеком', kk: 'Жазылымды 1 адаммен бөлісіңіз', zh: '与1人共享订阅' },
 purchasePremium: { en: 'Purchase Premium', ru: 'Купить Premium', kk: 'Premium сатып алу', zh: '购买Premium' },
 loginToPurchase: { en: 'Sign in to purchase', ru: 'Войдите для покупки', kk: 'Сатып алу үшін кіріңіз', zh: '登录后购买' },
 securePayment: { en: 'Secure & anonymous payment', ru: 'Безопасный и анонимный платёж', kk: 'Қауіпсіз және анонимді төлем', zh: '安全匿名支付' },
 premiumComingSoon: { en: 'Coming soon!', ru: 'Скоро!', kk: 'Жақында!', zh: '即将推出！' },
 premiumComingSoonDesc: { en: 'Payment integration is being set up. Check back soon!', ru: 'Интеграция оплаты настраивается. Заходите позже!', kk: 'Төлем интеграциясы орнатылуда. Кейінірек тексеріңіз!', zh: '支付集成正在设置中，请稍后再来！' },
 premiumActivated: { en: 'Premium activated!', ru: 'Premium активирован!', kk: 'Premium іске қосылды!', zh: 'Premium已激活！' },
 premiumActivatedDesc: { en: 'You now have unlimited access to all features.', ru: 'Теперь у вас безлимитный доступ ко всем функциям.', kk: 'Енді сізде барлық мүмкіндіктерге шексіз қол жетімділік бар.', zh: '您现在可以无限使用所有功能。' },
 premiumActive: { en: 'Premium Active', ru: 'Premium активен', kk: 'Premium белсенді', zh: 'Premium已激活' },
 manageSubscription: { en: 'Manage Subscription', ru: 'Управление подпиской', kk: 'Жазылымды басқару', zh: '管理订阅' },
 freeVsPremium: { en: 'Free vs Premium', ru: 'Бесплатно vs Premium', kk: 'Тегін vs Premium', zh: '免费版 vs Premium' },
 feature: { en: 'Feature', ru: 'Функция', kk: 'Мүмкіндік', zh: '功能' },
 aiModel: { en: 'AI Model', ru: 'Модель ИИ', kk: 'AI Моделі', zh: 'AI模型' },

 // Medical sources
 medicalSources: { en: 'Medical Sources', ru: 'Медицинские источники', kk: 'Медициналық дереккөздер', zh: '医学来源' },
 viewSource: { en: 'View source', ru: 'Источник', kk: 'Дерек көзі', zh: '查看来源' },

 // Profile page
 totalActions: { en: 'Total Uses', ru: 'Всего использований', kk: 'Барлық пайдалану', zh: '总使用次数' },
 usageHistory: { en: 'Usage History', ru: 'История использования', kk: 'Пайдалану тарихы', zh: '使用历史' },
 noHistoryYet: { en: 'No history yet. Start using features!', ru: 'Истории пока нет. Начните пользоваться!', kk: 'Тарих жоқ. Мүмкіндіктерді пайдалана бастаңыз!', zh: '暂无历史记录。开始使用功能吧！' },
 dataSecurityTitle: { en: 'Your Data is Secure', ru: 'Ваши данные защищены', kk: 'Деректеріңіз қауіпсіз', zh: '您的数据是安全的' },
 dataSecurityDesc: { en: 'Your medical profile is stored locally. API keys and payment data are encrypted and never exposed.', ru: 'Ваш медицинский профиль хранится локально. API-ключи и платёжные данные зашифрованы и никогда не передаются третьим лицам.', kk: 'Медициналық профиліңіз жергілікті түрде сақталады. API кілттері мен төлем деректері шифрланған.', zh: '您的医疗档案存储在本地。API密钥和支付数据已加密，不会泄露。' },

 // Legal pages
 privacyPolicy: { en: 'Privacy Policy', ru: 'Политика конфиденциальности', kk: 'Құпиялылық саясаты', zh: '隐私政策' },
 termsOfUse: { en: 'Terms of Use', ru: 'Условия использования', kk: 'Пайдалану шарттары', zh: '使用条款' },
 legalLinks: { en: 'Legal', ru: 'Правовая информация', kk: 'Құқықтық ақпарат', zh: '法律信息' },

 // Cookie banner
 cookieTitle: { en: 'We use cookies', ru: 'Мы используем cookies', kk: 'Біз cookie файлдарын қолданамыз', zh: '我们使用Cookie' },
 cookieDesc: { en: 'We use cookies to improve your experience and analyze site usage. By continuing, you agree to our Privacy Policy.', ru: 'Мы используем cookies для улучшения вашего опыта и анализа посещаемости сайта. Продолжая, вы соглашаетесь с нашей Политикой конфиденциальности.', kk: 'Тәжірибеңізді жақсарту және сайт пайдалануын талдау үшін cookie файлдарын қолданамыз. Жалғастыру арқылы Құпиялылық саясатымызбен келісесіз.', zh: '我们使用Cookie来改善您的体验并分析网站使用情况。继续使用即表示您同意我们的隐私政策。' },
 cookieAccept: { en: 'Accept All', ru: 'Принять все', kk: 'Барлығын қабылдау', zh: '接受全部' },
 cookieDecline: { en: 'Decline', ru: 'Отклонить', kk: 'Бас тарту', zh: '拒绝' },

 // 404 page
 notFoundTitle: { en: 'Page Not Found', ru: 'Страница не найдена', kk: 'Бет табылмады', zh: '页面未找到' },
 notFoundDesc: { en: "The page you're looking for doesn't exist or has been moved.", ru: 'Страница, которую вы ищете, не существует или была перемещена.', kk: 'Іздеген бетіңіз жоқ немесе жылжытылған.', zh: '您查找的页面不存在或已被移动。' },
 goBack: { en: 'Go Back', ru: 'Назад', kk: 'Артқа', zh: '返回' },
};

// Language names for system prompts
export const languageNames: Record<Language, string> = {
 en: 'English',
 ru: 'Russian',
 kk: 'Kazakh',
 zh: 'Chinese',
};

interface LanguageContextType {
 language: Language;
 setLanguage: (lang: Language) => void;
 t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
 const [language, setLanguage] = useState<Language>(() => {
 const saved = localStorage.getItem('medai-language');
 return (saved as Language) || 'en';
 });

 useEffect(() => {
 localStorage.setItem('medai-language', language);
 }, [language]);

 const t = (key: string): string => {
 const translation = translations[key];
 if (!translation) return key;
 return translation[language] || translation.en || key;
 };

 return (
 <LanguageContext.Provider value={{ language, setLanguage, t }}>
 {children}
 </LanguageContext.Provider>
 );
}

export function useLanguage() {
 const context = useContext(LanguageContext);
 if (!context) {
 throw new Error('useLanguage must be used within a LanguageProvider');
 }
 return context;
}
