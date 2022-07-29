import React from 'react';
import { Button, ButtonProps, Stack, Typography } from '@mui/material';

const GAP = 2;

/**
 * Used in:
 *  - Rewards dialog (Mow, Plant, Enroot, Claim All buttons)
 *  - Pick dialog (Pick, Pick and Deposit)
 *  - PillSelectField (provides buttons for things like DestinationField)
 */
const DescriptionButton : React.FC<ButtonProps & {
  /** */
  title?: string;
  /** */
  description?: string;
  /** */
  icon?: React.ReactNode | string;
  /** */
  selected?: boolean;
  /** */
  tag?: JSX.Element;
}> = ({
  title,
  description,
  selected,
  tag,
  icon,
  sx,
  ...props
}) => (
  <Button
    variant="outlined"
    color="secondary"
    {...props}
    sx={{
      textAlign: 'left',
      px: GAP,
      py: GAP,
      ...sx,
      // Prevents the button's flex properties from
      // changing the internal layout.
      display: 'block',
      color: 'inherit',
      backgroundColor: selected ? '#F6FAFE' : null,
      '&:hover': {
        backgroundColor: selected ? '#F6FAFE' : null,
      },
      height: 'auto'
    }}
  >
    <Stack direction="row" gap={0.5} justifyContent="space-between" alignItems="center">
      {/* Icon + Title */}
      <div>
        <Stack direction="row" gap={0.5} alignItems="center">
          {icon && (
            <Typography variant="bodyMedium">
              {/* FIXME: why the extra stack here? */}
              <Stack alignItems="center">
                {icon}
              </Stack>
            </Typography>
          )}
          <Typography variant="bodyMedium">
            {title}
          </Typography>
        </Stack>
        {/* Description */}
        <Typography variant="bodySmall">
          {description}
        </Typography>
      </div>
      {tag && (
        <div>
          {tag}
        </div>
      )}
    </Stack>
  </Button>
);

export default DescriptionButton;
