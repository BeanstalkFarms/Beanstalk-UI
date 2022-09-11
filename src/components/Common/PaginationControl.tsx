import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Box, Stack, styled } from '@mui/material';
import React from 'react';
import { BeanstalkPalette } from '../App/muiTheme';

const PaginationItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ isActive }) => ({
  height: '5px',
  minWidth: '20px',
  width: '100%',
  borderRadius: '5px',
  background: isActive
    ? BeanstalkPalette.logoGreen
    : BeanstalkPalette.lightestGrey,
  cursor: 'pointer',
}));

const PaginationArrow: React.FC<{
  disabled: boolean;
  isRightArrow?: boolean;
  onClick: () => void;
}> = ({ disabled, isRightArrow = false, onClick }) => (
  <KeyboardBackspaceIcon
    onClick={onClick}
    sx={{
      transform: `rotate(${isRightArrow ? '180' : '0'}deg)`,
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? BeanstalkPalette.lightGrey : BeanstalkPalette.black,
    }}
  />
);

interface Props {
  total: number;
  page: number;
  onPageClick: (page: number) => void;
  config?: {
    showNavigationButton?: boolean;
  };
}

const PaginationControl: React.FC<Props> = ({
  total,
  page,
  onPageClick,
  config: { showNavigationButton = true } = {},
}) => {
  const canDecrement = page > 0;
  const canIncrement = page < total - 1;

  return (
    <Stack direction="row" width="100%" alignItems="center" gap={1.5}>
      {showNavigationButton ? (
        <PaginationArrow
          disabled={!canDecrement}
          onClick={() => {
            canDecrement && onPageClick(page - 1);
          }}
        />
      ) : null}
      {Array(total)
        .fill(null)
        .map((_item, idx) => (
          <PaginationItem
            isActive={idx === page}
            onClick={() => onPageClick(idx)}
          />
        ))}
      {showNavigationButton ? (
        <PaginationArrow
          disabled={!canIncrement}
          onClick={() => {
            canIncrement && onPageClick(page + 1);
          }}
          isRightArrow
        />
      ) : null}
    </Stack>
  );
};

export default PaginationControl;
