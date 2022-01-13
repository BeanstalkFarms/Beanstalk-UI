import React from 'react'
import {
  Box,
  Button,
  Modal,
} from '@material-ui/core';

export default function SellPlotModal({
  currentOffer,
  onClose,
  onSell,
}) {
  return (
    <Modal
      open={currentOffer != null}
      onClose={onClose}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        {/* TODO: need to make this a better input (like swap inputs, be able to use beans / eth / max out, etc) */}
        <h2>Sell this plot</h2>
        <p style={{ width: '100%', wordBreak: 'break-all' }}>{JSON.stringify(currentOffer)}</p>
        <Button onPress={onSell}>
          Sell
        </Button>
      </Box>
    </Modal>
  )
}
