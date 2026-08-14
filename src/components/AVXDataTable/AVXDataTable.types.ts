import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

export interface AVXDataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading?: boolean;
  /** Total row count across all pages (server-side pagination). */
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  /** Resolve a stable row id. Defaults to the `_id` field. */
  getRowId?: (row: T) => string;
  pageSizeOptions?: number[];
}
