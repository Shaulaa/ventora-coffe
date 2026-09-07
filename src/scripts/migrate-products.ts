// Script untuk migrate products dari dummy data ke Firestore
// Jalankan dengan: npx tsx src/scripts/migrate-products.ts

import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from "firebase/firestore";

// Baca .env.local secara manual
function getEnv(key: string): string {
  try {
    const envFile = readFileSync(".env.local", "utf-8");
    const lines = envFile.split("\n");
    for (const line of lines) {
      if (line.startsWith(`${key}=`)) {
        return line.split("=")[1].trim();
      }
    }
  } catch (e) {
    console.error("Error reading .env.local:", e);
  }
  return "";
}

// Initialize Firebase dengan env dari .env.local
const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase config:");
console.log("   Project ID:", firebaseConfig.projectId);
console.log("");

const products = [
  // SIGNATURE (15 items)
  { name: "Aroma Gula Aren", category: "Signature", price: 25000, description: "Espresso, susu segar, gula aren rumahan. Racikan signature yang jadi favorit.", icon: "☕", ratingAverage: 4.8 },
  { name: "Espresso Romance", category: "Signature", price: 28000, description: "Double espresso, vanilla syrup, steamed milk. Romantic vibes in a cup.", icon: "💝", ratingAverage: 4.9 },
  { name: "Hazelnut Latte", category: "Signature", price: 27000, description: "Espresso, hazelnut syrup, susu-microfoam. Nutty & creamy perfection.", icon: "🌰", ratingAverage: 4.7 },
  { name: "Caramel Macchiato", category: "Signature", price: 29000, description: "Vanilla, espresso, caramel drizzle, steamed milk. Sweet indulgence.", icon: "🍯", ratingAverage: 4.8 },
  { name: "Affogato Coffee", category: "Signature", price: 32000, description: "Espresso shot di atas vanilla ice cream. Dessert meets coffee.", icon: "🍨", ratingAverage: 4.9 },
  { name: "Kopi Tubruk Aroma", category: "Signature", price: 17000, description: "Cara seduh tradisional, kopi robusta pilihan. Authentic Indonesian taste.", icon: "🫘", ratingAverage: 4.4 },
  { name: "Vietnamese Drip", category: "Signature", price: 23000, description: "Kopi Vietnamese style, susu condensed, es batu. Bold & sweet.", icon: "☕", ratingAverage: 4.6 },
  { name: "Butter Coffee", category: "Signature", price: 26000, description: "Kopi butter blend, creamy texture. Energi tahan lama.", icon: "🧈", ratingAverage: 4.5 },
  { name: "Oreo Latte", category: "Signature", price: 28000, description: "Espresso, susu, remukan Oreo. Crunchy sweetness in every sip.", icon: "🥛", ratingAverage: 4.7 },
  { name: "Palm Sugar Latte", category: "Signature", price: 25000, description: "Espresso, susu, gula aren asli. Natural sweetness, Indonesian twist.", icon: "🌴", ratingAverage: 4.6 },
  { name: "Tiramisu Latte", category: "Signature", price: 30000, description: "Espresso, mascarpone, cocoa powder. Like dessert in a cup.", icon: "🍰", ratingAverage: 4.9 },
  { name: "Salt Caramel Latte", category: "Signature", price: 29000, description: "Espresso, caramel garam, steamed milk. Sweet-salty heaven.", icon: "🧂", ratingAverage: 4.8 },
  { name: "Brown Sugar Boba Latte", category: "Signature", price: 28000, description: "Espresso, susu, boba gula aren. Trending & delicious.", icon: "🧋", ratingAverage: 4.7 },
  { name: "Dirty Coffee", category: "Signature", price: 22000, description: "Espresso shot di atas susu dingin. Layered perfection.", icon: "💧", ratingAverage: 4.5 },
  { name: "Hazzelbrew Delight", category: "Signature", price: 31000, description: "Hazelnut, chocolate, espresso blend. Our house special.", icon: "✨", ratingAverage: 4.8 },

  // KLASIK (17 items)
  { name: "Kopi Susu Klasik", category: "Klasik", price: 20000, description: "Racikan sederhana yang selalu jadi favorit. Kenyal & creamy.", icon: "🥛", ratingAverage: 4.6 },
  { name: "Americano Dingin", category: "Klasik", price: 18000, description: "Espresso double shot, air dingin, tanpa gula. Clean & bold.", icon: "🧊", ratingAverage: 4.5 },
  { name: "Cappuccino", category: "Klasik", price: 22000, description: "Espresso, steamed milk, milk foam. Italian classic.", icon: "🥤", ratingAverage: 4.6 },
  { name: "Cafe Latte", category: "Klasik", price: 23000, description: "Espresso, susu steamed, foam tipis. Smooth & milky.", icon: "🍶", ratingAverage: 4.7 },
  { name: "Espresso Shot", category: "Klasik", price: 15000, description: "Single shot espresso. Bold, strong, no nonsense.", icon: "⚡", ratingAverage: 4.3 },
  { name: "Long Black", category: "Klasik", price: 19000, description: "Double espresso, air panas, crema tebal. Aussie style.", icon: "🖤", ratingAverage: 4.4 },
  { name: "Kopi Hitam", category: "Klasik", price: 16000, description: "Kopi tubruk pure, pahit authentic. Traditional vibes.", icon: "🪵", ratingAverage: 4.2 },
  { name: "Double Espresso", category: "Klasik", price: 20000, description: "Two shots of pure espresso. Maximum caffeine.", icon: "💪", ratingAverage: 4.4 },
  { name: "Flat White", category: "Klasik", price: 24000, description: "Double shot, susu steamed microfoam. Velvety smooth.", icon: "☁️", ratingAverage: 4.7 },
  { name: "Cortado", category: "Klasik", price: 21000, description: "Espresso, sedikit susu. Balanced & smooth.", icon: "🎯", ratingAverage: 4.5 },
  { name: "Gibraltar", category: "Klasik", price: 23000, description: "Double shot, susu steamed. San Francisco classic.", icon: "🏔️", ratingAverage: 4.6 },
  { name: "Mochaccino", category: "Klasik", price: 25000, description: "Espresso, chocolate, steamed milk. Chocolate coffee combo.", icon: "🍫", ratingAverage: 4.6 },
  { name: "Irish Coffee", category: "Klasik", price: 35000, description: "Espresso, Irish cream, whipped cream. Sophisticated treat.", icon: "🍀", ratingAverage: 4.8 },
  { name: "Turkish Coffee", category: "Klasik", price: 22000, description: "Seduh Turkish style, fine grind. Strong & aromatic.", icon: "🏺", ratingAverage: 4.5 },
  { name: "Iced Americano", category: "Klasik", price: 20000, description: "Espresso, air es, tanpa susu. Refreshing & bold.", icon: "🧋", ratingAverage: 4.4 },
  { name: "Black Eye Coffee", category: "Klasik", price: 22000, description: "Double espresso di atas drip coffee. Maximum boost.", icon: "👁️", ratingAverage: 4.5 },
  { name: "Red Eye Coffee", category: "Klasik", price: 24000, description: "Triple shot espresso di atas drip. For serious caffeine lovers.", icon: "🔴", ratingAverage: 4.6 },

  // NON-KOPI (20 items)
  { name: "Matcha Latte", category: "Non-Kopi", price: 23000, description: "Matcha grade ceremonial, susu creamy. Japanese green tea vibes.", icon: "🍵", ratingAverage: 4.7 },
  { name: "Taro Latte", category: "Non-Kopi", price: 24000, description: "Taro paste, susu segar, creamy texture. Purple perfection.", icon: "🟣", ratingAverage: 4.6 },
  { name: "Chocolate Lava", category: "Non-Kopi", price: 25000, description: "Belgian chocolate, steamed milk, whipped cream. Rich & decadent.", icon: "🍫", ratingAverage: 4.8 },
  { name: "Red Velvet Latte", category: "Non-Kopi", price: 24000, description: "Red velvet syrup, susu, cream cheese topping. Elegant & sweet.", icon: "❤️", ratingAverage: 4.5 },
  { name: "Fresh Orange Juice", category: "Non-Kopi", price: 20000, description: "Jeruk peras segar, no added sugar. Pure & refreshing.", icon: "🍊", ratingAverage: 4.4 },
  { name: "Lychee Tea", category: "Non-Kopi", price: 18000, description: "Teh melati, sirup lychee, strawberry slice. Floral & fruity.", icon: "🫧", ratingAverage: 4.3 },
  { name: "Mango Smoothie", category: "Non-Kopi", price: 26000, description: "Mango pilihan, yogurt, madu. Tropical paradise in a cup.", icon: "🥭", ratingAverage: 4.7 },
  { name: "Strawberry Milkshake", category: "Non-Kopi", price: 25000, description: "Strawberry segar, ice cream vanilla, susu. Sweet & creamy.", icon: "🍓", ratingAverage: 4.6 },
  { name: "Chocolate Milkshake", category: "Non-Kopi", price: 25000, description: "Chocolate syrup, ice cream, susu. Classic comfort drink.", icon: "🍫", ratingAverage: 4.7 },
  { name: "Avocado Shake", category: "Non-Kopi", price: 24000, description: "Alpukat matang, susu, madu. Creamy & nutritious.", icon: "🥑", ratingAverage: 4.5 },
  { name: "Lemon Tea", category: "Non-Kopi", price: 15000, description: "Teh segar, perasan lemon, es batu. Simple & refreshing.", icon: "🍋", ratingAverage: 4.2 },
  { name: "Ice Thai Tea", category: "Non-Kopi", price: 18000, description: "Teh Thailand, susu, es batu. Sweet & creamy Thai style.", icon: "🧋", ratingAverage: 4.4 },
  { name: "Green Tea Latte", category: "Non-Kopi", price: 22000, description: "Green tea, susu, less sugar option. Light & healthy.", icon: "🍵", ratingAverage: 4.5 },
  { name: "Yakult Soda", category: "Non-Kopi", price: 15000, description: "Yakult, soda, es batu. Probiotic refreshment.", icon: "🥤", ratingAverage: 4.3 },
  { name: "Es Krim Soda", category: "Non-Kopi", price: 20000, description: "Soda, ice cream scoop, syrup pilihan. Fun & fizzy.", icon: "🍦", ratingAverage: 4.5 },
  { name: "Coconut Water", category: "Non-Kopi", price: 18000, description: "Air kelapa segar, es batu. Natural hydration.", icon: "🥥", ratingAverage: 4.2 },
  { name: "Watermelon Juice", category: "Non-Kopi", price: 22000, description: "Semangka segar, no added sugar. Summer vibes.", icon: "🍉", ratingAverage: 4.4 },
  { name: "Pineapple Smoothie", category: "Non-Kopi", price: 24000, description: "Nanas segar, yogurt, madu. Tropical tangy goodness.", icon: "🍍", ratingAverage: 4.5 },
  { name: "Banana Shake", category: "Non-Kopi", price: 22000, description: "Pisang matang, susu, madu. Energy boost smoothie.", icon: "🍌", ratingAverage: 4.4 },
  { name: "Berry Blast Smoothie", category: "Non-Kopi", price: 28000, description: "Mixed berries, yogurt, honey. Antioxidant packed.", icon: "🫐", ratingAverage: 4.7 },

  // MAKANAN (15 items)
  { name: "Nasi Goreng Special", category: "Makanan", price: 35000, description: "Nasi goreng dengan telur, ayam suwir, kerupuk. Comfort food ultimate.", icon: "🍳", ratingAverage: 4.7 },
  { name: "Ayam Geprek", category: "Makanan", price: 32000, description: "Ayam crispy, sambal bawang, nasi putih. Pedas bikin nagih.", icon: "🍗", ratingAverage: 4.6 },
  { name: "Rice Bowl Teriyaki", category: "Makanan", price: 38000, description: "Ayam teriyaki, nasi, sayuran. Japanese vibes.", icon: "🍱", ratingAverage: 4.8 },
  { name: "Mie Goreng Jawa", category: "Makanan", price: 30000, description: "Mie goreng style Jawa, telur, sayur. Authentic taste.", icon: "🍝", ratingAverage: 4.5 },
  { name: "Chicken Katsu Curry", category: "Makanan", price: 42000, description: "Ayam katsu, kuah kari Jepang, nasi. Crispy & saucy.", icon: "🥘", ratingAverage: 4.8 },
  { name: "Spaghetti Aglio Olio", category: "Makanan", price: 35000, description: "Pasta, garlic, olive oil, chili flakes. Italian simplicity.", icon: "🍝", ratingAverage: 4.6 },
  { name: "Indomie Goreng Spesial", category: "Makanan", price: 25000, description: "Indomie goreng dengan telur, sosis, kerupuk. Indonesian comfort.", icon: "🍜", ratingAverage: 4.4 },
  { name: "Rice Bowl BBQ", category: "Makanan", price: 40000, description: "Ayam BBQ sauce, nasi, coleslaw. Smoky goodness.", icon: "🥩", ratingAverage: 4.7 },
  { name: "Ayam Bakar Madu", category: "Makanan", price: 38000, description: "Ayam bakar bumbu madu, nasi, lalapan. Sweet & savory.", icon: "🍗", ratingAverage: 4.8 },
  { name: "Spaghetti Carbonara", category: "Makanan", price: 38000, description: "Pasta, egg, parmesan, bacon. Creamy Italian classic.", icon: "🍝", ratingAverage: 4.7 },
  { name: "Tomyam Rice", category: "Makanan", price: 36000, description: "Nasi dengan kuah tomyam, seafood mix. Spicy Thai vibes.", icon: "🍲", ratingAverage: 4.6 },
  { name: "Chicken Salted Egg", category: "Makanan", price: 40000, description: "Ayam crispy, saus salted egg, nasi. Trending & delicious.", icon: "🥚", ratingAverage: 4.9 },
  { name: "Rice Bowl Blackpepper", category: "Makanan", price: 38000, description: "Ayam blackpepper, nasi, sayuran. Savory & spicy.", icon: "🥡", ratingAverage: 4.6 },
  { name: "Bubur Ayam", category: "Makanan", price: 25000, description: "Bubur nasi, ayam suwir, cakwe, kecap. Breakfast comfort.", icon: "🥣", ratingAverage: 4.5 },
  { name: "Lontong Sayur", category: "Makanan", price: 28000, description: "Lontong, sayur nangka, sambal, kerupuk. Betawi style.", icon: "🍛", ratingAverage: 4.4 },

  // CAMILAN (20 items)
  { name: "Croissant Almond", category: "Camilan", price: 22000, description: "Dipanggang tiap pagi, isian almond cream. Flaky perfection.", icon: "🥐", ratingAverage: 4.9 },
  { name: "Banana Nut Bread", category: "Camilan", price: 18000, description: "Banana cake moist, topping kacang walnut. Soft & nutty.", icon: "🍌", ratingAverage: 4.6 },
  { name: "Blueberry Muffin", category: "Camilan", price: 20000, description: "Muffin fluffy, blueberry segar imported. Bursting with berries.", icon: "🧁", ratingAverage: 4.7 },
  { name: "Chocolate Chip Cookie", category: "Camilan", price: 15000, description: "Freshly baked, chocolate chunk premium. Crispy edges, chewy center.", icon: "🍪", ratingAverage: 4.5 },
  { name: "Cheesecake Slice", category: "Camilan", price: 28000, description: "New York style, cream cheese, berry compote. Silky smooth.", icon: "🍰", ratingAverage: 4.9 },
  { name: "Pisang Goreng Keju", category: "Camilan", price: 16000, description: "Pisang crispy, topping keju mozzarella. Indonesian street food classic.", icon: "🍌", ratingAverage: 4.4 },
  { name: "French Fries", category: "Camilan", price: 18000, description: "Kentang crispy, saus pilihan (BBQ/sambal/mayo). Golden perfection.", icon: "🍟", ratingAverage: 4.3 },
  { name: "Chicken Wings", category: "Camilan", price: 28000, description: "Sayap ayam crispy, saus BBQ/sambal. Party snack essential.", icon: "🍗", ratingAverage: 4.6 },
  { name: "Croissant Chocolate", category: "Camilan", price: 20000, description: "Croissant dengan isian chocolate. Sweet breakfast option.", icon: "🥐", ratingAverage: 4.7 },
  { name: "Tartlet Buah", category: "Camilan", price: 25000, description: "Pastry shell, custard, fresh fruits. Light & fruity.", icon: "🥧", ratingAverage: 4.6 },
  { name: "Roti Bakar", category: "Camilan", price: 18000, description: "Roti panggang, selai pilihan (coklat/strawberry/keju). Simple comfort.", icon: "🍞", ratingAverage: 4.4 },
  { name: "Dimsum 6 Pcs", category: "Camilan", price: 32000, description: "Dimsum mix: hakau, siomay, hakka. Steamed fresh.", icon: "🥟", ratingAverage: 4.7 },
  { name: "Chicken Nuggets", category: "Camilan", price: 22000, description: "Nuggets ayam crispy, saus pilihan. Kids favorite.", icon: "🍗", ratingAverage: 4.3 },
  { name: "Onion Rings", category: "Camilan", price: 20000, description: "Bawang bombay crispy, saus ranch. Crunchy rings.", icon: "🧅", ratingAverage: 4.4 },
  { name: "Pancake Durian", category: "Camilan", price: 35000, description: "Pancake lembut, isian durian premium. King of fruits.", icon: "🥞", ratingAverage: 4.9 },
  { name: "Cireng", category: "Camilan", price: 15000, description: "Aci goreng crispy, saus rujak. Sundanese street food.", icon: "🍡", ratingAverage: 4.3 },
  { name: "Tahu Crispy", category: "Camilan", price: 12000, description: "Tahu goreng crispy, saus kecap sambal. Simple & addictive.", icon: "🧈", ratingAverage: 4.2 },
  { name: "Risoles", category: "Camilan", price: 18000, description: "Risoles renyah, isian ragut. Dutch-Indonesian heritage.", icon: "🥖", ratingAverage: 4.5 },
  { name: "Cinnamon Roll", category: "Camilan", price: 22000, description: "Roti gulung kayu manis, cream cheese frosting. Sweet aroma.", icon: "🌀", ratingAverage: 4.7 },
  { name: "Croffle", category: "Camilan", price: 25000, description: "Croissant waffle dengan topping pilihan. Trendy & crispy.", icon: "🧇", ratingAverage: 4.8 },
];

