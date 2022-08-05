import React from 'react';
import { Button, ButtonProps, Stack, Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FontSize } from '../App/muiTheme';

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
  /** */
  tooltipTitle?: string;
}> = ({
  title,
  description,
  tooltipTitle,
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
        <Stack direction="row" gap={1} alignItems="center">
          <Tooltip title={tooltipTitle !== undefined ? tooltipTitle : ''} placement="top">
            <Typography variant="bodyMedium" display="flex" flexDirection="row" alignItems="center">
              {icon && (
                <>
                  {icon}&nbsp;
                </>
              )}
              {title}
              {tooltipTitle && (
                <>
                  &nbsp;
                  <HelpOutlineIcon
                    sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                  />
                </>
              )}
            </Typography>
          </Tooltip>
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
