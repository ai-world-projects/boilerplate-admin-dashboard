'use client';

import { Box } from '@mui/material';
import { DataGrid, type GridValidRowModel } from '@mui/x-data-grid';
import type { AVXDataTableProps } from './AVXDataTable.types';

/**
 * Thin, opinionated wrapper around MUI X DataGrid configured for server-side
 * pagination — the default pattern for admin lists backed by a paginated API.
 * Styling is centralised here so every table in the app looks identical.
 */
export default function AVXDataTable<T extends GridValidRowModel>({
  rows,
  columns,
  loading = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  getRowId = (row) => String((row as Record<string, unknown>)._id),
  pageSizeOptions = [10, 25, 50],
}: AVXDataTableProps<T>) {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={getRowId}
        rowCount={rowCount}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        disableRowSelectionOnClick
        disableColumnMenu
        autoHeight
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          // Vertically center the content of every cell (icons, chips, text).
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: '#f7f8fa',
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
}
