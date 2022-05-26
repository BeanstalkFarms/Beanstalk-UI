/* eslint-disable */
import React, {useState} from 'react';
import {Card, Container, Stack} from '@mui/material';
import PageHeader from '../components/v2/Common/PageHeader';
import BalancesToggle from "../components/v2/Balances/BalancesToggle";
import UserBalances from "../components/v2/Balances/UserBalances";
import BeanstalkBalances from "../components/v2/Balances/BeanstalkBalances";

const BalancesPage: React.FC = () => {
  const [balancesTab, setBalancesTab] = useState("user-balance")

  const handleSetTab = (tab: string) => {setBalancesTab(tab)};

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Balances"
          purpose="View Beanstalk balances"
          description="View all balances"
        />
        <Card sx={{border: "none", pl: 2, pr: 2, pt: 3, pb: 3}}>
          <BalancesToggle balancesTab={balancesTab} handleSetTab={handleSetTab}/>
          {balancesTab === "user-balance" && <UserBalances title={"test"}/>}
          {balancesTab === "beanstalk-balance" && <BeanstalkBalances title={"test"}/>}
        </Card>
      </Stack>
    </Container>
  )
};

export default BalancesPage;
