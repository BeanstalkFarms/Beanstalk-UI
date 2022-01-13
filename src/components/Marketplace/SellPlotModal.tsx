import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  Modal,
} from '@material-ui/core';
import { BaseModule, ClaimTextModule, EthInputField, InputFieldPlus, SettingsFormModule, TransactionDetailsModule, TransactionTextModule } from 'components/Common';

export default function SellPlotModal({
  currentOffer,
  onClose,
}) {
    const { width } = useSelector<AppState, AppState['general']>(
      (state) => state.general
    );

    const leftMargin = width < 800 ? 0 : 120;
  return (
    <Modal
      open={currentOffer != null}
      onClose={onClose}
    >
      <BaseModule
        style={{
          position: 'absolute',
          top: '50%',
          marginTop: '-40px',
          width: '400px',
          left: '50%',
          marginLeft: `${leftMargin}px`,
          textAlign: 'center',
          transform: 'translate(-50%, -50%)',
        }}
        section={0}
        sectionTitles={['Sell Plot']}
        size="small"
        marginTop="0px"
        handleForm={() => {}}
      >
        <p>hi</p>
      </BaseModule>
    </Modal>
  );
}
