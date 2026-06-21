import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  cleanProse,
  extractProseSections,
  resolveLanguage,
  validateLanguageOfFile,
  validateProjectLanguages,
} from "../src/detector.mjs";

const FIXTURES_DIR = join(import.meta.dirname || __dirname, "fixtures");

describe("Language Detector - text utilities", () => {
  it("cleanProse removes links, blockquotes, and formatting", () => {
    const text = `
This is a paragraph.
> This is a blockquote which should be stripped out.
Another sentence with a [link target](http://example.com/some/file.md) and some **bold** text.
- A list item with \`inline code\`.
`;
    const cleaned = cleanProse(text);
    expect(cleaned).not.toContain("blockquote");
    expect(cleaned).toContain("Another sentence with a link target");
    expect(cleaned).toContain("bold");
    expect(cleaned).toContain("inline code");
  });

  it("extractProseSections extracts target H2 sections only", () => {
    const text = `---
khai: persona
---
# Persona: Test

## Owner
- Project: Test

## Projection
This is the projection text that we want to check.

## Shadow
This is the shadow text.

## SomethingElse
This should be ignored.
`;
    const sections = extractProseSections(text, ["projection", "shadow"]);
    expect(sections).toHaveLength(2);
    expect(sections[0].header).toBe("Projection");
    expect(sections[0].body.trim()).toBe("This is the projection text that we want to check.");
    expect(sections[1].header).toBe("Shadow");
    expect(sections[1].body.trim()).toBe("This is the shadow text.");
  });
});