async function migrateProducts() {
  console.log("Starting products migration...\n");

  if (!firebaseConfig.projectId || firebaseConfig.projectId === "demo-project") {
    console.error("ERROR: Firebase config not loaded properly!");
    console.error("Please check your .env.local file");
    console.error("Make sure you're running this script from the project root");
    process.exit(1);
  }

  try {
    // Hapus semua products yang ada dulu
    console.log("Checking existing products...");
    const existing = await getDocs(collection(db, "products"));
    if (!existing.empty) {
      console.log(`   Found ${existing.size} existing products. Deleting...`);
      for (const docSnap of existing.docs) {
        await deleteDoc(doc(db, "products", docSnap.id));
      }
      console.log("   Deleted existing products\n");
    }

    // Tambah semua products
    console.log("Adding products to Firestore...\n");

    const categories = ["Signature", "Klasik", "Non-Kopi", "Makanan", "Camilan"];

    for (const category of categories) {
      const categoryProducts = products.filter(p => p.category === category);
      console.log(`${category} (${categoryProducts.length} items)`);

      for (const product of categoryProducts) {
        const docRef = await addDoc(collection(db, "products"), {
          ...product,
          ratingCount: 0,
          imageUrl: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`   + ${product.name}`);
      }
      console.log("");
    }

    console.log(`Migration complete! ${products.length} products inserted.`);
    console.log("\nNext steps:");
    console.log("   1. Check Firebase Console to verify products");
    console.log("   2. Run 'npm run dev' to start the app");
    console.log("   3. Test the menu page at http://localhost:3000/menu");

  } catch (error) {
    console.error("\nMigration failed:", (error as Error).message);
    console.error("\nCommon issues:");
    console.error("   1. Make sure Firestore Database is created in Firebase Console");
    console.error("   2. Make sure you added .env.local with correct credentials");
    console.error("   3. Wait a few minutes if you just enabled Firestore API");
    process.exit(1);
  }
}

migrateProducts();
