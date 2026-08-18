import { api } from '../client';
import { StandardResponse } from '../interfaces/Common';
import {
  BrandingSettings,
  SecuritySettings,
  WorkflowSettings,
} from '../interfaces/Settings';

export async function getWorkflowSettings(): Promise<
  StandardResponse<WorkflowSettings>
> {
  const response = await api.get<StandardResponse<WorkflowSettings>>(
    '/settings/workflow',
  );
  return response.data;
}

export async function updateWorkflowSettings(
  body: WorkflowSettings,
): Promise<StandardResponse<WorkflowSettings>> {
  const response = await api.put<StandardResponse<WorkflowSettings>>(
    '/settings/workflow',
    body,
  );
  return response.data;
}

export async function getSecuritySettings(): Promise<
  StandardResponse<SecuritySettings>
> {
  const response = await api.get<StandardResponse<SecuritySettings>>(
    '/settings/security',
  );
  return response.data;
}

export async function updateSecuritySettings(
  body: SecuritySettings,
): Promise<StandardResponse<SecuritySettings>> {
  const response = await api.put<StandardResponse<SecuritySettings>>(
    '/settings/security',
    body,
  );
  return response.data;
}

export async function getBrandingSettings(): Promise<
  StandardResponse<BrandingSettings>
> {
  const response = await api.get<StandardResponse<BrandingSettings>>(
    '/settings/branding',
  );
  return response.data;
}

export async function updateBrandingSettings(
  body: BrandingSettings,
): Promise<StandardResponse<BrandingSettings>> {
  const response = await api.put<StandardResponse<BrandingSettings>>(
    '/settings/branding',
    body,
  );
  return response.data;
}
