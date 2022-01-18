import React from 'react';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import Image from 'material-ui-image';
import { makeStyles } from '@material-ui/styles';
import { BASE_IPFS_LINK, BASE_OPENSEA_LINK, theme } from 'constants/index';
import { mintNFT, mintGenesisNFT } from 'util/index';
import {
  beanftStrings,
  SingleButton,
  TablePageSelect,
} from 'components/Common';

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

export default function NftPicTable({
  canClaimNFT,
  claimed,
  handleChange,
  nftList,
  page,
  rowsPerPage,
  style,
}) {
  const classes = useStyles();

  const showButton = (i) => {
    if (Object.keys(nftList).length > 0 && canClaimNFT) {
      return (
        <SingleButton
          backgroundColor="#3B3B3B"
          color="white"
          description={beanftStrings.singleMint}
          fontSize="15px"
          handleClick={() => {
            const nft = nftList[i];
            nft.subcollection === 'Genesis' ?
              mintGenesisNFT(nft.account, nft.id, nft.metadataIpfsHash, nft.signature) :
              mintNFT(nft.account, nft.id, nft.signature2);
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
    <Box style={style}>
      <TableContainer>
        <Table className={classes.table} size="small">
          <TableBody>
            {Object.keys(nftList)
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((index) => (
                <TableRow key={`user-${index}`}>
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                  >
                    <Image
                      unoptimized="true"
                      src={`${BASE_IPFS_LINK}${nftList[index].imageIpfsHash}`}
                      width="90px"
                      height="90px"
                    />
                  </TableCell>
                </TableRow>
              ))}
            {Object.keys(nftList)
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((index) => (
                <TableRow key={`user-row2-${index}`}>
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                    component="th"
                    scope="index"
                  >
                    <Box>
                      {claimed ? (
                        <>
                          <span>{'ID: '}</span>
                          <Link
                            href={`${BASE_OPENSEA_LINK}/${nftList[index].id}`}
                            color="inherit"
                            target="blank"
                          >
                            {`${nftList[index].id}`}
                          </Link>
                        </>
                      ) : (
                        `ID: ${nftList[index].id}`
                      )}
                      <br />
                      <span>{'Image: '}</span>
                      <Link
                        href={`${BASE_IPFS_LINK}${nftList[index].imageIpfsHash}`}
                        color="inherit"
                        target="blank"
                      >
                        <span>
                          {`${nftList[index].imageIpfsHash.substring(
                            0,
                            6
                          )}...${nftList[
                            index
                          ].imageIpfsHash.substring(
                            nftList[index].imageIpfsHash.length - 4
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
      {Object.keys(nftList).length > rowsPerPage ? (
        <div className={classes.pagination}>
          <TablePagination
            className={classes.pagination}
            component="div"
            count={Object.keys(nftList).length}
            onPageChange={handleChange}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, count }) =>
              `${Math.ceil(from / rowsPerPage)}-${
                count !== -1 ? Math.ceil(count / rowsPerPage) : 0
              }`
            }
            ActionsComponent={TablePageSelect}
          />
        </div>
      ) : null}
    </Box>
  );
}

NftPicTable.defaultProps = {
  nftList: {},
  page: 0,
  rowsPerPage: 1,
};
