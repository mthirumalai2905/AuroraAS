// Verbatim shareholder register (aksjeeierbok) for Aurora Equity AS (938 395 063)
// Exact 1:1 transcription of "Aurora_EquityAS_Aksjebok-v1 - Aurora-NY-2026" Google Sheet.

export type ShareholderKind = "company" | "person";

export const TRANSFER_COLUMNS = [
  { key: "t01", title: "Lars", group: "1 oktober" },
  { key: "t02", title: "Brede", group: "1 oktober" },
  { key: "t03", title: "wai", group: "1 oktober" },
  { key: "t04", title: "Remi", group: "1 oktober" },
  { key: "t05", title: "Tormod", group: "1 oktober" },
  { key: "t06", title: "Masvie", group: "1 oktober" },
  { key: "t07", title: "Masvie", group: "1 oktober" },
  { key: "t08", title: "Enok", group: "1 oktober" },
  { key: "t09", title: "Tim", group: "1 oktober" },
  { key: "t10", title: "stig", group: "1 oktober" },
  { key: "t11", title: "terje", group: "1 oktober" },
  { key: "t12", title: "Martin", group: "1 oktober" },
  { key: "t13", title: "Bjørn", group: "1 oktober" },
  { key: "t14", title: "Erik", group: "1 oktober" },
  { key: "t15", title: "Khalid", group: "1 oktober" },
  { key: "t16", title: "Martin Holand", group: "24 oktober" },
  { key: "t17", title: "Frank Remi Maasbach", group: "24 oktober" },
  { key: "t18", title: "Shahzad Chauhary", group: "24 oktober" },
  { key: "t19", title: "Khalid Haussain", group: "24 oktober" },
  { key: "t20", title: "Erik Laszlo", group: "24 oktober" },
  { key: "t21", title: "Benedikt", group: "24 oktober" },
  { key: "t22", title: "Brede Fosshaug", group: "24 oktober" },
  { key: "t23", title: "Wai Ming Chi", group: "24 oktober" },
  { key: "t24", title: "Alf Ole Røisland", group: "24 oktober" },
] as const;

export type TransferKey = (typeof TRANSFER_COLUMNS)[number]["key"];

type RawShareholder = {
  stakeText: string;
  shares: number;
  name: string;
  firstName: string;
  investorId: string;
  address: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  openingShares: number | null;
  transfers: Partial<Record<TransferKey, number>>;
};

