import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

export default function Marketplace() {
    const [plots] = useDemoData({ placeInLine: 12000000, pricePerPod: 0.21, amountPods: 12000, expiresIn: 1300000 });

    return (
      <div>
        <DataGrid
          {...plots}
          components={{
              Toolbar: GridToolbar,
           }}
          initialState={{
             filter: {
              filterModel: {
                items: [
                {
                  columnField: 'commodity',
                  operatorValue: 'contains',
                  value: 'rice',
                },
              ],
            },
          },
        }}
      />
      </div>
    );
}
