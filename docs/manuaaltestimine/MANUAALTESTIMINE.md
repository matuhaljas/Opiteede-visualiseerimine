# Manuaaltestimise raport — Õpiteede visualiseerimine

**Testija:** automaatne manuaaltestimine (Playwright)
**Kuupäev:** 2026-06-20
**Testitud keskkond:** tootmis-demo — <https://opiteede-visualiseerimine-uvhe.onrender.com>
**Brauser:** Chromium (Playwright)
**Vaated:** Lauaarvuti 1366×768 ja 1034px laius, Mobiil 375×812

> **Märkus skoobi kohta:** Google'iga sisselogimine nõuab päris Google'i kontot, mistõttu **sisselogimise-järgseid kaitstud vaateid** (Töölaud, õppekava redigeerimine, jagamine, import/eksport, märkmed) ei õnnestunud selle testi raames katta. Testitud said kõik **avalikud vaated**, marsruutimine (routing), juurdepääsukontroll ja sisselogimise voo *käivitumine*. Kaitstud osade testimiseks vt allpool „Veel testimata" jaotist.

---

## Kokkuvõte

| Raskusaste | Arv |
|---|---|
| 🔴 Kõrge | 3 |
| 🟠 Keskmine | 6 |
| 🟡 Madal / kosmeetiline | 7 |
| ✅ Korras | palju (vt allpool) |

> **Uuendus (2026-06-20):** kaitstud (sisselogimist nõudvad) osad on nüüd **päriselt läbi testitud** testkontoga (`ukukurm@tlu.ee`). Põhivoog töötab — sisselogimine, õppekava loomine/redigeerimine, ühikute lisamine, eksport, otsing, mikro-vaade ja kustutamine toimivad. Leiti aga mitu uut probleemi: **avaliku jagamise funktsioon on ühendamata**, **vigane e-post jagamisel annab 500-vea** ja **uuele ühikule ei saa ainet määrata**. Testandmed (üks testõppekava) loodi ja kustutati testimise käigus — püsivaid jälgi ei jäänud. Üksikute testjuhtumite tulemused on täidetud allpool olevates tabelites.