describe("Language Detector - resolution and validation", () => {
  beforeAll(() => {
    if (!existsSync(FIXTURES_DIR)) {
      mkdirSync(FIXTURES_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(FIXTURES_DIR)) {
      rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  it("resolveLanguage respects the inheritance chain (house -> play -> file)", () => {
    const projectDir = join(FIXTURES_DIR, "project");
    const playDir = join(projectDir, "plays", "my-play");
    mkdirSync(playDir, { recursive: true });

    // 1. Setup house README (English)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: en
---
# House README
`,
    );

    // 2. Setup play file (no language - should inherit house)
    writeFileSync(
      join(playDir, "play_my-play.md"),
      `---
khai: play
---
# Play: My Play
`,
    );

    // 3. Setup instance file (no language - should inherit play/house)
    const file1 = join(playDir, "persona_one.md");
    writeFileSync(
      file1,
      `---
khai: persona
---
# Persona: One
`,
    );

    expect(resolveLanguage(file1, projectDir)).toBe("english");

    // 4. Override at play level (German)
    writeFileSync(
      join(playDir, "play_my-play.md"),
      `---
khai: play
language: de
---
# Play: My Play
`,
    );
    expect(resolveLanguage(file1, projectDir)).toBe("german");

    // 5. Override at file level (Danish)
    writeFileSync(
      file1,
      `---
khai: persona
language: da
---
# Persona: One
`,
    );
    expect(resolveLanguage(file1, projectDir)).toBe("danish");
  });

  it("validateLanguageOfFile checks allowed languages and handles exceptions", () => {
    const projectDir = join(FIXTURES_DIR, "validation-project");
    const playDir = join(projectDir, "plays", "woyzeck");
    mkdirSync(playDir, { recursive: true });

    // Setup house README (German)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: de
---
`,
    );

    // Setup play file (German)
    writeFileSync(
      join(playDir, "play_woyzeck.md"),
      `---
khai: play
---
`,
    );

    // 1. File in correct language (German)
    const fileCorrect = join(playDir, "persona_correct.md");
    writeFileSync(
      fileCorrect,
      `---
khai: persona
---
# Persona: Correct

## Projection
Franz Woyzeck läuft durch die Gassen der Stadt. Er fühlt sich gehetzt und von den Stimmen gequält. Es brennt ein Feuer am Himmel.
`,
    );

    const errors1 = validateLanguageOfFile(fileCorrect, projectDir);
    expect(errors1).toHaveLength(0);

    // 2. File in incorrect language (English)
    const fileIncorrect = join(playDir, "persona_incorrect.md");
    writeFileSync(
      fileIncorrect,
      `---
khai: persona
---
# Persona: Incorrect

## Projection
Franz Woyzeck runs through the streets of the garrison town. He feels chased and tormented by the voices in his head. A fire burns in the sky.
`,
    );

    const errors2 = validateLanguageOfFile(fileIncorrect, projectDir);
    expect(errors2).toHaveLength(1);
    expect(errors2[0]).toContain("English span");

    // 3. Exception handling (contains forbidden English word, but exempted)
    const fileExempt = join(playDir, "persona_exempt.md");
    writeFileSync(
      fileExempt,
      `---
khai: persona
---
# Persona: Exempt

## Projection
Franz Woyzeck läuft durch die Gassen und spricht über das Wort "garrison town".
`,
    );

    // With word 'garrison town' in text, languagedetect might skew it. Let's make sure exceptions works.
    writeFileSync(
      join(playDir, "language_exceptions.txt"),
      `# comment line
garrison town
`,
    );

    const errors3 = validateLanguageOfFile(fileExempt, projectDir);
    expect(errors3).toHaveLength(0); // Should be skipped/exempted
  });

  it("accepts Italian prose when the house declares Italian (it -> italian)", () => {
    const projectDir = join(FIXTURES_DIR, "italian-project");
    const playDir = join(projectDir, "plays", "commedia");
    mkdirSync(playDir, { recursive: true });

    // House declares Italian; languagedetect knows it, so it gates locally like de/fr.
    writeFileSync(join(projectDir, "README.md"), `---\nlanguage: it\n---\n`);
    writeFileSync(join(playDir, "play_commedia.md"), `---\nkhai: play\n---\n`);

    // 1. Italian prose passes (it normalizes to "italian", the detector's top hit).
    const fileCorrect = join(playDir, "persona_dante.md");
    writeFileSync(
      fileCorrect,
      `---
khai: persona
---
# Persona: Dante

## Projection
Nel mezzo del cammin di nostra vita mi ritrovai per una selva oscura, che la diritta via era smarrita.
`,
    );
    expect(validateLanguageOfFile(fileCorrect, projectDir)).toHaveLength(0);

    // 2. An English span in an Italian house is still flagged.
    const fileIncorrect = join(playDir, "persona_intruder.md");
    writeFileSync(
      fileIncorrect,
      `---
khai: persona
---
# Persona: Intruder

## Projection
In the middle of the journey of our life I found myself within a forest dark, for the straightforward pathway had been lost.
`,
    );
    const errors = validateLanguageOfFile(fileIncorrect, projectDir);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("English span");
  });

  // The reliably-detected European set: languagedetect returns each as the top
  // hit, so a house declaring the code and writing matching prose validates clean.
  it.each([
    [
      "nl",
      "Het was een koude winterdag toen de schaatsers over de bevroren grachten van de oude stad gleden.",
    ],
    [
      "es",
      "En un lugar de la Mancha de cuyo nombre no quiero acordarme vivia un hidalgo de los de lanza en astillero.",
    ],
    [
      "pt",
      "No meio do caminho tinha uma pedra tinha uma pedra no meio do caminho tinha uma pedra cansada.",
    ],
    [
      "sv",
      "Det var en gang en liten flicka som bodde i en by langt uppe i norr nara de stora skogarna.",
    ],
    [
      "no",
      "Det var en gang en liten gutt som bodde i en gard langt inne i den dype norske skogen.",
    ],
    [
      "fi",
      "Olipa kerran pieni tytto joka asui suuren metsan reunalla kaukana pohjoisessa lumisten tunturien keskella maassa.",
    ],
    [
      "pl",
      "Litwo ojczyzno moja ty jestes jak zdrowie ile cie trzeba cenic ten tylko sie dowie kto cie stracil.",
    ],
    [
      "hu",
      "Egyszer volt hol nem volt volt egyszer egy szegeny ember akinek harom fia volt a vilag vegen tul.",
    ],
    [
      "ro",
      "A fost odata ca niciodata un imparat care avea trei feciori si o imparatie mare si bogata peste mari.",
    ],
    [
      "hr",
      "Bio jednom jedan kralj koji je imao tri kceri i svaka je bila ljepsa od one druge u kraljevstvu.",
    ],
    [
      "is",
      "Thad var einu sinni litil stulka sem bjo i litlu husi vid jadar skogarins langt i burtu fra borginni.",
    ],
    [
      "sk",
      "Bol raz jeden kral ktory mal tri dcery a kazda z nich bola krajsia nez ta predchadzajuca v krajine.",
    ],
    [
      "sl",
      "Nekoc je zivel kralj ki je imel tri hcere in vsaka je bila lepsa od prejsnje v vsem kraljestvu velikem.",
    ],
    [
      "sq",
      "Na ishte njehere nje mbret qe kishte tre djem dhe nje mbreteri te madhe e te pasur pertej maleve larg.",
    ],
    [
      "lt",
      "Buvo karta karalius kuris turejo tris dukteris ir kiekviena buvo grazesne uz ankstesne visoje karalysteje toli.",
    ],
    [
      "lv",
      "Reiz dzivoja karalis kuram bija tris meitas un katra no tam bija skaistaka par iepriekslejo visa valstiba liela.",
    ],
    [
      "et",
      "Elas kord kuningas kellel oli kolm tutart ja igauks neist oli kaunim kui eelmine kogu kuningriigis suures.",
    ],
    // Celtic / classical
    [
      "cy",
      "Yr oedd unwaith mewn amser maith yn ol frenin a oedd ganddo dair merch a theyrnas fawr a chyfoethog iawn.",
    ],
    [
      "la",
      "Gallia est omnis divisa in partes tres quarum unam incolunt Belgae aliam Aquitani tertiam qui ipsorum lingua Celtae appellantur.",
    ],
    // Distinct scripts (Middle East / South Asia)
    [
      "ar",
      "كان يا ما كان في قديم الزمان ملك له ثلاث بنات ومملكة كبيرة وغنية وراء البحار والجبال العالية",
    ],
    [
      "fa",
      "روزی روزگاری پادشاهی بود که سه دختر داشت و یک پادشاهی بزرگ و ثروتمند در آن سوی کوه ها داشت",
    ],
    [
      "ur",
      "بہت پرانے زمانے میں ایک بادشاہ تھا جس کی تین بیٹیاں تھیں اور پہاڑوں کے پار ایک بڑی امیر سلطنت تھی",
    ],
    [
      "hi",
      "बहुत समय पहले एक राजा था जिसकी तीन बेटियाँ थीं और पहाड़ों के पार एक बड़ा और समृद्ध राज्य था",
    ],
    [
      "bn",
      "অনেক অনেক দিন আগে এক রাজা ছিলেন তার তিনটি মেয়ে এবং পাহাড়ের ওপারে একটি বিশাল ধনী রাজ্য ছিল",
    ],
    // Central Asia (distinct Cyrillic)
    [
      "kk",
      "Ерте заманда бір патша болыпты оның үш қызы және таулардың арғы жағында үлкен бай патшалығы болыпты",
    ],
    [
      "mn",
      "Эрт урьд цагт нэгэн хаан байж гурван охинтой бөгөөд уулсын цаана том баян улсыг захирдаг байжээ",
    ],
    // Africa / Pacific / Southeast Asia
    [
      "sw",
      "Hapo zamani za kale palikuwa na mfalme aliyekuwa na binti watatu na ufalme mkubwa wenye utajiri mwingi sana sana.",
    ],
    [
      "so",
      "Waa baa jiray boqor wuxuu lahaa saddex gabdhood iyo boqortooyo weyn oo hodan ah meel aad u fog.",
    ],
    [
      "ha",
      "Wata rana akwai wani sarki wanda yake da yan mata uku da kuma babbar masarauta mai arziki bayan tsaunuka masu nisa.",
    ],
    [
      "haw",
      "I ka wa kahiko he moi ka mea nana na kaikamahine ekolu a me ke aupuni nui waiwai ma kela aoao o na mauna.",
    ],
    [
      "id",
      "Pada zaman dahulu kala ada seorang raja yang memiliki tiga orang putri dan sebuah kerajaan yang besar dan kaya raya.",
    ],
    [
      "ceb",
      "Kaniadto adunay usa ka hari nga adunay tulo ka anak nga babaye ug usa ka dako ug adunahan nga gingharian sa unahan.",
    ],
  ])("registers %s and gates its own prose clean", (code, prose) => {
    const projectDir = join(FIXTURES_DIR, `euro-${code}`);
    const playDir = join(projectDir, "plays", "p");
    mkdirSync(playDir, { recursive: true });
    writeFileSync(join(projectDir, "README.md"), `---\nlanguage: ${code}\n---\n`);
    writeFileSync(join(playDir, "play_p.md"), `---\nkhai: play\n---\n`);
    const file = join(playDir, "persona_x.md");
    writeFileSync(file, `---\nkhai: persona\n---\n# Persona: X\n\n## Projection\n${prose}\n`);
    expect(validateLanguageOfFile(file, projectDir)).toHaveLength(0);
  });

  // franc-routed languages: those languagedetect cannot separate but franc gates
  // stably. A house declaring the code and writing matching prose validates clean.
  it.each([
    [
      "nds",
      "Dat weer maal en Keerl de harr dree Dochter un en groot un riek Land achter de hoge Bargen wied weg.",
    ],
    [
      "el",
      "Μια φορά κι έναν καιρό ήταν ένας βασιλιάς που είχε τρεις κόρες και ένα μεγάλο πλούσιο βασίλειο.",
    ],
    [
      "ca",
      "Hi havia una vegada un rei que tenia tres filles i cadascuna era mes bonica que lanterior al regne.",
    ],
    [
      "eu",
      "Bazen behin errege bat hiru alaba zituena eta erresuma handi eta aberats bat mendien beste aldean urrun.",
    ],
    [
      "vi",
      "Ngày xửa ngày xưa có một ông vua có ba người con gái và một vương quốc rộng lớn giàu có.",
    ],
    [
      "tl",
      "Noong unang panahon may isang hari na may tatlong anak na babae at isang malaki at mayamang kaharian sa malayo.",
    ],
    [
      "ne",
      "धेरै पहिले एउटा राजा थिए जसका तीन छोरीहरू थिए र पहाडहरू पारि एउटा ठूलो र धनी राज्य थियो।",
    ],
    [
      "ru",
      "Жил был царь у него было три сына и большое богатое царство за тридевять земель в государстве.",
    ],
    [
      "uk",
      "Жила собі дівчина у маленькій хаті на краю села біля великого темного лісу далеко на півночі.",
    ],
    [
      "mk",
      "Си имало еднаш еден цар кој имал три ќерки и големо богато царство далеку зад високите планини.",
    ],
    [
      "lb",
      "All Mënsch kënnt fräi a mat deer selwechter Dignitéit an deene selwechte Rechter op d'Welt. Jiddereen huet säi Verstand a säi Gewësse krut an soll an engem Geescht vu Bridderlechkeet denen anere géintiwwer handelen.",
    ],
    // Tight-cluster grade: a sibling may top, but the declared language stays
    // within the 0.1 margin, so correct prose still passes (gross-error catch only).
    [
      "bg",
      "Имало едно време един цар който имал три дъщери и голямо богато царство далеч отвъд планините.",
    ],
    [
      "sr",
      "Био једном један цар који је имао три кћери и велико богато царство далеко иза високих планина.",
    ],
    [
      "cnr",
      "Sva ljudska bića rađaju se slobodna i jednaka u dostojanstvu i pravima. Ona su obdarena razumom i savješću i treba da jedni prema drugima postupaju u duhu bratstva i međusobnog razumijevanja.",
    ],
    [
      "tr",
      "Bir zamanlar uc kizi olan bir kral varmis ve daglarin otesinde buyuk ve zengin bir kralligi bulunurmus.",
    ],
    [
      "uz",
      "Bir bor ekan bir yoq ekan bir podsho bor ekan uning uchta qizi va toglar ortida katta boy davlati bor ekan.",
    ],
    // GB: Scottish Gaelic (clean), Irish (Goidelic-cluster grade), Scots (English-cluster grade)
    [
      "gd",
      "Bha righ ann uair a bha tri nigheanan aige agus rioghachd mhor bheairteach thar nam beanntan arda fada air falbh.",
    ],
    [
      "ga",
      "Bhi ri ann fado a raibh triur inionacha aige agus riocht mhor shaibhir thar na sleibhte arda i bhfad i gcein.",
    ],
    [
      "sco",
      "There wis aince a king that haed three dochters an a muckle walthy kinrick ayont the heich braes faur awa frae hame.",
    ],
    // Commonwealth — South Asia (distinct scripts, clean)
    [
      "ta",
      "மனிதப் பிறவியினர் சகலரும் சுதந்திரமாகவே பிறக்கின்றனர்; அவர்கள் மதிப்பிலும் உரிமைகளிலும் சமமானவர்கள். அவர்கள் நியாயத்தையும் மனசாட்சியையும் இயற்பண்பாகப் பெற்றவர்கள். அவர்கள் ஒருவருடனொருவர் சகோதர உணர்வுப் பாங்கில் நடந்துகொள்ளல் வேண்டும் என்பதை நாம் என்றும் மறக்கக் கூடாது.",
    ],
    [
      "te",
      "ప్రతిపత్తిస్వత్వముల విషయమున మానవులెల్లరును జన్మతః స్వతంత్రులును సమానులును నగుదురు. వారు వివేచనాంతఃకరణ సంపన్నులగుటచే పరస్పరము భ్రాతృభావముతో వర్తింపవలయును. ప్రతి మనిషికి జాతి మతం లింగం భాష అనే భేదం లేకుండా అన్ని హక్కులు మరియు స్వేచ్ఛలు కలవు.",
    ],
    [
      "gu",
      "પ્રતિષ્ઠા અને અધિકારોની દૃષ્ટિએ સર્વ માનવો જન્મથી સ્વતંત્ર અને સમાન હોય છે. તેમનામાં વિચારશક્તિ અને અંતઃકરણ હોય છે અને તેમણે પરસ્પર બંધુત્વની ભાવનાથી વર્તવું જોઈએ એમ સૌ માને છે.",
    ],
    [
      "pa",
      "ਸਾਰਾ ਮਨੁੱਖੀ ਪਰਿਵਾਰ ਆਪਣੀ ਮਹਿਮਾ, ਸ਼ਾਨ ਅਤੇ ਹੱਕਾਂ ਦੇ ਪੱਖੋਂ ਜਨਮ ਤੋਂ ਹੀ ਆਜ਼ਾਦ ਹੈ ਅਤੇ ਸੁਤੇ ਸਿੱਧ ਸਾਰੇ ਲੋਕ ਬਰਾਬਰ ਹਨ। ਉਨ੍ਹਾਂ ਸਭਨਾਂ ਨੂੰ ਤਰਕ ਅਤੇ ਜ਼ਮੀਰ ਦੀ ਸੌਗਾਤ ਮਿਲੀ ਹੋਈ ਹੈ।",
    ],
    [
      "si",
      "සියලු මනුෂ්‍යයෝ නිදහස්ව උපත ලබති. තවද ගරුත්වයෙන් හා අයිතිවාසිකම්වලින් සමාන වෙති. යුක්ති අයුක්ති පිළිබඳ හැඟීමෙන් හා හෘදය සාක්ෂියෙන් යුත් ඔවුන්, ඔවුනොවුන්ට සහෝදරත්වයෙන් කටයුතු කළ යුතුය යනු සැමගේ අදහසයි.",
    ],
    // Commonwealth — Africa
    [
      "ig",
      "A muru mmadu nile n'ohere nakwa nha anya ugwu na ikike. E nyere ha uche na mmuo ime ihe ziri ezi nke na ha kwesiri ime ka umunne n'enwekoritaonu otu na ibe ha.",
    ],
    [
      "af",
      "Alle menslike wesens word vry, met gelyke waardigheid en regte, gebore. Hulle het rede en gewete en behoort in die gees van broederskap teenoor mekaar op te tree elke dag van hul lewe.",
    ],
    // Nguni pair: each tops its own prose; the sibling stays within the 0.1 margin.
    [
      "zu",
      "Bonke abantu bazalwa bekhululekile belingana ngesithunzi nangamalungelo. Bahlanganiswe wumcabango nangunembeza futhi kufanele baphathane ngomoya wobunye nobuzalwane kuyo yonke imihla yokuphila kwabo emhlabeni.",
    ],
    [
      "xh",
      "Bonke abantu bazalwa bekhululekile belingana ngesidima nangokwamalungelo. Bonke abantu banesiphiwo sengqiqo nesazela kwaye bamele baphathane ngomoya wobuzalwana kuyo yonke imihla yobomi babo.",
    ],
    // Commonwealth — Southeast Asia (Malay via franc's `zlm`)
    [
      "ms",
      "Semua manusia dilahirkan bebas dan samarata dari segi kemuliaan dan hak-hak. Mereka mempunyai pemikiran dan perasaan hati dan hendaklah bertindak di antara satu sama lain dengan semangat persaudaraan yang sejati.",
    ],
    // Commonwealth — Pacific
    [
      "mi",
      "Ko te katoa o nga tangata i te whanautanga mai e watea ana i nga here katoa; e taurite ana hoki nga mana me nga tika. E whakawhiwhia ana hoki ki a ratou te ngakau whai whakaaro me te hinengaro tangata.",
    ],
    [
      "fj",
      "Era sucu ena galala na tamata yadua, era tautauvata ena nodra dokai kei na nodra dodonu. E tiko na nodra vakasama kei na nodra lewaeloma, ia e dodonu mera veidokai ena yalo ni veitacini.",
    ],
    [
      "sm",
      "O tagata soifua uma ua saoloto lo latou fananau mai, e tutusa foi o latou tulaga aloaia ma a latou aia tatau. Ua faaeeina atu i a latou le mafaufau lelei ma le loto fuatiaifo ma e tatau ona faatino le agaga faauso.",
    ],
    [
      "to",
      "Ko e kotoa ʻo e fanau ʻa e tangata ʻoku fanauʻi mai ʻoku tauʻatāina pea tatau ʻi he ngeia mo e ngaahi totonu. Naʻe foaki kiate kinautolu ʻa e ʻatamai mo e konisenisi pea ʻoku totonu ke nau feʻofaʻaki ʻi he laumālie ʻo e nofo fakatautehina.",
    ],
  ])("franc-routes %s and gates its own prose clean", (code, prose) => {
    const projectDir = join(FIXTURES_DIR, `franc-${code}`);
    const playDir = join(projectDir, "plays", "p");
    mkdirSync(playDir, { recursive: true });
    writeFileSync(join(projectDir, "README.md"), `---\nlanguage: ${code}\n---\n`);
    writeFileSync(join(playDir, "play_p.md"), `---\nkhai: play\n---\n`);
    const file = join(playDir, "persona_x.md");
    writeFileSync(file, `---\nkhai: persona\n---\n# Persona: X\n\n## Projection\n${prose}\n`);
    expect(validateLanguageOfFile(file, projectDir)).toHaveLength(0);
  });

  it("flags an English span in a franc-routed (Russian) house", () => {
    const projectDir = join(FIXTURES_DIR, "franc-ru-wrong");
    const playDir = join(projectDir, "plays", "p");
    mkdirSync(playDir, { recursive: true });
    writeFileSync(join(projectDir, "README.md"), `---\nlanguage: ru\n---\n`);
    writeFileSync(join(playDir, "play_p.md"), `---\nkhai: play\n---\n`);
    const file = join(playDir, "persona_x.md");
    writeFileSync(
      file,
      `---\nkhai: persona\n---\n# Persona: X\n\n## Projection\nIn the middle of the journey of our life I found myself within a forest dark and deep.\n`,
    );
    const errors = validateLanguageOfFile(file, projectDir);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/expected: rus/);
  });

  it("validateLanguageOfFile skips library check on NLP fallback languages", () => {
    const projectDir = join(FIXTURES_DIR, "nlp-project");
    const playDir = join(projectDir, "plays", "igbo-play");
    mkdirSync(playDir, { recursive: true });

    // Setup house README (Igbo)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: ig
---
`,
    );

    const fileIgbo = join(playDir, "persona_igbo.md");
    writeFileSync(
      fileIgbo,
      `---
khai: persona
---
# Persona: Igbo

## Projection
Kedu ka ị mere? Obi ụtọ na-arụ ọrụ a.
`,
    );

    // Should skip check and return no errors
    const errors = validateLanguageOfFile(fileIgbo, projectDir, { nlpLanguages: ["ig"] });
    expect(errors).toHaveLength(0);
  });

  it("validateLanguageOfFile fails immediately for unregistered languages", () => {
    const projectDir = join(FIXTURES_DIR, "unregistered-project");
    const playDir = join(projectDir, "plays", "unknown-play");
    mkdirSync(playDir, { recursive: true });

    // Setup house README (unregistered language 'cs' — Czech genuinely false-fails
    // under both engines (ces -> hrv), so it is in no map and is exempt-only: it
    // must be declared via khai.languages, not auto-registered).
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: cs
---
`,
    );

    const fileUnknown = join(playDir, "persona_unknown.md");
    writeFileSync(
      fileUnknown,
      `---
khai: persona
---
# Persona: Unknown
`,
    );

    const errors = validateLanguageOfFile(fileUnknown, projectDir);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("Language 'cs' is not registered");
  });

  it("validateProjectLanguages resolves nlpLanguages dynamically from package.json", () => {
    const projectDir = join(FIXTURES_DIR, "dynamic-package-project");
    const playDir = join(projectDir, "plays", "igbo-play");
    mkdirSync(playDir, { recursive: true });

    // Setup package.json with khai.languages: ["ig"]
    writeFileSync(
      join(projectDir, "package.json"),
      JSON.stringify({
        name: "test-house",
        version: "1.0.0",
        khai: {
          languages: ["ig"],
        },
      }),
    );

    // Setup house README (Igbo)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: ig
---
`,
    );

    const fileIgbo = join(playDir, "persona_igbo.md");
    writeFileSync(
      fileIgbo,
      `---
khai: persona
---
# Persona: Igbo

## Projection
Kedu ka ị mere? Obi ụtọ na-arụ ọrụ a.
`,
    );

    // When validateProjectLanguages is run without options.nlpLanguages,
    // it should read "ig" from package.json and skip library checks (meaning 0 errors).
    const results = validateProjectLanguages(projectDir);
    expect(results).toHaveLength(0);
  });
});

// An ISO-coded nlp language ("fr") must route the resolved "french" to the
// NLP/LLM fallback (PR #289). Dormant until the normalization fix lands on main
// -- probe src/detector.mjs for it, per the cli.test.mjs convention.
const NLP_DORMANT = !readFileSync(
  join(import.meta.dirname || __dirname, "..", "src", "detector.mjs"),
  "utf8",
).includes("map((s) => normalizeLanguage(s))");

describe.skipIf(NLP_DORMANT)("Language Detector - nlpLanguages normalization", () => {
  beforeAll(() => {
    if (!existsSync(FIXTURES_DIR)) mkdirSync(FIXTURES_DIR, { recursive: true });
  });
  afterAll(() => {
    if (existsSync(FIXTURES_DIR)) rmSync(FIXTURES_DIR, { recursive: true, force: true });
  });

  it("routes an ISO-coded nlp language (fr) to the fallback for resolved french", () => {
    const projectDir = join(FIXTURES_DIR, "nlp-fr");
    const playDir = join(projectDir, "plays", "p");
    mkdirSync(playDir, { recursive: true });
    writeFileSync(join(projectDir, "README.md"), `---\nlanguage: fr\n---\n`);
    const file = join(playDir, "persona_x.md");
    writeFileSync(
      file,
      `---
khai: persona
---
# Persona: X

## Projection
Voici une longue phrase en francais qui contient assez de mots pour exercer le detecteur local ici.
`,
    );

    const logs = [];
    const original = console.log;
    console.log = (...a) => logs.push(a.join(" "));
    let errors;
    try {
      errors = validateLanguageOfFile(file, projectDir, { nlpLanguages: ["fr"] });
    } finally {
      console.log = original;
    }

    // "fr" normalizes to "french", matches the resolved language, and skips the
    // local check via the NLP fallback.
    expect(errors).toEqual([]);
    expect(logs.some((l) => /\[NLP Fallback\].*french/.test(l))).toBe(true);
  });
});

// findPlayFile must stay within the project, not walk a sibling that shares
// root's textual prefix (PR #302). Dormant until the fix lands -- probe
// src/detector.mjs for the path-relative boundary check.
const BOUNDARY_DORMANT = !readFileSync(
  join(import.meta.dirname || __dirname, "..", "src", "detector.mjs"),
  "utf8",
).includes("relative(root, current)");

describe.skipIf(BOUNDARY_DORMANT)("Language Detector - project boundary", () => {
  const base = join(FIXTURES_DIR, "boundary");
  beforeAll(() => {
    mkdirSync(join(base, "proj"), { recursive: true });
    mkdirSync(join(base, "proj2"), { recursive: true });
    // proj2 is a sibling sharing proj's textual prefix; it has a French play.
    writeFileSync(join(base, "proj2", "play_x.md"), `---\nkhai: play\nlanguage: fr\n---\n`);
    writeFileSync(join(base, "proj2", "persona_x.md"), `---\nkhai: persona\n---\n# Persona: X\n`);
  });
  afterAll(() => rmSync(base, { recursive: true, force: true }));

  it("does not resolve a play from a sibling that shares root's prefix", () => {
    // Validate proj2's persona with projectPath = proj. The old startsWith check
    // walked into proj2 and picked up its French play; now proj2 is out of scope.
    expect(resolveLanguage(join(base, "proj2", "persona_x.md"), join(base, "proj"))).toBe(
      "english",
    );
  });
});
