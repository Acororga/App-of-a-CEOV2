/**
 * MOCK SUPABASE CLIENT FOR LOCAL STORAGE
 * This mimics the Supabase client API but stores all data in localStorage.
 */

const LOCAL_STORAGE_KEY_PREFIX = 'ceov2_local_db_';

// Mock User Constants
const MOCK_USER = {
  id: 'local-user-uuid',
  email: 'local@example.com',
  user_metadata: {
    full_name: 'Local CEO'
  }
};

const MOCK_SESSION = {
  user: MOCK_USER,
  access_token: 'local-token',
  refresh_token: 'local-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600
};

// Helper to get data from localStorage
const getTableData = (tableName) => {
  const data = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${tableName}`);
  
  // Initialize profiles table with mock user if empty
  if (!data && tableName === 'profiles') {
    const profiles = [{
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      full_name: MOCK_USER.user_metadata.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}profiles`, JSON.stringify(profiles));
    return profiles;
  }
  
  return data ? JSON.parse(data) : [];
};

// Helper to save data to localStorage
const saveTableData = (tableName, data) => {
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${tableName}`, JSON.stringify(data));
};

// Helper to generate a UUID-like string
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

class LocalQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.isSingle = false;
    this.operation = 'select'; // 'select', 'insert', 'update', 'delete'
    this.payload = null;
  }

  select(columns) {
    this.operation = 'select';
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, value, type: 'eq' });
    return this;
  }

  in(column, values) {
    this.filters.push({ column, values, type: 'in' });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(payload) {
    this.operation = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  async then(onfulfilled) {
    let result = { data: null, error: null };
    const tableData = getTableData(this.tableName);

    if (this.operation === 'select') {
      let data = [...tableData];
      this.filters.forEach(filter => {
        if (filter.type === 'eq') {
          data = data.filter(item => item[filter.column] === filter.value);
        } else if (filter.type === 'in') {
          data = data.filter(item => filter.values.includes(item[filter.column]));
        }
      });
      if (this.isSingle) {
        result.data = data.length > 0 ? data[0] : null;
      } else {
        result.data = data;
      }
    } else if (this.operation === 'insert') {
      const newItems = Array.isArray(this.payload) ? this.payload : [this.payload];
      const insertedItems = newItems.map(item => ({
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item
      }));
      saveTableData(this.tableName, [...tableData, ...insertedItems]);
      result.data = Array.isArray(this.payload) ? insertedItems : insertedItems[0];
    } else if (this.operation === 'update') {
      let updatedData = [...tableData];
      let affectedItems = [];
      updatedData = updatedData.map(item => {
        let matches = true;
        this.filters.forEach(filter => {
          if (filter.type === 'eq' && item[filter.column] !== filter.value) matches = false;
          if (filter.type === 'in' && !filter.values.includes(item[filter.column])) matches = false;
        });
        if (matches) {
          const updatedItem = { ...item, ...this.payload, updated_at: new Date().toISOString() };
          affectedItems.push(updatedItem);
          return updatedItem;
        }
        return item;
      });
      saveTableData(this.tableName, updatedData);
      result.data = affectedItems;
      if (this.isSingle) result.data = affectedItems[0];
    } else if (this.operation === 'delete') {
      const newData = tableData.filter(item => {
        let matches = true;
        this.filters.forEach(filter => {
          if (filter.type === 'eq' && item[filter.column] !== filter.value) matches = false;
          if (filter.type === 'in' && !filter.values.includes(item[filter.column])) matches = false;
        });
        return !matches;
      });
      saveTableData(this.tableName, newData);
      result.error = null;
    }

    return onfulfilled ? onfulfilled(result) : result;
  }
}

export const localClient = {
  auth: {
    getUser: async () => {
      const isLoggedOut = localStorage.getItem('ceov2_logged_out') === 'true';
      if (isLoggedOut) return { data: { user: null }, error: null };
      return { data: { user: MOCK_USER }, error: null };
    },
    getSession: async () => {
      const isLoggedOut = localStorage.getItem('ceov2_logged_out') === 'true';
      if (isLoggedOut) return { data: { session: null }, error: null };
      return { data: { session: MOCK_SESSION }, error: null };
    },
    signOut: async () => {
      localStorage.setItem('ceov2_logged_out', 'true');
      return { error: null };
    },
    onAuthStateChange: (callback) => {
      const isLoggedOut = localStorage.getItem('ceov2_logged_out') === 'true';
      callback(isLoggedOut ? 'SIGNED_OUT' : 'SIGNED_IN', isLoggedOut ? null : MOCK_SESSION);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (tableName) => {
    return new LocalQueryBuilder(tableName);
  }
};
