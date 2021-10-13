import React, { useState } from 'react'
import {
  AppBar,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { Link } from 'react-scroll'
import InfoIcon from '@material-ui/icons/Info'
import CheckIcon from '@material-ui/icons/Check'
import { percentForStalk, vote, unvote } from '../../util'
import { QuestionModule } from '../Common'
import CircularProgressWithLabel from './CircularProgressWithLabel'

export default function Vote(props) {
  const classes = makeStyles(theme => ({
    inputModule: {
      backgroundColor: '#F5FAFF',
      borderRadius: '25px',
      color: 'black',
      marginTop: '18px',
      maxWidth: '550px',
      padding: '10px'
    },
    formButton: {
      borderRadius: '15px',
      fontFamily: 'Futura-Pt-Book',
      fontSize: 'calc(12px + 1vmin)',
      height: '44px',
      margin: '20px 0 10px',
      width: '200px'
    },
    title: {
      display: 'inline-block',
      fontFamily: 'Futura-Pt-Book',
      fontSize: '18px',
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
    table: {
      backgroundColor: '#F5FAFF',
      margin: '8px',
      width: 'auto'
    },
    futuraPT: {
      fontFamily: 'Futura-Pt'
    },
    rowSelected: {
      backgroundColor: '#DAF2FF'
    }
  }))()

  const [selected, setSelected] = useState(0)

  let buttonHandler = () => {
    let bip = props.bips[selected]
    if (props.votedBips[bip]) {
      unvote(bip.toString(), () => {})
    } else {
      vote(bip.toString(), () => {})
    }
  }

  const displayBips = props.bips.reduce((dp, bip) => {
    const row = []
    row.push(bip)
    row.push(`${props.seasonBips[bip]}`)
    const newStalk = (
      props.votedBips[bip]
        ? props.stalkBips[bip].minus(props.userRoots)
        : props.stalkBips[bip].plus(props.userRoots)
      )
    const percentForNewStalk = percentForStalk(newStalk,props.totalRoots)
    const percentForPrevStalk = percentForStalk(props.stalkBips[bip],props.totalRoots)
    row.push(props.votedBips[bip])
    row.push(
      <div>
        <CircularProgressWithLabel
          lowvalue={Math.min(percentForNewStalk, percentForPrevStalk)}
          value={Math.max(percentForNewStalk, percentForPrevStalk)}
          voting={!props.votedBips[bip]}
        />
      </div>
    )
    dp.push(row)
    return dp
  }, [])

  return (
    <AppBar className={classes.inputModule} position='static'>
      <form autoComplete='off' noValidate>
        <span className={classes.title}>
          Active BIPs
          <QuestionModule
            description='Active Beanstalk Improvement Proposals currently being voted on.'
            margin='-6px 0 0 2px'
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
            <TableCell className={classes.cellTitle} size='small' align='center'></TableCell>
              <TableCell className={classes.cellTitle} size='small' align='center'>BIP</TableCell>
              <TableCell className={classes.cellTitle} size='small' align='center'>Seasons Remaining</TableCell>
              <TableCell className={classes.cellTitle} size='small' align='center'>Voted</TableCell>
              <TableCell className={classes.cellTitle} size='small' align='center'>Vote %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayBips.map((bip, index) => (
              <TableRow key={index} className={selected === index ? classes.rowSelected : null} onClick={() => setSelected(index)} style={{cursor: 'pointer'}}>
                <TableCell className={classes.cell} align='center' size='small'>
                  <Link duration={450} isDynamic={true} offset={-210} smooth={true} spy={true} to={`bip-${bip[0]}`}>
                    <IconButton onClick={() => { if (!document.getElementById(`bip-${bip[0]}-open`)) document.getElementById(`open-bip-${bip[0]}`).click() }} style={{padding: '7px', width: '30px', height: '30px', color: 'rgba(0 0 0 / 25%)'}} >
                      <InfoIcon fontSize='small' />
                    </IconButton>
                  </Link>
                </TableCell>
                <TableCell className={classes.cell} size='small' align='center'>{bip[0]}</TableCell>
                <TableCell className={classes.cell} size='small' align='center'>{bip[1]}</TableCell>
                <TableCell className={classes.cell} size='small' align='center'>{bip[2] ? <CheckIcon/> : 'No'}</TableCell>
                <TableCell className={classes.cell} size='small' align='center'>{bip[3]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        className={classes.formButton}
        color='primary'
        disabled={props.userRoots.isLessThanOrEqualTo(0)}
        onClick={buttonHandler}
        variant='contained'
      >
        {props.userRoots.isGreaterThan(0)
          ? `${props.votedBips[props.bips[selected]] ? 'Unvote' : 'Vote'}: BIP ${props.bips[selected]}`
          : 'No Stalk'
        }
      </Button>
    </form>
  </AppBar>
  )
}