Rakenduse avalik pool töötab üldjoontes hästi: esileht, login-leht ja visualiseeringud renderduvad korrektselt, kaitstud teede juurdepääsukontroll toimib ja konsool on puhas (välja arvatud Firebase'i COOP-hoiatus). Sisselogimise-järgne põhifunktsionaalsus (CRUD, eksport, otsing, visualiseeringud) toimib. Peamised probleemid on **testlehtede avalik kättesaadavus tootmises**, **puuduv 404-leht**, **ühendamata avalik jagamine** ja paar serveripoolset/valideerimise viga.

---

## 🔴 Kõrge prioriteet

### H1 — Test-/arenduslehed on tootmises avalikult kättesaadavad ilma sisselogimiseta
Marsruudid `/project`, `/test-project`, `/test-project2`, `/test-project3` on `App.jsx`-is **ilma `ProtectedRoute` kaitseta** ja avanevad tootmises igaühele.

- `/test-project` → renderdab 3D-spiraalvaate näidisandmetega (vt `test-project.png`)
- `/test-project2` → spiraalvaade koos „Kooliaste" legendi ja „Lähtesta vaade" nupuga (`test-project2-mobile.png`)
- `/test-project3` → spiraalvaade (`test-project3-desktop.png`)

**Miks oluline:** arendus-/prototüübilehed ei tohiks tootmises eksponeeritud olla — need võivad sisaldada lõpetamata funktsionaalsust, näidisandmeid või paljastada siseloogikat. Lisaks tekitab see kasutajale segadust.
**Soovitus:** eemalda testlehed tootmis-buildist või pane need `ProtectedRoute` taha; pikemas plaanis kustuta `TestProjectPage*.jsx` failid, kui need on vaid arenduse jäänukid.

### H2 — Olematu marsruut kuvab täiesti tühja lehe (404-leht puudub)
URL `…/see-lehte-ei-ole-olemas-123` (ja iga muu tundmatu tee) renderdab **valge tühja lehe**. Konsoolis: `No routes matched location "/..."`. `App.jsx`-is puudub catch-all marsruut (`<Route path="*" …>`).

**Miks oluline:** kasutaja, kes satub katkisele/aegunud lingile, näeb tühja akent ilma igasuguse selgituse või väljapääsuta — halb kasutuskogemus ja jätab mulje, et sait on katki.
**Soovitus:** lisa 404-marsruut sõbraliku veateate ja „Tagasi avalehele" lingiga, nt `<Route path="*" element={<NotFound />} />`.

### H3 — „Avalik juurdepääs" (avalik jagamine) on funktsionaalselt ühendamata 🆕
README lubab „Avalik jagamislink anonüümseks vaatamiseks", kuid jagamismodaali „Avalik juurdepääs" lüliti **ei tee tegelikult midagi**:

1. **Lüliti ei salvesta backendi.** `NewCurriculum.jsx:412` — `onClick={() => setPublicAccess(!publicAccess)}` muudab ainult kohalikku React-i olekut. Lülitamisel **ei saadetud ühtegi võrgupäringut** (kinnitatud network-logist — `PATCH /api/curricula/{id}/shares/public` ei käivitu kunagi, kuigi backendis see otspunkt eksisteerib).
2. **Ühtegi jagamislinki ei kuvata.** Isegi kui lüliti on „sees" (sinine), ei teki kuhugi kopeeritavat URL-i (vt `share-public-on.png`). Kasutajal pole midagi jagada.
3. **Avaliku vaate marsruut puudub.** `App.jsx`-is pole avalikku/anonüümset vaateteed (nt `/public/:id`), seega isegi käsitsi koostatud lingiga ei saaks anonüümselt vaadata.

**Miks oluline:** üks README-s reklaamitud põhifunktsioonidest ei ole kasutatav. (Kolleegide kutsumine e-postiga **toimib** — see on eraldi mehhanism, vt allpool.)
**Soovitus:** ühenda lüliti `PATCH /shares/public` otspunktiga, kuva pärast aktiveerimist kopeeritav link ja lisa `App.jsx`-i avalik vaatemarsruut.

---

## 🟠 Keskmine prioriteet

### M4 — Vigase e-postiga jagamiskutse annab HTTP 500 (serveri sisemine viga) 🆕
Jagamismodaalis e-posti väljale mittevaliidse aadressi (`mitte-korrektne-email`) sisestamine ja „+ Lisa" vajutamine tagastab `POST /api/curricula/{id}/shares/invite` → **500**, sisuga `{"error":"Sisemine viga"}`. Kasutajale kuvatakse alert „Kutse saatmine ebaõnnestus (500): …".

**Miks oluline:** e-posti formaati ei valideerita ei kliendis ega serveris graatsiliselt — server „kukub" 500-ga, selle asemel et tagastada 400 ja selge teade. 500-vead viitavad käsitlemata erindile (tõenäoliselt e-kirja parsimine/saatmine).
**Soovitus:** valideeri e-posti formaat kliendis enne saatmist; backendis tagasta 400 selge sõnumiga, mitte 500.

### M5 — Jagamiskutse blokeerub sünkroonsel e-kirja saatmisel (pikk ootamine, tagasiside puudub) 🆕
Kehtiva e-postiga (`test@example.com`) kutse: `POST …/shares/invite` **ripus üle minuti** enne kui tagastas 201 ja kuvas „Kutse saadetud". Selle aja jooksul ei olnud UI-s **mingit laadimisindikaatorit** ja e-posti väli jäi täidetuks (võib jätta mulje, et nupp ei töötanud → topeltklikid).

**Miks oluline:** kutse loomine ootab sünkroonselt SMTP-vastust ilma timeoutita; aeglase/kättesaamatu postiserveri korral ripub päring kaua. Halb UX ja koormab serveriniiti.
**Soovitus:** saada e-kiri asünkroonselt (taustatöö/queue), lisa timeout ja kuva nupul laadimisolek + blokeeri topeltsaatmine.

### M6 — Uuele ühikule ei saa ainet määrata (muna-kana probleem) 🆕
Ühiku lisamise vormis on „Aine *" märgitud kohustuslikuks, kuid rippmenüü täidetakse **ainult juba olemasolevatest ühikutest tuletatud ainetest** (`NewCurriculum.jsx:572–574`, `allSubjects`). Uue **tühja** õppekava esimese ühiku puhul on ainus valik „-- Vali aine --" (väärtus `""`). Vaba teksti sisestus puudub.

Tagajärg: esimene ühik salvestatakse alati **ilma aineta** (`subject: ""`), mis kuvatakse kui „Määramata" (kinnitatud nii UI-s kui eksporditud JSON-is). „Aine *" kohustuslikkus ei ole ka valideeritud — `lisaYhik` kontrollib ainult pealkirja.

**Miks oluline:** aine on visualiseeringu (värvid, grupeerimine) alus; ilma selleta langevad ühikud „Määramata" alla ja õppekava struktuur kaob.
**Soovitus:** luba „Aine" väljal vaba teksti sisestus (nt combobox + „lisa uus aine"), või eemalda eksitav `*`, kui aine pole tegelikult kohustuslik.

