import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { tours } from "./schema";

const seedData = [
    {
        title: "Europe Winter Wonderland",
        destination: "Switzerland, Austria, Germany (Europe / Eropa)",
        price: 35900000,
        description:
            "Experience the magic of European winter with visits to iconic Christmas markets, alpine villages, and breathtaking snowy landscapes. Liburan musim dingin di Eropa yang menakjubkan.",
        season: "Winter" as const,
        tags: "Mountain,Cultural,Christmas,Snow,Eropa,Winter",
        highlights: "Jungfraujoch excursion\nVienna Christmas Market\nNeuschwanstein Castle visit\nMunich city tour",
        imageUrl: "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=800",
        duration: "12 Days",
    },
    {
        title: "Japan Sakura Season",
        destination: "Tokyo, Kyoto, Osaka (Japan / Jepang)",
        price: 28500000,
        description:
            "Witness Japan's iconic cherry blossoms in full bloom. Visit ancient temples in Kyoto, explore bustling Tokyo, and savor authentic Japanese cuisine in Osaka. Nikmati musim semi Sakura di Jepang.",
        season: "Spring" as const,
        tags: "Cultural,Nature,Food,City,Jepang,Sakura",
        highlights: "Fushimi Inari Shrine\nShinjuku Gyoen Park\nOsaka Castle\nShinkansen Bullet Train ride",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
        duration: "10 Days",
    },
    {
        title: "Hokkaido Winter Escape",
        destination: "Sapporo, Otaru, Niseko (Japan / Jepang)",
        price: 32000000,
        description:
            "Enjoy the powder snow of Hokkaido. Skiing in Niseko, Sapporo Snow Festival, and fresh seafood in Otaru. Liburan musim dingin dan main salju di Hokkaido Jepang.",
        season: "Winter" as const,
        tags: "Snow,Skiing,Food,Nature,Jepang,Winter,Salju",
        highlights: "Niseko Ski Resort\nSapporo Snow Festival\nOtaru Canal\nCrab Buffet Dinner",
        imageUrl: "https://images.unsplash.com/photo-1542051841857-5f906991ddce?w=800",
        duration: "8 Days",
    },
    {
        title: "Bali Honeymoon Paradise",
        destination: "Bali, Indonesia",
        price: 15900000,
        description:
            "A romantic escape to the Island of Gods. Private villa stays, sunset dinners, couple spa treatments, and visits to Ubud's rice terraces. Bulan madu romantis di Bali.",
        season: "AllYear" as const,
        tags: "Beach,Romance,Spa,Cultural,Bali,Honeymoon",
        highlights: "Private Sunset Dinner at Jimbaran\nUbud Rice Terrace Swing\nTanah Lot Temple\nCouples Balinese Spa",
        imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
        duration: "7 Days",
    },
    {
        title: "Turkey Discovery",
        destination: "Istanbul, Cappadocia, Pamukkale (Turkey / Turki)",
        price: 22500000,
        description:
            "Discover the crossroads of East and West. Hot air balloon ride over Cappadocia, explore the Hagia Sophia, and bathe in Pamukkale's terraced pools. Jelajahi keindahan Turki.",
        season: "Autumn" as const,
        tags: "Cultural,Adventure,Historical,Nature,Turki",
        highlights: "Hot Air Balloon in Cappadocia\nHagia Sophia & Blue Mosque\nPamukkale Thermal Pools\nBosphorus Cruise",
        imageUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
        duration: "9 Days",
    },
    {
        title: "Maldives All-Inclusive Escape",
        destination: "Maldives (Maladewa)",
        price: 42000000,
        description:
            "Ultimate luxury on a private island atoll. Overwater villa, world-class diving and snorkeling, private beach dining. Liburan mewah di Maldives.",
        season: "AllYear" as const,
        tags: "Beach,Luxury,Diving,Romance,Maldives",
        highlights: "Overwater Villa Stay\nSnorkeling with Mantas\nSunset Dolphin Cruise\nUnderwater Restaurant Dinner",
        imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
        duration: "5 Days",
    },
    {
        title: "Korean Wave Experience",
        destination: "Seoul, Busan, Jeju Island (South Korea / Korea Selatan)",
        price: 19800000,
        description:
            "Immerse yourself in K-Culture. Visit K-drama filming locations, explore vibrant street markets, and relax on Jeju Island beaches. Wisata Korea Selatan dan K-Pop.",
        season: "AllYear" as const,
        tags: "Cultural,City,Food,Shopping,Korea,Kpop",
        highlights: "Gyeongbokgung Palace Hanbok Experience\nMyeongdong Street Food Tour\nJeju Island Sunrise Peak\nGamcheon Culture Village",
        imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800",
        duration: "8 Days",
    },
    {
        title: "New Zealand Adventure",
        destination: "Auckland, Queenstown, Rotorua (New Zealand / Selandia Baru)",
        price: 38500000,
        description:
            "Adrenaline meets nature. Bungee jumping in Queenstown, Hobbiton movie set tour, Milford Sound cruise. Petualangan alam di New Zealand.",
        season: "Summer" as const,
        tags: "Adventure,Nature,Mountain,Movie,New Zealand",
        highlights: "Hobbiton Movie Set Tour\nMilford Sound Cruise\nBungee Jumping in Queenstown\nRotorua Geothermal Park",
        imageUrl: "https://images.unsplash.com/photo-1469521669194-babb45599def?w=800",
        duration: "11 Days",
    },
    {
        title: "Dubai & Abu Dhabi Luxury",
        destination: "Dubai, Abu Dhabi, UAE (Uni Emirat Arab)",
        price: 25900000,
        description:
            "Experience Arabian luxury at its finest. Desert safari, Burj Khalifa visit, Ferrari World, and luxury shopping. Kemewahan Dubai dan Abu Dhabi.",
        season: "Winter" as const,
        tags: "Luxury,City,Shopping,Adventure,Dubai,UAE",
        highlights: "Burj Khalifa At The Top\nDesert Safari with BBQ Dinner\nSheikh Zayed Grand Mosque\nFerrari World",
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
        duration: "6 Days",
    },
];

async function main() {
    console.log("🌱 Seeding database...");

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const db = drizzle(pool);

    try {
        // Clear existing data in correct order (dependent tables first)
        console.log("🗑️  Clearing existing bookings...");
        await db.execute(sql`DELETE FROM bookings`);

        console.log("🗑️  Clearing existing conversations...");
        await db.execute(sql`DELETE FROM conversations`);

        console.log("🗑️  Clearing existing messages...");
        await db.execute(sql`DELETE FROM messages`);

        console.log("🗑️  Clearing existing tours...");
        await db.delete(tours);

        // Insert seed data
        console.log("📦 Inserting tour packages...");
        await db.insert(tours).values(seedData);

        console.log(`✅ Successfully seeded ${seedData.length} tour packages.`);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        throw error;
    } finally {
        await pool.end();
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
