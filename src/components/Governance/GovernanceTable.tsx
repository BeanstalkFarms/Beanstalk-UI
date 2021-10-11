import React, { Fragment, useState } from 'react'
import {
  AppBar,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import {
  bipsList,
  GOVERNANCE_EMERGENCY_PERIOD,
  GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR,
  GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR,
  GOVERNANCE_EXPIRATION
} from '../../constants'
import { percentForStalk } from '../../util'
import { QuestionModule } from '../Common'
import CircularProgressWithLabel from './CircularProgressWithLabel'

export default function GovernanceTable(props) {
  return (
    <div style={props.style}>
      <BipTable {...props} />
    </div>
  )
}

const useStyles = makeStyles({
  table: {
    margin: '9px',
    width: 'auto'
  },
  pagination: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    display: 'inline-block',
    fontFamily: 'Futura-Pt-Book',
    fontSize: '20px',
    marginTop: '10px',
    textAlign: 'center',
    width: '100%'
  },
  cell: {
    fontFamily: 'Futura-PT'
  },
  cellTitle: {
    fontFamily: 'Futura-PT-Book'
  },
  inputModule: {
    backgroundColor: '#F5FAFF',
    borderRadius: '25px',
    color: 'black',
    marginTop: '18px',
    maxWidth: '800px',
    padding: '10px 10px 20px 10px'
  }
})

const BipTable = (props) => {
  const classes = useStyles()

  const [page, setPage] = useState(0)
  const rowsPerPage = 5
  const handleChangePage = (event, newPage) => { setPage(newPage) }

  let titles = ['BIP', 'Title', 'Status', '% Voted']
  const tableBips = props.bips.reduce((tableBips,bip) => {
    let voteProportion = bip.roots.dividedBy(props.totalStalk)
    const bipID = bip.id
    const tb = {
      BIP: bipID.toString(),
      title: bipsList.length > bipID ? bipsList[bipID].title : `BIP-${bipID}`
    }
    if (bip.executed) {
      tb.status = 'Commited'
    } else if (bip.start.plus(bip.period).plus(GOVERNANCE_EXPIRATION).isLessThanOrEqualTo(props.season)) {
      tb.status = 'Failed'
    } else if (bip.start.plus(bip.period).isLessThanOrEqualTo(props.season)) {
      tb.status = voteProportion.isGreaterThan(0.5) ? 'Commitable' : 'Failed'
    } else if (bip.timestamp.plus(GOVERNANCE_EMERGENCY_PERIOD).isLessThanOrEqualTo(new Date().getTime() / 1000)
               && voteProportion.isGreaterThanOrEqualTo(GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR / GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR)) {
      tb.status = 'Emergency Committable'
    } else {
      tb.status = `${bip.period.minus(props.season.minus(bip.start))} Seasons Remaining`
    }
    tb.voted = percentForStalk(bip.roots, bip.endTotalRoots.isGreaterThan(0) ? bip.endTotalRoots : props.totalStalk)
    tableBips.push([tb.BIP, tb.title, tb.status, tb.voted])
    return tableBips
  }, []).reverse()

  if (tableBips !== undefined) {
    return (
      <AppBar className={classes.inputModule} position='static'>
        <span className={classes.title}>
          BIPs
          <QuestionModule
            description='Beanstalk Improvement Proposals'
            margin='-12px 0 0 2px'
          />
        </span>
        <hr style={{
              backgroundColor: 'primary',
              color: 'primary',
              margin: '10px 8px',
          }}
        />
          <TableContainer className={classes.table}>
            <Table aria-label='simple table'>
              <TableHead>
                <TableRow>
                <TableCell size='small' style={{width: '10px'}} />
                {titles.map(t => {
                  return (
                    <TableCell
                      key={t}
                      align='center'
                      size='small'
                      style={{fontFamily: 'Futura-PT-Book', fontSize: '16px'}}
                    >
                      {t}
                    </TableCell>
                  )
                })}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableBips
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bip, index) => (
                    <Row key={index} bip={bip} />
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          {Object.keys(tableBips).length > rowsPerPage
            ? <TablePagination
                component='div'
                count={Object.keys(tableBips).length}
                className={classes.pagination}
                onPageChange={handleChangePage}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[]}
              />
            : null
          }
      </AppBar>
    )
  } else return (
    <></>
  )
}

/**
 * The description will be manually added by the bip proposer via merge request when a bip is submitted.
 *
 * To Submit a New BIP:
 * (1) Fill out template HTML from '/public/BIPs/BIP-template.html'
 * (2) Add a new bip path to the bipsList object in '/src/constants/bips.js'
 * (3) Submit a merge request on github: https://github.com/BeanstalkFarms/Beanstalk
 */

function summaryBips(open, bip) {
  if (open) {
    const bipID = parseInt(bip[0])
    if (bipsList.length > bipID) {
      if (Object.keys(bipsList).length > parseInt(bip[0])) {
        return (
          <iframe src={bipsList[bipID].path} style={{border:'none'}} title={`BIP-${bipID}`} width='100%' height='450px' />
        )
      } else {
        return (
          <iframe src={`/BIPs/BIP-default.html`} style={{border:'none'}} title={`BIP-default`} width='100%' height='30px' />
        )
      }
    }
  }
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { bip } = props
  const [open, setOpen] = React.useState(false)

  return (
    <Fragment>
      <TableRow id={`bip-${bip[0]}`}>
      <TableCell style={{padding: '5px'}}>
        <IconButton id={`open-bip-${bip[0]}`} aria-label='expand row' onClick={() => setOpen(!open)} size='small'>
          {open ? <KeyboardArrowUpIcon id={`bip-${bip[0]}-open`} /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>
      {Object.values(bip).map((bipValue, bipIndex) => (
        <TableCell
          key={bipIndex}
          align='center'
          component='th'
          scope='bip'
          style={{fontFamily: 'Futura-PT-Book', fontSize: '18px'}}
        >
          {bipIndex === 3
            ? <CircularProgressWithLabel value={bipValue} />
            : bipValue
          }
        </TableCell>
      ))}
      </TableRow>
      <TableRow>
       <TableCell colSpan={6} style={{fontFamily: 'Futura-Pt-Book',  padding: '0px'}}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            {summaryBips(open, bip)}
          </Collapse>
       </TableCell>
      </TableRow>
    </Fragment>
  )
}
