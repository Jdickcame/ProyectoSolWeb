// ==========================================================================
// AUTH STATE SIGNAL
// Signal global para el estado de autenticación de la aplicación
// ==========================================================================

import { signal, computed, effect } from '@angular/core';
import { User, UserRole } from '../models';

/**
 * Interface para el estado de autenticación
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Estado inicial de autenticación
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

/**
 * Signal de estado de autenticación (global)
 */
export const authState = signal<AuthState>(initialState);

/**
 * Computed signals derivados del estado de autenticación
 */
export const authComputed = {
  // Usuario actual
  currentUser: computed(() => authState().user),
  
  // Token actual
  currentToken: computed(() => authState().token),
  
  // ¿Está autenticado?
  isAuthenticated: computed(() => authState().isAuthenticated),
  
  // ¿Está cargando?
  isLoading: computed(() => authState().isLoading),
  
  // Rol del usuario actual
  userRole: computed(() => authState().user?.role ?? null),
  
  // ¿Es estudiante?
  isStudent: computed(() => authState().user?.role === UserRole.STUDENT),
  
  // ¿Es profesor?
  isTeacher: computed(() => authState().user?.role === UserRole.TEACHER),
  
  // ¿Es administrador?
  isAdmin: computed(() => authState().user?.role === UserRole.ADMIN),
  
  // Nombre completo del usuario
  fullName: computed(() => {
    const user = authState().user;
    if (!user) return '';
    return `${user.name} ${user.surname || ''}`.trim();
  }),
  
  // Avatar del usuario (o placeholder)
  userAvatar: computed(() => {
    const user = authState().user;
    return user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User');
  }),
};

/**
 * Funciones para actualizar el estado de autenticación
 */
export const authActions = {
  /**
   * Establecer el usuario autenticado
   */
  setUser: (user: User, token: string) => {
    authState.update(state => ({
      ...state,
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }));
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    authState.set(initialState);
  },

  /**
   * Establecer estado de carga
   */
  setLoading: (isLoading: boolean) => {
    authState.update(state => ({
      ...state,
      isLoading,
    }));
  },

  /**
   * Actualizar datos del usuario
   */
  updateUser: (updates: Partial<User>) => {
    authState.update(state => {
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...updates },
      };
    });
  },

  /**
   * Actualizar token
   */
  updateToken: (token: string) => {
    authState.update(state => ({
      ...state,
      token,
    }));
  },
};

/**
 * Effect para sincronizar con localStorage
 * NOTA: Este effect debe ser inicializado manualmente en un contexto de inyección
 */
export function initAuthStorageEffect() {
  return effect(() => {
    const state = authState();
    
    if (state.isAuthenticated && state.user && state.token) {
      localStorage.setItem('educonect_auth_user', JSON.stringify(state.user));
      localStorage.setItem('educonect_auth_token', state.token);
    } else {
      localStorage.removeItem('educonect_auth_user');
      localStorage.removeItem('educonect_auth_token');
    }
  });
}

/**
 * Función para restaurar sesión desde localStorage
 */
export const restoreAuthFromStorage = (): boolean => {
  try {
    const userJson = localStorage.getItem('educonect_auth_user');
    const token = localStorage.getItem('educonect_auth_token');
    
    if (userJson && token) {
      const user = JSON.parse(userJson) as User;
      authActions.setUser(user, token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error restoring auth from storage:', error);
    return false;
  }
};