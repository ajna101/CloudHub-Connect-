import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { login as apiLogin } from '../../services/api';

interface AuthUser {
  token: string;
  role: string;
  employeeId: string | null;
  userId: number;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const employeeId = localStorage.getItem('employeeId');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    if (token && role && userId) {
      setUser({ token, role, employeeId, userId: parseInt(userId), name: name || '' });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const { access_token, role, employee_id, user_id, name } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('role', role);
    localStorage.setItem('employeeId', employee_id || '');
    localStorage.setItem('userId', user_id.toString());
    localStorage.setItem('name', name || '');
    setUser({ token: access_token, role, employeeId: employee_id, userId: user_id, name });

    if (role === 'admin' || role === 'manager') {
      router.push('/admin/dashboard');
    } else {
      router.push('/employee/dashboard');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isManager: user?.role === 'manager',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
