/**
 * TravelMate AI – AI Tour Guide Module v2.0
 * Web Speech API for real audio in English, Telugu, Hindi.
 * Gemini Q&A via backend.
 */

const TourGuideModule = {
  currentId: 'hyd-charminar',
  currentLang: 'en',
  currentData: null,
  speaking: false,
  utterance: null,

  MONUMENTS: {
    'hyd-charminar': {
      name: 'Charminar',
      meta: 'Built 1591 CE · Muhammad Quli Qutb Shah · UNESCO Tentative Heritage',
      fee: '₹25 (Indian) / ₹300 (Foreign)',
      feeClass: 'badge-amber',
      img: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to the magnificent Charminar, the crown jewel of Hyderabad! Built in 1591 CE by Muhammad Quli Qutb Shah, this iconic landmark stands at the heart of the old city. Its name means "Four Towers" in Urdu — referring to the four soaring minarets that reach 56 meters into the sky. The monument was constructed to commemorate the end of a deadly plague that swept through the city. Each minaret contains a winding staircase of 149 steps leading to a stunning top-floor mosque. The structure blends Persian, Indian, and Islamic architectural styles with intricate stucco decorations. Looking out from the top, you can see the famous Laad Bazaar — a traditional market selling bangles, pearls, and silver jewellery for over 400 years.',
        te: 'హైదరాబాద్ నగర గుండె లో ఉన్న చార్మినార్ కు స్వాగతం! ఈ ప్రసిద్ధ స్మారక కట్టడాన్ని 1591 సంవత్సరంలో మహమ్మద్ ఖులీ ఖుతుబ్ షా నిర్మించారు. చార్మినార్ అంటే నాలుగు మినార్లు అని అర్థం. ఈ నాలుగు మినార్లు 56 మీటర్ల ఎత్తున ఉంటాయి. ఈ కట్టడం పర్షియన్, భారతీయ మరియు ఇస్లామిక్ నిర్మాణ శైలి కలయికతో తయారైంది. ప్రతి మినార్ లో 149 మెట్లు ఉన్నాయి. పై అంతస్తు నుండి నాలుగు వైపులా హైదరాబాద్ నగరం మనోహరంగా కనిపిస్తుంది.',
        hi: 'हैदराबाद की शान चारमीनार में आपका स्वागत है! 1591 ईस्वी में मुहम्मद कुली कुतुब शाह द्वारा निर्मित यह भव्य स्मारक पुराने शहर के केंद्र में स्थित है। चारमीनार का अर्थ है चार मीनारें। ये चारों मीनारें 56 मीटर ऊंची हैं और प्रत्येक में 149 सीढ़ियां हैं। यह स्मारक फारसी, भारतीय और इस्लामिक वास्तुकला का अद्भुत संगम है। ऊपर से पूरे हैदराबाद शहर का मनोरम दृश्य दिखता है।'
      },
      facts: ['Built in 1591 CE to celebrate end of plague epidemic', 'Each minaret is 56 meters tall with 149 winding steps', 'Houses a mosque on the 2nd floor — still used for Friday prayers', 'Faces the famous Laad Bazaar (bangles market, 400+ years old)', 'Visible from almost anywhere in the Old City of Hyderabad']
    },
    'hyd-golconda': {
      name: 'Golconda Fort',
      meta: 'Built 16th Century · Qutb Shahi Dynasty · 400+ acre fortification',
      fee: '₹30 (Indian) / ₹500 (Foreign)',
      feeClass: 'badge-amber',
      img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to the legendary Golconda Fort, one of the most magnificent fortifications in all of India! Perched atop a 120-meter granite hill, this 16th-century citadel was built by the Qutb Shahi dynasty. The fort is famous for its incredible acoustics — a handclap at the main entrance can be heard clearly at the top of the fort, nearly 1 kilometer away! This sound system was an ancient security alarm used to warn royals of approaching enemies. Golconda was once the diamond trading capital of the world — the Koh-i-Noor and the Hope Diamond both passed through its markets. The fort complex spans over 400 acres with 87 semi-circular bastions, 8 major gates, and a royal palace.',
        te: 'గోల్కొండ కోట కు స్వాగతం! ఈ కోట 16వ శతాబ్దంలో కుతుబ్ షాహీ రాజవంశం నిర్మించింది. 120 మీటర్ల ఎత్తున ఉన్న గ్రానైట్ కొండపై ఈ అద్భుతమైన కోట నిలుస్తుంది. గోల్కొండ కోటకు ఒక ప్రత్యేకత ఉంది - ముఖద్వారం వద్ద చప్పట్లు కొడితే ఆ శబ్దం దాదాపు 1 కిలోమీటర్ దూరంలో ఉన్న పైభాగంలో స్పష్టంగా వినిపిస్తుంది. ఒకప్పుడు ఇక్కడ కోహినూర్ వజ్రం ఉండేది.',
        hi: 'गोलकुंडा किले में आपका स्वागत है! 16वीं शताब्दी में कुतुब शाही वंश द्वारा बनाया गया यह किला 120 मीटर ऊंची ग्रेनाइट पहाड़ी पर स्थित है। इस किले की ध्वनि प्रणाली अद्वितीय है — मुख्य द्वार पर ताली बजाने पर करीब 1 किलोमीटर दूर किले की चोटी पर स्पष्ट सुनाई देती है। यहां एक समय कोहिनूर हीरा भी रखा गया था।'
      },
      facts: ['A clap at the main gate echoes clearly at the hilltop — 1km away!', 'Koh-i-Noor and Hope Diamond both originated from Golconda mines', '400+ acres with 87 semi-circular bastions and 8 major gates', 'Sound &amp; Light Show every evening (English &amp; Telugu)', 'Views of the entire Qutb Shahi Tombs complex from the hilltop']
    },
    'hyd-paigah-tombs': {
      name: 'Paigah Tombs',
      meta: 'Built 18th–19th Century · Paigah Nobles · Marble Jaali Masterpiece',
      fee: 'Free Entry',
      feeClass: 'badge-green',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to the Paigah Tombs — Hyderabad\'s most breathtaking hidden architectural wonder! These grand mausoleums belong to the aristocratic Paigah family, the highest nobles of the Nizam\'s court. The tombs display extraordinary Italian marble lattice work, known as jaali, with intricate geometric patterns that filter sunlight into dazzling kaleidoscopic patterns on the floor. Each tomb is unique — no two marble screens are identical. The Paigahs were among the wealthiest families in India, and their tombs reflect that grandeur. Despite being as spectacular as the Taj Mahal in craftsmanship, they remain largely unknown to tourists, making this a true hidden gem.',
        te: 'పాయిగా సమాధులు హైదరాబాద్ లో మిగిలిపోయిన దాచిపెట్టిన వారసత్వ సంపద! నిజాం ఆస్థానంలో అత్యంత శక్తివంతమైన పాయిగా కుటుంబం వారి సమాధులు ఇవి. ఇటాలియన్ పాలరాయితో తయారైన జాలీ పని పగటివేళ సూర్యకాంతి ని అద్భుతమైన రంగురంగుల నమూనాలుగా మారుస్తుంది. ప్రతి సమాధి యొక్క పాలరాయి డిజైన్ ఒక్కొక్కటి వేర్వేరుగా ఉంటుంది.',
        hi: 'पाइगाह मकबरे हैदराबाद की सबसे अनदेखी विरासत हैं! निजाम के दरबार के सबसे शक्तिशाली पाइगाह परिवार के ये भव्य मकबरे इटालियन संगमरमर से बने जाली के काम के लिए प्रसिद्ध हैं। सूरज की रोशनी इस जाली से छनकर जमीन पर रंगीन आकृतियां बनाती है। यह हैदराबाद का छिपा हुआ खजाना है।'
      },
      facts: ['18th-19th century Italian marble jaali is unmatched in India', 'Each tomb has a completely unique marble screen pattern', 'Hidden from most tourists — rarely crowded', 'Sunrise photography here is spectacular due to marble light effects', 'Free entry — rarely featured in mainstream guides']
    },
    'hyd-salar-jung': {
      name: 'Salar Jung Museum',
      meta: 'Established 1951 · 43,000 artifacts · One of India\'s largest museums',
      fee: '₹20 (Indian) / ₹500 (Foreign)',
      feeClass: 'badge-amber',
      img: 'https://images.unsplash.com/photo-1565060169194-19fabcd5f46a?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to the Salar Jung Museum, one of the largest one-man collections in the world! Named after Nawab Mir Yousuf Ali Khan Salar Jung III, this extraordinary museum houses over 43,000 objects collected from across the globe. Among the most famous exhibits is the Veiled Rebecca — a marble sculpture so lifelike that the carved veil appears transparent. The double-figure clock that chimes every hour with two opposing knights is another crowd favorite. The museum has 38 galleries spanning Indian art, Mughal manuscripts, jade, ivory, clocks, textiles, European paintings, and much more. This is a full-day destination — plan at least 3 hours.',
        te: 'సాలార్ జంగ్ మ్యూజియం కు స్వాగతం! ప్రపంచంలో ఒక వ్యక్తి సేకరించిన అతి పెద్ద సంగ్రహాలయాలలో ఒకటి ఇది. 43,000 కంటే ఎక్కువ వస్తువులు ఇక్కడ ఉన్నాయి. వీలులు వేసిన రెబెక్కా అనే పాలరాయి శిల్పం చాలా ప్రసిద్ధి. 38 గ్యాలరీలలో భారతీయ కళ, మొఘల్ రాతప్రతులు, యూరోపియన్ చిత్రాలు వంటివి చూడవచ్చు.',
        hi: 'सालार जंग संग्रहालय में आपका स्वागत है! दुनिया में एक व्यक्ति द्वारा संग्रहित सबसे बड़े संग्रहों में से एक है यह। 43,000 से अधिक वस्तुएं यहां प्रदर्शित हैं। संगमरमर की घूंघट वाली रेबेका मूर्ति इतनी जीवंत दिखती है कि पत्थर का घूंघट वास्तविक लगता है। 38 गैलरी में भारतीय कला, मुगल पांडुलिपियां और यूरोपीय चित्र देखे जा सकते हैं।'
      },
      facts: ['World\'s largest one-person art collection — Salar Jung III', '43,000+ objects spanning 5 continents and 35+ countries', 'Veiled Rebecca marble sculpture — the veil appears completely transparent', 'Double-figure clock chimes with knight battle every hour', '38 galleries requiring minimum 3-4 hours to explore fully']
    },
    'hyd-chowmahalla': {
      name: 'Chowmahalla Palace',
      meta: 'Built 1750–1869 CE · Nizam\'s Official Palace · UNESCO Asia-Pacific Award',
      fee: '₹80 (Adult) / ₹40 (Child)',
      feeClass: 'badge-amber',
      img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to Chowmahalla Palace — the official seat of the Asaf Jah dynasty, the rulers of Hyderabad for over 200 years! The name means "Four Palaces" in Urdu — a reference to the four main palace buildings that surround a magnificent central courtyard. The palace complex was built between 1750 and 1869. The Khilwat Mubarak Durbar Hall is the most magnificent room — its Belgian crystal chandeliers and Italian marble floors reflect the unimaginable wealth of the Nizams. The palace houses vintage Rolls-Royce and state limousines, royal regalia, priceless jewels, and historical documents. This UNESCO Asia-Pacific Heritage Award winner offers a stunning glimpse into royal Hyderabad.',
        te: 'చౌమహల్లా ప్యాలెస్ కు స్వాగతం! ఆసఫ్ జాహీ రాజవంశం యొక్క అధికారిక నివాసం ఇది. 1750 నుండి 1869 వరకు నిర్మించిన ఈ భవన సముదాయంలో నాలుగు ప్రధాన భవనాలు ఉన్నాయి. బెల్జియన్ క్రిస్టల్ ఝాడ్లు మరియు ఇటాలియన్ పాలరాయి నేలలు నిజాం సంపదను చాటుతాయి. వింటేజ్ రోల్స్-రాయ్స్ కార్లు కూడా ఇక్కడ ఉన్నాయి.',
        hi: 'चौमहल्ला पैलेस में आपका स्वागत है! आसफ जाह वंश के 200 से अधिक वर्षों के शासन का यह शाही निवास था। 1750-1869 के बीच बना यह भव्य महल बेल्जियन क्रिस्टल झाड़फानूस और इतालवी संगमरमर के फर्श से सजा है। विंटेज रोल्स-रॉयस कारें और शाही जवाहरात यहां प्रदर्शित हैं।'
      },
      facts: ['UNESCO Asia-Pacific Heritage Award winner 2010', 'Khilwat Mubarak has the finest Belgian crystal chandeliers in India', 'Royal vintage Rolls-Royce and Bentley collection on display', 'Nizam\'s personal jewellery including world-class diamonds', 'Photography allowed — sunset shots of the courtyard are spectacular']
    },
    'hyd-qutb-shahi-tombs': {
      name: 'Qutb Shahi Tombs',
      meta: 'Built 16th–17th Century · 7 Sultans · Shah Jahan visited before Taj Mahal',
      fee: '₹15 (Indian) / ₹200 (Foreign)',
      feeClass: 'badge-amber',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to the Qutb Shahi Tombs — the royal necropolis of the dynasty that built Hyderabad! These magnificent tombs hold the remains of the seven Qutb Shahi sultans who ruled from 1518 to 1687. Each tomb is a domed masterpiece combining Persian, Pathan, and Hindu architectural elements. When Shah Jahan — who would later build the Taj Mahal — visited these tombs as a young prince, he was so moved by their beauty that they reportedly inspired the Taj Mahal\'s design. The tombs rest in a meticulously maintained garden. The largest tomb belongs to Muhammad Quli Qutb Shah, who also founded Hyderabad and built the Charminar.',
        te: 'కుతుబ్ షాహీ సమాధులకు స్వాగతం! హైదరాబాద్ నిర్మించిన రాజవంశం వారి రాజ సమాధులు ఇవి. 7 సుల్తాన్ల సమాధులు ఇక్కడ ఉన్నాయి. పర్షియన్, పఠాన్ మరియు హిందూ నిర్మాణ శైలుల కలయిక అద్భుతంగా ఉంటుంది. తాజ్ మహల్ నిర్మించిన షాజహాన్ ఈ సమాధులను చూసి ప్రేరణ పొందారని చెప్తారు.',
        hi: 'कुतुब शाही मकबरों में आपका स्वागत है! हैदराबाद की स्थापना करने वाले वंश के सात सुल्तानों के मकबरे यहां हैं। ताजमहल बनाने से पहले शाहजहां ने इन मकबरों को देखा था और कहा जाता है कि इनसे ताजमहल का डिजाइन प्रेरित हुआ था।'
      },
      facts: ['Shah Jahan visited these before designing the Taj Mahal', 'Architecture combines Persian, Pathan, and Hindu styles uniquely', 'Largest tomb belongs to Muhammad Quli Qutb Shah — founder of Hyderabad', 'Monuments being restored by Aga Khan Trust for Culture', 'Beautifully lit at night — evening visit highly recommended']
    },
    'hyd-hussain-sagar': {
      name: 'Hussain Sagar Lake & Buddha',
      meta: 'Built 1562 CE · 18m Buddha statue · Heart-shaped lake',
      fee: 'Free (Boat ride extra)',
      feeClass: 'badge-green',
      img: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=800&q=80',
      scripts: {
        en: 'Welcome to Hussain Sagar Lake — the magnificent heart of Hyderabad! Built in 1562 CE by Ibrahim Quli Qutb Shah, this iconic lake is one of the largest artificial lakes in India, spanning over 5 square kilometers. The lake gets its name from Hussain Shah Wali, the nephew of Ibrahim. At the center of the lake stands the 16-meter tall Buddha statue — one of the largest monolithic Buddha statues in the world, weighing 450 tonnes! The statue was installed in 1992 after a dramatic adventure — the boat carrying the statue capsized during installation and the Buddha rested underwater for two years before being successfully raised. Boat rides connect the shore to the statue island.',
        te: 'హుస్సేన్ సాగర్ లేక్ కు స్వాగతం! 1562 లో నిర్మించబడిన ఈ సరస్సు హైదరాబాద్ యొక్క గుండె. 5 చదరపు కిలోమీటర్ల విస్తీర్ణంలో ఉన్న ఈ సరస్సు మధ్యలో 450 టన్నుల బుద్ధ విగ్రహం ఉంది. 1992లో స్థాపించబడిన ఈ బుద్ధుడు ప్రపంచంలోనే అతి పెద్ద ఏకశిల బుద్ధ విగ్రహాలలో ఒకటి.',
        hi: 'हुसैन सागर झील में आपका स्वागत है! 1562 में बनी यह झील हैदराबाद की पहचान है। झील के बीच में 450 टन वजन की 16 मीटर ऊंची बुद्ध प्रतिमा है — दुनिया की सबसे बड़ी अखंड बुद्ध प्रतिमाओं में से एक। 1992 में स्थापना के दौरान प्रतिमा को ले जाने वाली नाव पलट गई थी और बुद्ध दो साल तक पानी में रहे।'
      },
      facts: ['Built 1562 CE — older than many Indian heritage sites', '450-tonne Buddha statue is one of world\'s largest monolithic statues', 'During 1992 installation the statue boat capsized — Buddha was underwater 2 years!', 'Boat rides run 7 AM to 7 PM — ₹60 to 150 per person', 'Best visited at sunset — the lake turns golden and pink']
    }
  },

  init() {
    this.load('hyd-charminar');
  },

  load(id) {
    this.currentId = id;
    const data = this.MONUMENTS[id];
    if (!data) return;
    this.currentData = data;

    const set = (elId, val) => { const e = document.getElementById(elId); if(e) e.innerHTML = val; };
    const setAttr = (elId, attr, val) => { const e = document.getElementById(elId); if(e) e[attr] = val; };

    setAttr('guideImg', 'src', data.img);
    setAttr('guideImg', 'alt', data.name);
    set('guideName', data.name);
    set('guideMeta', data.meta);
    set('guideFee', data.fee);
    document.getElementById('guideFee').className = `badge ${data.feeClass}`;

    this._updateScript();

    // Render facts
    const factsList = document.getElementById('guideFacts');
    if (factsList) {
      factsList.innerHTML = (data.facts || []).map(f => `
        <li style="display:flex;gap:8px;padding:7px 10px;background:var(--bg-surface-2);border-radius:8px;font-size:12px;color:var(--text-secondary);">
          <span style="color:var(--amber);flex-shrink:0;">⭐</span>
          <span>${f}</span>
        </li>
      `).join('');
    }

    // Clear old Q&A
    const ans = document.getElementById('guideAnswer');
    if (ans) { ans.style.display = 'none'; ans.innerHTML = ''; }
    const qi = document.getElementById('guideQ');
    if (qi) qi.value = '';

    // Stop any playing audio
    if (this.speaking) this.stopAudio();
    document.getElementById('btnPlay').textContent = '▶️';
  },

  _updateScript() {
    const data = this.currentData;
    if (!data) return;
    const script = data.scripts[this.currentLang] || data.scripts.en;
    const el = document.getElementById('guideScript');
    if (el) el.textContent = script;
  },

  setLang(lang, btn) {
    this.currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._updateScript();
    if (this.speaking) { this.stopAudio(); this.startAudio(); }
  },

  toggleAudio() {
    if (this.speaking) {
      this.stopAudio();
      document.getElementById('btnPlay').textContent = '▶️';
    } else {
      this.startAudio();
      document.getElementById('btnPlay').textContent = '⏸️';
    }
  },

  startAudio() {
    if (!window.speechSynthesis) { App.toast('Speech not supported in this browser', 'error'); return; }
    const data = this.currentData;
    if (!data) return;
    const script = data.scripts[this.currentLang] || data.scripts.en;

    this.utterance = new SpeechSynthesisUtterance(script);
    this.utterance.lang = this.currentLang === 'te' ? 'te-IN' : this.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    this.utterance.rate = 0.9;
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;

    this.utterance.onend = () => {
      this.speaking = false;
      const btn = document.getElementById('btnPlay');
      if (btn) btn.textContent = '▶️';
    };

    speechSynthesis.speak(this.utterance);
    this.speaking = true;
    App.toast(`🔊 Playing audio in ${this.currentLang === 'te' ? 'Telugu' : this.currentLang === 'hi' ? 'Hindi' : 'English'}`);
  },

  stopAudio() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    this.speaking = false;
  },

  async askQuestion() {
    const q = document.getElementById('guideQ')?.value?.trim();
    if (!q) { App.toast('Please type a question first.', 'error'); return; }
    const ans = document.getElementById('guideAnswer');
    if (ans) {
      ans.style.display = 'block';
      ans.innerHTML = '<span class="spin">⏳</span> Asking Gemini AI...';
    }
    try {
      const data = await ApiClient.askGuide(this.currentId, q, this.currentLang);
      if (ans) ans.innerHTML = `<b>🤖 AI Answer:</b><br><br>${data.answer || 'No answer available.'}`;
    } catch(e) {
      if (ans) ans.innerHTML = '⚠️ Could not fetch answer. Please check your internet connection.';
    }
  }
};
