"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role: 'SUPER_ADMIN' | 'INSTITUTE_ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'ALUMNI' | 'EMPLOYER' | 'HR' | 'EMPLOYEE';
    institute?: number;
    course_mode?: 'ONLINE' | 'OFFLINE';
    employee_id?: string;
    profile?: {
        designation: string;
        department: string;
        date_of_joining: string;
        phone_number?: string;
        salary?: string | number;
        address?: string;
    };
}

interface AuthContextType {
    user: User | null;
    login: (tokens: { access: string; refresh: string }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await api.get('/users/me/');
            const userData = res.data;
            setUser(userData);
            localStorage.setItem('user_data', JSON.stringify(userData));
        } catch (error) {
            console.error("Auth check failed", error);
            setUser(null);
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (tokens: { access: string; refresh: string }) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
