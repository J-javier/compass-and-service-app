import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { CourseCreate, CourseResponse, CourseUpdate } from '@/types/api';

export function useCourses() {
  const [data, setData] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CourseResponse[]>('/courses/');
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const getCourse = useCallback(async (id: number) => {
    const res = await api.get<CourseResponse>(`/courses/${id}`);
    return res.data;
  }, []);

  const createCourse = useCallback(async (body: CourseCreate) => {
    const res = await api.post<CourseResponse>('/courses/', body);
    setData((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateCourse = useCallback(async (id: number, body: CourseUpdate) => {
    const res = await api.patch<CourseResponse>(`/courses/${id}`, body);
    setData((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res.data;
  }, []);

  const deleteCourse = useCallback(async (id: number) => {
    await api.delete(`/courses/${id}`);
    setData((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { data, loading, error, refetch, getCourse, createCourse, updateCourse, deleteCourse };
}
