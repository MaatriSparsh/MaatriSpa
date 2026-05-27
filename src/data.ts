import { Service, Practitioner, Feedback, Coupon } from './types';

export const SERVICES: Service[] = [
  {
    id: 'normal-sukoon-7',
    name: 'Sukoon Saptah (7 Days) - Normal Delivery Care',
    nameHindi: 'सुकून सप्ताह (7 दिन) - नॉर्मल डिलीवरी केयर',
    category: 'postpartum_mother',
    description: 'A premium 7-day postnatal recovery programme tailored for comfortable recovery after normal delivery. Focuses on gentle mother care, traditional body massage, lactation training, and basic newborn safety.',
    descriptionHindi: 'नॉर्मल डिलीवरी के बाद नई माताओं के त्वरित स्वास्थ्य लाभ के लिए 7 दिनों का विशेष केयर पैकेज। इसमें सूतिका मालिश, स्तनपान गाइडेंस और शिशु की उचित देखभाल शामिल है।',
    priceInr: 9999,
    discountedPrice: 9999,
    duration: 300,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Mother Care & Lactation Training',
      'Baby Care',
      'Pain Management',
      'Vital Monitoring',
      'Nutritional Support'
    ],
    benefitsHindi: [
      'माता की उचित देखभाल और स्तनपान प्रशिक्षण',
      'नवजात शिशु की कोमल देखभाल',
      'दर्द और थकान प्रबंधन',
      'वाइटल्स / महत्वपूर्ण स्वास्थ्य निगरानी',
      'पारंपरिक पौष्टिक आहार मार्गदर्शन'
    ],
    activeStatus: true
  },
  {
    id: 'normal-puran-14',
    name: 'Puran Aarohan (14 Days) - Normal Delivery Care',
    nameHindi: 'पूर्ण आरोहण (14 दिन) - नॉर्मल डिलीवरी केयर',
    category: 'postpartum_mother',
    description: 'A deep, therapeutic 14-day holistic postnatal alignment. Promotes cellular core recovery, postpartum pelvic compression, infant digestion schedules, and nurturing postnatal spa therapy.',
    descriptionHindi: '14 दिनों की सघन सूतिका मालिश और बेली बाइंडिंग चिकित्सा पद्धति। यह गर्भाशय और रीढ़ के संरेखण, शिशु पाचन और शानदार स्पा स्तर की शांति सुनिश्चित करता है।',
    priceInr: 19999,
    discountedPrice: 19999,
    duration: 600,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Mother Care & Lactation Training',
      'Baby Care',
      'Pain Management',
      'Vital Monitoring',
      'Nutritional Support',
      'Nurse Visit',
      'Holistic Spa'
    ],
    benefitsHindi: [
      'माता की उचित देखभाल और स्तनपान प्रशिक्षण',
      'नवजात शिशु की कोमल देखभाल',
      'दर्द और थकान प्रबंधन',
      'वाइटल्स / महत्वपूर्ण स्वास्थ्य निगरानी',
      'पारंपरिक पौष्टिक आहार मार्गदर्शन',
      'विशेष नर्स विजिट और स्वास्थ्य परामर्श',
      'होलिस्टिक प्रसवोत्तर स्पा'
    ],
    activeStatus: true
  },
  {
    id: 'lscs-navya-4',
    name: 'Navya Recovery (4 Days) - LSCS Care',
    nameHindi: 'नव्या रिकवरी (4 दिन) - सिजेरियन केयर',
    category: 'postpartum_mother',
    description: 'A delicate 4-day intensive C-section rehabilitation sequence centered on surgical incision safety, comfortable movement, baby holding ergonomics, and calming therapeutic body treatments.',
    descriptionHindi: 'सी-सेक्शन प्रसव के बाद टांकों की सुरक्षा के लिए 4 दिनों का विशेष सघन रिकवरी पैकेज। इसमें हल्के रीढ़ एर्गोनॉमिक्स, सुरक्षित संचलन, दर्द प्रबंधन और कोमल स्पा उपचार शामिल हैं।',
    priceInr: 5999,
    discountedPrice: 5999,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Mother Care',
      'Baby Care',
      'Pain Management',
      'Holistic Spa'
    ],
    benefitsHindi: [
      'सिजेरियन के बाद माता की कोमल देखभाल',
      'नवजात शिशु की सुरक्षित देखभाल',
      'कोमल दर्द प्रबंधन और टांकों की रक्षा',
      'सुरक्षित होलिस्टिक स्पा उपचार'
    ],
    activeStatus: true
  },
  {
    id: 'lscs-sukoon-7',
    name: 'Sukoon Saptah (7 Days) - LSCS Care',
    nameHindi: 'सुकून सप्ताह (7 दिन) - सिजेरियन केयर',
    category: 'postpartum_mother',
    description: 'A supportive 7-day program to help C-section mothers regain structural mobility. Includes expert wound compliance training, pelvic posture balance, lactation hold support, and warm infant sponge baths.',
    descriptionHindi: '7 दिनों का सूतिका कल्याण कार्यक्रम जो सी-सेक्शन माताओं के शरीर को शक्ति और गतिशीलता प्रदान करता है। दर्द कम करना, स्तनपान पकड़ सुधारना और कोमल स्पा सेवा इसमें शामिल हैं।',
    priceInr: 10999,
    discountedPrice: 10999,
    duration: 350,
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Mother Care & Lactation Training',
      'Baby Care',
      'Pain Management',
      'Vital Monitoring',
      'Nutritional Support',
      'Holistic Spa'
    ],
    benefitsHindi: [
      'माता की उचित देखभाल और स्तनपान प्रशिक्षण',
      'नवजात शिशु की कोमल देखभाल',
      'दर्द और थकान प्रबंधन',
      'वाइटल्स / महत्वपूर्ण स्वास्थ्य निगरानी',
      'पारंपरिक पौष्टिक आहार मार्गदर्शन',
      'होलिस्टिक प्रसवोत्तर स्पा'
    ],
    activeStatus: true
  },
  {
    id: 'lscs-puran-14',
    name: 'Puran Aarohan (14 Days) - LSCS Care',
    nameHindi: 'पूर्ण आरोहण (14 दिन) - सिजेरियन केयर',
    category: 'postpartum_mother',
    description: 'The ultimate 14-day comprehensive LSCS healing cycle. Includes lymphatic fluid drainage to clear surgical inflammation, pelvic alignment correction, nurse checkups, and luxurious prenatal spa therapies.',
    descriptionHindi: 'सी-सेक्शन विशिष्ट 14 दिनों की पूर्ण शारीरिक कल्याण प्रणाली। इसमें सूजन निवारक लिम्फैटिक ड्रेनेज, मां की हड्डियों व रीढ़ संरेखण, नर्स विजिट और संपूर्ण स्पा लाभ शामिल हैं।',
    priceInr: 21999,
    discountedPrice: 21999,
    duration: 700,
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Mother Care & Lactation Training',
      'Baby Care',
      'Pain Management',
      'Vital Monitoring',
      'Nutritional Support',
      'Nurse Visit',
      'Holistic Spa'
    ],
    benefitsHindi: [
      'माता की उचित देखभाल और स्तनपान प्रशिक्षण',
      'नवजात शिशु की कोमल देखभाल',
      'दर्द और थकान प्रबंधन',
      'वाइटल्स / महत्वपूर्ण स्वास्थ्य निगरानी',
      'पारंपरिक पौष्टिक आहार मार्गदर्शन',
      'विशेष नर्स विजिट और स्वास्थ्य परामर्श',
      'होलिस्टिक प्रसवोत्तर स्पा'
    ],
    activeStatus: true
  }
];

