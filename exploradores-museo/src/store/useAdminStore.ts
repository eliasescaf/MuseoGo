import {create} from 'zustand';

interface AdminStore {
    id: number | null;
    nombre: string | null;
    email: string | null;
    login: (id: number, nombre: string, email: string) => void;
    logout: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
    id: null,
    nombre: null,
    email: null,
    login: (id, nombre, email) => set({id, nombre, email}),
    logout: () => set({id:null, nombre:null, email:null})
})
)

