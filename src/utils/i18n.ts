/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLanguage } from '../types/tawaf';

export interface Translations {
  appName: string;
  appSubtitle: string;
  langName: string;
  
  // Setup screen
  setupTitle: string;
  setupSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  startPointCalibration: string;
  calibrated: string;
  optional: string;
  calibrationDesc: string;
  calibrateBtn: string;
  calibratedAt: (deg: number) => string;
  countingMethod: string;
  autoManualMode: string;
  autoManualDesc: string;
  manualOnlyMode: string;
  manualOnlyDesc: string;
  privacyNoticeTitle: string;
  privacyNoticeDesc: string;
  startTawafBtn: string;

  // Main Counter screen
  resetBtn: string;
  autoManualBadge: string;
  manualOnlyBadge: string;
  circuitLabel: string;
  circuitOfTotal: (current: number, total: number) => string;
  ofTotalCompleted: (total: number) => string;
  totalTime: string;
  lapTime: (circuit: number) => string;
  circuitAngle: (angle: number) => string;
  lapsLogged: (count: number) => string;
  completeCircuitBtn: (circuit: number) => string;
  finishCircuit7Btn: string;
  completeCircuitHint: string;
  finishCircuitHint: string;
  undoLastLapBtn: string;

  // Uncertainty alert
  uncertaintyTitle: (circuit: number) => string;
  uncertaintyDesc: string;
  confirmBtn: string;
  dismissBtn: string;

  // Reset dialog
  resetModalTitle: string;
  resetModalDesc: (circuit: number) => string;
  confirmResetBtn: string;
  cancelResetBtn: string;

  // Completion screen
  completedTitle: string;
  completedGreeting: string;
  completedDesc: string;
  totalDuration: string;
  completedLaps: string;
  circuitLapTimes: string;
  recommendedActsTitle: string;
  recommendedAct1: string;
  recommendedAct2: string;
  recommendedAct3: string;
  copySummaryBtn: string;
  copiedFeedback: string;
  startNewTawafBtn: string;

  // Settings
  settingsTitle: string;
  displayAndSession: string;
  keepScreenAwake: string;
  keepScreenAwakeDesc: string;
  appearance: string;
  darkTheme: string;
  lightTheme: string;
  themeDark: string;
  themeLight: string;
  themeSystem: string;
  themeDesc: string;
  highContrast: string;
  highContrastDesc: string;
  tactileAndAudio: string;
  gentleHaptics: string;
  gentleHapticsDesc: string;
  gentleChime: string;
  gentleChimeDesc: string;
  dynamicTypeSize: string;
  developerXcode: string;
  swiftSourceFiles: string;
  privacyCardTitle: string;
  privacyItem1: string;
  privacyItem2: string;
  privacyItem3: string;
  privacyItem4: string;
  doneBtn: string;
  languageSelect: string;

  // Simulator
  simulatorTitle: string;
  counterClockwiseDir: string;
  greenLineMarker: string;
  circuitProgress: string;
  perimeterWalked: string;
  autoWalk: string;
  pauseWalk: string;
  step30: string;
  testUncertainty: string;
  finishFullLap: string;
  closeSimulator: string;
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    appName: 'Tawaf Counter',
    appSubtitle: 'iOS Umrah Companion',
    langName: 'English',

    // Setup screen
    setupTitle: 'Begin at Hajar al-Aswad',
    setupSubtitle: 'Face the Kaaba corner with the Black Stone along the brown marble line and green wall light before counting.',
    step1Title: 'Circuits move counter-clockwise',
    step1Desc: 'Keep the Kaaba on your left shoulder throughout all 7 circuits (Ashwat).',
    step2Title: 'Each circuit starts & ends at the green light',
    step2Desc: 'Raise your right hand towards Hajar al-Aswad (Istilam) and recite Bismillah, Allahu Akbar.',
    startPointCalibration: 'Start Point Calibration',
    calibrated: 'Calibrated',
    optional: 'Optional',
    calibrationDesc: 'Calibrating locks in your heading at Hajar al-Aswad to help detect when you complete a full 360° circuit.',
    calibrateBtn: 'Calibrate at Hajar al-Aswad',
    calibratedAt: (deg) => `Calibrated facing ${deg}° (Re-calibrate)`,
    countingMethod: 'Counting Method',
    autoManualMode: 'Auto + Manual',
    autoManualDesc: 'Motion & GPS estimates laps, with big manual buttons anytime.',
    manualOnlyMode: 'Manual Only',
    manualOnlyDesc: 'Pure 1-tap thumb counter. No sensor usage.',
    privacyNoticeTitle: 'Privacy & Accuracy:',
    privacyNoticeDesc: 'All motion & location calculations run 100% on your device. GPS can drift under heavy crowds or covered floors; the app will ask for confirmation if uncertain, and you can always tap the large +1 button manually.',
    startTawafBtn: 'Start Tawaf (Circuit 1)',