const rawRows: RawShareholder[] = [
  {"stakeText": "30.55%", "shares": 9163884, "name": "SEMANTIC AS", "firstName": "", "investorId": "894577002", "address": "Olaf Bulls vei 28", "address2": "", "postalCode": "0765", "city": "OSLO", "country": "Norway", "email": "paal@synx.tools", "openingShares": 11373450, "transfers": {"t01": 111120, "t02": 16650, "t03": 25000, "t04": 60000, "t05": 25000, "t06": 300000, "t07": 100000, "t08": 80000, "t09": 33500, "t10": 30000, "t11": 100000, "t12": 80000, "t13": 120000, "t14": 83300, "t15": 100000, "t16": 300000, "t17": 30000, "t18": 150000, "t19": 50000, "t20": 20000, "t21": 50000, "t22": 10000, "t23": 100000, "t24": 10000}},
  {"stakeText": "16.78%", "shares": 5034858, "name": "EBOOT AS", "firstName": "", "investorId": "912995151", "address": "Olaf Bulls vei 28", "address2": "", "postalCode": "0765", "city": "OSLO", "country": "Norway", "email": "asveig_marie@hotmail.com", "openingShares": 5034858, "transfers": {}},
  {"stakeText": "6.62%", "shares": 1985104, "name": "SYNAPTIC AS", "firstName": "", "investorId": "993727008", "address": "Nordhagaveien 19", "address2": "", "postalCode": "0491", "city": "OSLO", "country": "Norway", "email": "henrik.silverkant@nornir.io", "openingShares": 1985104, "transfers": {}},
  {"stakeText": "3.91%", "shares": 1173714, "name": "ACCA INVEST AS", "firstName": "", "investorId": "912563103", "address": "C/O Arne Peder Blix", "address2": "Fearnleys gate 2 A", "postalCode": "0353", "city": "OSLO", "country": "Norway", "email": "apb@accainvest.com", "openingShares": 1173714, "transfers": {}},
  {"stakeText": "3.39%", "shares": 1016877, "name": "JB-HOLDING AS", "firstName": "", "investorId": "995618265", "address": "Båtsmannsveien 5", "address2": "", "postalCode": "4077", "city": "HUNDVÅG", "country": "Norway", "email": "jonny.brudevoll@gmail.com", "openingShares": 1016877, "transfers": {}},
  {"stakeText": "2.77%", "shares": 831963, "name": "Christiania Deco AS", "firstName": "", "investorId": "890083382", "address": "Glimmervegen 3B", "address2": "", "postalCode": "3931", "city": "PORSGRUNN", "country": "Norway", "email": "h_v_hanssen@yahoo.com", "openingShares": 831963, "transfers": {}},
  {"stakeText": "2.62%", "shares": 784788, "name": "BERGER", "firstName": "ASLE KETIL", "investorId": "14/03/1948", "address": "CHARLOTTE ANDERSENS VEI 25", "address2": "", "postalCode": "0375", "city": "OSLO", "country": "Norway", "email": "drasle@osloIntex.com", "openingShares": 784788, "transfers": {}},
  {"stakeText": "2.55%", "shares": 765361, "name": "TW INVESTERING AS", "firstName": "", "investorId": "917100357", "address": "Steinstemmen 5", "address2": "", "postalCode": "4313", "city": "SANDNES", "country": "Norway", "email": "Tormod@wanvik.net", "openingShares": 740361, "transfers": {"t05": 25000}},
  {"stakeText": "2.13%", "shares": 637611, "name": "JAPY", "firstName": "GAETAN", "investorId": "103080339", "address": "Creganna Castle Road", "address2": "", "postalCode": "", "city": "IR - Oranmore H91K46X", "country": "Ireland", "email": "gojapy@gmail.com", "openingShares": 637611, "transfers": {}},
  {"stakeText": "1.93%", "shares": 580031, "name": "HOLAN", "firstName": "MARTIN ANDREAS", "investorId": "25/05/1993", "address": "GRANÅSVEGEN 47 B", "address2": "", "postalCode": "7047", "city": "TRONDHEIM", "country": "Norway", "email": "the.holan@gmail.com", "openingShares": 200031, "transfers": {"t12": 80000, "t16": 300000}},
  {"stakeText": "1.47%", "shares": 440067, "name": "J.BAKKE INVEST AS", "firstName": "", "investorId": "919689692", "address": "Sundts veg 83", "address2": "", "postalCode": "5221", "city": "NESTTUN", "country": "Norway", "email": "jb@jbinvest.no", "openingShares": 440067, "transfers": {}},
  {"stakeText": "1.39%", "shares": 416730, "name": "APPOLLO GRANUM IT AS", "firstName": "", "investorId": "934192699", "address": "c/o Atle Engen", "address2": "Sørjordet 118", "postalCode": "1466", "city": "STRØMMEN", "country": "Norway", "email": "atleaplo@gmail.com", "openingShares": 416730, "transfers": {}},
  {"stakeText": "1.39%", "shares": 416730, "name": "APPOLLO IT AS", "firstName": "", "investorId": "993143928", "address": "Oksval terrasse 3C", "address2": "", "postalCode": "1456", "city": "NESODDTANGEN", "country": "Norway", "email": "atleaplo@gmail.com", "openingShares": 416730, "transfers": {}},
  {"stakeText": "1.33%", "shares": 400000, "name": "Andreas Masvie", "firstName": "Andreas (Espegren) Masvie", "investorId": "29129229355", "address": "Hans Nordahls gate 68", "address2": "", "postalCode": "0485", "city": "Oslo", "country": "Norway", "email": "andreas.masvie@gmail.com", "openingShares": null, "transfers": {"t06": 300000, "t07": 100000}},
  {"stakeText": "1.24%", "shares": 373392, "name": "DIGITALT AS", "firstName": "", "investorId": "959554706", "address": "Vestre veien 288", "address2": "", "postalCode": "1680", "city": "SKJÆRHALDEN", "country": "Norway", "email": "jan@storehaug.no", "openingShares": 373392, "transfers": {}},
  {"stakeText": "1.07%", "shares": 320000, "name": "DEVAY-FORIS", "firstName": "ERIK LASZLO", "investorId": "19/08/1976", "address": "ELGVEIEN 25 H", "address2": "", "postalCode": "1534", "city": "MOSS", "country": "Norway", "email": "eri-dev@hotmail.com", "openingShares": 216699, "transfers": {"t14": 83300, "t20": 20000}},
  {"stakeText": "1.05%", "shares": 315480, "name": "BAKKE HOLDINGS AS", "firstName": "", "investorId": "926755633", "address": "Nedre Bakka 1", "address2": "", "postalCode": "5379", "city": "STEINSLAND", "country": "Norway", "email": "jb@jbinvest.no", "openingShares": 315480, "transfers": {}},
  {"stakeText": "0.88%", "shares": 263346, "name": "HUSSAIN", "firstName": "KHALID", "investorId": "2056129548", "address": "ROLF WICKSTRØMS VEI 6", "address2": "", "postalCode": "1472", "city": "FJELLHAMAR", "country": "Norway", "email": "khalid.huss@gmail.com", "openingShares": 113346, "transfers": {"t15": 100000, "t19": 50000}},
  {"stakeText": "0.86%", "shares": 256707, "name": "Zrelli", "firstName": "Ben Hamza", "investorId": "1068926102", "address": "Ben Zrelli", "address2": "Ulsholtveien 42", "postalCode": "1053", "city": "OSLO", "country": "Norway", "email": "hamza.zrelli89@gmail.com", "openingShares": 256707, "transfers": {}},
  {"stakeText": "0.83%", "shares": 249995, "name": "BRUUSGAARD", "firstName": "LARS", "investorId": "15014731978", "address": "HAMMERSTADS GATE 21 D", "address2": "", "postalCode": "0363", "city": "OSLO", "country": "Norway", "email": "Lars.bruusgaard1@gmail.com", "openingShares": 138876, "transfers": {"t01": 111120}},
  {"stakeText": "0.68%", "shares": 205284, "name": "MIAH", "firstName": "MOHAMMED MIRAN", "investorId": "05/11/1985", "address": "ØRPETVEITVEGEN 30", "address2": "", "postalCode": "5534", "city": "HAUGESUND", "country": "Norway", "email": "jamalnasir96@hotmail.com", "openingShares": 205284, "transfers": {}},
  {"stakeText": "0.67%", "shares": 200094, "name": "MJN HOLDING AS", "firstName": "", "investorId": "929970640", "address": "Rastaveien 12D", "address2": "", "postalCode": "1461", "city": "LØRENSKOG", "country": "Norway", "email": "the.holan@gmail.com", "openingShares": 200094, "transfers": {}},
  {"stakeText": "0.66%", "shares": 198375, "name": "ANDERSEN", "firstName": "ØYSTEIN ROSNES", "investorId": "08/02/1973", "address": "LINDEMANS GATE 5 B", "address2": "", "postalCode": "0267", "city": "OSLO", "country": "Norway", "email": "oystand@yahoo.com", "openingShares": 166272, "transfers": {}},
  {"stakeText": "0.66%", "shares": 197154, "name": "STOREJORDE", "firstName": "NINA KRISTIN", "investorId": "21/07/1967", "address": "KLEIVVEIEN 62", "address2": "", "postalCode": "1356", "city": "BEKKESTUA", "country": "Norway", "email": "bigfield@online.no", "openingShares": 197154, "transfers": {}},
  {"stakeText": "0.64%", "shares": 192852, "name": "CHAUDHARY", "firstName": "SHAHZAD AHMED", "investorId": "30038342386", "address": "Tårnveien 2", "address2": "", "postalCode": "1465", "city": "STRØMMEN", "country": "Norway", "email": "shezziii@hotmail.com", "openingShares": 42852, "transfers": {"t18": 150000}},
  {"stakeText": "0.56%", "shares": 166692, "name": "SSBU HOLDING AS", "firstName": "", "investorId": "916909918", "address": "Lindebergveien 53C", "address2": "", "postalCode": "1069", "city": "OSLO", "country": "Norway", "email": "mohammad.jahangir.89@gmail.com", "openingShares": 166692, "transfers": {}},
  {"stakeText": "0.54%", "shares": 163341, "name": "OMMUNDSEN", "firstName": "BJØRN", "investorId": "10/07/1956", "address": "GEITASTOVA 1", "address2": "", "postalCode": "4031", "city": "STAVANGER", "country": "Norway", "email": "bjorn.ommundsen56@gmail.com", "openingShares": 43341, "transfers": {"t13": 120000}},
  {"stakeText": "0.44%", "shares": 133353, "name": "CELINA", "firstName": "BERSANT", "investorId": "09/09/1996", "address": "GRØNLAND 50", "address2": "", "postalCode": "3045", "city": "DRAMMEN", "country": "Norway", "email": "loticelina78@gmail.com", "openingShares": 133353, "transfers": {}},
  {"stakeText": "0.44%", "shares": 133339, "name": "TO GOOD ENERGY AS", "firstName": "", "investorId": "914015030", "address": "Monolitveien 64", "address2": "", "postalCode": "0375", "city": "OSLO", "country": "Norway", "email": "osmundsen.terje@gmail.com", "openingShares": 33339, "transfers": {"t11": 100000}},
  {"stakeText": "0.42%", "shares": 125000, "name": "Wai Ming", "firstName": "Chi", "investorId": "030282 38168", "address": "", "address2": "", "postalCode": "", "city": "", "country": "", "email": "chiwaiming@hotmail.com", "openingShares": null, "transfers": {"t03": 25000, "t23": 100000}},
  {"stakeText": "0.37%", "shares": 109996, "name": "FOSSHAUG", "firstName": "BREDE CHRISTOFFER", "investorId": "23/03/1981", "address": "VEVELSTADÅSEN 55", "address2": "", "postalCode": "1405", "city": "LANGHUS", "country": "Norway", "email": "Bredeher@hotmail.com", "openingShares": 83346, "transfers": {"t02": 16650, "t22": 10000}},
  {"stakeText": "0.36%", "shares": 107517, "name": "KOJIMA", "firstName": "YUKI", "investorId": "02/03/1986", "address": "Kita 1-5-19-701", "address2": "", "postalCode": "", "city": "Kunitachi-shi, Tokyo, 186-00", "country": "Japan", "email": "h044056b@gmail.com", "openingShares": 107517, "transfers": {}},
  {"stakeText": "0.33%", "shares": 100001, "name": "MATHIASSEN", "firstName": "TIM KAMPEVOLL", "investorId": "2128231784", "address": "STRØMSBUNESET 34", "address2": "", "postalCode": "4839", "city": "ARENDAL", "country": "Norway", "email": "tim.mathiassen@gmail.com", "openingShares": 66501, "transfers": {"t09": 33500}},
  {"stakeText": "0.33%", "shares": 100000, "name": "Levang", "firstName": "Amalie Fredriksen", "investorId": "151209 84672", "address": "Olav Bullsvei 28", "address2": "", "postalCode": "0765", "city": "Oslo", "country": "Norway", "email": "amtr39@gmail.com", "openingShares": null, "transfers": {}},
  {"stakeText": "0.33%", "shares": 100000, "name": "Levang", "firstName": "Helmine Fredriksen", "investorId": "170511 82804", "address": "Olav Bullsvei 28", "address2": "", "postalCode": "0765", "city": "Oslo", "country": "Norway", "email": "heltr39@icloud.com", "openingShares": null, "transfers": {}},
  {"stakeText": "0.33%", "shares": 98709, "name": "MAASBACH", "firstName": "FRANK REMI", "investorId": "19067340135", "address": "SUKKESTØLVEIEN 36", "address2": "", "postalCode": "4639", "city": "KRISTIANSAND S", "country": "Norway", "email": "RemiMaasbach@hotmail.com", "openingShares": 8709, "transfers": {"t04": 60000, "t17": 30000}},
  {"stakeText": "0.28%", "shares": 85218, "name": "ØRNVALL", "firstName": "STIG", "investorId": "02/05/1972", "address": "", "address2": "", "postalCode": "7709", "city": "STEINKJER", "country": "Norway", "email": "stig.ornvall@gmail.com", "openingShares": 55218, "transfers": {"t10": 30000}},
  {"stakeText": "0.27%", "shares": 80000, "name": "Enok", "firstName": "Gåsland", "investorId": "7058933567", "address": "Siebkes gate", "address2": "", "postalCode": "0562", "city": "Oslo", "country": "Norway", "email": "enok.gasland@gmail.com", "openingShares": null, "transfers": {"t08": 80000}},
  {"stakeText": "0.26%", "shares": 77094, "name": "ROCKLOVE AS", "firstName": "", "investorId": "994314416", "address": "Postboks 3406", "address2": "", "postalCode": "7709", "city": "STEINKJER", "country": "Norway", "email": "stig.ornvall@gmail.com", "openingShares": 77094, "transfers": {}},
  {"stakeText": "0.25%", "shares": 75012, "name": "KINDERVAAG", "firstName": "JOHN REIDAR", "investorId": "23/02/1971", "address": "KORNBLOMSTTUNET 25", "address2": "", "postalCode": "4027", "city": "STAVANGER", "country": "Norway", "email": "johnreidarkindervaag@gmail.com", "openingShares": 75012, "transfers": {}},
  {"stakeText": "0.25%", "shares": 75012, "name": "LEIVESTAD", "firstName": "OLAV", "investorId": "7066645945", "address": "SMÅGAMYRVEIEN 5", "address2": "", "postalCode": "4034", "city": "STAVANGER", "country": "Norway", "email": "olale@equinor.com", "openingShares": 75012, "transfers": {}},
  {"stakeText": "0.22%", "shares": 66678, "name": "FORTIS AS", "firstName": "Christer Haraldsen", "investorId": "925574023", "address": "Holtavegen 44", "address2": "", "postalCode": "5179", "city": "GODVIK", "country": "Norway", "email": "ch@bonobolig.no", "openingShares": 66678, "transfers": {}},
  {"stakeText": "0.20%", "shares": 60195, "name": "WINDSTAD", "firstName": "HÅVARD", "investorId": "07/05/1971", "address": "HELLINGA 5", "address2": "", "postalCode": "1518", "city": "MOSS", "country": "Norway", "email": "havardwindstad@gmail.com", "openingShares": 60195, "transfers": {}},
  {"stakeText": "0.19%", "shares": 58341, "name": "MAYOROVA", "firstName": "ELENA", "investorId": "23/05/1953", "address": "OLA FROSTS VEG 1", "address2": "", "postalCode": "7031", "city": "TRONDHEIM", "country": "Norway", "email": "riaunetelena53@mail.ru", "openingShares": 58341, "transfers": {}},
  {"stakeText": "0.17%", "shares": 50508, "name": "KNUTSEN", "firstName": "MAY BRITT", "investorId": "8086933862", "address": "DAMVEGEN 9", "address2": "", "postalCode": "5518", "city": "HAUGESUND", "country": "Norway", "email": "maybalife@gmail.com", "openingShares": 50508, "transfers": {}},
  {"stakeText": "0.17%", "shares": 50007, "name": "SOLAIO AS", "firstName": "", "investorId": "924194618", "address": "Sloreåsen 56D", "address2": "", "postalCode": "1257", "city": "OSLO", "country": "Norway", "email": "ivar@solaio.no", "openingShares": 50007, "transfers": {}},
  {"stakeText": "0.17%", "shares": 50007, "name": "ZHANG", "firstName": "WENYING", "investorId": "20/12/1986", "address": "MESSEPROMENADEN 7", "address2": "", "postalCode": "0279", "city": "OSLO", "country": "Norway", "email": "germany1222@hotmail.com", "openingShares": 50007, "transfers": {}},
  {"stakeText": "0.17%", "shares": 50000, "name": "HORDVIK", "firstName": "JOHAN", "investorId": "5057244552", "address": "SØRHAUGLEITE 1", "address2": "", "postalCode": "5521", "city": "HAUGESUND", "country": "Norway", "email": "jhordvik@gmail.com", "openingShares": 25005, "transfers": {}},
  {"stakeText": "0.17%", "shares": 50000, "name": "Mithassel", "firstName": "Benedikt Andreas", "investorId": "21079931591", "address": "Omsens gate 2A", "address2": "", "postalCode": "0478", "city": "Oslo", "country": "Norway", "email": "benemit@pm.me", "openingShares": null, "transfers": {"t21": 50000}},
  {"stakeText": "0.16%", "shares": 48342, "name": "OISHI", "firstName": "KEN TISELL", "investorId": "04/01/1972", "address": "SCHULTZ' GATE 2", "address2": "", "postalCode": "0365", "city": "OSLO", "country": "Norway", "email": "ken@obregnskap.no", "openingShares": 48342, "transfers": {}},
  {"stakeText": "0.16%", "shares": 47508, "name": "MASVIE", "firstName": "NILS ANDREAS", "investorId": "5066524541", "address": "DOVRESVINGEN 36 A", "address2": "", "postalCode": "1184", "city": "OSLO", "country": "Norway", "email": "nils.andreas.masvie@gmail.com", "openingShares": 47508, "transfers": {}},
  {"stakeText": "0.15%", "shares": 45321, "name": "DAVID", "firstName": "EDWIN FERNANDO", "investorId": "11107427971", "address": "DYRE HALSES GATE 5", "address2": "", "postalCode": "7042", "city": "TRONDHEIM", "country": "Norway", "email": "edwindavid21@hotmail.com", "openingShares": 45321, "transfers": {}},
  {"stakeText": "0.14%", "shares": 43341, "name": "JHA", "firstName": "AMIT", "investorId": "2077421141", "address": "JORDSTJERNEVEIEN 6 F", "address2": "", "postalCode": "1283", "city": "OSLO", "country": "Norway", "email": "amitjha74in@gmail.com", "openingShares": 43341, "transfers": {}},
  {"stakeText": "0.14%", "shares": 40839, "name": "PITCH PERFECT AS", "firstName": "", "investorId": "922926271", "address": "Hellinga 5", "address2": "", "postalCode": "1518", "city": "MOSS", "country": "Norway", "email": "havardwindstad@gmail.com", "openingShares": 40839, "transfers": {}},
  {"stakeText": "0.14%", "shares": 40686, "name": "WANVIK", "firstName": "INGOLF JOHANNES", "investorId": "16073143563", "address": "KVERNSTØVEIEN 6", "address2": "", "postalCode": "4073", "city": "RANDABERG", "country": "Norway", "email": "ingolf@wanvik.net", "openingShares": 40686, "transfers": {}},
  {"stakeText": "0.13%", "shares": 40005, "name": "RF CAPITAL AS", "firstName": "", "investorId": "920820077", "address": "Tostrups gate 18", "address2": "", "postalCode": "2640", "city": "OSLO", "country": "Norway", "email": "remi.fredriksen@gmail.com", "openingShares": 40005, "transfers": {}},
  {"stakeText": "0.13%", "shares": 39588, "name": "KALVE AS", "firstName": "", "investorId": "866117152", "address": "Hans Nysoms vei 10", "address2": "", "postalCode": "3085", "city": "HOLMESTRAND", "country": "Norway", "email": "halvor.kalve@gmail.com", "openingShares": 39588, "transfers": {}},
  {"stakeText": "0.13%", "shares": 38499, "name": "MELEMEDJIAN", "firstName": "FRANCIS CHARLES", "investorId": "05/12/1959", "address": "RESIDENCE RODIN 1810", "address2": "66 RUE DE L'EGALITE", "postalCode": "", "city": "FR-92130 ISSY-LES-MOULINEAUX", "country": "France", "email": "francis.melemedjian@ntx-research.com", "openingShares": 38499, "transfers": {}},
  {"stakeText": "0.12%", "shares": 37044, "name": "XPLORICO AS", "firstName": "", "investorId": "922699496", "address": "c/o Petersson", "address2": "Krillåsveien 4B", "postalCode": "1392", "city": "VETTRE", "country": "Norway", "email": "stefan@xplorico.com", "openingShares": 37044, "transfers": {}},
  {"stakeText": "0.12%", "shares": 35004, "name": "MAYOROVA", "firstName": "LIDIA", "investorId": "12098233405", "address": "OLA FROSTS VEG 5", "address2": "", "postalCode": "7031", "city": "TRONDHEIM", "country": "Norway", "email": "lidiadavid82@gmail.com", "openingShares": 35004, "transfers": {}},
  {"stakeText": "0.12%", "shares": 35004, "name": "DREVLAND", "firstName": "PER ARNE", "investorId": "25/05/1983", "address": "FORMERVEGEN 26", "address2": "", "postalCode": "2345", "city": "ÅDALSBRUK", "country": "Norway", "email": "pdrevland@gmail.com", "openingShares": 35004, "transfers": {}},
  {"stakeText": "0.11%", "shares": 32241, "name": "SINGH", "firstName": "SUKHMEET", "investorId": "20/11/1995", "address": "SOLSVINGEN 133", "address2": "", "postalCode": "3034", "city": "DRAMMEN", "country": "Norway", "email": "sukhmeet95@hotmail.no", "openingShares": 32241, "transfers": {}},
  {"stakeText": "0.10%", "shares": 31254, "name": "FREDRIKSEN", "firstName": "MONICA", "investorId": "07/10/1977", "address": "TRUDVANGVEIEN 39", "address2": "", "postalCode": "0363", "city": "OSLO", "country": "Norway", "email": "monica.fredriksen@gmail.com", "openingShares": 31254, "transfers": {}},
  {"stakeText": "0.10%", "shares": 30534, "name": "MINDBUSINESS AS", "firstName": "", "investorId": "990283915", "address": "Øvre Ringveg 15B", "address2": "", "postalCode": "7713", "city": "STEINKJER", "country": "Norway", "email": "Gunnar.Vist@Nextcon.no", "openingShares": 30534, "transfers": {}},
  {"stakeText": "0.10%", "shares": 29790, "name": "BAKKEVIG", "firstName": "LARS HELDAL", "investorId": "16067130395", "address": "TRETTEMYRVEGEN 5 A", "address2": "", "postalCode": "5533", "city": "HAUGESUND", "country": "Norway", "email": "bakkevig@gmail.com", "openingShares": 29790, "transfers": {}},
  {"stakeText": "0.09%", "shares": 27339, "name": "PAHLE", "firstName": "JAN ANDREAS SAXLUND", "investorId": "6098943169", "address": "ÅSAVEIEN 22", "address2": "", "postalCode": "0362", "city": "OSLO", "country": "Norway", "email": "andreas.pahle@gmail.com", "openingShares": 27339, "transfers": {}},
  {"stakeText": "0.09%", "shares": 26670, "name": "Miil AS", "firstName": "Knut Hagenes", "investorId": "922135045", "address": "Grimstimyra 5", "address2": "", "postalCode": "5357", "city": "FJELL", "country": "Norway", "email": "knut.hagenes@gmail.com", "openingShares": 26670, "transfers": {}},
  {"stakeText": "0.09%", "shares": 26670, "name": "KALI KAPITAL AS", "firstName": "", "investorId": "924463430", "address": "Pilestredet 77", "address2": "", "postalCode": "0354", "city": "OSLO", "country": "Norway", "email": "kaja.lindsjorn@gmail.com", "openingShares": 26670, "transfers": {}},
  {"stakeText": "0.09%", "shares": 26670, "name": "BLÅSTEN AS", "firstName": "", "investorId": "917466912", "address": "Apalveien 26", "address2": "", "postalCode": "0371", "city": "OSLO", "country": "Norway", "email": "cutne@hotmail.com", "openingShares": 26670, "transfers": {}},
  {"stakeText": "0.08%", "shares": 24336, "name": "WANVIK", "firstName": "MORTEN", "investorId": "22045938798", "address": "KVERNSTØVEIEN 6", "address2": "", "postalCode": "4073", "city": "RANDABERG", "country": "Norway", "email": "morten@wanvik.net", "openingShares": 24336, "transfers": {}},
  {"stakeText": "0.08%", "shares": 22842, "name": "MUSHTAQ", "firstName": "MOHAMMAD AMIR", "investorId": "25/10/1996", "address": "BRUSLETTA 4 A", "address2": "", "postalCode": "2016", "city": "FROGNER", "country": "Norway", "email": "amir2510@hotmail.com", "openingShares": 22842, "transfers": {}},
  {"stakeText": "0.07%", "shares": 21531, "name": "AREKLETT", "firstName": "IVAR", "investorId": "31/12/1972", "address": "ALNAGATA 11", "address2": "", "postalCode": "0192", "city": "OSLO", "country": "Norway", "email": "IvarAreklett@hotmail.com", "openingShares": 21531, "transfers": {}},
  {"stakeText": "0.07%", "shares": 20004, "name": "TFE HOLDING AS", "firstName": "", "investorId": "918054928", "address": "Skedsmogata 6", "address2": "", "postalCode": "0655", "city": "OSLO", "country": "Norway", "email": "tfeholding@gmail.com", "openingShares": 20004, "transfers": {}},
  {"stakeText": "0.06%", "shares": 18336, "name": "MASVIE", "firstName": "RANDI DORTHEA ESPEGREN", "investorId": "07/07/1992", "address": "HANS NORDAHLS GATE 68", "address2": "", "postalCode": "0485", "city": "OSLO", "country": "Norway", "email": "RANDI.ESPEGREN@GMAIL.COM", "openingShares": 18336, "transfers": {}},
  {"stakeText": "0.06%", "shares": 18000, "name": "ANDERSLAND", "firstName": "HELGE", "investorId": "29/10/1978", "address": "ØSTRE RING 20", "address2": "-", "postalCode": "4015", "city": "STAVANGER", "country": "Norway", "email": "helge@safe-temp.no", "openingShares": 18000, "transfers": {}},
  {"stakeText": "0.06%", "shares": 16668, "name": "WINJE", "firstName": "FREDRIK LINDSETH", "investorId": "19/03/1995", "address": "EINAR AASS VEI 3", "address2": "", "postalCode": "3046", "city": "DRAMMEN", "country": "Norway", "email": "fredrilw@gmail.com", "openingShares": 16668, "transfers": {}},
  {"stakeText": "0.06%", "shares": 16668, "name": "BETTER TOGETHER AS", "firstName": "", "investorId": "924673729", "address": "Skovveien 39A", "address2": "", "postalCode": "0258", "city": "OSLO", "country": "Norway", "email": "jostein@vevatne.no", "openingShares": 16668, "transfers": {}},
  {"stakeText": "0.06%", "shares": 16668, "name": "TH INVESTERING AS", "firstName": "", "investorId": "916676336", "address": "Zetilizveien 3D", "address2": "", "postalCode": "4017", "city": "STAVANGER", "country": "Norway", "email": "terje.holm@lyse.net", "openingShares": 16668, "transfers": {}},
  {"stakeText": "0.06%", "shares": 16668, "name": "SILVERKANT", "firstName": "KAREN CHRISTINE", "investorId": "12/08/1976", "address": "DISENVEIEN 39", "address2": "", "postalCode": "0587", "city": "OSLO", "country": "Norway", "email": "karen.silverkant@gmail.com", "openingShares": 16668, "transfers": {}},
  {"stakeText": "0.06%", "shares": 16668, "name": "EILERTSEN", "firstName": "KARL OTTO", "investorId": "3025642510", "address": "SØR-BEITSTADVEGEN 555", "address2": "", "postalCode": "7724", "city": "STEINKJER", "country": "Norway", "email": "kalle@slkng.no", "openingShares": 16668, "transfers": {}},
  {"stakeText": "0.06%", "shares": 16668, "name": "NASIR", "firstName": "MUHAMMAD OSMAN", "investorId": "03/04/1983", "address": "FIREMANNSBOLIGENE 1 B", "address2": "", "postalCode": "2056", "city": "ALGARHEIM", "country": "Norway", "email": "m.osman.nasir@gmail.com", "openingShares": 16668, "transfers": {}},
  {"stakeText": "0.05%", "shares": 15435, "name": "ATAIE", "firstName": "HAMED", "investorId": "1088432300", "address": "ØVRE RÆLINGSVEG 63", "address2": "", "postalCode": "2005", "city": "RÆLINGEN", "country": "Norway", "email": "hamed_ataie@yahoo.no", "openingShares": 15435, "transfers": {}},
  {"stakeText": "0.05%", "shares": 15024, "name": "LEVANG", "firstName": "PÅL KRISTIAN", "investorId": "05/08/1972", "address": "OLAF BULLS VEI 28", "address2": "", "postalCode": "0765", "city": "OSLO", "country": "Norway", "email": "paal@synx.tools", "openingShares": 15024, "transfers": {}},
  {"stakeText": "0.05%", "shares": 13848, "name": "OS-HOLDING AS", "firstName": "", "investorId": "996680622", "address": "Gauselbakken 80", "address2": "", "postalCode": "4032", "city": "STAVANGER", "country": "Norway", "email": "oddvar.skjaeveland@outlook.com", "openingShares": 13848, "transfers": {}},
  {"stakeText": "0.04%", "shares": 13335, "name": "DP IOT AS", "firstName": "Tor Martin Falken", "investorId": "922178739", "address": "Jogstadveien 21", "address2": "", "postalCode": "2007", "city": "KJELLER", "country": "Norway", "email": "torfal@dpnorge.no", "openingShares": 13335, "transfers": {}},
  {"stakeText": "0.04%", "shares": 13335, "name": "N3 GROUP AS", "firstName": "Henrik Foss", "investorId": "998553105", "address": "Rudssletta 60", "address2": "", "postalCode": "1351", "city": "RUD", "country": "Norway", "email": "mg@n3.no", "openingShares": 13335, "transfers": {}},
  {"stakeText": "0.04%", "shares": 13335, "name": "STEINEGER", "firstName": "JOHAN EDVARD", "investorId": "22098042532", "address": "Elgveien 4", "address2": "", "postalCode": "0852", "city": "OSLO", "country": "Norway", "email": "jsteineger@hotmail.com", "openingShares": 13335, "transfers": {}},
  {"stakeText": "0.04%", "shares": 11667, "name": "SOLSTRAND", "firstName": "ROY ANDRÉ", "investorId": "280675 36179", "address": "BEDEHUSVEGEN 9", "address2": "", "postalCode": "5420", "city": "RUBBESTADNESET", "country": "Norway", "email": "solstrand66@gmail.com", "openingShares": 11667, "transfers": {}},
  {"stakeText": "0.04%", "shares": 11667, "name": "SARSHAR", "firstName": "LATIF RAHMAN", "investorId": "01/06/1975", "address": "MARIA DEHLIS VEI 33", "address2": "", "postalCode": "1084", "city": "OSLO", "country": "Norway", "email": "latifrs@yahoo.com", "openingShares": 11667, "transfers": {}},
  {"stakeText": "0.04%", "shares": 11421, "name": "ANTHUN", "firstName": "KETIL", "investorId": "31126734177", "address": "KALLEVIKVEGEN 15", "address2": "", "postalCode": "5563", "city": "FØRRESFJORDEN", "country": "Norway", "email": "ketil.anthun@haugnett.no", "openingShares": 11421, "transfers": {}},
  {"stakeText": "0.03%", "shares": 10419, "name": "SKJÆRAN", "firstName": "RINA", "investorId": "12/09/1971", "address": "KJELDAVEGEN 1", "address2": "", "postalCode": "7822", "city": "BANGSUND", "country": "Norway", "email": "rina@inam.no", "openingShares": 10419, "transfers": {}},
  {"stakeText": "0.03%", "shares": 10335, "name": "LYT AS", "firstName": "LARS OVE Brenna", "investorId": "932759942", "address": "SIKVEIEN 2", "address2": "", "postalCode": "1481", "city": "HAGAN", "country": "Norway", "email": "lars.ove.brenna@gmail.com", "openingShares": 10335, "transfers": {}},
  {"stakeText": "0.03%", "shares": 10333, "name": "RØISLAND", "firstName": "ALF OLE", "investorId": "22065426971", "address": "CONSUL S. BERGESENS V. 116", "address2": "", "postalCode": "4016", "city": "STAVANGER", "country": "Norway", "email": "alf.ole.roisland@gmail.com", "openingShares": 333, "transfers": {"t24": 10000}},
  {"stakeText": "0.03%", "shares": 10068, "name": "MÜNSTER-DAHL", "firstName": "ALEXANDER", "investorId": "22118342503", "address": "Idrettsveien 14", "address2": "", "postalCode": "1358", "city": "Jar", "country": "Norway", "email": "alexander.m.dahl@mmc.com", "openingShares": 10068, "transfers": {}},
  {"stakeText": "0.03%", "shares": 10068, "name": "MÜNSTER-DAHL", "firstName": "LINE MARI HAUGLAND", "investorId": "13058339851", "address": "Idrettsveien 14", "address2": "", "postalCode": "1358", "city": "Jar", "country": "Norway", "email": "linemari_83@hotmail.com", "openingShares": 10068, "transfers": {}},
  {"stakeText": "0.03%", "shares": 10002, "name": "LANGVATN INVEST AS", "firstName": "", "investorId": "926504444", "address": "c/o Martin Gundersen Langvatn", "address2": "Gina Krogs vei 16", "postalCode": "1153", "city": "OSLO", "country": "Norway", "email": "martin.langvatn@gmail.com", "openingShares": 10002, "transfers": {}},
  {"stakeText": "0.03%", "shares": 9336, "name": "ANDERSEN", "firstName": "JOAKIM VIGGEN", "investorId": "16028934312", "address": "OSKAR BRAATENS GATE 17", "address2": "", "postalCode": "0474", "city": "OSLO", "country": "Norway", "email": "jviggenandersen@gmail.com", "openingShares": 9336, "transfers": {}},
  {"stakeText": "0.03%", "shares": 9336, "name": "BEFRING", "firstName": "AUD JULIE", "investorId": "16028642826", "address": "OSKAR BRAATENS GATE 17", "address2": "", "postalCode": "0474", "city": "OSLO", "country": "Norway", "email": "audjulieb@gmail.com", "openingShares": 9336, "transfers": {}},
  {"stakeText": "0.03%", "shares": 9216, "name": "CORE52 IMPACTFUNDING AS", "firstName": "", "investorId": "923636218", "address": "Bliksrudstubben 7", "address2": "", "postalCode": "1484", "city": "HAKADAL", "country": "Norway", "email": "per.bjorstad@core52.com", "openingShares": 9216, "transfers": {}},
  {"stakeText": "0.03%", "shares": 9051, "name": "THOMSVIK", "firstName": "SIRIL", "investorId": "05/03/1990", "address": "NEDRE ÅSVEI 12", "address2": "", "postalCode": "1341", "city": "SLEPENDEN", "country": "Norway", "email": "siril_90@hotmail.com", "openingShares": 9051, "transfers": {}},
  {"stakeText": "0.03%", "shares": 9051, "name": "THOMSVIK", "firstName": "KJETIL SVARTSKUREN", "investorId": "13088743592", "address": "NEDRE ÅSVEI 12", "address2": "", "postalCode": "1341", "city": "SLEPENDEN", "country": "Norway", "email": "kjetil.thomsvik@gmail.com", "openingShares": 9051, "transfers": {}},
  {"stakeText": "0.03%", "shares": 8961, "name": "Håvard Bebo AS", "firstName": "", "investorId": "814 051 692", "address": "INGER MARGRETHE GRAMS VEG 26", "address2": "", "postalCode": "7716", "city": "STEINKJER", "country": "Norway", "email": "havard@tlab.no", "openingShares": 8961, "transfers": {}},
  {"stakeText": "0.03%", "shares": 8685, "name": "MASKINEN AS", "firstName": "Ketil Winther Løkke", "investorId": "995628147", "address": "Thorvald Meyersgate 7A", "address2": "97575708", "postalCode": "0555", "city": "OSLO", "country": "Norway", "email": "ketil@maskinen.no", "openingShares": 8685, "transfers": {}},
  {"stakeText": "0.03%", "shares": 8334, "name": "FRANCHISE RESTAURANT NARI THAI TAK", "firstName": "", "investorId": "915838448", "address": "Myrveien 25", "address2": "", "postalCode": "4025", "city": "STAVANGER", "country": "Norway", "email": "marte.rognan@lyse.net", "openingShares": 8334, "transfers": {}},
  {"stakeText": "0.03%", "shares": 8334, "name": "LÅBERG", "firstName": "IVAR", "investorId": "18034628536", "address": "SLOREÅSEN 56 D", "address2": "", "postalCode": "1257", "city": "OSLO", "country": "Norway", "email": "ivar@solaio.no", "openingShares": 8334, "transfers": {}},
  {"stakeText": "0.03%", "shares": 8094, "name": "VÅGENES", "firstName": "MATS", "investorId": "14049242973", "address": "ELVAVEGEN 93", "address2": "", "postalCode": "5918", "city": "FREKHAUG", "country": "Norway", "email": "mats.vagenes@gmail.com", "openingShares": 8094, "transfers": {}},
  {"stakeText": "0.03%", "shares": 7716, "name": "REZAI", "firstName": "KAMRAN", "investorId": "17089228352", "address": "MÅNEVEIEN 36", "address2": "", "postalCode": "1337", "city": "SANDVIKA", "country": "Norway", "email": "kamranrezai@live.com", "openingShares": 7716, "transfers": {}},
  {"stakeText": "0.03%", "shares": 7593, "name": "LEVANG", "firstName": "JINTANA ELISABETH", "investorId": "21/08/1973", "address": "AUSTMANNAVEGEN 10 D", "address2": "", "postalCode": "5537", "city": "HAUGESUND", "country": "Norway", "email": "jintana-@hotmail.com", "openingShares": 7593, "transfers": {}},
  {"stakeText": "0.02%", "shares": 7425, "name": "SEFAJ", "firstName": "LEONIK", "investorId": "21129643924", "address": "BORGAR STEINSETS VEI 8", "address2": "", "postalCode": "3034", "city": "DRAMMEN", "country": "Norway", "email": "L-sefaj@outlook.com", "openingShares": 7425, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6669, "name": "FURTECH AS", "firstName": "Bjørn Furu", "investorId": "917470286", "address": "Mellomfjellet 2", "address2": "", "postalCode": "2022", "city": "GJERDRUM", "country": "Norway", "email": "bjorn.furu@gmail.com", "openingShares": 6669, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6669, "name": "HANNAAS", "firstName": "UTHIT", "investorId": "25/01/1970", "address": "EPLEVEIEN 117", "address2": "", "postalCode": "4635", "city": "KRISTIANSAND S", "country": "Norway", "email": "vhannaas@online.no", "openingShares": 6669, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6669, "name": "FOSSUM AF DARRE", "firstName": "DAG RAGNAR", "investorId": "20085135504", "address": "HØGTUNVEIEN 7 B", "address2": "", "postalCode": "1383", "city": "ASKER", "country": "Norway", "email": "ddarre@oslomet.no", "openingShares": 6669, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6669, "name": "GRAMSHAUG", "firstName": "ARNE", "investorId": "22027245300", "address": "ORIONVEGEN 4 B", "address2": "", "postalCode": "5519", "city": "HAUGESUND", "country": "Norway", "email": "arne.gramshaug@gmail.com", "openingShares": 6669, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6669, "name": "HEFO AS", "firstName": "", "investorId": "989036971", "address": "Rudssletta 60", "address2": "", "postalCode": "1351", "city": "RUD", "country": "Norway", "email": "hf@n3.no", "openingShares": 6669, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6174, "name": "LEVANG", "firstName": "JOHN PETTER", "investorId": "24/03/1970", "address": "NORHEIMSTØLEN 40", "address2": "", "postalCode": "5542", "city": "KARMSUND", "country": "Norway", "email": "jockylevang@gmail.com", "openingShares": 6174, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6042, "name": "ØSTERBØL", "firstName": "ROY MORTEN", "investorId": "05/08/1972", "address": "BORGÅSVEGEN 1", "address2": "", "postalCode": "9011", "city": "TROMSØ", "country": "Norway", "email": "roym09@gmail.com", "openingShares": 6042, "transfers": {}},
  {"stakeText": "0.02%", "shares": 6000, "name": "GLOSLI", "firstName": "ELENA", "investorId": "01/12/1987", "address": "TÅRNBYVEIEN 459", "address2": "", "postalCode": "2013", "city": "SKJETTEN", "country": "Norway", "email": "elenaglosli@gmail.com", "openingShares": 6000, "transfers": {}},
  {"stakeText": "0.02%", "shares": 5652, "name": "NILSSEN", "firstName": "DAVID", "investorId": "27077333393", "address": "PILESTREDET PARK 2", "address2": "", "postalCode": "0176", "city": "OSLO", "country": "Norway", "email": "davidnilssen73@gmail.com", "openingShares": 5652, "transfers": {}},
  {"stakeText": "0.02%", "shares": 5652, "name": "LYNGA", "firstName": "ESPEN", "investorId": "13078140369", "address": "RAVNÅSVEIEN 58 A", "address2": "", "postalCode": "1254", "city": "OSLO", "country": "Norway", "email": "espen@hotmail.com", "openingShares": 5652, "transfers": {}},
  {"stakeText": "0.02%", "shares": 5583, "name": "KUZNETSOV", "firstName": "VLADIMIR", "investorId": "14/06/1962", "address": "STR. PROLETARSKAYA HOUSE NO 31 A BUILDING APT23", "address2": "", "postalCode": "", "city": "RU-301530 BELEV TOWN", "country": "Russian Federation No", "email": "kuznetsow62@mail.ru", "openingShares": 5583, "transfers": {}},
  {"stakeText": "0.02%", "shares": 5334, "name": "JELLESTAD", "firstName": "ERNA ÅDLAND", "investorId": "03/10/1959", "address": "BRENDAHAUGEN 17", "address2": "", "postalCode": "5652", "city": "ÅRLAND", "country": "Norway", "email": "ernajellestad@gmail.com", "openingShares": 5334, "transfers": {}},
  {"stakeText": "0.02%", "shares": 5334, "name": "SARSHAR", "firstName": "ZIA RAHMAN", "investorId": "1098223351", "address": "SELMA ELLEFSENS VEI 3 M", "address2": "", "postalCode": "0581", "city": "OSLO", "country": "Norway", "email": "zia.sarshar@gmail.com", "openingShares": 5334, "transfers": {}},
  {"stakeText": "0.02%", "shares": 5001, "name": "KORSMO", "firstName": "STEINAR HOEL", "investorId": "26/06/1965", "address": "SOLFJELLVEIEN 73", "address2": "", "postalCode": "1389", "city": "HEGGEDAL", "country": "Norway", "email": "Steinar.hoel.korsmo@gmail.com", "openingShares": 5001, "transfers": {}},
  {"stakeText": "0.01%", "shares": 4167, "name": "BLANKSON", "firstName": "BENTE HILMEN", "investorId": "19/01/1962", "address": "KLEIVVEIEN 69", "address2": "", "postalCode": "1356", "city": "BEKKESTUA", "country": "Norway", "email": "bente.hilmen.blankson@gmail.com", "openingShares": 4167, "transfers": {}},
  {"stakeText": "0.01%", "shares": 4002, "name": "LEVANG", "firstName": "ROGER ALEKSANDER", "investorId": "13098946742", "address": "BUHAGEN 10", "address2": "", "postalCode": "5541", "city": "KOLNES", "country": "Norway", "email": "roge.levang@hotmail.com", "openingShares": 4002, "transfers": {}},
  {"stakeText": "0.01%", "shares": 4002, "name": "HANSEN", "firstName": "BEN ARILD", "investorId": "08/09/1992", "address": "MILEVEIEN 18", "address2": "", "postalCode": "3090", "city": "HOF", "country": "Norway", "email": "benhansen@live.no", "openingShares": 4002, "transfers": {}},
  {"stakeText": "0.01%", "shares": 4002, "name": "TORSET", "firstName": "THOMAS", "investorId": "09/08/1983", "address": "OTERNESVEIEN 6", "address2": "", "postalCode": "6524", "city": "FREI", "country": "Norway", "email": "thomastorset@icloud.com", "openingShares": 4002, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3666, "name": "VÅGENES", "firstName": "ARNE REINHARD", "investorId": "06/10/1965", "address": "OTERÅSEN 22 A", "address2": "", "postalCode": "5914", "city": "ISDALSTØ", "country": "Norway", "email": "a.vaagenes@hotmail.com", "openingShares": 3666, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3333, "name": "GLOSLI", "firstName": "CATHRINE", "investorId": "02/07/1983", "address": "KVARTSVEIEN 23", "address2": "", "postalCode": "1435", "city": "ÅS", "country": "Norway", "email": "cathrine.glosli@gmail.com", "openingShares": 3333, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3333, "name": "BEFRING", "firstName": "DAGFRED", "investorId": "2065046558", "address": "BEFRINGSVEGEN 90", "address2": "", "postalCode": "6843", "city": "SKEI I JØLSTER", "country": "Norway", "email": "dagfredbefring@hotmail.com", "openingShares": 3333, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3333, "name": "Bricks & Walls AS", "firstName": "", "investorId": "933 434 842", "address": "BIODDGATEN 29", "address2": "", "postalCode": "4878", "city": "GRIMSTAD", "country": "Norway", "email": "bjart.andersen@gmail.com", "openingShares": 3333, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3333, "name": "MØLLER", "firstName": "RUNE YNDESTAD", "investorId": "1067726304", "address": "STEINGRIMS VEI 8 C", "address2": "", "postalCode": "1185", "city": "OSLO", "country": "Norway", "email": "runeymoller@gmail.com", "openingShares": 3333, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3126, "name": "SORTLAND", "firstName": "ODA CATHRINE", "investorId": "31/08/1990", "address": "LANGES GATE 4 A", "address2": "", "postalCode": "0165", "city": "OSLO", "country": "Norway", "email": "osortland@gmail.com", "openingShares": 3126, "transfers": {}},
  {"stakeText": "0.01%", "shares": 3087, "name": "AANELAND", "firstName": "ANAHITA RAHIMI", "investorId": "15/06/1986", "address": "GARTNERVEIEN 5", "address2": "", "postalCode": "1356", "city": "BEKKESTUA", "country": "Norway", "email": "Anahita.Aaneland@gmail.com", "openingShares": 3087, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2973, "name": "KVÅLE", "firstName": "ODDVAR", "investorId": "5054247100", "address": "STOKKANHAUGEN 179 C", "address2": "", "postalCode": "7048", "city": "TRONDHEIM", "country": "Norway", "email": "oddvar3@icloud.com", "openingShares": 2973, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2751, "name": "BREKKÅ", "firstName": "IVAR MASVIE", "investorId": "31019444557", "address": "LØVSETFARET 30", "address2": "", "postalCode": "1188", "city": "OSLO", "country": "Norway", "email": "ivarbrekka@gmail.com", "openingShares": 2751, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2667, "name": "GJELSVIK", "firstName": "TONE", "investorId": "30/05/1968", "address": "SANDDALSKOLLEN 15", "address2": "", "postalCode": "5225", "city": "NESTTUN", "country": "Norway", "email": "tone.gj@gmail.com", "openingShares": 2667, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2529, "name": "DAVID", "firstName": "ELDIN FRANCO", "investorId": "6037229391", "address": "RØSSLYNGVEIEN 8 B", "address2": "", "postalCode": "1812", "city": "ASKIM", "country": "Norway", "email": "eldind@outlook.com", "openingShares": 2529, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2499, "name": "HALVORSEN", "firstName": "TORIL", "investorId": "21105749470", "address": "FINN THORSAGERS VEI 6", "address2": "", "postalCode": "1360", "city": "FORNEBU", "country": "Norway", "email": "toril.ha@online.no", "openingShares": 2499, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2268, "name": "SELIMI", "firstName": "FLAMUR", "investorId": "07/01/1996", "address": "MØLLERGATA 3", "address2": "", "postalCode": "3320", "city": "VESTFOSSEN", "country": "Norway", "email": "flamur.10@hotmail.com", "openingShares": 2268, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2001, "name": "BHONDI", "firstName": "POONAM JANSEN", "investorId": "23/05/1990", "address": "SNIPP-MØLLERS VEI 19", "address2": "", "postalCode": "0687", "city": "OSLO", "country": "Norway", "email": "poonam.bhondi@gmail.com", "openingShares": 2001, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2001, "name": "JELLESTAD", "firstName": "TORSTEIN", "investorId": "09/06/1991", "address": "MIDTLIA 12", "address2": "", "postalCode": "5223", "city": "NESTTUN", "country": "Norway", "email": "Torstein.J@outlook.com", "openingShares": 2001, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2001, "name": "ANDERSEN", "firstName": "JEANETTE VIGGEN", "investorId": "17/02/1987", "address": "NYGÅRDSBAKKEN 4 J", "address2": "", "postalCode": "1482", "city": "NITTEDAL", "country": "Norway", "email": "jeaand@gmail.com", "openingShares": 2001, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2001, "name": "ARVANITIDIS", "firstName": "MICHAEL MIKALSEN", "investorId": "27019046961", "address": "SARS' GATE 54", "address2": "", "postalCode": "0564", "city": "OSLO", "country": "Norway", "email": "michael.arvanitidis@gmail.com", "openingShares": 2001, "transfers": {}},
  {"stakeText": "0.01%", "shares": 2001, "name": "KÅRIKSTAD", "firstName": "MARIANN KVÅLE", "investorId": "18/04/1959", "address": "HØLLEHEIVEIEN 5", "address2": "", "postalCode": "4640", "city": "SØGNE", "country": "Norway", "email": "mk-kaar@online.no", "openingShares": 2001, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1944, "name": "JENSEN", "firstName": "STIG OTTAR", "investorId": "26/11/1962", "address": "MEKKELSVINGEN 19", "address2": "", "postalCode": "7200", "city": "KYRKSÆTERØRA", "country": "Norway", "email": "post@stigottar.no", "openingShares": 1944, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1944, "name": "SKJELVIK", "firstName": "STIG", "investorId": "22067241510", "address": "HJORTESTIEN 3", "address2": "", "postalCode": "2100", "city": "SKARNES", "country": "Norway", "email": "stig@skjelvik.com", "openingShares": 1944, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1749, "name": "JELLESTAD", "firstName": "TOR", "investorId": "25/07/1962", "address": "BRENDAHAUGEN 17", "address2": "", "postalCode": "5652", "city": "ÅRLAND", "country": "Norway", "email": "tor.jellestad@haugnett.no", "openingShares": 1749, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1668, "name": "SÆBØ", "firstName": "PER EYSTEIN", "investorId": "30/11/1977", "address": "STENSBERGGATA 12", "address2": "", "postalCode": "0170", "city": "OSLO", "country": "Norway", "email": "pereystein@gmail.com", "openingShares": 1668, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1668, "name": "HAALAND", "firstName": "SIMEN KNUTSEN", "investorId": "10040390311", "address": "GULLVEGEN 1365", "address2": "", "postalCode": "5550", "city": "SVEIO", "country": "Norway", "email": "Simen.haaland@haugnett.no", "openingShares": 1668, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1668, "name": "AZIZI", "firstName": "ZEJDI", "investorId": "26079628963", "address": "Saueveien 25", "address2": "", "postalCode": "3404", "city": "Lier", "country": "Norway", "email": "zejdi_96@hotmail.com", "openingShares": 1668, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1668, "name": "HAALAND", "firstName": "SINDRE KNUTSEN", "investorId": "02/07/2001", "address": "KROSSLEITVEGEN 3", "address2": "", "postalCode": "5550", "city": "SVEIO", "country": "Norway", "email": "0207sindre@gmail.com", "openingShares": 1668, "transfers": {}},
  {"stakeText": "0.01%", "shares": 1668, "name": "SKANDINAVISK TEKNOLOGIUTVIKLING AS", "firstName": "", "investorId": "985475245", "address": "Broddes veg 25", "address2": "", "postalCode": "7021", "city": "TRONDHEIM", "country": "Norway", "email": "ivar.bliko@teknologiutvikling.no", "openingShares": 1668, "transfers": {}},
  {"stakeText": "0.00%", "shares": 1335, "name": "RUDI", "firstName": "GENTI", "investorId": "31089835553", "address": "FOSSILVEIEN 30", "address2": "", "postalCode": "3034", "city": "DRAMMEN", "country": "Norway", "email": "gentiagron123@gmail.com", "openingShares": 1335, "transfers": {}},
  {"stakeText": "0.00%", "shares": 1335, "name": "HAUGLAND", "firstName": "MARI DAGNY NORDSETH", "investorId": "06/11/1947", "address": "IDRETTSVEIEN 17 A", "address2": "", "postalCode": "1358", "city": "JAR", "country": "Norway", "email": "maridnh@hotmail.com", "openingShares": 1335, "transfers": {}},
  {"stakeText": "0.00%", "shares": 1335, "name": "ØGAARD HOLDING AS", "firstName": "", "investorId": "920347509", "address": "c/o Ellen Sofie Øgaard", "address2": "Løkkeveien 9D", "postalCode": "0253", "city": "OSLO", "country": "Norway", "email": "ellensofie@outlook.com", "openingShares": 1335, "transfers": {}},
  {"stakeText": "0.00%", "shares": 1335, "name": "VIGELAND", "firstName": "ESPEN", "investorId": "11/03/1975", "address": "BEITEVEIEN 6 C", "address2": "", "postalCode": "5019", "city": "BERGEN", "country": "Norway", "email": "vigeland@hotmail.com", "openingShares": 1335, "transfers": {}},
  {"stakeText": "0.00%", "shares": 1335, "name": "SARSHAR", "firstName": "NAZIF RAHMAN", "investorId": "1037323728", "address": "PARKENGA 18", "address2": "", "postalCode": "0957", "city": "OSLO", "country": "Norway", "email": "rahmansar@hotmail.com", "openingShares": 1335, "transfers": {}},
  {"stakeText": "0.00%", "shares": 1041, "name": "GURVIN", "firstName": "INGUNN", "investorId": "16057238864", "address": "NEDRE ULLEVÅL 5", "address2": "", "postalCode": "0850", "city": "OSLO", "country": "Norway", "email": "igurvin@gmail.com", "openingShares": 1041, "transfers": {}},
  {"stakeText": "0.00%", "shares": 993, "name": "TOFTING", "firstName": "ARILD", "investorId": "21/06/1964", "address": "SVINGEN 1 C", "address2": "", "postalCode": "1465", "city": "STRØMMEN", "country": "Norway", "email": "Arild@Tofting.net", "openingShares": 993, "transfers": {}},
  {"stakeText": "0.00%", "shares": 666, "name": "FORSBERG", "firstName": "JONAS AARSLAND", "investorId": "06/12/1992", "address": "ELGFARET 40", "address2": "", "postalCode": "1415", "city": "OPPEGÅRD", "country": "Norway", "email": "jonasaaforsberg@gmail.com", "openingShares": 666, "transfers": {}},
  {"stakeText": "0.00%", "shares": 624, "name": "MOLLAND", "firstName": "HÅVARD HUNDSTAD", "investorId": "16/03/1975", "address": "ØVREBØVEIEN 32", "address2": "", "postalCode": "4011", "city": "STAVANGER", "country": "Norway", "email": "hmolland@gmail.com", "openingShares": 624, "transfers": {}},
  {"stakeText": "0.00%", "shares": 534, "name": "TØNNESSEN", "firstName": "ANNE MARTINE HAVNEN", "investorId": "03/11/1988", "address": "HEKKVEIEN 10 A", "address2": "", "postalCode": "0571", "city": "OSLO", "country": "Norway", "email": "martineht@gmail.com", "openingShares": 534, "transfers": {}},
  {"stakeText": "0.00%", "shares": 237, "name": "AANDERAA", "firstName": "JOSTEIN", "investorId": "19/08/1962", "address": "LANDINGSVEIEN 13", "address2": "", "postalCode": "0770", "city": "OSLO", "country": "Norway", "email": "jostein.aanderaa@gmail.com", "openingShares": 237, "transfers": {}},
  {"stakeText": "0.00%", "shares": 228, "name": "LEVANG", "firstName": "MALIN MYRVOLL", "investorId": "28/02/2004", "address": "STØLSMYRVEGEN 25", "address2": "", "postalCode": "5542", "city": "KARMSUND", "country": "Norway", "email": "malilev2802@karmoyskolen.no", "openingShares": 228, "transfers": {}},
  {"stakeText": "0.00%", "shares": 150, "name": "SOLSTRAND", "firstName": "ISABELL LEVANG", "investorId": "", "address": "AUSTMANNAVEGEN 10 D", "address2": "", "postalCode": "5537", "city": "HAUGESUND", "country": "Norway", "email": "jintana-@hotmail.com", "openingShares": 150, "transfers": {}},
  {"stakeText": "0.00%", "shares": 147, "name": "SOLSTRAND", "firstName": "CELINE LEVANG", "investorId": "11/05/2001", "address": "AUSTMANNAVEGEN 10 D", "address2": "", "postalCode": "5537", "city": "HAUGESUND", "country": "Norway", "email": "celine-20011@live.no", "openingShares": 147, "transfers": {}},
  {"stakeText": "0.00%", "shares": 144, "name": "LEVANG", "firstName": "MILLA ANONG", "investorId": "11/05/1999", "address": "SALHUSVEGEN 27 C", "address2": "", "postalCode": "5529", "city": "HAUGESUND", "country": "Norway", "email": "Millalevang99@gmail.com", "openingShares": 144, "transfers": {}},
  {"stakeText": "0.00%", "shares": 144, "name": "SOLSTRAND", "firstName": "MARCUS LEVANG", "investorId": "15/12/1998", "address": "ÅRHAUGBAKKEN 72", "address2": "", "postalCode": "5541", "city": "KOLNES", "country": "Norway", "email": "marcus53@live.no", "openingShares": 144, "transfers": {}},
];

