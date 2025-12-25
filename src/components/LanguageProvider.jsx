import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation & Common
    home: "Home",
    back: "Back",
    loading: "Loading",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    confirm: "Confirm",
    close: "Close",
    
    // Home Page
    rank: "Rank",
    streak: "Streak",
    habits: "Habits",
    today: "Today",
    dashboard: "Dashboard",
    yourDailyControlCenter: "Your daily control center",
    actionRequired: "ACTION REQUIRED",
    yesterdayUnvalidated: "Yesterday unvalidated",
    todo: "To-Do",
    schedule: "Schedule",
    screenTime: "Screen Time",
    ceoMode: "CEO Mode",
    maximumFocus: "Maximum Focus",
    
    // Menu
    sixMonthReport: "6-Month Report",
    yourProgressOverview: "Your progress overview",
    activeApps: "Active Apps",
    settingsAndLegal: "Settings & Legal",
    privacyPolicy: "Privacy Policy",
    termsAndConditions: "Terms & conditions",
    logout: "Logout",
    
    // Dashboard
    controlCenter: "Control Center",
    todaysFocus: "Today's Focus",
    weekScore: "WEEK SCORE",
    percent: "Percent",
    target: "Target",
    complete: "Complete",
    youMayExit: "You may exit",
    remaining: "Remaining",
    locked: "LOCKED",
    cannotExitEarly: "Cannot exit early",
    
    // Habits
    habit: "Habit",
    goal: "Goal",
    newHabit: "New Habit",
    addHabit: "Add Habit",
    habitName: "Habit Name",
    description: "Description",
    dailyHabit: "Daily habit",
    selectDays: "Select Days",
    objectives: "Objectives",
    weekContract: "WEEK CONTRACT",
    rewardIfSuccessful: "Reward if successful",
    sanctionIfFail: "Sanction if you fail",
    threshold: "Threshold",
    commitContract: "Commit Contract",
    committing: "Committing...",
    reward: "Reward",
    sanction: "Sanction",
    lockedUntilNextWeek: "Locked until next week",
    swipeRightForGoals: "Swipe right for Goals & Contract →",
    swipeLeftForHabits: "← Swipe left for Habits Grid",
    
    // Pareto / To-Do
    twentyEightyRule: "20% that drives 80%",
    doThisNow: "DO THIS NOW",
    addTask: "Add Task",
    newTask: "New Task",
    whatNeedsToBeDone: "What needs to be done?",
    addDetails: "Add details...",
    priority: "Priority",
    crucial: "Crucial",
    essential: "Essential",
    average: "Average",
    low: "Low",
    otherTasks: "Other Tasks",
    noPrioritiesSet: "No priorities set",
    focusOnWhatMatters: "Focus on what truly matters",
    addFirstTask: "Add First Task",
    
    // Calendar
    new: "New",
    eventTitle: "Event title",
    eventDetails: "Event details",
    date: "Date",
    time: "Time",
    duration: "Duration",
    minutes: "minutes",
    createEvent: "Create Event",
    
    // Screen Time
    focusMode: "Focus Mode",
    deepWorkEnvironment: "Deep work environment",
    startSession: "Start Session",
    todayUsage: "Today's Usage",
    avgUsage: "7-Day Average",
    winStreak: "Win Streak",
    blockApps: "Block Apps",
    blockWebsites: "Block Websites",
    viewLeaderboard: "View Leaderboard",
    addBlockedApp: "Add Blocked App",
    addBlockedWebsite: "Add Blocked Website",
    
    // CEO Mode
    duration: "Duration",
    approvedApps: "Approved Apps",
    onceActivated: "Once activated, exit is impossible until timer expires.",
    activate: "ACTIVATE",
    activating: "ACTIVATING...",
    exit: "EXIT",
    available: "Available",
    phone: "Phone",
    messages: "Messages",
    calendar: "Calendar",
    
    // Days of week
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
    
    // Settings & Legal
    settings: "Settings",
    language: "Language",
    selectLanguage: "Select Language",
    permissions: "Permissions",
    termsOfUse: "Terms of Use",
    dataDeletion: "Data Deletion",
    contact: "Contact",
    
    // Time durations
    lessThan30min: "<30min",
    oneHour: "1 hour",
    twoHours: "2 hours",
    halfDay: "Half day",
    oneDay: "1 day",
    multiDay: "Multi-day",

    // Pareto/Priority
    nothingScheduled: "Not scheduled",

    // CEO Mode
    onceActivatedCannotExit: "Once activated, exit is impossible until timer expires.",

    // Biannual Report
    monthReport: "6-Month Report",
    viewProgress: "View your progress",

    // Leaderboard
    leaderboard: "Leaderboard",
    global: "Global",
    friends: "Friends",
    addFriends: "Add Friends",

    // Week days full
    mondayFull: "Monday",
    tuesdayFull: "Tuesday",
    wednesdayFull: "Wednesday",
    thursdayFull: "Thursday",
    fridayFull: "Friday",
    saturdayFull: "Saturday",
    sundayFull: "Sunday",
    },
  
  fr: {
    // Navigation & Common
    home: "Accueil",
    back: "Retour",
    loading: "Chargement",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    confirm: "Confirmer",
    close: "Fermer",
    
    // Home Page
    rank: "Rang",
    streak: "Série",
    habits: "Habitudes",
    today: "Aujourd'hui",
    dashboard: "Tableau de bord",
    yourDailyControlCenter: "Votre centre de contrôle quotidien",
    actionRequired: "ACTION REQUISE",
    yesterdayUnvalidated: "Hier non validé",
    todo: "Tâches",
    schedule: "Emploi du temps",
    screenTime: "Temps d'écran",
    ceoMode: "Mode PDG",
    maximumFocus: "Concentration maximale",
    
    // Menu
    sixMonthReport: "Rapport semestriel",
    yourProgressOverview: "Aperçu de vos progrès",
    activeApps: "Applications actives",
    settingsAndLegal: "Paramètres et mentions légales",
    privacyPolicy: "Politique de confidentialité",
    termsAndConditions: "Conditions générales",
    logout: "Déconnexion",
    
    // Dashboard
    controlCenter: "Centre de contrôle",
    todaysFocus: "Focus du jour",
    weekScore: "SCORE HEBDOMADAIRE",
    percent: "Pourcent",
    target: "Objectif",
    complete: "Terminé",
    youMayExit: "Vous pouvez quitter",
    remaining: "Restant",
    locked: "VERROUILLÉ",
    cannotExitEarly: "Impossible de quitter avant la fin",
    
    // Habits
    habit: "Habitude",
    goal: "Objectif",
    newHabit: "Nouvelle habitude",
    addHabit: "Ajouter une habitude",
    habitName: "Nom de l'habitude",
    description: "Description",
    dailyHabit: "Habitude quotidienne",
    selectDays: "Sélectionner les jours",
    objectives: "Objectifs",
    weekContract: "CONTRAT HEBDOMADAIRE",
    rewardIfSuccessful: "Récompense en cas de succès",
    sanctionIfFail: "Sanction en cas d'échec",
    threshold: "Seuil",
    commitContract: "Valider le contrat",
    committing: "Validation...",
    reward: "Récompense",
    sanction: "Sanction",
    lockedUntilNextWeek: "Verrouillé jusqu'à la semaine prochaine",
    swipeRightForGoals: "Glissez à droite pour Objectifs et Contrat →",
    swipeLeftForHabits: "← Glissez à gauche pour Grille d'habitudes",
    
    // Pareto / To-Do
    twentyEightyRule: "20% qui génère 80%",
    doThisNow: "À FAIRE MAINTENANT",
    addTask: "Ajouter une tâche",
    newTask: "Nouvelle tâche",
    whatNeedsToBeDone: "Qu'est-ce qui doit être fait ?",
    addDetails: "Ajouter des détails...",
    priority: "Priorité",
    crucial: "Crucial",
    essential: "Essentiel",
    average: "Moyen",
    low: "Faible",
    otherTasks: "Autres tâches",
    noPrioritiesSet: "Aucune priorité définie",
    focusOnWhatMatters: "Concentrez-vous sur l'essentiel",
    addFirstTask: "Ajouter la première tâche",
    
    // Calendar
    new: "Nouveau",
    eventTitle: "Titre de l'événement",
    eventDetails: "Détails de l'événement",
    date: "Date",
    time: "Heure",
    duration: "Durée",
    minutes: "minutes",
    createEvent: "Créer un événement",
    
    // Screen Time
    focusMode: "Mode Focus",
    deepWorkEnvironment: "Environnement de travail profond",
    startSession: "Démarrer une session",
    todayUsage: "Utilisation aujourd'hui",
    avgUsage: "Moyenne sur 7 jours",
    winStreak: "Série de victoires",
    blockApps: "Bloquer des applications",
    blockWebsites: "Bloquer des sites web",
    viewLeaderboard: "Voir le classement",
    addBlockedApp: "Ajouter une application bloquée",
    addBlockedWebsite: "Ajouter un site web bloqué",
    
    // CEO Mode
    duration: "Durée",
    approvedApps: "Applications autorisées",
    onceActivated: "Une fois activé, la sortie est impossible jusqu'à l'expiration du minuteur.",
    activate: "ACTIVER",
    activating: "ACTIVATION...",
    exit: "SORTIR",
    available: "Disponible",
    phone: "Téléphone",
    messages: "Messages",
    calendar: "Calendrier",
    
    // Days of week
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Jeu",
    friday: "Ven",
    saturday: "Sam",
    sunday: "Dim",
    
    // Settings & Legal
    settings: "Paramètres",
    language: "Langue",
    selectLanguage: "Sélectionner la langue",
    permissions: "Autorisations",
    termsOfUse: "Conditions d'utilisation",
    dataDeletion: "Suppression des données",
    contact: "Contact",
    
    // Time durations
    lessThan30min: "<30min",
    oneHour: "1 heure",
    twoHours: "2 heures",
    halfDay: "Demi-journée",
    oneDay: "1 jour",
    multiDay: "Plusieurs jours",

    // Pareto/Priority
    nothingScheduled: "Non programmé",

    // CEO Mode
    onceActivatedCannotExit: "Une fois activé, la sortie est impossible jusqu'à l'expiration du minuteur.",

    // Biannual Report
    monthReport: "Rapport semestriel",
    viewProgress: "Voir votre progression",

    // Leaderboard
    leaderboard: "Classement",
    global: "Global",
    friends: "Amis",
    addFriends: "Ajouter des amis",

    // Week days full
    mondayFull: "Lundi",
    tuesdayFull: "Mardi",
    wednesdayFull: "Mercredi",
    thursdayFull: "Jeudi",
    fridayFull: "Vendredi",
    saturdayFull: "Samedi",
    sundayFull: "Dimanche",
    },
  
  zh: {
    // Navigation & Common
    home: "主页",
    back: "返回",
    loading: "加载中",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    confirm: "确认",
    close: "关闭",
    
    // Home Page
    rank: "等级",
    streak: "连续",
    habits: "习惯",
    today: "今天",
    dashboard: "仪表板",
    yourDailyControlCenter: "您的每日控制中心",
    actionRequired: "需要操作",
    yesterdayUnvalidated: "昨天未验证",
    todo: "待办事项",
    schedule: "日程",
    screenTime: "屏幕时间",
    ceoMode: "CEO模式",
    maximumFocus: "最大专注",
    
    // Menu
    sixMonthReport: "六个月报告",
    yourProgressOverview: "您的进度概览",
    activeApps: "活动应用",
    settingsAndLegal: "设置和法律",
    privacyPolicy: "隐私政策",
    termsAndConditions: "条款和条件",
    logout: "登出",
    
    // Dashboard
    controlCenter: "控制中心",
    todaysFocus: "今日焦点",
    weekScore: "周分数",
    percent: "百分比",
    target: "目标",
    complete: "完成",
    youMayExit: "您可以退出",
    remaining: "剩余",
    locked: "锁定",
    cannotExitEarly: "无法提前退出",
    
    // Habits
    habit: "习惯",
    goal: "目标",
    newHabit: "新习惯",
    addHabit: "添加习惯",
    habitName: "习惯名称",
    description: "描述",
    dailyHabit: "每日习惯",
    selectDays: "选择日期",
    objectives: "目标",
    weekContract: "周合约",
    rewardIfSuccessful: "成功的奖励",
    sanctionIfFail: "失败的惩罚",
    threshold: "阈值",
    commitContract: "提交合约",
    committing: "提交中...",
    reward: "奖励",
    sanction: "惩罚",
    lockedUntilNextWeek: "锁定至下周",
    swipeRightForGoals: "向右滑动查看目标和合约 →",
    swipeLeftForHabits: "← 向左滑动查看习惯网格",
    
    // Pareto / To-Do
    twentyEightyRule: "驱动80%的20%",
    doThisNow: "现在执行",
    addTask: "添加任务",
    newTask: "新任务",
    whatNeedsToBeDone: "需要做什么？",
    addDetails: "添加详情...",
    priority: "优先级",
    crucial: "关键",
    essential: "重要",
    average: "普通",
    low: "较低",
    otherTasks: "其他任务",
    noPrioritiesSet: "未设置优先级",
    focusOnWhatMatters: "专注于重要的事情",
    addFirstTask: "添加第一个任务",
    
    // Calendar
    new: "新建",
    eventTitle: "事件标题",
    eventDetails: "事件详情",
    date: "日期",
    time: "时间",
    duration: "持续时间",
    minutes: "分钟",
    createEvent: "创建事件",
    
    // Screen Time
    focusMode: "专注模式",
    deepWorkEnvironment: "深度工作环境",
    startSession: "开始会话",
    todayUsage: "今日使用",
    avgUsage: "7天平均",
    winStreak: "连胜",
    blockApps: "阻止应用",
    blockWebsites: "阻止网站",
    viewLeaderboard: "查看排行榜",
    addBlockedApp: "添加被阻止的应用",
    addBlockedWebsite: "添加被阻止的网站",
    
    // CEO Mode
    duration: "持续时间",
    approvedApps: "批准的应用",
    onceActivated: "一旦激活，在计时器到期之前无法退出。",
    activate: "激活",
    activating: "激活中...",
    exit: "退出",
    available: "可用",
    phone: "电话",
    messages: "消息",
    calendar: "日历",
    
    // Days of week
    monday: "周一",
    tuesday: "周二",
    wednesday: "周三",
    thursday: "周四",
    friday: "周五",
    saturday: "周六",
    sunday: "周日",
    
    // Settings & Legal
    settings: "设置",
    language: "语言",
    selectLanguage: "选择语言",
    permissions: "权限",
    termsOfUse: "使用条款",
    dataDeletion: "数据删除",
    contact: "联系",
    
    // Time durations
    lessThan30min: "<30分钟",
    oneHour: "1小时",
    twoHours: "2小时",
    halfDay: "半天",
    oneDay: "1天",
    multiDay: "多天",

    // Pareto/Priority
    nothingScheduled: "未安排",

    // CEO Mode
    onceActivatedCannotExit: "一旦激活，在计时器到期之前无法退出。",

    // Biannual Report
    monthReport: "六个月报告",
    viewProgress: "查看您的进度",

    // Leaderboard
    leaderboard: "排行榜",
    global: "全球",
    friends: "朋友",
    addFriends: "添加朋友",

    // Week days full
    mondayFull: "星期一",
    tuesdayFull: "星期二",
    wednesdayFull: "星期三",
    thursdayFull: "星期四",
    fridayFull: "星期五",
    saturdayFull: "星期六",
    sundayFull: "星期日",
    },
  
  hi: {
    // Navigation & Common
    home: "होम",
    back: "वापस",
    loading: "लोड हो रहा है",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    add: "जोड़ें",
    confirm: "पुष्टि करें",
    close: "बंद करें",
    
    // Home Page
    rank: "रैंक",
    streak: "स्ट्रीक",
    habits: "आदतें",
    today: "आज",
    dashboard: "डैशबोर्ड",
    yourDailyControlCenter: "आपका दैनिक नियंत्रण केंद्र",
    actionRequired: "कार्रवाई आवश्यक",
    yesterdayUnvalidated: "कल मान्य नहीं",
    todo: "कार्य सूची",
    schedule: "कार्यक्रम",
    screenTime: "स्क्रीन समय",
    ceoMode: "सीईओ मोड",
    maximumFocus: "अधिकतम फोकस",
    
    // Menu
    sixMonthReport: "6 महीने की रिपोर्ट",
    yourProgressOverview: "आपकी प्रगति का अवलोकन",
    activeApps: "सक्रिय ऐप्स",
    settingsAndLegal: "सेटिंग्स और कानूनी",
    privacyPolicy: "गोपनीयता नीति",
    termsAndConditions: "नियम और शर्तें",
    logout: "लॉगआउट",
    
    // Dashboard
    controlCenter: "नियंत्रण केंद्र",
    todaysFocus: "आज का फोकस",
    weekScore: "सप्ताह स्कोर",
    percent: "प्रतिशत",
    target: "लक्ष्य",
    complete: "पूर्ण",
    youMayExit: "आप बाहर जा सकते हैं",
    remaining: "शेष",
    locked: "लॉक",
    cannotExitEarly: "जल्दी बाहर नहीं निकल सकते",
    
    // Habits
    habit: "आदत",
    goal: "लक्ष्य",
    newHabit: "नई आदत",
    addHabit: "आदत जोड़ें",
    habitName: "आदत का नाम",
    description: "विवरण",
    dailyHabit: "दैनिक आदत",
    selectDays: "दिन चुनें",
    objectives: "उद्देश्य",
    weekContract: "साप्ताहिक अनुबंध",
    rewardIfSuccessful: "सफल होने पर पुरस्कार",
    sanctionIfFail: "विफल होने पर दंड",
    threshold: "सीमा",
    commitContract: "अनुबंध करें",
    committing: "करते हुए...",
    reward: "पुरस्कार",
    sanction: "दंड",
    lockedUntilNextWeek: "अगले सप्ताह तक लॉक",
    swipeRightForGoals: "लक्ष्य और अनुबंध के लिए दाईं ओर स्वाइप करें →",
    swipeLeftForHabits: "← आदतों की ग्रिड के लिए बाईं ओर स्वाइप करें",
    
    // Pareto / To-Do
    twentyEightyRule: "20% जो 80% चलाता है",
    doThisNow: "अभी करें",
    addTask: "कार्य जोड़ें",
    newTask: "नया कार्य",
    whatNeedsToBeDone: "क्या करने की जरूरत है?",
    addDetails: "विवरण जोड़ें...",
    priority: "प्राथमिकता",
    crucial: "महत्वपूर्ण",
    essential: "आवश्यक",
    average: "औसत",
    low: "कम",
    otherTasks: "अन्य कार्य",
    noPrioritiesSet: "कोई प्राथमिकता सेट नहीं",
    focusOnWhatMatters: "महत्वपूर्ण पर ध्यान दें",
    addFirstTask: "पहला कार्य जोड़ें",
    
    // Calendar
    new: "नया",
    eventTitle: "इवेंट शीर्षक",
    eventDetails: "इवेंट विवरण",
    date: "तारीख",
    time: "समय",
    duration: "अवधि",
    minutes: "मिनट",
    createEvent: "इवेंट बनाएं",
    
    // Screen Time
    focusMode: "फोकस मोड",
    deepWorkEnvironment: "गहन कार्य वातावरण",
    startSession: "सत्र शुरू करें",
    todayUsage: "आज का उपयोग",
    avgUsage: "7-दिन की औसत",
    winStreak: "विजय स्ट्रीक",
    blockApps: "ऐप्स ब्लॉक करें",
    blockWebsites: "वेबसाइट ब्लॉक करें",
    viewLeaderboard: "लीडरबोर्ड देखें",
    addBlockedApp: "अवरुद्ध ऐप जोड़ें",
    addBlockedWebsite: "अवरुद्ध वेबसाइट जोड़ें",
    
    // CEO Mode
    duration: "अवधि",
    approvedApps: "स्वीकृत ऐप्स",
    onceActivated: "एक बार सक्रिय होने पर, टाइमर समाप्त होने तक बाहर निकलना असंभव है।",
    activate: "सक्रिय करें",
    activating: "सक्रिय हो रहा है...",
    exit: "बाहर निकलें",
    available: "उपलब्ध",
    phone: "फोन",
    messages: "संदेश",
    calendar: "कैलेंडर",
    
    // Days of week
    monday: "सोम",
    tuesday: "मंगल",
    wednesday: "बुध",
    thursday: "गुरु",
    friday: "शुक्र",
    saturday: "शनि",
    sunday: "रवि",
    
    // Settings & Legal
    settings: "सेटिंग्स",
    language: "भाषा",
    selectLanguage: "भाषा चुनें",
    permissions: "अनुमतियाँ",
    termsOfUse: "उपयोग की शर्तें",
    dataDeletion: "डेटा विलोपन",
    contact: "संपर्क",
    
    // Time durations
    lessThan30min: "<30मिनट",
    oneHour: "1 घंटा",
    twoHours: "2 घंटे",
    halfDay: "आधा दिन",
    oneDay: "1 दिन",
    multiDay: "कई दिन",

    // Pareto/Priority
    nothingScheduled: "अनुसूचित नहीं",

    // CEO Mode
    onceActivatedCannotExit: "एक बार सक्रिय होने पर, टाइमर समाप्त होने तक बाहर निकलना असंभव है।",

    // Biannual Report
    monthReport: "6 महीने की रिपोर्ट",
    viewProgress: "अपनी प्रगति देखें",

    // Leaderboard
    leaderboard: "लीडरबोर्ड",
    global: "वैश्विक",
    friends: "मित्र",
    addFriends: "मित्र जोड़ें",

    // Week days full
    mondayFull: "सोमवार",
    tuesdayFull: "मंगलवार",
    wednesdayFull: "बुधवार",
    thursdayFull: "गुरुवार",
    fridayFull: "शुक्रवार",
    saturdayFull: "शनिवार",
    sundayFull: "रविवार",
    },
  
  es: {
    // Navigation & Common
    home: "Inicio",
    back: "Atrás",
    loading: "Cargando",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    confirm: "Confirmar",
    close: "Cerrar",
    
    // Home Page
    rank: "Rango",
    streak: "Racha",
    habits: "Hábitos",
    today: "Hoy",
    dashboard: "Panel",
    yourDailyControlCenter: "Tu centro de control diario",
    actionRequired: "ACCIÓN REQUERIDA",
    yesterdayUnvalidated: "Ayer sin validar",
    todo: "Tareas",
    schedule: "Horario",
    screenTime: "Tiempo de pantalla",
    ceoMode: "Modo CEO",
    maximumFocus: "Enfoque máximo",
    
    // Menu
    sixMonthReport: "Informe de 6 meses",
    yourProgressOverview: "Resumen de tu progreso",
    activeApps: "Aplicaciones activas",
    settingsAndLegal: "Configuración y legal",
    privacyPolicy: "Política de privacidad",
    termsAndConditions: "Términos y condiciones",
    logout: "Cerrar sesión",
    
    // Dashboard
    controlCenter: "Centro de control",
    todaysFocus: "Enfoque de hoy",
    weekScore: "PUNTUACIÓN SEMANAL",
    percent: "Porcentaje",
    target: "Objetivo",
    complete: "Completo",
    youMayExit: "Puedes salir",
    remaining: "Restante",
    locked: "BLOQUEADO",
    cannotExitEarly: "No se puede salir antes",
    
    // Habits
    habit: "Hábito",
    goal: "Meta",
    newHabit: "Nuevo hábito",
    addHabit: "Añadir hábito",
    habitName: "Nombre del hábito",
    description: "Descripción",
    dailyHabit: "Hábito diario",
    selectDays: "Seleccionar días",
    objectives: "Objetivos",
    weekContract: "CONTRATO SEMANAL",
    rewardIfSuccessful: "Recompensa si tienes éxito",
    sanctionIfFail: "Sanción si fallas",
    threshold: "Umbral",
    commitContract: "Confirmar contrato",
    committing: "Confirmando...",
    reward: "Recompensa",
    sanction: "Sanción",
    lockedUntilNextWeek: "Bloqueado hasta la próxima semana",
    swipeRightForGoals: "Desliza a la derecha para Metas y Contrato →",
    swipeLeftForHabits: "← Desliza a la izquierda para Cuadrícula de hábitos",
    
    // Pareto / To-Do
    twentyEightyRule: "20% que impulsa el 80%",
    doThisNow: "HAZ ESTO AHORA",
    addTask: "Añadir tarea",
    newTask: "Nueva tarea",
    whatNeedsToBeDone: "¿Qué hay que hacer?",
    addDetails: "Añadir detalles...",
    priority: "Prioridad",
    crucial: "Crucial",
    essential: "Esencial",
    average: "Promedio",
    low: "Bajo",
    otherTasks: "Otras tareas",
    noPrioritiesSet: "No hay prioridades establecidas",
    focusOnWhatMatters: "Enfócate en lo que importa",
    addFirstTask: "Añadir primera tarea",
    
    // Calendar
    new: "Nuevo",
    eventTitle: "Título del evento",
    eventDetails: "Detalles del evento",
    date: "Fecha",
    time: "Hora",
    duration: "Duración",
    minutes: "minutos",
    createEvent: "Crear evento",
    
    // Screen Time
    focusMode: "Modo Enfoque",
    deepWorkEnvironment: "Ambiente de trabajo profundo",
    startSession: "Iniciar sesión",
    todayUsage: "Uso de hoy",
    avgUsage: "Promedio de 7 días",
    winStreak: "Racha de victorias",
    blockApps: "Bloquear aplicaciones",
    blockWebsites: "Bloquear sitios web",
    viewLeaderboard: "Ver clasificación",
    addBlockedApp: "Añadir aplicación bloqueada",
    addBlockedWebsite: "Añadir sitio web bloqueado",
    
    // CEO Mode
    duration: "Duración",
    approvedApps: "Aplicaciones aprobadas",
    onceActivated: "Una vez activado, es imposible salir hasta que expire el temporizador.",
    activate: "ACTIVAR",
    activating: "ACTIVANDO...",
    exit: "SALIR",
    available: "Disponible",
    phone: "Teléfono",
    messages: "Mensajes",
    calendar: "Calendario",
    
    // Days of week
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom",
    
    // Settings & Legal
    settings: "Configuración",
    language: "Idioma",
    selectLanguage: "Seleccionar idioma",
    permissions: "Permisos",
    termsOfUse: "Términos de uso",
    dataDeletion: "Eliminación de datos",
    contact: "Contacto",
    
    // Time durations
    lessThan30min: "<30min",
    oneHour: "1 hora",
    twoHours: "2 horas",
    halfDay: "Media jornada",
    oneDay: "1 día",
    multiDay: "Varios días",

    // Pareto/Priority
    nothingScheduled: "No programado",

    // CEO Mode
    onceActivatedCannotExit: "Una vez activado, es imposible salir hasta que expire el temporizador.",

    // Biannual Report
    monthReport: "Informe de 6 meses",
    viewProgress: "Ver tu progreso",

    // Leaderboard
    leaderboard: "Clasificación",
    global: "Global",
    friends: "Amigos",
    addFriends: "Añadir amigos",

    // Week days full
    mondayFull: "Lunes",
    tuesdayFull: "Martes",
    wednesdayFull: "Miércoles",
    thursdayFull: "Jueves",
    fridayFull: "Viernes",
    saturdayFull: "Sábado",
    sundayFull: "Domingo",
    },
  
  ar: {
    // Navigation & Common
    home: "الرئيسية",
    back: "رجوع",
    loading: "جاري التحميل",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    confirm: "تأكيد",
    close: "إغلاق",
    
    // Home Page
    rank: "الرتبة",
    streak: "السلسلة",
    habits: "العادات",
    today: "اليوم",
    dashboard: "لوحة التحكم",
    yourDailyControlCenter: "مركز التحكم اليومي",
    actionRequired: "مطلوب إجراء",
    yesterdayUnvalidated: "الأمس غير مصدق",
    todo: "المهام",
    schedule: "الجدول",
    screenTime: "وقت الشاشة",
    ceoMode: "وضع الرئيس التنفيذي",
    maximumFocus: "تركيز أقصى",
    
    // Menu
    sixMonthReport: "تقرير 6 أشهر",
    yourProgressOverview: "نظرة عامة على تقدمك",
    activeApps: "التطبيقات النشطة",
    settingsAndLegal: "الإعدادات والقانونية",
    privacyPolicy: "سياسة الخصوصية",
    termsAndConditions: "الشروط والأحكام",
    logout: "تسجيل الخروج",
    
    // Dashboard
    controlCenter: "مركز التحكم",
    todaysFocus: "تركيز اليوم",
    weekScore: "نقاط الأسبوع",
    percent: "نسبة مئوية",
    target: "الهدف",
    complete: "مكتمل",
    youMayExit: "يمكنك الخروج",
    remaining: "المتبقي",
    locked: "مقفل",
    cannotExitEarly: "لا يمكن الخروج مبكراً",
    
    // Habits
    habit: "عادة",
    goal: "هدف",
    newHabit: "عادة جديدة",
    addHabit: "إضافة عادة",
    habitName: "اسم العادة",
    description: "الوصف",
    dailyHabit: "عادة يومية",
    selectDays: "اختر الأيام",
    objectives: "الأهداف",
    weekContract: "عقد الأسبوع",
    rewardIfSuccessful: "مكافأة في حالة النجاح",
    sanctionIfFail: "عقوبة في حالة الفشل",
    threshold: "العتبة",
    commitContract: "تأكيد العقد",
    committing: "جاري التأكيد...",
    reward: "مكافأة",
    sanction: "عقوبة",
    lockedUntilNextWeek: "مقفل حتى الأسبوع القادم",
    swipeRightForGoals: "اسحب لليمين للأهداف والعقد ←",
    swipeLeftForHabits: "اسحب لليسار لشبكة العادات →",
    
    // Pareto / To-Do
    twentyEightyRule: "20% التي تحرك 80%",
    doThisNow: "افعل هذا الآن",
    addTask: "إضافة مهمة",
    newTask: "مهمة جديدة",
    whatNeedsToBeDone: "ما الذي يجب القيام به؟",
    addDetails: "إضافة تفاصيل...",
    priority: "الأولوية",
    crucial: "حاسم",
    essential: "أساسي",
    average: "متوسط",
    low: "منخفض",
    otherTasks: "مهام أخرى",
    noPrioritiesSet: "لم يتم تعيين أولويات",
    focusOnWhatMatters: "ركز على ما يهم",
    addFirstTask: "إضافة المهمة الأولى",
    
    // Calendar
    new: "جديد",
    eventTitle: "عنوان الحدث",
    eventDetails: "تفاصيل الحدث",
    date: "التاريخ",
    time: "الوقت",
    duration: "المدة",
    minutes: "دقائق",
    createEvent: "إنشاء حدث",
    
    // Screen Time
    focusMode: "وضع التركيز",
    deepWorkEnvironment: "بيئة عمل عميقة",
    startSession: "بدء الجلسة",
    todayUsage: "استخدام اليوم",
    avgUsage: "متوسط 7 أيام",
    winStreak: "سلسلة الفوز",
    blockApps: "حظر التطبيقات",
    blockWebsites: "حظر المواقع",
    viewLeaderboard: "عرض لوحة المتصدرين",
    addBlockedApp: "إضافة تطبيق محظور",
    addBlockedWebsite: "إضافة موقع محظور",
    
    // CEO Mode
    duration: "المدة",
    approvedApps: "التطبيقات المعتمدة",
    onceActivated: "بمجرد التفعيل، يستحيل الخروج حتى انتهاء المؤقت.",
    activate: "تفعيل",
    activating: "جاري التفعيل...",
    exit: "خروج",
    available: "متاح",
    phone: "الهاتف",
    messages: "الرسائل",
    calendar: "التقويم",
    
    // Days of week
    monday: "الإثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    sunday: "الأحد",
    
    // Settings & Legal
    settings: "الإعدادات",
    language: "اللغة",
    selectLanguage: "اختر اللغة",
    permissions: "الأذونات",
    termsOfUse: "شروط الاستخدام",
    dataDeletion: "حذف البيانات",
    contact: "اتصل",
    
    // Time durations
    lessThan30min: "<30 دقيقة",
    oneHour: "ساعة واحدة",
    twoHours: "ساعتان",
    halfDay: "نصف يوم",
    oneDay: "يوم واحد",
    multiDay: "عدة أيام",

    // Pareto/Priority
    nothingScheduled: "غير مجدول",

    // CEO Mode
    onceActivatedCannotExit: "بمجرد التفعيل، يستحيل الخروج حتى انتهاء المؤقت.",

    // Biannual Report
    monthReport: "تقرير 6 أشهر",
    viewProgress: "عرض تقدمك",

    // Leaderboard
    leaderboard: "لوحة المتصدرين",
    global: "عالمي",
    friends: "الأصدقاء",
    addFriends: "إضافة أصدقاء",

    // Week days full
    mondayFull: "الإثنين",
    tuesdayFull: "الثلاثاء",
    wednesdayFull: "الأربعاء",
    thursdayFull: "الخميس",
    fridayFull: "الجمعة",
    saturdayFull: "السبت",
    sundayFull: "الأحد",
    },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    
    // Update HTML dir attribute for RTL
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    // Set initial direction
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}