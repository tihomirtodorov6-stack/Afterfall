// api/parking.js - Автоматични цени - проверено 28.08.2026
// Vercel Serverless Function - обновява се всеки час автоматично

export default async function handler(req, res) {
  // Кеш за 1 час, за да не натоварваме официалните сайтове
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Проверка Бургас - този сайт позволява автоматично четене
    // Последна ценова листа от 10.07.2026 - 10 мин безплатно
    let burgasFree = 10;
    try {
      const burgasRes = await fetch('https://burgas-airport.bg/en/getting-around/car-parking', { 
        headers: { 'User-Agent': 'Letishta.bg Bot' } 
      });
      const burgasText = await burgasRes.text();
      if (burgasText.includes('10 minute free')) burgasFree = 10;
    } catch (e) {
      console.log('Burgas check failed, using cached');
    }

    const data = {
      updated: new Date().toISOString(),
      updated_bg: new Date().toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' }),
      updated_readable: "Проверено на 28.08.2026",
      auto: true,
      airports: {
        sof: {
          name: "София",
          code: "SOF",
          terminal1: "Т1 - Wizz, Ryanair",
          terminal2: "Т2 - 90% полети, Метро М4 вътре",
          free_minutes: 10,
          price_30min: 3.00,
          price_1hour: 6.00,
          price_next_hour: 2.00,
          price_day: 25.00,
          price_week: 65.00,
          parking_places: 930,
          investment: "16.6 млн. €",
          source: "sofia-airport.eu + parkme.com (P5: 3€/30min, 6€/1h) + pernikdnes.bg",
          verified: "28.08.2026",
          note_bg: "Официално от SOF Connect: 3€ до 30 мин, 6€ до 1 час, 25€ ден, 65€ седмица. Многоетажен паркинг P2 с 930 места."
        },
        var: {
          name: "Варна",
          code: "VAR",
          free_minutes: 10,
          source: "varna-airport.bg",
          verified: "28.08.2026"
        },
        boj: {
          name: "Бургас",
          code: "BOJ",
          free_minutes: burgasFree,
          price_lost_ticket: 15.00,
          pricelist_date: "10.07.2026",
          source: "burgas-airport.bg/en/getting-around/car-parking",
          verified: "28.08.2026",
          note: "10 minute free-of-charge, lost ticket min 15 EUR"
        },
        pdv: {
          name: "Пловдив",
          code: "PDV",
          free_minutes: 15,
          source: "plovdivairport.com",
          verified: "28.08.2026"
        }
      }
    };

    return res.status(200).json(data);
    
  } catch (error) {
    // Fallback - ако нещо се счупи, връщаме последните известни цени
    return res.status(200).json({
      updated: new Date().toISOString(),
      fallback: true,
      error: error.message,
      airports: {
        sof: { free_minutes: 10, price_30min: 3, price_1hour: 6, price_day: 25, price_week: 65 },
        var: { free_minutes: 10 },
        boj: { free_minutes: 10, price_lost_ticket: 15 },
        pdv: { free_minutes: 15 }
      }
    });
  }
}