export type Shareholder = RawShareholder & {
  id: string;
  rank: number;
  kind: ShareholderKind;
  displayName: string;
  orgNr: string | null;
  contact: string | null;
  pct: number;
  cumPct: number;
};

export const SHARES_OUTSTANDING = 30_000_000;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function isCompanyRow(r: RawShareholder): boolean {
  const cleanId = r.investorId.replace(/\s+/g, "");
  return /^([89]\d{8})$/.test(cleanId);
}

function build(): Shareholder[] {
  const seen = new Map<string, number>();
  let cum = 0;
  return rawRows.map((r, i) => {
    const kind: ShareholderKind = isCompanyRow(r) ? "company" : "person";
    const pct = (r.shares / SHARES_OUTSTANDING) * 100;
    cum += pct;
    const displayName = r.firstName && kind === "person" ? `${r.name} ${r.firstName}` : r.name;
    let id = slug(`${r.name}-${r.firstName || i}`);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n + 1}`;
    return {
      ...r,
      id,
      rank: i + 1,
      kind,
      displayName,
      orgNr: kind === "company" ? r.investorId : null,
      contact: kind === "company" && r.firstName ? r.firstName : null,
      pct,
      cumPct: cum,
    };
  });
}

export const shareholders: Shareholder[] = build();

const registered = shareholders.reduce((s, h) => s + h.shares, 0);
const companies = shareholders.filter((h) => h.kind === "company");
const persons = shareholders.filter((h) => h.kind === "person");
const countries = new Map<string, number>();
for (const h of shareholders) {
  const c = h.country.startsWith("Norway") ? "Norway" : h.country;
  if (c) countries.set(c, (countries.get(c) ?? 0) + h.shares);
}
const top10 = shareholders.slice(0, 10).reduce((s, h) => s + h.pct, 0);

export const auroraEquity = {
  name: "Aurora Equity AS",
  orgNr: "938 395 063",
  asOf: "2026-10-24",
  shareClass: "Ordinary shares",
  sharesOutstanding: SHARES_OUTSTANDING,
  shareholders,
  summary: {
    holders: shareholders.length,
    companies: companies.length,
    persons: persons.length,
    companySharesPct: (companies.reduce((s, h) => s + h.shares, 0) / SHARES_OUTSTANDING) * 100,
    largest: shareholders[0],
    top10Pct: top10,
    countries: countries.size,
    domesticPct: ((countries.get("Norway") ?? 0) / SHARES_OUTSTANDING) * 100,
    registered,
  },
};

export type AuroraEquityRegister = typeof auroraEquity;
