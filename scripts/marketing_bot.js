// scripts/marketing_bot.js
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// 1. Configuración de API desde variables de entorno (.env)
const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

// 2. Base de datos de sitios web y sus respectivos tweets
// Puedes ir agregando tus nuevas páginas web aquí con sus respectivos textos.
const portfolioSites = [
  {
    name: "SmartRead",
    url: "https://smart-read-rouge.vercel.app", // Actualizar con la URL final de Vercel
    tweets: [
      "¿Cansado de que los PDFs te quemen los ojos a las 3 AM? Construí SmartRead, un lector con Modo Oscuro real y traductor integrado. Pruébalo gratis aquí: {url} 📚🌙 #Estudio #Universidad",
      "Tips de estudio: Deja de perder tiempo abriendo Google Translate. Con SmartRead, seleccionas el texto en el PDF y se traduce mágicamente. 100% gratis. Pruébalo: {url} 🚀",
      "¿Por qué los visores de PDF no tienen Modo Oscuro por defecto? Problema resuelto. Arrastra tu documento a SmartRead y lee sin sufrir. {url} 📖✨"
    ]
  },
  {
    name: "TuNuevaWebDeProductividad",
    url: "https://tu-nueva-web.vercel.app",
    tweets: [
      "¡Nueva herramienta lanzada! Una utilidad rápida y gratis para optimizar tu flujo de trabajo diario. Pruébala aquí: {url} ⚡️ #IndieHackers #Productividad",
      "Simplifica tus tareas diarias con nuestra nueva herramienta web gratuita. Sin registro, sin límites. Accede hoy: {url} 🚀"
    ]
  }
  // Puedes agregar más objetos de sitios aquí en el futuro
];

async function publishTweet() {
  // Validar si las credenciales existen
  if (!process.env.TWITTER_APP_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
    console.error("❌ Error: No se encontraron las credenciales de Twitter API en el archivo .env.");
    console.log("Por favor, asegúrate de crear un archivo .env en la raíz con:");
    console.log("TWITTER_APP_KEY=...\nTWITTER_APP_SECRET=...\nTWITTER_ACCESS_TOKEN=...\nTWITTER_ACCESS_SECRET=...");
    process.exit(1);
  }

  try {
    // Si se pasa un argumento por consola, por ejemplo: node marketing_bot.js TuNuevaWebDeProductividad
    const args = process.argv.slice(2);
    let selectedSite;

    if (args.length > 0) {
      const searchName = args[0].toLowerCase();
      selectedSite = portfolioSites.find(site => site.name.toLowerCase() === searchName);
    }

    // Si no se especificó o no se encontró, seleccionamos uno de forma aleatoria
    if (!selectedSite) {
      selectedSite = portfolioSites[Math.floor(Math.random() * portfolioSites.length)];
    }

    // Selecciona un tweet aleatorio del sitio seleccionado
    const tweetTemplate = selectedSite.tweets[Math.floor(Math.random() * selectedSite.tweets.length)];
    
    // Reemplaza el marcador de posición {url} por la URL del sitio
    const finalTweet = tweetTemplate.replace(/{url}/g, selectedSite.url);

    console.log(`🤖 Preparando tweet para [${selectedSite.name}]...`);
    
    // Publica en X
    await rwClient.v2.tweet(finalTweet);
    console.log("✅ Tweet publicado exitosamente:\n", finalTweet);
  } catch (error) {
    console.error("❌ Error al publicar en Twitter/X:", error);
  }
}

console.log("🤖 Iniciando Bot de Marketing Multisitio...");
publishTweet();
