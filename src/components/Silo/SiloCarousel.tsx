/* eslint-disable quotes */
import React from 'react';
import { Card, Stack, styled, Typography } from '@mui/material';
import { ERC20Token } from '~/classes/Token';
import {
  BEAN,
  BEAN_CRV3_LP,
  UNRIPE_BEAN,
  UNRIPE_BEAN_CRV3,
} from '~/constants/tokens';

import EducationEarnImage from '~/img/beanstalk/education/educationEarnImg.svg';
import depositBeanImg from '~/img/beanstalk/education/depositBeanImg.svg';
import depositBean3crvImg from '~/img/beanstalk/education/depositBean3crvImg.svg';
import depositUrBean3crvImg from '~/img/beanstalk/education/depositUrBean3crvImg.svg';
import depositUrBeanImg from '~/img/beanstalk/education/depositUrBeanImg.svg';
import earnStalkAndSeedsImg from '~/img/beanstalk/education/earnStalkAndSeedsImg.svg';
import { BeanstalkPalette } from '../App/muiTheme';
import Carousel from '../Common/Carousel/Carousel';

const depositCardContentByToken = {
  [BEAN[1].address]: {
    texts: [
      'Use the form to Deposit BEAN into the Silo.',
      "Beanstalk allows you to use BEAN, ETH, USDC, 3CRV, DAI, USDC, USDT from your wallet or Farm balance to Deposit Bean into the Silo. If you aren't using Bean, the UI will swap and Deposit for you in one transaction.",
    ],
    img: depositBeanImg,
  },
  [BEAN_CRV3_LP[1].address]: {
    texts: [
      'Use the form to Deposit BEAN3CRV into the Silo.',
      "Beanstalk allows you to use BEAN, ETH, USDC, 3CRV, DAI, USDC, USDT from your wallet or Farm balance to Deposit BEAN3CRV into the Silo. If you aren't using BEAN3CRV, the UI will swap, add liquidity, and Deposit the LP token for you in one transaction.",
    ],
    img: depositBean3crvImg,
  },
  [UNRIPE_BEAN[1].address]: {
    texts: [
      'Deposit urBEAN Use the form to Deposit urBEAN into the Silo.',
      'Beanstalk allows you to use urBEAN from your wallet or Farm balance to Deposit urBEAN into the Silo.',
    ],
    img: depositUrBeanImg,
  },
  [UNRIPE_BEAN_CRV3[1].address]: {
    texts: [
      'Use the form to Deposit urBEAN3CRV into the Silo.',
      'Beanstalk allows you to use urBEAN3CRV from your wallet or Farm balance to Deposit urBEAN3CRV into the Silo.',
    ],
    img: depositUrBean3crvImg,
  },
};

const useCardContentWithToken = ({ name, address }: ERC20Token) => [
  {
    title: `Deposit ${name}`,
    texts: [...depositCardContentByToken[address].texts],
    imageSrc: depositCardContentByToken[address].img,
  },
  {
    title: 'Receive Stalk and Seeds for your Deposit',
    texts: [
      'Stalk entitles holders to participate in Beanstalk governance and earn a portion of Bean mints.',
      'Seeds yield 1/10000 new Stalk every Season.',
    ],
    imageSrc: earnStalkAndSeedsImg,
  },
  {
    title: 'Earn Beans',
    texts: [
      'Every Season that Beans are minted, receive a share of the new Beans based on your percentage ownership of Stalk.',
      'Your Earned Beans are automatically deposited for Earned Stalk and Seeds.',
    ],
    imageSrc: EducationEarnImage,
  },
];

const ImageWrapper = styled(Stack)(({ theme }) => ({
  justifyContent: 'flex-end',
  background: BeanstalkPalette.skyBlue,
  width: '100%',
  height: '300px',
  [theme.breakpoints.up('lg')]: { alignItems: 'flex-end' },
  [theme.breakpoints.down('md')]: { height: '250px !important' },
}));

const Image = styled('img')(({ theme }) => ({
  objectFit: 'cover',
  alignSelf: 'center',
  [theme.breakpoints.up('lg')]: {
    width: '100%',
    height: 'auto',
  },
  [theme.breakpoints.down('lg')]: {
    height: '100%',
    width: 'auto',
  },
}));

const InfoContent = styled(Stack)(({ theme }) => ({
  width: '100%',
  padding: '20px',
  boxSizing: 'border-box',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    borderLeft: `${BeanstalkPalette.skyBlue} 1px solid`,
    maxWidth: '40%',
  },
  [theme.breakpoints.down('md')]: {
    borderTop: `${BeanstalkPalette.skyBlue} 1px solid`,
  },
  [theme.breakpoints.between('sm', 'md')]: {
    height: '200px',
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    height: '285px',
    maxWidth: '100%',
  },
}));

const CarouselCard = styled(Card)(({ theme }) => ({
  // heights are defined here otherwise layout jumps occur during animation
  borderColor: BeanstalkPalette.blue,
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: { height: '300px' },
  [theme.breakpoints.between('sm', 'md')]: { height: '450px' },
  [theme.breakpoints.down('sm')]: { height: '535px' },
}));

const SiloCarousel: React.FC<{ token: ERC20Token }> = ({ token }) => {
  const content = useCardContentWithToken(token);

  return (
    <CarouselCard>
      <Carousel total={content.length}>
        <Stack direction={{ xs: 'column', md: 'row' }}>
          <Carousel.Elements
            elements={content.map(({ imageSrc }, i) => (
              <ImageWrapper key={`${i}-img`}>
                <Image src={imageSrc} alt="" />
              </ImageWrapper>
            ))}
          />
          <InfoContent>
            <Stack sx={{ pb: '20px' }}>
              <Carousel.Elements
                duration={300}
                disableSlide
                elements={content.map(({ title, texts }, k) => (
                  <React.Fragment key={`${k}-info`}>
                    <Typography>{title}</Typography>
                    <Stack sx={{ whiteSpace: 'pre-wrap' }}>
                      {texts.map((text, i) => (
                        <Typography
                          variant="bodySmall"
                          sx={{ color: BeanstalkPalette.grey }}
                          key={i}
                        >
                          {`${text}\n\n`}
                        </Typography>
                      ))}
                    </Stack>
                  </React.Fragment>
                ))}
              />
            </Stack>
          </InfoContent>
        </Stack>
        <Carousel.Pagination
          sx={{
            position: 'absolute',
            bottom: '15px',
            right: '20px',
            width: 'calc(100% - 42px)',
            // don't use mui bp here b/c breakpoints don't pass
            '@media(min-width: 800px)': { width: 'calc(40% - 42px)' },
          }}
        />
      </Carousel>
    </CarouselCard>
  );
};

export default SiloCarousel;
