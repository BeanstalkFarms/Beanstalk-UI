import { makeStyles } from '@mui/styles';
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
    zIndex: 12,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
  },
  logoPriceBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beanLogoLink: {
    display: 'block',
    paddingTop: 4
  },
  beanLogoImage: {
    marginTop: 0
  },
  // Nav overall
  NavSubheader: {
    fontFamily: 'Futura',
    lineHeight: '22px',
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
    marginRight: 8
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
    opacity: 0.3
  },
  progressPrimary: {
    position: 'absolute',
    top: -5,
    left: 0,
  },
  blockDisplay: {
    display: 'block'
  }
});
