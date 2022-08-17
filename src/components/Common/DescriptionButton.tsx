import React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Stack,
  Tooltip,
  Typography,
  StackProps as MuiStackProps,
  TypographyProps
} from '@mui/material';
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
  /** */
  StackProps?: MuiStackProps;
  /** */
  TitleProps?: TypographyProps;
}> = ({
  title,
  description,
  tooltipTitle,
  selected,
  StackProps,
  TitleProps,
  tag,
  icon,
  sx,
  ...props
}) => (
  <Button
    variant="outlined"
    color="secondary"
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
    {...props}
  >
    <Stack direction="row" gap={0.5} justifyContent="space-between" alignItems="center" {...StackProps}>
      {/* Icon + Title */}
      <Stack gap={0.5}>
        <Tooltip title={tooltipTitle || ''} placement="top" sx={{ pointerEvents: 'all' }}>
          <Stack direction="row" gap={0.25} alignItems="center">
            {icon && (
              <>
                {icon}&nbsp;
              </>
            )}
            <Typography variant="bodyMedium" {...TitleProps}>
              {title}
              {tooltipTitle && (
                <>
                  &nbsp;
                  <HelpOutlineIcon
                    sx={{ color: 'text.secondary', fontSize: FontSize.sm, display: 'inline' }}
                  />
                </>
              )}
            </Typography>
          </Stack>
        </Tooltip>
        {/* Description */}
        <Typography>
          {description}
        </Typography>
      </Stack>
      {tag && (
        <Box sx={{ flexWrap: 'nowrap' }}>
          {tag}
        </Box>
      )}
    </Stack>
  </Button>
);

export default DescriptionButton;
