import React from 'react';
import MuiMarkdown from 'mui-markdown';
import { BeanstalkPalette, FontSize, FontWeight } from '~/components/App/muiTheme';

/**
 * Styles Markdown text to match MUI theme.
 */
const MarkdownWrapper: React.FC = ({ children }) => (
  <MuiMarkdown
    overrides={{
      li: {
        component: 'li',
        props: {
          style: {
            fontSize: FontSize.base,
            color: BeanstalkPalette.lightGrey,
            lineHeight: '1.25rem',
          }
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      p: {
        component: 'p',
        props: {
          style: {
            marginTop: '10px',
            marginLeft: '5px',
            fontSize: FontSize.base,
            color: BeanstalkPalette.lightGrey,
            lineHeight: '1.25rem',
          }
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h1: {
        component: 'h1',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontFamily: 'Futura PT',
            fontSize: FontSize['2xl'], // 24px
            fontWeight: FontWeight.medium
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h2: {
        component: 'h2',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontFamily: 'Futura PT',
            fontSize: FontSize['1xl'], // 20px
            fontWeight: FontWeight.medium,
            lineHeight: '1.875rem'
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h3: {
        component: 'h3',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontSize: FontSize.lg, // 18px
            fontWeight: FontWeight.normal,
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h4: {
        component: 'h4',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontSize: FontSize.base, // 16px
            fontWeight: FontWeight.normal,
            lineHeight: '1.25rem',
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
    }}
  >
    {children as any}
  </MuiMarkdown>
);

export default MarkdownWrapper;