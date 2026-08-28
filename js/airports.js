// Bulgarian Airports Data - 2026 - за Vercel
const airports = [
  {
    id: "sof",
    name: "Летище София",
    code: "SOF",
    city: "София",
    terminals: ["Т1", "Т2"],
    kissAndRide: {
      freeMinutes: 10,
      priceAfter: "5 лв / час",
      location: "Непосредствено преди бариерите за многоетажния паркинг на Т2",
      warning: "Престой над 10 мин се таксува. Паркирането в зоната е забранено."
    },
    parking: [
      { name: "P1 Краткосрочен Т2", price: "5 лв / час", type: "short" },
      { name: "P2 Многоетажен Т2", price: "5 лв / час / 35 лв / ден", type: "short" },
      { name: "P4 Дългосрочен", price: "20 лв / ден", type: "long" },
      { name: "P5 Икономичен (с шатъл)", price: "18 лв / ден", type: "long" }
    ],
    privateParking: [
      { name: "FlyPark София", price: "от 12 лв / ден", transfer: "2 трансфера включени", nightFee: "12 лв нощна такса 20:00-08:00" }
    ],
    payment: "На бариера - карта / кеш. ANPR камери."
  },
  {
    id: "var",
    name: "Летище Варна",
    code: "VAR",
    city: "Варна",
    terminals: ["Т1"],
    kissAndRide: { freeMinutes: 10, priceAfter: "3 лв / 30 мин", location: "Пред терминала" },
    parking: [
      { name: "P1 Краткосрочен", price: "3 лв / 30 мин / 6 лв / час" },
      { name: "P2 Дългосрочен", price: "25 лв / ден" }
    ],
    privateParking: [],
    payment: "На бариера"
  },
  {
    id: "boj",
    name: "Летище Бургас",
    code: "BOJ",
    city: "Бургас",
    terminals: ["Т1"],
    kissAndRide: { freeMinutes: 10, priceAfter: "3 лв / 30 мин", location: "Пред терминала" },
    parking: [
      { name: "P1 Краткосрочен", price: "3 лв / 30 мин" },
      { name: "Дългосрочен", price: "20-25 лв / ден (сезонно)" }
    ],
    privateParking: [],
    payment: "На бариера"
  },
  {
    id: "pdv",
    name: "Летище Пловдив",
    code: "PDV",
    city: "Пловдив",
    terminals: ["Т1"],
    kissAndRide: { freeMinutes: 15, priceAfter: "2 лв / час", location: "Пред терминала" },
    parking: [
      { name: "P1", price: "2 лв / час / 15 лв / ден" }
    ],
    privateParking: [],
    payment: "На място"
  }
];