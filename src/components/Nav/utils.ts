import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

export function useSeasonTableStyles() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  return {
    season: {
      width: isMobile ? '15%' : '12.5%',
      alignItems: 'flex-start',
    },
    newBeans: {
      width: isMobile ? '22.5%' : '15%',
      alignItems: 'flex-end',
    },
    newSoil: {
      width: isMobile ? '27.5%' : '15%',
      alignItems: 'flex-end',
    },
    temperature: {
      width: isMobile ? '35%' : '25%',
      alignItems: 'flex-end',
    },
    podRate: {
      width: isMobile ? '0%' : '15%',
      display: isMobile ? 'none' : undefined,
      alignItems: 'flex-end',
    },
    deltaDemand: {
      width: isMobile ? '0%' : '17.5%',
      display: isMobile ? 'none' : undefined,
      alignItems: 'flex-end',
    },
  };
}