export const PRACTITIONERS: Practitioner[] = [
  {
    id: 'meera-nair',
    name: 'Meera Nair K.',
    role: 'Lead Postpartum Therapist & Garbha Specialist',
    roleHindi: 'मुख्य प्रसवोत्तर थेरेपिस्ट और पेट बांधने की विशेषज्ञ',
    avatar: 'https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&w=300&q=80',
    bio: 'Meera has over 15 years of practical hands-on experience in Kerala Postnatal traditions. She is globally renowned for her deeply empathetic touch and masterfully executes the traditional Sutika oil flows and stomach binding cloth therapies.',
    bioHindi: 'मीरा को केरल की पारंपरिक प्रसवोत्तर चिकित्सा प्रणालियों का १५ से अधिक वर्षों का व्यावहारिक अनुभव है। वे पेट के पारंपरिक सूतिका अभ्यंग और विशेष कपड़ा बांधने की मालिश के लिए पूरे देश में जानी जाती हैं।',
    rating: 5.0,
    specialties: ['Sutika Abhyanga Oil Therapy', 'Underbelly Herbal Binding', 'Newborn Warm Bathing'],
    specialtiesHindi: ['सूतिका अभ्यंग तेल मालिश', 'हर्बल पेट बांधना', 'शिशु स्नान चिकित्सा']
  },
  {
    id: 'dr-shreya',
    name: 'Dr. Shreya Joshi (B.A.M.S)',
    role: 'Senior Ayurvedic Pediatrician & Lactation Educator',
    roleHindi: 'वरिष्ठ आयुर्वेदिक बाल रोग विशेषज्ञ और लैक्टेशन सलाहकार',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    bio: 'Dr. Shreya holds active pediatric credentials specializing in holistic neonatal protection schemes. She blends clinical medical latch analyses with ancient tri-doshic postpartum nursing guidelines to empower lactating mothers.',
    bioHindi: 'डॉ. श्रेया के पास समग्र शिशु सुरक्षा और बाल स्वास्थ्य के सक्रिय लाइसेंस हैं। वे नैदानिक स्तनपान विश्लेषण के साथ आयुर्वेद के प्रसवोत्तर स्वास्थ्य दिशानिर्देशों को मिलाकर युवा स्तनपान कराने वाली माताओं को सशक्त बनाती हैं।',
    rating: 4.9,
    specialties: ['Lactation Consulting', 'Neonatal Health Audits', 'Baby Digestion Colic Healing'],
    specialtiesHindi: ['स्तनपान लैक्टेशन परामर्श', 'नवजात शिशु स्वास्थ्य परीक्षण', 'शिशु पाचन और मरोड़ राहत']
  },
  {
    id: 'pallavi-sen',
    name: 'Pallavi Sen',
    role: 'Postnatal Maternal Mind therapist',
    roleHindi: 'प्रसवोत्तर मातृ मानसिक कल्याण सलाहकार',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: 'Pallavi holds post-graduate qualifications in perinatal psycho-social health. She hosts warm counseling circles and therapeutic mindfulness strategies to help mothers feel confident and anchored during raw hormonal adjustments.',
    bioHindi: 'पल्लवी प्रसवोत्तर सामाजिक-मनोवैज्ञानिक स्वास्थ्य में स्नातकोत्तर हैं। वे प्रसव के बाद के कठिन समय में हार्मोनल परिवर्तनों और घबराहट के दौरान नई माताओं को आत्मविश्वास से भरने और मानसिक रूप से शांत करने के लिए बातचीत सत्र आयोजित करती हैं।',
    rating: 4.8,
    specialties: ['Postpartum Blue Counseling', 'Breathe-Somatic Restores', 'Mother Identity Coaching'],
    specialtiesHindi: ['बेबी ब्लूज़ अवसाद काउंसलिंग', 'सोमैटिक श्वास ध्यान', 'माँ का आत्मविश्वास संवर्धन']
  }
];

