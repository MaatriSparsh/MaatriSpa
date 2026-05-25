import { Service, Practitioner, Feedback, Coupon } from './types';

export const SERVICES: Service[] = [
  {
    id: 'lactation-consult',
    name: 'Latching & Lactation Consultation',
    nameHindi: 'स्तनपान और लैक्टेशन मार्गदर्शन',
    category: 'consultation',
    description: 'Private supportive counseling sessions for comfortable and painless breastfeeding. Guide correct holding postures, baby mouth latch alignment, and safe, natural nutritional plans to naturally support milk supply.',
    descriptionHindi: 'स्तनपान को सरल और दर्द रहित बनाने के लिए व्यक्तिगत मार्गदर्शन सत्र। हमारे सलाहकार सही मुद्रा, बच्चे के लैच संरेखण और प्राकृतिक स्तनपान पोषण के बारे में विस्तार से मार्गदर्शन देते हैं।',
    priceInr: 2499,
    discountedPrice: 1999,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Resolves painful engorgements and blocked milk ducts',
      'Implements ergonomic latching positions suited to baby head shapes',
      'Nurtures self-confidence for returning back to regular routines',
      'Advises on highly rich, traditional maternal nutrient plans'
    ],
    benefitsHindi: [
      'स्तनों के भारीपन और अवरुद्ध दुग्ध नलिकाओं को ठीक करता है',
      'बच्चे के अनुकूल सही और दर्द रहित स्तनपान मुद्राएं सिखाता है',
      'सामान्य जीवनचर्या में लौटने के लिए माँ का आत्मविश्वास बढ़ाता है',
      'दूध बढ़ाने वाले पारंपरिक व उत्कृष्ट पोषण आहार की योजना देता है'
    ],
    activeStatus: true
  },
  {
    id: 'postpartum-emotional-circle',
    name: 'Maternal Emotional & Mental Wellness Consultation',
    nameHindi: 'मातृ मानसिक एवं भावनात्मक कल्याण परामर्श',
    category: 'consultation',
    description: 'A completely secure, non-judgmental discussion circle dealing with postpartum baby blues, stress exhaustion, and infant postpartum adjustments with a professional compassionate perinatal psychologist.',
    descriptionHindi: 'चिंता, घबराहट, नींद की कमी, और प्रसवोत्तर भावनात्मक बदलावों के समाधान के लिए एक पूरी तरह से गोपनीय और सुरक्षित परामर्श चक्र। हमारी Perinatal सलाहकार माताओं को आत्मविश्वास और शांति प्रदान करती हैं।',
    priceInr: 1999,
    discountedPrice: 1499,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Delivers somatic breathing tips to ease stress and hyper-vigilance',
      'Validates psychological exhaustion and hormonal fatigue states',
      'Suggests safe relaxation techniques for peaceful sleep induction',
      'Continuous supportive coaching through the recovery weeks'
    ],
    benefitsHindi: [
      'चिंता और अत्यधिक घबराहट को शांत करने के लिए ध्यान तकनीकें',
      'शारीरिक और मानसिक थकावट की स्थिति में संबल और सही समझ',
      'अच्छी गहरी नींद लाने के लिए मानसिक तनाव दूर करने के उपाय',
      'शुरुआती कठिन हफ्तों में निरंतर संवेदी कोचिंग और संबल'
    ],
    activeStatus: true
  },
  {
    id: 'postpartum-diet-workshop',
    name: 'Postnatal Nutrient Prep Live Workshop',
    nameHindi: 'प्रसवोत्तर पारंपरिक पौष्टिक आहार कार्यशाला',
    category: 'workshop',
    description: 'A live interactively structured class for the mother and her kitchen caregivers. Learn to prepare traditional healing wholesome postpartum recipes (nutritious whole-wheat ladoos, healthy energy remedies, and warm digestive waters) that fast-track physical revitalization.',
    descriptionHindi: 'नई माँ और उनके घर के रसोइये/दादी-नानी के लिए एक लाइव व्यावहारिक सत्र। इसमें शरीर को ताकत वापस लाने वाली पारंपरिक खाद्य सामग्री जैसे पौष्टिक आटे के लड्डू, अजवाइन पानी, हरीरा आदि बनाने का प्रशिक्षण दिया जाता है।',
    priceInr: 1499,
    discountedPrice: 999,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
    benefits: [
      'Comprehensive recipe PDF detailing over 18 postpartum healing foods',
      'Guidance on food options to avoid early digestive gas in breastfeeding babies',
      'Dietary plan custom tailored to enhance milk purity & nutritional indices',
      'Sourcing guidelines for authentic pure cold-pressed oils'
    ],
    benefitsHindi: [
      '१८ पारंपरिक व्यंजन विधियों के साथ संपूर्ण प्रसवोत्तर रेसिपी गाइड',
      'यह जानकारी कि कौन से खाद्य पदार्थों से शिशु को पेट में गैस व तकलीफ हो सकती है',
      'स्तन के दूध की शुद्धता और पोषण स्तर को बढ़ाने वाली आहार योजना',
      'शुद्ध और घाणी के असली तेलों की पहचान और खरीद सलाह'
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
