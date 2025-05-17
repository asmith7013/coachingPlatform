// src/lib/api/client/school.ts
import { apiClient } from './base';
import { School, SchoolInput } from '@/lib/data-schema/zod-schema/core/school';
import { PaginatedResponse } from '@/lib/types/core/response';
import { CollectionResponse } from '@/lib/types/core/response';

export const schoolApiClient = {
  list: (params?: Record<string, any>) => 
    apiClient.getPaginated<School>('/schools', params),
  
  getById: (id: string) => 
    apiClient.get<CollectionResponse<School>>(`/schools/${id}`),
  
  create: (data: SchoolInput) => 
    apiClient.post<CollectionResponse<School>>('/schools', data),
  
  update: (id: string, data: Partial<SchoolInput>) => 
    apiClient.put<CollectionResponse<School>>(`/schools/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete<CollectionResponse>(`/schools/${id}`),
  
  bulkUpload: (data: SchoolInput[]) => 
    apiClient.post<CollectionResponse>('/schools/bulk-upload', data),
};