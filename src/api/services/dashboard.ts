import { api } from '../client';
import { StandardResponse } from '../interfaces/Common';
import { DashboardData } from '../interfaces/Dashboard';

export async function getDashboard(): Promise<StandardResponse<DashboardData>> {
  const response = await api.get<StandardResponse<DashboardData>>('/dashboard');
  return response.data;
}
