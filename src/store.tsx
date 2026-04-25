import {
  createContext, useContext, useReducer, useCallback,
  useEffect, ReactNode, Dispatch,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Sheet, KanbanCard, ColumnId } from './types';
import * as sheetsService from './sheetsService';
import * as cardsService from './cardsService';

// ── State ──────────────────────────────────────────────────────────────────

interface AppState {
  session: Session | null;
  sheets: Sheet[];
  activeSheetId: string | null;
  cards: KanbanCard[];
  visibleColumns: Set<ColumnId>;
  selectedCardId: string | null;
  theme: 'light' | 'dark';
  loading: boolean;
  globalTags: string[];
  activeTagFilters: string[];
}

const DEFAULT_VISIBLE: Set<ColumnId> = new Set([
  'backlog', 'started', 'in_progress', 'done', 'persistent',
]);

// ── Per-sheet tag persistence ──────────────────────────────────────────────
// Tags are scoped to each sheet. We store "manual" tags (created via the
// filter bar but not yet on any card) so they survive a page refresh.

function loadSheetTags(sheetId: string): string[] {
  try { return JSON.parse(localStorage.getItem(`kisal-tags-${sheetId}`) ?? '[]'); }
  catch { return []; }
}

function saveSheetTags(sheetId: string, tags: string[]) {
  localStorage.setItem(`kisal-tags-${sheetId}`, JSON.stringify(tags));
}

function deriveSheetTags(sheetId: string, cards: KanbanCard[]): string[] {
  const manual  = loadSheetTags(sheetId);
  const fromCards = cards.flatMap(c => c.tags ?? []);
  return [...new Set([...manual, ...fromCards])].sort();
}

// ── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_SHEETS'; payload: Sheet[] }
  | { type: 'SET_ACTIVE_SHEET'; payload: string | null }
  | { type: 'SET_CARDS'; payload: KanbanCard[] }
  | { type: 'ADD_SHEET'; payload: Sheet }
  | { type: 'REMOVE_SHEET'; payload: string }
  | { type: 'ADD_CARD'; payload: KanbanCard }
  | { type: 'UPDATE_CARD'; payload: KanbanCard }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'TOGGLE_COLUMN'; payload: ColumnId }
  | { type: 'SELECT_CARD'; payload: string | null }
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_GLOBAL_TAG'; payload: string }
  | { type: 'DELETE_GLOBAL_TAG'; payload: string }
  | { type: 'TOGGLE_TAG_FILTER'; payload: string }
  | { type: 'CLEAR_TAG_FILTERS' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SESSION': return { ...state, session: action.payload };
    case 'SET_SHEETS':  return { ...state, sheets: action.payload };

    // Switching sheets clears tags + filters — SET_CARDS will repopulate them
    case 'SET_ACTIVE_SHEET':
      return {
        ...state,
        activeSheetId: action.payload,
        globalTags: [],
        activeTagFilters: [],
      };

    // Cards loaded for a sheet — derive tags from those cards + stored manual tags
    case 'SET_CARDS': {
      const globalTags = state.activeSheetId
        ? deriveSheetTags(state.activeSheetId, action.payload)
        : [...new Set(action.payload.flatMap(c => c.tags ?? []))].sort();
      return { ...state, cards: action.payload, globalTags };
    }

    case 'ADD_SHEET': return { ...state, sheets: [...state.sheets, action.payload] };

    case 'REMOVE_SHEET': {
      // Clean up per-sheet tag storage
      localStorage.removeItem(`kisal-tags-${action.payload}`);
      const sheets = state.sheets.filter(s => s.id !== action.payload);
      const activeSheetId = state.activeSheetId === action.payload
        ? (sheets[0]?.id ?? null)
        : state.activeSheetId;
      return { ...state, sheets, activeSheetId };
    }

    case 'ADD_CARD': {
      const newTags = (action.payload.tags ?? []).filter(t => !state.globalTags.includes(t));
      const globalTags = newTags.length
        ? [...state.globalTags, ...newTags].sort()
        : state.globalTags;
      if (state.activeSheetId) saveSheetTags(state.activeSheetId, globalTags);
      return { ...state, cards: [...state.cards, action.payload], globalTags };
    }

    case 'UPDATE_CARD': {
      const cards    = state.cards.map(c => c.id === action.payload.id ? action.payload : c);
      const newTags  = (action.payload.tags ?? []).filter(t => !state.globalTags.includes(t));
      const globalTags = newTags.length
        ? [...state.globalTags, ...newTags].sort()
        : state.globalTags;
      if (state.activeSheetId && newTags.length) saveSheetTags(state.activeSheetId, globalTags);
      return { ...state, cards, globalTags };
    }

    case 'REMOVE_CARD':
      return {
        ...state,
        cards: state.cards.filter(c => c.id !== action.payload),
        selectedCardId: state.selectedCardId === action.payload ? null : state.selectedCardId,
      };

    case 'TOGGLE_COLUMN': {
      const next = new Set(state.visibleColumns);
      if (next.has(action.payload) && next.size > 1) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, visibleColumns: next };
    }

    case 'SELECT_CARD': return { ...state, selectedCardId: action.payload };
    case 'SET_THEME':   return { ...state, theme: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };

    case 'ADD_GLOBAL_TAG': {
      if (state.globalTags.includes(action.payload)) return state;
      const globalTags = [...state.globalTags, action.payload].sort();
      if (state.activeSheetId) saveSheetTags(state.activeSheetId, globalTags);
      return { ...state, globalTags };
    }

    case 'DELETE_GLOBAL_TAG': {
      const globalTags       = state.globalTags.filter(t => t !== action.payload);
      const activeTagFilters = state.activeTagFilters.filter(t => t !== action.payload);
      const cards            = state.cards.map(c =>
        c.tags?.includes(action.payload)
          ? { ...c, tags: c.tags.filter(t => t !== action.payload) }
          : c
      );
      if (state.activeSheetId) saveSheetTags(state.activeSheetId, globalTags);
      return { ...state, globalTags, activeTagFilters, cards };
    }

    case 'TOGGLE_TAG_FILTER': {
      const activeTagFilters = state.activeTagFilters.includes(action.payload)
        ? state.activeTagFilters.filter(t => t !== action.payload)
        : [...state.activeTagFilters, action.payload];
      return { ...state, activeTagFilters };
    }

    case 'CLEAR_TAG_FILTERS': return { ...state, activeTagFilters: [] };
    default: return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  actions: ReturnType<typeof makeActions>;
}

