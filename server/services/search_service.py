"""Search service with hybrid exact + semantic search using pgvector"""
import json
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from models.database import Package
from openai import OpenAI
from config import get_settings

settings = get_settings()

# Initialize OpenAI client with OpenRouter
openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)


class SearchService:
    """Hybrid search service combining exact match and semantic search"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def search_exact(self, query: str, limit: int = 5) -> List[Package]:
        """Exact/fuzzy keyword-based search across multiple fields"""
        search_term = f"%{query}%"
        
        # Use ILIKE for Case-Insensitive matching in PostgreSQL
        # Note: In Postgres, ILIKE is case-insensitive.
        results = self.db.query(Package).filter(
            Package.is_active == True,
            or_(
                Package.title.ilike(search_term),
                Package.destination.ilike(search_term),
                Package.description.ilike(search_term),
                Package.highlights.ilike(search_term),
                Package.tags.ilike(search_term)
            )
        ).limit(limit).all()
        
        return results
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI text-embedding-3-small via OpenRouter"""
        try:
            response = openai_client.embeddings.create(
                model="openai/text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []
    
    def search_semantic(self, query: str, limit: int = 5) -> List[Package]:
        """Semantic search using pgvector cosine distance"""
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        if not query_embedding:
            return []
        
        # Use pgvector's cosine_distance operator (<=>)
        # Note: cosine_distance = 1 - cosine_similarity
        # We want smallest distance (most similar)
        try:
            results = self.db.query(Package).filter(
                Package.is_active == True,
                Package.embedding.isnot(None)
            ).order_by(
                Package.embedding.cosine_distance(query_embedding)
            ).limit(limit).all()
            
            return results
        except Exception as e:
            print(f"Vector search error: {e}")
            return []
    
    def search_hybrid(self, query: str, limit: int = 5) -> List[Package]:
        """Hybrid search: try exact match first, fallback to semantic"""
        # Try exact match first
        exact_results = self.search_exact(query, limit=10)
        
        if len(exact_results) >= 1:
            # Enough exact results, return them
            results = exact_results[:limit]
        else:
            # Not enough exact results, add semantic results
            semantic_results = self.search_semantic(query, limit=10)
            
            # Combine and deduplicate
            seen_ids = set()
            combined = []
            
            for pkg in exact_results:
                if pkg.id not in seen_ids:
                    combined.append(pkg)
                    seen_ids.add(pkg.id)
            
            for pkg in semantic_results:
                if pkg.id not in seen_ids:
                    combined.append(pkg)
                    seen_ids.add(pkg.id)
            
            results = combined[:limit]
        
            results = combined[:limit]
        
        return results
    
    def get_package_by_id(self, package_id: str) -> Optional[Package]:
        """Get package by ID"""
        return self.db.query(Package).filter(Package.id == package_id).first()
