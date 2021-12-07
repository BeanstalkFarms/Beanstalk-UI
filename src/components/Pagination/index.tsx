import React from 'react';
import { Button } from '@material-ui/core';

const Pagination = ({ plotsPerPage, totalPlots, paginate }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalPlots / plotsPerPage); i += 1) {
        pageNumbers.push(i);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {
          pageNumbers.map((num) => (
            <Button key={num} onClick={() => paginate(num)}>
              {num}
            </Button>
            )
          )
        }
      </div>
    );
};

export default Pagination;
