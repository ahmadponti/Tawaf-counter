/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UmrahDoa {
  id: number;
  occasionEn: string;
  occasionAr: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationAr: string;
}

export const UMRAH_DOAS: UmrahDoa[] = [
  {
    id: 1,
    occasionEn: 'At Hajar al-Aswad (Start of Each Circuit)',
    occasionAr: 'عند الحجر الأسود (بداية كل شوط)',
    arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
    transliteration: 'Bismillahi Allahu Akbar',
    translationEn: 'In the name of Allah, and Allah is the Greatest.',
    translationAr: 'باسم الله، والله أكبر كبيراً.',
  },
  {
    id: 2,
    occasionEn: 'Between Yemeni Corner & Black Stone (Sunnah)',
    occasionAr: 'بين الركن اليماني والحجر الأسود (سنة)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    translationEn: 'Our Lord, grant us good in this world and good in the Hereafter, and save us from the punishment of the Fire. [Al-Baqarah 2:201]',
    translationAr: 'ربنا هب لنا في دنيانا صلاحاً وخيراً، وفي آخرتنا الجنة والرضوان، وقنا عذاب جهنم.',
  },
  {
    id: 3,
    occasionEn: 'During Tawaf (Remembrance & Praise)',
    occasionAr: 'أثناء الطواف (الباقيات الصالحات)',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
    transliteration: 'Subhanallah, wal-hamdulillah, wa la ilaha illallah, wallahu Akbar, wa la hawla wa la quwwata illa billah',
    translationEn: 'Glory be to Allah, all praise is due to Allah, there is no god but Allah, Allah is the Greatest, and there is no power nor might except with Allah.',
    translationAr: 'تنزيه لله تعالى وحمد وتهليل وتكبير وتفويض الأمر كله لله وحده.',
  },
  {
    id: 4,
    occasionEn: 'For Forgiveness & Well-being (Al-Afwa)',
    occasionAr: 'سؤال العفو والعافية',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ',
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah",
    translationEn: 'O Allah, I ask You for pardon and well-being in this world and in the Hereafter.',
    translationAr: 'اللهم أسألك محو الذنوب والمعافاة في الدين والدنيا والآخرة.',
  },
  {
    id: 5,
    occasionEn: 'Plea for Divine Mercy (Ibn Umar Sunnah)',
    occasionAr: 'طلب المغفرة والرحمة (أثر عن ابن عمر)',
    arabic: 'رَبِّ اغْفِرْ وَارْحَمْ، وَاعْفُ عَمَّا تَعْلَمْ، وَأَنْتَ الأَعَزُّ الأَكْرَمُ',
    transliteration: "Rabbighfir warham, wa'fu 'amma ta'lam, wa Antal-A'azzul-Akram",
    translationEn: 'My Lord, forgive and have mercy, and overlook that which You know; You are indeed the Most Mighty, the Most Generous.',
    translationAr: 'يا رب اغفر ذنوبي وارحمني وتجاوز عن خطاياي، فإنك أنت العزيز الأكرم.',
  },
  {
    id: 6,
    occasionEn: 'For Family, Parents & Offspring (Ibrahim AS)',
    occasionAr: 'للذرية والأهل والوالدين (دعاء إبراهيم)',
    arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلاَةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
    transliteration: "Rabbij'alni muqimas-salati wa min dhurriyyati, Rabbana wa taqabbal du'a",
    translationEn: 'My Lord, make me steadfast in prayer, and also from among my descendants; our Lord, and accept my supplication. [Ibrahim 14:40]',
    translationAr: 'رب اجعلني مقيماً للصلاة على وجهها ومحافظاً عليها، واجعل ذريتي كذلك، وتقبل دعائي.',
  },
  {
    id: 7,
    occasionEn: 'Comprehensive Prophet’s Supplication',
    occasionAr: 'الدعاء النبوي الجامع',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ مَا سَأَلَكَ مِنْهُ نَبِيُّكَ مُحَمَّدٌ ﷺ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا اسْتَعَاذَ مِنْهُ نَبِيُّكَ مُحَمَّدٌ ﷺ',
    transliteration: "Allahumma inni as'aluka min khayri ma sa'alaka minhu nabiyyuka Muhammad ﷺ",
    translationEn: 'O Allah, I ask You for all the good Your Prophet Muhammad ﷺ asked of You, and seek refuge from all the evil Your Prophet ﷺ sought refuge from.',
    translationAr: 'اللهم إني أسألك كل خير طلبه رسولك ﷺ، وأستعيذ بك من كل شر استعاذ منه نبيك ﷺ.',
  },
  {
    id: 8,
    occasionEn: 'Steadfastness of Heart & Guidance',
    occasionAr: 'الثبات على الدين والتقوى',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ، اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    transliteration: "Ya Muqallibal-qulub thabbit qalbi 'ala dinik, Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    translationEn: 'O Turner of hearts, make my heart firm upon Your religion. O Allah, help me remember You, thank You, and worship You in the best manner.',
    translationAr: 'يا مصرف القلوب ثبت قلبي على طاعتك، وأعني على دوام الذكر والشكر وحسن العبادة.',
  },
];
