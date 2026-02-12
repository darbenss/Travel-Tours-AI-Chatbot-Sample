"""Seed sample travel package data"""
import json
from db.session import get_db, init_db
from models.database import Package
from services.search_service import SearchService


# Sample package data
SAMPLE_PACKAGES = [
    {
        "title": "Hokkaido Winter Escape",
        "destination": "Sapporo, Otaru, Niseko (Japan / Jepang)",
        "price": 25000000,
        "description": "Nikmati keindahan musim dingin di Hokkaido! Paket ini mencakup ski di Niseko, mengunjungi festival salju Sapporo, jalan-jalan di kota pelabuhan Otaru yang romantis. Termasuk hot spring, makanan seafood segar, dan pemandangan salju yang menakjubkan.",
        "season": "Winter",
        "tags": "japan, hokkaido, ski, snow, winter, niseko, sapporo, otaru",
        "highlights": "⛷️ Ski resort kelas dunia di Niseko\n🎪 Festival Salju Sapporo\n🏰 Kota Otaru yang romantis\n♨️ Onsen (hot spring) tradisional\n🦀 Seafood segar Hokkaido"
    },
    {
        "title": "Tokyo Sakura Spring Tour",
        "destination": "Tokyo, Kyoto (Japan / Jepang)",
        "price": 22000000,
        "description": "Saksikan keindahan sakura mekar di musim semi! Tour ini mengunjungi Tokyo dan Kyoto di saat taman-taman penuh dengan bunga sakura. Termasuk kunjungan ke kuil tradisional, area modern Shibuya, dan pengalaman hanami (piknik di bawah sakura).",
        "season": "Spring",
        "tags": "japan, tokyo, kyoto, sakura, spring, cherry blossom, temple, hanami",
        "highlights": "🌸 Hanami di Ueno Park & Philosopher's Path\n⛩️ Kuil Fushimi Inari & Kinkakuji\n🗼 Tokyo Tower & Shibuya Crossing\n🍜 Food tour ramen dan sushi\n🎌 Pengalaman kimono tradisional"
    },
    {
        "title": "Bali Paradise Retreat",
        "destination": "Ubud, Seminyak, Nusa Penida (Bali, Indonesia)",
        "price": 8500000,
        "description": "Liburan santai di pulau dewata! Paket lengkap mencakup villa private dengan infinity pool, spa treatment, yoga session, snorkeling di Nusa Penida, dan sunset dinner di pantai Seminyak. Cocok untuk honeymoon atau quality time bersama keluarga.",
        "season": "Year-Round",
        "tags": "bali, indonesia, beach, tropical, spa, yoga, honeymoon, snorkeling, ubud, seminyak",
        "highlights": "🏖️ Private villa dengan infinity pool\n💆 Spa & massage treatment\n🧘 Yoga session di Ubud\n🐠 Snorkeling & manta ray di Nusa Penida\n🌅 Sunset dinner di pantai"
    },
    {
        "title": "Swiss Alps Adventure",
        "destination": "Zurich, Interlaken, Zermatt (Switzerland / Swiss)",
        "price": 45000000,
        "description": "Petualangan di pegunungan Alpen Swiss! Naik kereta Jungfraujoch ke Top of Europe, hiking di Interlaken, melihat Matterhorn yang ikonik di Zermatt. Termasuk menginap di chalet tradisional, chocolate factory tour, dan pemandangan yang spektakuler.",
        "season": "Summer",
        "tags": "switzerland, swiss, alps, mountain, hiking, zermatt, interlaken, matterhorn, jungfraujoch",
        "highlights": "🏔️ Jungfraujoch - Top of Europe\n🚂 Scenic train rides panoramic\n⛰️ Hiking dengan view Matterhorn\n🍫 Swiss chocolate factory tour\n🏠 Chalet tradisional Swiss"
    },
    {
        "title": "Santorini Summer Dream",
        "destination": "Santorini, Mykonos (Greece / Yunani)",
        "price": 35000000,
        "description": "Rasakan keajaiban pulau Santorini! White-washed buildings dengan blue domes, sunset terbaik di dunia di Oia, wine tasting di vineyard, dan beach clubs di Mykonos. Termasuk private yacht cruise dan seafood dinner dengan view caldera.",
        "season": "Summer",
        "tags": "greece, santorini, mykonos, island, beach, sunset, wine, yacht, mediterranean",
        "highlights": "🌅 Sunset legendaris di Oia\n⛵ Private yacht cruise\n🍷 Wine tasting di vineyard\n🏖️ Beach clubs di Mykonos\n🏛️ Ancient ruins & archaeology"
    }
]


def seed_packages():
    """Seed database with sample packages"""
    print("Seeding database with sample packages...")
    
    # Initialize database
    init_db()
    
    with get_db() as db:
        # Check if packages already exist
        existing_count = db.query(Package).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} packages. Skipping seed.")
            return
        
        # Create SearchService for generating embeddings
        search_service = SearchService(db)
        
        # Insert sample packages
        for pkg_data in SAMPLE_PACKAGES:
            # Generate embedding for the package
            text_for_embedding = f"{pkg_data['title']}. {pkg_data['description']}. {pkg_data['highlights']}"
            embedding = search_service.generate_embedding(text_for_embedding)
            
            # Create package
            package = Package(
                title=pkg_data['title'],
                destination=pkg_data['destination'],
                price=pkg_data['price'],
                description=pkg_data['description'],
                season=pkg_data['season'],
                tags=pkg_data['tags'],
                highlights=pkg_data['highlights'],
                is_active=True,
                embedding=embedding if embedding else None
            )
            
            db.add(package)
            print(f"Added: {package.title}")
        
        db.commit()
        print(f"Successfully seeded {len(SAMPLE_PACKAGES)} packages!")


if __name__ == "__main__":
    seed_packages()
