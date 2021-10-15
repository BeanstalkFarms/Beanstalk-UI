import React from 'react'
import Image from 'next/image'
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Box
} from '@material-ui/core/'
import { makeStyles } from '@material-ui/styles'
import { BASE_IPFS_LINK, BASE_OPENSEA_LINK } from '../../constants'
import { SingleButton } from '../Common'
import { mintNFT } from '../../util'

export default function NftPicTable(props) {
  return (
    <Box style={props.style}>
      <BasicTable {...props} />
    </Box>
  )
}

const useStyles = makeStyles({
  table: {
    minWidth: 200,
    '& .MuiTableCell-root': {
    },
    '& .MuiTableCell-head': {
      alignItems: 'center',
      fontWeight: 'bold'
    }
  },
  pagination: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  lucidaStyle: {
    fontFamily: 'Lucida Console',
    fontSize: '11px',
    alignItems: 'left'
  }
})

const BasicTable = (props) => {
  const classes = useStyles()

  const rowsPerPage = props.rowsPerPage

  const showButton = (i) => (
    Object.keys(props.crates).length > 0 && props.canClaimNFT
    ? <SingleButton
        backgroundColor='#3B3B3B'
        color='white'
        description='Use this button to Mint only the individual BeaNFT currently being displayed.'
        fontSize='15px'
        handleClick={() => {
          const nft = props.crates[i]
          mintNFT(nft.account, nft.id, nft.metadataIpfsHash, nft.signature)
        }}
        height='30px'
        margin='-10px 7px 0 0'
        marginTooltip='0 0 -5px 20px'
        size='small'
        title='Mint One'
        width='50%'
        widthTooltip='150px'
      />
    : null
  )

  return (
    <Box>
      <TableContainer>
        <Table className={classes.table} size='small'>
          <TableBody>
            {Object.keys(props.crates)
              .slice(props.page * rowsPerPage, props.page * rowsPerPage + rowsPerPage)
              .map((index) => (
                <TableRow key={'User BeaNFT List'}>
                  <TableCell align='center' className={classes.lucidaStyle} component='th' scope='index'>
                    <Image
                      unoptimized
                      loader={({ src }) => {
                        return `${BASE_IPFS_LINK}${props.crates[index].imageIpfsHash}`
                      }}
                      src={`${BASE_IPFS_LINK}${props.crates[index].imageIpfsHash}`}
                      width='290px'
                      height='290px'
                    />
                  </TableCell>
                </TableRow>
              ))
            }
              {Object.keys(props.crates)
                .slice(props.page * rowsPerPage, props.page * rowsPerPage + rowsPerPage)
                .map((index) => (
                  <TableRow key={index}>
                    <TableCell align='center' className={classes.lucidaStyle} component='th' scope='index'>
                      <Box>
                        {props.claimed
                          ? <Link href={`${BASE_OPENSEA_LINK}/${props.crates[index].id}`} color='inherit' target='blank'>
                              {`ID: ${props.crates[index].id}`}
                            </Link>
                          : `ID: ${props.crates[index].id}`
                        }
                        <br/>
                        <span>{`Metadata: `}</span>
                        <Link href={`${BASE_IPFS_LINK}${props.crates[index].metadataIpfsHash}`} color='inherit' target='blank'>
                          <span>{`${props.crates[index].metadataIpfsHash.substring(0, 6)}...${props.crates[index].metadataIpfsHash.substring(props.crates[index].metadataIpfsHash.length - 4)}`}</span>
                        </Link>
                        <Box style={{margin: '-2px 0'}}>
                        {showButton(index)}
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              }
          </TableBody>
        </Table>
      </TableContainer>
      {Object.keys(props.crates).length > rowsPerPage
        ? <TablePagination
            className={classes.pagination}
            component='div'
            count={Object.keys(props.crates).length}
            onPageChange={props.handleChange}
            page={props.page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({from, to, count}) => `${Math.ceil(from/rowsPerPage)}-${count !== -1 ? Math.ceil(count/rowsPerPage) : 0}`}
          />
        : null
      }
    </Box>
  )
}

NftPicTable.defaultProps = {
  crates: {},
  index: 0,
  page: 0,
  resetPage: 0,
  rowsPerPage: 5,
}
