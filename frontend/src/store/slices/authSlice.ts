import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// 1. Definir la interfaz del estado inicial
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// 2. Definir el estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// 3. Crear el Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Acción para guardar la sesión al hacer Login
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    // Acción para cerrar sesión
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

// 4. Exportar las acciones para usarlas en los componentes
export const { setCredentials, logout } = authSlice.actions;

//Asi seria sin funcion flecha
// export function selectIsAuthenticated(state: RootState) {
//   return state.auth.isAuthenticated;
// }
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

// export const selectInitialized = (state: RootState) => state.auth.initialized;

export const selectUser = (state: RootState) => state.auth.user;

// 5. Exportar el reducer para registrarlo en el store
export default authSlice.reducer;