export const FEEDBACKS: Feedback[] = [
  {
    id: 'f-1',
    userName: 'Kavitha Ramaswamy',
    rating: 5,
    comment: 'The herbal belly wrapping and Sutika Abhyanga massage felt like a spiritual home-coming. My severe lower spine pain vanished, and I felt so beautifully cocooned in safety after such a traumatic hospital birth.',
    serviceName: 'Sutika Abhyanga & Herbal Belly Binding',
    date: '2026-05-12'
  },
  {
    id: 'f-2',
    userName: 'Aradhana & Baby Dev',
    rating: 5,
    comment: 'Dr. Shreya was literally a savior! I was struggling to latch my newborn for days, causing so much painful engorgement and tears. In one session, she corrected our posture, aligned my baby’s mouth, and gave me incredible ginger brew recipes.',
    serviceName: 'Latching & Lactation Sanctuary',
    date: '2026-05-18'
  },
  {
    id: 'f-3',
    userName: 'Nisha Deshmukh',
    rating: 5,
    comment: 'Meera Bai taught my husband and me the precise way to massage our 3-week-old daughter to relieve gas. Her gentle techniques completely stopped our baby’s nightly crying episodes. This is absolute pure magic!',
    serviceName: 'Shishu Abhyanga (Infant Massage & Bath Ritual)',
    date: '2026-05-22'
  }
];

export const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM'
];

export const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'FESTIVAL20',
    discountPercent: 20,
    description: 'Special seasonal festival coupon offering 20% flat discount on all mother-baby packages.',
    descriptionHindi: 'विशेष त्योहार कूपन सभी मातृत्व केयर पैकेजों पर फ्लैट २०% की भारी छूट देता है।',
    maxDiscountInr: 1000,
    minBookingValueInr: 1000,
    activeStatus: true
  },
  {
    code: 'NEWBORN15',
    discountPercent: 15,
    description: 'New mother welcome token. Apply to lock in 15% discount on lactation consultancy or pediatric wellness.',
    descriptionHindi: 'नई माताओं के लिए स्वागत कूपन। लैक्टेशन सहायता और शिशु बाल परामर्श पर १५% की छूट।',
    maxDiscountInr: 500,
    minBookingValueInr: 1499,
    activeStatus: true
  },
  {
    code: 'SANCTUM500',
    discountPercent: 0, // flat deduction managed by code
    description: 'Flat ₹500 discount on premium home massage sessions (applicable on value > ₹2500).',
    descriptionHindi: '₹५०० की फ्लैट सीधी छूट (₹२५०० से अधिक के बुकिंग मूल्य पर लागू)।',
    maxDiscountInr: 500,
    minBookingValueInr: 2500,
    activeStatus: true
  }
];