### M1 — `<html lang="en">`, kuid sisu on eestikeelne
`frontend/index.html` real 2 on `lang="en"`, samas kui kogu rakenduse sisu on eesti keeles.

**Miks oluline:** ekraanilugejad valivad vale häälduskeele; mõjutab ligipääsetavust (WCAG 3.1.1) ja SEO-d.
**Soovitus:** `<html lang="et">`.

### M2 — Firebase'i sisselogimisel COOP-konsoolivead
Login-nupule vajutamisel ilmub konsooli korduvalt:
`Cross-Origin-Opener-Policy policy would block the window.closed call.`

**Miks oluline:** see on tuntud `signInWithPopup` + COOP-päiste konflikt. Praegu popup avaneb (voog käivitub), kuid teatud brauserites/seadetes võib see takistada rakendusel tuvastada popupi sulgemist, mis jätab sisselogimise „rippuma".
**Soovitus:** kaalu `signInWithRedirect` kasutamist või sea hostingus COOP-päis väärtusele `same-origin-allow-popups`. Vajab kontrollimist päris sisselogimisega.

### M3 — Spiraalvaate algkaadristus on paigast ära
`/test-project3` avaneb liiga sisse suumituna / nihkes — visualiseering on serva taha lõigatud ega mahu vaatesse (vt `test-project3-desktop.png`). „Lähtesta vaade" nupp parandab olukorra, aga **algvaade peaks olema juba korrektne**.

**Miks oluline:** kasutaja näeb esmalt katkist/tühjavõitu pilti ega pruugi taibata vaadet lähtestada.
**Soovitus:** sea kaamera algasend nii, et terve spiraal mahub ekraanile (fit-to-view laadimisel).

---

## 🟡 Madal / kosmeetiline