    // Main Counter
    resetBtn: 'Reset',
    autoManualBadge: 'Auto + Manual',
    manualOnlyBadge: 'Manual Only',
    circuitLabel: 'Circuit',
    circuitOfTotal: (current, total) => `Circuit ${current} of ${total}`,
    ofTotalCompleted: (total) => `of ${total} completed`,
    totalTime: 'Total',
    lapTime: (circuit) => `Lap ${circuit}`,
    circuitAngle: (angle) => `Circuit angle: ${angle}° / 360°`,
    lapsLogged: (count) => `${count} completed lap${count > 1 ? 's' : ''} logged`,
    completeCircuitBtn: (circuit) => `+1 Complete Circuit ${circuit}`,
    finishCircuit7Btn: 'Finish 7th Circuit',
    completeCircuitHint: 'Tap when returning to Hajar al-Aswad line',
    finishCircuitHint: 'Tap at Hajar al-Aswad to conclude',
    undoLastLapBtn: 'Undo Last Lap',

    // Uncertainty
    uncertaintyTitle: (circuit) => `Circuit ${circuit} Completed?`,
    uncertaintyDesc: 'Detected movement near Hajar al-Aswad.',
    confirmBtn: 'Confirm',
    dismissBtn: 'Dismiss',

    // Reset Dialog
    resetModalTitle: 'Reset Tawaf Session?',
    resetModalDesc: (circuit) => `This will clear your current progress (Circuit ${circuit} of 7) and lap times. Progress cannot be recovered after resetting.`,
    confirmResetBtn: 'Reset to Circuit 1',
    cancelResetBtn: 'Cancel & Keep Progress',

    // Completion
    completedTitle: 'Tawaf Completed',
    completedGreeting: 'تَقَبَّلَ اللَّهُ طَوَافَكُمْ',
    completedDesc: 'May your worship be accepted. All 7 circuits around the Kaaba have been completed.',
    totalDuration: 'Total Duration',
    completedLaps: '7 / 7 Laps',
    circuitLapTimes: 'Circuit Lap Times',
    recommendedActsTitle: 'Recommended Post-Tawaf Acts',
    recommendedAct1: "Pray two Raka'at behind Maqam Ibrahim (or anywhere in the Haram if crowded).",
    recommendedAct2: "Drink Zamzam water and make du'a.",
    recommendedAct3: "Proceed to Safa for Sa'i if performing Umrah or Hajj.",
    copySummaryBtn: 'Copy Session Summary',
    copiedFeedback: 'Copied to Clipboard',
    startNewTawafBtn: 'Start New Tawaf',

    // Settings
    settingsTitle: 'Settings & Accessibility',
    displayAndSession: 'Display & Session',
    keepScreenAwake: 'Keep Screen Awake',
    keepScreenAwakeDesc: 'Prevents the phone from locking during active Tawaf',
    appearance: 'Appearance',
    darkTheme: 'Dark Gold Theme',
    lightTheme: 'Light Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSystem: 'System',
    themeDesc: 'Optimized for nighttime worship or bright Mataf sunlight',
    highContrast: 'Outdoor High Contrast',
    highContrastDesc: 'Optimized for bright desert sunshine in the Mataf courtyard',
    tactileAndAudio: 'Tactile & Audio',
    gentleHaptics: 'Gentle Haptics',
    gentleHapticsDesc: 'Discrete vibration pulses when a circuit is counted',
    gentleChime: 'Gentle Chime Tone',
    gentleChimeDesc: 'Soft audio chime on count (disabled by default for worship)',
    dynamicTypeSize: 'Dynamic Type Size',
    developerXcode: 'Developer & Xcode Export',
    swiftSourceFiles: 'SwiftUI Xcode Codebase (6 Files)',
    privacyCardTitle: 'Private & Reliable On-Device Architecture',
    privacyItem1: 'No account or login required.',
    privacyItem2: 'No audio recording, camera, or network tracking.',
    privacyItem3: 'All calculations stay strictly on your device.',
    privacyItem4: 'Session state is saved in local device storage so you never lose your count.',
    doneBtn: 'Done',
    languageSelect: 'Language / اللغة',

