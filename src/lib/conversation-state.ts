/**
 * Conversation State Management
 * Tracks tour search results, selected tours, and search criteria across conversation turns
 */

export interface ConversationState {
    // Last search results (limited to 5 most recent)
    lastSearchResults?: Array<{
        id: number;
        title: string;
        destination: string;
        price: number;
    }>;

    // Currently selected tour ID (when user says "I want this one")
    selectedTourId?: number;

    // Last search criteria (for context continuity)
    lastSearchCriteria?: {
        destination?: string;
        season?: string;
        maxPrice?: number;
        tags?: string;
    };

    // Updated timestamp
    updatedAt?: string;
}

/**
 * Parse conversation state from JSON string
 */
export function parseConversationState(stateJson: string | null): ConversationState {
    if (!stateJson) return {};

    try {
        return JSON.parse(stateJson);
    } catch (error) {
        console.error("[ConversationState] Failed to parse state:", error);
        return {};
    }
}

/**
 * Serialize conversation state to JSON string
 */
export function serializeConversationState(state: ConversationState): string {
    return JSON.stringify({
        ...state,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Build context string to inject into system prompt
 */
export function buildStateContext(state: ConversationState): string {
    const parts: string[] = [];

    if (state.lastSearchResults && state.lastSearchResults.length > 0) {
        parts.push("\n## CONTEXT: Recent Search");
        parts.push(`Showed ${state.lastSearchResults.length} tours:`);
        state.lastSearchResults.slice(0, 3).forEach((tour, index) => {
            parts.push(`${index + 1}. ID=${tour.id}: ${tour.title} (Rp ${(tour.price / 1000000).toFixed(1)}jt)`);
        });
    }

    if (state.selectedTourId) {
        const selectedTour = state.lastSearchResults?.find(t => t.id === state.selectedTourId);
        if (selectedTour) {
            parts.push(`\n⚠️ BOOKING READY: Tour ID ${state.selectedTourId} (${selectedTour.title})`);
            parts.push(`When user gives name+WhatsApp → call captureLead with tourId: ${state.selectedTourId}`);
        }
    }

    return parts.length > 0 ? `\n${parts.join("\n")}` : "";
}

/**
 * Update state with new search results
 */
export function updateStateWithSearchResults(
    state: ConversationState,
    results: Array<{ id: number; title: string; destination: string; price: number }>,
    criteria: { destination?: string; season?: string; maxPrice?: number; tags?: string }
): ConversationState {
    return {
        ...state,
        lastSearchResults: results.slice(0, 5), // Keep only top 5
        lastSearchCriteria: criteria,
        selectedTourId: results.length === 1 ? results[0].id : undefined, // Auto-select if only one result
    };
}

/**
 * Update state with selected tour
 */
export function updateStateWithSelectedTour(
    state: ConversationState,
    tourId: number
): ConversationState {
    return {
        ...state,
        selectedTourId: tourId,
    };
}

/**
 * Clear state after booking completion
 */
export function clearBookingState(state: ConversationState): ConversationState {
    return {
        ...state,
        selectedTourId: undefined,
        // Keep search results for reference
    };
}
