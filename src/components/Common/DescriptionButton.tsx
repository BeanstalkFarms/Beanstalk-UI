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
import { FontSize } from '~/components/App/muiTheme';

const GAP = 2;

/**
 * Shows a standard Button with various slots for standard sizing
 * and positioning of elements, like tooltips and tags.
 * 
 * Rewards dialog (Mow, Plant, Enroot, Claim All buttons)
 * Pick dialog (Pick, Pick and Deposit)
 * PillSelectField (provides buttons for things like DestinationField)
 * Governance page
 */
const DescriptionButton : React.FC<ButtonProps & {
  /** Title */
  title?: string;
  /** Description displayed below the title. */
  description?: string;
  /** Icon displayed next to the title. */
  icon?: React.ReactNode | string;
  /** Small element displayed on the right side of the button. */
  tag?: JSX.Element;
  /** Tooltip message to show next to the title if provided. */
  titleTooltip?: string;
  /** Whether the button is currently selected. */
  isSelected?: boolean;
  /** Props to apply to the first <Stack> that controls the button's internal layout. */
  StackProps?: MuiStackProps;
  /** Props applied to the title <Typography>. */
  TitleProps?: TypographyProps;
}> = ({
  title,
  description,
  icon,
  tag,
  isSelected,
  titleTooltip,
  StackProps,
  TitleProps,
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
      backgroundColor: isSelected ? '#F6FAFE' : null,
      '&:hover': {
        backgroundColor: isSelected ? '#F6FAFE' : null,
      },
    }}
    {...props}
  >
    <Stack direction="row" gap={0.5} justifyContent="space-between" alignItems="center" {...StackProps}>
      {/* Icon + Title */}
      <Stack gap={0.5}>
        <Tooltip title={titleTooltip || ''} placement="top" sx={{ pointerEvents: 'all' }}>
          <Stack direction="row" gap={0.25} alignItems="center">
            {icon && (
              <>
                {icon}&nbsp;
              </>
            )}
            <Typography variant="bodyMedium" {...TitleProps}>
              {title}
              {titleTooltip && (
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
        {description && (
          <Typography>
            {description}
          </Typography>
        )}
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