- **L1 — Login-nupu tekst murdub mobiilis kolmele reale** („Logi / sisse / Googlega"), Google'i ikoon jääb vertikaalselt keskele (`home-mobile.png`). Soovitus: `white-space: nowrap` või laiem nupp / väiksem font mobiilis.
- **L2 — „Kooliaste" legendi järjekord on ebaloogiline** (1, 3, 5, 7, 2, 4, 6, 8, 10, 12, 9, 11) — pole sorteeritud kasvavalt (`test-project2-mobile.png`). Soovitus: sorteeri klassid numbriliselt.
- **L3 — Mobiilis ulatub spiraalvaade legendi alt välja** ja osa graafist jääb legendi taha (`test-project2-mobile.png`). Soovitus: responsiivne paigutus / legendi kokkupanek mobiilis.
- **L4 — Puudub meta-kirjeldus (`<meta name="description">`)** `index.html`-is. Väike SEO/jagamise miinus.
- **L5 — Tühja pealkirjaga „Lisa" ei anna tagasisidet** 🆕. Ühiku lisamine tühja kohustusliku väljaga (pealkiri) lihtsalt ei tee midagi — veateadet ega välja esiletõstu ei kuvata. Sama kehtib õppekava loomisel tühja nimega. Soovitus: kuva valideerimisteade.
- **L6 — „Avalik juurdepääs" lüliti pole ligipääsetav** 🆕. See on mitte-semantiline `<div class="toggle">` `onClick`-iga (`NewCurriculum.jsx:412`) — pole `role="switch"`, pole klaviatuuriga fookustatav ega aktiveeritav. Soovitus: kasuta `<button>`/`<input type="checkbox">` korrektse `aria`-ga.
- **L7 — Eksport annab ainult tavalise JSON-i, mitte JSON-LD-d** 🆕. README mainib eksporti „JSON, JSON-LD", kuid redigeerimisvaate „Ekspordi" nupp tootis ainult tavalise JSON-i (`eksport-naidis.json`); JSON-LD valikut UI-s ei leitud. Soovitus: lisa JSON-LD ekspordivalik või täpsusta README-d.

---

## ✅ Toimib korrektselt

- **Esileht** (lauaarvuti + mobiil): renderdub puhtalt, kaart tsentreeritud, ükski konsooliviga (`home-desktop.png`, `home-mobile.png`).
- **Login-leht** (`/login`): pealkiri, Google-nupp ja „Tagasi Avalehele" link on olemas ja korrektsed.
- **Kaitstud teede juurdepääsukontroll:** `/dashboard` ilma sisselogimiseta suunab automaatselt avalehele (`/`) — `ProtectedRoute` toimib ootuspäraselt.
- **Google'i sisselogimise voog käivitub:** nupuvajutus avab korrektse Firebase/Google OAuth popup-akna õigete parameetritega.
- **Konsool on muidu puhas:** avalikel lehtedel ei esinenud JS-vigu (v.a M2 COOP-hoiatus); spiraalvaate `[LOG]`-read on arendusjäägid, mitte vead.

**Logimisjärgsed (testkontoga kinnitatud) 🆕:**

- **Google'iga sisselogimine** õnnestub ja suunab töölauale; kuvatakse „Tere tulemast, {nimi}".
- **Töölaud:** õppekavade loend, KnowBit/SkillBit arvud ja „Viimati muudetud" kuupäev (et-EE) on korrektsed (`dashboard.png`).
- **Õppekava loomine:** modaal → POST `/api/curricula` → suunab `/new/{id}`-le. Tühi nimi ei loo midagi.
- **Ühiku (KnowBit) lisamine:** salvestub (POST `/api/knowbits`), arv uueneb, andmed püsivad (kinnitatud eksordis ja mikro-vaates).
- **Eksport (JSON):** laeb alla korrektse, täieliku JSON-i kõigi väljadega (`eksport-naidis.json`).
- **Mikro-vaade (Õpitee Graaf):** kuvab ühikud klasside kaupa, tüübisildi ja ainega (`mikro-graph.png`).
- **Otsing:** filtreerib ühikuid; tulemuse puudumisel selge teade „Ühikuid ei leitud.".
- **Kolleegi kutse kehtiva e-postiga:** õnnestub (201) ja kuvab kinnituse (kuigi aeglaselt — vt M5).
- **Õppekava kustutamine:** küsib kinnitust („Kas oled kindel…"), kinnitusel eemaldab kaardi.
- **Väljalogimine / juurdepääsukontroll:** `ProtectedRoute` toimib (`/dashboard` ilma JWT-ta → suunab).

---

## Veel testimata / käsitsi kinnitamiseks

Allolev jäi automaattestis katmata — soovitan käsitsi kontrollida:

1. **Import** (JSON / JSON-LD): vigase faili import, suure faili import, ümar-teekonna korrektsus (eksport → import). *(Eksport sai testitud; import mitte.)*
2. **Rollipõhised õigused praktikas:** kutsu päris teine konto VIEWER/CONTRIBUTOR/ADMIN rollidega ja kontrolli, mida igaüks tegelikult teha saab (TC-5.2–5.4).
3. **Ühiku muutmine ja kustutamine** (TC-2.5–2.6): testitud sai ainult lisamine.
4. **Spiraalvaate (makro) interaktsioonid päris andmetega:** hover-info, suum/pööramine, „Lähtesta vaade" (nõuab mitut ühikut mitmes klassis).
5. **JWT servajuhtumid:** aegunud token (TC-6.1), backend cold-start, võõra õppekava 403 (TC-6.5).
6. **OAuth popupi sulgemine** (TC-6.4) ja **brauseriühilduvus** (TC-7.x): Firefox/Safari/Edge.

---

## Testitud marsruutide tabel

| Marsruut | Oodatav | Tulemus |
|---|---|---|
| `/` | Esileht login-nupuga | ✅ |
| `/login` | Login-leht | ✅ |
| `/dashboard` | Suunab avalehele (kaitstud) | ✅ suunab `/` |
| `/project`, `/test-project`, `/test-project2`, `/test-project3` | Peaks olema kaitstud / eemaldatud | 🔴 avalikult ligi (H1) |
| `/see-lehte-ei-ole-olemas-123` | 404-leht | 🔴 tühi leht (H2) |

---

# Testjuhtumite mall — kaitstud (sisselogimist nõudvad) kasutuslood

> **Kuidas kasutada:** logi enne testimist Google'iga sisse. Mängi iga juhtum samm-sammult läbi ja täida lahtrid **„Tegelik tulemus"** ja **„Staatus"** (✅ / ❌ / ⚠️). Märgi `❌` puhul juurde kuupäev ja brauser.
>
> **Tulemused täidetud 2026-06-20** testkontoga `ukukurm@tlu.ee` (Chromium, Playwright). Tühjaks jäänud lahtrid = veel käsitsi kontrollida.
>
> **Üldised eeldused (kõik juhtumid):** kasutaja on Google'iga sisse logitud, kehtiv JWT on `localStorage`-is, backend on ärganud (Render cold-start võib esimesel päringul võtta ~30 s).

## 1. Töölaud (`/dashboard`)

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-1.1 | Ava `/dashboard` sisse logituna | Kuvatakse „Tere tulemast, {nimi}", „Minu Projektid" ja „Minuga jagatud projektid" sektsioonid | Kuvati „Tere tulemast, Uku Siim Kurm" + mõlemad sektsioonid | ✅ |
| TC-1.2 | Vaata olemasolevat õppekava kaarti | Näha nimi, „Viimati muudetud" kuupäev (et-EE formaat), õiged KnowBits/SkillBits arvud (mitte alati 0) | Nimi, kuupäev (nt 19.6.2026), arvud korrektsed (loodud ühik kajastus „1 KnowBits") | ✅ |
| TC-1.3 | Vajuta „+ Uus õppekava" | Avaneb modaal nimeväljaga | Modaal avanes | ✅ |
| TC-1.4 | Jäta nimi tühjaks, vajuta „Loo" | Midagi ei juhtu (loomine ei käivitu tühja nimega) | Ei juhtunud midagi (modaal jäi avatuks) | ✅ |
| TC-1.5 | Sisesta nimi, vajuta „Loo" (või Enter) | Õppekava luuakse, suunatakse `/new/{id}` lehele | Loodi, suunati `/new/43`-le | ✅ |
| TC-1.6 | Vajuta kaardil ✕ → kinnita dialoog | Küsitakse kinnitust; „OK" järel kaart kaob loendist | Confirm-dialoog ilmus, kinnitamisel kaart kadus | ✅ |
| TC-1.7 | Vajuta kaardil ✕ → tühista dialoog | Õppekava jääb alles | — | ⏳ käsitsi |
| TC-1.8 | Kliki õppekava kaardile (mitte ✕-le) | Avaneb `/new/{id}` redigeerimisvaade | Kaudselt kinnitatud (loomine suunas redigeerimisvaatesse) | ✅ |
| TC-1.9 | Vajuta „Logi välja" | JWT eemaldatakse, suunatakse avalehele `/`; `/dashboard` enam ligi ei pääse | Juurdepääsukontroll kinnitatud (`/dashboard` ilma JWT-ta suunab); nuppu ennast ei vajutatud, et sessiooni hoida | ⚠️ osaliselt |
| TC-1.10 | Kui ühtegi jagatud projekti pole | Kuvatakse tekst „Sinuga pole veel ühtegi projekti jagatud." | Tekst kuvati | ✅ |

## 2. Õppekava redigeerimine ja ühikud (`/new/:id`)

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-2.1 | Ava õppekava | Laetakse olemasolevad KnowBitid ja SkillBitid backendist | GET `/api/knowbits` + `/api/skillbits` käivitusid, vaade laadis | ✅ |
| TC-2.2 | Lisa KnowBit (pealkiri, kirjeldus, aine, klass, süvenemistase, olulisus, märkmed) | Ühik salvestatakse (POST `/api/knowbits`), ilmub vaatesse, vorm tühjeneb | Salvestus 201, arv → „1 KnowBits". **MÄRKUS:** „Aine" jäi tühjaks (vt M6) | ⚠️ vt M6 |
| TC-2.3 | Lisa SkillBit (vali tüüp „skillbit") | Salvestatakse POST `/api/skillbits`, ilmub vaatesse | — | ⏳ käsitsi |
| TC-2.4 | Lisa ühik ilma pealkirjata | Valideerimine takistab või kuvab veateate (pealkiri kohustuslik) | Lisamine takistati, kuid **veateadet ei kuvatud** (vt L5) | ⚠️ vt L5 |
| TC-2.5 | Muuda olemasolevat ühikut ja salvesta | Muudatus püsib pärast lehe värskendamist | — | ⏳ käsitsi |
| TC-2.6 | Kustuta ühik | Ühik kaob vaatest ja backendist | — (kustutati terve õppekava, mitte üksik ühik) | ⏳ käsitsi |
| TC-2.7 | Lisa ühikule märge/notes ja salvesta | Märkmed säilivad | Märge „Testmärge…" salvestus (kinnitatud eksordis) | ✅ |
| TC-2.8 | Kasuta otsingut (`otsing`) | Kuvatakse ainult vastavad ühikud | „zzzznotexist" → „Ühikuid ei leitud."; „Murrud" → ühik jäi nähtavale | ✅ |
| TC-2.9 | Lülita filtreid (KnowBitid / SkillBitid / seosed) | Visualiseering peidab/näitab vastavaid elemente | — | ⏳ käsitsi |
| TC-2.10 | Filtreeri aine järgi (ainete filter-riba) | Kuvatakse ainult valitud aine ühikud | Filter-riba kuvati („Kõik ained / Määramata"); klikkimist ei testitud | ⏳ käsitsi |

## 3. Visualiseeringud (spiraal + õpitee-graaf päris andmetega)

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-3.1 | Vaata spiraalvaadet õppekava sees | Ühikud paigutatud spiraalile kooliastmete kaupa, õiged värvid/legend | Renderdus 1 ühikuga; täielik kontroll nõuab mitut ühikut | ⏳ käsitsi |
| TC-3.2 | Hoia kursorit ühiku peal (hover) | Kuvatakse ühiku info (pealkiri/kirjeldus) | — (hover'it 3D-canvas'el ei automatiseeritud) | ⏳ käsitsi |
| TC-3.3 | Suumi rulliga, pööra (vasak klikk), liiguta (parem klikk) | Vaade reageerib sujuvalt, ei jää kinni | — | ⏳ käsitsi |
| TC-3.4 | Vajuta „Lähtesta vaade" | Kaamera taastub algasendisse, terve graaf mahub ekraanile | Nupp olemas; vt ka M3 (algkaadristus) | ⏳ käsitsi |
| TC-3.5 | Lülitu õpitee-graafi (mikro) vaatele | Kuvatakse valitud teema eeltingimused ja väljundid | Mikro = nimekirjavaade klasside kaupa; ühik kuvati õigesti (`mikro-graph.png`) | ✅ |
| TC-3.6 | Ava õppekava ilma ühikuteta | Tühi/„andmeid pole" olek, mitte viga ega tühi valge ekraan | Tühi õppekava avanes ilma veata (juhisetekst kuvati) | ✅ |

## 4. Import / eksport (JSON, JSON-LD)

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-4.1 | Ekspordi õppekava (JSON) | Allalaaditakse korrektne JSON-fail kõigi ühikutega | `TEST_Claude_manuaaltest.json` laaditi; sisu valiidne ja täielik (`eksport-naidis.json`) | ✅ |
| TC-4.2 | Ekspordi JSON-LD | Allalaaditav fail on valiidne JSON-LD | „Ekspordi" andis ainult tavalise JSON-i; JSON-LD valikut ei leitud (vt L7) | ❌ |
| TC-4.3 | Impordi varem eksporditud fail | Ühikud taastatakse korrektselt (eelvaade enne kinnitamist) | — (faili valimine nõuab OS-dialoogi) | ⏳ käsitsi |
| TC-4.4 | Impordi vigane/katkine JSON | Kuvatakse selge veateade, rakendus ei „ku ku" | — | ⏳ käsitsi |
| TC-4.5 | Impordi vale struktuuriga JSON (puuduvad väljad) | Veateade või väljade vahelejätmine, mitte krahh | — | ⏳ käsitsi |
| TC-4.6 | Impordi väga suur fail (nt 500+ ühikut) | Import õnnestub või kuvab edenemist; UI ei hangu lõplikult | — | ⏳ käsitsi |

## 5. Jagamine ja õigused

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-5.1 | Ava jagamismodaal, kutsu e-postiga rolliga VIEWER | Kutse saadetakse (POST `/api/curricula/{id}/shares/invite`), kasutaja näeb õppekava „Minuga jagatud" all | `test@example.com` → 201, alert „Kutse saadetud". **AGA** päring ripus üle minuti (vt M5) | ⚠️ vt M5 |
| TC-5.2 | Kutsu rolliga CONTRIBUTOR | Kaasautor saab ühikuid muuta, kuid mitte kustutada õppekava | — (nõuab teist päris kontot) | ⏳ käsitsi |
| TC-5.3 | Kutsu rolliga ADMIN | Adminil on täisõigused | — (nõuab teist päris kontot) | ⏳ käsitsi |
| TC-5.4 | VIEWER üritab ühikut muuta | Muutmine on keelatud (ainult vaatamine) | — (nõuab teist päris kontot) | ⏳ käsitsi |
| TC-5.5 | Kutsu sama e-post teist korda | Korduvkutse käsitletakse korrektselt (unikaalsuse piirang, vt `uq_share`) | — | ⏳ käsitsi |
| TC-5.6 | Kutsu vigane e-posti aadress | Valideerimine takistab / kuvab veateate | `mitte-korrektne-email` → **HTTP 500** „Sisemine viga" (vt M4) | ❌ |
| TC-5.7 | Lülita õppekava avalikuks (public toggle) | Tekib avalik jagamislink | Lüliti muutus visuaalselt, kuid **ühtegi päringut ei saadetud ega linki ei kuvatud** (vt H3) | ❌ |
| TC-5.8 | Ava avalik link **välja logituna / inkognito** | Õppekava on anonüümselt vaadatav (ainult lugemine) | Pole testitav — avalikku vaatemarsruuti `App.jsx`-is ei eksisteeri (vt H3) | ❌ |
| TC-5.9 | Lülita avalik nähtavus tagasi privaatseks | Avalik link ei tööta enam | Pole asjakohane — vt H3 | ❌ |

## 6. Autentimine ja servajuhtumid

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-6.1 | Loo õppekava, kui JWT on aegunud/puudub | Kuvatakse „Sessioon on aegunud või puudub. Palun logi uuesti sisse.", suunatakse `/login` | — | ⏳ käsitsi |
| TC-6.2 | Backendi cold-start (esimene päring peale uinakut) | Kuvatakse ootamine/veateade, mitte vaikne ebaõnnestumine (vt teade „server ei vasta") | — (server oli juba ärkvel) | ⏳ käsitsi |
| TC-6.3 | Kustuta JWT `localStorage`-ist käsitsi, ava `/dashboard` | Suunatakse `/login` (vt `ProtectedRoute` loogika) | Avalehe-test kinnitas: `/dashboard` ilma JWT-ta suunab | ✅ |
| TC-6.4 | Logi sisse, sulge OAuth-popup enne lõpetamist | Rakendus ei jää „rippuma" (vrd M2 COOP-viga) | — (automatiseerimisel popup käitub erinevalt) | ⏳ käsitsi |
| TC-6.5 | Proovi avada teise kasutaja õppekava `/new/{võõras-id}` | Backend tagastab 403; UI käsitleb seda graatsiliselt | — | ⏳ käsitsi |

## 7. Brauseri- ja seadmeühilduvus

| ID | Samm(ud) | Oodatav tulemus | Tegelik tulemus | Staatus |
|---|---|---|---|---|
| TC-7.1 | Korda põhivoogu Firefoxis | Töötab samaväärselt kui Chromiumis | | |
| TC-7.2 | Korda põhivoogu Safaris | Töötab; jälgi eriti OAuth-popupi ja COOP-käitumist | | |
| TC-7.3 | Korda põhivoogu Edge'is | Töötab samaväärselt | | |
| TC-7.4 | Testi 3D-visualiseeringut nõrgemal seadmel / mobiilis | Jõudlus talutav, ei jookse kokku | | |

---

## Lisad (samas kaustas)

| Fail | Sisu |
|---|---|
| `home-desktop.png` / `home-mobile.png` | Esileht lauaarvutis ja mobiilis |
| `test-project.png` / `test-project2-mobile.png` / `test-project3-desktop.png` | Avalikud testlehed (H1) |
| `dashboard.png` | Töölaud sisse logituna |
| `mikro-graph.png` | Õpitee Graaf (mikro) vaade ühikuga |
| `share-modal.png` / `share-public-on.png` | Jagamismodaal (lüliti väljas / sees — link puudub, H3) |
| `eksport-naidis.json` | Eksporditud õppekava näidis (TC-4.1) |
