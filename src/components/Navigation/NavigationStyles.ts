import { makeStyles } from '@material-ui/core';
import { theme } from 'constants/index';

const drawerWidth = 280;

export const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  // Drawer
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    fontFamily: 'Futura',
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
  },
  currentPriceStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Nav overall
  NavSubheader: {
    fontFamily: 'Futura',
    lineHeight: '22px',
    // backgroundColor: '#fff',
  },
  Badge: {
    backgroundColor: theme.secondary,
    color: theme.accentText,
    fontSize: 11,
    padding: '2px 5px',
    borderRadius: 4,
    marginRight: 4,
  },
  // Nav links
  NavLinkHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  NavLinkTitle: {
    fontFamily: 'Futura, Helvetica',
    fontWeight: 800,
    fontSize: 14,
  },
  NavLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
  // Metrics
  metrics: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'end',
  },
  metric: {
    fontSize: 11,
    marginTop: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    color: '#555',
  },
  metricValue: {
    color: '#555',
  },
  // BIP Progress
  bipBadgeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContain: {
    width: 16,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    top: -5,
    left: 0,
  },
  progressPrimary: {
    position: 'absolute',
    top: -5,
    left: 0,
  },
});
