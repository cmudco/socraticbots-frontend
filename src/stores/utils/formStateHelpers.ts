export interface FormState<T = Record<string, unknown>> {
  isOpen: boolean;
  data: T;
  mode: 'create' | 'edit' | 'view';
}

export interface EditingState {
  editingId: string | null;
  editData: Record<string, unknown>;
}

export interface SearchState {
  searchTerm: string;
  isSearching: boolean;
}

export interface CollapsibleState {
  isCollapsed: boolean;
}

export const createFormState = <T>(initialData: T): FormState<T> => ({
  isOpen: false,
  data: initialData,
  mode: 'create',
});

export const createEditingState = (): EditingState => ({
  editingId: null,
  editData: {},
});

export const createSearchState = (): SearchState => ({
  searchTerm: '',
  isSearching: false,
});

export const createCollapsibleState = (collapsed = false): CollapsibleState => ({
  isCollapsed: collapsed,
});

type SetFunction = (partial: Record<string, unknown>) => void;

export const createFormActions = <T>(
  stateKey: string,
  initialData: T,
  resetCallback?: () => void
) => ({
  [`open${stateKey}`]: (data?: T, viewOnly?: boolean) => (set: SetFunction) =>
    set({
      [stateKey.toLowerCase()]: {
        isOpen: true,
        data: data || initialData,
        mode: viewOnly ? 'view' : data ? 'edit' : 'create',
      },
    }),
  [`close${stateKey}`]: () => (set: SetFunction) => {
    set({
      [stateKey.toLowerCase()]: {
        isOpen: false,
        data: initialData,
        mode: 'create',
      },
    });
    resetCallback?.();
  },
});

export const createEditingActions = (resetCallback?: () => void) => ({
  startEditing: (id: string, data: Record<string, unknown>) => (set: SetFunction) =>
    set({
      editingId: id,
      editData: data,
    }),
  cancelEdit: () => (set: SetFunction) => {
    set({
      editingId: null,
      editData: {},
    });
    resetCallback?.();
  },
  resetEdit: () => (set: SetFunction) =>
    set({
      editingId: null,
      editData: {},
    }),
});

type GetFunction = () => Record<string, unknown>;

export const createSearchActions = () => ({
  setSearchTerm: (term: string) => (set: SetFunction) => set({ searchTerm: term }),
  setIsSearching: (searching: boolean) => (set: SetFunction) => set({ isSearching: searching }),
  toggleSearch: () => (set: SetFunction, get: GetFunction) => {
    const { isSearching } = get();
    set({ isSearching: !isSearching });
  },
  clearSearch: () => (set: SetFunction) => set({ searchTerm: '', isSearching: false }),
});

export const createCollapsibleActions = (onCollapseChange?: (collapsed: boolean) => void) => ({
  setCollapsed: (collapsed: boolean) => (set: SetFunction, get: GetFunction) => {
    set({ isCollapsed: collapsed });
    onCollapseChange?.(collapsed);

    if (collapsed) {
      const currentState = get();
      const updates: Record<string, unknown> = {};

      if ('isSearching' in currentState) {
        updates.isSearching = false;
        updates.searchTerm = '';
      }

      if ('editingId' in currentState) {
        updates.editingId = null;
        updates.editData = {};
      }

      Object.keys(currentState).forEach(key => {
        if (key.includes('Modal') || key.includes('Form')) {
          const state = currentState[key];
          if (state && typeof state === 'object' && 'isOpen' in state) {
            updates[key] = { ...state, isOpen: false };
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    }
  },
  toggleCollapse: () => (set: SetFunction, get: GetFunction) => {
    const { isCollapsed } = get();
    const actions = createCollapsibleActions(onCollapseChange);
    actions.setCollapsed(!isCollapsed)(set, get);
  },
});

export const createFieldUpdaters = (fields: string[]) => {
  const updaters: Record<string, (value: unknown) => (set: SetFunction) => void> = {};

  fields.forEach(field => {
    const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
    updaters[`set${capitalizedField}`] = (value: unknown) => (set: SetFunction) =>
      set({ [field]: value });
  });

  return updaters;
};

export const createResetActions = (initialState: Record<string, unknown>) => ({
  resetAll: () => (set: SetFunction) => set(initialState),
  resetFields: (fields: string[]) => (set: SetFunction) => {
    const updates: Record<string, unknown> = {};
    fields.forEach(field => {
      if (field in initialState) {
        updates[field] = initialState[field];
      }
    });
    set(updates);
  },
});
