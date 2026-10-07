import { create } from 'zustand';

interface VisitanteStore {
    id: number | null;
    alias: string | null;
    login: (id: number, alias: string) => void;
    logout: () => void;
}

export const useVisitanteStore = create<VisitanteStore>((set) => ({
    id: null,
    alias: null,
    login: (id, alias) => set({id, alias}),
    logout: () => set({id: null, alias: null}),
    })
)
