export default function TransactionDetailsModule(props) {
  const leftTransactionStyle = {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    textAlign: 'left',
    width: '50%',
  };
  const rightTransactionStyle = {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    fontSize: '14px',
    textAlign: 'right',
    width: '50%',
  };
  const transactionStyle = {
    border: '1px solid black' as const,
    borderRadius: '15px',
    color: 'black',
    fontSize: 'calc(9px + 0.7vmin)',
    marginBottom: '-4px',
    marginLeft: '10%',
    padding: '12px',
    width: '80%',
  };

  const rows = Object.keys(props.fields).reduce((r, key, i) => {
    r.push(
      <span key={`${i}-left`} style={leftTransactionStyle}>
        {key}
      </span>,
    );
    r.push(
      <span key={`${i}-right`} style={rightTransactionStyle}>
        {props.fields[key]}
      </span>,
    );
    return r;
  }, []);

  return <p style={transactionStyle}>{rows}</p>;
}
