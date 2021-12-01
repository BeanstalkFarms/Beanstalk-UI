import React from 'react';
import Image from 'next/image';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/styles';
import { theme, BASE_IPFS_LINK, BASE_OPENSEA_LINK } from 'constants/index';
import { mintNFT } from 'util/index';
import { beanftStrings, SingleButton, TablePageSelect } from './index';

const useStyles = makeStyles({
  table: {
    minWidth: 200,
    '& .MuiTableCell-root': {},
    '& .MuiTableCell-head': {
      alignItems: 'center',
      fontWeight: 'bold',
    },
  },
  pagination: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  lucidaStyle: {
    fontFamily: 'Lucida Console',
    fontSize: '11px',
    alignItems: 'left',
    borderColor: theme.accentColor,
  },
});

const BasicTable = (props) => {
  const classes = useStyles();

  const { rowsPerPage } = props;

  const showButton = (i) => {
    if (Object.keys(props.nftList).length > 0 && props.canClaimNFT) {
      return (
        <SingleButton
          backgroundColor="#3B3B3B"
          color="white"
          description={beanftStrings.singleMint}
          fontSize="15px"
          handleClick={() => {
            const nft = props.nftList[i];
            mintNFT(nft.account, nft.id, nft.metadataIpfsHash, nft.signature);
          }}
          height="30px"
          margin="-10px 7px 0 0"
          marginTooltip="0 0 -5px 20px"
          size="small"
          title="Mint One"
          width="50%"
          widthTooltip="150px"
        />
      );
    }
    return null;
  };

  return (
    <Box>
      <TableContainer>
        <Table className={classes.table} size="small">
          <TableBody>
            {Object.keys(props.nftList)
              .slice(
                props.page * rowsPerPage,
                props.page * rowsPerPage + rowsPerPage
              )
              .map((index) => (
                <TableRow key="User BeaNFT List">
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                    component="th"
                    scope="index"
                  >
                    <Image
                      unoptimized
                      loader={() =>
                        `${BASE_IPFS_LINK}${props.nftList[index].imageIpfsHash}`
                      }
                      src={`${BASE_IPFS_LINK}${props.nftList[index].imageIpfsHash}`}
                      width="290px"
                      height="290px"
                    />
                  </TableCell>
                </TableRow>
              ))}
            {Object.keys(props.nftList)
              .slice(
                props.page * rowsPerPage,
                props.page * rowsPerPage + rowsPerPage
              )
              .map((index) => (
                <TableRow key={index}>
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                    component="th"
                    scope="index"
                  >
                    <Box>
                      {props.claimed ? (
                        <Link
                          href={`${BASE_OPENSEA_LINK}/${props.nftList[index].id}`}
                          color="inherit"
                          target="blank"
                        >
                          {`ID: ${props.nftList[index].id}`}
                        </Link>
                      ) : (
                        `ID: ${props.nftList[index].id}`
                      )}
                      <br />
                      <span>{'Metadata: '}</span>
                      <Link
                        href={`${BASE_IPFS_LINK}${props.nftList[index].metadataIpfsHash}`}
                        color="inherit"
                        target="blank"
                      >
                        <span>
                          {`${props.nftList[index].metadataIpfsHash.substring(
                            0,
                            6
                          )}...${props.nftList[
                            index
                          ].metadataIpfsHash.substring(
                            props.nftList[index].metadataIpfsHash.length - 4
                          )}`}
                        </span>
                      </Link>
                      <Box style={{ margin: '-2px 0' }}>
                        {showButton(index)}
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {Object.keys(props.nftList).length > rowsPerPage ? (
        <TablePagination
          className={classes.pagination}
          component="div"
          count={Object.keys(props.nftList).length}
          onPageChange={props.handleChange}
          page={props.page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, count }) =>
            `${Math.ceil(from / rowsPerPage)}-${
              count !== -1 ? Math.ceil(count / rowsPerPage) : 0
            }`
          }
          ActionsComponent={TablePageSelect}
        />
      ) : null}
    </Box>
  );
};

export default function NftPicTable(props) {
  return (
    <Box style={props.style}>
      <BasicTable {...props} />
    </Box>
  );
}

NftPicTable.defaultProps = {
  nftList: {},
  index: 0,
  page: 0,
  resetPage: 0,
  rowsPerPage: 5,
};
