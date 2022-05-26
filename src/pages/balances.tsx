/* eslint-disable */
import React, {useState} from 'react';
import {Card, Container, Stack, Typography} from '@mui/material';
import PageHeader from '../components/v2/Common/PageHeader';
import BalancesToggle from "../components/v2/Balances/BalancesToggle";

const BalancesPage: React.FC = () => {

  const [balancesTab, setBalancesTab] = useState("user-balance")

  const handleSetTab = (tab: string) => {
    setBalancesTab(tab)
  };

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Balances"
          purpose="View Beanstalk balances"
          description="View all balances"
        />
        <Card sx={{border: "none", pl: 2, pr: 2, pt: 3, pb: 3}}>
          <BalancesToggle balancesTab={balancesTab} handleSetTab={handleSetTab} />
          <Stack gap={1}>
            <Card sx={{ p: 2 }}>
              <Typography>TEST</Typography>
            </Card>
            <Stack direction="row" gap={1}>
              <Card sx={{ p: 2, width: "25%" }}>
                <Typography>TEST</Typography>
              </Card>
              <Card sx={{ p: 2, width: "25%" }}>
                <Typography>TEST</Typography>
              </Card>
              <Card sx={{ p: 2, width: "25%" }}>
                <Typography>TEST</Typography>
              </Card>
              <Card sx={{ p: 2, width: "25%" }}>
                <Typography>TEST</Typography>
              </Card>
            </Stack>
            <Card sx={{ p: 2 }}>
              <Typography>TEST</Typography>
            </Card>
          </Stack>


        </Card>
      </Stack>
    </Container>
  )
};

export default BalancesPage;