const AppContext = createContext<AppContextValue | null>(null);

function makeActions(state: AppState, dispatch: Dispatch<Action>) {
  return {
    async selectSheet(id: string) {
      dispatch({ type: 'SET_ACTIVE_SHEET', payload: id });
      dispatch({ type: 'SELECT_CARD', payload: null });
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const cards = await cardsService.fetchCards(id);
        dispatch({ type: 'SET_CARDS', payload: cards });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    async addSheet(title: string) {
      if (!state.session) return;
      const sheet = await sheetsService.createSheet(state.session.user.id, title);
      dispatch({ type: 'ADD_SHEET', payload: sheet });
      dispatch({ type: 'SET_ACTIVE_SHEET', payload: sheet.id });
      dispatch({ type: 'SET_CARDS', payload: [] });
    },

    async deleteSheet(id: string) {
      await sheetsService.deleteSheet(id);
      dispatch({ type: 'REMOVE_SHEET', payload: id });
    },

    async addCard(columnId: ColumnId, title: string) {
      if (!state.session || !state.activeSheetId) return;
      const colCards = state.cards.filter(c => c.column_id === columnId);
      const order    = colCards.length ? Math.max(...colCards.map(c => c.card_order)) + 1 : 0;
      const card     = await cardsService.createCard(
        state.session.user.id, state.activeSheetId, columnId, title, order,
      );
      dispatch({ type: 'ADD_CARD', payload: card });
    },

    async updateCard(updated: KanbanCard) {
      dispatch({ type: 'UPDATE_CARD', payload: updated });
      await cardsService.updateCard(updated.id, updated);
    },

    async moveCard(cardId: string, targetColumn: ColumnId, targetIndex: number) {
      const card = state.cards.find(c => c.id === cardId);
      if (!card) return;
      const updated: KanbanCard = { ...card, column_id: targetColumn, card_order: targetIndex };
      dispatch({ type: 'UPDATE_CARD', payload: updated });
      await cardsService.moveCard(cardId, targetColumn, targetIndex);
    },

    async deleteCard(id: string) {
      dispatch({ type: 'REMOVE_CARD', payload: id });
      await cardsService.deleteCard(id);
    },

    addGlobalTag(tag: string) {
      const t = tag.trim().toLowerCase();
      if (t) dispatch({ type: 'ADD_GLOBAL_TAG', payload: t });
    },

    async deleteGlobalTag(tag: string) {
      const affectedCards = state.cards.filter(c => c.tags?.includes(tag));
      dispatch({ type: 'DELETE_GLOBAL_TAG', payload: tag });
      await Promise.all(
        affectedCards.map(c =>
          cardsService.updateCard(c.id, { ...c, tags: c.tags!.filter(t => t !== tag) })
        )
      );
    },

    setTheme(theme: 'light' | 'dark') {
      localStorage.setItem('kisal-theme', theme);
      dispatch({ type: 'SET_THEME', payload: theme });
      applyTheme(theme);
    },
  };
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}

// ── Provider ───────────────────────────────────────────────────────────────

const initialState: AppState = {
  session:          null,
  sheets:           [],
  activeSheetId:    null,
  cards:            [],
  visibleColumns:   DEFAULT_VISIBLE,
  selectedCardId:   null,
  theme:            (localStorage.getItem('kisal-theme') as AppState['theme']) ?? 'dark',
  loading:          false,
  globalTags:       [],   // populated per-sheet when cards load
  activeTagFilters: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useCallback(() => makeActions(state, dispatch), [state, dispatch])();

  useEffect(() => {
    applyTheme(state.theme);
    supabase.auth.getSession().then(({ data }) => {
      dispatch({ type: 'SET_SESSION', payload: data.session });
      if (data.session) loadSheets(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      dispatch({ type: 'SET_SESSION', payload: session });
      if (session) loadSheets(session);
      else {
        dispatch({ type: 'SET_SHEETS', payload: [] });
        dispatch({ type: 'SET_ACTIVE_SHEET', payload: null });
        dispatch({ type: 'SET_CARDS', payload: [] });
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSheets(session: Session) {
    const sheets = await sheetsService.fetchSheets(session.user.id);
    dispatch({ type: 'SET_SHEETS', payload: sheets });
    if (sheets.length > 0) {
      dispatch({ type: 'SET_ACTIVE_SHEET', payload: sheets[0].id });
      const cards = await cardsService.fetchCards(sheets[0].id);
      dispatch({ type: 'SET_CARDS', payload: cards });
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