    // Simulator
    simulatorTitle: 'Mataf Geometry Simulator',
    counterClockwiseDir: 'Counter-Clockwise (طواف)',
    greenLineMarker: 'Green Light Line',
    circuitProgress: 'Circuit Progress',
    perimeterWalked: 'Perimeter Walked',
    autoWalk: 'Auto Walk',
    pauseWalk: 'Pause Walk',
    step30: 'Step (+30°)',
    testUncertainty: 'Test Uncertainty',
    finishFullLap: 'Finish Full Lap',
    closeSimulator: 'Close Simulator',
  },

  ar: {
    appName: 'عداد الطواف',
    appSubtitle: 'رفيق المعتمر والحاج',
    langName: 'العربية',

    // Setup screen
    setupTitle: 'البداية من الحجر الأسود',
    setupSubtitle: 'استقبل ركن الحجر الأسود بمحاذاة الخط الرخامي البني وإشارة الضوء الأخضر على جدار الحرم قبل بدء العد.',
    step1Title: 'الطواف عكس عقارب الساعة',
    step1Desc: 'اجعل الكعبة المشرفة عن يسارك طوال الأشواط السبعة.',
    step2Title: 'يبدأ وينتهي كل شوط عند الضوء الأخضر',
    step2Desc: 'أشر بيدك اليمنى نحو الحجر الأسود (استلام) وكبّر: باسم الله، والله أكبر.',
    startPointCalibration: 'معايرة نقطة البداية',
    calibrated: 'تمت المعايرة',
    optional: 'اختياري',
    calibrationDesc: 'تحديد الاتجاه عند الحجر الأسود يساعد في التعرف التلقائي على إتمام الدورة الكاملة ٣٦٠ درجة.',
    calibrateBtn: 'معايرة عند الحجر الأسود',
    calibratedAt: (deg) => `تمت المعايرة باتجاه ${deg}° (إعادة المعايرة)`,
    countingMethod: 'طريقة الحساب',
    autoManualMode: 'تلقائي + يدوي',
    autoManualDesc: 'تحديد الأشواط بالحركة ونظام الموقع مع إتاحة الزر اليدوي دائماً.',
    manualOnlyMode: 'يدوي فقط',
    manualOnlyDesc: 'عداد يدوي بسيط بلمسة واحدة دون استخدام المستشعرات.',
    privacyNoticeTitle: 'الخصوصية ودقة الرصد:',
    privacyNoticeDesc: 'تُعالج كافة بيانات الحركة والموقع على جهازك حصراً. قد تتأثر إشارة الموقع بالازدحام الشديد أو الأدوار المسقوفة، وسيطلب منك التطبيق التأكيد عند عدم اليقين مع إمكانية الضغط على زر الشوط يدوياً في أي لحظة.',
    startTawafBtn: 'ابدأ الطواف (الشوط الأول)',

    // Main Counter
    resetBtn: 'إعادة تعيين',
    autoManualBadge: 'تلقائي + يدوي',
    manualOnlyBadge: 'يدوي فقط',
    circuitLabel: 'الشوط',
    circuitOfTotal: (current, total) => `الشوط ${current} من ${total}`,
    ofTotalCompleted: (total) => `من ${total} أشواط مكتملة`,
    totalTime: 'الإجمالي',
    lapTime: (circuit) => `الشوط ${circuit}`,
    circuitAngle: (angle) => `زاوية الشوط: ${angle}° / ٣٦٠°`,
    lapsLogged: (count) => `تم تسجيل ${count} أشواط`,
    completeCircuitBtn: (circuit) => `+١ إتمام الشوط ${circuit}`,
    finishCircuit7Btn: 'إتمام الشوط السابع',
    completeCircuitHint: 'اضغط عند محاذاة خط الحجر الأسود',
    finishCircuitHint: 'اضغط عند الحجر الأسود لختم الطواف',
    undoLastLapBtn: 'تراجع عن الشوط السابق',

    // Uncertainty
    uncertaintyTitle: (circuit) => `هل اكتمل الشوط ${circuit}؟`,
    uncertaintyDesc: 'تم رصد حركة بمحاذاة الحجر الأسود.',
    confirmBtn: 'تأكيد الشوط',
    dismissBtn: 'تجاهل',

    // Reset Dialog
    resetModalTitle: 'إعادة تعيين الطواف؟',
    resetModalDesc: (circuit) => `سيؤدي هذا إلى مسح تقدمك الحالي (الشوط ${circuit} من ٧) وأوقات الأشواط. لا يمكن التراجع عن هذا الإجراء.`,
    confirmResetBtn: 'إعادة البدء من الشوط الأول',
    cancelResetBtn: 'إلغاء والحفاظ على التقدم',

    // Completion
    completedTitle: 'تم الطواف بحمد الله',
    completedGreeting: 'تَقَبَّلَ اللَّهُ طَوَافَكُمْ',
    completedDesc: 'تقبل الله طاعتكم وصالح أعمالكم. لقد أتممتم سبعة أشواط كاملة حول الكعبة المشرفة.',
    totalDuration: 'المدة الإجمالية',
    completedLaps: '٧ / ٧ أشواط',
    circuitLapTimes: 'أوقات الأشواط',
    recommendedActsTitle: 'سنن ما بعد الطواف',
    recommendedAct1: 'صلاة ركعتين خلف مقام إبراهيم (أو في أي مكان من الحرم عند الزحام).',
    recommendedAct2: 'الشرب من ماء زمزم والتضلع منه والدعاء.',
    recommendedAct3: 'التوجه إلى الصفا لبدء السعي للمعتمر والحاج.',
    copySummaryBtn: 'نسخ ملخص الطواف',
    copiedFeedback: 'تم النسخ إلى الحافظة',
    startNewTawafBtn: 'بدء طواف جديد',

    // Settings
    settingsTitle: 'الإعدادات وسهولة الاستخدام',
    displayAndSession: 'الشاشة والجلسة',
    keepScreenAwake: 'إبقاء الشاشة مضاءة',
    keepScreenAwakeDesc: 'منع قفل الهاتف تلقائياً أثناء أداء الطواف',
    appearance: 'المظهر',
    darkTheme: 'المظهر الليلي المذهّب',
    lightTheme: 'المظهر النهاري',
    themeDark: 'داكن',
    themeLight: 'فاتح',
    themeSystem: 'تلقائي',
    themeDesc: 'اختر المظهر الليلي أو النهاري أو التوافق مع إعدادات جهازك',
    highContrast: 'تباين فائق لأشعة الشمس',
    highContrastDesc: 'مخصص لوضوح الرؤية تحت أشعة شمس صحن المطاف',
    tactileAndAudio: 'الاهتزاز والصوت',
    gentleHaptics: 'اهتزاز لطيف',
    gentleHapticsDesc: 'نبضات اهتزازية خفيفة عند احتساب كل شوط',
    gentleChime: 'تنبيه صوتي هادئ',
    gentleChimeDesc: 'نغمة صوتية رقيقة عند العد (مغلقة افتراضياً للمحافظة على الخشوع)',
    dynamicTypeSize: 'حجم الخط',
    developerXcode: 'كود المطورين وXcode',
    swiftSourceFiles: 'مشروع SwiftUI أصلي (٦ ملفات)',
    privacyCardTitle: 'خصوصية تامة وحفظ محلي على جهازك',
    privacyItem1: 'لا يتطلب التطبيق إنشاء أي حساب أو تسجيل دخول.',
    privacyItem2: 'لا يتم تسجيل الصوت أو استخدام الكاميرا نهائياً.',
    privacyItem3: 'تتم كافة المعالجات على هاتفك دون إرسال أي بيانات.',
    privacyItem4: 'يُحفظ عداد الأشواط محلياً لضمان عدم ضياعه عند قفل الهاتف.',
    doneBtn: 'تم',
    languageSelect: 'اللغة / Language',

    // Simulator
    simulatorTitle: 'محاكي هندسة المطاف',
    counterClockwiseDir: 'عكس عقارب الساعة (طواف)',
    greenLineMarker: 'خط الإشارة الخضراء',
    circuitProgress: 'تقدم الشوط الحالي',
    perimeterWalked: 'المسافة المقطوعة',
    autoWalk: 'مشية تلقائية',
    pauseWalk: 'إيقاف مؤقت',
    step30: 'خطوة (+٣٠°)',
    testUncertainty: 'تجربة حالة عدم اليقين',
    finishFullLap: 'إتمام الشوط كاملاً',
    closeSimulator: 'إغلاق المحاكي',
  },
};
